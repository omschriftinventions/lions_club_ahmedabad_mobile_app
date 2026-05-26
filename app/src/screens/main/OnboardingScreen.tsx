import React, { useState } from 'react';
import { View, Text, Pressable, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { T } from '../../theme/tokens';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '🦁',
    title: 'Welcome to Lions Club Ahmedabad',
    body: 'Your private member app for Lions Club of Ahmedabad host (Main) — District 3232 B1. Roster, events, news, all in one place.',
  },
  {
    icon: '📅',
    title: 'Never miss an event',
    body: 'See upcoming meetings and service projects. RSVP with one tap. Get a reminder the morning of.',
  },
  {
    icon: '🔔',
    title: 'Stay in the loop',
    body: 'Officers can broadcast announcements. We\'ll send a notification straight to your phone.',
  },
];

export default function OnboardingScreen() {
  const nav = useNavigation<any>();
  const [step, setStep] = useState(0);

  const next = async () => {
    if (step < SLIDES.length - 1) {
      setStep(step + 1);
    } else {
      try { await Notifications.requestPermissionsAsync(); } catch { /* swallow */ }
      nav.replace('Main');
    }
  };

  const slide = SLIDES[step];

  return (
    <Screen bg={T.brandBlueDeep} scroll={false}>
      <LinearGradient colors={[T.brandBlueDeep, T.brandBlue]} style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Pressable onPress={() => nav.replace('Main')}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Skip</Text>
          </Pressable>
        </View>

        <View style={{ alignItems: 'center' }}>
          <View style={{
            width: 120, height: 120, borderRadius: 60,
            backgroundColor: 'rgba(255,255,255,0.1)',
            alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          }}>
            <Text style={{ fontSize: 56 }}>{slide.icon}</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' }}>{slide.title}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 14, textAlign: 'center', lineHeight: 23, paddingHorizontal: 8 }}>{slide.body}</Text>
        </View>

        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 22 }}>
            {SLIDES.map((_, i) => (
              <View key={i} style={{
                width: i === step ? 22 : 8, height: 8, borderRadius: 4,
                backgroundColor: i === step ? T.brandGold : 'rgba(255,255,255,0.3)',
              }} />
            ))}
          </View>
          <Button
            label={step === SLIDES.length - 1 ? 'Enable notifications & finish' : 'Next'}
            variant="gold"
            onPress={next}
          />
        </View>
      </LinearGradient>
    </Screen>
  );
}
