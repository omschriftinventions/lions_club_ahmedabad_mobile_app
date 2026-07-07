import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";
import { query, exec } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { requireEditor } from "../middleware/rbac";
import { requireSuperAdmin } from "../middleware/rbac";
import { HttpError } from "../middleware/error";
import { config } from "../config";
import { RowDataPacket } from "mysql2";

const router = Router();
// requireAuth applied per-route (some routes are public for login ads)

export interface AdRow {
  id: number;
  club_id: number;
  image_url: string;
  title: string | null;
  link_url: string | null;
  placement: string;
  sort_order: number;
  is_active: number;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

// ── GET /advertisements — list active ads for a placement (public to logged-in users) ──
// ── GET /advertisements/public — public endpoint for login page (no auth) ──
router.get("/public", async (req, res) => {
  const q = z.object({
    placement: z.enum(["dashboard", "login", "both"]).optional(),
  }).parse(req.query);
  const where: string[] = ["is_active = 1"];
  const params: any[] = [];
  const placement = q.placement ?? "login";
  where.push("(placement = ? OR placement = 'both')");
  params.push(placement);
  const rows = await query<RowDataPacket[]>(
    "SELECT id, image_url, title, link_url FROM advertisements WHERE " + where.join(" AND ") + " ORDER BY sort_order, id LIMIT 20",
    params
  );
  res.json({ ads: rows });
});

// ── GET /advertisements — list active ads (auth required) ──
router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const q = z.object({
    placement: z.enum(["dashboard", "login", "both"]).optional(),
    active_only: z.coerce.boolean().default(true),
  }).parse(req.query);

  const where: string[] = ["club_id = ?"];
  const params: any[] = [req.user!.clubId];
  if (q.active_only) { where.push("is_active = 1"); }
  if (q.placement) {
    where.push("(placement = ? OR placement = 'both')");
    params.push(q.placement);
  }

  const rows = await query<RowDataPacket[]>(
    "SELECT * FROM advertisements WHERE " + where.join(" AND ") + " ORDER BY sort_order, id",
    params
  );
  res.json({ ads: rows });
});

// ── GET /advertisements/all — full list for admin (including inactive) ──
router.get("/all", requireAuth, requireSuperAdmin, async (req: AuthedRequest, res) => {
  const rows = await query<RowDataPacket[]>(
    "SELECT * FROM advertisements WHERE club_id = ? ORDER BY sort_order, id",
    [req.user!.clubId]
  );
  res.json({ ads: rows });
});

// ── POST /advertisements/upload — upload image, create ad ──
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 8 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const uploadBody = z.object({
  file:      z.string().min(1).max(13_000_000),
  title:     z.string().max(255).optional().nullable(),
  link_url:  z.string().max(500).optional().nullable(),
  placement: z.enum(["dashboard", "login", "both"]).default("both"),
  sort_order: z.number().int().optional().default(0),
});

router.post("/upload", requireAuth, requireSuperAdmin, async (req: AuthedRequest, res) => {
  const data = uploadBody.parse(req.body);
  const match = data.file.match(/^data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) throw new HttpError(400, "invalid_image", "expected a data:image/...;base64,... payload");

  const mime = match[1].toLowerCase();
  if (!ALLOWED_MIME.includes(mime as typeof ALLOWED_MIME[number])) {
    throw new HttpError(400, "unsupported_image_type", "allowed: " + ALLOWED_MIME.join(", "));
  }
  const buf = Buffer.from(match[2], "base64");
  if (buf.length > MAX_BYTES) throw new HttpError(413, "image_too_large", "max " + MAX_BYTES + " bytes");

  const ext = EXT_BY_MIME[mime] ?? "bin";
  const filename = crypto.randomUUID() + "." + ext;
  const dir = path.resolve(config.uploads.dir, "..", "ads");
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(path.join(dir, filename), buf);

  const base = config.uploads.publicBaseUrl || (req.protocol + "://" + req.get("host"));
  const url = base + "/uploads/ads/" + filename;

  const r = await exec(
    "INSERT INTO advertisements (club_id, image_url, title, link_url, placement, sort_order, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?, 1, ?)",
    [req.user!.clubId, url, data.title ?? null, data.link_url ?? null, data.placement, data.sort_order, req.user!.sub]
  );
  res.status(201).json({ id: r.insertId, url });
});

// ── PATCH /advertisements/:id — toggle active, update placement/sort ──
const updateBody = z.object({
  is_active:  z.boolean().optional(),
  placement: z.enum(["dashboard", "login", "both"]).optional(),
  sort_order: z.number().int().optional(),
  title:      z.string().max(255).optional().nullable(),
  link_url:   z.string().max(500).optional().nullable(),
}).partial();

router.patch("/:id", requireAuth, requireSuperAdmin, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const data = updateBody.parse(req.body);
  const sets: string[] = [];
  const params: any[] = [];
  if (data.is_active !== undefined) { sets.push("is_active = ?"); params.push(data.is_active ? 1 : 0); }
  if (data.placement !== undefined) { sets.push("placement = ?"); params.push(data.placement); }
  if (data.sort_order !== undefined) { sets.push("sort_order = ?"); params.push(data.sort_order); }
  if (data.title !== undefined) { sets.push("title = ?"); params.push(data.title); }
  if (data.link_url !== undefined) { sets.push("link_url = ?"); params.push(data.link_url); }
  if (!sets.length) { res.json({ ok: true }); return; }
  params.push(id, req.user!.clubId);
  await exec("UPDATE advertisements SET " + sets.join(", ") + " WHERE id = ? AND club_id = ?", params);
  res.json({ ok: true });
});

// ── DELETE /advertisements/:id — delete ad and file ──
router.delete("/:id", requireAuth, requireSuperAdmin, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const rows = await query<RowDataPacket[]>(
    "SELECT image_url FROM advertisements WHERE id = ? AND club_id = ?", [id, req.user!.clubId]
  );
  if (!rows.length) throw new HttpError(404, "not_found");

  // Try to delete the file from disk
  const imageUrl = rows[0].image_url as string;
  try {
    const filename = path.basename(imageUrl);
    const filePath = path.resolve(config.uploads.dir, "..", "ads", filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch { /* non-critical */ }

  await exec("DELETE FROM advertisements WHERE id = ? AND club_id = ?", [id, req.user!.clubId]);
  res.json({ ok: true });
});

export default router;