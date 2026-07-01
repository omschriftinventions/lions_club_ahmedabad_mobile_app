import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { api } from '../../lib/api';
import { T } from '../../theme/tokens';

interface Member {
  id: number; name: string; initials: string; designation: string | null;
  profession: string | null; business: string | null; area: string | null;
  role: string; role_label: string; role_color: string; avatar_color: string | null; avatar_url: string | null;
}

export default function RosterScreen() {
  const nav = useNavigation<any>();
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['members', q],
    queryFn: () => api.get<{ members: Member[] }>(`/members?search=${encodeURIComponent(q)}`),
  });

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ padding: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.5 }}>Roster</Text>
        <Text style={{ color: T.inkMute, marginTop: 2 }}>{data?.members.length ?? 0} active members</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: T.r.md, paddingHorizontal: 12, height: 44, marginTop: 14, borderWidth: 1, borderColor: T.line }}>
          <Ionicons name="search" size={18} color={T.inkMute} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search name, profession, business, area, role"
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
            <Pressable onPress={() => nav.navigate('MemberDetail', { id: item.id })} style={{
              flexDirection: 'row', backgroundColor: T.surface, padding: 14, borderRadius: T.r.lg,
              marginBottom: 10, alignItems: 'center', gap: 12,
            }}>
              <Avatar initials={item.initials} color={item.avatar_color ?? item.role_color} size={48} uri={item.avatar_url} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: T.ink }}>{item.name}</Text>
                <Text style={{ color: T.inkMute, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                  {item.profession ?? ''}{item.business ? ` · ${item.business}` : ''}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                  <Pill label={item.role_label} color={item.role_color} />
                  {item.designation && <Pill label={item.designation} color={T.brandGoldDark} />}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={T.inkFaint} />
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
