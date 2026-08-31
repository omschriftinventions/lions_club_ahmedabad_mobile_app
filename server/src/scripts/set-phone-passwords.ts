/**
 * One-off: set every active member's password to their phone number (last 10 digits),
 * except the primary super-admin (Shivam, id 107 / phone +918905496456).
 * Run:  npx tsx src/scripts/set-phone-passwords.ts
 */
import { pool, query, exec } from '../db';
import { RowDataPacket } from 'mysql2';
import { hashPassword, phonePassword } from '../utils/password';

const SKIP_PHONE = process.env.SUPER_ADMIN_PHONE || '+918905496456';

async function main() {
  const rows = await query<(RowDataPacket & { id: number; name: string; phone_e164: string | null })[]>(
    `SELECT id, name, phone_e164 FROM members WHERE active = 1`
  );
  let set = 0;
  const skipped: string[] = [];
  for (const m of rows) {
    if (m.phone_e164 === SKIP_PHONE) { skipped.push(`${m.name} (primary super-admin)`); continue; }
    const pw = phonePassword(m.phone_e164);
    if (!pw) { skipped.push(`${m.name} (no phone)`); continue; }
    await exec(`UPDATE members SET password_hash = :h WHERE id = :id`, { h: await hashPassword(pw), id: m.id });
    set++;
  }
  console.log(`[pw] set phone-password for ${set} member(s)`);
  if (skipped.length) console.log(`[pw] skipped ${skipped.length}: ${skipped.join(', ')}`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
