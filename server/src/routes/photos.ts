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
    `INSERT INTO photos (club_id, event_id, project_id, url, caption, uploaded_by)
     VALUES (:clubId, :event_id, :project_id, :url, :caption, :me)`,
    {
      clubId: req.user!.clubId,
      event_id: data.event_id ?? null,
      project_id: data.project_id ?? null,
      url,
      caption: data.caption ?? null,
      me: req.user!.sub,
    }
  );
  res.status(201).json({ id: r.insertId, url });
});

router.delete('/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  await exec(`DELETE FROM photos WHERE id = :id AND club_id = :clubId`, { id, clubId: req.user!.clubId });
  res.json({ ok: true });
});

export default router;
