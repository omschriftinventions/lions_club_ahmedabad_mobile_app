import React from 'react';
import { View, Text, ActivityIndicator, Pressable, ScrollView, Linking } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
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
  const rsvp = useMutation({
    mutationFn: (status: 'yes'|'no'|'maybe') => api.put(`/events/${id}/rsvp`, { status, guests: 0 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });

  if (isLoading || !data?.event) return <Screen><ActivityIndicator color={T.brandBlue} style={{ marginTop: 40 }} /></Screen>;
  const e = data.event;
  const d = new Date(e.starts_at);

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
          <Card style={{ marginTop: 14 }}>
            <Text style={{ color: T.inkSoft, lineHeight: 20 }}>{e.description}</Text>
          </Card>
        )}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          <Button label={e.my_status === 'yes' ? "You're going ✓" : "I'll be there"} variant={e.my_status === 'yes' ? 'gold' : 'primary'} onPress={() => rsvp.mutate('yes')} loading={rsvp.isPending} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Button label="Maybe" variant="outline" onPress={() => rsvp.mutate('maybe')} />
          <Button label="Can't make it" variant="ghost" onPress={() => rsvp.mutate('no')} />
        </View>

        <Text style={{ marginTop: 22, fontSize: 13, color: T.inkMute, fontWeight: '700', letterSpacing: 0.5 }}>GOING · {data.attendees.filter(a => a.status === 'yes').length}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 10 }}>
          {data.attendees.filter(a => a.status === 'yes').map(a => (
            <View key={a.id} style={{ alignItems: 'center', width: 64 }}>
              <Avatar initials={a.initials} color={a.avatar_color ?? T.inkMute} size={48} />
              <Text style={{ fontSize: 11, marginTop: 4, textAlign: 'center', color: T.inkSoft }} numberOfLines={1}>{a.name.replace(/^Lion /, '')}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}
