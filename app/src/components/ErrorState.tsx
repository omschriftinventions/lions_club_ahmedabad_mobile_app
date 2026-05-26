import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../theme/tokens';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<Props> = ({
  title = 'Something went wrong',
  message = 'Check your connection and try again.',
  onRetry,
}) => (
  <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingVertical: 36 }}>
    <View style={{
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: `${T.danger}1A`, alignItems: 'center', justifyContent: 'center',
      marginBottom: 14,
    }}>
      <Ionicons name="alert-circle" size={36} color={T.danger} />
    </View>
    <Text style={{ fontSize: 17, fontWeight: '800', color: T.ink }}>{title}</Text>
    <Text style={{ marginTop: 6, color: T.inkMute, fontSize: 14, textAlign: 'center' }}>{message}</Text>
    {onRetry && (
      <Pressable onPress={onRetry} style={{ marginTop: 18, paddingHorizontal: 18, paddingVertical: 10, borderRadius: T.r.pill, backgroundColor: T.brandBlue }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
      </Pressable>
    )}
  </View>
);
