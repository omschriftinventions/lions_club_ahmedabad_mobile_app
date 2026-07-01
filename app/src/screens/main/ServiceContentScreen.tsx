import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

interface ImpactRow { id: string; name: string; icon: string; color: string; units: number; amount_inr: number; projects: number; }

export default function ServiceContentScreen() {
  const nav = useNavigation<any>();
  const { member } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['impact'],
    queryFn: () => api.get<{ impact: ImpactRow[] }>('/causes/impact'),
  });

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.ink }}>Our Service Impact</Text>
        {member?.canEdit && (
          <Pressable
            onPress={() => nav.navigate('LogProject', {})}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.brandBlue, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        )}
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.4 }}>Causes we serve</Text>
        <Text style={{ color: T.inkMute, marginTop: 4 }}>Lions International Global Causes. Tap a cause to see its projects.</Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
        {isLoading ? <ActivityIndicator color={T.brandBlue} /> :
          (data?.impact ?? []).map(c => (
            <Pressable key={c.id} onPress={() => nav.navigate('ProjectDetail', { causeId: c.id })}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Text style={{ fontSize: 32 }}>{c.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: T.ink, fontSize: 16 }}>{c.name}</Text>
                    <Text style={{ color: T.inkMute, fontSize: 12, marginTop: 2 }}>{c.projects} projects Â· â‚¹{Number(c.amount_inr).toLocaleString('en-IN')}</Text>
                  </View>
                  <Text style={{ fontWeight: '800', color: c.color, fontSize: 22 }}>{c.units}</Text>
                  <Ionicons name="chevron-forward" size={18} color={T.inkFaint} style={{ marginLeft: 4 }} />
                </View>
              </Card>
            </Pressable>
          ))}
      </View>
    </Screen>
  );
}
