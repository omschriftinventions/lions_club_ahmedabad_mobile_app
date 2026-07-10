import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';

interface State { error: Error | null }

/**
 * Top-level error boundary. In release builds a thrown error during startup
 * white-screens / hard-crashes with no red box; this catches it and shows the
 * message on-device so failures are diagnosable instead of an instant crash.
 */
export class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[RootErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: '#001F45', padding: 24, paddingTop: 80 }}>
          <Text style={{ color: '#FFD100', fontSize: 20, fontWeight: '800', marginBottom: 12 }}>
            Something went wrong
          </Text>
          <Text style={{ color: '#fff', fontSize: 14, marginBottom: 16 }}>
            The app hit an error while starting. Please share this with support:
          </Text>
          <ScrollView style={{ maxHeight: 320, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'monospace' }}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack?.slice(0, 2000)}
            </Text>
          </ScrollView>
          <Pressable
            onPress={() => this.setState({ error: null })}
            style={{ marginTop: 20, backgroundColor: '#FFD100', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#0A1628', fontWeight: '800' }}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
