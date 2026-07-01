import { Router } from 'express';
import { z } from 'zod';
import { query, exec } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireEditor } from '../middleware/rbac';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(requireAuth);

// GET /attendance/:eventId — Roster of all members + attendance status for this event
router.get('/:eventId', async (req: AuthedRequest, res) => {
  const eventId = z.coerce.number().int().parse(req.params.eventId);
  const rows = await query<RowDataPacket[]>(
    `SELECT m.id, m.name, m.initials, m.avatar_color,
            r.code AS role, r.label AS role_label, r.color AS role_color,
            COALESCE(rs.status, 'maybe')  AS rsvp_status,
            COALESCE(rs.attended, 0)      AS attended,
            rs.attended_at
     FROM members m
     JOIN roles r ON r.id = m.role_id
     LEFT JOIN rsvps rs ON rs.member_id = m.id AND rs.event_id = :eventId
     WHERE m.club_id = :clubId AND m.active = 1 AND m.is_super_admin = 0
     ORDER BY rs.attended DESC, rs.status, m.name`,
    { eventId, clubId: req.user!.clubId }
  );
  res.json({ attendance: rows });
});

// PUT /attendance/:eventId/:memberId — Mark attended/unmark. Officer-only.
router.put('/:eventId/:memberId', requireEditor, async (req: AuthedRequest, res) => {
  const eventId  = z.coerce.number().int().parse(req.params.eventId);
  const memberId = z.coerce.number().int().parse(req.params.memberId);
  const data = z.object({ attended: z.boolean() }).parse(req.body);

  // Upsert RSVP row with attended flag. status defaults to 'yes' since they were present.
  await exec(
    `INSERT INTO rsvps (event_id, member_id, status, attended, attended_at, marked_by)
     VALUES (:eventId, :memberId, 'yes', :attended, IF(:attended, NOW(), NULL), :me)
     ON DUPLICATE KEY UPDATE
       attended    = VALUES(attended),
       attended_at = IF(VALUES(attended), NOW(), NULL),
       marked_by   = VALUES(marked_by)`,
    { eventId, memberId, attended: data.attended ? 1 : 0, me: req.user!.sub }
  );
  res.json({ ok: true });
});

export default router;
