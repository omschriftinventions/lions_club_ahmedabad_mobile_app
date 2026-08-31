import { Router } from 'express';
import { z } from 'zod';
import { query, exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireEditor } from '../middleware/rbac';
import { HttpError } from '../middleware/error';
import { RowDataPacket } from 'mysql2';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config';
import { hashPassword, phonePassword } from '../utils/password';
import { normalizePhoneIN } from '../utils/phone';

// Canonicalise a phone to +91XXXXXXXXXX so login lookups match. Falls back to raw on invalid.
const canonE164 = (v: any): any => { try { return normalizePhoneIN(String(v)); } catch { return v; } };

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const q = z.object({
    search: z.string().optional(),
    role: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(500).default(200),
    // include_admins=1 → also return the super admin (used by the chat contact
    // picker so members can start a conversation with the admin).
    include_admins: z.coerce.boolean().optional(),
  }).parse(req.query);

  const where: string[] = ['m.club_id = :clubId', 'm.active = 1'];
  if (!q.include_admins) where.push('m.hidden = 0');
  const params: any = { clubId: req.user!.clubId, limit: q.limit };
  if (q.search) { where.push('(m.name LIKE :s OR m.profession LIKE :s OR m.business LIKE :s OR m.area LIKE :s OR m.designation LIKE :s OR m.email LIKE :s OR m.phone LIKE :s OR r.label LIKE :s OR r.code LIKE :s)'); params.s = `%${q.search}%`; }
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

const AVATAR_MIME = ['image/jpeg','image/png','image/webp'] as const;
const AVATAR_MAX = 4 * 1024 * 1024;
const AVATAR_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// POST /members/me/avatar  { file: dataURL }  — set your own profile photo.
router.post('/me/avatar', async (req: AuthedRequest, res) => {
  const { file } = z.object({ file: z.string().min(1).max(7_000_000) }).parse(req.body);
  const match = file.match(/^data:(image\/[a-z+]+);base64,([A-Za-z0-9+\/=]+)$/i);
  if (!match) throw new HttpError(400, 'invalid_image', 'expected a data:image/...;base64,... payload');
  const mime = match[1].toLowerCase();
  if (!AVATAR_MIME.includes(mime as typeof AVATAR_MIME[number])) throw new HttpError(400, 'unsupported_image_type');
  const buf = Buffer.from(match[2], 'base64');
  if (buf.length > AVATAR_MAX) throw new HttpError(413, 'image_too_large', 'max 4 MB');
  const ext = AVATAR_EXT[mime] ?? 'bin';
  const filename = 'avatar-' + req.user!.sub + '-' + crypto.randomUUID() + '.' + ext;
  const dir = path.join(path.dirname(config.uploads.dir), 'avatars');
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(path.join(dir, filename), buf);
  const base = config.uploads.publicBaseUrl || (req.protocol + '://' + req.get('host'));
  const url = base + '/uploads/avatars/' + filename;
  await exec('UPDATE members SET avatar_url = :url WHERE id = :me AND club_id = :clubId', { url, me: req.user!.sub, clubId: req.user!.clubId });
  res.json({ url });
});

// GET /members/meta/roles — all positions (for the role picker & assignment).
router.get('/meta/roles', async (_req: AuthedRequest, res) => {
  const rows = await query<RowDataPacket[]>(
    `SELECT id, code, label, color, rank_order FROM roles ORDER BY rank_order, label`
  );
  res.json({ roles: rows });
});

// GET /members/sponsors/report — count of members each sponsor has sponsored.
router.get('/sponsors/report', requireEditor, async (req: AuthedRequest, res) => {
  const rows = await query<RowDataPacket[]>(
    `SELECT sp.id AS sponsor_id, sp.name AS sponsor_name, COUNT(*) AS count
     FROM members m JOIN members sp ON sp.id = m.sponsor_id
     WHERE m.club_id = :clubId AND m.active = 1
     GROUP BY sp.id, sp.name ORDER BY count DESC, sp.name`,
    { clubId: req.user!.clubId }
  );
  res.json({ sponsors: rows });
});

// GET /members/export?format=xlsx|pdf&id=optional — roster export (admin only).
router.get('/export', requireEditor, async (req: AuthedRequest, res) => {
  const q = z.object({
    format: z.enum(['xlsx', 'pdf']).default('xlsx'),
    id: z.coerce.number().int().optional(),
  }).parse(req.query);

  const where = ['m.club_id = :clubId', 'm.active = 1', 'm.hidden = 0'];
  const params: any = { clubId: req.user!.clubId };
  if (q.id) { where.push('m.id = :id'); params.id = q.id; }
  const rows = await query<RowDataPacket[]>(
    `SELECT m.name, r.label AS role_label, m.designation, m.profession, m.business, m.area,
            m.phone, m.email, m.joined_year, m.dob, m.anniv, m.spouse, COALESCE(sp.name, m.sponsor) AS sponsor
     FROM members m JOIN roles r ON r.id = m.role_id
     LEFT JOIN members sp ON sp.id = m.sponsor_id
     WHERE ${where.join(' AND ')} ORDER BY r.rank_order, m.name`,
    params
  );

  const cols: [string, string][] = [
    ['Name', 'name'], ['Position', 'role_label'], ['Designation', 'designation'],
    ['Profession', 'profession'], ['Business', 'business'], ['Area', 'area'],
    ['Phone', 'phone'], ['Email', 'email'], ['Joined', 'joined_year'],
    ['Birthday', 'dob'], ['Anniversary', 'anniv'], ['Spouse', 'spouse'], ['Sponsor', 'sponsor'],
  ];
  const fnameBase = q.id ? (String(rows[0]?.name || 'member').replace(/[^a-z0-9]+/gi, '_')) : 'roster';

  if (q.format === 'xlsx') {
    const XLSX = require('xlsx');
    const aoa = [cols.map(c => c[0]), ...rows.map(r => cols.map(c => (r as any)[c[1]] ?? ''))];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = cols.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Roster');
    const buf: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fnameBase}.xlsx"`);
    return res.end(buf);
  }

  // PDF
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ size: 'A4', margin: 36 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fnameBase}.pdf"`);
  doc.pipe(res);
  doc.fontSize(16).fillColor('#003F87').text('Lions Club of Ahmedabad (Host) — Member Roster', { align: 'center' });
  doc.moveDown(0.3).fontSize(9).fillColor('#666').text(`${rows.length} member(s) · generated ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' });
  doc.moveDown(0.8);
  rows.forEach((r: any, i: number) => {
    if (doc.y > 760) doc.addPage();
    doc.fontSize(11).fillColor('#111').text(`${i + 1}. ${r.name}`, { continued: true }).fillColor('#8B1A3B').text(`   ${r.role_label || ''}`);
    const line = (label: string, v: any) => (v ? `${label}: ${v}` : '');
    const details = [
      line('Phone', r.phone), line('Email', r.email), line('Designation', r.designation),
      line('Profession', r.profession), line('Business', r.business), line('Area', r.area),
      line('Joined', r.joined_year), line('Birthday', r.dob), line('Anniversary', r.anniv), line('Spouse', r.spouse), line('Sponsor', r.sponsor),
    ].filter(Boolean).join('  ·  ');
    if (details) doc.fontSize(9).fillColor('#444').text(details);
    doc.moveDown(0.5);
  });
  doc.end();
  return;
});

router.get('/:id', async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const rows = await query<RowDataPacket[]>(
    `SELECT m.id, m.name, m.initials, m.designation, m.profession, m.business, m.area,
            m.phone, m.email, m.joined_year, m.dob, m.anniv, m.spouse, m.sponsor, m.sponsor_id, sp.name AS sponsor_name, m.avatar_color, m.avatar_url, m.bio, m.expertise, m.goals, m.accomplishments, m.interests, m.network, m.social,
            r.code AS role, r.label AS role_label, r.color AS role_color
     FROM members m JOIN roles r ON r.id = m.role_id
     LEFT JOIN members sp ON sp.id = m.sponsor_id
     WHERE m.id = :id AND m.club_id = :clubId AND m.active = 1`,
    { id, clubId: req.user!.clubId }
  );
  if (rows.length === 0) throw new HttpError(404, 'not_found');
  res.json({ member: rows[0] });
});

// Empty string from a form field means "not set" → null, so optional
// fields don't trip .email()/.regex()/number validation. Only name is required.
const blank = (s: z.ZodTypeAny) => z.preprocess((v) => (v === '' ? null : v), s);

const upsertSchema = z.object({
  name: z.string().min(2).max(160),
  role: z.string(),
  designation: blank(z.string().max(40).nullable()).optional(),
  profession: blank(z.string().max(120).nullable()).optional(),
  business: blank(z.string().max(160).nullable()).optional(),
  area: blank(z.string().max(120).nullable()).optional(),
  phone: blank(z.string().max(20).nullable()).optional(),
  phone_e164: blank(z.string().max(20).nullable()).optional(),
  email: blank(z.string().email().max(160).nullable()).optional(),
  joined_year: blank(z.coerce.number().int().nullable()).optional(),
  dob: blank(z.string().max(20).nullable()).optional(),
  anniv: blank(z.string().max(20).nullable()).optional(),
  spouse: blank(z.string().max(120).nullable()).optional(),
  sponsor: blank(z.string().max(160).nullable()).optional(),
  sponsor_id: blank(z.coerce.number().int().nullable()).optional(),
  avatar_color: blank(z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable()).optional(),
  bio: blank(z.string().max(5000).nullable()).optional(),
  expertise: blank(z.string().max(2000).nullable()).optional(),
  goals: blank(z.string().max(2000).nullable()).optional(),
  accomplishments: blank(z.string().max(2000).nullable()).optional(),
  interests: blank(z.string().max(2000).nullable()).optional(),
  network: blank(z.string().max(2000).nullable()).optional(),
  social: blank(z.string().max(2000).nullable()).optional(),
});

router.post('/', requireEditor, async (req: AuthedRequest, res) => {
  const data = upsertSchema.parse(req.body);
  if (data.phone_e164) data.phone_e164 = canonE164(data.phone_e164);
  const role = await query<(RowDataPacket & { id: number })[]>(`SELECT id FROM roles WHERE code = :c`, { c: data.role });
  if (role.length === 0) throw new HttpError(400, 'invalid_role');
  const initials = data.name.split(/\s+/).filter(w => w !== 'Lion').map(w => w[0]).join('').slice(0, 4).toUpperCase();
  // Auto-set login password to the member's phone number (last 10 digits).
  const pw = phonePassword(data.phone_e164 || data.phone);
  const password_hash = pw ? await hashPassword(pw) : null;
  let result;
  try {
    result = await exec(
      `INSERT INTO members (club_id, role_id, name, initials, designation, profession, business, area, phone, phone_e164, email, joined_year, dob, anniv, spouse, sponsor, sponsor_id, avatar_color, bio, password_hash)
       VALUES (:clubId, :roleId, :name, :initials, :designation, :profession, :business, :area, :phone, :phone_e164, :email, :joined_year, :dob, :anniv, :spouse, :sponsor, :sponsor_id, :avatar_color, :bio, :password_hash)`,
      { spouse: null, sponsor: null, sponsor_id: null, dob: null, anniv: null, avatar_color: null, bio: null, ...data, clubId: req.user!.clubId, roleId: role[0].id, initials, password_hash }
    );
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'A member with this phone number already exists.', 'phone_exists');
    throw e;
  }
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
  for (const k of ['name','designation','profession','business','area','phone','phone_e164','email','joined_year','dob','anniv','spouse','sponsor','sponsor_id','avatar_color','bio','expertise','goals','accomplishments','interests','network','social'] as const) {
    if (k in data) { sets.push(`${k} = :${k}`); params[k] = k === 'phone_e164' && (data as any)[k] ? canonE164((data as any)[k]) : (data as any)[k]; }
  }
  if (sets.length === 0) return res.json({ ok: true });
  try {
    await exec(`UPDATE members SET ${sets.join(', ')} WHERE id = :id AND club_id = :clubId`, params);
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'A member with this phone number already exists.', 'phone_exists');
    throw e;
  }
  res.json({ ok: true });
});

router.delete('/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  await exec(`UPDATE members SET active = 0 WHERE id = :id AND club_id = :clubId`, { id, clubId: req.user!.clubId });
  res.json({ ok: true });
});

export default router;
