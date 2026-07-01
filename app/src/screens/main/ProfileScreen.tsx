import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
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

  const [pwOpen, setPwOpen] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');

  const changePw = useMutation({
    mutationFn: () => api.post('/auth/change-password', { oldPassword: oldPw, newPassword: newPw }),
    onSuccess: () => { Alert.alert('Password changed'); setPwOpen(false); setOldPw(''); setNewPw(''); setConfirm(''); },
    onError: (e: any) => Alert.alert('Failed', e.message === 'invalid_credentials' ? 'Current password is incorrect' : (e.message || 'Could not change password')),
  });
  const submitPw = () => {
    if (newPw.length < 6) { Alert.alert('New password must be at least 6 characters'); return; }
    if (newPw !== confirm) { Alert.alert('New passwords do not match'); return; }
    changePw.mutate();
  };

  if (isLoading) return <Screen><ActivityIndicator color={T.brandBlue} style={{ marginTop: 40 }} /></Screen>;
  const me = data?.member ?? {};

  return (
    <Screen bg={T.bg}>
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Avatar initials={me.initials} color={me.role_color ?? T.brandBlue} size={92} uri={me.avatar_url} />
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

        <Card>
          <Pressable onPress={() => setPwOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="key-outline" size={20} color={T.brandBlue} />
            <Text style={{ fontWeight: '700', color: T.ink }}>Change password</Text>
            <Ionicons name="chevron-forward" size={16} color={T.inkFaint} style={{ marginLeft: 'auto' }} />
          </Pressable>
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

      <Modal visible={pwOpen} transparent animationType="fade" onRequestClose={() => setPwOpen(false)}>
        <Pressable onPress={() => setPwOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(10,18,35,0.5)', justifyContent: 'center', padding: 24 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: T.surface, borderRadius: T.r.lg, padding: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: T.ink, marginBottom: 14 }}>Change password</Text>
            <TextInput value={oldPw} onChangeText={setOldPw} placeholder="Current password" secureTextEntry placeholderTextColor={T.inkFaint} autoFocus style={inputStyle} />
            <TextInput value={newPw} onChangeText={setNewPw} placeholder="New password (min 6)" secureTextEntry placeholderTextColor={T.inkFaint} style={[inputStyle, { marginTop: 10 }]} />
            <TextInput value={confirm} onChangeText={setConfirm} placeholder="Confirm new password" secureTextEntry placeholderTextColor={T.inkFaint} style={[inputStyle, { marginTop: 10 }]} />
            <Button label={changePw.isPending ? 'Saving...' : 'Change password'} onPress={submitPw} loading={changePw.isPending} style={{ marginTop: 16 }} />
            <Pressable onPress={() => setPwOpen(false)} style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ color: T.inkMute, fontWeight: '600' }}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const inputStyle = {
  borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm,
  paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink,
} as const;

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