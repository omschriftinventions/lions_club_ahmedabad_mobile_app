import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../lib/api';
import { T } from '../../theme/tokens';

interface Member {
  id: number; name: string; initials: string; avatar_color: string | null;
  profession: string | null; business: string | null; area: string | null;
  phone: string | null; email: string | null;
  role: string; role_label: string; role_color: string;
}

export default function BusinessDirectoryScreen() {
  const nav = useNavigation<any>();
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['members', 'business'],
    queryFn: () => api.get<{ members: Member[] }>('/members?limit=500'),
  });

  const grouped = useMemo(() => {
    const all = (data?.members ?? []).filter(m => m.business || m.profession);
    const filtered = q
      ? all.filter(m =>
          [m.name, m.business, m.profession, m.area].some(v => v?.toLowerCase().includes(q.toLowerCase())))
      : all;
    const map = new Map<string, Member[]>();
    for (const m of filtered) {
      const key = (m.profession?.split(/[\/,]/)[0] ?? 'Other').trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data, q]);

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Business Directory</Text>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: T.r.md, paddingHorizontal: 12, height: 42, borderWidth: 1, borderColor: T.line }}>
          <Ionicons name="briefcase" size={16} color={T.inkMute} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Profession, business, area"
            placeholderTextColor={T.inkFaint}
            style={{ flex: 1, marginLeft: 8, fontSize: 14, color: T.ink }}
          />
        </View>
      </View>

      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> :
        grouped.length === 0 ? <EmptyState icon="search-outline" title="No matches" body="Try a different search term." /> : (
          <FlatList
            data={grouped}
            keyExtractor={([cat]) => cat}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            renderItem={({ item: [category, members] }) => (
              <View style={{ marginBottom: 18 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: T.inkMute, letterSpacing: 1, marginBottom: 8 }}>
                  {category.toUpperCase()} · {members.length}
                </Text>
                {members.map(m => (
                  <Pressable key={m.id} onPress={() => nav.navigate('MemberDetail', { id: m.id })} style={{ marginBottom: 8 }}>
                    <Card pad={12}>
                      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                        <Avatar initials={m.initials} color={m.avatar_color ?? m.role_color} size={42} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '700', color: T.ink }} numberOfLines={1}>{m.name}</Text>
                          {m.business && <Text style={{ color: T.brandBlue, fontSize: 13, marginTop: 2 }} numberOfLines={1}>{m.business}</Text>}
                          {m.area && <Text style={{ color: T.inkMute, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{m.area}</Text>}
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={T.inkFaint} />
                      </View>
                    </Card>
                  </Pressable>
                ))}
              </View>
            )}
          />
        )
      }
    </Screen>
  );
}
