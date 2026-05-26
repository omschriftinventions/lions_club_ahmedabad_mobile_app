/**
 * Import club directory from a PDF.
 *
 * Heuristic parser — assumes each member row contains:
 *   "Lion <Name>"  (optionally followed by "Dr."/honorifics)
 *   Profession / business (free text)
 *   Phone        — captures +91 / 10-digit / 091xxxxxxxxxx
 *   Email        — captures any RFC-ish address
 *
 * Rows that fail to parse are written to ./import-skipped.json for manual review.
 * Run:
 *   npm run import:pdf -- --file "../New Club Directory.pdf"
 *   npm run import:pdf -- --file "../New Club Directory.pdf" --dry-run
 */
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { normalizePhoneIN } from '../utils/phone';
import type { RowDataPacket } from 'mysql2';

interface ParsedMember {
  name: string;
  raw: string;
  phone?: string;
  phone_e164?: string;
  email?: string;
  profession?: string;
  business?: string;
  area?: string;
  designation?: string;
  initials: string;
}

const PHONE_RE = /(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/g;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const LION_RE  = /\bLion\s+(Dr\.?\s+)?[A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){0,4}/g;
const DESIG_RE = /\b(PMJF|MJF|JF|PDG|DG|VDG)\b/i;

function initialsOf(name: string): string {
  return name.replace(/^Lion\s+/, '').split(/\s+/).filter(w => w && !/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?)$/i.test(w))
    .map(w => w[0]).join('').slice(0, 4).toUpperCase();
}

function chunkByLion(text: string): string[] {
  // Split text on each "Lion " boundary, keep the prefix
  const chunks: string[] = [];
  const matches = [...text.matchAll(/\bLion\s/g)];
  if (matches.length === 0) return [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index!;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    chunks.push(text.slice(start, end).trim());
  }
  return chunks;
}

function parseMember(chunk: string): ParsedMember | null {
  const nameMatch = chunk.match(LION_RE);
  if (!nameMatch) return null;
  const name = nameMatch[0].replace(/\s+/g, ' ').trim();

  const phones = chunk.match(PHONE_RE) ?? [];
  const emails = chunk.match(EMAIL_RE) ?? [];
  const phone = phones[0];
  let phone_e164: string | undefined;
  try { if (phone) phone_e164 = normalizePhoneIN(phone); } catch { /* skip */ }

  const desigMatch = chunk.match(DESIG_RE);
  const designation = desigMatch ? desigMatch[0].toUpperCase() : undefined;

  // crude profession/business: take the line after the name, before phone/email
  const after = chunk.slice(name.length).replace(/\n+/g, ' ').trim();
  const beforePhone = after.split(PHONE_RE)[0]?.trim();
  const profession = beforePhone?.slice(0, 120) || undefined;

  return {
    name,
    raw: chunk,
    phone,
    phone_e164,
    email: emails[0],
    profession,
    designation,
    initials: initialsOf(name),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const fileArgIdx = args.indexOf('--file');
  const filePath = fileArgIdx >= 0 ? args[fileArgIdx + 1] : path.resolve(__dirname, '../../../New Club Directory.pdf');
  const dryRun = args.includes('--dry-run');

  if (!fs.existsSync(filePath)) {
    console.error(`PDF not found: ${filePath}`);
    process.exit(1);
  }
  console.log(`[import] reading ${filePath}`);
  const buf = fs.readFileSync(filePath);
  const data = await pdf(buf);
  const text = data.text;
  console.log(`[import] PDF text length: ${text.length}`);

  const chunks = chunkByLion(text);
  console.log(`[import] found ${chunks.length} "Lion " chunks`);

  const parsed: ParsedMember[] = [];
  const skipped: string[] = [];
  for (const c of chunks) {
    const m = parseMember(c);
    if (m && m.name) parsed.push(m);
    else skipped.push(c.slice(0, 200));
  }
  console.log(`[import] parsed=${parsed.length}, skipped=${skipped.length}`);

  if (skipped.length) {
    fs.writeFileSync(path.resolve(process.cwd(), 'import-skipped.json'), JSON.stringify(skipped, null, 2));
    console.log(`[import] skipped chunks written to import-skipped.json`);
  }

  if (dryRun) {
    fs.writeFileSync(path.resolve(process.cwd(), 'import-preview.json'), JSON.stringify(parsed, null, 2));
    console.log(`[import] DRY RUN — preview written to import-preview.json`);
    return;
  }

  // Lazy-load DB modules so dry-run never opens a connection
  const { pool, exec, query } = await import('../db');

  const memberRole = await query<(RowDataPacket & { id: number })[]>(`SELECT id FROM roles WHERE code = 'MEMBER'`);
  if (memberRole.length === 0) throw new Error('MEMBER role missing — run schema.sql first');
  const memberRoleId = memberRole[0].id;
  const clubRows = await query<(RowDataPacket & { id: number })[]>(`SELECT id FROM clubs ORDER BY id LIMIT 1`);
  if (clubRows.length === 0) throw new Error('No club row — run schema.sql first');
  const clubId = clubRows[0].id;

  let inserted = 0, updated = 0;
  for (const m of parsed) {
    if (!m.phone_e164) {
      // insert without phone — cannot OTP-login, but still in directory
    }
    const existing = m.phone_e164 ? await query<(RowDataPacket & { id: number })[]>(
      `SELECT id FROM members WHERE phone_e164 = :p LIMIT 1`, { p: m.phone_e164 }
    ) : [];

    if (existing.length) {
      await exec(
        `UPDATE members SET name = :name, designation = COALESCE(:designation, designation),
            profession = COALESCE(:profession, profession), phone = COALESCE(:phone, phone),
            email = COALESCE(:email, email), initials = :initials
         WHERE id = :id`,
        { ...m, id: existing[0].id }
      );
      updated++;
    } else {
      await exec(
        `INSERT INTO members (club_id, role_id, name, initials, designation, profession, phone, phone_e164, email)
         VALUES (:clubId, :roleId, :name, :initials, :designation, :profession, :phone, :phone_e164, :email)`,
        { ...m, clubId, roleId: memberRoleId }
      );
      inserted++;
    }
  }
  console.log(`[import] DONE — inserted=${inserted}, updated=${updated}`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
