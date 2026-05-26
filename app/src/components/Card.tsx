import React from 'react';
import { View, ViewStyle } from 'react-native';
import { T } from '../theme/tokens';

export const Card: React.FC<{ children: React.ReactNode; style?: ViewStyle; pad?: number }> = ({ children, style, pad = 16 }) => (
  <View style={[{
    backgroundColor: T.surface, borderRadius: T.r.lg, padding: pad,
    shadowColor: '#0A1628', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  }, style]}>
    {children}
  </View>
);
