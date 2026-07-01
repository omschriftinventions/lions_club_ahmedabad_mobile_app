import { pool, exec } from '../db';

async function main() {
  const cols: [string, string][] = [
    ['expertise', 'TEXT NULL'],
    ['goals', 'TEXT NULL'],
    ['accomplishments', 'TEXT NULL'],
    ['interests', 'TEXT NULL'],
    ['network', 'TEXT NULL'],
    ['social', 'TEXT NULL'],
  ];
  for (const [name, def] of cols) {
    try { await exec(`ALTER TABLE members ADD COLUMN ${name} ${def}`); console.log(`[egains] added ${name}`); }
    catch (e: any) { if (e.code === '1060' || /Duplicate column/i.test(e.message)) console.log(`[egains] ${name} exists`); else throw e; }
  }
  await pool.end();
  console.log('[egains] done');
}

main().catch((e) => { console.error(e); process.exit(1); });