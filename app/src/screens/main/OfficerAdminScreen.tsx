import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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
        <NewEventForm onCreated={() => qc.invalidateQueries({ queryKey: ['events'] })} />
        <NewNewsForm onCreated={() => qc.invalidateQueries({ queryKey: ['news'] })} />
      </ScrollView>
    </Screen>
  );
}

const NewEventForm = ({ onCreated }: { onCreated: () => void }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Signature'|'Service'|'Meeting'|'Fellowship'|'Other'>('Service');
  const [starts_at, setStarts] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const m = useMutation({
    mutationFn: () => api.post('/events', { title, type, starts_at, venue, description }),
    onSuccess: () => {
      Alert.alert('Event created');
      setTitle(''); setStarts(''); setVenue(''); setDescription('');
      onCreated();
    },
    onError: (e: any) => Alert.alert('Failed', e.message),
  });
  return (
    <Card style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 17, fontWeight: '800', color: T.ink, marginBottom: 12 }}>New event</Text>
      <Field label="Title"        value={title}       onChange={setTitle} />
      <Field label="Type"         value={type}        onChange={(v: any) => setType(v)} hint="Signature | Service | Meeting | Fellowship | Other" />
      <Field label="Starts at"    value={starts_at}   onChange={setStarts} hint="YYYY-MM-DD HH:MM:SS" />
      <Field label="Venue"        value={venue}       onChange={setVenue} />
      <Field label="Description"  value={description} onChange={setDescription} multiline />
      <Button label="Create event" onPress={() => m.mutate()} loading={m.isPending} style={{ marginTop: 8 }} />
    </Card>
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

const Field = ({ label, value, onChange, multiline, hint }: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>{label.toUpperCase()}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      multiline={multiline}
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
