import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { T } from "../theme/tokens";

// Renders rich HTML (from the CMS / rich editor) in an auto-height WebView.
// Plain-text content (no tags) is escaped and newlines become <br>.
function normalize(inner: string): string {
  const s = String(inner ?? "").trim();
  if (!s) return "";
  const looksHtml = /<(p|div|h[1-6]|br|ul|ol|li|img|iframe|embed|table|span|strong|b|em|i)\b/i.test(s);
  if (looksHtml) return s;
  const esc = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return "<p>" + esc.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br/>") + "</p>";
}

function wrapHtml(innerHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>
  html,body { margin:0; padding:0; background:transparent; }
  body { font-family:-apple-system,system-ui,"Segoe UI",Roboto,sans-serif; color:${T.ink};
         font-size:15px; line-height:1.6; padding:4px 2px 8px; word-wrap:break-word; }
  h1,h2,h3 { color:${T.ink}; line-height:1.25; }
  h2 { font-size:20px; margin:18px 0 8px; }
  h3 { font-size:17px; margin:14px 0 6px; }
  p { margin:0 0 12px; }
  img { max-width:100%; height:auto; border-radius:10px; margin:8px 0; }
  iframe { max-width:100%; border:0; border-radius:10px; }
  embed { max-width:100%; }
  a { color:${T.brandBlue}; }
  ul,ol { margin:0 0 12px; padding-left:22px; }
  li { margin:0 0 4px; }
  hr { border:none; height:1px; background:${T.line}; margin:16px 0; }
</style></head>
<body>${normalize(innerHtml)}
<script>
  function sendH(){ window.ReactNativeWebView.postMessage(String(document.body.scrollHeight)); }
  window.addEventListener("load", sendH);
  window.addEventListener("resize", sendH);
  setTimeout(sendH, 80);
  setTimeout(sendH, 400);
</script>
</body></html>`;
}

export const HtmlView: React.FC<{ html: string; style?: any }> = ({ html, style }) => {
  const [contentH, setContentH] = useState(0);
  const body = normalize(html);
  if (!body) return null;
  return (
    <View style={[styles.wrap, style]}>
      <WebView
        source={{ html: wrapHtml(html) }}
        scrollEnabled={false}
        javaScriptEnabled
        originWhitelist={["*"]}
        style={[styles.webview, { height: Math.max(contentH, 120) }]}
        onMessage={(e) => {
          const h = Number(e.nativeEvent.data);
          if (!Number.isNaN(h) && h > 0) setContentH(h);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { borderRadius: 12, overflow: "hidden", backgroundColor: T.surface },
  webview: { width: "100%", backgroundColor: "transparent" },
});