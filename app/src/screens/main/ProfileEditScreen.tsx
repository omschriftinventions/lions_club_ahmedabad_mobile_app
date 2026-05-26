import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

const FIELDS: { key: string; label: string; keyboard?: any }[] = [
  { key: 'profession', label: 'Profession' },
  { key: 'business',   label: 'Business' },
  { key: 'area',       label: 'Area' },
  { key: 'phone',      label: 'Phone', keyboard: 'phone-pad' },
  { key: 'email',      label: 'Email', keyboard: 'email-address' },
  { key: 'dob',        label: 'Birthday (e.g. Mar 14)' },
  { key: 'anniv',      label: 'Anniversary (e.g. Nov 22)' },
  { key: 'spouse',     label: 'Spouse' },
  { key: 'bio',        label: 'Short bio' },
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
  useEffect(() => {
    if (data?.member) {
      const f: Record<string, string> = {};
      for (const { key } of FIELDS) f[key] = data.member[key] ?? '';
      setForm(f);
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

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="close" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Edit profile</Text>
      </View>
      <ScrollView style={{ paddingHorizontal: 16 }}>
        <Card>
          {FIELDS.map(f => (
            <View key={f.key} style={{ marginBottom: 14 }}>
              <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>{f.label.toUpperCase()}</Text>
              <TextInput
                value={form[f.key] ?? ''}
                onChangeText={v => setForm(s => ({ ...s, [f.key]: v }))}
                keyboardType={f.keyboard}
                multiline={f.key === 'bio'}
                style={{
                  borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm,
                  paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink,
                  minHeight: f.key === 'bio' ? 100 : 44, textAlignVertical: f.key === 'bio' ? 'top' : 'center',
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
