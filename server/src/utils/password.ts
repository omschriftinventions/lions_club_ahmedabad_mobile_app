import bcrypt from 'bcryptjs';
import { exec, query } from '../db';
import { RowDataPacket } from 'mysql2';

export function hashPassword(p: string): Promise<string> { return bcrypt.hash(p, 8); }
export function verifyPassword(p: string, hash: string): Promise<boolean> { return bcrypt.compare(p, hash); }

// Default password derived from a member's phone: the last 10 digits (local mobile number).
// Returns null if fewer than 10 digits available.
export function phonePassword(phone: string | null | undefined): string | null {
  const digits = (phone || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : (digits || null);
}

// The super admin's guaranteed-known password (env-overridable). Re-applied on boot
// so the super admin can always log in and manage other users' passwords.
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Omsinv@8786';

export async function ensureAuthSchema(): Promise<void> {
  try {
    await exec(`ALTER TABLE members ADD COLUMN password_hash VARCHAR(255) NULL`);
    console.log('[auth] added column members.password_hash');
  } catch (e: any) {
    if (!(e.code === '1060' || /Duplicate column/i.test(e.message))) console.error('[auth] alter failed', e?.message || e);
  }
  try {
    await exec(`ALTER TABLE members ADD COLUMN hidden TINYINT(1) NOT NULL DEFAULT 0`);
    console.log('[auth] added column members.hidden');
  } catch (e: any) {
    if (!(e.code === '1060' || /Duplicate column/i.test(e.message))) console.error('[auth] hidden alter failed', e?.message || e);
  }
  try {
    // Only the primary (Shivam) system account is hidden from the roster/directory.
    const primaryPhone = process.env.SUPER_ADMIN_PHONE || '+918905496456';
    await exec(`UPDATE members SET hidden = 1 WHERE phone_e164 = :p`, { p: primaryPhone });
  } catch { /* ignore */ }
  try {
    await exec(`INSERT INTO app_settings (k, value) VALUES ('auth_method','password') ON DUPLICATE KEY UPDATE value=value`);
  } catch { /* settings table ensured separately */ }
  try {
    // Only the primary (Shivam) super-admin gets the shared master password re-applied.
    // Other super admins (e.g. office bearers) keep their own phone-based password.
    const primaryPhone = process.env.SUPER_ADMIN_PHONE || '+918905496456';
    const rows = await query<(RowDataPacket & { id: number })[]>(
      `SELECT id FROM members WHERE is_super_admin = 1 AND phone_e164 = :p`, { p: primaryPhone });
    const h = await hashPassword(SUPER_ADMIN_PASSWORD);
    for (const m of rows) await exec(`UPDATE members SET password_hash = :h WHERE id = :id`, { h, id: m.id });
    if (rows.length) console.log(`[auth] primary super-admin password ensured`);
  } catch (e: any) { console.error('[auth] super-admin pw failed', e?.message || e); }
}