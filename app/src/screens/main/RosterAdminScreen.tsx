import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Alert, ActivityIndicator, Modal } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

interface Member {
  id: number; name: string; initials: string; role: string;
  role_label: string; role_color: string; avatar_color: string | null;
  profession: string | null; phone: string | null;
}

export default function RosterAdminScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [q, setQ] = useState('');
  const [pwFor, setPwFor] = useState<Member | null>(null);
  const [pwVal, setPwVal] = useState('');

  if (!member?.canEdit) {
    return (
      <Screen><View style={{ padding: 24 }}>
        <Text style={{ color: T.danger, fontWeight: '700' }}>Forbidden</Text>
        <Text style={{ color: T.inkMute, marginTop: 6 }}>Officer access required.</Text>
      </View></Screen>
    );
  }

  const { data, isLoading } = useQuery({
    queryKey: ['members', 'admin', q],
    queryFn: () => api.get<{ members: Member[] }>(`/members?search=${encodeURIComponent(q)}`),
  });
  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/members/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
  const setPw = useMutation({
    mutationFn: () => api.post(`/admin/members/${pwFor!.id}/password`, { password: pwVal }),
    onSuccess: () => { Alert.alert('Password updated'); setPwFor(null); setPwVal(''); },
    onError: (e: any) => Alert.alert('Failed', e.message),
  });

  const confirmDelete = (m: Member) => {
    Alert.alert('Remove member?', `${m.name} will be hidden from the directory.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => del.mutate(m.id) },
    ]);
  };

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.ink }}>Manage members</Text>
        <Pressable onPress={() => nav.navigate('AddMember')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.brandBlue, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: T.r.md, paddingHorizontal: 12, height: 42, borderWidth: 1, borderColor: T.line }}>
          <Ionicons name="search" size={16} color={T.inkMute} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search" placeholderTextColor={T.inkFaint} style={{ flex: 1, marginLeft: 8, fontSize: 14, color: T.ink }} />
        </View>
      </View>
      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> : (
        <FlatList
          data={data?.members ?? []}
          keyExtractor={m => String(m.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', backgroundColor: T.surface, padding: 12, borderRadius: T.r.md, marginBottom: 8, alignItems: 'center', gap: 12 }}>
              <Avatar initials={item.initials} color={item.avatar_color ?? item.role_color} size={42} />
              <Pressable style={{ flex: 1 }} onPress={() => nav.navigate('MemberDetail', { id: item.id })}>
                <Text style={{ fontWeight: '700', color: T.ink }} numberOfLines={1}>{item.name}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}><Pill label={item.role_label} color={item.role_color} /></View>
                {item.phone && <Text style={{ color: T.inkMute, fontSize: 12, marginTop: 4 }} numberOfLines={1}>{item.phone}</Text>}
              </Pressable>
              {member?.superAdmin && (
                <Pressable onPress={() => { setPwFor(item); setPwVal(''); }} hitSlop={12} style={{ padding: 6 }}>
                  <Ionicons name="key-outline" size={20} color={T.brandBlue} />
                </Pressable>
              )}
              <Pressable onPress={() => confirmDelete(item)} hitSlop={12} style={{ padding: 6 }}>
                <Ionicons name="trash-outline" size={20} color={T.danger} />
              </Pressable>
            </View>
          )}
        />
      )}

      <Modal visible={!!pwFor} transparent animationType="fade" onRequestClose={() => setPwFor(null)}>
        <Pressable onPress={() => setPwFor(null)} style={{ flex: 1, backgroundColor: 'rgba(10,18,35,0.5)', justifyContent: 'center', padding: 24 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: T.surface, borderRadius: T.r.lg, padding: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: T.ink, marginBottom: 4 }}>Set password</Text>
            <Text style={{ color: T.inkMute, fontSize: 13, marginBottom: 14 }}>{pwFor?.name}</Text>
            <TextInput
              value={pwVal} onChangeText={setPwVal} placeholder="New password (min 6)" secureTextEntry
              placeholderTextColor={T.inkFaint} autoFocus
              style={{ borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink }}
            />
            <Button label={setPw.isPending ? 'Saving...' : 'Save password'} onPress={() => setPw.mutate()} loading={setPw.isPending} style={{ marginTop: 14 }} />
            <Pressable onPress={() => setPwFor(null)} style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ color: T.inkMute, fontWeight: '600' }}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}