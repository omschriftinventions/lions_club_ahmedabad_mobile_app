import { query, exec } from './db';
import { RowDataPacket } from 'mysql2';

export async function ensureSchema(): Promise<void> {
  try {
    await exec(`CREATE TABLE IF NOT EXISTS app_settings (
      k VARCHAR(60) NOT NULL, value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (k)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    await exec(`INSERT INTO app_settings (k, value) VALUES ('otp_provider','whatsapp') ON DUPLICATE KEY UPDATE value=value`);
  } catch (e: any) { console.error('[settings] ensureSchema failed', e?.message || e); }
}

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const rows = await query<(RowDataPacket & { value: string })[]>(
    `SELECT value FROM app_settings WHERE k = :k LIMIT 1`, { k: key }
  );
  return rows.length ? rows[0].value : fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await exec(
    `INSERT INTO app_settings (k, value) VALUES (:k, :v) ON DUPLICATE KEY UPDATE value = :v`,
    { k: key, v: value }
  );
}