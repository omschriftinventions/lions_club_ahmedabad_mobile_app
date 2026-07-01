import React from 'react';
import { View, Text, ActivityIndicator, Pressable, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { api } from '../../lib/api';
import { T } from '../../theme/tokens';

export default function MemberDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const id = route.params.id;
  const { data, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => api.get<{ member: any }>(`/members/${id}`),
  });

  if (isLoading || !data?.member) {
    return <Screen><ActivityIndicator color={T.brandBlue} style={{ marginTop: 40 }} /></Screen>;
  }
  const m = data.member;

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Member</Text>
      </View>

      <View style={{ alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 }}>
        <Avatar initials={m.initials} color={m.avatar_color ?? m.role_color} size={104} uri={m.avatar_url} />
        <Text style={{ marginTop: 14, fontSize: 22, fontWeight: '800', color: T.ink }}>{m.name}</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
          <Pill label={m.role_label} color={m.role_color} />
          {m.designation && <Pill label={m.designation} color={T.brandGoldDark} />}
        </View>

        <View style={{ flexDirection: 'row', gap: 14, marginTop: 18 }}>
          {m.phone && <IconBtn icon="call" label="Call"  onPress={() => Linking.openURL(`tel:${m.phone}`)} />}
          {m.phone && <IconBtn icon="logo-whatsapp" label="WhatsApp" onPress={() => Linking.openURL(`https://wa.me/${m.phone.replace(/\D/g, '')}`)} />}
          {m.email && <IconBtn icon="mail" label="Email" onPress={() => Linking.openURL(`mailto:${m.email}`)} />}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        <Card>
          <Row icon="briefcase" label="Profession" value={m.profession} />
          <Row icon="business" label="Business" value={m.business} />
          <Row icon="location" label="Area" value={m.area} />
        </Card>
        <Card>
          <Row icon="call" label="Phone" value={m.phone} />
          <Row icon="mail" label="Email" value={m.email} />
        </Card>
        <Card>
          <Row icon="calendar" label="Joined" value={m.joined_year ? String(m.joined_year) : null} />
          <Row icon="gift" label="Birthday" value={m.dob} />
          <Row icon="heart" label="Anniversary" value={m.anniv} />
          <Row icon="people" label="Spouse" value={m.spouse} />
        </Card>
        {m.bio && <Card><Text style={{ color: T.inkSoft, lineHeight: 20 }}>{m.bio}</Text></Card>}
        {(m.expertise || m.goals || m.accomplishments || m.interests || m.network || m.social) ? (
          <Card>
            <Text style={{ color: T.inkMute, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 }}>NETWORKING (E-GAINS)</Text>
            <Eg label="Expertise" v={m.expertise} />
            <Eg label="Goals" v={m.goals} />
            <Eg label="Accomplishments" v={m.accomplishments} />
            <Eg label="Interests" v={m.interests} />
            <Eg label="Network" v={m.network} />
            <Eg label="Social connections" v={m.social} />
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

const IconBtn = ({ icon, label, onPress }: any) => (
  <Pressable onPress={onPress} style={{ alignItems: 'center', gap: 6 }}>
    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: T.brandBlue, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={22} color="#fff" />
    </View>
    <Text style={{ fontSize: 11, color: T.inkSoft, fontWeight: '600' }}>{label}</Text>
  </Pressable>
);

const Row = ({ icon, label, value }: any) =>
  value ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 }}>
      <Ionicons name={icon} size={18} color={T.inkMute} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5 }}>{label.toUpperCase()}</Text>
        <Text style={{ color: T.ink, fontSize: 14, marginTop: 1 }}>{value}</Text>
      </View>
    </View>
  ) : null;
const Eg = ({ label, v }: any) => v && v.trim() ? (
  <View style={{ marginBottom: 10 }}>
    <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5 }}>{label.toUpperCase()}</Text>
    <Text style={{ color: T.ink, fontSize: 14, marginTop: 2, lineHeight: 19 }}>{v}</Text>
  </View>
) : null;
