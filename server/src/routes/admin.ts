import { Router } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/rbac';
import { requireEditor } from '../middleware/rbac';
import { getSetting, setSetting } from '../settings';
import { hashPassword } from '../utils/password';
import { HttpError } from '../middleware/error';
import { exec } from '../db';
import { config } from '../config';
import * as wa from '../providers/whatsapp';
import * as sms from '../providers/sms';
import { getAIConfig, saveAIConfig, maskKey, AI_DEFAULTS } from '../services/aiConfig';
import { getLLMProvider } from '../providers/llm';

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

// POST /admin/members/:id/avatar { file: dataURL } — set a member's profile photo
const AVATAR_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
const AVATAR_MAX = 4 * 1024 * 1024;
const AVATAR_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

router.post('/members/:id/avatar', async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const { file } = z.object({ file: z.string().min(1).max(7_000_000) }).parse(req.body);
  const match = file.match(/^data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) throw new HttpError(400, 'invalid_image', 'expected a data:image/...;base64,... payload');
  const mime = match[1].toLowerCase();
  if (!AVATAR_MIME.includes(mime as typeof AVATAR_MIME[number])) throw new HttpError(400, 'unsupported_image_type');
  const buf = Buffer.from(match[2], 'base64');
  if (buf.length > AVATAR_MAX) throw new HttpError(413, 'image_too_large', 'max 4 MB');
  const ext = AVATAR_EXT[mime] ?? 'bin';
  const filename = 'avatar-' + id + '-' + crypto.randomUUID() + '.' + ext;
  const dir = path.join(path.dirname(config.uploads.dir), 'avatars');
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(path.join(dir, filename), buf);
  const base = config.uploads.publicBaseUrl || (req.protocol + '://' + req.get('host'));
  const url = base + '/uploads/avatars/' + filename;
  await exec('UPDATE members SET avatar_url = :url WHERE id = :id', { url, id });
  res.json({ url });
});

// GET /admin/whatsapp/qr — poll QR + connection status
router.get('/whatsapp/qr', async (_req: AuthedRequest, res) => res.json(wa.getStatus()));

// POST /admin/whatsapp/restart — reconnect / regenerate QR
router.post('/whatsapp/restart', async (_req: AuthedRequest, res) => { await wa.start(); res.json(wa.getStatus()); });

// ── AI configuration (OpenAI-compatible endpoint, default OpenRouter) ──
// Used by meeting-recording summaries. Stored in app_settings; resolution
// order per field: DB > server .env > OpenRouter defaults.

// GET /admin/ai-config — current config (API key masked)
router.get('/ai-config', async (_req: AuthedRequest, res) => {
  const cfg = await getAIConfig();
  res.json({
    baseUrl: cfg.baseUrl,
    chatModel: cfg.chatModel,
    chatModelFallback: cfg.chatModelFallback,
    apiKeyMasked: maskKey(cfg.apiKey),
    configured: !!cfg.apiKey,
    defaults: AI_DEFAULTS,
  });
});

// POST /admin/ai-config — save. Empty apiKey keeps the existing key.
router.post('/ai-config', async (req: AuthedRequest, res) => {
  const data = z.object({
    baseUrl: z.string().url().max(300).optional(),
    apiKey: z.string().max(300).optional(),
    chatModel: z.string().min(1).max(120).optional(),
    chatModelFallback: z.string().max(120).optional(),
  }).parse(req.body);
  await saveAIConfig(data);
  const cfg = await getAIConfig();
  res.json({
    ok: true,
    baseUrl: cfg.baseUrl,
    chatModel: cfg.chatModel,
    chatModelFallback: cfg.chatModelFallback,
    apiKeyMasked: maskKey(cfg.apiKey),
    configured: !!cfg.apiKey,
  });
});

// POST /admin/ai-config/test — round-trip a tiny completion to verify the config
router.post('/ai-config/test', async (_req: AuthedRequest, res) => {
  const started = Date.now();
  const result = await getLLMProvider().complete({
    messages: [{ role: 'user', content: 'Reply with the single word: ok' }],
    maxTokens: 10,
    temperature: 0,
  });
  res.json({ ok: true, model: result.model, latencyMs: Date.now() - started, reply: result.content.slice(0, 50) });
});

export default router;