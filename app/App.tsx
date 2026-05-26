import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from './src/lib/auth';
import { queryClient } from './src/lib/queryClient';
import { registerForPush } from './src/lib/push';
import RootNavigator from './src/navigation/RootNavigator';
import { T } from './src/theme/tokens';

export default function App() {
  const { ready, hydrate, access } = useAuth();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (access) registerForPush().catch(() => {});
  }, [access]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.brandBlueDeep }}>
        <ActivityIndicator color={T.brandGold} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
