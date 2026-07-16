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
    `SELECT e.id, e.title, e.type, e.code_no, e.starts_at, e.ends_at, e.venue, e.description, e.cause_id, e.cover_url,
            e.time_in, e.time_out, e.no_of_members, e.no_of_hours, e.no_of_man_hours, e.expenses, e.beneficiaries,
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

  // Resolve "members present" (member_ids JSON) to id + name for the report view.
  const ev: any = rows[0];
  let membersPresent: { id: number; name: string }[] = [];
  const rawIds = ev.member_ids;
  const ids: number[] = Array.isArray(rawIds) ? rawIds : (typeof rawIds === 'string' && rawIds ? JSON.parse(rawIds) : []);
  if (ids.length) {
    const mrows = await query<(RowDataPacket & { id: number; name: string })[]>(
      `SELECT id, name FROM members WHERE id IN (${ids.map(() => '?').join(',')})`, ids
    );
    const byId = new Map(mrows.map(r => [r.id, r.name]));
    membersPresent = ids.map(i => ({ id: i, name: byId.get(i) ?? `#${i}` }));
  }
  ev.member_ids = ids;
  ev.members_present = membersPresent;
  res.json({ event: ev, attendees });
});

// Empty strings from the form become null (avoids FK/url validation errors).
const blankToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v);
const upsert = z.object({
  title: z.string().min(2).max(200),
  type: z.enum(['Signature','Service','Meeting','Fellowship','Other']),
  starts_at: z.string(),
  ends_at: z.preprocess(blankToNull, z.string().nullable().optional()),
  venue: z.preprocess(blankToNull, z.string().max(200).nullable().optional()),
  description: z.preprocess(blankToNull, z.string().max(15 * 1024 * 1024).nullable().optional()),
  cause_id: z.preprocess(blankToNull, z.string().max(40).nullable().optional()),
  cover_url: z.preprocess(blankToNull, z.string().url().nullable().optional()),
  // Service Activity Report fields
  code_no: z.preprocess(blankToNull, z.string().max(40).nullable().optional()),
  time_in: z.preprocess(blankToNull, z.string().max(8).nullable().optional()),   // "HH:MM"
  time_out: z.preprocess(blankToNull, z.string().max(8).nullable().optional()),
  member_ids: z.array(z.number().int()).optional().nullable(),                    // members present
  expenses: z.preprocess((v) => (v === '' || v == null ? null : Number(v)), z.number().nonnegative().nullable().optional()),
  beneficiaries: z.preprocess((v) => (v === '' || v == null ? null : Number(v)), z.number().int().nonnegative().nullable().optional()),
});

// Only keep cause_id if it points at a real cause; otherwise NULL (prevents FK error).
async function safeCauseId(cause_id: string | null | undefined): Promise<string | null> {
  if (!cause_id) return null;
  const rows = await query<(RowDataPacket & { id: string })[]>(`SELECT id FROM causes WHERE id = :c LIMIT 1`, { c: cause_id });
  return rows.length ? cause_id : null;
}

// "HH:MM" → minutes since midnight
function toMinutes(t?: string | null): number | null {
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}
// Auto-calc no_of_members, no_of_hours, no_of_man_hours from member_ids + time in/out.
function computeReport(d: any): { no_of_members: number | null; no_of_hours: number | null; no_of_man_hours: number | null } {
  const members = Array.isArray(d.member_ids) ? d.member_ids.length : null;
  const inM = toMinutes(d.time_in), outM = toMinutes(d.time_out);
  let hours: number | null = null;
  if (inM != null && outM != null) {
    let diff = outM - inM;
    if (diff < 0) diff += 24 * 60; // overnight
    hours = Math.round((diff / 60) * 100) / 100;
  }
  const manHours = hours != null && members != null ? Math.round(hours * members * 100) / 100 : null;
  return { no_of_members: members, no_of_hours: hours, no_of_man_hours: manHours };
}

router.post('/', requireEditor, async (req: AuthedRequest, res) => {
  const data = upsert.parse(req.body);
  const cause_id = await safeCauseId(data.cause_id ?? null);
  const calc = computeReport(data);
  const member_ids_json = data.member_ids && data.member_ids.length ? JSON.stringify(data.member_ids) : null;
  const r = await exec(
    `INSERT INTO events (club_id, title, type, code_no, starts_at, ends_at, venue, description, cause_id, cover_url,
        time_in, time_out, member_ids, no_of_members, no_of_hours, no_of_man_hours, expenses, beneficiaries, created_by)
     VALUES (:clubId, :title, :type, :code_no, :starts_at, :ends_at, :venue, :description, :cause_id, :cover_url,
        :time_in, :time_out, :member_ids, :no_of_members, :no_of_hours, :no_of_man_hours, :expenses, :beneficiaries, :me)`,
    { ...data, cause_id, member_ids: member_ids_json, ...calc, clubId: req.user!.clubId, me: req.user!.sub }
  );
  broadcastToClub(req.user!.clubId, {
    title: `New event: ${data.title}`,
    body: `${data.venue ?? ''}`,
    data: { type: 'event', eventId: r.insertId },
  }).catch(() => {});
  res.status(201).json({ id: r.insertId });
});

router.patch('/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const data: any = upsert.partial().parse(req.body);
  if ('cause_id' in data) data.cause_id = await safeCauseId(data.cause_id ?? null);
  // Recompute report fields whenever member_ids or times change.
  if ('member_ids' in data || 'time_in' in data || 'time_out' in data) {
    const cur = (await query<RowDataPacket[]>(`SELECT time_in, time_out, member_ids FROM events WHERE id = :id`, { id }))[0] || {};
    const merged = {
      member_ids: 'member_ids' in data ? data.member_ids : (cur.member_ids ? (typeof cur.member_ids === 'string' ? JSON.parse(cur.member_ids) : cur.member_ids) : null),
      time_in: 'time_in' in data ? data.time_in : cur.time_in,
      time_out: 'time_out' in data ? data.time_out : cur.time_out,
    };
    Object.assign(data, computeReport(merged));
    if ('member_ids' in data) data.member_ids = merged.member_ids && merged.member_ids.length ? JSON.stringify(merged.member_ids) : null;
  }
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

// ── POST /events/import — bulk add/update events from an Excel (Service
// Activity Report) file. Body: { file: "data:...;base64,..." | base64 }.
// Matches existing by code_no (if present) else title+date; upserts.
router.post('/import', requireEditor, async (req: AuthedRequest, res) => {
  const XLSX = require('xlsx');
  const { file } = z.object({ file: z.string().min(10) }).parse(req.body);
  const b64 = file.includes('base64,') ? file.split('base64,')[1] : file;
  let rows: any[];
  try {
    const wb = XLSX.read(Buffer.from(b64, 'base64'), { type: 'buffer', cellDates: true });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });
  } catch (e: any) {
    throw new HttpError(400, 'invalid_excel', e?.message || 'Could not read the Excel file');
  }

  // Normalise a header to a canonical field.
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const pick = (row: any, keys: string[]): any => {
    for (const k of Object.keys(row)) {
      if (keys.includes(norm(k))) { const v = row[k]; return v == null || v === '' ? null : v; }
    }
    return null;
  };

  // Roster for name→id resolution.
  const roster = await query<(RowDataPacket & { id: number; name: string })[]>(
    `SELECT id, name FROM members WHERE club_id = :clubId AND active = 1`, { clubId: req.user!.clubId }
  );
  const resolveNames = (raw: any): number[] => {
    if (!raw) return [];
    const names = String(raw).split(/[,;\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
    const ids: number[] = [];
    for (const nm of names) {
      const hit = roster.find(m => {
        const mn = m.name.toLowerCase().replace(/^lion\s+/, '');
        return mn === nm || mn.includes(nm) || nm.includes(mn);
      });
      if (hit && !ids.includes(hit.id)) ids.push(hit.id);
    }
    return ids;
  };
  const toDate = (v: any): string | null => {
    if (!v) return null;
    if (v instanceof Date) return v.toISOString().slice(0, 19).replace('T', ' ');
    const s = String(v).trim();
    // dd.mm.yyyy or dd/mm/yyyy or dd-mm-yyyy
    const m = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/);
    if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')} 00:00:00`; }
    const d = new Date(s); return isNaN(+d) ? null : d.toISOString().slice(0, 19).replace('T', ' ');
  };
  const timeStr = (v: any): string | null => {
    if (!v) return null;
    if (v instanceof Date) return v.toTimeString().slice(0, 5);
    const m = String(v).match(/(\d{1,2}):(\d{2})/); return m ? `${m[1].padStart(2,'0')}:${m[2]}` : null;
  };
  const num = (v: any): number | null => { if (v == null || v === '') return null; const n = Number(String(v).replace(/[^0-9.]/g, '')); return isNaN(n) ? null : n; };

  let created = 0, updated = 0, skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const title = pick(row, ['detailsofactivityeventmeeting','detailsofactivity','details','activity','event','title']);
      if (!title || String(title).trim().length < 2) { skipped++; continue; }
      const code_no = pick(row, ['codeno','code','codenumber']);
      const starts_at = toDate(pick(row, ['date','eventdate']));
      const venue = pick(row, ['venue','location']);
      const time_in = timeStr(pick(row, ['timein','intime']));
      const time_out = timeStr(pick(row, ['timeout','outtime']));
      const expenses = num(pick(row, ['expenses','expense','amount']));
      const beneficiaries = num(pick(row, ['beneficiaries','beneficiary','benef']));
      const member_ids = resolveNames(pick(row, ['memberpresent','memberspresent','members','membername']));
      const excelMembers = num(pick(row, ['noofmembers','numberofmembers','members']));

      const calc = computeReport({ member_ids, time_in, time_out });
      const no_of_members = member_ids.length || excelMembers || null;
      // recompute man-hours if members came from the sheet (not from ids)
      const no_of_hours = calc.no_of_hours;
      const no_of_man_hours = (no_of_hours != null && no_of_members != null) ? Math.round(no_of_hours * no_of_members * 100) / 100 : null;
      const member_ids_json = member_ids.length ? JSON.stringify(member_ids) : null;

      // Find existing.
      let existing: any = null;
      if (code_no) {
        const r = await query<RowDataPacket[]>(`SELECT id FROM events WHERE club_id = :c AND code_no = :code LIMIT 1`, { c: req.user!.clubId, code: code_no });
        existing = r[0];
      }
      if (!existing && starts_at) {
        const r = await query<RowDataPacket[]>(`SELECT id FROM events WHERE club_id = :c AND title = :t AND DATE(starts_at) = DATE(:d) LIMIT 1`, { c: req.user!.clubId, t: title, d: starts_at });
        existing = r[0];
      }

      const fields = { title, type: 'Service', code_no, venue, time_in, time_out, member_ids: member_ids_json,
        no_of_members, no_of_hours, no_of_man_hours, expenses, beneficiaries,
        starts_at: starts_at ?? new Date().toISOString().slice(0, 19).replace('T', ' ') };

      if (existing) {
        await exec(
          `UPDATE events SET title=:title, code_no=:code_no, venue=:venue, starts_at=:starts_at,
             time_in=:time_in, time_out=:time_out, member_ids=:member_ids, no_of_members=:no_of_members,
             no_of_hours=:no_of_hours, no_of_man_hours=:no_of_man_hours, expenses=:expenses, beneficiaries=:beneficiaries
           WHERE id=:id AND club_id=:c`,
          { ...fields, id: existing.id, c: req.user!.clubId }
        );
        updated++;
      } else {
        await exec(
          `INSERT INTO events (club_id, title, type, code_no, starts_at, venue, time_in, time_out, member_ids,
             no_of_members, no_of_hours, no_of_man_hours, expenses, beneficiaries, created_by)
           VALUES (:c, :title, :type, :code_no, :starts_at, :venue, :time_in, :time_out, :member_ids,
             :no_of_members, :no_of_hours, :no_of_man_hours, :expenses, :beneficiaries, :me)`,
          { ...fields, c: req.user!.clubId, me: req.user!.sub }
        );
        created++;
      }
    } catch (e: any) {
      errors.push(`Row ${i + 2}: ${e?.message || 'failed'}`);
    }
  }

  res.json({ ok: true, total: rows.length, created, updated, skipped, errors: errors.slice(0, 20) });
});

export default router;
