import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioRecorder, RecordingPresets } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { T } from "../../theme/tokens";

export default function MeetingRecorderScreen() {
  const nav = useNavigation<any>();
  const { member } = useAuth();
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [phase, setPhase] = useState<"setup" | "recording" | "done">("setup");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };
  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const handleStart = async () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a meeting title before recording.");
      return;
    }
    try {
      await recorder.record();
      setPhase("recording");
      setSeconds(0);
      setPaused(false);
      startTimer();
    } catch (e: any) {
      Alert.alert("Recording failed", e?.message || "Could not start recording");
    }
  };

  const handlePause = async () => {
    try {
      if (paused) {
        await recorder.record();
        setPaused(false);
        startTimer();
      } else {
        await recorder.pause();
        setPaused(true);
        stopTimer();
      }
    } catch (e: any) {
      console.warn("[recorder] pause error", e);
    }
  };

  const handleStop = async () => {
    try {
      await recorder.stop();
      stopTimer();
      setPhase("done");
    } catch (e: any) {
      console.warn("[recorder] stop error", e);
      setPhase("done");
    }
  };

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("setup");
    setSeconds(0);
    setPaused(false);
    setTitle("");
  };

  const handleUpload = async () => {
    if (!recorder.uri) {
      Alert.alert("No recording", "There is no recording to upload.");
      return;
    }
    setUploading(true);
    try {
      // Create meeting
      const createRes = await api.post<{ id: number }>("/meetings", {
        title: title.trim(),
      });
      const meetingId = createRes.id;

      // Read file as base64
      const fileInfo = await FileSystem.getInfoAsync(recorder.uri);
      const base64 = await FileSystem.readAsStringAsync(recorder.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const dataUrl = "data:audio/m4a;base64," + base64;

      // Upload recording
      await api.post("/meetings/" + meetingId + "/upload", {
        file: dataUrl,
        mimeType: "audio/m4a",
        duration: seconds,
      });

      Alert.alert("Success", "Meeting recording uploaded. You can now transcribe and summarize it.", [
        { text: "View Meeting", onPress: () => nav.replace("MeetingDetail", { id: meetingId }) },
      ]);
    } catch (e: any) {
      Alert.alert("Upload failed", e?.message || "Could not upload recording");
    } finally {
      setUploading(false);
    }
  };

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h ? String(h).padStart(2, "0") + ":" : "") + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  };

  return (
    <Screen bg={T.bg}>
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <Pressable onPress={() => nav.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={T.ink} />
          </Pressable>
          <Text style={{ fontSize: T.fs.h2, fontWeight: "800", color: T.ink }}>Record Meeting</Text>
        </View>

        {/* Setup phase */}
        {phase === "setup" && (
          <Card>
            <Text style={styles.label}>Meeting Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="e.g. Board Meeting July 2026"
              placeholderTextColor={T.inkFaint}
              value={title}
              onChangeText={setTitle}
            />
            <View style={{ height: 20 }} />
            <Button label="Start Recording" onPress={handleStart} variant="primary" />
          </Card>
        )}

        {/* Recording phase */}
        {phase === "recording" && (
          <View style={{ alignItems: "center", paddingTop: 40 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: T.inkMute, letterSpacing: 1.5, marginBottom: 8 }}>
              {paused ? "PAUSED" : "RECORDING"}
            </Text>
            <View style={[styles.micCircle, { backgroundColor: paused ? T.inkFaint : T.danger }]}>
              <Ionicons name="mic" size={48} color="#fff" />
              {!paused && <View style={styles.pulseRing} />}
            </View>
            <Text style={styles.timer}>{fmtTime(seconds)}</Text>
            <Text style={styles.titleDisplay}>{title}</Text>

            <View style={{ flexDirection: "row", gap: 14, marginTop: 30 }}>
              <Pressable onPress={handlePause} style={styles.controlBtn}>
                <Ionicons name={paused ? "play" : "pause"} size={24} color={T.ink} />
                <Text style={styles.controlLabel}>{paused ? "Resume" : "Pause"}</Text>
              </Pressable>
              <Pressable onPress={handleStop} style={[styles.controlBtn, { backgroundColor: T.danger }]}>
                <Ionicons name="stop" size={24} color="#fff" />
                <Text style={[styles.controlLabel, { color: "#fff" }]}>Stop</Text>
              </Pressable>
              <Pressable onPress={handleCancel} style={styles.controlBtn}>
                <Ionicons name="close" size={24} color={T.ink} />
                <Text style={styles.controlLabel}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Done phase */}
        {phase === "done" && (
          <View style={{ alignItems: "center", paddingTop: 30 }}>
            <View style={[styles.micCircle, { backgroundColor: T.success }]}>
              <Ionicons name="checkmark" size={48} color="#fff" />
            </View>
            <Text style={{ fontSize: T.fs.h2, fontWeight: "800", color: T.ink, marginTop: 16 }}>Recording Complete</Text>
            <Text style={{ color: T.inkMute, fontSize: T.fs.body, marginTop: 4 }}>{title} - {fmtTime(seconds)}</Text>

            <View style={{ marginTop: 30, width: "100%" }}>
              <Button label={uploading ? "Uploading..." : "Upload & Process"} onPress={handleUpload} loading={uploading} variant="gold" />
              <View style={{ height: 12 }} />
              <Button label="Record Again" onPress={handleCancel} variant="outline" />
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}

import { TextInput } from "react-native";

const styles = StyleSheet.create({
  label: { fontSize: T.fs.label, fontWeight: "700", color: T.inkMute, marginBottom: 8, letterSpacing: 0.5 },
  titleInput: {
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: T.r.md,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: T.ink,
  },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pulseRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: T.danger,
    opacity: 0.3,
  },
  timer: {
    fontSize: 36,
    fontWeight: "800",
    color: T.ink,
    fontVariant: ["tabular-nums"],
    marginTop: 20,
    letterSpacing: 2,
  },
  titleDisplay: {
    fontSize: T.fs.bodyLg,
    color: T.inkSoft,
    marginTop: 4,
  },
  controlBtn: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: T.r.lg,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.line,
    minWidth: 80,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: T.ink,
    marginTop: 4,
  },
});