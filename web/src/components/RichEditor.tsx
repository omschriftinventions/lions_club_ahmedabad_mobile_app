import React, { useEffect, useRef } from "react";
import { api } from "../lib/api";
import { Icon } from "./Icon";

// Reusable rich contentEditable editor (used by Manage History, Create Event,
// Publish News). Supports pasted HTML, pasted/inserted images (embedded as
// inline data URIs) and PDF upload -> inline Google Docs Viewer iframe.
export const RichEditor: React.FC<{
  value?: string;
  onChange: (html: string) => void;
  minHeight?: number;
  placeholder?: string;
}> = ({ value, onChange, minHeight = 220, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileImgRef = useRef<HTMLInputElement>(null);
  const filePdfRef = useRef<HTMLInputElement>(null);
  const loaded = useRef(false);

  // Load initial content once (when the saved value first arrives).
  useEffect(() => {
    if (value !== undefined && editorRef.current && !loaded.current) {
      editorRef.current.innerHTML = value || "";
      loaded.current = true;
    }
  }, [value]);

  const sync = () => onChange(editorRef.current?.innerHTML ?? "");

  const cmd = (command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    sync();
  };

  const insertHtml = (frag: string) => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, frag);
    sync();
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
    const imgItem = Array.from(cd.items).find((it) => it.type.startsWith("image/"));
    if (imgItem && !cd.getData("text/html")) {
      e.preventDefault();
      const f = imgItem.getAsFile();
      if (f) insertImageFile(f);
      return;
    }
    const pastedHtml = cd.getData("text/html");
    if (pastedHtml && pastedHtml.trim()) {
      e.preventDefault();
      insertHtml(pastedHtml);
      return;
    }
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) insertImageFile(file);
    e.target.value = "";
  };

  const onPickPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const d = await api.post<{ url: string }>("/content/upload-pdf", { file: String(reader.result) });
        const viewer = "https://docs.google.com/viewer?url=" + encodeURIComponent(d.url) + "&embedded=true";
        insertHtml(
          '<iframe src="' + viewer + '" style="width:100%;height:600px;border:0;border-radius:10px" allowfullscreen></iframe>' +
          '<p style="text-align:center;margin-top:8px"><a href="' + d.url + '" target="_blank" rel="noopener">Open PDF in new tab</a></p>'
        );
      } catch (err: any) {
        alert("PDF upload failed: " + (err?.message ?? "server not deployed yet"));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="rte-toolbar" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
        <button type="button" className="btn ghost sm" onClick={() => cmd("bold")} title="Bold"><b>B</b></button>
        <button type="button" className="btn ghost sm" onClick={() => cmd("italic")} title="Italic"><i>I</i></button>
        <button type="button" className="btn ghost sm" onClick={() => cmd("underline")} title="Underline"><u>U</u></button>
        <button type="button" className="btn ghost sm" onClick={() => cmd("formatBlock", "<H2>")} title="Heading">H2</button>
        <button type="button" className="btn ghost sm" onClick={() => cmd("formatBlock", "<H3>")} title="Subheading">H3</button>
        <button type="button" className="btn ghost sm" onClick={() => cmd("formatBlock", "<P>")} title="Paragraph">&para;</button>
        <button type="button" className="btn ghost sm" onClick={() => cmd("insertUnorderedList")} title="Bullet list">&bull; List</button>
        <button type="button" className="btn ghost sm" onClick={() => cmd("insertOrderedList")} title="Numbered list">1. List</button>
        <button type="button" className="btn ghost sm" onClick={() => { const u = prompt("Link URL:"); if (u) cmd("createLink", u); }} title="Insert link"><Icon name="link" size={16} /></button>
        <button type="button" className="btn ghost sm" onClick={() => fileImgRef.current?.click()} title="Insert image"><Icon name="image" size={16} /> Image</button>
        <button type="button" className="btn ghost sm" onClick={() => filePdfRef.current?.click()} title="Insert PDF (displays full PDF inline)"><Icon name="doc" size={16} /> PDF</button>
        <input ref={fileImgRef} type="file" accept="image/*" hidden onChange={onPickImage} />
        <input ref={filePdfRef} type="file" accept="application/pdf" hidden onChange={onPickPdf} />
      </div>
      <div
        ref={editorRef}
        className="rte-editor"
        contentEditable
        suppressContentEditableWarning
        onPaste={onPaste}
        onInput={sync}
        data-ph={placeholder ?? ""}
        style={{ minHeight, outline: "none", lineHeight: 1.6, color: "var(--ink)" }}
      />
    </div>
  );
};