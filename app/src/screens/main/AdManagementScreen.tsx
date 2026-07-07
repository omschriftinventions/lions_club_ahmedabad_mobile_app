import React, { useState, useCallback } from "react";
import { View, Text, Pressable, FlatList, StyleSheet, Alert, Image, RefreshControl } from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Pill } from "../../components/Pill";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { T } from "../../theme/tokens";

interface AdRow {
  id: number;
  image_url: string;
  title: string | null;
  link_url: string | null;
  placement: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

type Placement = "dashboard" | "login" | "both";

export default function AdManagementScreen() {
  const nav = useNavigation<any>();
  const { member } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["ads", "all"],
    queryFn: () => api.get<{ ads: AdRow[] }>("/advertisements/all"),
  });

  const uploadMut = useMutation({
    mutationFn: async (params: { file: string; title: string; placement: Placement }) => {
      return api.post<{ id: number; url: string }>("/advertisements/upload", params);
    },
    onSuccess: () => { refetch(); },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      api.patch("/advertisements/" + id, { is_active: active }),
    onSuccess: () => refetch(),
  });

  const placementMut = useMutation({
    mutationFn: ({ id, placement }: { id: number; placement: Placement }) =>
      api.patch("/advertisements/" + id, { placement }),
    onSuccess: () => refetch(),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete("/advertisements/" + id),
    onSuccess: () => refetch(),
  });

  const pickAndUpload = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert("Permission needed", "Please allow photo access to upload ads."); return; }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsMultipleSelection: false,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
      const mimeType = asset.mimeType || "image/jpeg";
      const dataUrl = "data:" + mimeType + ";base64," + base64;

      Alert.prompt(
        "Advertisement title",
        "Enter a title (optional):",
        async (title) => {
          const placement = await pickPlacement();
          if (!placement) return;
          try {
            await uploadMut.mutateAsync({ file: dataUrl, title: title || "", placement });
            Alert.alert("Uploaded", "Advertisement added successfully.");
          } catch (e: any) {
            Alert.alert("Upload failed", e?.message || "Could not upload ad");
          }
        }
      );
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not pick image");
    }
  };

  const pickPlacement = (): Promise<Placement | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        "Placement",
        "Where should this ad appear?",
        [
          { text: "Dashboard", onPress: () => resolve("dashboard") },
          { text: "Login page", onPress: () => resolve("login") },
          { text: "Both", onPress: () => resolve("both") },
          { text: "Cancel", onPress: () => resolve(null), style: "cancel" },
        ]
      );
    });
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete advertisement", "Remove this ad permanently?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMut.mutate(id) },
    ]);
  };

  const cyclePlacement = (ad: AdRow) => {
    const order: Placement[] = ["both", "dashboard", "login"];
    const current = ad.placement as Placement;
    const next = order[(order.indexOf(current) + 1) % order.length];
    placementMut.mutate({ id: ad.id, placement: next });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!member?.superAdmin) {
    return (
      <Screen bg={T.bg}>
        <View style={{ padding: 16, alignItems: "center", flex: 1, justifyContent: "center" }}>
          <Ionicons name="lock-closed" size={40} color={T.inkMute} />
          <Text style={{ marginTop: 12, fontWeight: "700", color: T.ink }}>Super admin access required</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen bg={T.bg}>
      <View style={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Pressable onPress={() => nav.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={T.ink} />
          </Pressable>
          <Text style={{ fontSize: T.fs.h2, fontWeight: "800", color: T.ink }}>Advertisement Management</Text>
        </View>
        <Text style={{ color: T.inkMute, fontSize: 13, marginBottom: 16 }}>
          Upload banner images to display on the dashboard and/or login page. Multiple images rotate automatically.
        </Text>
        <Button label="Upload New Ad" onPress={pickAndUpload} loading={uploadMut.isPending} variant="primary" />
      </View>

      <FlatList
        data={data?.ads ?? []}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          isLoading ? (
            <Text style={{ textAlign: "center", color: T.inkMute, paddingTop: 40 }}>Loading...</Text>
          ) : (
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <Ionicons name="images-outline" size={48} color={T.inkFaint} />
              <Text style={{ color: T.inkMute, marginTop: 10 }}>No advertisements yet</Text>
            </View>
          )
        }
        renderItem={({ item: ad }) => (
          <Card style={{ marginBottom: 12, overflow: "hidden" }}>
            <Image source={{ uri: ad.image_url }} style={styles.adImage} resizeMode="cover" />
            <View style={{ padding: 12 }}>
              {ad.title && <Text style={{ fontSize: 14, fontWeight: "700", color: T.ink }}>{ad.title}</Text>}
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8, alignItems: "center" }}>
                <Pill label={ad.placement} color={ad.placement === "login" ? T.info : ad.placement === "dashboard" ? T.brandBlue : T.success} />
                <Pill label={ad.is_active ? "active" : "inactive"} color={ad.is_active ? T.success : T.inkMute} />
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                <Pressable
                  onPress={() => toggleMut.mutate({ id: ad.id, active: !ad.is_active })}
                  style={[styles.actionBtn, { flex: 1 }]}
                >
                  <Ionicons name={ad.is_active ? "pause" : "play"} size={16} color={T.brandBlue} />
                  <Text style={styles.actionText}>{ad.is_active ? "Deactivate" : "Activate"}</Text>
                </Pressable>
                <Pressable
                  onPress={() => cyclePlacement(ad)}
                  style={[styles.actionBtn, { flex: 1 }]}
                >
                  <Ionicons name="swap-horizontal" size={16} color={T.brandBlue} />
                  <Text style={styles.actionText}>Placement</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(ad.id)}
                  style={[styles.actionBtn, { flex: 0.8, borderColor: T.danger }]}
                >
                  <Ionicons name="trash-outline" size={16} color={T.danger} />
                  <Text style={[styles.actionText, { color: T.danger }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  adImage: { width: "100%", height: 120 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
    paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: T.brandBlue,
  },
  actionText: { fontSize: 12, fontWeight: "700", color: T.brandBlue },
});