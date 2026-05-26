import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../lib/auth';
import { Button } from '../../components/Button';
import { T } from '../../theme/tokens';

export default function OtpScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { verifyOtp, requestOtp } = useAuth();
  const phone = route.params.phone as string;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (code.length !== 6) {
      Alert.alert('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(phone, code);
      // RootNavigator will switch on auth state change
    } catch (e: any) {
      Alert.alert('Invalid code', e.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[T.brandBlueDeep, T.brandBlue]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: T.r.xl, padding: 22 }}>
          <Text style={{ fontSize: 19, fontWeight: '800', color: T.ink }}>Enter OTP</Text>
          <Text style={{ color: T.inkMute, marginTop: 4 }}>Sent to +91 {phone}</Text>
          <TextInput
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
            placeholder="• • • • • •"
            keyboardType="number-pad"
            maxLength={6}
            placeholderTextColor={T.inkFaint}
            style={{
              marginTop: 20, height: 64, borderWidth: 1, borderColor: T.line, borderRadius: T.r.md,
              textAlign: 'center', fontSize: 28, letterSpacing: 8, color: T.ink, fontWeight: '700',
            }}
          />
          <Button label="Verify & sign in" onPress={submit} loading={loading} style={{ marginTop: 18 }} />
          <Pressable onPress={() => requestOtp(phone).then(() => Alert.alert('OTP resent'))} style={{ marginTop: 14, alignItems: 'center' }}>
            <Text style={{ color: T.brandBlue, fontWeight: '600' }}>Resend code</Text>
          </Pressable>
          <Pressable onPress={() => nav.goBack()} style={{ marginTop: 6, alignItems: 'center' }}>
            <Text style={{ color: T.inkMute }}>Change number</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
