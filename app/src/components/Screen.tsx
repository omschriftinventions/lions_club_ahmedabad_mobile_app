import React from 'react';
import { ScrollView, View, ViewStyle, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T } from '../theme/tokens';

interface Props {
  children: React.ReactNode;
  bg?: string;
  scroll?: boolean;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const Screen: React.FC<Props> = ({ children, bg = T.bg, scroll = true, style, edges }) => {
  const content = scroll
    ? <ScrollView style={{ flex: 1 }} contentContainerStyle={[{ paddingBottom: 24 }, style]} showsVerticalScrollIndicator={false}>{children}</ScrollView>
    : <View style={[{ flex: 1 }, style]}>{children}</View>;
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: bg }]} edges={edges}>
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});
