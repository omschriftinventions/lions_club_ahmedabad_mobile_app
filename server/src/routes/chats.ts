import { Router } from 'express';
import { z } from 'zod';
import { query, exec, tx } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { HttpError } from '../middleware/error';
import { notifyMember } from '../services/push';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(requireAuth);

// GET /chats — list threads for current member, with last message + unread count
router.get('/', async (req: AuthedRequest, res) => {
  const rows = await query<RowDataPacket[]>(
    `SELECT t.id, t.title, t.is_group,
            (SELECT body FROM chat_messages m WHERE m.thread_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_body,
            (SELECT created_at FROM chat_messages m WHERE m.thread_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_at,
            (SELECT m.id FROM chat_messages m WHERE m.thread_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_id,
            cm.last_read,
            (SELECT COUNT(*) FROM chat_messages mm WHERE mm.thread_id = t.id AND mm.id > COALESCE(cm.last_read, 0)) AS unread,
            (SELECT GROUP_CONCAT(mem.name SEPARATOR ', ')
              FROM chat_members cm2 JOIN members mem ON mem.id = cm2.member_id
              WHERE cm2.thread_id = t.id AND cm2.member_id <> :me) AS others
     FROM chat_threads t
     JOIN chat_members cm ON cm.thread_id = t.id AND cm.member_id = :me
     WHERE t.club_id = :clubId
     ORDER BY last_id DESC`,
    { me: req.user!.sub, clubId: req.user!.clubId }
  );
  res.json({ threads: rows });
});

// POST /chats — create thread (1:1 or group)
router.post('/', async (req: AuthedRequest, res) => {
  const data = z.object({
    member_ids: z.array(z.number().int()).min(1).max(50),
    title: z.string().max(120).optional(),
    is_group: z.boolean().optional(),
  }).parse(req.body);
  const me = req.user!.sub;
  const isGroup = data.is_group ?? data.member_ids.length > 1;

  // For 1:1, dedupe — return existing thread
  if (!isGroup && data.member_ids.length === 1) {
    const other = data.member_ids[0];
    const dupe = await query<(RowDataPacket & { id: number })[]>(
      `SELECT t.id FROM chat_threads t
       JOIN chat_members a ON a.thread_id = t.id AND a.member_id = :me
       JOIN chat_members b ON b.thread_id = t.id AND b.member_id = :other
       WHERE t.is_group = 0 AND t.club_id = :clubId
       LIMIT 1`,
      { me, other, clubId: req.user!.clubId }
    );
    if (dupe.length) return res.json({ id: dupe[0].id });
  }

  const id = await tx(async (conn) => {
    const [r] = await conn.query<any>(
      `INSERT INTO chat_threads (club_id, title, is_group, created_by)
       VALUES (?, ?, ?, ?)`,
      [req.user!.clubId, data.title ?? null, isGroup ? 1 : 0, me]
    );
    const threadId = r.insertId;
    const ids = Array.from(new Set([me, ...data.member_ids]));
    for (const mid of ids) {
      await conn.query(
        `INSERT INTO chat_members (thread_id, member_id) VALUES (?, ?)`,
        [threadId, mid]
      );
    }
    return threadId;
  });
  res.status(201).json({ id });
});

// GET /chats/:id — thread metadata + recent messages
router.get('/:id', async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const isMember = await query<(RowDataPacket & { c: number })[]>(
    `SELECT COUNT(*) AS c FROM chat_members WHERE thread_id = :id AND member_id = :me`,
    { id, me: req.user!.sub }
  );
  if (isMember[0].c === 0) throw new HttpError(403, 'not_a_member');

  const thread = (await query<RowDataPacket[]>(
    `SELECT id, title, is_group FROM chat_threads WHERE id = :id`,
    { id }
  ))[0];
  const members = await query<RowDataPacket[]>(
    `SELECT m.id, m.name, m.initials, m.avatar_color, r.color AS role_color
     FROM chat_members cm
     JOIN members m ON m.id = cm.member_id
     JOIN roles r ON r.id = m.role_id
     WHERE cm.thread_id = :id`,
    { id }
  );
  const messages = await query<RowDataPacket[]>(
    `SELECT id, sender_id, body, created_at FROM chat_messages
     WHERE thread_id = :id ORDER BY id ASC LIMIT 200`,
    { id }
  );
  res.json({ thread, members, messages });
});

// POST /chats/:id/messages — send message
router.post('/:id/messages', async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const body = z.object({ body: z.string().min(1).max(4000) }).parse(req.body);
  const isMember = await query<(RowDataPacket & { c: number })[]>(
    `SELECT COUNT(*) AS c FROM chat_members WHERE thread_id = :id AND member_id = :me`,
    { id, me: req.user!.sub }
  );
  if (isMember[0].c === 0) throw new HttpError(403, 'not_a_member');

  const r = await exec(
    `INSERT INTO chat_messages (thread_id, sender_id, body) VALUES (:id, :me, :body)`,
    { id, me: req.user!.sub, body: body.body }
  );

  // Notify other thread members (fire-and-forget)
  const others = await query<(RowDataPacket & { member_id: number })[]>(
    `SELECT member_id FROM chat_members WHERE thread_id = :id AND member_id <> :me`,
    { id, me: req.user!.sub }
  );
  const senderRow = (await query<(RowDataPacket & { name: string })[]>(
    `SELECT name FROM members WHERE id = :id`, { id: req.user!.sub }
  ))[0];
  const senderName = senderRow?.name ?? 'A Lion';
  for (const o of others) {
    notifyMember(o.member_id, {
      title: senderName,
      body: body.body.slice(0, 120),
      data: { type: 'chat', threadId: id },
    }).catch(() => {});
  }

  res.status(201).json({ id: r.insertId });
});

// POST /chats/:id/read — mark up to messageId as read
router.post('/:id/read', async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const data = z.object({ last_id: z.number().int() }).parse(req.body);
  await exec(
    `UPDATE chat_members SET last_read = :last WHERE thread_id = :id AND member_id = :me`,
    { id, me: req.user!.sub, last: data.last_id }
  );
  res.json({ ok: true });
});

export default router;
