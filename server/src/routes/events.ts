import { Router } from 'express';
import { z } from 'zod';
import { query, exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireEditor } from '../middleware/rbac';
import { HttpError } from '../middleware/error';
import { broadcastToClub } from '../services/push';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const q = z.object({
    upcoming: z.coerce.boolean().optional(),
    limit:    z.coerce.number().int().min(1).max(200).default(50),
  }).parse(req.query);

  const where: string[] = ['e.club_id = :clubId', 'e.cancelled = 0'];
  const params: any = { clubId: req.user!.clubId, limit: q.limit, me: req.user!.sub };
  if (q.upcoming) where.push('e.starts_at >= NOW()');

  const rows = await query<RowDataPacket[]>(
    `SELECT e.id, e.title, e.type, e.starts_at, e.ends_at, e.venue, e.description, e.cause_id, e.cover_url,
            (SELECT COUNT(*) FROM rsvps r WHERE r.event_id = e.id AND r.status='yes') AS going,
            (SELECT status FROM rsvps r WHERE r.event_id = e.id AND r.member_id = :me) AS my_status
     FROM events e
     WHERE ${where.join(' AND ')}
     ORDER BY e.starts_at ASC
     LIMIT :limit`,
    params
  );
  res.json({ events: rows });
});

router.get('/:id', async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const rows = await query<RowDataPacket[]>(
    `SELECT e.*, (SELECT status FROM rsvps r WHERE r.event_id = e.id AND r.member_id = :me) AS my_status,
            (SELECT COUNT(*) FROM rsvps r WHERE r.event_id = e.id AND r.status='yes') AS going
     FROM events e WHERE e.id = :id AND e.club_id = :clubId`,
    { id, clubId: req.user!.clubId, me: req.user!.sub }
  );
  if (rows.length === 0) throw new HttpError(404, 'not_found');

  const attendees = await query<RowDataPacket[]>(
    `SELECT r.status, m.id, m.name, m.initials, m.avatar_color
     FROM rsvps r JOIN members m ON m.id = r.member_id
     WHERE r.event_id = :id ORDER BY r.status, m.name`,
    { id }
  );
  res.json({ event: rows[0], attendees });
});

const upsert = z.object({
  title: z.string().min(2).max(200),
  type: z.enum(['Signature','Service','Meeting','Fellowship','Other']),
  starts_at: z.string(),
  ends_at: z.string().optional().nullable(),
  venue: z.string().max(200).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  cause_id: z.string().max(40).optional().nullable(),
  cover_url: z.string().url().optional().nullable(),
});

router.post('/', requireEditor, async (req: AuthedRequest, res) => {
  const data = upsert.parse(req.body);
  const r = await exec(
    `INSERT INTO events (club_id, title, type, starts_at, ends_at, venue, description, cause_id, cover_url, created_by)
     VALUES (:clubId, :title, :type, :starts_at, :ends_at, :venue, :description, :cause_id, :cover_url, :me)`,
    { ...data, clubId: req.user!.clubId, me: req.user!.sub }
  );
  // fire-and-forget push
  broadcastToClub(req.user!.clubId, {
    title: `New event: ${data.title}`,
    body: `${data.venue ?? ''}`,
    data: { type: 'event', eventId: r.insertId },
  }).catch(() => {});
  res.status(201).json({ id: r.insertId });
});

router.patch('/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const data = upsert.partial().parse(req.body);
  const sets = Object.keys(data).map(k => `${k} = :${k}`);
  if (sets.length === 0) return res.json({ ok: true });
  await exec(`UPDATE events SET ${sets.join(', ')} WHERE id = :id AND club_id = :clubId`, { ...data, id, clubId: req.user!.clubId });
  res.json({ ok: true });
});

router.delete('/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  await exec(`UPDATE events SET cancelled = 1 WHERE id = :id AND club_id = :clubId`, { id, clubId: req.user!.clubId });
  res.json({ ok: true });
});

// RSVP
router.put('/:id/rsvp', async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const data = z.object({ status: z.enum(['yes','no','maybe']), guests: z.number().int().min(0).max(20).default(0), note: z.string().max(255).optional() }).parse(req.body);
  await exec(
    `INSERT INTO rsvps (event_id, member_id, status, guests, note)
     VALUES (:event_id, :me, :status, :guests, :note)
     ON DUPLICATE KEY UPDATE status = VALUES(status), guests = VALUES(guests), note = VALUES(note)`,
    { event_id: id, me: req.user!.sub, status: data.status, guests: data.guests, note: data.note ?? null }
  );
  res.json({ ok: true });
});

export default router;
