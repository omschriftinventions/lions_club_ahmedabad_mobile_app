/**
 * Import club directory from a CSV.
 *
 * Format (header row required):
 *   name,role,designation,profession,business,area,phone,email,joined_year,dob,anniv,spouse,bio
 *
 *   - name        Required. "Lion <Full Name>" preferred but any string accepted.
 *   - role        Required. One of: PRESIDENT, SECRETARY, TREASURER, VP1, VP2,
 *                 MEMBERSHIP_CHAIR, SERVICE_CHAIR, TAIL_TWISTER, MEMBER
 *   - designation Optional. PMJF / MJF / JF / blank
 *   - phone       Optional. Indian format (e.g. +91 98250 12345 or 9825012345).
 *                 Normalized to E.164 (+91...) for OTP lookup.
 *   - dob, anniv  "Mar 14" style. Year omitted intentionally (privacy).
 *
 * Run:
 *   npx tsx src/scripts/import-csv.ts --file ../db/members.csv
 *   npx tsx src/scripts/import-csv.ts --file ../db/members.csv --dry-run
 */
import fs from 'fs';
import path from 'path';
import { normalizePhoneIN } from '../utils/phone';
import type { RowDataPacket } from 'mysql2';

interface CsvRow {
  name: string;
  role: string;
  designation?: string;
  profession?: string;
  business?: string;
  area?: string;
  phone?: string;
  phone_e164?: string;
  email?: string;
  joined_year?: number | null;
  dob?: string;
  anniv?: string;
  spouse?: string;
  bio?: string;
  initials: string;
}

const REQUIRED_HEADERS = ['name', 'role'];
const VALID_ROLES = new Set([
  'PRESIDENT','SECRETARY','TREASURER','VP1','VP2',
  'MEMBERSHIP_CHAIR','SERVICE_CHAIR','TAIL_TWISTER','MEMBER',
]);

// RFC-4180-ish CSV parser (handles quoted fields with commas + escaped quotes)
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim().length > 0));
}

function initialsOf(name: string): string {
  return name.replace(/^Lion\s+/i, '').split(/\s+/)
    .filter(w => w && !/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?)$/i.test(w))
    .map(w => w[0]).join('').slice(0, 4).toUpperCase();
}

async function main() {
  const args = process.argv.slice(2);
  const fileArgIdx = args.indexOf('--file');
  const filePath = fileArgIdx >= 0 ? args[fileArgIdx + 1] : path.resolve(__dirname, '../../../db/members.csv');
  const dryRun = args.includes('--dry-run');

  if (!fs.existsSync(filePath)) {
    console.error(`CSV not found: ${filePath}`);
    process.exit(1);
  }
  const text = fs.readFileSync(filePath, 'utf8');
  const rows = parseCsv(text);
  if (rows.length < 2) {
    console.error('CSV is empty or missing data rows');
    process.exit(1);
  }
  const headers = rows[0].map(h => h.trim().toLowerCase());
  for (const h of REQUIRED_HEADERS) {
    if (!headers.includes(h)) { console.error(`Missing required header: ${h}`); process.exit(1); }
  }

  const idx = (k: string) => headers.indexOf(k);
  const parsed: CsvRow[] = [];
  const errors: { row: number; reason: string; raw: string[] }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const name = (r[idx('name')] ?? '').trim();
    const role = (r[idx('role')] ?? '').trim().toUpperCase();
    if (!name) { errors.push({ row: i + 1, reason: 'missing name', raw: r }); continue; }
    if (!VALID_ROLES.has(role)) { errors.push({ row: i + 1, reason: `invalid role "${role}"`, raw: r }); continue; }

    const phoneRaw = idx('phone') >= 0 ? r[idx('phone')]?.trim() : undefined;
    let phone_e164: string | undefined;
    if (phoneRaw) {
      try { phone_e164 = normalizePhoneIN(phoneRaw); } catch { /* leave undefined */ }
    }

    const yearRaw = idx('joined_year') >= 0 ? r[idx('joined_year')]?.trim() : undefined;
    const joined_year = yearRaw && /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : null;

    parsed.push({
      name,
      role,
      designation: idx('designation') >= 0 ? r[idx('designation')]?.trim() || undefined : undefined,
      profession:  idx('profession')  >= 0 ? r[idx('profession')]?.trim()  || undefined : undefined,
      business:    idx('business')    >= 0 ? r[idx('business')]?.trim()    || undefined : undefined,
      area:        idx('area')        >= 0 ? r[idx('area')]?.trim()        || undefined : undefined,
      phone:       phoneRaw || undefined,
      phone_e164,
      email:       idx('email')       >= 0 ? r[idx('email')]?.trim()       || undefined : undefined,
      joined_year,
      dob:         idx('dob')         >= 0 ? r[idx('dob')]?.trim()         || undefined : undefined,
      anniv:       idx('anniv')       >= 0 ? r[idx('anniv')]?.trim()       || undefined : undefined,
      spouse:      idx('spouse')      >= 0 ? r[idx('spouse')]?.trim()      || undefined : undefined,
      bio:         idx('bio')         >= 0 ? r[idx('bio')]?.trim()         || undefined : undefined,
      initials:    initialsOf(name),
    });
  }

  console.log(`[csv-import] parsed=${parsed.length}, errors=${errors.length}`);
  if (errors.length) {
    fs.writeFileSync(path.resolve(process.cwd(), 'import-errors.json'), JSON.stringify(errors, null, 2));
    console.log(`[csv-import] errors written to import-errors.json`);
  }

  if (dryRun) {
    fs.writeFileSync(path.resolve(process.cwd(), 'import-preview.json'), JSON.stringify(parsed, null, 2));
    console.log(`[csv-import] DRY RUN — preview written to import-preview.json`);
    return;
  }

  const { pool, exec, query } = await import('../db');

  const clubRows = await query<(RowDataPacket & { id: number })[]>(`SELECT id FROM clubs ORDER BY id LIMIT 1`);
  if (clubRows.length === 0) throw new Error('No club row — run schema.sql first');
  const clubId = clubRows[0].id;

  const roleRows = await query<(RowDataPacket & { id: number; code: string })[]>(`SELECT id, code FROM roles`);
  const roleMap = new Map(roleRows.map(r => [r.code, r.id]));

  let inserted = 0, updated = 0, skipped = 0;
  for (const m of parsed) {
    const roleId = roleMap.get(m.role);
    if (!roleId) { skipped++; continue; }

    const existing = m.phone_e164
      ? await query<(RowDataPacket & { id: number })[]>(`SELECT id FROM members WHERE phone_e164 = :p LIMIT 1`, { p: m.phone_e164 })
      : await query<(RowDataPacket & { id: number })[]>(`SELECT id FROM members WHERE name = :n LIMIT 1`, { n: m.name });

    if (existing.length) {
      await exec(
        `UPDATE members SET
           role_id = :roleId, designation = COALESCE(:designation, designation),
           profession = COALESCE(:profession, profession), business = COALESCE(:business, business),
           area = COALESCE(:area, area), phone = COALESCE(:phone, phone),
           phone_e164 = COALESCE(:phone_e164, phone_e164), email = COALESCE(:email, email),
           joined_year = COALESCE(:joined_year, joined_year),
           dob = COALESCE(:dob, dob), anniv = COALESCE(:anniv, anniv),
           spouse = COALESCE(:spouse, spouse), bio = COALESCE(:bio, bio),
           initials = :initials
         WHERE id = :id`,
        { ...m, roleId, id: existing[0].id }
      );
      updated++;
    } else {
      await exec(
        `INSERT INTO members
          (club_id, role_id, name, initials, designation, profession, business, area,
           phone, phone_e164, email, joined_year, dob, anniv, spouse, bio)
         VALUES
          (:clubId, :roleId, :name, :initials, :designation, :profession, :business, :area,
           :phone, :phone_e164, :email, :joined_year, :dob, :anniv, :spouse, :bio)`,
        { ...m, clubId, roleId }
      );
      inserted++;
    }
  }
  console.log(`[csv-import] DONE — inserted=${inserted}, updated=${updated}, skipped=${skipped}`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
