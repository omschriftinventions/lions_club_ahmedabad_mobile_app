import React from 'react';
import { View, Text } from 'react-native';
import { T } from '../theme/tokens';

export const Pill: React.FC<{ label: string; color?: string; bg?: string }> = ({ label, color = T.brandBlue, bg }) => (
  <View style={{
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: T.r.pill,
    backgroundColor: bg ?? `${color}1A`, alignSelf: 'flex-start',
  }}>
    <Text style={{ color, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>{label.toUpperCase()}</Text>
  </View>
);
