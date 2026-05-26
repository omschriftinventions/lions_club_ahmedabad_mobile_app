import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Avatar } from '../../components/Avatar';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

interface Message { id: number; sender_id: number; body: string; created_at: string; }
interface ThreadMember { id: number; name: string; initials: string; avatar_color: string | null; role_color: string; }

export default function ChatThreadScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { member } = useAuth();
  const qc = useQueryClient();
  const id = route.params.id as number;
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const thread = useQuery({
    queryKey: ['chat', id],
    queryFn: () => api.get<{ thread: any; members: ThreadMember[]; messages: Message[] }>(`/chats/${id}`),
    refetchInterval: 4_000,
  });

  const send = useMutation({
    mutationFn: () => api.post(`/chats/${id}/messages`, { body: draft.trim() }),
    onSuccess: () => { setDraft(''); qc.invalidateQueries({ queryKey: ['chat', id] }); qc.invalidateQueries({ queryKey: ['chats'] }); },
  });

  const markRead = useMutation({
    mutationFn: (last_id: number) => api.post(`/chats/${id}/read`, { last_id }),
  });

  // Mark read on new messages
  useEffect(() => {
    const msgs = thread.data?.messages ?? [];
    if (msgs.length > 0) {
      markRead.mutate(msgs[msgs.length - 1].id);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [thread.data?.messages.length]);

  const others = (thread.data?.members ?? []).filter(m => m.id !== member?.id);
  const title: string = thread.data?.thread?.title || others.map((m: ThreadMember) => m.name.replace(/^Lion /, '')).join(', ') || 'Chat';
  const memberById = new Map((thread.data?.members ?? []).map(m => [m.id, m]));

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 12, alignItems: 'center', gap: 10, borderBottomWidth: 1, borderColor: T.line, backgroundColor: T.surface }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Avatar initials={title.split(/[\s,]+/).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()} size={36} color={T.brandBlue} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '800', color: T.ink, fontSize: 15 }} numberOfLines={1}>{title}</Text>
          <Text style={{ color: T.inkMute, fontSize: 11 }}>{others.length + 1} members</Text>
        </View>
      </View>

      {thread.isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> : (
        <FlatList
          ref={listRef}
          data={thread.data?.messages ?? []}
          keyExtractor={m => String(m.id)}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12 }}
          renderItem={({ item }) => {
            const mine = item.sender_id === member?.id;
            const senderRow = memberById.get(item.sender_id);
            return (
              <View style={{ flexDirection: 'row', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 6, gap: 8 }}>
                {!mine && senderRow && <Avatar initials={senderRow.initials} color={senderRow.avatar_color ?? senderRow.role_color} size={28} />}
                <View style={{
                  maxWidth: '78%', paddingVertical: 8, paddingHorizontal: 12,
                  backgroundColor: mine ? T.brandBlue : T.surface,
                  borderRadius: T.r.lg,
                  borderTopRightRadius: mine ? 4 : T.r.lg,
                  borderTopLeftRadius:  mine ? T.r.lg : 4,
                }}>
                  <Text style={{ color: mine ? '#fff' : T.ink, fontSize: 14, lineHeight: 19 }}>{item.body}</Text>
                  <Text style={{ color: mine ? 'rgba(255,255,255,0.7)' : T.inkFaint, fontSize: 10, marginTop: 4, textAlign: 'right' }}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', padding: 10, gap: 8, alignItems: 'flex-end', backgroundColor: T.surface, borderTopWidth: 1, borderColor: T.line }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            placeholderTextColor={T.inkFaint}
            multiline
            style={{
              flex: 1, maxHeight: 100, minHeight: 38,
              borderWidth: 1, borderColor: T.line, borderRadius: T.r.lg,
              paddingHorizontal: 14, paddingVertical: 8, fontSize: 15, color: T.ink,
              backgroundColor: T.bg,
            }}
          />
          <Pressable
            onPress={() => draft.trim() && send.mutate()}
            disabled={send.isPending || !draft.trim()}
            style={{
              width: 42, height: 42, borderRadius: 21,
              backgroundColor: draft.trim() ? T.brandBlue : T.inkFaint,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
