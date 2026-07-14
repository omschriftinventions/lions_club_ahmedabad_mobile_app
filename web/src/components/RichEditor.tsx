import React, { useEffect, useRef } from "react";
import { api } from "../lib/api";
import { Icon } from "./Icon";

// pt / cm / in → px (96 dpi). Word sizes images in pt or cm.
function toPx(v: string): number | null {
  const m = v.trim().match(/^([\d.]+)\s*(pt|cm|mm|in|px)?$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  switch ((m[2] || "px").toLowerCase()) {
    case "pt": return Math.round(n * 96 / 72);
    case "cm": return Math.round(n * 96 / 2.54);
    case "mm": return Math.round(n * 96 / 25.4);
    case "in": return Math.round(n * 96);
    default: return Math.round(n);
  }
}

// Style properties worth keeping from Word/Docs paste (alignment, colour,
// bold/italic, background, borders...). Everything else (mso-*, tab-stops,
// positioning) is dropped.
const KEEP_STYLE = /^(text-align|text-decoration|font-weight|font-style|font-size|color|background(-color)?|vertical-align|list-style(-type)?|border[a-z-]*|padding[a-z-]*|width|height|max-width)$/i;

// Strip Word/Google-Docs cruft, rewire pasted images to uploaded URLs, keep
// alignment + basic formatting, preserve image sizes. Async because embedded
// base64 images are uploaded to the server. `clipboardUrls` = uploaded clipboard
// images in order (used to fill dead file:// refs).
async function cleanPastedHtml(
  rawHtml: string,
  clipboardUrls: string[],
  uploadImage: (dataUrl: string) => Promise<string>,
): Promise<string> {
  // Kill Word conditional comments + xml islands before DOM parse.
  let html = rawHtml
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<xml[\s\S]*?<\/xml>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<o:p\b[^>]*>[\s\S]*?<\/o:p>/gi, "")
    .replace(/<o:p\b[^>]*\/?>/gi, "");

  const doc = new DOMParser().parseFromString(html, "text/html");
  const imgQueue = [...clipboardUrls];

  // Rewire VML images (<v:imagedata src>) — replace their shape wrapper with a real <img>.
  doc.querySelectorAll("v\\:imagedata, imagedata").forEach((vml) => {
    const img = doc.createElement("img");
    const shape = vml.closest("v\\:shape, shape") || vml;
    const dataUrlAttr = (vml.getAttribute("src") || "").startsWith("data:") ? vml.getAttribute("src")! : "";
    const url = dataUrlAttr || imgQueue.shift();
    if (url) { img.setAttribute("src", url); shape.replaceWith(img); }
    else shape.remove();
  });

  // Resolve every <img>: keep data:/http srcs, fill dead file:// from clipboard,
  // upload embedded base64 to keep stored HTML small, and preserve size.
  const imgs = Array.from(doc.querySelectorAll("img"));
  for (const img of imgs) {
    let src = img.getAttribute("src") || "";
    const dead = !src || /^(file:|blob:|cid:|about:)/i.test(src) || /^data:image\/svg/i.test(src);
    if (dead) {
      const url = imgQueue.shift();
      if (url) src = url; else { img.remove(); continue; }
    }
    if (/^data:image\//i.test(src) && !/^data:image\/svg/i.test(src)) {
      src = await uploadImage(src); // → server URL (falls back to data: on failure)
    }
    img.setAttribute("src", src);

    // Preserve intended size from width/height attrs or inline style.
    const styleW = img.style.width, styleH = img.style.height;
    const attrW = img.getAttribute("width"), attrH = img.getAttribute("height");
    const wPx = styleW ? toPx(styleW) : attrW ? toPx(attrW) : null;
    const hPx = styleH ? toPx(styleH) : attrH ? toPx(attrH) : null;
    img.removeAttribute("width"); img.removeAttribute("height");
    const parts: string[] = ["max-width:100%", "height:auto", "border-radius:8px", "margin:8px 0"];
    if (wPx) parts.unshift(`width:${wPx}px`);
    if (hPx && !wPx) parts.push(`height:${hPx}px`);
    img.setAttribute("style", parts.join(";"));
    img.setAttribute("alt", img.getAttribute("alt") || "");
  }

  // Clean every element: drop Word namespaces, keep alignment + basic styles.
  doc.body.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (el.tagName === "IMG") return;
    // unwrap Word/xml namespaced elements (keep their children)
    if (/^(o|w|v|m|st1):/i.test(el.tagName)) {
      const parent = el.parentNode;
      while (el.firstChild) parent?.insertBefore(el.firstChild, el);
      el.remove();
      return;
    }
    // Word alignment sometimes lives on an align="" attribute — convert to style.
    const alignAttr = el.getAttribute("align");
    el.removeAttribute("class");
    el.removeAttribute("lang");
    el.removeAttribute("align");
    for (const a of Array.from(el.attributes)) {
      if (/^(xmlns|v|o|w|m):/i.test(a.name) || a.name.startsWith("data-mce")) el.removeAttribute(a.name);
    }
    const style = el.getAttribute("style");
    const kept: string[] = [];
    if (style) {
      style.split(";").forEach((decl) => {
        const [propRaw, ...rest] = decl.split(":");
        const prop = (propRaw || "").trim();
        const val = rest.join(":").trim();
        if (prop && val && KEEP_STYLE.test(prop) && !/^mso-/i.test(prop)) kept.push(`${prop}:${val}`);
      });
    }
    if (alignAttr && !kept.some((s) => /^text-align/i.test(s))) kept.push(`text-align:${alignAttr}`);
    if (kept.length) el.setAttribute("style", kept.join(";")); else el.removeAttribute("style");

    if (el.tagName === "P" && !el.textContent?.trim() && !el.querySelector("img")) el.remove();
  });

  return doc.body.innerHTML;
}

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
  const savedRange = useRef<Range | null>(null);

  // Remember the caret/selection so we can insert correctly even after async
  // work (image uploads) — execCommand("insertHTML") silently fails once the
  // paste event has returned, so we insert via the Range API instead.
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    } else {
      savedRange.current = null;
    }
  };

  // Insert an HTML fragment at the saved selection (or append to end). Works
  // synchronously OR after an await, unlike document.execCommand.
  const insertHtmlAtSaved = (html: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    let range = savedRange.current;
    if (!range || !editor.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false); // end
    }
    range.deleteContents();
    const frag = range.createContextualFragment(html);
    const lastNode = frag.lastChild;
    range.insertNode(frag);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
      savedRange.current = range.cloneRange();
    }
    sync();
  };

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

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  // Upload an image data-URL to the server, return a public URL.
  // Falls back to the inline data-URL if the upload fails (keeps paste working
  // even before the endpoint is deployed).
  const uploadImage = async (dataUrl: string): Promise<string> => {
    try {
      const d = await api.post<{ url: string }>("/content/upload-image", { file: dataUrl });
      return d.url;
    } catch {
      return dataUrl;
    }
  };

  const insertImageFile = async (file: File) => {
    saveSelection();
    const dataUrl = await fileToDataUrl(file);
    const url = await uploadImage(dataUrl);
    insertHtmlAtSaved(`<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:10px;margin:8px 0" />`);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const cd = e.clipboardData;
    const html = cd.getData("text/html");
    const imageFiles = collectImageFiles(cd);

    // Capture caret BEFORE any async work so we can insert at the right spot.
    saveSelection();

    // Plain image paste (screenshot / single image, no HTML)
    if (imageFiles.length && !html) {
      e.preventDefault();
      insertImageFile(imageFiles[0]);
      return;
    }

    // Rich HTML paste (Word 365, Google Docs, web pages)
    if (html && html.trim()) {
      e.preventDefault();
      handleRichPaste(html, imageFiles);
      return;
    }
    // else: let the browser handle plain-text paste natively
  };

  // Gather every image on the clipboard (both items[] and files[]), de-duped.
  const collectImageFiles = (cd: DataTransfer): File[] => {
    const out: File[] = [];
    const seen = new Set<string>();
    const push = (f: File | null) => {
      if (!f || !f.type.startsWith("image/")) return;
      const key = f.name + ":" + f.size;
      if (seen.has(key)) return;
      seen.add(key); out.push(f);
    };
    Array.from(cd.items || []).forEach((it) => { if (it.kind === "file" && it.type.startsWith("image/")) push(it.getAsFile()); });
    Array.from(cd.files || []).forEach((f) => push(f));
    return out;
  };

  const handleRichPaste = async (rawHtml: string, imageFiles: File[]) => {
    // 1. Upload each clipboard image → URL, in clipboard order.
    const uploaded: string[] = [];
    for (const f of imageFiles) {
      const dataUrl = await fileToDataUrl(f);
      uploaded.push(await uploadImage(dataUrl));
    }
    // 2. Upload any base64 data: images already embedded in the pasted HTML
    //    (Edge/Word often inline images this way) so the stored HTML stays small.
    const clean = await cleanPastedHtml(rawHtml, uploaded, uploadImage);
    insertHtmlAtSaved(clean);
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    saveSelection();
    if (file) insertImageFile(file);
    e.target.value = "";
  };

  const onPickPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    saveSelection();
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const d = await api.post<{ url: string }>("/content/upload-pdf", { file: String(reader.result) });
        const viewer = "https://docs.google.com/viewer?url=" + encodeURIComponent(d.url) + "&embedded=true";
        insertHtmlAtSaved(
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