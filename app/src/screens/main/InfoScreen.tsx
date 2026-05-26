import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { T } from '../../theme/tokens';

export default function InfoScreen() {
  const nav = useNavigation<any>();
  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>About</Text>
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.4 }}>Lions Club of Ahmedabad host (Main)</Text>
        <Text style={{ color: T.inkMute, marginTop: 4 }}>District 3232 B1 · Chartered 2009</Text>
      </View>
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <Card>
          <Text style={{ fontWeight: '700', color: T.ink, fontSize: 15 }}>Our motto</Text>
          <Text style={{ color: T.inkSoft, marginTop: 6, fontSize: 22, fontStyle: 'italic' }}>"We Serve"</Text>
        </Card>
        <Card>
          <Text style={{ fontWeight: '700', color: T.ink }}>Meeting schedule</Text>
          <Text style={{ color: T.inkSoft, marginTop: 6 }}>1st & 3rd Wednesday — 8:00 PM, Club House, Navrangpura.</Text>
        </Card>
        <Card>
          <Text style={{ fontWeight: '700', color: T.ink }}>Contact</Text>
          <Pressable onPress={() => Linking.openURL('mailto:secretary@lionsclubahmedabad.org')}>
            <Text style={{ color: T.brandBlue, marginTop: 6 }}>secretary@lionsclubahmedabad.org</Text>
          </Pressable>
        </Card>
        <Card>
          <Text style={{ fontWeight: '700', color: T.ink }}>App version</Text>
          <Text style={{ color: T.inkMute, marginTop: 6 }}>0.1.0</Text>
        </Card>
      </View>
    </Screen>
  );
}
