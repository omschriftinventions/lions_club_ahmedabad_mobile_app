import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, Pressable, Dimensions, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { T } from "../theme/tokens";

interface AdItem {
  id: number;
  image_url: string;
  title: string | null;
  link_url: string | null;
}

const SCREEN_W = Dimensions.get("window").width;

/**
 * Horizontal auto-rotating advertisement carousel.
 * Fetches ads from /advertisements/public?placement=<placement>.
 * If multiple images, rotates every 4 seconds. Tappable to open link_url.
 */
export const AdCarousel: React.FC<{ placement: "dashboard" | "login"; onPressLink?: (url: string) => void }> = ({ placement, onPressLink }) => {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const flatRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const API_BASE = (process.env as any).EXPO_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(API_BASE + "/advertisements/public?placement=" + placement);
        const data = await res.json() as { ads: AdItem[] };
        if (!cancelled) setAds(data.ads || []);
      } catch { /* silent */ }
    };
    load();
    return () => { cancelled = true; };
  }, [placement]);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => {
        const next = (prev + 1) % ads.length;
        flatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [ads.length]);

  const onMomentumScrollEnd = useCallback((e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_W - 32));
    setActiveIdx(Math.min(idx, ads.length - 1));
  }, [ads.length]);

  if (!ads.length) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={ads}
        horizontal
        pagingEnabled
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({ length: SCREEN_W - 32, offset: (SCREEN_W - 32) * index, index })}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        renderItem={({ item }) => (
          <Pressable
            style={{ width: SCREEN_W - 32 }}
            onPress={() => item.link_url && onPressLink?.(item.link_url)}
          >
            <View style={styles.adCard}>
              <Image source={{ uri: item.image_url }} style={styles.adImage} resizeMode="cover" />
              {item.title && (
                <View style={styles.titleBar}>
                  <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
                </View>
              )}
              {item.link_url && (
                <View style={styles.linkBadge}>
                  <Ionicons name="open-outline" size={12} color="#fff" />
                </View>
              )}
            </View>
          </Pressable>
        )}
      />
      {/* Dots indicator */}
      {ads.length > 1 && (
        <View style={styles.dotsRow}>
          {ads.map((_, i) => (
            <View key={i} style={[styles.dot, { opacity: i === activeIdx ? 1 : 0.3 }]} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginVertical: 6 },
  adCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: T.surface,
    shadowColor: "#0A1628",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  adImage: { width: "100%", height: 160, resizeMode: "contain" },
  titleBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,31,69,0.75)",
    paddingHorizontal: 12, paddingVertical: 6,
  },
  titleText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  linkBadge: {
    position: "absolute", top: 8, right: 8,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "rgba(0,31,69,0.6)",
    alignItems: "center", justifyContent: "center",
  },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.brandBlue },
});