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
// Auto-create CMS pages table (admin-editable rich content, e.g. History).
// Runs on boot so no manual migration is required.
export async function ensureCmsSchema(): Promise<void> {
  try {
    await exec(`CREATE TABLE IF NOT EXISTS cms_pages (
      slug VARCHAR(50) NOT NULL PRIMARY KEY,
      html LONGTEXT NOT NULL,
      updated_by INT UNSIGNED NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_cms_creator FOREIGN KEY (updated_by) REFERENCES members(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    await exec(`INSERT IGNORE INTO cms_pages (slug, html) VALUES ('history', '<p>The history of Lions Club of Ahmedabad Host will appear here once an admin publishes it.</p>')`);
  } catch (e: any) { console.error('[settings] ensureCmsSchema failed', e?.message || e); }
}
// Grow event description to LONGTEXT so it can hold rich HTML with inline
// (base64) images pasted from the rich editor. No-op if already LONGTEXT.
export async function ensureRichContentColumns(): Promise<void> {
  try {
    await exec(`ALTER TABLE events MODIFY COLUMN description LONGTEXT NULL`);
  } catch (e: any) { console.error('[settings] ensureRichContentColumns failed', e?.message || e); }
}