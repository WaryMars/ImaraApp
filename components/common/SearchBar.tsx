import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Search, SlidersHorizontal } from "lucide-react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  showFilter?: boolean;
  style?: ViewStyle;
}

export function SearchBar({
  onFilterPress,
  showFilter = true,
  style,
  value,
  onChangeText,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search..."
          placeholderTextColor="#6B7280"
          value={value}
          onChangeText={onChangeText}
        />
      </View>

      {showFilter && (
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
          <SlidersHorizontal size={20} color="#aaaa" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // ← Retour à flexDirection row
    alignItems: "center",
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 35,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  filterButton: {
    backgroundColor: "#ffff",
    width: 48,
    height: 48,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
});
