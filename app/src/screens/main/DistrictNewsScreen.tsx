import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../lib/api';
import { T } from '../../theme/tokens';

interface NewsRow { id: number; title: string; tag: string | null; excerpt: string | null; published_at: string; scope: string; }

export default function DistrictNewsScreen() {
  const nav = useNavigation<any>();
  const { data, isLoading } = useQuery({
    queryKey: ['news', 'district'],
    queryFn: () => api.get<{ news: NewsRow[] }>('/news?scope=district&limit=50'),
  });

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>District 3232 B1 News</Text>
      </View>
      <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
        <Text style={{ color: T.inkMute }}>News from the district level — conventions, grants, district leadership.</Text>
      </View>
      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> :
        (data?.news.length ?? 0) === 0 ? <EmptyState icon="globe-outline" title="No district news yet" /> : (
          <FlatList
            data={data?.news ?? []}
            keyExtractor={n => String(n.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => nav.navigate('NewsDetail', { id: item.id })} style={{ marginBottom: 12 }}>
                <Card pad={14}>
                  <Pill label={item.tag ?? 'District'} color={T.brandGoldDark} />
                  <Text style={{ marginTop: 8, fontWeight: '700', color: T.ink, fontSize: 15 }}>{item.title}</Text>
                  {item.excerpt && <Text style={{ marginTop: 4, color: T.inkMute, fontSize: 13 }} numberOfLines={3}>{item.excerpt}</Text>}
                  <Text style={{ marginTop: 8, color: T.inkFaint, fontSize: 11 }}>{new Date(item.published_at).toLocaleDateString()}</Text>
                </Card>
              </Pressable>
            )}
          />
        )
      }
    </Screen>
  );
}
