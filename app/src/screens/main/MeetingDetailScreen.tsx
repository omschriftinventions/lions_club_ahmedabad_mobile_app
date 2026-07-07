import React, { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Share, TextInput, Linking } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Pill } from "../../components/Pill";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { api } from "../../lib/api";
import { T } from "../../theme/tokens";

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

function fmtDuration(sec: number): string {
  if (!sec) return "--";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h) return h + "h " + m + "m";
  if (m) return m + "m " + s + "s";
  return s + "s";
}

function parseJSON(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") { try { return JSON.parse(val); } catch { return []; } }
  return [];
}

export default function MeetingDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const meetingId = route.params?.id as number;
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("summary");
  const [processing, setProcessing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => api.get<{ meeting: MeetingDetail }>("/meetings/" + meetingId),
  });

  const m = data?.meeting;

  const transcribe = async () => {
    setProcessing(true);
    try {
      await api.post("/meetings/" + meetingId + "/transcribe");
      Alert.alert("Transcription complete", "You can now generate an AI summary.");
      refetch();
    } catch (e: any) {
      Alert.alert("Transcription failed", e?.message || "Could not transcribe audio");
    } finally {
      setProcessing(false);
    }
  };

  const summarize = async () => {
    setProcessing(true);
    try {
      await api.post("/meetings/" + meetingId + "/summarize");
      Alert.alert("Summary generated", "AI summary is ready.");
      refetch();
    } catch (e: any) {
      Alert.alert("Summary failed", e?.message || "Could not generate summary");
    } finally {
      setProcessing(false);
    }
  };

  const processAll = async () => {
    setProcessing(true);
    try {
      await api.post("/meetings/" + meetingId + "/process");
      Alert.alert("Processing complete", "Transcript and summary are ready.");
      refetch();
    } catch (e: any) {
      Alert.alert("Processing failed", e?.message || "Could not process meeting");
    } finally {
      setProcessing(false);
    }
  };

  const shareSummary = async () => {
    if (!m?.summary) return;
    const s = m.summary;
    let text = "Lions Club Meeting Summary\n" + m.title + "\n";
    if (m.meeting_date) text += "Date: " + m.meeting_date + "\n";
    text += "\nExecutive Summary:\n" + (s.executive_summary || "N/A") + "\n";
    const actions = parseJSON(s.action_items);
    if (actions.length) {
      text += "\nAction Items:\n";
      actions.forEach((a: any, i: number) => {
        text += (i + 1) + ". " + a.description;
        if (a.assignee) text += " (" + a.assignee + ")";
        text += "\n";
      });
    }
    const decisions = parseJSON(s.decisions);
    if (decisions.length) {
      text += "\nDecisions:\n";
      decisions.forEach((d: any, i: number) => {
        text += (i + 1) + ". " + d.description + "\n";
      });
    }
    try {
      await Share.share({ message: text });
    } catch {}
  };

  const downloadPDF = async () => {
    const url = api.base + "/meetings/" + meetingId + "/pdf";
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Cannot open", "Could not open PDF. Make sure you are logged in on the web app.");
    }
  };

  const shareTranscript = async () => {
    if (!m?.transcript?.full_text) return;
    try {
      await Share.share({
        message: "Transcript: " + m.title + "\n\n" + m.transcript.full_text,
      });
    } catch {}
  };

  const updateActionStatus = async (itemId: number, status: string) => {
    try {
      await api.patch("/meetings/" + meetingId + "/action-items/" + itemId, { status });
      refetch();
    } catch (e: any) {
      Alert.alert("Update failed", e?.message);
    }
  };

  const deleteMeeting = () => {
    Alert.alert("Delete meeting", "Are you sure you want to delete this meeting and all its data?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await api.delete("/meetings/" + meetingId);
          nav.goBack();
        }
      }
    ]);
  };

  if (isLoading) return <Screen bg={T.bg}><View style={{ paddingTop: 80, alignItems: "center" }}><Text style={{ color: T.inkMute }}>Loading...</Text></View></Screen>;
  if (error || !m) return <Screen bg={T.bg}><View style={{ paddingTop: 80 }}><ErrorState title="Could not load meeting" onRetry={() => refetch()} /></View></Screen>;

  const hasRecording = !!m.recording;
  const hasTranscript = !!m.transcript;
  const hasSummary = !!m.summary;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "summary", label: "Summary", icon: "document-text" },
    { key: "transcript", label: "Transcript", icon: "chatbox" },
    { key: "actions", label: "Actions", icon: "checkbox" },
    { key: "recording", label: "Recording", icon: "mic" },
  ];

  return (
    <Screen bg={T.bg}>
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
            <Pressable onPress={() => nav.goBack()} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color={T.ink} />
            </Pressable>
            <Text style={{ fontSize: T.fs.h3, fontWeight: "800", color: T.ink, flex: 1 }} numberOfLines={1}>{m.title}</Text>
          </View>
          <Pressable onPress={deleteMeeting} hitSlop={12}>
            <Ionicons name="trash-outline" size={20} color={T.danger} />
          </Pressable>
        </View>

        {/* Meta row */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <Pill label={m.status} color={T.brandBlue} />
          {m.meeting_date && <Pill label={m.meeting_date} color={T.info} />}
          {m.duration_seconds > 0 && <Pill label={fmtDuration(m.duration_seconds)} color={T.inkMute} />}
          {m.meeting_mood && <Pill label={m.meeting_mood} color={T.warning} />}
          {m.meeting_type && <Pill label={m.meeting_type} color={T.success} />}
        </View>
      </View>

      {/* Action buttons based on status */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
        {hasRecording && !hasTranscript && (
          <Button label={processing ? "Transcribing..." : "Transcribe Audio"} onPress={transcribe} loading={processing} variant="primary" />
        )}
        {hasTranscript && !hasSummary && (
          <Button label={processing ? "Generating summary..." : "Generate AI Summary"} onPress={summarize} loading={processing} variant="gold" />
        )}
        {hasRecording && !hasTranscript && !hasSummary && (
          <View style={{ marginTop: 8 }}>
            <Button label={processing ? "Processing..." : "Transcribe + Summarize (one step)"} onPress={processAll} loading={processing} variant="outline" />
          </View>
        )}
        {hasSummary && (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable onPress={shareSummary} style={styles.shareBtn}>
              <Ionicons name="share-outline" size={18} color={T.brandBlue} />
              <Text style={styles.shareBtnText}>Share Summary</Text>
            </Pressable>
            <Pressable onPress={shareTranscript} style={[styles.shareBtn, { flex: 1 }]}>
              <Ionicons name="share-outline" size={18} color={T.brandBlue} />
              <Text style={styles.shareBtnText}>Share Transcript</Text>
            </Pressable>
            <Pressable onPress={downloadPDF} style={[styles.shareBtn, { flex: 1 }]}>
              <Ionicons name="document-text-outline" size={18} color={T.brandBlue} />
              <Text style={styles.shareBtnText}>PDF Report</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.tab, tab === t.key && { borderBottomColor: T.brandBlue, borderBottomWidth: 2.5 }]}
          >
            <Ionicons name={t.icon as any} size={16} color={tab === t.key ? T.brandBlue : T.inkMute} />
            <Text style={{ fontSize: 11, fontWeight: "700", color: tab === t.key ? T.brandBlue : T.inkMute, marginLeft: 4 }}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Tab content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {tab === "summary" && (
          <SummaryTab meeting={m} />
        )}
        {tab === "transcript" && (
          <TranscriptTab meeting={m} />
        )}
        {tab === "actions" && (
          <ActionsTab meeting={m} onUpdateStatus={updateActionStatus} />
        )}
        {tab === "recording" && (
          <RecordingTab meeting={m} />
        )}
      </ScrollView>
    </Screen>
  );
}

// ── Summary Tab ──
function SummaryTab({ meeting }: { meeting: MeetingDetail }) {
  if (!meeting.summary) {
    return <EmptyState icon="document-text-outline" title="No summary yet" body="Generate an AI summary after transcribing the meeting." />;
  }
  const s = meeting.summary;
  const keyDiscussions = parseJSON(s.key_discussions);
  const risks = parseJSON(s.risks);
  const topics = parseJSON(s.topics);
  const nextMeeting = s.next_meeting ? (typeof s.next_meeting === "string" ? JSON.parse(s.next_meeting) : s.next_meeting) : null;

  return (
    <View style={{ paddingTop: 12 }}>
      {s.executive_summary && (
        <Card style={{ marginBottom: 12 }}>
          <SectionHeader icon="reader" title="Executive Summary" />
          <Text style={styles.bodyText}>{s.executive_summary}</Text>
        </Card>
      )}
      {keyDiscussions.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <SectionHeader icon="chatbubbles" title="Key Discussions" />
          {keyDiscussions.map((d: string, i: number) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>{"\u2022"}</Text>
              <Text style={styles.bodyText}>{d}</Text>
            </View>
          ))}
        </Card>
      )}
      {meeting.decisions.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <SectionHeader icon="checkmark-done" title="Decisions" />
          {meeting.decisions.map((d) => (
            <View key={d.id} style={styles.bulletRow}>
              <Text style={styles.bullet}>{"\u2022"}</Text>
              <Text style={styles.bodyText}>{d.description}{d.decided_by ? " (" + d.decided_by + ")" : ""}</Text>
            </View>
          ))}
        </Card>
      )}
      {meeting.follow_ups.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <SectionHeader icon="arrow-redo" title="Follow-Ups" />
          {meeting.follow_ups.map((f) => (
            <View key={f.id} style={styles.bulletRow}>
              <Text style={styles.bullet}>{"\u2022"}</Text>
              <Text style={styles.bodyText}>{f.description}{f.owner ? " (" + f.owner + ")" : ""}</Text>
            </View>
          ))}
        </Card>
      )}
      {risks.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <SectionHeader icon="warning" title="Risks" color={T.danger} />
          {risks.map((r: string, i: number) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={[styles.bullet, { color: T.danger }]}>{"\u2022"}</Text>
              <Text style={styles.bodyText}>{r}</Text>
            </View>
          ))}
        </Card>
      )}
      {topics.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <SectionHeader icon="pricetags" title="Topics" />
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {topics.map((t: string, i: number) => <Pill key={i} label={t} color={T.info} />)}
          </View>
        </Card>
      )}
      {nextMeeting && (
        <Card style={{ marginBottom: 12 }}>
          <SectionHeader icon="calendar" title="Next Meeting" />
          <Text style={styles.bodyText}>{nextMeeting.suggestion || JSON.stringify(nextMeeting)}</Text>
        </Card>
      )}
      {s.model_used && (
        <Text style={{ fontSize: T.fs.caption, color: T.inkFaint, textAlign: "center", marginTop: 8 }}>
          Generated with {s.model_used}
        </Text>
      )}
    </View>
  );
}

// ── Transcript Tab ──
function TranscriptTab({ meeting }: { meeting: MeetingDetail }) {
  const [searchQ, setSearchQ] = useState("");
  if (!meeting.transcript) {
    return <EmptyState icon="chatbox-outline" title="No transcript yet" body="Transcribe the meeting audio to see the text here." />;
  }
  const fullText = meeting.transcript.full_text;
  const wordCount = meeting.transcript.word_count;

  // Highlight search results by splitting text
  let displayText = fullText;
  if (searchQ.trim()) {
    // Simple: just show matching lines
    const lines = fullText.split("\n");
    const matches = lines.filter((l) => l.toLowerCase().includes(searchQ.toLowerCase()));
    displayText = matches.length ? matches.join("\n") : fullText;
  }

  return (
    <View style={{ paddingTop: 12 }}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={T.inkFaint} style={{ marginLeft: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transcript..."
          placeholderTextColor={T.inkFaint}
          value={searchQ}
          onChangeText={setSearchQ}
        />
      </View>
      <Text style={{ fontSize: T.fs.caption, color: T.inkMute, marginVertical: 8 }}>{wordCount} words</Text>
      <Card>
        <ScrollView style={{ maxHeight: 400 }}>
          <Text style={styles.transcriptText}>{displayText}</Text>
        </ScrollView>
      </Card>
    </View>
  );
}

// ── Actions Tab ──
function ActionsTab({ meeting, onUpdateStatus }: { meeting: MeetingDetail; onUpdateStatus: (id: number, status: string) => void }) {
  if (meeting.action_items.length === 0 && meeting.decisions.length === 0 && meeting.follow_ups.length === 0) {
    return <EmptyState icon="checkbox-outline" title="No action items" body="Generate an AI summary to extract action items, decisions, and follow-ups." />;
  }
  const statusOptions = ["open", "in_progress", "done", "deferred"];
  const statusColors: Record<string, string> = { open: T.warning, in_progress: T.info, done: T.success, deferred: T.inkMute };

  return (
    <View style={{ paddingTop: 12 }}>
      {meeting.action_items.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <SectionHeader icon="checkbox" title="Action Items" />
          {meeting.action_items.map((ai) => (
            <View key={ai.id} style={styles.actionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bodyText}>{ai.description}</Text>
                {ai.assignee && <Text style={styles.metaLine}>Assignee: {ai.assignee}</Text>}
                {ai.due_date && <Text style={styles.metaLine}>Due: {ai.due_date}</Text>}
              </View>
              <Pressable
                onPress={() => {
                  const currentIdx = statusOptions.indexOf(ai.status);
                  const nextStatus = statusOptions[(currentIdx + 1) % statusOptions.length];
                  onUpdateStatus(ai.id, nextStatus);
                }}
              >
                <Pill label={ai.status} color={statusColors[ai.status] || T.inkMute} />
              </Pressable>
            </View>
          ))}
        </Card>
      )}
      {meeting.decisions.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <SectionHeader icon="checkmark-done" title="Decisions" />
          {meeting.decisions.map((d) => (
            <View key={d.id} style={styles.bulletRow}>
              <Text style={styles.bullet}>{"\u2022"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.bodyText}>{d.description}</Text>
                {d.decided_by && <Text style={styles.metaLine}>By: {d.decided_by}</Text>}
              </View>
            </View>
          ))}
        </Card>
      )}
      {meeting.follow_ups.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <SectionHeader icon="arrow-redo" title="Follow-Ups" />
          {meeting.follow_ups.map((f) => (
            <View key={f.id} style={styles.bulletRow}>
              <Text style={styles.bullet}>{"\u2022"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.bodyText}>{f.description}</Text>
                {f.owner && <Text style={styles.metaLine}>Owner: {f.owner}</Text>}
              </View>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}

// ── Recording Tab ──
function RecordingTab({ meeting }: { meeting: MeetingDetail }) {
  if (!meeting.recording) {
    return <EmptyState icon="mic-off-outline" title="No recording" body="This meeting has no audio or video recording." />;
  }
  return (
    <View style={{ paddingTop: 12 }}>
      <Card>
        <SectionHeader icon="mic" title="Recording" />
        <View style={styles.metaRow}>
          <Ionicons name="musical-notes" size={20} color={T.brandBlue} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.bodyText}>Audio recording</Text>
            <Text style={styles.metaLine}>{meeting.recording.mime_type} - {fmtDuration(meeting.recording.duration_seconds)}</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

// ── Shared components ──
function SectionHeader({ icon, title, color = T.ink }: { icon: string; title: string; color?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={{ fontSize: T.fs.body, fontWeight: "800", color }}>{title}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.line,
    marginTop: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: "transparent",
  },
  bodyText: { fontSize: T.fs.body, color: T.inkSoft, lineHeight: 22 },
  bullet: { fontSize: 16, color: T.brandBlue, marginRight: 8, marginTop: 1 },
  bulletRow: { flexDirection: "row", marginBottom: 6 },
  metaLine: { fontSize: T.fs.caption, color: T.inkMute, marginTop: 2 },
  actionRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  metaRow: { flexDirection: "row", alignItems: "center" },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: T.r.lg,
    backgroundColor: T.bgWarm,
    borderWidth: 1,
    borderColor: T.brandBlue,
  },
  shareBtnText: { fontSize: T.fs.caption, fontWeight: "700", color: T.brandBlue },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.surface,
    borderRadius: T.r.md,
    borderWidth: 1,
    borderColor: T.line,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: T.ink,
    paddingHorizontal: 8,
  },
  transcriptText: { fontSize: T.fs.body, color: T.inkSoft, lineHeight: 24 },
});