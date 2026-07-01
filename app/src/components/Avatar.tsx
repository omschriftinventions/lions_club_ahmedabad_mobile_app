import React from 'react';
import { View, Text, Image } from 'react-native';
import { T } from '../theme/tokens';

interface Props {
  initials?: string;
  size?: number;
  color?: string;
  uri?: string | null;
}

export const Avatar: React.FC<Props> = ({ initials = '', size = 40, color = T.inkMute, uri }) =>
  uri ? (
    <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: T.surface }} />
  ) : (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.4 }}>{initials}</Text>
    </View>
  );
