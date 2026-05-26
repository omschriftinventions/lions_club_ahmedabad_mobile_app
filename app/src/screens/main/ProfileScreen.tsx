import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

export default function ProfileScreen() {
  const nav = useNavigation<any>();
  const { logout, member } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<{ member: any }>('/members/me'),
  });

  if (isLoading) return <Screen><ActivityIndicator color={T.brandBlue} style={{ marginTop: 40 }} /></Screen>;
  const me = data?.member ?? {};

  return (
    <Screen bg={T.bg}>
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Avatar initials={me.initials} color={me.role_color ?? T.brandBlue} size={92} />
        <Text style={{ marginTop: 12, fontSize: 22, fontWeight: '800', color: T.ink }}>{me.name}</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
          <Pill label={me.role_label ?? 'Member'} color={me.role_color ?? T.brandBlue} />
          {me.designation && <Pill label={me.designation} color={T.brandGoldDark} />}
        </View>
        <Button label="Edit profile" variant="outline" full={false} onPress={() => nav.navigate('ProfileEdit')} style={{ marginTop: 18 }} />
      </View>

      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        <Card>
          <Row icon="briefcase" label="Profession" value={me.profession} />
          <Row icon="business" label="Business" value={me.business} />
          <Row icon="location" label="Area" value={me.area} />
          <Row icon="call" label="Phone" value={me.phone} />
          <Row icon="mail" label="Email" value={me.email} />
        </Card>
        <Card>
          <Row icon="calendar" label="Joined" value={me.joined_year ? String(me.joined_year) : null} />
          <Row icon="gift" label="Birthday" value={me.dob} />
          <Row icon="heart" label="Anniversary" value={me.anniv} />
          <Row icon="people" label="Spouse" value={me.spouse} />
        </Card>

        {member?.canEdit && (
          <Card>
            <Pressable onPress={() => nav.navigate('OfficerAdmin')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="shield-checkmark" size={20} color={T.brandBlue} />
              <Text style={{ fontWeight: '700', color: T.ink }}>Officer admin panel</Text>
              <Ionicons name="chevron-forward" size={16} color={T.inkFaint} style={{ marginLeft: 'auto' }} />
            </Pressable>
          </Card>
        )}
        <Card>
          <Pressable onPress={() => nav.navigate('Info')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="information-circle" size={20} color={T.brandBlue} />
            <Text style={{ fontWeight: '700', color: T.ink }}>About the club</Text>
            <Ionicons name="chevron-forward" size={16} color={T.inkFaint} style={{ marginLeft: 'auto' }} />
          </Pressable>
        </Card>

        <Button label="Sign out" variant="ghost" onPress={logout} style={{ marginTop: 10 }} />
      </View>
    </Screen>
  );
}

const Row = ({ icon, label, value }: { icon: any; label: string; value: string | null | undefined }) =>
  value ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 }}>
      <Ionicons name={icon} size={18} color={T.inkMute} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5 }}>{label.toUpperCase()}</Text>
        <Text style={{ color: T.ink, fontSize: 14, marginTop: 1 }}>{value}</Text>
      </View>
    </View>
  ) : null;
