import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert, FlatList } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Pill } from '../../components/Pill';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

interface Referral {
  id: number; candidate_name: string; candidate_phone: string | null;
  candidate_email: string | null; candidate_profession: string | null;
  notes: string | null; status: 'new'|'contacted'|'inducted'|'declined';
  created_at: string; referrer_name: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  new: T.brandBlue, contacted: T.warning, inducted: T.success, declined: T.inkMute,
};

export default function ReferLionScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [form, setForm] = useState({
    candidate_name: '', candidate_phone: '', candidate_email: '', candidate_profession: '', notes: '',
  });

  const list = useQuery({
    queryKey: ['referrals'],
    queryFn: () => api.get<{ referrals: Referral[] }>('/referrals'),
  });

  const submit = useMutation({
    mutationFn: () => api.post('/referrals', {
      candidate_name: form.candidate_name,
      candidate_phone: form.candidate_phone || null,
      candidate_email: form.candidate_email || null,
      candidate_profession: form.candidate_profession || null,
      notes: form.notes || null,
    }),
    onSuccess: () => {
      Alert.alert('Referral submitted', 'The Membership Chair will follow up.');
      setForm({ candidate_name: '', candidate_phone: '', candidate_email: '', candidate_profession: '', notes: '' });
      qc.invalidateQueries({ queryKey: ['referrals'] });
    },
    onError: (e: any) => Alert.alert('Failed', e.message),
  });

  const onSubmit = () => {
    if (form.candidate_name.trim().length < 2) { Alert.alert('Enter candidate name'); return; }
    submit.mutate();
  };

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Refer a Lion</Text>
      </View>
      <ScrollView style={{ paddingHorizontal: 16 }}>
        <Card style={{ marginBottom: 14 }}>
          <Text style={{ fontWeight: '800', color: T.ink, fontSize: 17 }}>Know someone Lion-worthy?</Text>
          <Text style={{ color: T.inkMute, marginTop: 6, fontSize: 13, lineHeight: 19 }}>
            Submit their details — Membership Chair will reach out, schedule a chat, and bring them through the induction process.
          </Text>
        </Card>

        <Card>
          <Field label="Candidate name *" value={form.candidate_name} onChange={(v: string) => setForm(s => ({ ...s, candidate_name: v }))} />
          <Field label="Profession"       value={form.candidate_profession} onChange={(v: string) => setForm(s => ({ ...s, candidate_profession: v }))} />
          <Field label="Phone"            value={form.candidate_phone} onChange={(v: string) => setForm(s => ({ ...s, candidate_phone: v }))} keyboard="phone-pad" />
          <Field label="Email"            value={form.candidate_email} onChange={(v: string) => setForm(s => ({ ...s, candidate_email: v }))} keyboard="email-address" />
          <Field label="Why a good fit?"  value={form.notes} onChange={(v: string) => setForm(s => ({ ...s, notes: v }))} multiline />
        </Card>
        <Button label="Submit referral" variant="gold" onPress={onSubmit} loading={submit.isPending} style={{ marginTop: 14 }} />

        <Text style={{ marginTop: 26, marginBottom: 10, fontSize: 11, fontWeight: '800', color: T.inkMute, letterSpacing: 1 }}>
          {member?.canEdit ? 'ALL REFERRALS' : 'YOUR REFERRALS'}
        </Text>
        {(list.data?.referrals.length ?? 0) === 0 ? <EmptyState icon="person-add-outline" title="No referrals yet" body="Submit one above to get started." /> :
          (list.data?.referrals ?? []).map(r => (
            <Card key={r.id} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: T.ink }}>{r.candidate_name}</Text>
                  {r.candidate_profession && <Text style={{ color: T.inkMute, fontSize: 13, marginTop: 2 }}>{r.candidate_profession}</Text>}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <Pill label={r.status} color={STATUS_COLOR[r.status]} />
                    {r.referrer_name && <Text style={{ color: T.inkFaint, fontSize: 11 }}>by {r.referrer_name.replace(/^Lion /, '')}</Text>}
                  </View>
                </View>
              </View>
            </Card>
          ))
        }
        <View style={{ height: 32 }} />
      </ScrollView>
    </Screen>
  );
}

const Field = ({ label, value, onChange, keyboard, multiline }: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>{label.toUpperCase()}</Text>
    <TextInput
      value={value} onChangeText={onChange} multiline={multiline} keyboardType={keyboard}
      placeholderTextColor={T.inkFaint}
      style={{
        borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink,
        minHeight: multiline ? 80 : 44, textAlignVertical: multiline ? 'top' : 'center',
      }}
    />
  </View>
);
