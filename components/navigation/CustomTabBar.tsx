import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { usePathname } from "expo-router";
import {
  Home,
  MessageCircle,
  Lightbulb,
  Map,
  Calendar,
} from "lucide-react-native";
import { TabBarButton } from "./TabBarButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function CustomTabBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabs = [
    { href: "/(tabs)", icon: Home, label: "Home" },
    { href: "/(tabs)/booking", icon: Calendar, label: "Bookings" },
    { href: "/(tabs)/map", icon: Map, label: "Map" },
    { href: "/(tabs)/inspiration", icon: Lightbulb, label: "Inspiration" },
    { href: "/(tabs)/chat", icon: MessageCircle, label: "Chat" },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === "ios" ? insets.bottom + 8 : 20,
        },
      ]}
    >
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TabBarButton
            key={tab.href}
            href={tab.href}
            icon={tab.icon}
            label={tab.label}
            isActive={
              pathname === tab.href ||
              (pathname === "/(tabs)" && tab.href === "/(tabs)")
            }
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#2A2A2A",
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 12, // ← Augmenté pour plus d'espace
    justifyContent: "space-evenly", // ← Ajouté pour espacer uniformément
    alignItems: "center", // ← Ajouté pour centrer verticalement
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
});
