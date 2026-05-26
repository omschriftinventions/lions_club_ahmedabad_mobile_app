import React from 'react';
import { View, Text, Pressable, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

export default function SettingsScreen() {
  const nav = useNavigation<any>();
  const { logout, member } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Sign out?', 'You will need to re-enter your phone + OTP.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Settings</Text>
      </View>
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <Card>
          <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5 }}>ACCOUNT</Text>
          <Text style={{ marginTop: 6, fontWeight: '700', color: T.ink }}>{member?.name}</Text>
          <Text style={{ color: T.inkMute, fontSize: 13, marginTop: 2 }}>{member?.role}</Text>
        </Card>

        <Row icon="person-circle"      label="Edit profile"        onPress={() => nav.navigate('ProfileEdit')} />
        <Row icon="notifications"      label="Notifications"       onPress={() => nav.navigate('Notifications')} />
        <Row icon="information-circle" label="About the club"      onPress={() => nav.navigate('Info')} />
        <Row icon="help-circle"        label="Help & FAQ"          onPress={() => nav.navigate('HelpFAQ')} />

        <View style={{ marginTop: 12 }}>
          <Button label="Sign out" variant="danger" onPress={confirmLogout} />
        </View>

        <Text style={{ textAlign: 'center', color: T.inkFaint, fontSize: 11, marginTop: 18 }}>App version 0.1.0</Text>
      </View>
    </Screen>
  );
}

const Row = ({ icon, label, onPress }: any) => (
  <Pressable onPress={onPress}>
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Ionicons name={icon} size={22} color={T.brandBlue} />
        <Text style={{ flex: 1, fontWeight: '700', color: T.ink }}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={T.inkFaint} />
      </View>
    </Card>
  </Pressable>
);
