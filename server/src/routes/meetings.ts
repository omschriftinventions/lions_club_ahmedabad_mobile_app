import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { requireEditor } from "../middleware/rbac";
import { HttpError } from "../middleware/error";
import { config } from "../config";
import * as svc from "../services/meetingService";
import { generateMeetingPDF } from "../services/meetingPdf";

const router = Router();
router.use(requireAuth);

// Allowed audio/video mime types for upload
const ALLOWED_MIME = [
  "audio/m4a", "audio/mp4", "audio/mpeg", "audio/mp3", "audio/wav",
  "audio/x-wav", "audio/webm", "audio/ogg", "video/mp4", "video/webm",
  "audio/aac", "audio/x-m4a",
];
const MAX_AUDIO_BYTES = 80 * 1024 * 1024; // 80 MB (supports 2+ hour meetings at low bitrate)

// ── GET /meetings — list + search ──
router.get("/", async (req: AuthedRequest, res) => {
  const q = z.object({
    search: z.string().max(200).optional(),
    status: z.string().max(30).optional(),
    limit:  z.coerce.number().int().min(1).max(200).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  }).parse(req.query);

  const result = await svc.listMeetings(req.user!.clubId, {
    search: q.search,
    status: q.status,
    limit: q.limit,
    offset: q.offset,
  });
  res.json(result);
});

// ── POST /meetings — create meeting ──
const createBody = z.object({
  title:       z.string().min(1).max(255),
  meeting_date: z.string().optional().nullable(),
  location:    z.string().max(255).optional().nullable(),
  participants: z.array(z.object({
    member_id: z.number().int().optional().nullable(),
    name:      z.string().min(1).max(255),
    role:      z.string().max(100).optional().nullable(),
  })).optional(),
});

router.post("/", requireEditor, async (req: AuthedRequest, res) => {
  const data = createBody.parse(req.body);
  const id = await svc.createMeeting(req.user!.clubId, req.user!.sub, data);
  res.status(201).json({ id });
});

// ── GET /meetings/:id — full detail ──
router.get("/:id", async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const detail = await svc.getMeetingDetail(req.user!.clubId, id);
  if (!detail) throw new HttpError(404, "not_found");
  res.json({ meeting: detail });
});

// ── PATCH /meetings/:id — update metadata ──
const updateBody = z.object({
  title:       z.string().min(1).max(255).optional(),
  meeting_date: z.string().optional().nullable(),
  location:    z.string().max(255).optional().nullable(),
  notes:       z.string().max(5000).optional().nullable(),
}).partial();

router.patch("/:id", requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const data = updateBody.parse(req.body);
  await svc.updateMeeting(req.user!.clubId, id, data);
  res.json({ ok: true });
});

// ── DELETE /meetings/:id ──
router.delete("/:id", requireEditor, async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  await svc.deleteMeeting(req.user!.clubId, id);
  res.json({ ok: true });
});

// ── POST /meetings/:id/upload — upload recording as base64 data URL ──
const uploadBody = z.object({
  file:     z.string().min(1).max(120_000_000), // ~80MB base64
  mimeType: z.string().max(100).optional(),
  duration: z.number().int().min(0).optional(),
});

router.post("/:id/upload", requireEditor, async (req: AuthedRequest, res) => {
  const meetingId = z.coerce.number().int().parse(req.params.id);
  const data = uploadBody.parse(req.body);

  const match = data.file.match(/^data:([a-z]+\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!match) throw new HttpError(400, "invalid_audio", "expected data:audio/...;base64,...");

  const mimeType = (data.mimeType || match[1]).toLowerCase();
  if (!ALLOWED_MIME.includes(mimeType)) {
    throw new HttpError(400, "unsupported_type", "allowed: " + ALLOWED_MIME.join(", "));
  }
  const buf = Buffer.from(match[2], "base64");
  if (buf.length > MAX_AUDIO_BYTES) {
    throw new HttpError(413, "file_too_large", "max " + MAX_AUDIO_BYTES + " bytes");
  }

  // Write to uploads/meetings/
  const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("webm") ? "webm" : "m4a";
  const filename = crypto.randomUUID() + "." + ext;
  const dir = path.resolve(config.uploads.dir, "..", "meetings");
  await fs.promises.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.promises.writeFile(filePath, buf);

  const duration = data.duration || 0;
  await svc.saveRecording(meetingId, filePath, mimeType, duration, buf.length);
  res.status(201).json({ ok: true, size: buf.length });
});

// ── POST /meetings/:id/transcribe — run STT on stored recording ──
router.post("/:id/transcribe", requireEditor, async (req: AuthedRequest, res) => {
  const meetingId = z.coerce.number().int().parse(req.params.id);
  if (!config.stt.apiKey) throw new HttpError(400, "stt_not_configured", "Set STT_API_KEY in server .env");
  const result = await svc.transcribeMeeting(meetingId);
  res.json(result);
});

// ── POST /meetings/:id/summarize — run LLM on stored transcript ──
router.post("/:id/summarize", requireEditor, async (req: AuthedRequest, res) => {
  const meetingId = z.coerce.number().int().parse(req.params.id);
  if (!config.ai.apiKey) throw new HttpError(400, "ai_not_configured", "Set AI_API_KEY in server .env");
  const result = await svc.summarizeMeeting(meetingId);
  res.json(result);
});

// ── POST /meetings/:id/transcribe-and-summarize — one-shot ──
router.post("/:id/process", requireEditor, async (req: AuthedRequest, res) => {
  const meetingId = z.coerce.number().int().parse(req.params.id);
  if (!config.stt.apiKey) throw new HttpError(400, "stt_not_configured", "Set STT_API_KEY in server .env");
  if (!config.ai.apiKey) throw new HttpError(400, "ai_not_configured", "Set AI_API_KEY in server .env");

  await svc.transcribeMeeting(meetingId);
  const result = await svc.summarizeMeeting(meetingId);
  res.json(result);
});

// ── PATCH /meetings/:id/action-items/:itemId — update status ──
router.patch("/:id/action-items/:itemId", requireEditor, async (req: AuthedRequest, res) => {
  const meetingId = z.coerce.number().int().parse(req.params.id);
  const itemId = z.coerce.number().int().parse(req.params.itemId);
  const { status } = z.object({ status: z.enum(["open", "in_progress", "done", "deferred"]) }).parse(req.body);
  await svc.updateActionItem(meetingId, itemId, status);
  res.json({ ok: true });
});

// ── GET /meetings/:id/transcript — get transcript text ──
router.get("/:id/transcript", async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const detail = await svc.getMeetingDetail(req.user!.clubId, id);
  if (!detail) throw new HttpError(404, "not_found");
  res.json({ transcript: detail.transcript?.full_text ?? "" });
});

// ── GET /meetings/:id/recording — download recording file ──
router.get("/:id/recording", async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const detail = await svc.getMeetingDetail(req.user!.clubId, id);
  if (!detail) throw new HttpError(404, "not_found");
  if (!detail.recording) throw new HttpError(404, "no_recording");
  if (!fs.existsSync(detail.recording.file_path)) throw new HttpError(404, "file_missing");
  res.setHeader("Content-Type", detail.recording.mime_type);
  res.sendFile(detail.recording.file_path);
});

// ── GET /meetings/:id/pdf — download PDF report ──
router.get("/:id/pdf", async (req: AuthedRequest, res) => {
  const id = z.coerce.number().int().parse(req.params.id);
  const buf = await generateMeetingPDF(req.user!.clubId, id);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=meeting-" + id + ".pdf");
  res.send(buf);
});

export default router;