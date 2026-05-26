import { Router } from 'express';
import { z } from 'zod';
import { query, exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireEditor } from '../middleware/rbac';
import { HttpError } from '../middleware/error';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const rows = await query<RowDataPacket[]>(
    `SELECT mm.id, mm.title, mm.meeting_date, mm.attendees, mm.doc_url, mm.created_at,
            m.name AS created_by_name
     FROM meeting_minutes mm
     LEFT JOIN members m ON m.id = mm.created_by
     WHERE mm.club_id = :clubId
     ORDER BY mm.meeting_date DESC, mm.id DESC
     LIMIT 100`,
    { clubId: req.user!.clubId }
  );
  res.json({ minutes: rows });
});

router.get('/:id', async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const rows = await query<RowDataPacket[]>(
    `SELECT mm.*, m.name AS created_by_name
     FROM meeting_minutes mm
     LEFT JOIN members m ON m.id = mm.created_by
     WHERE mm.id = :id AND mm.club_id = :clubId`,
    { id, clubId: req.user!.clubId }
  );
  if (rows.length === 0) throw new HttpError(404, 'not_found');
  res.json({ minutes: rows[0] });
});

const upsert = z.object({
  title: z.string().min(2).max(200),
  meeting_date: z.string(),
  attendees: z.number().int().nonnegative().optional().nullable(),
  body: z.string().max(50000).optional().nullable(),
  doc_url: z.string().url().optional().nullable(),
});

router.post('/', requireEditor, async (req: AuthedRequest, res) => {
  const data = upsert.parse(req.body);
  const r = await exec(
    `INSERT INTO meeting_minutes (club_id, title, meeting_date, attendees, body, doc_url, created_by)
     VALUES (:clubId, :title, :meeting_date, :attendees, :body, :doc_url, :me)`,
    { ...data, clubId: req.user!.clubId, me: req.user!.sub }
  );
  res.status(201).json({ id: r.insertId });
});

router.delete('/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  await exec(`DELETE FROM meeting_minutes WHERE id = :id AND club_id = :clubId`, { id, clubId: req.user!.clubId });
  res.json({ ok: true });
});

export default router;
