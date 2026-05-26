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
  const q = z.object({
    search: z.string().optional(),
    role: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(500).default(200),
  }).parse(req.query);

  const where: string[] = ['m.club_id = :clubId', 'm.active = 1'];
  const params: any = { clubId: req.user!.clubId, limit: q.limit };
  if (q.search) { where.push('(m.name LIKE :s OR m.profession LIKE :s OR m.business LIKE :s)'); params.s = `%${q.search}%`; }
  if (q.role)   { where.push('r.code = :role'); params.role = q.role; }

  const rows = await query<RowDataPacket[]>(
    `SELECT m.id, m.name, m.initials, m.designation, m.profession, m.business, m.area,
            m.phone, m.email, m.joined_year, m.dob, m.anniv, m.spouse, m.avatar_color, m.avatar_url,
            r.code AS role, r.label AS role_label, r.color AS role_color
     FROM members m JOIN roles r ON r.id = m.role_id
     WHERE ${where.join(' AND ')}
     ORDER BY r.rank_order, m.name
     LIMIT :limit`,
    params
  );
  res.json({ members: rows });
});

router.get('/me', async (req: AuthedRequest, res) => {
  const rows = await query<RowDataPacket[]>(
    `SELECT m.*, r.code AS role, r.label AS role_label, r.color AS role_color, r.can_edit_club_data
     FROM members m JOIN roles r ON r.id = m.role_id
     WHERE m.id = :id`,
    { id: req.user!.sub }
  );
  if (rows.length === 0) throw new HttpError(404, 'not_found');
  res.json({ member: rows[0] });
});

router.get('/:id', async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const rows = await query<RowDataPacket[]>(
    `SELECT m.id, m.name, m.initials, m.designation, m.profession, m.business, m.area,
            m.phone, m.email, m.joined_year, m.dob, m.anniv, m.spouse, m.avatar_color, m.avatar_url, m.bio,
            r.code AS role, r.label AS role_label, r.color AS role_color
     FROM members m JOIN roles r ON r.id = m.role_id
     WHERE m.id = :id AND m.club_id = :clubId AND m.active = 1`,
    { id, clubId: req.user!.clubId }
  );
  if (rows.length === 0) throw new HttpError(404, 'not_found');
  res.json({ member: rows[0] });
});

const upsertSchema = z.object({
  name: z.string().min(2).max(160),
  role: z.string(),
  designation: z.string().max(40).optional().nullable(),
  profession: z.string().max(120).optional().nullable(),
  business: z.string().max(160).optional().nullable(),
  area: z.string().max(120).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  phone_e164: z.string().max(20).optional().nullable(),
  email: z.string().email().max(160).optional().nullable(),
  joined_year: z.number().int().optional().nullable(),
  dob: z.string().max(20).optional().nullable(),
  anniv: z.string().max(20).optional().nullable(),
  spouse: z.string().max(120).optional().nullable(),
  avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  bio: z.string().max(5000).optional().nullable(),
});

router.post('/', requireEditor, async (req: AuthedRequest, res) => {
  const data = upsertSchema.parse(req.body);
  const role = await query<(RowDataPacket & { id: number })[]>(`SELECT id FROM roles WHERE code = :c`, { c: data.role });
  if (role.length === 0) throw new HttpError(400, 'invalid_role');
  const initials = data.name.split(/\s+/).filter(w => w !== 'Lion').map(w => w[0]).join('').slice(0, 4).toUpperCase();
  const result = await exec(
    `INSERT INTO members (club_id, role_id, name, initials, designation, profession, business, area, phone, phone_e164, email, joined_year, dob, anniv, spouse, avatar_color, bio)
     VALUES (:clubId, :roleId, :name, :initials, :designation, :profession, :business, :area, :phone, :phone_e164, :email, :joined_year, :dob, :anniv, :spouse, :avatar_color, :bio)`,
    { ...data, clubId: req.user!.clubId, roleId: role[0].id, initials }
  );
  res.status(201).json({ id: result.insertId });
});

router.patch('/:id', async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  // Self-edit allowed; otherwise require editor
  if (id !== req.user!.sub && !req.user!.canEdit) throw new HttpError(403, 'forbidden');

  const data = upsertSchema.partial().parse(req.body);
  const sets: string[] = [];
  const params: any = { id, clubId: req.user!.clubId };
  if (data.role && req.user!.canEdit) {
    const role = await query<(RowDataPacket & { id: number })[]>(`SELECT id FROM roles WHERE code = :c`, { c: data.role });
    if (role.length === 0) throw new HttpError(400, 'invalid_role');
    sets.push('role_id = :roleId'); params.roleId = role[0].id;
  }
  for (const k of ['name','designation','profession','business','area','phone','phone_e164','email','joined_year','dob','anniv','spouse','avatar_color','bio'] as const) {
    if (k in data) { sets.push(`${k} = :${k}`); params[k] = (data as any)[k]; }
  }
  if (sets.length === 0) return res.json({ ok: true });
  await exec(`UPDATE members SET ${sets.join(', ')} WHERE id = :id AND club_id = :clubId`, params);
  res.json({ ok: true });
});

router.delete('/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  await exec(`UPDATE members SET active = 0 WHERE id = :id AND club_id = :clubId`, { id, clubId: req.user!.clubId });
  res.json({ ok: true });
});

export default router;
