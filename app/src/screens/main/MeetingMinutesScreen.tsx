import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, ScrollView, Alert, ActivityIndicator, Modal, Linking } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

interface MinutesRow {
  id: number; title: string; meeting_date: string; attendees: number | null;
  doc_url: string | null; body?: string | null; created_by_name: string | null;
}

export default function MeetingMinutesScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [picked, setPicked] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const list = useQuery({
    queryKey: ['minutes'],
    queryFn: () => api.get<{ minutes: MinutesRow[] }>('/meeting-minutes'),
  });

  const detail = useQuery({
    queryKey: ['minutes', picked],
    queryFn: () => api.get<{ minutes: MinutesRow }>(`/meeting-minutes/${picked}`),
    enabled: !!picked,
  });

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.ink }}>Meeting Minutes</Text>
        {member?.canEdit && (
          <Pressable onPress={() => setAddOpen(true)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.brandBlue, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        )}
      </View>

      {list.isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> :
        (list.data?.minutes.length ?? 0) === 0 ? <EmptyState icon="document-text-outline" title="No minutes yet" /> : (
          <FlatList
            data={list.data?.minutes ?? []}
            keyExtractor={m => String(m.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => setPicked(item.id)} style={{ marginBottom: 10 }}>
                <Card pad={14}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ width: 50, alignItems: 'center', backgroundColor: T.bg, borderRadius: T.r.sm, paddingVertical: 8 }}>
                      <Text style={{ fontSize: 18, fontWeight: '800', color: T.ink }}>
                        {new Date(item.meeting_date).getDate()}
                      </Text>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: T.inkMute, letterSpacing: 1 }}>
                        {new Date(item.meeting_date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: T.ink }}>{item.title}</Text>
                      <Text style={{ color: T.inkMute, fontSize: 12, marginTop: 4 }}>
                        {item.attendees ? `${item.attendees} attended · ` : ''}{item.created_by_name ?? ''}
                      </Text>
                      {item.doc_url && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                          <Ionicons name="document" size={12} color={T.brandBlue} />
                          <Text style={{ color: T.brandBlue, fontSize: 12, fontWeight: '600' }}>Document attached</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              </Pressable>
            )}
          />
        )
      }

      {/* Detail modal */}
      <Modal visible={!!picked} animationType="slide" onRequestClose={() => setPicked(null)}>
        <Screen bg={T.surface}>
          <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => setPicked(null)}><Ionicons name="close" size={26} color={T.ink} /></Pressable>
            <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.ink }} numberOfLines={1}>
              {detail.data?.minutes?.title}
            </Text>
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            {detail.data?.minutes && (
              <>
                <Text style={{ color: T.inkMute, fontSize: 13 }}>
                  {new Date(detail.data.minutes.meeting_date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                  {detail.data.minutes.attendees ? ` · ${detail.data.minutes.attendees} attended` : ''}
                </Text>
                {detail.data.minutes.doc_url && (
                  <Pressable onPress={() => Linking.openURL(detail.data!.minutes.doc_url!)} style={{ marginTop: 14, padding: 12, backgroundColor: T.bg, borderRadius: T.r.md, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="document" size={18} color={T.brandBlue} />
                    <Text style={{ color: T.brandBlue, fontWeight: '700' }}>Open attached document</Text>
                  </Pressable>
                )}
                {detail.data.minutes.body && (
                  <Text style={{ marginTop: 18, color: T.ink, lineHeight: 22, fontSize: 15 }}>{detail.data.minutes.body}</Text>
                )}
              </>
            )}
          </View>
        </Screen>
      </Modal>

      {/* Add form modal */}
      {member?.canEdit && (
        <Modal visible={addOpen} animationType="slide" onRequestClose={() => setAddOpen(false)}>
          <AddMinutesForm onClose={() => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['minutes'] }); }} />
        </Modal>
      )}
    </Screen>
  );
}

const AddMinutesForm = ({ onClose }: { onClose: () => void }) => {
  const [title, setTitle] = useState('');
  const [meeting_date, setDate] = useState('');
  const [attendees, setAttendees] = useState('');
  const [body, setBody] = useState('');
  const [doc_url, setDoc] = useState('');

  const m = useMutation({
    mutationFn: () => api.post('/meeting-minutes', {
      title, meeting_date,
      attendees: attendees ? Number(attendees) : null,
      body: body || null,
      doc_url: doc_url || null,
    }),
    onSuccess: () => { Alert.alert('Saved'); onClose(); },
    onError: (e: any) => Alert.alert('Failed', e.message),
  });

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={onClose}><Ionicons name="close" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>New meeting minutes</Text>
      </View>
      <ScrollView style={{ paddingHorizontal: 16 }}>
        <Card>
          <Field label="Title"        value={title}        onChange={setTitle} />
          <Field label="Date"         value={meeting_date} onChange={setDate} hint="YYYY-MM-DD" />
          <Field label="Attendees"    value={attendees}    onChange={setAttendees} keyboard="number-pad" />
          <Field label="Doc URL"      value={doc_url}      onChange={setDoc} hint="https://..." />
          <Field label="Body / notes" value={body}         onChange={setBody} multiline />
        </Card>
        <Button label="Save" onPress={() => m.mutate()} loading={m.isPending} style={{ marginTop: 16, marginBottom: 32 }} />
      </ScrollView>
    </Screen>
  );
};

const Field = ({ label, value, onChange, hint, keyboard, multiline }: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>{label.toUpperCase()}</Text>
    <TextInput
      value={value} onChangeText={onChange} placeholder={hint}
      placeholderTextColor={T.inkFaint} keyboardType={keyboard} multiline={multiline}
      style={{
        borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink,
        minHeight: multiline ? 100 : 44, textAlignVertical: multiline ? 'top' : 'center',
      }}
    />
  </View>
);
