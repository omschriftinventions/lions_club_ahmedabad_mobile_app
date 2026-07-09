import React, { useEffect, useRef, useState } from "react";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Icon } from "../components/Icon";

// CMS editor for the History page. Rich contentEditable that accepts pasted
// HTML, pasted/inserted images (embedded as data URIs) and PDF text imports.
// Saved HTML is stored server-side and shown to all members on the History page.

export default function HistoryAdmin() {
  const { member } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileImgRef = useRef<HTMLInputElement>(null);
  const filePdfRef = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await api.get<{ html: string }>("/content/history");
      if (editorRef.current && !loaded) editorRef.current.innerHTML = d.html || "";
      setHtml(d.html || "");
      setLoaded(true);
    } catch (e: any) {
      setMsg({ tone: "err", text: "Could not load: " + (e?.message ?? "server not deployed yet") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const syncHtml = () => setHtml(editorRef.current?.innerHTML ?? "");

  const cmd = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncHtml();
  };

  const insertHtml = (frag: string) => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, frag);
    syncHtml();
  };

  const insertImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      insertHtml(`<img src="${src}" alt="" style="max-width:100%;height:auto;border-radius:10px;margin:8px 0" />`);
    };
    reader.readAsDataURL(file);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const cd = e.clipboardData;
    // Pasted image (screenshot) → embed as data URI
    const imgItem = Array.from(cd.items).find((it) => it.type.startsWith("image/"));
    if (imgItem && !cd.getData("text/html")) {
      e.preventDefault();
      const f = imgItem.getAsFile();
      if (f) insertImageFile(f);
      return;
    }
    // Rich HTML paste — preserve formatting + inline images from the source
    const pastedHtml = cd.getData("text/html");
    if (pastedHtml && pastedHtml.trim()) {
      e.preventDefault();
      insertHtml(pastedHtml);
      return;
    }
    // else: let the browser do a plain-text paste
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) insertImageFile(file);
    e.target.value = "";
  };

  const onPickPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMsg({ tone: "ok", text: "Importing PDF text…" });
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const d = await api.post<{ html: string }>("/content/import-pdf", { file: String(reader.result) });
          insertHtml(d.html);
          setMsg({ tone: "ok", text: "PDF text imported. Images inside the PDF are not extracted — add them with Insert image." });
        } catch (err: any) {
          setMsg({ tone: "err", text: "PDF import failed: " + (err?.message ?? "server not deployed yet") });
        }
      };
      reader.onerror = () => setMsg({ tone: "err", text: "Could not read PDF file" });
      reader.readAsDataURL(file);
    } catch (err: any) {
      setMsg({ tone: "err", text: "PDF import failed: " + (err?.message ?? "") });
    }
  };

  const save = async () => {
    const out = editorRef.current?.innerHTML ?? "";
    setHtml(out);
    setSaving(true);
    setMsg(null);
    try {
      await api.put("/content/history", { html: out });
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
          <div className="sub">Rich content · published to all members on the History page</div>
        </div>
        <button className="btn" onClick={save} disabled={saving || loading}>
          <Icon name="check" size={16} /> {saving ? "Saving…" : "Publish"}
        </button>
      </div>

      <div className="card pad" style={{ maxWidth: 880 }}>
        {/* Toolbar */}
        <div className="rte-toolbar" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
          <button className="btn ghost sm" type="button" onClick={() => cmd("bold")} title="Bold"><b>B</b></button>
          <button className="btn ghost sm" type="button" onClick={() => cmd("italic")} title="Italic"><i>I</i></button>
          <button className="btn ghost sm" type="button" onClick={() => cmd("underline")} title="Underline"><u>U</u></button>
          <button className="btn ghost sm" type="button" onClick={() => cmd("formatBlock", "<H2>")} title="Heading">H2</button>
          <button className="btn ghost sm" type="button" onClick={() => cmd("formatBlock", "<H3>")} title="Subheading">H3</button>
          <button className="btn ghost sm" type="button" onClick={() => cmd("formatBlock", "<P>")} title="Paragraph">¶</button>
          <button className="btn ghost sm" type="button" onClick={() => cmd("insertUnorderedList")} title="Bullet list">• List</button>
          <button className="btn ghost sm" type="button" onClick={() => cmd("insertOrderedList")} title="Numbered list">1. List</button>
          <button className="btn ghost sm" type="button" onClick={() => { const u = prompt("Link URL:"); if (u) cmd("createLink", u); }} title="Insert link"><Icon name="link" size={16} /></button>
          <button className="btn ghost sm" type="button" onClick={() => fileImgRef.current?.click()} title="Insert image"><Icon name="image" size={16} /> Image</button>
          <button className="btn ghost sm" type="button" onClick={() => filePdfRef.current?.click()} title="Import PDF text"><Icon name="doc" size={16} /> PDF</button>
          <input ref={fileImgRef} type="file" accept="image/*" hidden onChange={onPickImage} />
          <input ref={filePdfRef} type="file" accept="application/pdf" hidden onChange={onPickPdf} />
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          className="rte-editor"
          contentEditable
          suppressContentEditableWarning
          onPaste={onPaste}
          onInput={syncHtml}
          style={{ minHeight: 360, outline: "none", lineHeight: 1.6, color: "var(--ink)" }}
        />

        {msg && (
          <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, fontSize: 13,
            background: msg.tone === "ok" ? "rgba(46,160,67,.1)" : "rgba(220,38,38,.08)",
            color: msg.tone === "ok" ? "#1e7a36" : "var(--danger, #b3261e)" }}>
            {msg.text}
          </div>
        )}
        {loading && <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 10 }}>Loading current content…</div>}
      </div>
    </>
  );
}