import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../lib/api';
import { T } from '../../theme/tokens';

interface FAQ { id: number; question: string; answer: string; category: string | null; }

export default function HelpFAQScreen() {
  const nav = useNavigation<any>();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => api.get<{ faqs: FAQ[] }>('/faqs'),
  });

  const grouped = useMemo(() => {
    const list = (data?.faqs ?? []).filter(f => !q || `${f.question} ${f.answer}`.toLowerCase().includes(q.toLowerCase()));
    const map = new Map<string, FAQ[]>();
    for (const f of list) {
      const cat = f.category ?? 'General';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(f);
    }
    return Array.from(map.entries());
  }, [data, q]);

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Help & FAQ</Text>
      </View>
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: T.r.md, paddingHorizontal: 12, height: 42, borderWidth: 1, borderColor: T.line }}>
          <Ionicons name="search" size={16} color={T.inkMute} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search FAQs" placeholderTextColor={T.inkFaint}
            style={{ flex: 1, marginLeft: 8, fontSize: 14, color: T.ink }} />
        </View>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> :
          grouped.length === 0 ? <EmptyState icon="help-circle-outline" title="No matches" /> :
          grouped.map(([cat, items]) => (
            <View key={cat} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: T.inkMute, letterSpacing: 1, marginBottom: 8 }}>{cat.toUpperCase()}</Text>
              {items.map(f => (
                <Pressable key={f.id} onPress={() => setOpen(open === f.id ? null : f.id)} style={{ marginBottom: 8 }}>
                  <Card pad={14}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ flex: 1, fontWeight: '700', color: T.ink }}>{f.question}</Text>
                      <Ionicons name={open === f.id ? 'chevron-up' : 'chevron-down'} size={18} color={T.inkMute} />
                    </View>
                    {open === f.id && (
                      <Text style={{ marginTop: 10, color: T.inkSoft, lineHeight: 21, fontSize: 14 }}>{f.answer}</Text>
                    )}
                  </Card>
                </Pressable>
              ))}
            </View>
          ))
        }

        <View style={{ height: 1, backgroundColor: T.line, marginVertical: 16 }} />
        <Text style={{ color: T.inkMute, marginBottom: 10 }}>Still need help?</Text>
        <Pressable onPress={() => Linking.openURL('mailto:secretary@lionsclubahmedabad.org')}>
          <Card pad={14}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="mail" size={20} color={T.brandBlue} />
              <Text style={{ flex: 1, fontWeight: '700', color: T.ink }}>Contact Secretary</Text>
              <Ionicons name="chevron-forward" size={16} color={T.inkFaint} />
            </View>
          </Card>
        </Pressable>
      </View>
    </Screen>
  );
}
