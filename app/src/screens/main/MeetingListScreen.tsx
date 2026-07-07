import React, { useState, useCallback } from "react";
import { View, Text, Pressable, FlatList, RefreshControl, StyleSheet, TextInput } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Pill } from "../../components/Pill";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { api } from "../../lib/api";
import { T } from "../../theme/tokens";

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

const STATUS_LABEL: Record<string, string> = {
  recording: "Recording",
  uploaded: "Uploaded",
  transcribing: "Transcribing",
  transcribed: "Transcribed",
  summarizing: "Summarizing",
  summarized: "Summarized",
  failed: "Failed",
};

const STATUS_COLOR: Record<string, string> = {
  recording: T.warning,
  uploaded: T.info,
  transcribing: T.info,
  transcribed: T.brandBlue,
  summarizing: T.info,
  summarized: T.success,
  failed: T.danger,
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

export default function MeetingListScreen() {
  const nav = useNavigation<any>();
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["meetings", search],
    queryFn: () => api.get<{ meetings: MeetingItem[]; total: number }>("/meetings?limit=100" + (search ? "&search=" + encodeURIComponent(search) : "")),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <Screen bg={T.bg}>
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Pressable onPress={() => nav.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={T.ink} />
          </Pressable>
          <Text style={{ fontSize: T.fs.h2, fontWeight: "800", color: T.ink }}>AI Meeting Assistant</Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={T.inkFaint} style={{ marginLeft: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search meetings..."
            placeholderTextColor={T.inkFaint}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")} hitSlop={12} style={{ marginRight: 10 }}>
              <Ionicons name="close-circle" size={18} color={T.inkFaint} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={{ paddingTop: 40 }}><Text style={{ textAlign: "center", color: T.inkMute }}>Loading...</Text></View>
      ) : error ? (
        <ErrorState message="Could not load meetings" onRetry={() => refetch()} />
      ) : (data?.meetings ?? []).length === 0 ? (
        <EmptyState
          icon="mic-outline"
          title="No meetings yet"
          body="Record a meeting or upload an audio file to get started with AI-powered summaries."
          cta={
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => nav.navigate("MeetingRecorder")}
                style={[styles.actionBtn, { backgroundColor: T.brandBlue }]}
              >
                <Ionicons name="mic" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Record</Text>
              </Pressable>
              <Pressable
                onPress={() => nav.navigate("MeetingUpload")}
                style={[styles.actionBtn, { backgroundColor: T.surface, borderColor: T.brandBlue, borderWidth: 1.5 }]}
              >
                <Ionicons name="cloud-upload" size={18} color={T.brandBlue} />
                <Text style={[styles.actionBtnText, { color: T.brandBlue }]}>Upload</Text>
              </Pressable>
            </View>
          }
        />
      ) : (
        <FlatList
          data={data?.meetings ?? []}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => nav.navigate("MeetingDetail", { id: item.id })}>
              <Card style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <Text style={{ fontSize: T.fs.title, fontWeight: "800", color: T.ink, flex: 1 }} numberOfLines={2}>{item.title}</Text>
                  <Pill label={STATUS_LABEL[item.status] || item.status} color={STATUS_COLOR[item.status] || T.inkMute} />
                </View>
                <View style={{ flexDirection: "row", gap: 14, marginTop: 6 }}>
                  {item.meeting_date && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Ionicons name="calendar-outline" size={13} color={T.inkMute} />
                      <Text style={styles.metaText}>{item.meeting_date}</Text>
                    </View>
                  )}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="time-outline" size={13} color={T.inkMute} />
                    <Text style={styles.metaText}>{fmtDuration(item.duration_seconds)}</Text>
                  </View>
                  {item.location && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
                      <Ionicons name="location-outline" size={13} color={T.inkMute} />
                      <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
                    </View>
                  )}
                </View>
                {item.meeting_mood && item.status === "summarized" && (
                  <View style={{ marginTop: 8 }}>
                    <Pill label={item.meeting_mood} color={T.info} />
                  </View>
                )}
              </Card>
            </Pressable>
          )}
        />
      )}

      {/* Floating action buttons */}
      {(data?.meetings ?? []).length > 0 && (
        <View style={styles.fabRow}>
          <Pressable
            onPress={() => nav.navigate("MeetingUpload")}
            style={[styles.fab, { backgroundColor: T.surface, borderColor: T.brandBlue, borderWidth: 1.5 }]}
          >
            <Ionicons name="cloud-upload" size={22} color={T.brandBlue} />
          </Pressable>
          <Pressable
            onPress={() => nav.navigate("MeetingRecorder")}
            style={[styles.fab, { backgroundColor: T.brandBlue }]}
          >
            <Ionicons name="mic" size={24} color="#fff" />
          </Pressable>
        </View>
      )}
    </Screen>
  );
}


const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.surface,
    borderRadius: T.r.lg,
    borderWidth: 1,
    borderColor: T.line,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: T.ink,
    paddingHorizontal: 10,
  },
  metaText: { fontSize: T.fs.caption, color: T.inkMute },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    height: 44,
    borderRadius: T.r.lg,
  },
  actionBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  fabRow: {
    position: "absolute",
    bottom: 30,
    right: 20,
    flexDirection: "row",
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0A1628",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});