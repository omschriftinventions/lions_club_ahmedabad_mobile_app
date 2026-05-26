import { Router } from 'express';
import { z } from 'zod';
import { query, exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireEditor } from '../middleware/rbac';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const q = z.object({ cause_id: z.string().optional() }).parse(req.query);
  const where = ['club_id = :clubId'];
  const params: any = { clubId: req.user!.clubId };
  if (q.cause_id) { where.push('cause_id = :cause'); params.cause = q.cause_id; }
  const rows = await query<RowDataPacket[]>(
    `SELECT id, cause_id, title, units, amount_inr, occurred_on, notes, created_at
     FROM service_projects WHERE ${where.join(' AND ')} ORDER BY occurred_on DESC, id DESC`,
    params
  );
  res.json({ projects: rows });
});

const upsert = z.object({
  cause_id: z.string().max(40),
  title: z.string().min(2).max(200),
  units: z.number().int().nonnegative().default(0),
  amount_inr: z.number().nonnegative().default(0),
  occurred_on: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

router.post('/', requireEditor, async (req: AuthedRequest, res) => {
  const data = upsert.parse(req.body);
  const r = await exec(
    `INSERT INTO service_projects (club_id, cause_id, title, units, amount_inr, occurred_on, notes)
     VALUES (:clubId, :cause_id, :title, :units, :amount_inr, :occurred_on, :notes)`,
    { ...data, clubId: req.user!.clubId }
  );
  res.status(201).json({ id: r.insertId });
});

export default router;
