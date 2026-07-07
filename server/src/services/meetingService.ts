import { query, exec, tx } from "../db";
import { RowDataPacket } from "mysql2";
import { getLLMProvider } from "../providers/llm";
import { config } from "../config";

export interface MeetingRow {
  id: number;
  club_id: number;
  title: string;
  meeting_date: string | null;
  location: string | null;
  duration_seconds: number;
  status: string;
  meeting_type: string | null;
  meeting_mood: string | null;
  language: string | null;
  notes: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingSummaryRow {
  id: number;
  meeting_id: number;
  executive_summary: string | null;
  key_discussions: any;
  action_items: any;
  decisions: any;
  follow_ups: any;
  risks: any;
  topics: any;
  next_meeting: any;
  meeting_mood: string | null;
  meeting_type: string | null;
  model_used: string | null;
  created_at: string;
}

export interface ActionItemRow {
  id: number;
  meeting_id: number;
  description: string;
  assignee: string | null;
  due_date: string | null;
  status: string;
}

export interface DecisionRow {
  id: number;
  meeting_id: number;
  description: string;
  decided_by: string | null;
}

export interface FollowUpRow {
  id: number;
  meeting_id: number;
  description: string;
  owner: string | null;
  due_date: string | null;
  status: string;
}

export interface MeetingDetail extends MeetingRow {
  participants: { id: number; member_id: number | null; name: string; role: string | null }[];
  recording: { id: number; file_path: string; mime_type: string; duration_seconds: number } | null;
  transcript: { id: number; language: string | null; full_text: string; word_count: number } | null;
  summary: MeetingSummaryRow | null;
  action_items: ActionItemRow[];
  decisions: DecisionRow[];
  follow_ups: FollowUpRow[];
}

// Create meeting + participants in a transaction
export async function createMeeting(clubId: number, createdBy: number, data: {
  title: string;
  meeting_date?: string | null;
  location?: string | null;
  participants?: { member_id?: number | null; name: string; role?: string | null }[];
}): Promise<number> {
  return tx(async (conn) => {
    const [r] = await conn.query<any>(
      "INSERT INTO meetings (club_id, title, meeting_date, location, status, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [clubId, data.title, data.meeting_date ?? null, data.location ?? null, "recording", createdBy]
    );
    const meetingId = r.insertId;
    if (data.participants?.length) {
      for (const p of data.participants) {
        await conn.query(
          "INSERT INTO meeting_participants (meeting_id, member_id, name, role) VALUES (?, ?, ?, ?)",
          [meetingId, p.member_id ?? null, p.name, p.role ?? null]
        );
      }
    }
    return meetingId;
  });
}

// List with search
export async function listMeetings(clubId: number, opts: {
  search?: string;
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<{ meetings: MeetingRow[]; total: number }> {
  const where = ["club_id = ?"];
  const params: any[] = [clubId];
  if (opts.status) { where.push("status = ?"); params.push(opts.status); }
  if (opts.search) {
    where.push("(title LIKE ? OR location LIKE ? OR meeting_type LIKE ?)");
    const s = "%" + opts.search + "%";
    params.push(s, s, s);
  }
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  const whereStr = where.join(" AND ");

  const rows = await query<RowDataPacket[]>(
    "SELECT * FROM meetings WHERE " + whereStr + " ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?",
    [...params, limit, offset]
  );
  const totalRows = await query<RowDataPacket[]>(
    "SELECT COUNT(*) as total FROM meetings WHERE " + whereStr, params
  );
  return { meetings: rows as MeetingRow[], total: (totalRows[0] as any).total };
}

// Get full detail with all related data
export async function getMeetingDetail(clubId: number, meetingId: number): Promise<MeetingDetail | null> {
  const meetings = await query<RowDataPacket[]>(
    "SELECT * FROM meetings WHERE id = ? AND club_id = ?", [meetingId, clubId]
  );
  if (!meetings.length) return null;
  const meeting = meetings[0] as MeetingRow;

  const [participants, recordings, transcripts, summaries, actionItems, decisions, followUps] = await Promise.all([
    query<RowDataPacket[]>("SELECT id, member_id, name, role FROM meeting_participants WHERE meeting_id = ?", [meetingId]),
    query<RowDataPacket[]>("SELECT id, file_path, mime_type, duration_seconds FROM meeting_recordings WHERE meeting_id = ? ORDER BY id DESC LIMIT 1", [meetingId]),
    query<RowDataPacket[]>("SELECT id, language, full_text, word_count FROM meeting_transcripts WHERE meeting_id = ? ORDER BY id DESC LIMIT 1", [meetingId]),
    query<RowDataPacket[]>("SELECT * FROM meeting_summaries WHERE meeting_id = ? ORDER BY id DESC LIMIT 1", [meetingId]),
    query<RowDataPacket[]>("SELECT id, meeting_id, description, assignee, due_date, status FROM meeting_action_items WHERE meeting_id = ? ORDER BY id", [meetingId]),
    query<RowDataPacket[]>("SELECT id, meeting_id, description, decided_by FROM meeting_decisions WHERE meeting_id = ? ORDER BY id", [meetingId]),
    query<RowDataPacket[]>("SELECT id, meeting_id, description, owner, due_date, status FROM meeting_follow_ups WHERE meeting_id = ? ORDER BY id", [meetingId]),
  ]);

  return {
    ...meeting,
    participants: participants as any,
    recording: (recordings[0] as any) ?? null,
    transcript: (transcripts[0] as any) ?? null,
    summary: (summaries[0] as MeetingSummaryRow) ?? null,
    action_items: actionItems as ActionItemRow[],
    decisions: decisions as DecisionRow[],
    follow_ups: followUps as FollowUpRow[],
  };
}

// Save recording file metadata + update status
export async function saveRecording(meetingId: number, filePath: string, mimeType: string, durationSec: number, fileSize: number): Promise<void> {
  await exec(
    "INSERT INTO meeting_recordings (meeting_id, file_path, mime_type, duration_seconds, file_size) VALUES (?, ?, ?, ?, ?)",
    [meetingId, filePath, mimeType, durationSec, fileSize]
  );
  await exec(
    "UPDATE meetings SET status = ?, duration_seconds = ? WHERE id = ?",
    ["uploaded", durationSec, meetingId]
  );
}

// Transcribe: read recording file, call STT API, store transcript
export async function transcribeMeeting(meetingId: number): Promise<{ transcript: string }> {
  if (!config.stt.apiKey) throw new Error("stt_not_configured");

  const recs = await query<RowDataPacket[]>(
    "SELECT file_path, mime_type FROM meeting_recordings WHERE meeting_id = ? ORDER BY id DESC LIMIT 1", [meetingId]
  );
  if (!recs.length) throw new Error("no_recording");

  await exec("UPDATE meetings SET status = ? WHERE id = ?", ["transcribing", meetingId]);

  const fs = await import("fs");
  const buf = fs.readFileSync(recs[0].file_path);

  const formData = new FormData();
  formData.append("file", new Blob([buf], { type: recs[0].mime_type }), "audio.m4a");
  formData.append("model", config.stt.model);
  formData.append("response_format", "json");

  const res = await fetch(config.stt.baseUrl, {
    method: "POST",
    headers: { Authorization: "Bearer " + config.stt.apiKey },
    body: formData,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error("STT failed: " + res.status + " " + errText.slice(0, 300));
  }
  const data = await res.json() as { text?: string };
  const transcript = data.text || "";

  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  await exec(
    "INSERT INTO meeting_transcripts (meeting_id, full_text, word_count) VALUES (?, ?, ?)",
    [meetingId, transcript, wordCount]
  );
  await exec("UPDATE meetings SET status = ? WHERE id = ?", ["transcribed", meetingId]);

  return { transcript };
}

const SUMMARY_SYSTEM_PROMPT =
  "You are a professional meeting minutes assistant for Lions Club Ahmedabad Host. " +
  "You understand multilingual transcripts (English, Hindi, Gujarati, and code-switching). " +
  "DO NOT translate the transcript. Always generate the summary in English. " +
  "Analyze the transcript and return a JSON object with these fields:\n" +
  "{\n" +
  '  "executive_summary": "2-3 paragraph overview",\n' +
  '  "key_discussions": ["point 1", "point 2"],\n' +
  '  "action_items": [{"description": "...", "assignee": "...", "due_date": null}],\n' +
  '  "decisions": [{"description": "...", "decided_by": "..."}],\n' +
  '  "follow_ups": [{"description": "...", "owner": "...", "due_date": null}],\n' +
  '  "risks": ["risk 1", "risk 2"],\n' +
  '  "topics": ["topic 1", "topic 2"],\n' +
  '  "next_meeting": {"suggestion": "...", "suggested_date": null},\n' +
  '  "meeting_mood": "collaborative|tense|productive|neutral",\n' +
  '  "meeting_type": "board|general|committee|planning|review"\n' +
  "}\n" +
  "If a field has no data, use an empty array or null. Return ONLY the JSON, no markdown.";

// Summarize: call LLM with transcript, parse structured JSON, store
export async function summarizeMeeting(meetingId: number): Promise<{ summaryId: number }> {
  const transcripts = await query<RowDataPacket[]>(
    "SELECT id, full_text FROM meeting_transcripts WHERE meeting_id = ? ORDER BY id DESC LIMIT 1", [meetingId]
  );
  if (!transcripts.length) throw new Error("no_transcript");
  const transcriptText = transcripts[0].full_text as string;
  if (transcriptText.trim().length < 10) throw new Error("transcript_too_short");

  await exec("UPDATE meetings SET status = ? WHERE id = ?", ["summarizing", meetingId]);

  const provider = getLLMProvider();
  const result = await provider.complete({
    messages: [
      { role: "system", content: SUMMARY_SYSTEM_PROMPT },
      { role: "user", content: transcriptText },
    ],
    maxTokens: 4000,
    temperature: 0.3,
    responseFormat: "json",
  });

  let parsed: any;
  try {
    let raw = result.content.trim();
    // Strip markdown code fences if present
    if (raw.startsWith("`" + "`" + "`")) {
      raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    }
    parsed = JSON.parse(raw);
  } catch {
    parsed = {
      executive_summary: result.content,
      key_discussions: [], action_items: [], decisions: [], follow_ups: [],
      risks: [], topics: [], next_meeting: null, meeting_mood: "neutral", meeting_type: "general"
    };
  }

  return tx(async (conn) => {
    const [sumRes] = await conn.query<any>(
      "INSERT INTO meeting_summaries (meeting_id, executive_summary, key_discussions, action_items, decisions, follow_ups, risks, topics, next_meeting, meeting_mood, meeting_type, model_used, prompt_tokens, completion_tokens) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        meetingId,
        parsed.executive_summary ?? null,
        JSON.stringify(parsed.key_discussions ?? []),
        JSON.stringify(parsed.action_items ?? []),
        JSON.stringify(parsed.decisions ?? []),
        JSON.stringify(parsed.follow_ups ?? []),
        JSON.stringify(parsed.risks ?? []),
        JSON.stringify(parsed.topics ?? []),
        JSON.stringify(parsed.next_meeting ?? null),
        parsed.meeting_mood ?? null,
        parsed.meeting_type ?? null,
        result.model,
        result.promptTokens ?? null,
        result.completionTokens ?? null,
      ]
    );
    const summaryId = sumRes.insertId;

    if (Array.isArray(parsed.action_items)) {
      for (const ai of parsed.action_items) {
        if (!ai || !ai.description) continue;
        await conn.query(
          "INSERT INTO meeting_action_items (meeting_id, description, assignee, due_date, status) VALUES (?,?,?,?,?)",
          [meetingId, ai.description, ai.assignee ?? null, ai.due_date ?? null, "open"]
        );
      }
    }
    if (Array.isArray(parsed.decisions)) {
      for (const d of parsed.decisions) {
        if (!d || !d.description) continue;
        await conn.query(
          "INSERT INTO meeting_decisions (meeting_id, description, decided_by) VALUES (?,?,?)",
          [meetingId, d.description, d.decided_by ?? null]
        );
      }
    }
    if (Array.isArray(parsed.follow_ups)) {
      for (const f of parsed.follow_ups) {
        if (!f || !f.description) continue;
        await conn.query(
          "INSERT INTO meeting_follow_ups (meeting_id, description, owner, due_date, status) VALUES (?,?,?,?,?)",
          [meetingId, f.description, f.owner ?? null, f.due_date ?? null, "open"]
        );
      }
    }

    await conn.query(
      "UPDATE meetings SET status = ?, meeting_mood = ?, meeting_type = ? WHERE id = ?",
      ["summarized", parsed.meeting_mood ?? null, parsed.meeting_type ?? null, meetingId]
    );

    return { summaryId };
  });
}

export async function updateActionItem(meetingId: number, itemId: number, status: string): Promise<void> {
  await exec(
    "UPDATE meeting_action_items SET status = ? WHERE id = ? AND meeting_id = ?",
    [status, itemId, meetingId]
  );
}

export async function deleteMeeting(clubId: number, meetingId: number): Promise<void> {
  await exec("DELETE FROM meetings WHERE id = ? AND club_id = ?", [meetingId, clubId]);
}

export async function updateMeeting(clubId: number, meetingId: number, data: {
  title?: string;
  meeting_date?: string | null;
  location?: string | null;
  notes?: string | null;
}): Promise<void> {
  const sets: string[] = [];
  const params: any[] = [];
  if (data.title !== undefined) { sets.push("title = ?"); params.push(data.title); }
  if (data.meeting_date !== undefined) { sets.push("meeting_date = ?"); params.push(data.meeting_date); }
  if (data.location !== undefined) { sets.push("location = ?"); params.push(data.location); }
  if (data.notes !== undefined) { sets.push("notes = ?"); params.push(data.notes); }
  if (!sets.length) return;
  params.push(meetingId, clubId);
  await exec("UPDATE meetings SET " + sets.join(", ") + " WHERE id = ? AND club_id = ?", params);
}