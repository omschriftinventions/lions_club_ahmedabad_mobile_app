import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

type Mode = 'push' | 'whatsapp';

export default function BroadcastScreen() {
  const nav = useNavigation<any>();
  const { member } = useAuth();
  const [mode, setMode] = useState<Mode>('push');

  // Push form
  const [pf, setPf] = useState({ title: '', body: '', icon: '\uD83D\uDCE3' });
  const setP = (k: string) => (e: any) => setPf({ ...pf, [k]: e });
  const [pushDone, setPushDone] = useState(0);
  const pushMut = useMutation({
    mutationFn: () => api.post<{ recipients: number }>('/broadcast', { title: pf.title, body: pf.body || undefined, icon: pf.icon || undefined }),
    onSuccess: (d: any) => { setPushDone(d.recipients); setPf({ title: '', body: '', icon: '\uD83D\uDCE3' }); },
  });

  // WhatsApp form
  const [waMsg, setWaMsg] = useState('');
  const [recipientMode, setRecipientMode] = useState<'all' | 'selected'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [waResult, setWaResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const { data: memData } = useQuery({ queryKey: ['roster', 'all'], queryFn: () => api.get<{ members: any[] }>('/members?limit=500') });
  const members = useMemo(() => {
    const list = memData?.members ?? [];
    if (!search) return list;
    const lc = search.toLowerCase();
    return list.filter((m) => `${m.name} ${m.phone ?? ''}`.toLowerCase().includes(lc));
  }, [memData, search]);

  const waMut = useMutation({
    mutationFn: () => api.post<any>('/broadcast/whatsapp', {
      message: waMsg,
      memberIds: recipientMode === 'selected' ? Array.from(selected) : undefined,
    }),
    onSuccess: (d: any) => { setWaResult({ sent: d.sent, failed: d.failed, total: d.total }); if (d.sent > 0) setWaMsg(''); },
  });

  if (!member?.canEdit) {
    return <Screen><View style={{ padding: 24, alignItems: 'center' }}><Ionicons name="megaphone" size={40} color={T.inkMute} /><Text style={{ marginTop: 12, fontWeight: '700', color: T.ink }}>Officer access required</Text></View></Screen>;
  }

  const toggleSel = (id: number) => { const s = new Set(selected); if (s.has(id)) s.delete(id); else s.add(id); setSelected(s); };

  const ModeBtn = ({ m, label, icon }: { m: Mode; label: string; icon: string }) => (
    <Pressable onPress={() => setMode(m)} style={{ flex: 1, paddingVertical: 10, borderRadius: T.r.sm, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, backgroundColor: mode === m ? T.brandBlue : 'transparent', borderWidth: 1.5, borderColor: mode === m ? T.brandBlue : T.line }}>
      <Ionicons name={icon as any} size={14} color={mode === m ? '#fff' : T.inkMute} />
      <Text style={{ fontSize: 12, fontWeight: '700', color: mode === m ? '#fff' : T.inkMute }}>{label}</Text>
    </Pressable>
  );

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Broadcast</Text>
      </View>

      <ScrollView style={{ paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Mode toggle */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <ModeBtn m="push" label="Push Notification" icon="notifications" />
          <ModeBtn m="whatsapp" label="WhatsApp" icon="chatbubbles" />
        </View>

        {mode === 'push' ? (
          <>
            {pushDone > 0 && (
              <Card style={{ marginBottom: 14, backgroundColor: '#DCFCE7' }}>
                <Text style={{ color: '#15803D', fontWeight: '700' }}>Push sent to {pushDone} member{pushDone === 1 ? '' : 's'}.</Text>
              </Card>
            )}
            <Card>
              <Text style={labelStyle}>TITLE</Text>
              <TextInput value={pf.title} onChangeText={setP('title')} placeholder="e.g. Urgent: meeting rescheduled" placeholderTextColor={T.inkFaint} style={inputStyle} />
              <Text style={[labelStyle, { marginTop: 12 }]}>MESSAGE (OPTIONAL)</Text>
              <TextInput value={pf.body} onChangeText={setP('body')} placeholder="Details..." placeholderTextColor={T.inkFaint} multiline style={[inputStyle, { minHeight: 80 }]} />
              <Text style={[labelStyle, { marginTop: 12 }]}>ICON (EMOJI)</Text>
              <TextInput value={pf.icon} onChangeText={setP('icon')} maxLength={4} style={inputStyle} />
              <Button label={pushMut.isPending ? 'Sending...' : 'Send push notification'} onPress={() => pushMut.mutate()} loading={pushMut.isPending} style={{ marginTop: 16 }} />
            </Card>
          </>
        ) : (
          <>
            {waResult && (
              <Card style={{ marginBottom: 14, backgroundColor: waResult.sent > 0 ? '#DCFCE7' : '#FEE2E2' }}>
                <Text style={{ color: waResult.sent > 0 ? '#15803D' : '#DC2626', fontWeight: '700' }}>
                  WhatsApp: {waResult.sent} sent, {waResult.failed} failed, {waResult.total} total
                </Text>
                {waResult.sent === 0 && waResult.failed > 0 && (
                  <Text style={{ color: '#DC2626', fontSize: 12, marginTop: 6 }}>Is WhatsApp linked? Check System Admin.</Text>
                )}
              </Card>
            )}
            <Card>
              <Text style={labelStyle}>WHATSAPP MESSAGE</Text>
              <TextInput value={waMsg} onChangeText={setWaMsg} placeholder="Type your message..." placeholderTextColor={T.inkFaint} multiline style={[inputStyle, { minHeight: 100 }]} />

              <Text style={[labelStyle, { marginTop: 16 }]}>RECIPIENTS</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <Pressable onPress={() => setRecipientMode('all')} style={{ flex: 1, paddingVertical: 8, borderRadius: T.r.sm, alignItems: 'center', backgroundColor: recipientMode === 'all' ? T.brandBlue : 'transparent', borderWidth: 1.5, borderColor: recipientMode === 'all' ? T.brandBlue : T.line }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: recipientMode === 'all' ? '#fff' : T.inkMute }}>All members</Text>
                </Pressable>
                <Pressable onPress={() => setRecipientMode('selected')} style={{ flex: 1, paddingVertical: 8, borderRadius: T.r.sm, alignItems: 'center', backgroundColor: recipientMode === 'selected' ? T.brandBlue : 'transparent', borderWidth: 1.5, borderColor: recipientMode === 'selected' ? T.brandBlue : T.line }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: recipientMode === 'selected' ? '#fff' : T.inkMute }}>Selected ({selected.size})</Text>
                </Pressable>
              </View>

              {recipientMode === 'all' && (
                <Text style={{ color: T.inkFaint, fontSize: 12, marginBottom: 12 }}>Sends to all active members with a phone number. Members without a phone are skipped.</Text>
              )}

              {recipientMode === 'selected' && (
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: T.r.md, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: T.line, marginBottom: 8 }}>
                    <Ionicons name="search" size={14} color={T.inkMute} />
                    <TextInput value={search} onChangeText={setSearch} placeholder="Search members..." placeholderTextColor={T.inkFaint} style={{ flex: 1, marginLeft: 8, fontSize: 13, color: T.ink }} />
                  </View>
                  {!memData ? <ActivityIndicator color={T.brandBlue} /> : (
                    <View style={{ maxHeight: 250, borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm }}>
                      {members.length === 0 ? <Text style={{ color: T.inkMute, padding: 12, fontSize: 13 }}>No members found.</Text> :
                        members.map((m) => (
                          <Pressable key={m.id} onPress={() => toggleSel(m.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderBottomWidth: 1, borderBottomColor: T.line }}>
                            <Ionicons name={selected.has(m.id) ? 'checkbox' : 'square-outline'} size={20} color={selected.has(m.id) ? T.brandBlue : T.inkMute} />
                            <Avatar initials={m.initials ?? ''} color={m.avatar_color} size={28} uri={m.avatar_url} />
                            <Text style={{ flex: 1, fontSize: 13, color: T.ink }} numberOfLines={1}>{m.name}</Text>
                            {m.phone ? <Pill label="phone" color={T.success} /> : <Pill label="no phone" color={T.danger} />}
                          </Pressable>
                        ))
                      }
                    </View>
                  )}
                  {selected.size > 0 && (
                    <Pressable onPress={() => setSelected(new Set())} style={{ marginTop: 8 }}>
                      <Text style={{ color: T.inkMute, fontSize: 12, fontWeight: '600' }}>Clear selection</Text>
                    </Pressable>
                  )}
                </View>
              )}

              <Button
                label={waMut.isPending ? 'Sending...' : 'Send WhatsApp message'}
                onPress={() => waMut.mutate()}
                loading={waMut.isPending}
                style={{ marginTop: 8 }}
              />
            </Card>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const labelStyle = { fontSize: 11, fontWeight: '800' as const, color: T.inkMute, letterSpacing: 1, marginBottom: 6 };
const inputStyle = { borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink } as const;