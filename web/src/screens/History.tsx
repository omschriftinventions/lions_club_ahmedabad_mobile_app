import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

// Static fallback shown only if the admin hasn't published CMS content yet.
const FALLBACK: { title: string; paragraphs: string[] }[] = [
  { title: "Our Beginning", paragraphs: ["The history of Lions Club of Ahmedabad Host will appear here once an admin publishes it."] },
];

export default function History() {
  const [html, setHtml] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api.get<{ html: string }>("/content/history")
      .then((d) => setHtml(d.html || ""))
      .catch(() => { setErr(true); setHtml(""); });
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>History</h1>
          <div className="sub">Lions Club Ahmedabad Host</div>
        </div>
      </div>

      <div style={{ maxWidth: 760 }}>
        {html === null ? (
          <div className="card pad" style={{ color: "var(--muted)" }}>Loading…</div>
        ) : html.trim() ? (
          <div className="card pad">
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        ) : err ? (
          FALLBACK.map((s, i) => (
            <div key={i} className="card pad" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, marginBottom: 10 }}>{s.title}</h2>
              <div className="prose">{s.paragraphs.map((p, j) => <p key={j}>{p}</p>)}</div>
            </div>
          ))
        ) : (
          <div className="card pad" style={{ color: "var(--muted)" }}>No history published yet.</div>
        )}
      </div>
    </>
  );
}