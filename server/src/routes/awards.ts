import { Router } from 'express';
import { z } from 'zod';
import { query, exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireEditor } from '../middleware/rbac';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const rows = await query<RowDataPacket[]>(
    `SELECT a.id, a.name, a.category, a.awarded_on, a.description, a.icon,
            a.member_id, m.name AS member_name, m.initials AS member_initials, m.avatar_color
     FROM awards a
     LEFT JOIN members m ON m.id = a.member_id
     WHERE a.club_id = :clubId
     ORDER BY a.awarded_on DESC, a.id DESC`,
    { clubId: req.user!.clubId }
  );
  res.json({ awards: rows });
});

const upsert = z.object({
  name: z.string().min(2).max(160),
  category: z.string().max(80).optional().nullable(),
  member_id: z.number().int().nullable().optional(),
  awarded_on: z.string().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  icon: z.string().max(8).optional().nullable(),
});

router.post('/', requireEditor, async (req: AuthedRequest, res) => {
  const data = upsert.parse(req.body);
  const r = await exec(
    `INSERT INTO awards (club_id, member_id, name, category, awarded_on, description, icon)
     VALUES (:clubId, :member_id, :name, :category, :awarded_on, :description, :icon)`,
    { ...data, clubId: req.user!.clubId }
  );
  res.status(201).json({ id: r.insertId });
});

router.delete('/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  await exec(`DELETE FROM awards WHERE id = :id AND club_id = :clubId`, { id, clubId: req.user!.clubId });
  res.json({ ok: true });
});

export default router;
