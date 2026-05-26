import { Router } from 'express';
import { z } from 'zod';
import { exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.post('/register', async (req: AuthedRequest, res) => {
  const data = z.object({
    token: z.string().min(10),
    platform: z.enum(['ios','android','web']),
    device_name: z.string().max(120).optional(),
  }).parse(req.body);
  await exec(
    `INSERT INTO push_tokens (member_id, expo_token, platform, device_name)
     VALUES (:me, :token, :platform, :device_name)
     ON DUPLICATE KEY UPDATE member_id = VALUES(member_id), platform = VALUES(platform), device_name = VALUES(device_name), active = 1`,
    { me: req.user!.sub, token: data.token, platform: data.platform, device_name: data.device_name ?? null }
  );
  res.json({ ok: true });
});

router.post('/unregister', async (req: AuthedRequest, res) => {
  const data = z.object({ token: z.string() }).parse(req.body);
  await exec(`UPDATE push_tokens SET active = 0 WHERE member_id = :me AND expo_token = :token`, { me: req.user!.sub, token: data.token });
  res.json({ ok: true });
});

export default router;
