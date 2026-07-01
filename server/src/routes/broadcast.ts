import { Router } from 'express';
import { z } from 'zod';
import { query, exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireEditor } from '../middleware/rbac';
import { broadcastToClub } from '../services/push';
import * as wa from '../providers/whatsapp';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(requireAuth);

// POST /broadcast — Officer pushes a push notification to every member of their club.
router.post('/', requireEditor, async (req: AuthedRequest, res) => {
  const data = z.object({
    title: z.string().min(2).max(160),
    body: z.string().max(500).optional(),
    icon: z.string().max(8).optional(),
  }).parse(req.body);

  const members = await query<(RowDataPacket & { id: number })[]>(
    `SELECT id FROM members WHERE club_id = :clubId AND active = 1 AND is_super_admin = 0`,
    { clubId: req.user!.clubId }
  );

  if (members.length > 0) {
    const placeholders = members.map(() => `(?, 'broadcast', ?, ?, ?)`).join(',');
    const params: any[] = [];
    for (const m of members) {
      params.push(m.id, data.title, data.body ?? null, data.icon ?? '\uD83D\uDCE3');
    }
    await exec(
      `INSERT INTO notifications (member_id, type, title, body, icon) VALUES ${placeholders}`,
      params
    );
  }

  broadcastToClub(req.user!.clubId, {
    title: data.title,
    body: data.body,
    data: { type: 'broadcast', actorId: req.user!.sub },
  }).catch(() => {});

  res.json({ ok: true, recipients: members.length });
});

// POST /broadcast/whatsapp — Send a WhatsApp message to all or selected members.
// Body: { message: string, memberIds?: number[] }  (empty/omitted memberIds = all active members with phone)
router.post('/whatsapp', requireEditor, async (req: AuthedRequest, res) => {
  const { message, memberIds } = z.object({
    message: z.string().min(1).max(4000),
    memberIds: z.array(z.number().int()).optional(),
  }).parse(req.body);

  const clubId = req.user!.clubId;
  let members: { id: number; name: string; phone_e164: string | null }[];

  if (memberIds && memberIds.length > 0) {
    const idList = memberIds.join(',');
    members = await query<(RowDataPacket & { id: number; name: string; phone_e164: string | null })[]>(
      `SELECT id, name, phone_e164 FROM members WHERE club_id = :clubId AND active = 1 AND is_super_admin = 0 AND id IN (${idList})`,
      { clubId }
    );
  } else {
    members = await query<(RowDataPacket & { id: number; name: string; phone_e164: string | null })[]>(
      `SELECT id, name, phone_e164 FROM members WHERE club_id = :clubId AND active = 1 AND is_super_admin = 0 AND phone_e164 IS NOT NULL`,
      { clubId }
    );
  }

  let sent = 0, failed = 0, noPhone = 0;
  for (const m of members) {
    if (!m.phone_e164) { noPhone++; continue; }
    const ok = await wa.send(m.phone_e164, message);
    if (ok) sent++; else failed++;
    // Small delay to reduce WhatsApp rate-limit / ban risk
    await new Promise(r => setTimeout(r, 150));
  }

  res.json({ ok: true, sent, failed, noPhone, total: members.length });
});

export default router;