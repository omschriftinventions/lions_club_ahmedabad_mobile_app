import React from 'react';
import { View, Text, Pressable, Share, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line } from 'react-native-svg';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { T } from '../../theme/tokens';

export default function CharterInviteScreen() {
  const nav = useNavigation<any>();

  const onShare = () => {
    Share.share({
      title: 'Charter Night 2026',
      message:
        '🦁 You\'re invited to Charter Night 2026 — 17th Installation Ceremony of Lions Club of Ahmedabad host (Main).\n\n' +
        '📅 Saturday, 14 June 2026 · 7:30 PM\n' +
        '📍 Hyatt Regency, Ashram Road\n\n' +
        'RSVP via the Lions Club of Ahmedabad host (Main) app.',
    });
  };

  return (
    <Screen bg={T.brandBlueDeep} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 12 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
      </View>

      <LinearGradient colors={[T.brandBlueDeep, T.brandBlue]} style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={320} height={320} viewBox="0 0 320 320" style={{ position: 'absolute', opacity: 0.07 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <Line key={i} x1="160" y1="160" x2="160" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i * 18} 160 160)`} />
          ))}
        </Svg>

        <Text style={{ color: T.brandGold, fontSize: 11, fontWeight: '800', letterSpacing: 4 }}>YOU ARE INVITED</Text>
        <Text style={{ color: '#fff', fontSize: 36, fontWeight: '800', letterSpacing: -0.5, marginTop: 10, textAlign: 'center' }}>Charter Night</Text>
        <Text style={{ color: T.brandGold, fontSize: 18, fontWeight: '700', marginTop: 4 }}>2026 · 17th Installation</Text>

        <View style={{ height: 1, width: 80, backgroundColor: T.brandGold, marginVertical: 26 }} />

        <View style={{ alignItems: 'center', gap: 8 }}>
          <Row icon="calendar" text="Saturday, 14 June 2026" />
          <Row icon="time"     text="7:30 PM onwards" />
          <Row icon="location" text="Hyatt Regency, Ashram Road" />
          <Row icon="restaurant" text="Dinner · Black-tie optional" />
        </View>

        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 28, textAlign: 'center', paddingHorizontal: 14 }}>
          "We Serve" — Join us as we install the new board and celebrate another year of service to Ahmedabad.
        </Text>

        <View style={{ marginTop: 36, width: '100%', gap: 10 }}>
          <Button label="RSVP via the app" variant="gold" onPress={() => nav.navigate('Main', { screen: 'Events' })} />
          <Button label="Share invite" variant="outline" onPress={onShare}
            style={{ borderColor: '#fff' as any }} />
        </View>
      </LinearGradient>
    </Screen>
  );
}

const Row = ({ icon, text }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
    <Ionicons name={icon} size={16} color={T.brandGold} />
    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{text}</Text>
  </View>
);
