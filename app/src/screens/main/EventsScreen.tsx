import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

interface EventRow {
  id: number; title: string; type: string; starts_at: string; venue: string;
  going: number; my_status: string | null;
}

const monthAbbr = (d: Date) => d.toLocaleString('en-US', { month: 'short' }).toUpperCase();

export default function EventsScreen() {
  const nav = useNavigation<any>();
  const { member } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['events', 'all'],
    queryFn: () => api.get<{ events: EventRow[] }>('/events?limit=100'),
  });

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.5 }}>Events</Text>
          <Text style={{ color: T.inkMute, marginTop: 2 }}>RSVP to confirm</Text>
        </View>
        {member?.canEdit && (
          <Pressable onPress={() => nav.navigate('OfficerAdmin')} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: T.brandBlue, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        )}
      </View>
      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> : (
        <FlatList
          data={data?.events ?? []}
          keyExtractor={e => String(e.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const d = new Date(item.starts_at);
            return (
              <Pressable onPress={() => nav.navigate('EventDetail', { id: item.id })} style={{ marginBottom: 12 }}>
                <Card pad={14}>
                  <View style={{ flexDirection: 'row', gap: 14 }}>
                    <View style={{ width: 56, alignItems: 'center', borderRadius: T.r.md, backgroundColor: T.bg, paddingVertical: 8 }}>
                      <Text style={{ fontSize: 22, fontWeight: '800', color: T.ink }}>{d.getDate()}</Text>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: T.inkMute, letterSpacing: 1 }}>{monthAbbr(d)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Pill label={item.type} color={item.type === 'Service' ? T.success : item.type === 'Meeting' ? T.brandBlue : T.brandGoldDark} />
                      <Text style={{ marginTop: 6, fontWeight: '700', color: T.ink }}>{item.title}</Text>
                      <Text style={{ color: T.inkMute, fontSize: 12, marginTop: 4 }} numberOfLines={1}>
                        {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {item.venue}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
                        <Ionicons name="people" size={12} color={T.inkMute} />
                        <Text style={{ color: T.inkSoft, fontSize: 12 }}>{item.going} going</Text>
                        {item.my_status === 'yes' && <Text style={{ color: T.success, fontSize: 12, fontWeight: '700', marginLeft: 'auto' }}>YOU'RE GOING</Text>}
                      </View>
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}
