import { Router } from "express";
import { z } from "zod";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { config } from "../config";
import { query, exec } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { requireSuperAdmin } from "../middleware/rbac";
import { HttpError } from "../middleware/error";
import { RowDataPacket } from "mysql2";

const router = Router();

const ALLOWED_SLUGS = new Set(["history"]);
const MAX_HTML_BYTES = 15 * 1024 * 1024;       // 15 MB stored HTML (inline base64 images included)
const MAX_PDF_BYTES = 25 * 1024 * 1024;       // 25 MB uploaded PDF

// Light sanitiser for admin-authored HTML: drop <script> blocks and inline
// event-handler attributes. Trusted-admin content, so this is a safety net only.
function sanitizeHtml(html: string): string {
  return html
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "");
}

// ── GET /content/:slug — any logged-in member can read the published page ──
router.get("/:slug", requireAuth, async (req: AuthedRequest, res) => {
  const slug = req.params.slug;
  if (!ALLOWED_SLUGS.has(slug)) throw new HttpError(404, "not_found");
  const rows = await query<RowDataPacket[]>(
    "SELECT html, updated_at FROM cms_pages WHERE slug = ?", [slug]
  );
  res.json({ slug, html: rows.length ? rows[0].html : "", updatedAt: rows.length ? rows[0].updated_at : null });
});

// ── PUT /content/:slug — super admin publishes rich HTML ──
const putBody = z.object({ html: z.string().min(1).max(MAX_HTML_BYTES) });

router.put("/:slug", requireAuth, requireSuperAdmin, async (req: AuthedRequest, res) => {
  const slug = req.params.slug;
  if (!ALLOWED_SLUGS.has(slug)) throw new HttpError(404, "not_found");
  const data = putBody.parse(req.body);
  const html = sanitizeHtml(data.html);
  await exec(
    "INSERT INTO cms_pages (slug, html, updated_by) VALUES (?, ?, ?) " +
    "ON DUPLICATE KEY UPDATE html = VALUES(html), updated_by = VALUES(updated_by)",
    [slug, html, req.user!.sub]
  );
  res.json({ ok: true });
});

// ── POST /content/upload-pdf — upload a PDF, store it, return a public URL ──
// The admin embeds the returned URL in the History page so members view the
// full PDF inline (rendered by the browser on web, by the WebView on mobile).
// Body: { file: "data:application/pdf;base64,..." }
const uploadBody = z.object({ file: z.string().min(1).max(MAX_PDF_BYTES * 2) });

router.post("/upload-pdf", requireAuth, requireSuperAdmin, async (req: AuthedRequest, res) => {
  const data = uploadBody.parse(req.body);
  const match = data.file.match(/^data:application\/pdf;base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) throw new HttpError(400, "invalid_pdf", "expected data:application/pdf;base64,...");
  const buf = Buffer.from(match[1], "base64");
  if (buf.length > MAX_PDF_BYTES) throw new HttpError(413, "pdf_too_large", "max " + MAX_PDF_BYTES + " bytes");
  const filename = crypto.randomUUID() + ".pdf";
  const dir = path.resolve(config.uploads.dir, "..", "cms");
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(path.join(dir, filename), buf);
  const base = config.uploads.publicBaseUrl || (req.protocol + "://" + req.get("host"));
  res.status(201).json({ url: base + "/uploads/cms/" + filename });
});

export default router;