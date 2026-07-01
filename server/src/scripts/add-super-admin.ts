/**
 * One-off: add an is_super_admin flag to members and create/flag a super-admin
 * account that can log in and manage everything but is hidden from the roster.
 * Run:  npx tsx src/scripts/add-super-admin.ts
 */
import { pool, query, exec } from '../db';
import { RowDataPacket } from 'mysql2';

async function main() {
  try {
    await exec('ALTER TABLE members ADD COLUMN is_super_admin TINYINT(1) NOT NULL DEFAULT 0');
    console.log('[admin] added column members.is_super_admin');
  } catch (e: any) {
    if (e.code === '1060' || /Duplicate column/i.test(e.message)) console.log('[admin] column already exists');
    else throw e;
  }

  const phone_e164 = '+918905496456';
  const name = 'Shivam Parikh';

  const club = await query<(RowDataPacket & { id: number })[]>(`SELECT id FROM clubs ORDER BY id LIMIT 1`);
  if (!club.length) throw new Error('No club row - run schema.sql first');
  const role = await query<(RowDataPacket & { id: number })[]>(`SELECT id FROM roles WHERE code='MEMBER' LIMIT 1`);
  if (!role.length) throw new Error('MEMBER role not found - run schema.sql');

  const existing = await query<(RowDataPacket & { id: number })[]>(`SELECT id FROM members WHERE phone_e164 = :p LIMIT 1`, { p: phone_e164 });
  if (existing.length) {
    await exec(`UPDATE members SET name = :name, is_super_admin = 1, active = 1, role_id = :roleId WHERE id = :id`, { name, roleId: role[0].id, id: existing[0].id });
    console.log(`[admin] flagged existing member ${existing[0].id} as super admin (${name})`);
  } else {
    const r = await exec(
      `INSERT INTO members (club_id, role_id, name, initials, phone, phone_e164, is_super_admin, active)
       VALUES (:clubId, :roleId, :name, 'SP', '+91 89054 96456', :p, 1, 1)`,
      { clubId: club[0].id, roleId: role[0].id, name, p: phone_e164 }
    );
    console.log(`[admin] created super admin ${name} (id=${r.insertId})`);
  }

  const count = await query<(RowDataPacket & { c: number })[]>(`SELECT COUNT(*) AS c FROM members WHERE is_super_admin = 1`);
  console.log(`[admin] super admins now: ${count[0].c}`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });