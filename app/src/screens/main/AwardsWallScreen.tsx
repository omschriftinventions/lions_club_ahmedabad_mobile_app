import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../lib/api';
import { T } from '../../theme/tokens';

interface Award {
  id: number; name: string; category: string | null;
  awarded_on: string | null; description: string | null; icon: string | null;
  member_id: number | null; member_name: string | null;
  member_initials: string | null; avatar_color: string | null;
}

export default function AwardsWallScreen() {
  const nav = useNavigation<any>();
  const { data, isLoading } = useQuery({
    queryKey: ['awards'],
    queryFn: () => api.get<{ awards: Award[] }>('/awards'),
  });

  return (
    <Screen bg={T.bgWarm} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Awards Wall</Text>
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.4 }}>Recognitions</Text>
        <Text style={{ color: T.inkMute, marginTop: 4 }}>Celebrating Lions and the club</Text>
      </View>
      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> :
        (data?.awards.length ?? 0) === 0 ? <EmptyState icon="trophy-outline" title="No awards listed yet" /> : (
          <FlatList
            data={data?.awards ?? []}
            keyExtractor={a => String(a.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => item.member_id && nav.navigate('MemberDetail', { id: item.member_id })}
                style={{ marginBottom: 12 }}
              >
                <Card pad={14}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{
                      width: 56, height: 56, borderRadius: 28,
                      backgroundColor: `${T.brandGold}33`,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 26 }}>{item.icon ?? '🏆'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '800', color: T.ink, fontSize: 15 }}>{item.name}</Text>
                      {item.category && (
                        <View style={{ marginTop: 6 }}>
                          <Pill label={item.category} color={T.brandBlue} />
                        </View>
                      )}
                      {item.member_name && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                          <Avatar initials={item.member_initials ?? ''} size={22} color={item.avatar_color ?? T.brandBlue} />
                          <Text style={{ color: T.inkSoft, fontSize: 13 }}>{item.member_name}</Text>
                        </View>
                      )}
                      {item.awarded_on && (
                        <Text style={{ color: T.inkFaint, fontSize: 11, marginTop: 6 }}>
                          {new Date(item.awarded_on).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                      )}
                      {item.description && (
                        <Text style={{ color: T.inkMute, fontSize: 13, marginTop: 6 }} numberOfLines={2}>{item.description}</Text>
                      )}
                    </View>
                  </View>
                </Card>
              </Pressable>
            )}
          />
        )
      }
    </Screen>
  );
}
