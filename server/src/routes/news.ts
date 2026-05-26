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
    limit: z.coerce.number().int().min(1).max(100).default(30),
    scope: z.enum(['club','district','all']).default('all'),
  }).parse(req.query);
  const where = ['club_id = :clubId', 'published = 1'];
  const params: any = { clubId: req.user!.clubId, limit: q.limit };
  if (q.scope !== 'all') { where.push('scope = :scope'); params.scope = q.scope; }
  const rows = await query<RowDataPacket[]>(
    `SELECT id, title, tag, excerpt, body, cover_url, published_at, created_at, scope
     FROM news WHERE ${where.join(' AND ')}
     ORDER BY published_at DESC, id DESC LIMIT :limit`,
    params
  );
  res.json({ news: rows });
});

router.get('/:id', async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const rows = await query<RowDataPacket[]>(
    `SELECT * FROM news WHERE id = :id AND club_id = :clubId`,
    { id, clubId: req.user!.clubId }
  );
  if (rows.length === 0) throw new HttpError(404, 'not_found');
  res.json({ news: rows[0] });
});

const upsert = z.object({
  title: z.string().min(2).max(200),
  tag: z.string().max(40).optional().nullable(),
  excerpt: z.string().max(400).optional().nullable(),
  body: z.string().max(50000).optional().nullable(),
  cover_url: z.string().url().optional().nullable(),
  published: z.boolean().default(true),
});

router.post('/', requireEditor, async (req: AuthedRequest, res) => {
  const data = upsert.parse(req.body);
  const r = await exec(
    `INSERT INTO news (club_id, title, tag, excerpt, body, cover_url, published, published_at, author_id)
     VALUES (:clubId, :title, :tag, :excerpt, :body, :cover_url, :published, IF(:published, NOW(), NULL), :me)`,
    { ...data, clubId: req.user!.clubId, me: req.user!.sub }
  );
  if (data.published) {
    broadcastToClub(req.user!.clubId, {
      title: data.title,
      body: data.excerpt ?? '',
      data: { type: 'news', newsId: r.insertId },
    }).catch(() => {});
  }
  res.status(201).json({ id: r.insertId });
});

router.patch('/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const data = upsert.partial().parse(req.body);
  const sets = Object.keys(data).map(k => `${k} = :${k}`);
  if (sets.length === 0) return res.json({ ok: true });
  await exec(`UPDATE news SET ${sets.join(', ')} WHERE id = :id AND club_id = :clubId`, { ...data, id, clubId: req.user!.clubId });
  res.json({ ok: true });
});

router.delete('/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  await exec(`DELETE FROM news WHERE id = :id AND club_id = :clubId`, { id, clubId: req.user!.clubId });
  res.json({ ok: true });
});

export default router;
