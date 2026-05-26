import { Router } from 'express';
import { z } from 'zod';
import { query, exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const q = z.object({ limit: z.coerce.number().int().min(1).max(200).default(50) }).parse(req.query);
  const rows = await query<RowDataPacket[]>(
    `SELECT id, type, title, body, icon, ref_table, ref_id, read_at, created_at
     FROM notifications WHERE member_id = :me
     ORDER BY id DESC LIMIT :limit`,
    { me: req.user!.sub, limit: q.limit }
  );
  res.json({ notifications: rows });
});

router.post('/read', async (req: AuthedRequest, res) => {
  const data = z.object({ ids: z.array(z.number().int()).optional() }).parse(req.body);
  if (data.ids && data.ids.length) {
    await exec(
      `UPDATE notifications SET read_at = NOW() WHERE read_at IS NULL AND member_id = :me AND id IN (${data.ids.map(() => '?').join(',')})`,
      [req.user!.sub, ...data.ids]
    );
  } else {
    await exec(`UPDATE notifications SET read_at = NOW() WHERE read_at IS NULL AND member_id = :me`, { me: req.user!.sub });
  }
  res.json({ ok: true });
});

export default router;
