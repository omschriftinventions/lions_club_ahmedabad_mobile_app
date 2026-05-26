import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../theme/tokens';

interface Props {
  icon?: any;
  title: string;
  body?: string;
  cta?: React.ReactNode;
  style?: ViewStyle;
}

export const EmptyState: React.FC<Props> = ({ icon = 'information-circle-outline', title, body, cta, style }) => (
  <View style={[{ alignItems: 'center', paddingHorizontal: 24, paddingVertical: 36 }, style]}>
    <View style={{
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: T.bgWarm, alignItems: 'center', justifyContent: 'center',
      marginBottom: 14,
    }}>
      <Ionicons name={icon} size={36} color={T.brandBlue} />
    </View>
    <Text style={{ fontSize: 17, fontWeight: '800', color: T.ink, letterSpacing: -0.3 }}>{title}</Text>
    {body && <Text style={{ marginTop: 6, color: T.inkMute, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>{body}</Text>}
    {cta && <View style={{ marginTop: 18 }}>{cta}</View>}
  </View>
);
