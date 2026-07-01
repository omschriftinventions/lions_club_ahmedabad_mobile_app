import { pool, exec } from '../db';
import { hashPassword } from '../utils/password';

async function main() {
  try { await exec(`ALTER TABLE members ADD COLUMN password_hash VARCHAR(255) NULL`); console.log('[pw] added password_hash'); }
  catch (e: any) { if (e.code === '1060' || /Duplicate column/i.test(e.message)) console.log('[pw] column exists'); else throw e; }
  try { await exec(`INSERT INTO app_settings (k, value) VALUES ('auth_method','password') ON DUPLICATE KEY UPDATE value=value`); console.log('[pw] auth_method=password'); }
  catch (e: any) { console.log('[pw] settings skipped:', e?.message); }
  await pool.end();
  console.log('[pw] done (super-admin password is ensured at server boot)');
}
main().catch((e) => { console.error(e); process.exit(1); });