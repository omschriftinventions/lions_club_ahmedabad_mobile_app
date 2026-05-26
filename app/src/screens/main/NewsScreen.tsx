import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { api } from '../../lib/api';
import { T } from '../../theme/tokens';

interface NewsRow { id: number; title: string; tag: string | null; excerpt: string | null; published_at: string; }

export default function NewsScreen() {
  const nav = useNavigation<any>();
  const { data, isLoading } = useQuery({
    queryKey: ['news', 'all'],
    queryFn: () => api.get<{ news: NewsRow[] }>('/news?limit=50'),
  });
  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.5 }}>News</Text>
        <Text style={{ color: T.inkMute, marginTop: 2 }}>Latest from the Club</Text>
      </View>
      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 20 }} /> : (
        <FlatList
          data={data?.news ?? []}
          keyExtractor={n => String(n.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => nav.navigate('NewsDetail', { id: item.id })} style={{ marginBottom: 12 }}>
              <Card pad={14}>
                <Pill label={item.tag ?? 'News'} color={T.brandBlue} />
                <Text style={{ marginTop: 8, fontWeight: '700', color: T.ink, fontSize: 15 }}>{item.title}</Text>
                {item.excerpt && <Text style={{ marginTop: 4, color: T.inkMute, fontSize: 13 }} numberOfLines={3}>{item.excerpt}</Text>}
                <Text style={{ marginTop: 8, color: T.inkFaint, fontSize: 11 }}>{new Date(item.published_at).toLocaleDateString()}</Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
