import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/rbac';
import { requireEditor } from '../middleware/rbac';
import { getSetting, setSetting } from '../settings';
import { hashPassword } from '../utils/password';
import { exec } from '../db';
import * as wa from '../providers/whatsapp';
import * as sms from '../providers/sms';

const router = Router();
router.use(requireAuth);
router.use(requireSuperAdmin);

// GET /admin/auth — current auth method + channel statuses
router.get('/auth', async (_req: AuthedRequest, res) => {
  const method = await getSetting('auth_method', 'password');
  res.json({ method, whatsapp: wa.getStatus(), sms: { configured: sms.isConfigured() } });
});

// POST /admin/auth/method { method: 'password' | 'sms' | 'whatsapp' }
router.post('/auth/method', async (req: AuthedRequest, res) => {
  const { method } = z.object({ method: z.enum(['password', 'sms', 'whatsapp']) }).parse(req.body);
  await setSetting('auth_method', method);
  res.json({ ok: true, method });
});

// POST /admin/members/:id/password { password } — set/reset a member's password
router.post('/members/:id/password', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const { password } = z.object({ password: z.string().min(6).max(200) }).parse(req.body);
  await exec(`UPDATE members SET password_hash = :h WHERE id = :id`, { h: await hashPassword(password), id });
  res.json({ ok: true });
});

// GET /admin/whatsapp/qr — poll QR + connection status
router.get('/whatsapp/qr', async (_req: AuthedRequest, res) => res.json(wa.getStatus()));

// POST /admin/whatsapp/restart — reconnect / regenerate QR
router.post('/whatsapp/restart', async (_req: AuthedRequest, res) => { await wa.start(); res.json(wa.getStatus()); });

export default router;