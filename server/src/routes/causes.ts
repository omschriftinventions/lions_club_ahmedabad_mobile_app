import { Router } from 'express';
import { query } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req: AuthedRequest, res) => {
  const rows = await query<RowDataPacket[]>(
    `SELECT id, name, icon, units, unit_label, color, sort_order FROM causes ORDER BY sort_order, id`
  );
  res.json({ causes: rows });
});

router.get('/impact', async (req: AuthedRequest, res) => {
  const rows = await query<RowDataPacket[]>(
    `SELECT c.id, c.name, c.icon, c.color,
            COALESCE(SUM(sp.units), 0)      AS units,
            COALESCE(SUM(sp.amount_inr), 0) AS amount_inr,
            COUNT(sp.id)                     AS projects
     FROM causes c
     LEFT JOIN service_projects sp ON sp.cause_id = c.id AND sp.club_id = :clubId
     GROUP BY c.id ORDER BY c.sort_order`,
    { clubId: req.user!.clubId }
  );
  res.json({ impact: rows });
});

export default router;
