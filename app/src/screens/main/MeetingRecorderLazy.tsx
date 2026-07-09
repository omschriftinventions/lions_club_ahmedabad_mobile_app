import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { T } from "../../theme/tokens";

/**
 * Lazy wrapper for MeetingRecorderScreen.
 * Delays importing expo-audio until the screen is actually rendered,
 * preventing native module initialization crashes at app startup.
 */
export default function MeetingRecorderLazy() {
  const [Comp, setComp] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Dynamic require runs only when this component mounts, not at app startup
    try {
      const mod = require("./MeetingRecorderScreen");
      if (!cancelled) setComp(() => mod.default);
    } catch (e: any) {
      console.warn("[MeetingRecorder] failed to load:", e?.message);
    }
    return () => { cancelled = true; };
  }, []);

  if (!Comp) {
    return (
      <View style={{ flex: 1, backgroundColor: T.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={T.brandBlue} />
      </View>
    );
  }
  return <Comp />;
}