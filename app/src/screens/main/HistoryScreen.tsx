import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { api } from "../../lib/api";
import { T } from "../../theme/tokens";

// Static fallback shown only while the admin hasn't published CMS content
// (or the server /content route isn't deployed yet).
const FALLBACK: { title: string; paragraphs: string[] }[] = [
  { title: "Our Beginning", paragraphs: ["The history of Lions Club of Ahmedabad Host will appear here once an admin publishes it from the web admin (Manage History)."] },
];

// Wraps the CMS HTML in a full document so WebView renders it with sane styling
// and reports its measured height back to RN for auto-sizing.
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
  a { color:${T.brandBlue}; }
  ul,ol { margin:0 0 12px; padding-left:22px; }
  li { margin:0 0 4px; }
  hr { border:none; height:1px; background:${T.line}; margin:16px 0; }
</style></head>
<body>${innerHtml}
<script>
  function sendH(){ window.ReactNativeWebView.postMessage(String(document.body.scrollHeight)); }
  window.addEventListener("load", sendH);
  window.addEventListener("resize", sendH);
  setTimeout(sendH, 80);
  setTimeout(sendH, 400);
</script>
</body></html>`;
}

export default function HistoryScreen() {
  const nav = useNavigation<any>();
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [contentH, setContentH] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api.get<{ html: string }>("/content/history")
      .then((d) => { if (!cancelled) setHtml(d.html || ""); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  const showFallback = failed || (html !== null && !html.trim());

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: "row", padding: 16, alignItems: "center", gap: 12 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={T.ink} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: "700", color: T.ink }}>History</Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: T.ink, letterSpacing: -0.4 }}>Our History</Text>
        <Text style={{ color: T.inkMute, marginTop: 4 }}>Lions Club of Ahmedabad Host (Main)</Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 28 }}>
        {html === null && !failed ? (
          <View style={{ padding: 24, alignItems: "center" }}>
            <ActivityIndicator color={T.brandBlue} />
          </View>
        ) : showFallback ? (
          <View style={{ gap: 12 }}>
            {FALLBACK.map((s, i) => (
              <Card key={i}>
                <Text style={styles.sectionTitle}>{s.title}</Text>
                {s.paragraphs.map((p, j) => (
                  <Text key={j} style={styles.paragraph}>{p}</Text>
                ))}
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.webviewWrap}>
            <WebView
              source={{ html: wrapHtml(html!) }}
              scrollEnabled={false}
              javaScriptEnabled
              originWhitelist={["*"]}
              style={[styles.webview, { height: Math.max(contentH, 240) }]}
              onMessage={(e) => {
                const h = Number(e.nativeEvent.data);
                if (!Number.isNaN(h) && h > 0) setContentH(h);
              }}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 17, fontWeight: "800", color: T.ink, marginBottom: 8 },
  paragraph: { color: T.inkSoft, fontSize: 14.5, lineHeight: 22, marginTop: 6 },
  webviewWrap: { borderRadius: 12, overflow: "hidden", backgroundColor: T.surface },
  webview: { width: "100%", backgroundColor: "transparent" },
});