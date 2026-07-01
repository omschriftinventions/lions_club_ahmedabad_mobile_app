import { pool, exec } from '../db';

async function main() {
  try {
    await exec(`CREATE TABLE IF NOT EXISTS app_settings (
      k VARCHAR(60) NOT NULL, value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (k)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log('[settings] table ready');
    await exec(`INSERT INTO app_settings (k, value) VALUES ('otp_provider','whatsapp') ON DUPLICATE KEY UPDATE value=value`);
    console.log('[settings] default otp_provider=whatsapp');
  } catch (e: any) {
    if (e.code === '1050' || /already exists/i.test(e.message)) console.log('[settings] table exists');
    else throw e;
  }
  await pool.end();
  console.log('[settings] done');
}
main().catch((e) => { console.error(e); process.exit(1); });