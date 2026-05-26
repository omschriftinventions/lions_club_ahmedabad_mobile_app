import { Router } from 'express';
import { z } from 'zod';
import { query, exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireEditor } from '../middleware/rbac';
import { broadcastToClub } from '../services/push';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(requireAuth);

// POST /broadcast — Officer pushes a notification to every member of their club.
// Also writes inbox rows in `notifications` so members see history.
router.post('/', requireEditor, async (req: AuthedRequest, res) => {
  const data = z.object({
    title: z.string().min(2).max(160),
    body: z.string().max(500).optional(),
    icon: z.string().max(8).optional(),
  }).parse(req.body);

  // 1. Inbox rows for every active member of the club
  const members = await query<(RowDataPacket & { id: number })[]>(
    `SELECT id FROM members WHERE club_id = :clubId AND active = 1`,
    { clubId: req.user!.clubId }
  );

  if (members.length > 0) {
    const placeholders = members.map(() => `(?, 'broadcast', ?, ?, ?)`).join(',');
    const params: any[] = [];
    for (const m of members) {
      params.push(m.id, data.title, data.body ?? null, data.icon ?? '📣');
    }
    await exec(
      `INSERT INTO notifications (member_id, type, title, body, icon) VALUES ${placeholders}`,
      params
    );
  }

  // 2. Push fan-out (fire-and-forget — failures don't block API response)
  broadcastToClub(req.user!.clubId, {
    title: data.title,
    body: data.body,
    data: { type: 'broadcast', actorId: req.user!.sub },
  }).catch(() => {});

  res.json({ ok: true, recipients: members.length });
});

export default router;
