import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../lib/api';
import { T } from '../../theme/tokens';
import { GUIDE_SECTIONS, GUIDE_FAQS, type GuideFAQ } from '../../lib/guide';

export default function HelpFAQScreen() {
  const nav = useNavigation<any>();
  const [q, setQ] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const dbFaqs = useQuery({ queryKey: ['faqs'], queryFn: () => api.get<{ faqs: any[] }>('/faqs') });

  const allFaqs: GuideFAQ[] = useMemo(() => {
    const db = (dbFaqs.data?.faqs ?? []).map((f) => ({ q: f.question, a: f.answer, category: f.category || 'General' }));
    return [...GUIDE_FAQS, ...db];
  }, [dbFaqs.data]);

  const ql = q.trim().toLowerCase();
  const sections = ql
    ? GUIDE_SECTIONS.filter((s) => `${s.title} ${s.summary} ${s.steps.join(' ')} ${(s.tips ?? []).join(' ')}`.toLowerCase().includes(ql))
    : GUIDE_SECTIONS;
  const faqs = ql
    ? allFaqs.filter((f) => `${f.q} ${f.a} ${f.category}`.toLowerCase().includes(ql))
    : allFaqs;
  const groups = faqs.reduce((acc: Record<string, GuideFAQ[]>, f) => { const k = f.category; (acc[k] = acc[k] || []).push(f); return acc; }, {});

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Help & User Guide</Text>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: T.r.md, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: T.line }}>
          <Ionicons name="search" size={16} color={T.inkMute} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search the guide or FAQs..." placeholderTextColor={T.inkFaint}
            style={{ flex: 1, marginLeft: 8, fontSize: 14, color: T.ink }} />
        </View>
      </View>

      {(sections.length === 0 && faqs.length === 0) ? (
        <EmptyState icon="help-circle-outline" title={`No matches for "${q}"`} body="Try a different keyword." />
      ) : (
        <View style={{ paddingHorizontal: 16 }}>
          {sections.length > 0 && (
            <>
              <Text style={sectionLabelStyle}>{'User Guide \u00b7 '}{sections.length}</Text>
              {sections.map((s) => (
                <Card key={s.id} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Text style={{ fontSize: 24, lineHeight: 28 }}>{s.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '800', color: T.ink, fontSize: 16 }}>{s.title}</Text>
                      <Text style={{ color: T.inkMute, fontSize: 13, marginTop: 4 }}>{s.summary}</Text>
                    </View>
                  </View>
                  {s.steps.map((step, i) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                      <Text style={{ fontWeight: '800', color: T.brandBlue, fontSize: 13 }}>{i + 1}.</Text>
                      <Text style={{ flex: 1, color: T.inkSoft, fontSize: 14, lineHeight: 21 }}>{step}</Text>
                    </View>
                  ))}
                  {!!(s.tips && s.tips.length) && (
                    <View style={{ marginTop: 12, backgroundColor: T.bg, borderRadius: T.r.sm, padding: 10 }}>
                      {s.tips.map((t, i) => (
                        <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: i ? 6 : 0 }}>
                          <Ionicons name="checkmark-circle" size={15} color={T.success} />
                          <Text style={{ flex: 1, color: T.inkMute, fontSize: 13, lineHeight: 18 }}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Card>
              ))}
            </>
          )}

          {faqs.length > 0 && (
            <>
              <Text style={[sectionLabelStyle, { marginTop: 8 }]}>{'Frequently Asked \u00b7 '}{faqs.length}</Text>
              {dbFaqs.isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 16 }} /> :
                Object.entries(groups).map(([cat, items]) => (
                  <View key={cat} style={{ marginBottom: 18 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: T.inkMute, letterSpacing: 1, marginBottom: 8 }}>{cat.toUpperCase()}</Text>
                    {items.map((f, i) => {
                      const key = `${cat}-${i}`;
                      const open = openFaq === key;
                      return (
                        <Pressable key={key} onPress={() => setOpenFaq(open ? null : key)} style={{ marginBottom: 8 }}>
                          <Card pad={14}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                              <Text style={{ flex: 1, fontWeight: '700', color: T.ink, fontSize: 14 }}>{f.q}</Text>
                              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={T.inkMute} />
                            </View>
                            {open && <Text style={{ marginTop: 10, color: T.inkSoft, lineHeight: 21, fontSize: 14 }}>{f.a}</Text>}
                          </Card>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
            </>
          )}

          <View style={{ height: 1, backgroundColor: T.line, marginVertical: 16 }} />
          <Text style={{ color: T.inkMute, marginBottom: 10 }}>Still need help?</Text>
          <Pressable onPress={() => Linking.openURL('mailto:secretary@lionsclubahmedabad.org')}>
            <Card pad={14}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="mail" size={20} color={T.brandBlue} />
                <Text style={{ flex: 1, fontWeight: '700', color: T.ink }}>Contact the Secretary</Text>
                <Ionicons name="chevron-forward" size={16} color={T.inkFaint} />
              </View>
            </Card>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}

const sectionLabelStyle = {
  fontSize: 11, fontWeight: '800', color: T.inkMute, letterSpacing: 1, marginBottom: 10,
} as const;