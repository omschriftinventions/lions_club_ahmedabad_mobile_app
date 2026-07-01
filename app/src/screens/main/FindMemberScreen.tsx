import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../lib/api';
import { T } from '../../theme/tokens';

interface Member {
  id: number; name: string; initials: string; avatar_color: string | null;
  profession: string | null; business: string | null; area: string | null;
  designation: string | null;
  role: string; role_label: string; role_color: string;
}

const FILTERS = [
  { code: 'all',         label: 'All' },
  { code: 'PRESIDENT',   label: 'President' },
  { code: 'SECRETARY',   label: 'Secretary' },
  { code: 'TREASURER',   label: 'Treasurer' },
  { code: 'PMJF',        label: 'PMJF' },
  { code: 'MJF',         label: 'MJF' },
];

export default function FindMemberScreen() {
  const nav = useNavigation<any>();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['members', 'all'],
    queryFn: () => api.get<{ members: Member[] }>('/members?limit=500'),
  });

  const results = useMemo(() => {
    let rows = data?.members ?? [];
    if (filter === 'PMJF' || filter === 'MJF') {
      rows = rows.filter(m => m.designation === filter);
    } else if (filter !== 'all') {
      rows = rows.filter(m => m.role === filter);
    }
    if (q) {
      const lc = q.toLowerCase();
      rows = rows.filter(m =>
        [m.name, m.profession, m.business, m.area, m.designation, m.role_label, m.role].some(v => v?.toLowerCase().includes(lc)));
    }
    return rows;
  }, [data, q, filter]);

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Find a Lion</Text>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: T.r.md, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: T.line }}>
          <Ionicons name="search" size={18} color={T.inkMute} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Name, profession, business, area, role"
            placeholderTextColor={T.inkFaint}
            style={{ flex: 1, marginLeft: 8, fontSize: 14, color: T.ink }}
          />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {FILTERS.map(f => (
            <Pressable key={f.code} onPress={() => setFilter(f.code)} style={{
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: T.r.pill,
              borderWidth: 1, borderColor: filter === f.code ? T.brandBlue : T.line,
              backgroundColor: filter === f.code ? T.brandBlue : 'transparent',
            }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: filter === f.code ? '#fff' : T.inkSoft }}>{f.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ marginTop: 10, color: T.inkMute, fontSize: 12 }}>{results.length} matches</Text>
      </View>

      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> :
        results.length === 0 ? <EmptyState icon="people-outline" title="No matches" /> : (
          <FlatList
            data={results}
            keyExtractor={m => String(m.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => nav.navigate('MemberDetail', { id: item.id })} style={{
                flexDirection: 'row', backgroundColor: T.surface, padding: 12, borderRadius: T.r.md,
                marginBottom: 8, alignItems: 'center', gap: 12,
              }}>
                <Avatar initials={item.initials} color={item.avatar_color ?? item.role_color} size={42} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: T.ink }} numberOfLines={1}>{item.name}</Text>
                  <Text style={{ color: T.inkMute, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                    {item.profession ?? ''}{item.area ? ` · ${item.area}` : ''}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <Pill label={item.role_label} color={item.role_color} />
                    {item.designation && <Pill label={item.designation} color={T.brandGoldDark} />}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={T.inkFaint} />
              </Pressable>
            )}
          />
        )
      }
    </Screen>
  );
}
