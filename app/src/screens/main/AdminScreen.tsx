import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Pill } from '../../components/Pill';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

type Method = 'password' | 'sms' | 'whatsapp';

export default function AdminScreen() {
  const nav = useNavigation<any>();
  const { member } = useAuth();
  const [method, setMethod] = useState<Method>('password');
  const [wa, setWa] = useState<any>(null);
  const [smsCfg, setSmsCfg] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const d = await api.get<any>('/admin/auth');
      setMethod(d.method); setWa(d.whatsapp); setSmsCfg(!!d.sms?.configured);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); const t = setInterval(load, 4000); return () => clearInterval(t); }, []);

  const setMethodM = useMutation({ mutationFn: (m: Method) => api.post('/admin/auth/method', { method: m }), onSuccess: () => load() });
  const restart = useMutation({ mutationFn: () => api.post('/admin/whatsapp/restart', {}), onSuccess: () => load() });

  if (!member?.superAdmin) {
    return (
      <Screen bg={T.bg}>
        <View style={{ padding: 16, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Ionicons name="lock-closed" size={40} color={T.inkMute} />
          <Text style={{ marginTop: 12, fontWeight: '700', color: T.ink }}>Super admin access required</Text>
        </View>
      </Screen>
    );
  }

  const statusTone = (s: string) => (s === 'open' ? T.success : s === 'qr' ? T.brandGold : T.inkMute);
  const Opt = ({ m, label, icon }: { m: Method; label: string; icon: string }) => (
    <Pressable onPress={() => setMethodM.mutate(m)} style={{ flex: 1, paddingVertical: 12, borderRadius: T.r.sm, alignItems: 'center', backgroundColor: method === m ? T.brandBlue : 'transparent', borderWidth: 1.5, borderColor: method === m ? T.brandBlue : T.line }}>
      <Ionicons name={icon as any} size={16} color={method === m ? '#fff' : T.inkMute} />
      <Text style={{ color: method === m ? '#fff' : T.inkMute, fontWeight: '700', marginTop: 4, fontSize: 12 }}>{label}</Text>
    </Pressable>
  );

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>System Admin</Text>
      </View>
      <ScrollView style={{ paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <Card style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: T.inkMute, letterSpacing: 1, marginBottom: 8 }}>LOGIN METHOD</Text>
          <Text style={{ color: T.inkMute, fontSize: 13, marginBottom: 12 }}>Choose how members sign in. Password is the default for App Store / Play Store submission.</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Opt m="password" label="Password" icon="lock-closed" />
            <Opt m="sms" label="SMS OTP" icon="call" />
            <Opt m="whatsapp" label="WhatsApp" icon="chatbubbles" />
          </View>
          <View style={{ marginTop: 12 }}>
            {method === 'password' && <Pill label="Active: Password" color={T.brandBlue} />}
            {method === 'sms' && (smsCfg ? <Pill label="SMS (MSG91 configured)" color={T.success} /> : <Pill label="SMS - configure MSG91 in server .env" color={T.danger} />)}
            {method === 'whatsapp' && <Pill label="Active: WhatsApp OTP" color={T.brandGold} />}
          </View>
          <Text style={{ color: T.inkFaint, fontSize: 11, marginTop: 10 }}>Super admin always signs in with 8905496456 + the fixed password (default Omsinv@8786). Set other members' passwords from Manage Roster.</Text>
        </Card>

        <Card>
          <Text style={{ fontSize: 11, fontWeight: '800', color: T.inkMute, letterSpacing: 1, marginBottom: 8 }}>WHATSAPP LINK (QR)</Text>
          <Text style={{ color: T.inkMute, fontSize: 13, marginBottom: 12 }}>Only needed when the method is WhatsApp OTP. Scan from your phone's WhatsApp: Settings, then Linked Devices, then Link a device.</Text>
          {loading ? <ActivityIndicator color={T.brandBlue} /> : !wa?.installed ? (
            <Text style={{ color: T.danger, fontSize: 13 }}>WhatsApp module not installed. Run: cd server && npm install, then restart the server.</Text>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <View style={{ marginBottom: 10 }}><Pill label={`Status: ${wa.status}`} color={statusTone(wa.status)} /></View>
              {wa.status === 'open' ? (
                <Text style={{ color: T.inkMute, fontSize: 13, textAlign: 'center' }}>WhatsApp is connected and ready to send OTPs.</Text>
              ) : wa.qr ? (
                <Image source={{ uri: wa.qr }} style={{ width: 240, height: 240, borderRadius: 12, backgroundColor: '#fff' }} resizeMode="contain" />
              ) : (
                <Text style={{ color: T.inkMute, fontSize: 13 }}>Waiting for QR...</Text>
              )}
              <Button label="Reconnect / new QR" variant="outline" onPress={() => restart.mutate()} loading={restart.isPending} style={{ marginTop: 14, alignSelf: 'stretch' }} />
            </View>
          )}
          <Text style={{ color: T.inkFaint, fontSize: 11, marginTop: 14 }}>Unofficial WhatsApp Web link (interim). For production, prefer SMS or the official WhatsApp Business API, and run this always-on process on a VPS.</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}