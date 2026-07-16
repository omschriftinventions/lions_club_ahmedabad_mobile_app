import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

export default function OfficerAdminScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { member } = useAuth();
  if (!member?.canEdit) {
    return (
      <Screen>
        <View style={{ padding: 24 }}>
          <Text style={{ color: T.danger, fontWeight: '700' }}>Forbidden</Text>
          <Text style={{ color: T.inkMute, marginTop: 6 }}>President, Secretary, or Treasurer only.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Officer Admin</Text>
      </View>
      <ScrollView style={{ paddingHorizontal: 16 }}>
        <ImportEvents onDone={() => qc.invalidateQueries({ queryKey: ['events'] })} />
        <NewEventForm onCreated={() => qc.invalidateQueries({ queryKey: ['events'] })} />
        <NewNewsForm onCreated={() => qc.invalidateQueries({ queryKey: ['news'] })} />
      </ScrollView>
    </Screen>
  );
}

const ImportEvents = ({ onDone }: { onDone: () => void }) => {
  const [busy, setBusy] = useState(false);
  const pick = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', '.xlsx', '.xls'],
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.[0]) return;
      setBusy(true);
      const uri = res.assets[0].uri;
      const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const r = await api.post<any>('/events/import', { file: b64 });
      Alert.alert('Import complete', `Created ${r.created}, updated ${r.updated}, skipped ${r.skipped}.` + (r.errors?.length ? `\n\n${r.errors.join('\n')}` : ''));
      onDone();
    } catch (e: any) {
      Alert.alert('Import failed', e?.message ?? 'Try again');
    } finally { setBusy(false); }
  };
  return (
    <Card style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 17, fontWeight: '800', color: T.ink, marginBottom: 6 }}>Import from Excel</Text>
      <Text style={{ color: T.inkMute, fontSize: 13, marginBottom: 12 }}>
        Upload a Service Activity Report (.xlsx). Rows matched by Code No. (or title + date) are added or updated.
      </Text>
      <Button label={busy ? 'Importing…' : 'Choose Excel file'} variant="outline" onPress={pick} loading={busy} />
    </Card>
  );
};

const calcHours = (tin: string, tout: string): number | null => {
  const pm = (t: string) => { const m = t.match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };
  const a = pm(tin), b = pm(tout);
  if (a == null || b == null) return null;
  let d = b - a; if (d < 0) d += 1440;
  return Math.round((d / 60) * 100) / 100;
};

const NewEventForm = ({ onCreated }: { onCreated: () => void }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Signature'|'Service'|'Meeting'|'Fellowship'|'Other'>('Service');
  const [code_no, setCodeNo] = useState('');
  const [starts_at, setStarts] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [time_in, setTimeIn] = useState('');
  const [time_out, setTimeOut] = useState('');
  const [expenses, setExpenses] = useState('');
  const [beneficiaries, setBeneficiaries] = useState('');
  const [memberIds, setMemberIds] = useState<number[]>([]);

  const membersQ = useQuery({ queryKey: ['members', 'chat-contacts'], queryFn: () => api.get<{ members: any[] }>('/members?limit=500') });
  const noMembers = memberIds.length;
  const hours = calcHours(time_in, time_out);
  const manHours = hours != null ? Math.round(hours * noMembers * 100) / 100 : null;

  const m = useMutation({
    mutationFn: () => api.post('/events', {
      title, type, code_no: code_no || null, starts_at, venue, description,
      time_in: time_in || null, time_out: time_out || null, member_ids: memberIds,
      expenses: expenses || null, beneficiaries: beneficiaries || null,
    }),
    onSuccess: () => {
      Alert.alert('Event created');
      setTitle(''); setCodeNo(''); setStarts(''); setVenue(''); setDescription('');
      setTimeIn(''); setTimeOut(''); setExpenses(''); setBeneficiaries(''); setMemberIds([]);
      onCreated();
    },
    onError: (e: any) => Alert.alert('Failed', e.message),
  });
  return (
    <Card style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 17, fontWeight: '800', color: T.ink, marginBottom: 12 }}>New event</Text>
      <Field label="Title"        value={title}       onChange={setTitle} />
      <Field label="Type"         value={type}        onChange={(v: any) => setType(v)} hint="Signature | Service | Meeting | Fellowship | Other" />
      <Field label="Code No."     value={code_no}     onChange={setCodeNo} hint="e.g. s17" />
      <Field label="Starts at"    value={starts_at}   onChange={setStarts} hint="YYYY-MM-DD HH:MM:SS" />
      <Field label="Venue"        value={venue}       onChange={setVenue} />

      <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4, marginTop: 4 }}>MEMBERS PRESENT</Text>
      <MemberMultiSelect members={membersQ.data?.members ?? []} value={memberIds} onChange={setMemberIds} />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="Time in"  value={time_in}  onChange={setTimeIn} hint="HH:MM" /></View>
        <View style={{ flex: 1 }}><Field label="Time out" value={time_out} onChange={setTimeOut} hint="HH:MM" /></View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, backgroundColor: T.bg, borderRadius: T.r.sm, padding: 10, marginBottom: 12 }}>
        <AutoStat label="Members" value={noMembers} />
        <AutoStat label="Hours" value={hours ?? '—'} />
        <AutoStat label="Man hours" value={manHours ?? '—'} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="Expenses (₹)"  value={expenses}      onChange={setExpenses} keyboard="number-pad" /></View>
        <View style={{ flex: 1 }}><Field label="Beneficiaries" value={beneficiaries} onChange={setBeneficiaries} keyboard="number-pad" /></View>
      </View>
      <Field label="Description"  value={description} onChange={setDescription} multiline />
      <Button label="Create event" onPress={() => m.mutate()} loading={m.isPending} style={{ marginTop: 8 }} />
    </Card>
  );
};

const AutoStat = ({ label, value }: { label: string; value: any }) => (
  <View style={{ flex: 1 }}>
    <Text style={{ color: T.inkFaint, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>{label.toUpperCase()}</Text>
    <Text style={{ color: T.ink, fontSize: 16, fontWeight: '800', marginTop: 2 }}>{String(value)}</Text>
  </View>
);

// Searchable multi-select member picker.
const MemberMultiSelect = ({ members, value, onChange }: { members: any[]; value: number[]; onChange: (ids: number[]) => void }) => {
  const [q, setQ] = useState('');
  const ql = q.trim().toLowerCase();
  const filtered = ql ? members.filter((m) => `${m.name} ${m.profession ?? ''}`.toLowerCase().includes(ql)) : members.slice(0, 30);
  const byId = new Map(members.map((m) => [m.id, m]));
  const toggle = (id: number) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <View style={{ marginBottom: 12 }}>
      {value.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {value.map((id) => (
            <Pressable key={id} onPress={() => toggle(id)} style={{ backgroundColor: T.brandBlue, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{byId.get(id)?.name ?? `#${id}`} ✕</Text>
            </Pressable>
          ))}
        </View>
      )}
      <TextInput value={q} onChangeText={setQ} placeholder="Search members to add…" placeholderTextColor={T.inkFaint}
        style={{ borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: T.ink, marginBottom: 6 }} />
      <View style={{ maxHeight: 200, borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm }}>
        <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {filtered.map((m) => {
            const on = value.includes(m.id);
            return (
              <Pressable key={m.id} onPress={() => toggle(m.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderColor: T.line }}>
                <Ionicons name={on ? 'checkbox' : 'square-outline'} size={18} color={on ? T.brandBlue : T.inkMute} />
                <Text style={{ color: T.ink, fontSize: 14 }}>{m.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const NewNewsForm = ({ onCreated }: { onCreated: () => void }) => {
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const m = useMutation({
    mutationFn: () => api.post('/news', { title, tag, excerpt, body, published: true }),
    onSuccess: () => {
      Alert.alert('News published');
      setTitle(''); setTag(''); setExcerpt(''); setBody('');
      onCreated();
    },
    onError: (e: any) => Alert.alert('Failed', e.message),
  });
  return (
    <Card style={{ marginBottom: 32 }}>
      <Text style={{ fontSize: 17, fontWeight: '800', color: T.ink, marginBottom: 12 }}>Publish announcement</Text>
      <Field label="Title"   value={title}   onChange={setTitle} />
      <Field label="Tag"     value={tag}     onChange={setTag} hint="Milestone | Service | Visit | Membership" />
      <Field label="Excerpt" value={excerpt} onChange={setExcerpt} multiline />
      <Field label="Body"    value={body}    onChange={setBody} multiline />
      <Button label="Publish" variant="gold" onPress={() => m.mutate()} loading={m.isPending} style={{ marginTop: 8 }} />
    </Card>
  );
};

const Field = ({ label, value, onChange, multiline, hint, keyboard }: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>{label.toUpperCase()}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      keyboardType={keyboard}
      placeholder={hint}
      placeholderTextColor={T.inkFaint}
      style={{
        borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink,
        minHeight: multiline ? 80 : 44, textAlignVertical: multiline ? 'top' : 'center',
      }}
    />
  </View>
);
