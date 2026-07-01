import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { T } from '../../theme/tokens';

interface Cause { id: string; name: string; icon: string; unit_label: string | null; color: string; }

const today = () => new Date().toISOString().slice(0, 10);

export default function LogProjectScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const qc = useQueryClient();

  const causes = useQuery({
    queryKey: ['causes'],
    queryFn: () => api.get<{ causes: Cause[] }>('/causes'),
  });

  const firstCause = causes.data?.causes?.[0]?.id;
  const [causeId, setCauseId] = useState<string | null>(route.params?.causeId ?? firstCause ?? null);
  const [title, setTitle] = useState('');
  const [units, setUnits] = useState('');
  const [amount, setAmount] = useState('');
  const [occurredOn, setOccurredOn] = useState(today());
  const [notes, setNotes] = useState('');

  const m = useMutation({
    mutationFn: async () => {
      const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(occurredOn.trim());
      return api.post('/service-projects', {
        cause_id: causeId,
        title: title.trim(),
        units: Math.max(0, parseInt(units, 10) || 0),
        amount_inr: Math.max(0, Number(amount) || 0),
        occurred_on: dateOk ? occurredOn.trim() : null,
        notes: notes.trim() || null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['impact'] });
      qc.invalidateQueries({ queryKey: ['service-projects'] });
      Alert.alert('Logged', 'Service project added to the impact dashboard.');
      nav.goBack();
    },
    onError: (e: any) => Alert.alert('Could not log', e.message),
  });

  const submit = () => {
    if (!causeId) return Alert.alert('Pick a cause');
    if (title.trim().length < 2) return Alert.alert('Add a title');
    m.mutate();
  };

  const field = (label: string, val: string, set: (s: string) => void, opts: { numeric?: boolean; multiline?: boolean; placeholder?: string } = {}) => (
    <View style={{ marginTop: 14 }}>
      <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>{label.toUpperCase()}</Text>
      <TextInput
        value={val}
        onChangeText={set}
        placeholder={opts.placeholder}
        placeholderTextColor={T.inkFaint}
        keyboardType={opts.numeric ? 'numeric' : 'default'}
        multiline={opts.multiline}
        numberOfLines={opts.multiline ? 4 : 1}
        style={{
          borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm,
          paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink,
          minHeight: opts.multiline ? 96 : 44, textAlignVertical: 'top',
        }}
      />
    </View>
  );

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Log service project</Text>
      </View>

      <ScrollView style={{ paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <Card>
          <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5 }}>CAUSE</Text>
          {causes.isLoading ? (
            <ActivityIndicator color={T.brandBlue} style={{ marginTop: 12 }} />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {(causes.data?.causes ?? []).map(c => {
                const active = c.id === causeId;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCauseId(c.id)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                      paddingHorizontal: 12, paddingVertical: 8, borderRadius: T.r.pill,
                      borderWidth: 1.5,
                      borderColor: active ? c.color : T.line,
                      backgroundColor: active ? `${c.color}1A` : T.bg,
                    }}>
                    <Text style={{ fontSize: 16 }}>{c.icon}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: active ? c.color : T.inkMute }}>{c.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Card>

        <Card style={{ marginTop: 14 }}>
          {field('Title', title, setTitle, { placeholder: 'e.g. Eye check-up camp, Bopal' })}
          {field('Units / people served', units, setUnits, { numeric: true, placeholder: '0' })}
          {field('Amount spent (INR)', amount, setAmount, { numeric: true, placeholder: '0' })}
          {field('Date (YYYY-MM-DD)', occurredOn, setOccurredOn, { placeholder: today() })}
          {field('Notes', notes, setNotes, { multiline: true, placeholder: 'What was done, partners, outcome...' })}
        </Card>

        <Button label="Log project" onPress={submit} loading={m.isPending} style={{ marginTop: 16 }} />
      </ScrollView>
    </Screen>
  );
}
