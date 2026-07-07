import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Icon } from "../components/Icon";
import { Spinner, EmptyState, Pill, fmtDate } from "../components/ui";

type Tab = "summary" | "transcript" | "actions" | "recording";

interface MeetingDetail {
  id: number;
  title: string;
  meeting_date: string | null;
  location: string | null;
  duration_seconds: number;
  status: string;
  meeting_type: string | null;
  meeting_mood: string | null;
  notes: string | null;
  participants: { id: number; member_id: number | null; name: string; role: string | null }[];
  recording: { id: number; file_path: string; mime_type: string; duration_seconds: number } | null;
  transcript: { id: number; language: string | null; full_text: string; word_count: number } | null;
  summary: {
    id: number;
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
  } | null;
  action_items: { id: number; description: string; assignee: string | null; due_date: string | null; status: string }[];
  decisions: { id: number; description: string; decided_by: string | null }[];
  follow_ups: { id: number; description: string; owner: string | null; due_date: string | null; status: string }[];
}

function parseJSON(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") { try { return JSON.parse(val); } catch { return []; } }
  return [];
}

function fmtDuration(sec: number): string {
  if (!sec) return "--";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h) return h + "h " + m + "m";
  if (m) return m + "m " + s + "s";
  return s + "s";
}

const STATUS_TONE: Record<string, "gray" | "gold" | "green" | "blue" | "red"> = {
  recording: "gold", uploaded: "blue", transcribing: "blue", transcribed: "blue",
  summarizing: "blue", summarized: "green", failed: "red",
};

export default function MeetingDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const meetingId = Number(id);
  const nav = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("summary");
  const [searchQ, setSearchQ] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => api.get<{ meeting: MeetingDetail }>("/meetings/" + meetingId),
    enabled: !!meetingId,
  });

  const processMut = useMutation({
    mutationFn: async (action: "transcribe" | "summarize" | "process") => {
      return api.post("/meetings/" + meetingId + "/" + action, {});
    },
    onSuccess: () => { refetch(); },
  });

  const deleteMut = useMutation({
    mutationFn: () => api.delete("/meetings/" + meetingId),
    onSuccess: () => { nav("/meetings"); },
  });

  const updateActionMut = useMutation({
    mutationFn: ({ itemId, status }: { itemId: number; status: string }) =>
      api.patch("/meetings/" + meetingId + "/action-items/" + itemId, { status }),
    onSuccess: () => refetch(),
  });

  if (isLoading) return <Spinner />;
  if (error || !data) return <div className="card pad"><EmptyState icon="mic" title="Meeting not found" /></div>;
  const m = data.meeting;

  const hasRecording = !!m.recording;
  const hasTranscript = !!m.transcript;
  const hasSummary = !!m.summary;

  const shareSummary = () => {
    if (!m.summary) return;
    const s = m.summary;
    let text = "Lions Club Meeting Summary\n" + m.title + "\n\nExecutive Summary:\n" + (s.executive_summary || "N/A") + "\n";
    const actions = parseJSON(s.action_items);
    if (actions.length) { text += "\nAction Items:\n"; actions.forEach((a: any, i: number) => { text += (i+1) + ". " + a.description + (a.assignee ? " (" + a.assignee + ")" : "") + "\n"; }); }
    if (navigator.share) { navigator.share({ title: m.title, text }); }
    else { navigator.clipboard.writeText(text); alert("Summary copied to clipboard!"); }
  };

  const shareTranscript = () => {
    if (!m.transcript?.full_text) return;
    const text = "Transcript: " + m.title + "\n\n" + m.transcript.full_text;
    if (navigator.share) { navigator.share({ title: m.title, text }); }
    else { navigator.clipboard.writeText(text); alert("Transcript copied to clipboard!"); }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "summary", label: "Summary", icon: "doc" },
    { key: "transcript", label: "Transcript", icon: "chat" },
    { key: "actions", label: "Actions", icon: "check" },
    { key: "recording", label: "Recording", icon: "mic" },
  ];

  return (
    <>
      <div className="page-head" style={{ marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <button className="btn ghost sm" onClick={() => nav("/meetings")} style={{ marginBottom: 4 }}><Icon name="back" size={16} /> Back to meetings</button>
          <h2>{m.title}</h2>
          <div className="muted" style={{ marginTop: 2 }}>
            {m.meeting_date ? fmtDate(m.meeting_date) : "No date"} {" \u00b7 "}
            {fmtDuration(m.duration_seconds)}
            {m.location ? " \u00b7 " + m.location : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {m.meeting_type && <Pill tone="green">{m.meeting_type}</Pill>}
          {m.meeting_mood && <Pill tone="gold">{m.meeting_mood}</Pill>}
          <Pill tone={STATUS_TONE[m.status] || "gray"}>{m.status}</Pill>
          <button className="btn ghost sm" onClick={() => { if (confirm("Delete this meeting and all its data?")) deleteMut.mutate(); }} title="Delete">
            <Icon name="trash" size={16} />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="card pad" style={{ marginBottom: 12 }}>
        {hasRecording && !hasTranscript && (
          <div className="btn-row">
            <button className="btn primary" disabled={processMut.isPending} onClick={() => processMut.mutate("transcribe")}>
              {processMut.isPending ? "Transcribing..." : "Transcribe Audio"}
            </button>
            <button className="btn outline" disabled={processMut.isPending} onClick={() => processMut.mutate("process")}>
              Transcribe + Summarize
            </button>
          </div>
        )}
        {hasTranscript && !hasSummary && (
          <div className="btn-row">
            <button className="btn gold" disabled={processMut.isPending} onClick={() => processMut.mutate("summarize")}>
              {processMut.isPending ? "Generating summary..." : "Generate AI Summary"}
            </button>
          </div>
        )}
        {hasSummary && (
          <div className="btn-row">
            <button className="btn outline" onClick={shareSummary}><Icon name="share" size={16} /> Share Summary</button>
            <button className="btn outline" onClick={shareTranscript}><Icon name="share" size={16} /> Share Transcript</button>
            <a className="btn outline" href={api.base + "/meetings/" + meetingId + "/recording"} target="_blank" rel="noreferrer"><Icon name="download" size={16} /> Download Recording</a>
            <a className="btn outline" href={api.base + "/meetings/" + meetingId + "/pdf"} target="_blank" rel="noreferrer"><Icon name="doc" size={16} /> Download PDF Report</a>
          </div>
        )}
        {!hasRecording && <div className="muted">No recording uploaded yet.</div>}
      </div>

      {/* Tabs */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "2px solid var(--line)" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "10px 18px",
                fontWeight: 700,
                fontSize: 13,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: tab === t.key ? "var(--navy)" : "var(--ink-3)",
                borderBottom: tab === t.key ? "2.5px solid var(--navy)" : "2.5px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icon name={t.icon} size={15} /> {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {tab === "summary" && <SummaryTab m={m} />}
          {tab === "transcript" && <TranscriptTab m={m} searchQ={searchQ} setSearchQ={setSearchQ} />}
          {tab === "actions" && <ActionsTab m={m} onUpdate={(itemId, status) => updateActionMut.mutate({ itemId, status })} />}
          {tab === "recording" && <RecordingTab m={m} meetingId={meetingId} />}
        </div>
      </div>
    </>
  );
}

function SectionTitle({ icon, title, color }: { icon: string; title: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontWeight: 800, color: color || "var(--ink)" }}>
      <Icon name={icon} size={18} /> {title}
    </div>
  );
}

function SummaryTab({ m }: { m: MeetingDetail }) {
  if (!m.summary) return <EmptyState icon="doc" title="No summary yet" body="Generate an AI summary after transcribing the meeting." />;
  const s = m.summary;
  const keyDiscussions = parseJSON(s.key_discussions);
  const risks = parseJSON(s.risks);
  const topics = parseJSON(s.topics);
  const nextMeeting = s.next_meeting ? (typeof s.next_meeting === "string" ? JSON.parse(s.next_meeting) : s.next_meeting) : null;

  return (
    <div>
      {s.executive_summary && (
        <div className="card pad" style={{ marginBottom: 12 }}>
          <SectionTitle icon="doc" title="Executive Summary" />
          <div style={{ lineHeight: 1.7, color: "var(--ink-2)" }}>{s.executive_summary}</div>
        </div>
      )}
      <div className="grid grid-2">
        {keyDiscussions.length > 0 && (
          <div className="card pad">
            <SectionTitle icon="chat" title="Key Discussions" />
            {keyDiscussions.map((d: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: "var(--navy)" }}>{"\u2022"}</span>
                <span style={{ color: "var(--ink-2)" }}>{d}</span>
              </div>
            ))}
          </div>
        )}
        {m.decisions.length > 0 && (
          <div className="card pad">
            <SectionTitle icon="check" title="Decisions" />
            {m.decisions.map((d) => (
              <div key={d.id} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: "var(--navy)" }}>{"\u2022"}</span>
                <span style={{ color: "var(--ink-2)" }}>{d.description}{d.decided_by ? " (" + d.decided_by + ")" : ""}</span>
              </div>
            ))}
          </div>
        )}
        {m.follow_ups.length > 0 && (
          <div className="card pad">
            <SectionTitle icon="download" title="Follow-Ups" />
            {m.follow_ups.map((f) => (
              <div key={f.id} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: "var(--navy)" }}>{"\u2022"}</span>
                <span style={{ color: "var(--ink-2)" }}>{f.description}{f.owner ? " (" + f.owner + ")" : ""}</span>
              </div>
            ))}
          </div>
        )}
        {risks.length > 0 && (
          <div className="card pad">
            <SectionTitle icon="trash" title="Risks" color="var(--red)" />
            {risks.map((r: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: "var(--red)" }}>{"\u2022"}</span>
                <span style={{ color: "var(--ink-2)" }}>{r}</span>
              </div>
            ))}
          </div>
        )}
        {topics.length > 0 && (
          <div className="card pad">
            <SectionTitle icon="search" title="Topics" />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {topics.map((t: string, i: number) => <Pill key={i} tone="blue">{t}</Pill>)}
            </div>
          </div>
        )}
        {nextMeeting && (
          <div className="card pad">
            <SectionTitle icon="calendar" title="Next Meeting" />
            <div style={{ color: "var(--ink-2)" }}>{nextMeeting.suggestion || JSON.stringify(nextMeeting)}</div>
          </div>
        )}
      </div>
      {s.model_used && <div className="muted" style={{ textAlign: "center", marginTop: 10 }}>Generated with {s.model_used}</div>}
    </div>
  );
}

function TranscriptTab({ m, searchQ, setSearchQ }: { m: MeetingDetail; searchQ: string; setSearchQ: (s: string) => void }) {
  if (!m.transcript) return <EmptyState icon="chat" title="No transcript yet" body="Transcribe the meeting audio to see the text here." />;
  let text = m.transcript.full_text;
  if (searchQ.trim()) {
    const lines = text.split("\n");
    const matches = lines.filter((l: string) => l.toLowerCase().includes(searchQ.toLowerCase()));
    text = matches.length ? matches.join("\n") : text;
  }
  return (
    <div>
      <div className="search-bar" style={{ marginBottom: 10 }}>
        <Icon name="search" size={16} />
        <input type="text" placeholder="Search transcript..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14 }} />
      </div>
      <div className="muted" style={{ marginBottom: 8 }}>{m.transcript.word_count} words</div>
      <div style={{ background: "var(--bg)", borderRadius: 12, padding: 16, maxHeight: 500, overflowY: "auto", whiteSpace: "pre-wrap", lineHeight: 1.8, color: "var(--ink-2)", fontFamily: "monospace", fontSize: 13 }}>
        {text}
      </div>
    </div>
  );
}

function ActionsTab({ m, onUpdate }: { m: MeetingDetail; onUpdate: (itemId: number, status: string) => void }) {
  if (m.action_items.length === 0 && m.decisions.length === 0 && m.follow_ups.length === 0)
    return <EmptyState icon="check" title="No action items" body="Generate an AI summary to extract action items, decisions, and follow-ups." />;
  const statusOptions = ["open", "in_progress", "done", "deferred"];
  const toneMap: Record<string, "gray" | "gold" | "green" | "blue" | "red"> = { open: "gold", in_progress: "blue", done: "green", deferred: "gray" };
  return (
    <div className="grid grid-2">
      {m.action_items.length > 0 && (
        <div className="card pad">
          <SectionTitle icon="check" title="Action Items" />
          {m.action_items.map((ai) => (
            <div key={ai.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "var(--ink)" }}>{ai.description}</div>
                {ai.assignee && <div className="muted" style={{ fontSize: 12 }}>Assignee: {ai.assignee}</div>}
                {ai.due_date && <div className="muted" style={{ fontSize: 12 }}>Due: {fmtDate(ai.due_date)}</div>}
              </div>
              <button onClick={() => {
                const idx = statusOptions.indexOf(ai.status);
                onUpdate(ai.id, statusOptions[(idx + 1) % statusOptions.length]);
              }} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                <Pill tone={toneMap[ai.status] || "gray"}>{ai.status}</Pill>
              </button>
            </div>
          ))}
        </div>
      )}
      {m.decisions.length > 0 && (
        <div className="card pad">
          <SectionTitle icon="check" title="Decisions" />
          {m.decisions.map((d) => (
            <div key={d.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span style={{ color: "var(--navy)" }}>{"\u2022"}</span>
              <div><span style={{ color: "var(--ink-2)" }}>{d.description}</span>{d.decided_by && <div className="muted" style={{ fontSize: 12 }}>By: {d.decided_by}</div>}</div>
            </div>
          ))}
        </div>
      )}
      {m.follow_ups.length > 0 && (
        <div className="card pad">
          <SectionTitle icon="download" title="Follow-Ups" />
          {m.follow_ups.map((f) => (
            <div key={f.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span style={{ color: "var(--navy)" }}>{"\u2022"}</span>
              <div><span style={{ color: "var(--ink-2)" }}>{f.description}</span>{f.owner && <div className="muted" style={{ fontSize: 12 }}>Owner: {f.owner}</div>}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecordingTab({ m, meetingId }: { m: MeetingDetail; meetingId: number }) {
  if (!m.recording) return <EmptyState icon="mic" title="No recording" body="This meeting has no audio or video recording." />;
  return (
    <div className="card pad">
      <SectionTitle icon="mic" title="Recording" />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="avatar md" style={{ background: "var(--navy)" }}><Icon name="mic" size={20} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>Audio recording</div>
          <div className="muted" style={{ fontSize: 13 }}>{m.recording.mime_type} {"·"} {fmtDuration(m.recording.duration_seconds)}</div>
        </div>
        <a className="btn outline" href={api.base + "/meetings/" + meetingId + "/recording"} target="_blank" rel="noreferrer"><Icon name="download" size={16} /> Download</a>
      </div>
    </div>
  );
}