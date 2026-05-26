import React, { useEffect } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { api } from '../../lib/api';
import { T } from '../../theme/tokens';

interface NotifRow {
  id: number;
  type: string;
  title: string;
  body: string | null;
  icon: string | null;
  ref_table: string | null;
  ref_id: number | null;
  read_at: string | null;
  created_at: string;
}

export default function NotificationsScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ notifications: NotifRow[] }>('/notifications?limit=100'),
  });
  const markAll = useMutation({
    mutationFn: () => api.post('/notifications/read', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Mark all read on view
  useEffect(() => {
    if (data?.notifications.some(n => !n.read_at)) {
      markAll.mutate();
    }
  }, [data?.notifications.length]);

  const renderItem = ({ item }: { item: NotifRow }) => (
    <Pressable
      onPress={() => {
        if (item.ref_table === 'events' && item.ref_id) nav.navigate('EventDetail', { id: item.ref_id });
        else if (item.ref_table === 'news' && item.ref_id) nav.navigate('NewsDetail', { id: item.ref_id });
      }}
      style={{ marginBottom: 10 }}
    >
      <Card pad={14}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: item.read_at ? T.bg : `${T.brandBlue}1A`,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18 }}>{item.icon || '🔔'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text style={{ flex: 1, fontWeight: item.read_at ? '600' : '800', color: T.ink, fontSize: 14 }} numberOfLines={2}>
                {item.title}
              </Text>
              {!item.read_at && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.brandBlue }} />}
            </View>
            {item.body && <Text style={{ marginTop: 4, color: T.inkMute, fontSize: 13 }} numberOfLines={2}>{item.body}</Text>}
            <Text style={{ marginTop: 6, color: T.inkFaint, fontSize: 11 }}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Notifications</Text>
      </View>
      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> :
        isError ? <ErrorState onRetry={refetch} /> :
        (data?.notifications.length ?? 0) === 0 ? (
          <EmptyState
            icon="notifications-outline"
            title="No notifications yet"
            body="Event reminders and announcements will appear here."
          />
        ) : (
          <FlatList
            data={data?.notifications ?? []}
            keyExtractor={n => String(n.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            renderItem={renderItem}
          />
        )
      }
    </Screen>
  );
}
