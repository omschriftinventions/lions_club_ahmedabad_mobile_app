import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { T } from "../../theme/tokens";

/**
 * Lazy wrapper for MeetingUploadScreen.
 * Delays importing expo-document-picker and expo-file-system until the screen
 * is actually rendered, preventing native module initialization crashes.
 */
export default function MeetingUploadLazy() {
  const [Comp, setComp] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const mod = require("./MeetingUploadScreen");
      if (!cancelled) setComp(() => mod.default);
    } catch (e: any) {
      console.warn("[MeetingUpload] failed to load:", e?.message);
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