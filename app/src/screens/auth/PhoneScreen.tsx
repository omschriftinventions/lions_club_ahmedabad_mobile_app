import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../lib/auth';
import { Button } from '../../components/Button';
import { T } from '../../theme/tokens';
import type { AuthStackParamList } from '../../navigation/AuthStack';

export default function PhoneScreen() {
  const nav = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { requestOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      await requestOtp(phone);
      nav.navigate('Otp', { phone });
    } catch (e: any) {
      Alert.alert('Could not send OTP', e.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[T.brandBlueDeep, T.brandBlue]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <Image source={require('../../../assets/icon.png')} style={{ width: 80, height: 80, borderRadius: 18, marginBottom: 16 }} />
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.4, textAlign: 'center' }}>Lions Club of Ahmedabad host (Main)</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>District 3232 B1 · Members only</Text>
        </View>

        <View style={{ backgroundColor: '#fff', borderRadius: T.r.xl, padding: 22 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink, marginBottom: 8 }}>Sign in with phone</Text>
          <Text style={{ color: T.inkMute, marginBottom: 18 }}>We'll send you a 6-digit OTP. Must match the number on file.</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: T.line, borderRadius: T.r.md, paddingHorizontal: 14, height: 52 }}>
            <Text style={{ color: T.inkSoft, fontWeight: '600', marginRight: 8 }}>+91</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="98250 12345"
              keyboardType="phone-pad"
              maxLength={14}
              placeholderTextColor={T.inkFaint}
              style={{ flex: 1, fontSize: 17, color: T.ink }}
            />
          </View>
          <Button label="Send OTP" onPress={submit} loading={loading} style={{ marginTop: 18 }} />
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
