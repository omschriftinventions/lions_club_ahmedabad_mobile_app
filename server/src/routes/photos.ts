import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { query, exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireEditor } from '../middleware/rbac';
import { HttpError } from '../middleware/error';
import { config } from '../config';
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

// Add a photo by remote URL (kept for backward compat / hosted assets).
router.post('/', requireEditor, async (req: AuthedRequest, res) => {
  const data = upsert.parse(req.body);
  const r = await exec(
    `INSERT INTO photos (club_id, event_id, project_id, url, caption, uploaded_by, taken_at)
     VALUES (:clubId, :event_id, :project_id, :url, :caption, :me, :taken_at)`,
    { ...data, clubId: req.user!.clubId, me: req.user!.sub }
  );
  res.status(201).json({ id: r.insertId });
});

// ───────────────────────────────────────────────────────────────────────────
// Direct upload: officer sends an image as a data: URL (base64). Server
// writes it to disk under <uploads>/photos and returns the served URL.
// No multipart / no extra dependency — works behind cPanel + ngrok alike.
// ───────────────────────────────────────────────────────────────────────────
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB decoded

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const uploadBody = z.object({
  file:        z.string().min(1).max(13_000_000), // ~8MB base64 + overhead
  caption:     z.string().max(300).optional().nullable(),
  event_id:    z.number().int().optional().nullable(),
  project_id:  z.number().int().optional().nullable(),
  album_id:    z.number().int().optional().nullable(),
});

router.post('/upload', requireEditor, async (req: AuthedRequest, res) => {
  const data = uploadBody.parse(req.body);
  const match = data.file.match(/^data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) throw new HttpError(400, 'invalid_image', 'expected a data:image/...;base64,... payload');

  const mime = match[1].toLowerCase();
  if (!ALLOWED_MIME.includes(mime as typeof ALLOWED_MIME[number])) {
    throw new HttpError(400, 'unsupported_image_type', `allowed: ${ALLOWED_MIME.join(', ')}`);
  }
  const buf = Buffer.from(match[2], 'base64');
  if (buf.length > MAX_BYTES) throw new HttpError(413, 'image_too_large', `max ${MAX_BYTES} bytes`);

  const ext = EXT_BY_MIME[mime] ?? 'bin';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const dir = config.uploads.dir;
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(path.join(dir, filename), buf);

  const base = config.uploads.publicBaseUrl || `${req.protocol}://${req.get('host')}`;
  const url = `${base}/uploads/photos/${filename}`;

  const r = await exec(
    `INSERT INTO photos (club_id, event_id, project_id, album_id, url, caption, uploaded_by)
     VALUES (:clubId, :event_id, :project_id, :album_id, :url, :caption, :me)`,
    {
      clubId: req.user!.clubId,
      event_id: data.event_id ?? null,
      project_id: data.project_id ?? null,
      album_id: data.album_id ?? null,
      url,
      caption: data.caption ?? null,
      me: req.user!.sub,
    }
  );
  // First photo becomes album cover if none set.
  if (data.album_id) {
    await exec(`UPDATE albums SET cover_url = :url WHERE id = :aid AND club_id = :clubId AND (cover_url IS NULL OR cover_url = '')`,
      { url, aid: data.album_id, clubId: req.user!.clubId });
  }
  res.status(201).json({ id: r.insertId, url });
});

// ───────────────────────────────────────────────────────────────────────────
// Albums — standalone photo folders, each with its own images + members present.
// ───────────────────────────────────────────────────────────────────────────

// GET /photos/albums — list albums with cover + photo count.
router.get('/albums', async (req: AuthedRequest, res) => {
  const rows = await query<RowDataPacket[]>(
    `SELECT a.id, a.title, a.cover_url, a.created_at,
            (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id) AS photo_count
     FROM albums a WHERE a.club_id = :clubId
     ORDER BY a.created_at DESC, a.id DESC`,
    { clubId: req.user!.clubId }
  );
  res.json({ albums: rows });
});

// POST /photos/albums { title } — create an album.
router.post('/albums', requireEditor, async (req: AuthedRequest, res) => {
  const { title } = z.object({ title: z.string().min(1).max(160) }).parse(req.body);
  const r = await exec(`INSERT INTO albums (club_id, title) VALUES (:clubId, :title)`,
    { clubId: req.user!.clubId, title });
  res.status(201).json({ id: r.insertId });
});

// GET /photos/albums/:id — album detail: photos + members present.
router.get('/albums/:id', async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const rows = await query<RowDataPacket[]>(
    `SELECT id, title, cover_url, member_ids, created_at FROM albums WHERE id = :id AND club_id = :clubId`,
    { id, clubId: req.user!.clubId }
  );
  if (rows.length === 0) throw new HttpError(404, 'not_found');
  const album: any = rows[0];
  let ids: number[] = [];
  try { ids = Array.isArray(album.member_ids) ? album.member_ids : JSON.parse(album.member_ids || '[]'); } catch { ids = []; }
  let members_present: { id: number; name: string }[] = [];
  if (ids.length) {
    const idList = ids.map((n) => Number(n)).filter(Number.isInteger).join(',');
    if (idList) members_present = await query<RowDataPacket[]>(
      `SELECT id, name FROM members WHERE club_id = :clubId AND id IN (${idList})`, { clubId: req.user!.clubId }
    ) as any;
  }
  const photos = await query<RowDataPacket[]>(
    `SELECT id, url, caption, created_at FROM photos WHERE album_id = :id AND club_id = :clubId ORDER BY id DESC`,
    { id, clubId: req.user!.clubId }
  );
  res.json({ album: { ...album, member_ids: ids, members_present }, photos });
});

// PATCH /photos/albums/:id { title?, member_ids? } — rename / set who's present.
router.patch('/albums/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const data = z.object({
    title: z.string().min(1).max(160).optional(),
    member_ids: z.array(z.number().int()).optional(),
  }).parse(req.body);
  const sets: string[] = [];
  const params: any = { id, clubId: req.user!.clubId };
  if (data.title !== undefined) { sets.push('title = :title'); params.title = data.title; }
  if (data.member_ids !== undefined) { sets.push('member_ids = :mids'); params.mids = JSON.stringify(data.member_ids); }
  if (sets.length) await exec(`UPDATE albums SET ${sets.join(', ')} WHERE id = :id AND club_id = :clubId`, params);
  res.json({ ok: true });
});

// DELETE /photos/albums/:id — remove album + its photos.
router.delete('/albums/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  await exec(`DELETE FROM photos WHERE album_id = :id AND club_id = :clubId`, { id, clubId: req.user!.clubId });
  await exec(`DELETE FROM albums WHERE id = :id AND club_id = :clubId`, { id, clubId: req.user!.clubId });
  res.json({ ok: true });
});

router.delete('/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  await exec(`DELETE FROM photos WHERE id = :id AND club_id = :clubId`, { id, clubId: req.user!.clubId });
  res.json({ ok: true });
});

export default router;
