import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

interface Role { id: number; code: string; label: string; color: string; }

export default function AddMemberScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { member } = useAuth();

  if (!member?.canEdit) {
    return (
      <Screen><View style={{ padding: 24 }}>
        <Text style={{ color: T.danger, fontWeight: '700' }}>Forbidden</Text>
        <Text style={{ color: T.inkMute, marginTop: 6 }}>President / Secretary / Treasurer only.</Text>
      </View></Screen>
    );
  }

  const [form, setForm] = useState<Record<string, string>>({
    name: '', role: 'MEMBER', designation: '', profession: '', business: '',
    area: '', phone: '', email: '', joined_year: '',
  });

  const create = useMutation({
    mutationFn: () => {
      const body: any = { name: form.name, role: form.role };
      for (const k of ['designation','profession','business','area','phone','email'] as const) {
        if (form[k]?.trim()) body[k] = form[k].trim();
      }
      if (form.joined_year && /^\d{4}$/.test(form.joined_year)) body.joined_year = Number(form.joined_year);
      return api.post<{ id: number }>('/members', body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] });
      Alert.alert('Member added');
      nav.goBack();
    },
    onError: (e: any) => Alert.alert('Failed', e.message),
  });

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="close" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Add new Lion</Text>
      </View>
      <ScrollView style={{ paddingHorizontal: 16 }}>
        <Card>
          <Field label="Name *"   value={form.name}   onChange={(v: string) => setForm(s => ({ ...s, name: v }))} hint="Lion Full Name" />
          <RolePicker value={form.role} onChange={(v: string) => setForm(s => ({ ...s, role: v }))} />
          <Field label="Designation" value={form.designation} onChange={(v: string) => setForm(s => ({ ...s, designation: v }))} hint="PMJF / MJF / JF" />
          <Field label="Profession" value={form.profession} onChange={(v: string) => setForm(s => ({ ...s, profession: v }))} />
          <Field label="Business"   value={form.business}   onChange={(v: string) => setForm(s => ({ ...s, business: v }))} />
          <Field label="Area"       value={form.area}       onChange={(v: string) => setForm(s => ({ ...s, area: v }))} />
          <Field label="Phone"      value={form.phone}      onChange={(v: string) => setForm(s => ({ ...s, phone: v }))} hint="+91 98250 12345" keyboard="phone-pad" />
          <Field label="Email"      value={form.email}      onChange={(v: string) => setForm(s => ({ ...s, email: v }))} keyboard="email-address" />
          <Field label="Joined year" value={form.joined_year} onChange={(v: string) => setForm(s => ({ ...s, joined_year: v }))} keyboard="number-pad" />
        </Card>
        <Button label="Add Lion" variant="gold" onPress={() => create.mutate()} loading={create.isPending} style={{ marginTop: 16, marginBottom: 32 }} />
      </ScrollView>
    </Screen>
  );
}

const ROLES = [
  { code: 'PRESIDENT',        label: 'President' },
  { code: 'SECRETARY',        label: 'Secretary' },
  { code: 'TREASURER',        label: 'Treasurer' },
  { code: 'VP1',              label: '1st VP' },
  { code: 'VP2',              label: '2nd VP' },
  { code: 'MEMBERSHIP_CHAIR', label: 'Membership' },
  { code: 'SERVICE_CHAIR',    label: 'Service' },
  { code: 'TAIL_TWISTER',     label: 'Tail Twister' },
  { code: 'MEMBER',           label: 'Member' },
];

const RolePicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 6 }}>ROLE</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {ROLES.map(r => (
        <Pressable key={r.code} onPress={() => onChange(r.code)} style={{
          paddingHorizontal: 12, paddingVertical: 7, borderRadius: T.r.pill,
          borderWidth: 1, borderColor: value === r.code ? T.brandBlue : T.line,
          backgroundColor: value === r.code ? T.brandBlue : 'transparent',
        }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: value === r.code ? '#fff' : T.inkSoft }}>{r.label}</Text>
        </Pressable>
      ))}
    </View>
  </View>
);

const Field = ({ label, value, onChange, hint, keyboard }: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>{label.toUpperCase()}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={hint}
      placeholderTextColor={T.inkFaint}
      keyboardType={keyboard}
      style={{
        borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink, minHeight: 44,
      }}
    />
  </View>
);
