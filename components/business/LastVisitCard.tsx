import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";
import { router } from "expo-router";

interface LastVisitCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  badge?: string;
}

export function LastVisitCard({
  id,
  name,
  image,
  rating,
  reviewCount,
  badge,
}: LastVisitCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/business/${id}`)}
    >
      <Image source={{ uri: image }} style={styles.image} />

      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFA500" fill="#FFA500" />
            <Text style={styles.rating}>{rating}</Text>
            <Text style={styles.reviewCount}>({reviewCount})</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push(`/booking/${id}`)}
        >
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  badge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#14B8A6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: "#000000",
    fontSize: 10,
    fontWeight: "700",
  },
  info: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewCount: {
    color: "#A0A0A0",
    fontSize: 12,
  },
  bookButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
});
