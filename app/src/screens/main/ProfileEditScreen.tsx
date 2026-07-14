import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

const FIELDS: { key: string; label: string; keyboard?: any; multiline?: boolean }[] = [
  { key: 'profession', label: 'Profession' },
  { key: 'business',   label: 'Business' },
  { key: 'area',       label: 'Area' },
  { key: 'phone',      label: 'Phone', keyboard: 'phone-pad' },
  { key: 'email',      label: 'Email', keyboard: 'email-address' },
  { key: 'dob',        label: 'Birthday (e.g. Mar 14)' },
  { key: 'anniv',      label: 'Anniversary (e.g. Nov 22)' },
  { key: 'spouse',     label: 'Spouse' },
  { key: 'bio',        label: 'Short bio', multiline: true },
  { key: 'expertise',      label: 'Expertise', multiline: true },
  { key: 'goals',          label: 'Goals', multiline: true },
  { key: 'accomplishments', label: 'Accomplishments', multiline: true },
  { key: 'interests',      label: 'Interests', multiline: true },
  { key: 'network',        label: 'Network', multiline: true },
  { key: 'social',         label: 'Social connections', multiline: true },
];

export default function ProfileEditScreen() {
  const nav = useNavigation<any>();
  const { member } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<{ member: any }>('/members/me'),
  });
  const [form, setForm] = useState<Record<string, string>>({});
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (data?.member) {
      const f: Record<string, string> = {};
      for (const { key } of FIELDS) f[key] = data.member[key] ?? '';
      setForm(f);
      setAvatarUrl(data.member.avatar_url ?? '');
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => api.patch(`/members/${member?.id}`, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      Alert.alert('Saved');
      nav.goBack();
    },
    onError: (e: any) => Alert.alert('Save failed', e.message),
  });

  const onPickAvatar = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true });
      const asset = res.assets?.[0];
      if (!asset?.base64) return;
      setUploading(true);
      try {
        const r = await api.post<{ url: string }>('/members/me/avatar', { file: `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}` });
        setAvatarUrl(r.url);
        qc.invalidateQueries({ queryKey: ['me'] });
      } catch (e: any) { Alert.alert('Upload failed', e?.message); } finally { setUploading(false); }
    } catch (e: any) { Alert.alert('Could not pick photo', e?.message); }
  };

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Edit profile</Text>
      </View>
      <ScrollView style={{ paddingHorizontal: 16 }}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Avatar initials={(member?.name ?? '').split(' ').map(w => w[0]).join('')} color={T.brandBlue} size={96} uri={avatarUrl || null} />
          <Pressable onPress={onPickAvatar} style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="camera" size={16} color={T.brandBlue} />
            <Text style={{ color: T.brandBlue, fontWeight: '700' }}>{uploading ? 'Uploading...' : 'Change photo'}</Text>
          </Pressable>
        </View>
        <Card>
          {FIELDS.map(f => (
            <View key={f.key} style={{ marginBottom: 14 }}>
              <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>{f.label.toUpperCase()}</Text>
              <TextInput
                value={form[f.key] ?? ''}
                onChangeText={v => setForm(s => ({ ...s, [f.key]: v }))}
                keyboardType={f.keyboard}
                multiline={f.multiline}
                style={{
                  borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm,
                  paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink,
                  minHeight: f.multiline ? 100 : 44, textAlignVertical: f.multiline ? 'top' : 'center',
                }}
              />
            </View>
          ))}
        </Card>
        <Button label="Save" onPress={() => save.mutate()} loading={save.isPending} style={{ marginTop: 16, marginBottom: 32 }} />
      </ScrollView>
    </Screen>
  );
}
