import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { FilterChip } from "./FilterChips";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.7; // 70% de la hauteur

interface FilterDrawerProps {
  visible: boolean;
  onClose: () => void;
  chips: FilterChip[];
  selectedChips: string[];
  onChipPress: (chipId: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export function FilterDrawer({
  visible,
  onClose,
  chips,
  selectedChips,
  onChipPress,
  onApply,
  onReset,
}: FilterDrawerProps) {
  const translateY = useSharedValue(DRAWER_HEIGHT);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      translateY.value = withTiming(DRAWER_HEIGHT, { duration: 300 });
    }
  }, [visible]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Bottom Sheet */}
      <Animated.View style={[styles.drawer, drawerStyle]}>
        <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
          {/* Handle Indicator */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Categories from props */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Catégories</Text>
              <View style={styles.chipsGrid}>
                {chips.map((chip) => {
                  const isSelected = selectedChips.includes(chip.id);

                  return (
                    <TouchableOpacity
                      key={chip.id}
                      style={[
                        styles.filterPill,
                        isSelected && styles.filterPillSelected,
                      ]}
                      onPress={() => onChipPress(chip.id)}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          isSelected && styles.filterPillTextSelected,
                        ]}
                      >
                        {chip.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={onReset}>
              <Text style={styles.clearButtonText}>Clear filters</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.showButton}
              onPress={() => {
                onApply();
                onClose();
              }}
            >
              <Text style={styles.showButtonText}>Show results</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
  drawer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: DRAWER_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 1000,
  },
  safeArea: {
    flex: 1,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  filterPill: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  filterPillSelected: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  filterPillTextSelected: {
    color: "#FFFFFF",
  },
  viewMore: {
    fontSize: 14,
    color: "#6366F1",
    marginTop: 12,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  showButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#000000",
    alignItems: "center",
  },
  showButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
