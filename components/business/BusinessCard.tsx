import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Star, MapPin, Clock } from "lucide-react-native";
import { router } from "expo-router";

interface BusinessCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  distance: number;
}

export function BusinessCard({
  id,
  name,
  image,
  rating,
  reviewCount,
  isOpen,
  openTime,
  closeTime,
  distance,
}: BusinessCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/business/${id}` as any)}
    >
      <Image source={{ uri: image }} style={styles.image} />

      {/* Overlay gradient */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Top badges */}
        <View style={styles.topBadges}>
          <View style={styles.ratingBadge}>
            <Star size={12} color="#FFA500" fill="#FFA500" />
            <Text style={styles.rating}>{rating}</Text>
            <Text style={styles.reviewCount}>({reviewCount})</Text>
          </View>
        </View>

        {/* Bottom info */}
        <View style={styles.bottomInfo}>
          {isOpen && openTime && closeTime && (
            <View style={styles.statusBadge}>
              <Clock size={12} color="#10B981" />
              <Text style={styles.statusText}>
                OPEN NOW • {openTime} - {closeTime}
              </Text>
            </View>
          )}

          <Text style={styles.name}>{name}</Text>

          <View style={styles.distanceContainer}>
            <MapPin size={12} color="#A0A0A0" />
            <Text style={styles.distance}>{distance} km</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    height: 240,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  topBadges: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rating: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  reviewCount: {
    color: "#A0A0A0",
    fontSize: 10,
  },
  bottomInfo: {
    gap: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  statusText: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "600",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distance: {
    color: "#A0A0A0",
    fontSize: 12,
  },
  bookButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  bookButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
});
