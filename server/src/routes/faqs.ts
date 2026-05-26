import { Router } from 'express';
import { query } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const rows = await query<RowDataPacket[]>(
    `SELECT id, question, answer, category, sort_order
     FROM faqs WHERE club_id = :clubId
     ORDER BY sort_order, id`,
    { clubId: req.user!.clubId }
  );
  res.json({ faqs: rows });
});

export default router;
