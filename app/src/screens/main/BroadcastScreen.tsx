import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

const ICONS = ['📣', '🎉', '⚠️', '🦁', '🏆', '🍱', '🌳', '👁'];

export default function BroadcastScreen() {
  const nav = useNavigation<any>();
  const { member } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [icon, setIcon] = useState('📣');

  if (!member?.canEdit) {
    return (
      <Screen><View style={{ padding: 24 }}>
        <Text style={{ color: T.danger, fontWeight: '700' }}>Forbidden</Text>
        <Text style={{ color: T.inkMute, marginTop: 6 }}>Officer access required.</Text>
      </View></Screen>
    );
  }

  const send = useMutation({
    mutationFn: () => api.post<{ ok: true; recipients: number }>('/broadcast', { title, body, icon }),
    onSuccess: (r) => {
      Alert.alert('Sent', `Pushed to ${r.recipients} members`);
      setTitle(''); setBody('');
    },
    onError: (e: any) => Alert.alert('Failed', e.message),
  });

  const submit = () => {
    if (title.trim().length < 2) { Alert.alert('Title too short'); return; }
    Alert.alert(
      'Send broadcast?',
      `This will push a notification to every active member.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', style: 'destructive', onPress: () => send.mutate() },
      ]
    );
  };

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Broadcast</Text>
      </View>
      <ScrollView style={{ paddingHorizontal: 16 }}>
        <Card style={{ marginBottom: 14 }}>
          <Text style={{ fontWeight: '800', color: T.ink, fontSize: 17 }}>Push to all members</Text>
          <Text style={{ color: T.inkMute, marginTop: 4, fontSize: 13 }}>
            Goes to every active member as both a push notification and inbox entry.
          </Text>
        </Card>

        <Card>
          <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 6 }}>ICON</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ICONS.map(em => (
              <Pressable key={em} onPress={() => setIcon(em)} style={{
                width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: icon === em ? T.brandBlue : T.line,
                backgroundColor: icon === em ? `${T.brandBlue}1A` : 'transparent',
              }}>
                <Text style={{ fontSize: 22 }}>{em}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginTop: 16, marginBottom: 4 }}>TITLE</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Reminder: Eye camp tomorrow"
            placeholderTextColor={T.inkFaint}
            maxLength={120}
            style={{
              borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm,
              paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink, minHeight: 44,
            }}
          />

          <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginTop: 14, marginBottom: 4 }}>MESSAGE</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Civil Hospital, 9 AM. Please be on time."
            placeholderTextColor={T.inkFaint}
            multiline
            maxLength={400}
            style={{
              borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm,
              paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink,
              minHeight: 100, textAlignVertical: 'top',
            }}
          />
        </Card>

        <Button label="Send broadcast" variant="gold" onPress={submit} loading={send.isPending} style={{ marginTop: 16, marginBottom: 32 }} />
      </ScrollView>
    </Screen>
  );
}
