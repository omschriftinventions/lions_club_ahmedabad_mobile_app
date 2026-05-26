import { Router } from 'express';
import { z } from 'zod';
import { query, exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireEditor } from '../middleware/rbac';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(requireAuth);

// Members see their own; editors see all
router.get('/', async (req: AuthedRequest, res) => {
  const where = req.user!.canEdit ? 'r.club_id = :clubId' : 'r.club_id = :clubId AND r.referred_by = :me';
  const rows = await query<RowDataPacket[]>(
    `SELECT r.id, r.candidate_name, r.candidate_phone, r.candidate_email, r.candidate_profession,
            r.notes, r.status, r.created_at,
            m.name AS referrer_name
     FROM referrals r
     LEFT JOIN members m ON m.id = r.referred_by
     WHERE ${where}
     ORDER BY r.created_at DESC`,
    { clubId: req.user!.clubId, me: req.user!.sub }
  );
  res.json({ referrals: rows });
});

router.post('/', async (req: AuthedRequest, res) => {
  const data = z.object({
    candidate_name: z.string().min(2).max(160),
    candidate_phone: z.string().max(20).optional().nullable(),
    candidate_email: z.string().email().max(160).optional().nullable(),
    candidate_profession: z.string().max(160).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
  }).parse(req.body);
  const r = await exec(
    `INSERT INTO referrals (club_id, referred_by, candidate_name, candidate_phone, candidate_email, candidate_profession, notes)
     VALUES (:clubId, :me, :candidate_name, :candidate_phone, :candidate_email, :candidate_profession, :notes)`,
    { ...data, clubId: req.user!.clubId, me: req.user!.sub }
  );
  res.status(201).json({ id: r.insertId });
});

router.patch('/:id', requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const data = z.object({ status: z.enum(['new','contacted','inducted','declined']) }).parse(req.body);
  await exec(`UPDATE referrals SET status = :status WHERE id = :id AND club_id = :clubId`, { id, status: data.status, clubId: req.user!.clubId });
  res.json({ ok: true });
});

export default router;
