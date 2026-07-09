// Normalises stored description/body content for safe HTML rendering.
// - Content authored in the rich editor is HTML -> returned as-is.
// - Legacy plain-text content is escaped and newlines become <br>, wrapped in <p>.
export function richHtml(raw: string | null | undefined): string {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";
  const looksHtml = /<(p|div|h[1-6]|br|ul|ol|li|img|iframe|embed|table|span|strong|b|em|i)\b/i.test(s);
  if (looksHtml) return s;
  const esc = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return "<p>" + esc.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br/>") + "</p>";
}