import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { query, exec, tx } from '../db';
import { normalizePhoneIN } from '../utils/phone';
import { generateOtp, hashOtp, verifyOtp } from '../utils/otp';
import { signAccess, newRefreshToken, hashRefresh, verifyRefresh } from '../utils/jwt';
import { HttpError } from '../middleware/error';
import { config } from '../config';
import { sendOtp } from '../providers/otp';
import { getSetting } from '../settings';
import { hashPassword, verifyPassword } from '../utils/password';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = Router();

const otpLimiter = rateLimit({ windowMs: 60_000, max: 5, standardHeaders: true, legacyHeaders: false });
const loginLimiter = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false });

interface MemberRow extends RowDataPacket {
  id: number;
  club_id: number;
  name: string;
  phone_e164: string;
  role_code: string;
  can_edit_club_data: number;
  is_super_admin: number;
}

const MEMBER_SELECT = `SELECT m.id, m.club_id, m.name, m.phone_e164, r.code AS role_code, r.can_edit_club_data, m.is_super_admin
     FROM members m JOIN roles r ON r.id = m.role_id`;

// issue access + refresh for a member, insert session, return the response body
async function issueFor(member: MemberRow, req: any) {
  const superAdmin = !!member.is_super_admin;
  const access = signAccess({
    sub: member.id, role: member.role_code,
    canEdit: superAdmin || !!member.can_edit_club_data, clubId: member.club_id,
    superAdmin,
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
  return {
    access, refresh,
    member: {
      id: member.id, name: member.name, role: member.role_code,
      canEdit: superAdmin || !!member.can_edit_club_data, clubId: member.club_id, superAdmin,
    },
  };
}

// POST /auth/otp/request  { phone }
router.post('/otp/request', otpLimiter, async (req, res) => {
  const body = z.object({ phone: z.string().min(7).max(20) }).parse(req.body);
  const phone = normalizePhoneIN(body.phone);

  const members = await query<MemberRow[]>(
    `${MEMBER_SELECT} WHERE m.phone_e164 = :phone AND m.active = 1 LIMIT 1`,
    { phone }
  );
  if (members.length === 0) {
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
  await sendOtp(phone, code);
  res.json({ ok: true });
});

// POST /auth/otp/verify  { phone, code }
router.post('/otp/verify', otpLimiter, async (req, res) => {
  const body = z.object({ phone: z.string(), code: z.string().length(6) }).parse(req.body);
  const phone = normalizePhoneIN(body.phone);

  // DEV bypass — any 6-digit code accepted. Env-gated.
  if (config.otp.devBypass) {
    const member = (await query<MemberRow[]>(`${MEMBER_SELECT} WHERE m.phone_e164 = :phone AND m.active = 1 LIMIT 1`, { phone }))[0];
    if (!member) throw new HttpError(404, 'member_not_found');
    // eslint-disable-next-line no-console
    console.warn(`[AUTH] DEV_BYPASS_OTP — issued tokens to ${phone} without code check`);
    return res.json(await issueFor(member, req));
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

  const member = (await query<MemberRow[]>(`${MEMBER_SELECT} WHERE m.phone_e164 = :phone AND m.active = 1 LIMIT 1`, { phone }))[0];
  if (!member) throw new HttpError(404, 'member_not_found');

  await exec(`UPDATE otps SET consumed_at = NOW() WHERE id = :id`, { id: row.id });
  res.json(await issueFor(member, req));
});

// POST /auth/dev-login  { memberId? }   — DEV ONLY (gated on DEV_BYPASS_OTP)
// Skips OTP entirely and issues tokens for a super admin / officer (or a specified member).
router.post('/dev-login', async (req, res) => {
  if (!config.otp.devBypass) throw new HttpError(404, 'not_found');
  const body = z.object({ memberId: z.coerce.number().int().optional() }).parse(req.body ?? {});

  let member: MemberRow | undefined;
  if (body.memberId) {
    member = (await query<MemberRow[]>(`${MEMBER_SELECT} WHERE m.id = :id AND m.active = 1 LIMIT 1`, { id: body.memberId }))[0];
  }
  // Prefer super admins, then officers, then any active member.
  if (!member) member = (await query<MemberRow[]>(`${MEMBER_SELECT} WHERE m.active = 1 AND m.is_super_admin = 1 ORDER BY m.id LIMIT 1`))[0];
  if (!member) member = (await query<MemberRow[]>(`${MEMBER_SELECT} WHERE m.active = 1 AND r.can_edit_club_data = 1 ORDER BY r.rank_order, m.id LIMIT 1`))[0];
  if (!member) member = (await query<MemberRow[]>(`${MEMBER_SELECT} WHERE m.active = 1 ORDER BY m.id LIMIT 1`))[0];
  if (!member) throw new HttpError(404, 'no_members');

  // eslint-disable-next-line no-console
  console.warn(`[AUTH] DEV_BYPASS_OTP — dev-login issued tokens to ${member.phone_e164} (${member.role_code})`);
  res.json(await issueFor(member, req));
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

  const member = (await query<MemberRow[]>(`${MEMBER_SELECT} WHERE m.id = :id LIMIT 1`, { id: matched.member_id }))[0];
  if (!member) throw new HttpError(404, 'member_not_found');

  const superAdmin = !!member.is_super_admin;
  const access = signAccess({
    sub: member.id, role: member.role_code,
    canEdit: superAdmin || !!member.can_edit_club_data, clubId: member.club_id, superAdmin,
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

// GET /auth/method - public; tells the client which login flow to render
router.get('/method', async (_req, res) => {
  res.json({ method: await getSetting('auth_method', 'password') });
});

// POST /auth/login { phone, password } - password authentication
router.post('/login', loginLimiter, async (req, res) => {
  const { phone, password } = z.object({ phone: z.string().min(7).max(20), password: z.string().min(1).max(200) }).parse(req.body);
  const p = normalizePhoneIN(phone);
  const member = (await query<MemberRow[]>(`${MEMBER_SELECT} WHERE m.phone_e164 = :p AND m.active = 1 LIMIT 1`, { p }))[0];
  if (!member) throw new HttpError(401, 'invalid_credentials');
  const rows = await query<(RowDataPacket & { password_hash: string | null })[]>(`SELECT password_hash FROM members WHERE id = :id`, { id: member.id });
  if (!rows[0]?.password_hash) throw new HttpError(401, 'password_not_set');
  if (!(await verifyPassword(password, rows[0].password_hash))) throw new HttpError(401, 'invalid_credentials');
  res.json(await issueFor(member, req));
});

// POST /auth/change-password { oldPassword, newPassword } - self
router.post('/change-password', requireAuth, async (req: AuthedRequest, res) => {
  const { oldPassword, newPassword } = z.object({ oldPassword: z.string().min(1), newPassword: z.string().min(6).max(200) }).parse(req.body);
  const rows = await query<(RowDataPacket & { password_hash: string | null })[]>(`SELECT password_hash FROM members WHERE id = :id`, { id: req.user!.sub });
  if (!rows[0]?.password_hash || !(await verifyPassword(oldPassword, rows[0].password_hash))) throw new HttpError(401, 'invalid_credentials');
  await exec(`UPDATE members SET password_hash = :h WHERE id = :id`, { h: await hashPassword(newPassword), id: req.user!.sub });
  res.json({ ok: true });
});

export default router;