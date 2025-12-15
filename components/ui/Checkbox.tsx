import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  children?: React.ReactNode;
}

export function Checkbox({ checked, onPress, label, children }: CheckboxProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : (
        <View style={styles.labelContainer}>{children}</View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "#2F2F2F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  checkmark: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: "#A0A0A0",
    lineHeight: 20,
  },
  labelContainer: {
    flex: 1,
  },
});
