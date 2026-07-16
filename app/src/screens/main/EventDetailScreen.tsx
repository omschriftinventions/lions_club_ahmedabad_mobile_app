import React from 'react';
import { View, Text, ActivityIndicator, Pressable, ScrollView, Linking, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { HtmlView } from '../../components/HtmlView';
import { T } from '../../theme/tokens';

export default function EventDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const id = route.params.id as number;
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get<{ event: any; attendees: any[] }>(`/events/${id}`),
  });
  const { member } = useAuth();
  const rsvp = useMutation({
    mutationFn: (status: 'yes'|'no'|'maybe') => api.put(`/events/${id}/rsvp`, { status, guests: 0 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
  const del = useMutation({
    mutationFn: () => api.delete(`/events/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); nav.goBack(); },
  });

  if (isLoading || !data?.event) return <Screen><ActivityIndicator color={T.brandBlue} style={{ marginTop: 40 }} /></Screen>;
  const e = data.event;
  const d = new Date(e.starts_at);
  const isPast = e.starts_at ? new Date(e.starts_at).getTime() < Date.now() : false;

  return (
    <Screen bg={T.bgWarm}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Event</Text>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <Pill label={e.type} color={e.type === 'Service' ? T.success : T.brandBlue} />
        <Text style={{ marginTop: 10, fontSize: 24, fontWeight: '800', color: T.ink, letterSpacing: -0.4 }}>{e.title}</Text>

        <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
          <View style={{ width: 64, alignItems: 'center', backgroundColor: T.surface, borderRadius: T.r.md, paddingVertical: 10 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: T.ink }}>{d.getDate()}</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: T.inkMute, letterSpacing: 1 }}>{d.toLocaleString('en-US', { month: 'short' }).toUpperCase()}</Text>
            <Text style={{ fontSize: 10, color: T.inkMute, marginTop: 2 }}>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <Pressable onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(e.venue ?? '')}`)} style={{ flex: 1, backgroundColor: T.surface, borderRadius: T.r.md, padding: 12 }}>
            <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 1 }}>VENUE</Text>
            <Text style={{ color: T.ink, fontWeight: '700', marginTop: 2 }}>{e.venue}</Text>
            <Text style={{ color: T.brandBlue, fontSize: 12, marginTop: 6, fontWeight: '600' }}>Open in Maps →</Text>
          </Pressable>
        </View>

        {e.description && (
          <HtmlView html={e.description} style={{ marginTop: 14 }} />
        )}

        {(e.code_no || e.time_in || e.no_of_members != null || e.expenses != null || e.beneficiaries != null || (e.members_present?.length)) ? (
          <View style={{ marginTop: 16, backgroundColor: T.surface, borderRadius: T.r.md, padding: 14 }}>
            <Text style={{ color: T.inkMute, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 }}>SERVICE ACTIVITY REPORT</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {e.code_no != null && <RepStat label="Code No." value={e.code_no} />}
              {e.time_in && <RepStat label="Time in" value={e.time_in} />}
              {e.time_out && <RepStat label="Time out" value={e.time_out} />}
              {e.no_of_members != null && <RepStat label="Members" value={e.no_of_members} />}
              {e.no_of_hours != null && <RepStat label="Hours" value={e.no_of_hours} />}
              {e.no_of_man_hours != null && <RepStat label="Man hours" value={e.no_of_man_hours} />}
              {e.expenses != null && <RepStat label="Expenses" value={`₹${Number(e.expenses).toLocaleString('en-IN')}`} />}
              {e.beneficiaries != null && <RepStat label="Beneficiaries" value={e.beneficiaries} />}
            </View>
            {(e.members_present?.length > 0 || e.member_names) && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: T.inkFaint, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 }}>MEMBERS PRESENT</Text>
                {e.members_present?.length > 0 ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {e.members_present.map((m: any) => (
                      <View key={m.id} style={{ backgroundColor: T.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 12, color: T.inkSoft }}>{m.name}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={{ color: T.inkSoft, fontSize: 13, lineHeight: 19 }}>{e.member_names}</Text>
                )}
              </View>
            )}
          </View>
        ) : null}

        {isPast ? (
          <View style={{ marginTop: 16, backgroundColor: T.surface, borderRadius: T.r.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="time-outline" size={16} color={T.inkMute} />
            <Text style={{ color: T.inkMute, fontSize: 13 }}>This event has ended. RSVP is closed.</Text>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <Button label={e.my_status === 'yes' ? "You're going ✓" : "I'll be there"} variant={e.my_status === 'yes' ? 'gold' : 'primary'} onPress={() => rsvp.mutate('yes')} loading={rsvp.isPending} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <Button label="Maybe" variant="outline" onPress={() => rsvp.mutate('maybe')} />
              <Button label="Can't make it" variant="ghost" onPress={() => rsvp.mutate('no')} />
            </View>
          </>
        )}

        <Text style={{ marginTop: 22, fontSize: 13, color: T.inkMute, fontWeight: '700', letterSpacing: 0.5 }}>GOING · {data.attendees.filter(a => a.status === 'yes').length}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 10 }}>
          {data.attendees.filter(a => a.status === 'yes').map(a => (
            <View key={a.id} style={{ alignItems: 'center', width: 64 }}>
              <Avatar initials={a.initials} color={a.avatar_color ?? T.inkMute} size={48} />
              <Text style={{ fontSize: 11, marginTop: 4, textAlign: 'center', color: T.inkSoft }} numberOfLines={1}>{a.name.replace(/^Lion /, '')}</Text>
            </View>
          ))}
        </ScrollView>

        {member?.canEdit && (
          <View style={{ marginTop: 18 }}>
            <Button
              label="Delete event"
              variant="ghost"
              onPress={() => Alert.alert('Delete event?', 'Members will no longer see it.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => del.mutate() },
              ])}
              loading={del.isPending}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}

const RepStat = ({ label, value }: { label: string; value: any }) => (
  <View style={{ width: '33.33%', marginBottom: 10 }}>
    <Text style={{ color: T.inkFaint, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>{label.toUpperCase()}</Text>
    <Text style={{ color: T.ink, fontSize: 15, fontWeight: '800', marginTop: 2 }}>{String(value)}</Text>
  </View>
);
