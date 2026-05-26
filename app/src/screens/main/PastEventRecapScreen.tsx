import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { api } from '../../lib/api';
import { T } from '../../theme/tokens';

const { width } = Dimensions.get('window');
const COLS = 3;
const GAP = 4;
const THUMB = (width - 32 - GAP * (COLS - 1)) / COLS;

interface Attendee { id: number; name: string; initials: string; avatar_color: string | null; status: 'yes'|'no'|'maybe'; }
interface Photo { id: number; url: string; caption: string | null; }

export default function PastEventRecapScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const id = route.params.id as number;

  const ev = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get<{ event: any; attendees: Attendee[] }>(`/events/${id}`),
  });
  const photos = useQuery({
    queryKey: ['photos', 'event', id],
    queryFn: () => api.get<{ photos: Photo[] }>(`/photos?event_id=${id}`),
  });

  if (ev.isLoading || !ev.data?.event) {
    return <Screen><ActivityIndicator color={T.brandBlue} style={{ marginTop: 40 }} /></Screen>;
  }
  const e = ev.data.event;
  const attended = ev.data.attendees.filter(a => a.status === 'yes');

  return (
    <Screen bg={T.bgWarm}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Recap</Text>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <Pill label="Past event" color={T.inkMute} />
        <Text style={{ marginTop: 10, fontSize: 24, fontWeight: '800', color: T.ink, letterSpacing: -0.4 }}>{e.title}</Text>
        <Text style={{ marginTop: 6, color: T.inkMute, fontSize: 13 }}>
          {new Date(e.starts_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })} · {e.venue}
        </Text>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
          <Stat label="Attended" value={String(attended.length)} />
          <Stat label="Photos"   value={String(photos.data?.photos.length ?? 0)} />
        </View>

        {e.description && (
          <Card style={{ marginTop: 14 }}>
            <Text style={{ color: T.inkSoft, lineHeight: 20 }}>{e.description}</Text>
          </Card>
        )}

        <Text style={{ marginTop: 22, fontWeight: '700', color: T.ink, fontSize: 15 }}>Lions present</Text>
        <FlatList
          horizontal
          data={attended}
          keyExtractor={a => String(a.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
          renderItem={({ item }) => (
            <View style={{ alignItems: 'center', width: 64 }}>
              <Avatar initials={item.initials} color={item.avatar_color ?? T.brandBlue} size={48} />
              <Text style={{ fontSize: 11, marginTop: 4, textAlign: 'center', color: T.inkSoft }} numberOfLines={1}>
                {item.name.replace(/^Lion /, '')}
              </Text>
            </View>
          )}
        />

        {(photos.data?.photos.length ?? 0) > 0 && (
          <>
            <Text style={{ marginTop: 18, fontWeight: '700', color: T.ink, fontSize: 15 }}>Photo gallery</Text>
            <FlatList
              data={photos.data?.photos ?? []}
              keyExtractor={p => String(p.id)}
              numColumns={COLS}
              scrollEnabled={false}
              columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
              style={{ marginTop: 10 }}
              renderItem={({ item }) => (
                <Image source={{ uri: item.url }} style={{ width: THUMB, height: THUMB, borderRadius: T.r.sm, backgroundColor: T.bg }} />
              )}
            />
          </>
        )}
      </View>
    </Screen>
  );
}

const Stat = ({ label, value }: any) => (
  <View style={{ flex: 1, backgroundColor: T.surface, borderRadius: T.r.md, padding: 12 }}>
    <Text style={{ fontSize: 10, fontWeight: '800', color: T.inkMute, letterSpacing: 1 }}>{label.toUpperCase()}</Text>
    <Text style={{ marginTop: 4, fontSize: 18, fontWeight: '800', color: T.ink }}>{value}</Text>
  </View>
);
