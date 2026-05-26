import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Modal } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

interface EventRow { id: number; title: string; type: string; starts_at: string; venue: string; }
interface AttRow {
  id: number; name: string; initials: string; avatar_color: string | null;
  role: string; role_label: string; role_color: string;
  rsvp_status: 'yes' | 'no' | 'maybe'; attended: 0 | 1; attended_at: string | null;
}

export default function AttendanceScreen() {
  const nav = useNavigation<any>();
  const { member } = useAuth();
  const qc = useQueryClient();
  const [eventId, setEventId] = useState<number | null>(null);
  const [picker, setPicker] = useState(false);

  if (!member?.canEdit) {
    return (
      <Screen><View style={{ padding: 24 }}>
        <Text style={{ color: T.danger, fontWeight: '700' }}>Forbidden</Text>
        <Text style={{ color: T.inkMute, marginTop: 6 }}>Officer access required.</Text>
      </View></Screen>
    );
  }

  const events = useQuery({
    queryKey: ['events', 'all'],
    queryFn: () => api.get<{ events: EventRow[] }>('/events?limit=100'),
  });
  const attendance = useQuery({
    queryKey: ['attendance', eventId],
    queryFn: () => api.get<{ attendance: AttRow[] }>(`/attendance/${eventId}`),
    enabled: !!eventId,
  });
  const toggle = useMutation({
    mutationFn: ({ memberId, attended }: { memberId: number; attended: boolean }) =>
      api.put(`/attendance/${eventId}/${memberId}`, { attended }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance', eventId] }),
  });

  const selectedEvent = events.data?.events.find(e => e.id === eventId);
  const presentCount = attendance.data?.attendance.filter(a => a.attended).length ?? 0;
  const totalCount = attendance.data?.attendance.length ?? 0;

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Attendance</Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <Pressable onPress={() => setPicker(true)}>
          <Card pad={14}>
            <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5 }}>EVENT</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
              <Text style={{ flex: 1, fontWeight: '700', color: T.ink, fontSize: 15 }} numberOfLines={1}>
                {selectedEvent ? selectedEvent.title : 'Tap to choose event'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={T.inkMute} />
            </View>
            {selectedEvent && (
              <Text style={{ color: T.inkMute, fontSize: 12, marginTop: 4 }}>
                {new Date(selectedEvent.starts_at).toLocaleDateString()} · {selectedEvent.venue}
              </Text>
            )}
          </Card>
        </Pressable>

        {eventId && (
          <Text style={{ marginTop: 14, marginBottom: 8, color: T.inkSoft, fontWeight: '700' }}>
            {presentCount} / {totalCount} present
          </Text>
        )}
      </View>

      {!eventId ? (
        <EmptyState icon="people-outline" title="Choose an event" body="Pick an event to start marking attendance." />
      ) : attendance.isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> : (
        <FlatList
          data={attendance.data?.attendance ?? []}
          keyExtractor={a => String(a.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggle.mutate({ memberId: item.id, attended: !item.attended })}
              style={{
                flexDirection: 'row', backgroundColor: T.surface, padding: 12, borderRadius: T.r.md,
                marginBottom: 8, alignItems: 'center', gap: 12,
                borderWidth: 2, borderColor: item.attended ? T.success : 'transparent',
              }}
            >
              <Avatar initials={item.initials} color={item.avatar_color ?? item.role_color} size={42} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: T.ink }} numberOfLines={1}>{item.name}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  <Pill label={item.role_label} color={item.role_color} />
                  {item.rsvp_status === 'yes' && <Pill label="RSVP yes" color={T.brandBlue} />}
                </View>
              </View>
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: item.attended ? T.success : T.bg,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: item.attended ? 0 : 1.5, borderColor: T.line,
              }}>
                {item.attended ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Event picker modal */}
      <Modal visible={picker} animationType="slide" onRequestClose={() => setPicker(false)}>
        <Screen bg={T.bg} scroll={false}>
          <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => setPicker(false)}><Ionicons name="close" size={26} color={T.ink} /></Pressable>
            <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Pick event</Text>
          </View>
          <FlatList
            data={events.data?.events ?? []}
            keyExtractor={e => String(e.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => { setEventId(item.id); setPicker(false); }} style={{ marginBottom: 10 }}>
                <Card pad={14}>
                  <Pill label={item.type} color={item.type === 'Service' ? T.success : T.brandBlue} />
                  <Text style={{ marginTop: 6, fontWeight: '700', color: T.ink }}>{item.title}</Text>
                  <Text style={{ color: T.inkMute, fontSize: 12, marginTop: 4 }}>
                    {new Date(item.starts_at).toLocaleString()} · {item.venue}
                  </Text>
                </Card>
              </Pressable>
            )}
          />
        </Screen>
      </Modal>
    </Screen>
  );
}
