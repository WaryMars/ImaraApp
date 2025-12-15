import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { X } from "lucide-react-native";

export interface FilterChip {
  id: string;
  label: string;
  value: string;
  emoji?: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selectedChips: string[];
  onChipPress: (chipId: string) => void;
  onRemoveChip?: (chipId: string) => void;
  showRemoveButton?: boolean;
}

export function FilterChips({
  chips,
  selectedChips,
  onChipPress,
  onRemoveChip,
  showRemoveButton = false,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map((chip) => {
        const isSelected = selectedChips.includes(chip.id);

        return (
          <TouchableOpacity
            key={chip.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onChipPress(chip.id)}
          >
            <Text
              style={[styles.chipText, isSelected && styles.chipTextSelected]}
            >
              {chip.label}
            </Text>

            {isSelected && showRemoveButton && onRemoveChip && (
              <TouchableOpacity
                onPress={() => onRemoveChip(chip.id)}
                style={styles.removeButton}
              >
                <X size={12} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20, // ← Forme ovale
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chipSelected: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  removeButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
});
