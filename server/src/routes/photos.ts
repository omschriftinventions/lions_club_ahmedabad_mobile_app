import { Router } from 'express';
import { z } from 'zod';
import { query, exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireEditor } from '../middleware/rbac';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const q = z.object({
    event_id:   z.coerce.number().int().optional(),
    project_id: z.coerce.number().int().optional(),
    limit:      z.coerce.number().int().min(1).max(200).default(60),
  }).parse(req.query);

  const where: string[] = ['club_id = :clubId'];
  const params: any = { clubId: req.user!.clubId, limit: q.limit };
  if (q.event_id)   { where.push('event_id = :event_id');   params.event_id = q.event_id; }
  if (q.project_id) { where.push('project_id = :project_id'); params.project_id = q.project_id; }

  const rows = await query<RowDataPacket[]>(
    `SELECT id, event_id, project_id, url, caption, taken_at, created_at
     FROM photos WHERE ${where.join(' AND ')}
     ORDER BY COALESCE(taken_at, created_at) DESC, id DESC
     LIMIT :limit`,
    params
  );
  res.json({ photos: rows });
});

const upsert = z.object({
  url:        z.string().url().max(500),
  caption:    z.string().max(300).optional().nullable(),
  event_id:   z.number().int().optional().nullable(),
  project_id: z.number().int().optional().nullable(),
  taken_at:   z.string().optional().nullable(),
});

router.post('/', requireEditor, async (req: AuthedRequest, res) => {
  const data = upsert.parse(req.body);
  const r = await exec(
    `INSERT INTO photos (club_id, event_id, project_id, url, caption, uploaded_by, taken_at)
     VALUES (:clubId, :event_id, :project_id, :url, :caption, :me, :taken_at)`,
    { ...data, clubId: req.user!.clubId, me: req.user!.sub }
  );
  res.status(201).json({ id: r.insertId });
});

router.delete('/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  await exec(`DELETE FROM photos WHERE id = :id AND club_id = :clubId`, { id, clubId: req.user!.clubId });
  res.json({ ok: true });
});

export default router;
