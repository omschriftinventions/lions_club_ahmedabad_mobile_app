import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert, Modal, FlatList } from 'react-native';
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

  const { data: rolesData } = useQuery({ queryKey: ['roles'], queryFn: () => api.get<{ roles: Role[] }>('/members/meta/roles') });
  const roles = rolesData?.roles ?? [];

  const [form, setForm] = useState<Record<string, string>>({
    name: '', role: 'MEMBER', designation: '', alias: '', profession: '', business: '',
    area: '', phone: '', email: '', joined_date: '',
  });
  const [sponsor, setSponsor] = useState<{ id: number; name: string } | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = !saved && (Object.entries(form).some(([k, v]) => v !== '' && !(k === 'role' && v === 'MEMBER')) || sponsor != null);
  const missing = !form.name.trim() || !form.joined_date.trim() || !form.phone.trim() || !sponsor;

  // Confirm discard when leaving with unsaved changes.
  useEffect(() => {
    const sub = nav.addListener('beforeRemove', (e: any) => {
      if (!dirty) return;
      e.preventDefault();
      Alert.alert('Discard changes?', 'You have unsaved changes.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => nav.dispatch(e.data.action) },
      ]);
    });
    return sub;
  }, [nav, dirty]);

  const create = useMutation({
    mutationFn: () => {
      const body: any = { name: form.name, role: form.role };
      for (const k of ['designation','alias','profession','business','area','phone','email'] as const) {
        if (form[k]?.trim()) body[k] = form[k].trim();
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(form.joined_date)) body.joined_date = form.joined_date;
      if (sponsor) body.sponsor_id = sponsor.id;
      return api.post<{ id: number }>('/members', body);
    },
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ['members'] });
      qc.invalidateQueries({ queryKey: ['roster', 'all'] });
      Alert.alert('Success', `${form.name} added successfully. Login password is their phone number (last 10 digits).`);
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
          <RolePicker roles={roles} value={form.role} onChange={(v: string) => setForm(s => ({ ...s, role: v }))} />
          <Field label="Alias / nickname" value={form.alias} onChange={(v: string) => setForm(s => ({ ...s, alias: v }))} />
          <Field label="Designation" value={form.designation} onChange={(v: string) => setForm(s => ({ ...s, designation: v }))} hint="PMJF / MJF / JF" />
          <Field label="Joined date *" value={form.joined_date} onChange={(v: string) => setForm(s => ({ ...s, joined_date: v }))} hint="YYYY-MM-DD" />
          <Field label="Profession" value={form.profession} onChange={(v: string) => setForm(s => ({ ...s, profession: v }))} />
          <Field label="Business"   value={form.business}   onChange={(v: string) => setForm(s => ({ ...s, business: v }))} />
          <Field label="Area"       value={form.area}       onChange={(v: string) => setForm(s => ({ ...s, area: v }))} />
          <Field label="Phone *"    value={form.phone}      onChange={(v: string) => setForm(s => ({ ...s, phone: v }))} hint="+91 98250 12345" keyboard="phone-pad" />
          <Field label="Email"      value={form.email}      onChange={(v: string) => setForm(s => ({ ...s, email: v }))} keyboard="email-address" />
          <SponsorPicker value={sponsor} onChange={setSponsor} />
          <Text style={{ color: T.inkFaint, fontSize: 12, marginTop: 2 }}>Login password is set automatically to the member's phone number (last 10 digits).</Text>
        </Card>
        {missing && <Text style={{ color: T.danger, fontSize: 12, marginTop: 10 }}>Name, Joined date, Phone and Sponsor are required.</Text>}
        <Button label="Add Lion" variant="gold" onPress={() => create.mutate()} loading={create.isPending} disabled={missing} style={{ marginTop: 16, marginBottom: 32 }} />
      </ScrollView>
    </Screen>
  );
}

const RolePicker = ({ roles, value, onChange }: { roles: Role[]; value: string; onChange: (v: string) => void }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 6 }}>POSITION</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {roles.map(r => (
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

const SponsorPicker = ({ value, onChange }: { value: { id: number; name: string } | null; onChange: (v: { id: number; name: string } | null) => void }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const { data } = useQuery({ queryKey: ['roster', 'all'], queryFn: () => api.get<{ members: any[] }>('/members?limit=500') });
  const members = data?.members ?? [];
  const filtered = useMemo(() => members.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())).slice(0, 40), [members, q]);
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>SPONSOR (MEMBER)</Text>
      <Pressable onPress={() => setOpen(true)} style={{ borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: value ? T.ink : T.inkFaint, fontSize: 15 }}>{value ? value.name : 'Search & select sponsor…'}</Text>
        {value ? <Pressable onPress={() => onChange(null)}><Ionicons name="close-circle" size={20} color={T.inkFaint} /></Pressable> : <Ionicons name="chevron-down" size={18} color={T.inkFaint} />}
      </Pressable>
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <Screen bg={T.bg} scroll={false}>
          <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => setOpen(false)}><Ionicons name="close" size={26} color={T.ink} /></Pressable>
            <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.ink }}>Select sponsor</Text>
          </View>
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <TextInput value={q} onChangeText={setQ} placeholder="Search name…" placeholderTextColor={T.inkFaint}
              style={{ borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink }} />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(m) => String(m.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => { onChange({ id: item.id, name: item.name }); setOpen(false); setQ(''); }} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.line }}>
                <Text style={{ color: T.ink, fontSize: 15 }}>{item.name}</Text>
                {item.role_label ? <Text style={{ color: T.inkMute, fontSize: 12 }}>{item.role_label}</Text> : null}
              </Pressable>
            )}
          />
        </Screen>
      </Modal>
    </View>
  );
};

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
