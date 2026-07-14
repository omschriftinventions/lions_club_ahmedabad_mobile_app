import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Image, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

interface NewsRow {
  id: number; title: string; tag: string | null; excerpt: string | null;
  published_at: string; cover_url?: string | null; scope?: string | null;
}

export default function NewsScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { member } = useAuth();
  const canEdit = !!(member?.canEdit || member?.superAdmin);

  const { data, isLoading } = useQuery({
    queryKey: ['news', 'all'],
    queryFn: () => api.get<{ news: NewsRow[] }>('/news?limit=50'),
  });

  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/news/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
    onError: (e: any) => Alert.alert('Delete failed', e.message),
  });

  const confirmDelete = (n: NewsRow) => {
    Alert.alert('Delete news?', n.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => del.mutate(n.id) },
    ]);
  };

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ padding: 20, paddingBottom: 8 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.5 }}>News</Text>
        <Text style={{ color: T.inkMute, marginTop: 2 }}>Latest from the Club</Text>
      </View>
      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 20 }} /> :
        (data?.news.length ?? 0) === 0 ? <EmptyState icon="newspaper-outline" title="No news yet" /> : (
        <FlatList
          data={data?.news ?? []}
          keyExtractor={n => String(n.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 6 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => nav.navigate('NewsDetail', { id: item.id })} style={{ marginBottom: 14 }}>
              <Card pad={0} style={{ overflow: 'hidden' }}>
                {item.cover_url ? (
                  <Image source={{ uri: item.cover_url }} style={{ width: '100%', height: 150, backgroundColor: T.bg }} />
                ) : null}
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                      <Pill label={item.tag ?? 'News'} color={T.brandGoldDark} />
                      {item.scope === 'district' && <Pill label="District" color={T.brandBlue} />}
                    </View>
                    {canEdit && (
                      <Pressable
                        onPress={() => confirmDelete(item)}
                        hitSlop={10}
                        style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${T.danger}14`, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Ionicons name="trash-outline" size={17} color={T.danger} />
                      </Pressable>
                    )}
                  </View>
                  <Text style={{ marginTop: 10, fontWeight: '800', color: T.ink, fontSize: 17, lineHeight: 22 }}>{item.title}</Text>
                  {item.excerpt ? (
                    <Text style={{ marginTop: 6, color: T.inkMute, fontSize: 14, lineHeight: 20 }} numberOfLines={3}>{item.excerpt}</Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
                    <Ionicons name="time-outline" size={13} color={T.inkFaint} />
                    <Text style={{ color: T.inkFaint, fontSize: 12 }}>
                      {new Date(item.published_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
