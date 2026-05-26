import React from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle, StyleSheet } from 'react-native';
import { T } from '../theme/tokens';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  full?: boolean;
}

export const Button: React.FC<Props> = ({ label, onPress, variant = 'primary', loading, disabled, style, full = true }) => {
  const isDisabled = disabled || loading;
  const palette = {
    primary: { bg: T.brandBlue,  fg: '#fff',     border: T.brandBlue },
    gold:    { bg: T.brandGold,  fg: T.ink,      border: T.brandGold },
    outline: { bg: 'transparent', fg: T.brandBlue, border: T.brandBlue },
    ghost:   { bg: 'transparent', fg: T.brandBlue, border: 'transparent' },
    danger:  { bg: T.danger,     fg: '#fff',     border: T.danger },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
          alignSelf: full ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={palette.fg} />
        : <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: { height: 50, borderRadius: T.r.lg, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  label: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
});
