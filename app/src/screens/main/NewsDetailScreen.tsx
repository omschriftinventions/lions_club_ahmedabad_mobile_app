import React from 'react';
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Pill } from '../../components/Pill';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Button } from '../../components/Button';
import { HtmlView } from '../../components/HtmlView';
import { T } from '../../theme/tokens';

export default function NewsDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { member } = useAuth();
  const id = route.params.id as number;
  const { data, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: () => api.get<{ news: any }>(`/news/${id}`),
  });
  const del = useMutation({
    mutationFn: () => api.delete(`/news/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['news'] }); nav.goBack(); },
  });

  if (isLoading || !data?.news) return <Screen><ActivityIndicator color={T.brandBlue} style={{ marginTop: 40 }} /></Screen>;
  const n = data.news;

  return (
    <Screen bg={T.surface}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>News</Text>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        {n.tag && <Pill label={n.tag} color={T.brandBlue} />}
        <Text style={{ marginTop: 10, fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.4 }}>{n.title}</Text>
        <Text style={{ marginTop: 8, color: T.inkMute, fontSize: 12 }}>{new Date(n.published_at).toLocaleDateString()}</Text>
        {n.excerpt && <Text style={{ marginTop: 16, color: T.inkSoft, fontSize: 16, lineHeight: 24, fontStyle: 'italic' }}>{n.excerpt}</Text>}
        {n.body && <HtmlView html={n.body} style={{ marginTop: 16 }} />}

        {member?.canEdit && (
          <View style={{ marginTop: 18, marginBottom: 8 }}>
            <Button
              label="Delete article"
              variant="ghost"
              onPress={() => Alert.alert('Delete article?', 'This will remove the news article.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => del.mutate() },
              ])}
              loading={del.isPending}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}
