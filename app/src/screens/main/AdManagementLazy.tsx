import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { T } from "../../theme/tokens";

/**
 * Lazy wrapper for AdManagementScreen.
 * Delays importing expo-image-picker and expo-file-system until rendered.
 */
export default function AdManagementLazy() {
  const [Comp, setComp] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const mod = require("./AdManagementScreen");
      if (!cancelled) setComp(() => mod.default);
    } catch (e: any) {
      console.warn("[AdManagement] failed to load:", e?.message);
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