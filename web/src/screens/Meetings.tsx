import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Icon } from "../components/Icon";
import { Spinner, EmptyState, Pill } from "../components/ui";

interface MeetingItem {
  id: number;
  title: string;
  meeting_date: string | null;
  location: string | null;
  duration_seconds: number;
  status: string;
  meeting_type: string | null;
  meeting_mood: string | null;
  created_at: string;
}

const STATUS_TONE: Record<string, "gray" | "gold" | "green" | "blue" | "red"> = {
  recording: "gold",
  uploaded: "blue",
  transcribing: "blue",
  transcribed: "blue",
  summarizing: "blue",
  summarized: "green",
  failed: "red",
};

function fmtDuration(sec: number): string {
  if (!sec) return "--";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h) return h + "h " + m + "m";
  if (m) return m + "m " + s + "s";
  return s + "s";
}

export default function Meetings() {
  const nav = useNavigate();
  const { member } = useAuth();
  const [search, setSearch] = useState("");
  const canEdit = member?.canEdit || member?.superAdmin;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["meetings", search],
    queryFn: () => api.get<{ meetings: MeetingItem[]; total: number }>("/meetings?limit=100" + (search ? "&search=" + encodeURIComponent(search) : "")),
  });

  return (
    <>
      <div className="page-head" style={{ marginBottom: 16 }}>
        <div>
          <h2>AI Meeting Assistant</h2>
          <div className="muted">Record, transcribe, and generate AI summaries of club meetings</div>
        </div>
        {canEdit && (
          <div className="btn-row">
            <button className="btn outline" onClick={() => nav("/meetings/upload")}><Icon name="upload" size={16} /> Upload Recording</button>
            <button className="btn primary" onClick={() => nav("/meetings/record")}><Icon name="mic" size={16} /> Record Meeting</button>
          </div>
        )}
      </div>

      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="search-bar">
          <Icon name="search" size={18} />
          <input
            type="text"
            placeholder="Search meetings by title, location, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14 }}
          />
          {search && <button className="btn ghost sm" onClick={() => setSearch("")}>Clear</button>}
        </div>
      </div>

      {isLoading ? <Spinner /> :
        (data?.meetings.length ?? 0) === 0 ? (
          <div className="card pad">
            <EmptyState icon="mic" title="No meetings yet" body={canEdit ? "Record a meeting or upload an audio file to get started." : "Meetings will appear here once recorded."} />
          </div>
        ) : (
          <div className="card">
            {data?.meetings.map((m) => (
              <div key={m.id} className="list-row clickable" onClick={() => nav("/meetings/" + m.id)}>
                <div className="avatar md" style={{ background: "var(--navy)" }}>
                  <Icon name="mic" size={18} />
                </div>
                <div className="meta">
                  <div className="title">{m.title}</div>
                  <div className="sub">
                    {m.meeting_date ? m.meeting_date + " \u00b7 " : ""}
                    {fmtDuration(m.duration_seconds)}
                    {m.location ? " \u00b7 " + m.location : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {m.meeting_type && <Pill tone="green">{m.meeting_type}</Pill>}
                  {m.meeting_mood && m.status === "summarized" && <Pill tone="gold">{m.meeting_mood}</Pill>}
                  <Pill tone={STATUS_TONE[m.status] || "gray"}>{m.status}</Pill>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </>
  );
}