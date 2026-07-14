import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

interface Thread {
  id: number; title: string | null; is_group: 0 | 1;
  last_body: string | null; last_at: string | null;
  last_read: number | null; unread: number;
  others: string | null;
}
interface Member {
  id: number; name: string; initials: string; role_color: string; avatar_color: string | null;
}

export default function ChatListScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [picker, setPicker] = useState(false);

  const threads = useQuery({
    queryKey: ['chats'],
    queryFn: () => api.get<{ threads: Thread[] }>('/chats'),
    refetchInterval: 10_000,
  });
  const roster = useQuery({
    queryKey: ['members', 'chat-contacts'],
    queryFn: () => api.get<{ members: Member[] }>('/members?limit=500&include_admins=1'),
    enabled: picker,
  });
  const create = useMutation({
    mutationFn: (memberId: number) => api.post<{ id: number }>('/chats', { member_ids: [memberId] }),
    onSuccess: (r) => { setPicker(false); qc.invalidateQueries({ queryKey: ['chats'] }); nav.navigate('ChatThread', { id: r.id }); },
  });

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.ink }}>Chats</Text>
        <Pressable onPress={() => setPicker(true)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.brandBlue, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      {threads.isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> :
        (threads.data?.threads.length ?? 0) === 0 ? (
          <EmptyState icon="chatbubbles-outline" title="No conversations" body="Start a chat with another Lion using the + button above." />
        ) : (
          <FlatList
            data={threads.data?.threads ?? []}
            keyExtractor={t => String(t.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            renderItem={({ item }) => {
              const title = item.title || item.others || 'Conversation';
              const initials = title.split(/[\s,]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
              return (
                <Pressable onPress={() => nav.navigate('ChatThread', { id: item.id })} style={{
                  flexDirection: 'row', backgroundColor: T.surface, padding: 12, borderRadius: T.r.md,
                  marginBottom: 8, alignItems: 'center', gap: 12,
                }}>
                  <Avatar initials={initials} color={item.is_group ? T.brandGoldDark : T.brandBlue} size={46} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                      <Text style={{ flex: 1, fontWeight: '700', color: T.ink }} numberOfLines={1}>{title}</Text>
                      {item.last_at && <Text style={{ fontSize: 11, color: T.inkFaint }}>{new Date(item.last_at).toLocaleDateString()}</Text>}
                    </View>
                    <Text style={{ color: T.inkMute, fontSize: 13, marginTop: 2 }} numberOfLines={1}>{item.last_body ?? 'No messages yet'}</Text>
                  </View>
                  {item.unread > 0 && (
                    <View style={{ backgroundColor: T.brandBlue, borderRadius: T.r.pill, paddingHorizontal: 8, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{item.unread}</Text>
                    </View>
                  )}
                </Pressable>
              );
            }}
          />
        )
      }

      <Modal visible={picker} animationType="slide" onRequestClose={() => setPicker(false)}>
        <Screen bg={T.bg} scroll={false}>
          <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => setPicker(false)}><Ionicons name="close" size={26} color={T.ink} /></Pressable>
            <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>New chat</Text>
          </View>
          {roster.isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> : (
            <FlatList
              data={(roster.data?.members ?? []).filter(m => m.id !== member?.id)}
              keyExtractor={m => String(m.id)}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={({ item }) => (
                <Pressable onPress={() => create.mutate(item.id)} style={{
                  flexDirection: 'row', backgroundColor: T.surface, padding: 12, borderRadius: T.r.md,
                  marginBottom: 8, alignItems: 'center', gap: 12,
                }}>
                  <Avatar initials={item.initials} color={item.avatar_color ?? item.role_color} size={42} />
                  <Text style={{ flex: 1, fontWeight: '700', color: T.ink }}>{item.name}</Text>
                  <Ionicons name="chevron-forward" size={18} color={T.inkFaint} />
                </Pressable>
              )}
            />
          )}
        </Screen>
      </Modal>
    </Screen>
  );
}
