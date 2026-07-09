import React, { useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, TextInput, Modal, Alert, StyleSheet, ScrollView } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Avatar } from "../../components/Avatar";
import { Pill } from "../../components/Pill";
import { EmptyState } from "../../components/EmptyState";
import { Button } from "../../components/Button";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { T } from "../../theme/tokens";

interface Award {
  id: number; name: string; category: string | null;
  awarded_on: string | null; description: string | null; icon: string | null;
  member_id: number | null; member_name: string | null;
  member_initials: string | null; avatar_color: string | null;
}

export default function AwardsWallScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { member } = useAuth();
  const canEdit = !!member?.canEdit;
  const [editing, setEditing] = useState<any | null>(null); // null closed | {} add | Award edit
  const { data, isLoading } = useQuery({
    queryKey: ["awards"],
    queryFn: () => api.get<{ awards: Award[] }>("/awards"),
  });
  const membersQ = useQuery({
    enabled: canEdit,
    queryKey: ["roster", "all"],
    queryFn: () => api.get<{ members: any[] }>("/members?limit=500"),
  });
  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/awards/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["awards"] }),
  });

  const awards = data?.awards ?? [];

  return (
    <Screen bg={T.bgWarm} scroll={false}>
      <View style={{ flexDirection: "row", padding: 16, alignItems: "center", gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: "700", color: T.ink, flex: 1 }}>Awards Wall</Text>
        {canEdit && (
          <Pressable onPress={() => setEditing({})} hitSlop={10}>
            <Ionicons name="add-circle" size={26} color={T.brandBlue} />
          </Pressable>
        )}
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: T.ink, letterSpacing: -0.4 }}>Recognitions</Text>
        <Text style={{ color: T.inkMute, marginTop: 4 }}>Celebrating Lions and the club</Text>
      </View>
      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> :
        awards.length === 0 ? <EmptyState icon="trophy-outline" title="No awards listed yet" /> : (
          <FlatList
            data={awards}
            keyExtractor={a => String(a.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 12 }}>
                <Card pad={14}>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: `${T.brandGold}33`, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: 26 }}>{item.icon ?? "🏆"}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "800", color: T.ink, fontSize: 15 }}>{item.name}</Text>
                      {item.category && <View style={{ marginTop: 6 }}><Pill label={item.category} color={T.brandBlue} /></View>}
                      {item.member_name && (
                        <Pressable
                          onPress={() => item.member_id && nav.navigate("MemberDetail", { id: item.member_id })}
                          style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
                          <Avatar initials={item.member_initials ?? ""} size={22} color={item.avatar_color ?? T.brandBlue} />
                          <Text style={{ color: T.inkSoft, fontSize: 13 }}>{item.member_name}</Text>
                        </Pressable>
                      )}
                      {item.awarded_on && (
                        <Text style={{ color: T.inkFaint, fontSize: 11, marginTop: 6 }}>
                          {new Date(item.awarded_on).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                        </Text>
                      )}
                      {item.description && (
                        <Text style={{ color: T.inkMute, fontSize: 13, marginTop: 6 }} numberOfLines={2}>{item.description}</Text>
                      )}
                    </View>
                    {canEdit && (
                      <View style={{ gap: 10 }}>
                        <Pressable hitSlop={10} onPress={() => setEditing(item)}><Ionicons name="create-outline" size={20} color={T.brandBlue} /></Pressable>
                        <Pressable hitSlop={10} onPress={() => Alert.alert("Delete award?", item.name, [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive", onPress: () => del.mutate(item.id) },
                        ])}><Ionicons name="trash-outline" size={20} color={T.danger} /></Pressable>
                      </View>
                    )}
                  </View>
                </Card>
              </View>
            )}
          />
        )
      }
      {editing && (
        <AwardEditModal
          award={Object.keys(editing).length ? editing : null}
          members={membersQ.data?.members ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["awards"] }); setEditing(null); }}
        />
      )}
    </Screen>
  );
}

const AwardEditModal: React.FC<{ award: any | null; members: any[]; onClose: () => void; onSaved: () => void }> = ({ award, members, onClose, onSaved }) => {
  const editing = !!award;
  const [f, setF] = useState({
    name: award?.name ?? "",
    category: award?.category ?? "",
    member_id: award?.member_id != null ? String(award.member_id) : "",
    awarded_on: award?.awarded_on ? String(award.awarded_on).slice(0, 10) : "",
    description: award?.description ?? "",
    icon: award?.icon ?? "🏆",
  });
  const set = (k: string) => (v: string) => setF({ ...f, [k]: v });
  const m = useMutation({
    mutationFn: () => {
      const body = { name: f.name, category: f.category || null, member_id: f.member_id ? Number(f.member_id) : null, awarded_on: f.awarded_on || null, description: f.description || null, icon: f.icon || null };
      return editing ? api.patch(`/awards/${award.id}`, body) : api.post("/awards", body);
    },
    onSuccess: onSaved,
  });
  const selMember = members.find(x => String(x.id) === f.member_id);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={modal.head}>
            <Text style={modal.title}>{editing ? "Edit award" : "Add award"}</Text>
            <Pressable onPress={onClose} hitSlop={10}><Ionicons name="close" size={24} color={T.ink} /></Pressable>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>
            <Text style={modal.label}>Award name</Text>
            <TextInput style={modal.input} value={f.name} onChangeText={set("name")} placeholder="Award name" />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 0.4 }}>
                <Text style={modal.label}>Icon</Text>
                <TextInput style={modal.input} value={f.icon} onChangeText={set("icon")} maxLength={4} placeholder="🏆" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modal.label}>Category</Text>
                <TextInput style={modal.input} value={f.category} onChangeText={set("category")} placeholder="e.g. Service" />
              </View>
            </View>
            <Text style={modal.label}>Date (YYYY-MM-DD)</Text>
            <TextInput style={modal.input} value={f.awarded_on} onChangeText={set("awarded_on")} placeholder="2026-07-09" />
            <Text style={modal.label}>Description</Text>
            <TextInput style={[modal.input, { minHeight: 80 }]} value={f.description} onChangeText={set("description")} multiline placeholder="What this award recognises" />
            <Text style={modal.label}>Awarded to {selMember ? `· ${selMember.name}` : "(none)"}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }} contentContainerStyle={{ gap: 10, paddingHorizontal: 2 }}>
              <Pressable onPress={() => set("member_id")("")} style={[modal.chip, f.member_id === "" && modal.chipSel]}>
                <Text style={{ fontSize: 12, color: f.member_id === "" ? "#fff" : T.ink }}>None</Text>
              </Pressable>
              {members.map(mm => (
                <Pressable key={mm.id} onPress={() => set("member_id")(String(mm.id))} style={[modal.chip, f.member_id === String(mm.id) && modal.chipSel]}>
                  <Text style={{ fontSize: 12, color: f.member_id === String(mm.id) ? "#fff" : T.ink }}>{mm.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </ScrollView>
          <Button label={m.isPending ? "Saving..." : "Save"} onPress={() => m.mutate()} disabled={!f.name || m.isPending} />
        </View>
      </View>
    </Modal>
  );
};

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: T.bg, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, maxHeight: "92%" },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "800", color: T.ink },
  label: { fontSize: 12, fontWeight: "700", color: T.inkMute, marginTop: 12, marginBottom: 6, letterSpacing: 0.3 },
  input: { borderWidth: 1, borderColor: T.line, borderRadius: T.r.md, paddingHorizontal: 12, height: 44, fontSize: 15, color: T.ink, backgroundColor: T.surface },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: T.line, backgroundColor: T.surface },
  chipSel: { backgroundColor: T.brandBlue, borderColor: T.brandBlue },
});