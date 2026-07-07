import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { api } from "../../lib/api";
import { T } from "../../theme/tokens";

export default function MeetingUploadScreen() {
  const nav = useNavigation<any>();
  const [title, setTitle] = useState("");
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [mimeType, setMimeType] = useState("");
  const [uploading, setUploading] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*", "video/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setFileUri(asset.uri);
      setFileName(asset.name);
      setFileSize(asset.size || 0);
      setMimeType(asset.mimeType || "audio/m4a");
    } catch (e: any) {
      Alert.alert("Pick failed", e?.message || "Could not pick file");
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a meeting title.");
      return;
    }
    if (!fileUri) {
      Alert.alert("No file", "Please select an audio or video file.");
      return;
    }
    setUploading(true);
    try {
      // Create meeting
      const createRes = await api.post<{ id: number }>("/meetings", { title: title.trim() });

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const dataUrl = "data:" + mimeType + ";base64," + base64;

      await api.post("/meetings/" + createRes.id + "/upload", {
        file: dataUrl,
        mimeType,
        duration: 0,
      });

      Alert.alert("Success", "File uploaded. You can now transcribe and summarize it.", [
        { text: "View Meeting", onPress: () => nav.replace("MeetingDetail", { id: createRes.id }) },
      ]);
    } catch (e: any) {
      Alert.alert("Upload failed", e?.message || "Could not upload file");
    } finally {
      setUploading(false);
    }
  };

  const fmtSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MB";
    if (bytes > 1024) return (bytes / 1024).toFixed(0) + " KB";
    return bytes + " B";
  };

  return (
    <Screen bg={T.bg}>
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <Pressable onPress={() => nav.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={T.ink} />
          </Pressable>
          <Text style={{ fontSize: T.fs.h2, fontWeight: "800", color: T.ink }}>Upload Recording</Text>
        </View>

        <Card>
          <Text style={styles.label}>Meeting Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="e.g. Weekly Meeting July 2026"
            placeholderTextColor={T.inkFaint}
            value={title}
            onChangeText={setTitle}
          />

          <View style={{ height: 20 }} />

          <Text style={styles.label}>Audio / Video File</Text>
          {fileUri ? (
            <Pressable onPress={pickFile} style={styles.fileBox}>
              <Ionicons name="document" size={28} color={T.brandBlue} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: T.fs.body, fontWeight: "600", color: T.ink }} numberOfLines={1}>{fileName}</Text>
                <Text style={{ fontSize: T.fs.caption, color: T.inkMute, marginTop: 2 }}>{mimeType} - {fmtSize(fileSize)}</Text>
              </View>
              <Ionicons name="swap-horizontal" size={18} color={T.inkFaint} />
            </Pressable>
          ) : (
            <Pressable onPress={pickFile} style={styles.pickBox}>
              <Ionicons name="cloud-upload-outline" size={40} color={T.inkFaint} />
              <Text style={styles.pickText}>Tap to select an audio or video file</Text>
              <Text style={styles.pickSub}>MP3, M4A, WAV, MP4, WebM - up to 80 MB</Text>
            </Pressable>
          )}

          <View style={{ height: 24 }} />
          <Button label={uploading ? "Uploading..." : "Upload & Process"} onPress={handleUpload} loading={uploading} variant="gold" disabled={!fileUri || !title.trim()} />
        </Card>

        <View style={{ marginTop: 20 }}>
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Ionicons name="information-circle" size={18} color={T.info} />
              <Text style={{ fontSize: T.fs.body, fontWeight: "700", color: T.ink }}>How it works</Text>
            </View>
            <Text style={styles.infoText}>1. Enter a title for your meeting</Text>
            <Text style={styles.infoText}>2. Select an audio or video recording</Text>
            <Text style={styles.infoText}>3. Upload it to the server</Text>
            <Text style={styles.infoText}>4. Transcribe the audio to text (Groq Whisper)</Text>
            <Text style={styles.infoText}>5. Generate AI summary with action items and decisions</Text>
            <Text style={styles.infoText}>6. Share the summary with members</Text>
          </Card>
        </View>
      </View>
    </Screen>
  );
}

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
  pickBox: {
    borderWidth: 2,
    borderColor: T.line,
    borderRadius: T.r.lg,
    paddingVertical: 32,
    alignItems: "center",
    borderStyle: "dashed",
  },
  pickText: { fontSize: T.fs.body, fontWeight: "600", color: T.inkSoft, marginTop: 10 },
  pickSub: { fontSize: T.fs.caption, color: T.inkFaint, marginTop: 4 },
  fileBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bgWarm,
    borderRadius: T.r.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoText: { fontSize: T.fs.caption, color: T.inkMute, marginTop: 4 },
});