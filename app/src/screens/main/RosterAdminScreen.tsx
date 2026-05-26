import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
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

  const confirmDelete = (m: Member) => {
    Alert.alert('Remove member?',
      `${m.name} will be hidden from the directory. Their account is soft-deleted (can be restored via DB).`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => del.mutate(m.id) },
      ]
    );
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
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search"
            placeholderTextColor={T.inkFaint}
            style={{ flex: 1, marginLeft: 8, fontSize: 14, color: T.ink }}
          />
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
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  <Pill label={item.role_label} color={item.role_color} />
                </View>
                {item.phone && <Text style={{ color: T.inkMute, fontSize: 12, marginTop: 4 }} numberOfLines={1}>{item.phone}</Text>}
              </Pressable>
              <Pressable onPress={() => confirmDelete(item)} hitSlop={12} style={{ padding: 6 }}>
                <Ionicons name="trash-outline" size={20} color={T.danger} />
              </Pressable>
            </View>
          )}
        />
      )}
    </Screen>
  );
}
