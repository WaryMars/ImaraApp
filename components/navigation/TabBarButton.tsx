import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { LucideIcon } from "lucide-react-native";

interface TabBarButtonProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
}

export function TabBarButton({
  href,
  icon: Icon,
  label,
  isActive,
}: TabBarButtonProps) {
  return (
    <Link href={href} asChild>
      <Pressable style={[styles.tab, isActive && styles.tabActive]}>
        <Icon
          size={28} // ← Taille réduite pour mieux espacer
          color={isActive ? "#000000" : "#FFFFFF"}
          strokeWidth={2}
        />
        {isActive && <Text style={styles.tabLabel}>{label}</Text>}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16, // ← Padding horizontal pour plus d'espace
    borderRadius: 18,
    gap: 8,
    minWidth: 50, // ← Largeur minimale pour garder l'espacement
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
  },
});
