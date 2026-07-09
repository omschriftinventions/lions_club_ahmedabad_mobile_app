import { Router } from 'express';
import { z } from 'zod';
import { query, exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/rbac';
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

// ---- Super-admin cause management -------------------------------------
// Causes are global (shared by all clubs), so only super admins may edit them.

const slugRe = /^[a-z0-9][a-z0-9_-]{1,38}$/i;

const causeBody = z.object({
  id: z.string().max(40).regex(slugRe, 'invalid_id').optional(),
  name: z.string().min(2).max(80),
  icon: z.string().min(1).max(8),
  unit_label: z.string().max(80).optional().nullable(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i).optional().nullable(),
  sort_order: z.number().int().optional(),
});

router.post('/', requireSuperAdmin, async (req: AuthedRequest, res) => {
  const data = causeBody.parse(req.body);
  const id = (data.id ?? slugify(data.name)).toLowerCase();
  let sort = data.sort_order;
  if (sort === undefined) {
    const max = await query<RowDataPacket[]>(`SELECT COALESCE(MAX(sort_order), 0) AS m FROM causes`);
    sort = (Number(max[0]?.m) || 0) + 10;
  }
  try {
    await exec(
      `INSERT INTO causes (id, name, icon, unit_label, color, sort_order)
       VALUES (:id, :name, :icon, :unit_label, :color, :sort_order)`,
      { id, name: data.name, icon: data.icon, unit_label: data.unit_label ?? null, color: data.color ?? '#003F87', sort_order: sort }
    );
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'cause_exists', message: 'A cause with that id already exists' });
    throw e;
  }
  res.status(201).json({ id });
});

router.put('/:id', requireSuperAdmin, async (req: AuthedRequest, res) => {
  const id = req.params.id;
  const data = causeBody.omit({ id: true }).parse(req.body);
  await exec(
    `UPDATE causes SET name = :name, icon = :icon, unit_label = :unit_label, color = :color, sort_order = :sort_order WHERE id = :id`,
    {
      id,
      name: data.name,
      icon: data.icon,
      unit_label: data.unit_label ?? null,
      color: data.color ?? null,
      sort_order: data.sort_order ?? 0,
    }
  );
  res.json({ ok: true });
});

router.delete('/:id', requireSuperAdmin, async (req: AuthedRequest, res) => {
  const id = req.params.id;
  const refs = await query<RowDataPacket[]>(`SELECT 1 FROM service_projects WHERE cause_id = :id LIMIT 1`, { id });
  if (refs.length) return res.status(409).json({ error: 'cause_in_use', message: 'Cannot delete a cause that has logged projects' });
  await exec(`DELETE FROM causes WHERE id = :id`, { id });
  res.json({ ok: true });
});

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cause';
}


export default router;
