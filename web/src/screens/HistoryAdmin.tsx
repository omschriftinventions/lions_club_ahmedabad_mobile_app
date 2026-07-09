import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Icon } from "../components/Icon";
import { RichEditor } from "../components/RichEditor";

// CMS editor for the History page. Published HTML is stored server-side and
// shown to all members on the History page (web + mobile).

export default function HistoryAdmin() {
  const { member } = useAuth();
  const [html, setHtml] = useState<string>("");
  const [loadedHtml, setLoadedHtml] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const d = await api.get<{ html: string }>("/content/history");
        setHtml(d.html || "");
        setLoadedHtml(d.html || "");
      } catch (e: any) {
        setMsg({ tone: "err", text: "Could not load: " + (e?.message ?? "server not deployed yet") });
        setLoadedHtml("");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await api.put("/content/history", { html });
      setMsg({ tone: "ok", text: "Saved. Members now see the updated History page." });
    } catch (e: any) {
      setMsg({ tone: "err", text: "Save failed: " + (e?.message ?? "server not deployed yet") });
    } finally {
      setSaving(false);
    }
  };

  if (!member?.superAdmin) {
    return (
      <>
        <div className="page-head"><div><h1>Manage History</h1><div className="sub">CMS</div></div></div>
        <div className="card pad" style={{ maxWidth: 720 }}>
          <p style={{ color: "var(--muted)" }}>Only super admins can manage the History page.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Manage History</h1>
          <div className="sub">Rich content &middot; published to all members on the History page</div>
        </div>
        <button className="btn" onClick={save} disabled={saving || loading}>
          <Icon name="check" size={16} /> {saving ? "Saving\u2026" : "Publish"}
        </button>
      </div>

      <div className="card pad" style={{ maxWidth: 880 }}>
        <RichEditor value={loadedHtml} onChange={setHtml} minHeight={360} placeholder="Write the club history\u2026" />
        {msg && (
          <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, fontSize: 13,
            background: msg.tone === "ok" ? "rgba(46,160,67,.1)" : "rgba(220,38,38,.08)",
            color: msg.tone === "ok" ? "#1e7a36" : "var(--danger, #b3261e)" }}>
            {msg.text}
          </div>
        )}
        {loading && <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 10 }}>Loading current content\u2026</div>}
      </div>
    </>
  );
}