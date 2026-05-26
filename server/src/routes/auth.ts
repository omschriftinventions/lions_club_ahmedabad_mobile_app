import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { query, exec, tx } from '../db';
import { normalizePhoneIN } from '../utils/phone';
import { generateOtp, hashOtp, verifyOtp } from '../utils/otp';
import { signAccess, newRefreshToken, hashRefresh, verifyRefresh } from '../utils/jwt';
import { HttpError } from '../middleware/error';
import { config } from '../config';
import { RowDataPacket } from 'mysql2';

const router = Router();

const otpLimiter = rateLimit({ windowMs: 60_000, max: 5, standardHeaders: true, legacyHeaders: false });

interface MemberRow extends RowDataPacket {
  id: number;
  club_id: number;
  name: string;
  phone_e164: string;
  role_code: string;
  can_edit_club_data: number;
}

// POST /auth/otp/request  { phone }
router.post('/otp/request', otpLimiter, async (req, res) => {
  const body = z.object({ phone: z.string().min(7).max(20) }).parse(req.body);
  const phone = normalizePhoneIN(body.phone);

  const members = await query<MemberRow[]>(
    `SELECT m.id, m.club_id, m.name, m.phone_e164, r.code AS role_code, r.can_edit_club_data
     FROM members m JOIN roles r ON r.id = m.role_id
     WHERE m.phone_e164 = :phone AND m.active = 1
     LIMIT 1`,
    { phone }
  );
  if (members.length === 0) {
    // Don't reveal — still return success, but skip OTP write
    return res.json({ ok: true });
  }

  const code = generateOtp(6);
  const code_hash = await hashOtp(code);
  const expires_at = new Date(Date.now() + config.otp.ttlSeconds * 1000);

  await exec(
    `INSERT INTO otps (phone_e164, code_hash, expires_at) VALUES (:phone, :code_hash, :expires_at)`,
    { phone, code_hash, expires_at }
  );

  if (config.otp.devLog) {
    // eslint-disable-next-line no-console
    console.log(`[OTP] ${phone} -> ${code} (expires ${expires_at.toISOString()})`);
  }
  // TODO: send via SMS gateway when configured

  res.json({ ok: true });
});

// POST /auth/otp/verify  { phone, code }
router.post('/otp/verify', otpLimiter, async (req, res) => {
  const body = z.object({ phone: z.string(), code: z.string().length(6) }).parse(req.body);
  const phone = normalizePhoneIN(body.phone);

  // DEV bypass — any 6-digit code accepted. Env-gated.
  if (config.otp.devBypass) {
    const member = (await query<MemberRow[]>(
      `SELECT m.id, m.club_id, m.name, m.phone_e164, r.code AS role_code, r.can_edit_club_data
       FROM members m JOIN roles r ON r.id = m.role_id
       WHERE m.phone_e164 = :phone AND m.active = 1 LIMIT 1`,
      { phone }
    ))[0];
    if (!member) throw new HttpError(404, 'member_not_found');

    // eslint-disable-next-line no-console
    console.warn(`[AUTH] DEV_BYPASS_OTP — issued tokens to ${phone} without code check`);

    const access = signAccess({
      sub: member.id, role: member.role_code,
      canEdit: !!member.can_edit_club_data, clubId: member.club_id,
    });
    const refresh = newRefreshToken();
    const refresh_hash = await hashRefresh(refresh);
    await exec(
      `INSERT INTO sessions (member_id, refresh_hash, user_agent, ip, expires_at)
       VALUES (:member_id, :refresh_hash, :ua, :ip, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
      {
        member_id: member.id, refresh_hash,
        ua: req.headers['user-agent']?.slice(0, 255) ?? null, ip: req.ip ?? null,
      }
    );
    return res.json({
      access, refresh,
      member: { id: member.id, name: member.name, role: member.role_code, canEdit: !!member.can_edit_club_data, clubId: member.club_id },
    });
  }

  const rows = await query<(RowDataPacket & { id: number; code_hash: string; expires_at: Date; attempts: number; consumed_at: Date | null; })[]>(
    `SELECT id, code_hash, expires_at, attempts, consumed_at
     FROM otps
     WHERE phone_e164 = :phone AND consumed_at IS NULL AND expires_at > NOW()
     ORDER BY id DESC LIMIT 1`,
    { phone }
  );
  if (rows.length === 0) throw new HttpError(400, 'otp_invalid_or_expired');

  const row = rows[0];
  if (row.attempts >= config.otp.maxAttempts) throw new HttpError(429, 'otp_attempts_exceeded');

  const ok = await verifyOtp(body.code, row.code_hash);
  if (!ok) {
    await exec(`UPDATE otps SET attempts = attempts + 1 WHERE id = :id`, { id: row.id });
    throw new HttpError(400, 'otp_invalid');
  }

  const member = (await query<MemberRow[]>(
    `SELECT m.id, m.club_id, m.name, m.phone_e164, r.code AS role_code, r.can_edit_club_data
     FROM members m JOIN roles r ON r.id = m.role_id
     WHERE m.phone_e164 = :phone AND m.active = 1 LIMIT 1`,
    { phone }
  ))[0];
  if (!member) throw new HttpError(404, 'member_not_found');

  await exec(`UPDATE otps SET consumed_at = NOW() WHERE id = :id`, { id: row.id });

  const access = signAccess({
    sub: member.id,
    role: member.role_code,
    canEdit: !!member.can_edit_club_data,
    clubId: member.club_id,
  });
  const refresh = newRefreshToken();
  const refresh_hash = await hashRefresh(refresh);
  const ttlDays = 30;
  await exec(
    `INSERT INTO sessions (member_id, refresh_hash, user_agent, ip, expires_at)
     VALUES (:member_id, :refresh_hash, :ua, :ip, DATE_ADD(NOW(), INTERVAL ${ttlDays} DAY))`,
    {
      member_id: member.id,
      refresh_hash,
      ua: req.headers['user-agent']?.slice(0, 255) ?? null,
      ip: req.ip ?? null,
    }
  );

  res.json({
    access,
    refresh,
    member: { id: member.id, name: member.name, role: member.role_code, canEdit: !!member.can_edit_club_data, clubId: member.club_id },
  });
});

// POST /auth/refresh  { refresh }
router.post('/refresh', async (req, res) => {
  const body = z.object({ refresh: z.string() }).parse(req.body);
  const sessions = await query<(RowDataPacket & { id: number; member_id: number; refresh_hash: string; expires_at: Date; revoked_at: Date | null; })[]>(
    `SELECT id, member_id, refresh_hash, expires_at, revoked_at
     FROM sessions WHERE revoked_at IS NULL AND expires_at > NOW()
     ORDER BY id DESC LIMIT 50`
  );
  let matched: typeof sessions[number] | null = null;
  for (const s of sessions) {
    if (await verifyRefresh(body.refresh, s.refresh_hash)) { matched = s; break; }
  }
  if (!matched) throw new HttpError(401, 'refresh_invalid');

  const member = (await query<MemberRow[]>(
    `SELECT m.id, m.club_id, m.name, m.phone_e164, r.code AS role_code, r.can_edit_club_data
     FROM members m JOIN roles r ON r.id = m.role_id
     WHERE m.id = :id LIMIT 1`,
    { id: matched.member_id }
  ))[0];
  if (!member) throw new HttpError(404, 'member_not_found');

  const access = signAccess({
    sub: member.id,
    role: member.role_code,
    canEdit: !!member.can_edit_club_data,
    clubId: member.club_id,
  });

  res.json({ access });
});

// POST /auth/logout  { refresh }
router.post('/logout', async (req, res) => {
  const body = z.object({ refresh: z.string() }).parse(req.body);
  await tx(async (conn) => {
    const [sessions] = await conn.query<(RowDataPacket & { id: number; refresh_hash: string })[]>(
      `SELECT id, refresh_hash FROM sessions WHERE revoked_at IS NULL AND expires_at > NOW() ORDER BY id DESC LIMIT 100`
    );
    for (const s of sessions) {
      if (await verifyRefresh(body.refresh, s.refresh_hash)) {
        await conn.query(`UPDATE sessions SET revoked_at = NOW() WHERE id = ?`, [s.id]);
        break;
      }
    }
  });
  res.json({ ok: true });
});

export default router;
