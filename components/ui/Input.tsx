import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  style?: any;
}

export function Input({ style, ...props }: InputProps) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor="#6B7280" // Gris moyen pour placeholder
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)", // ← Bordure gris transparent
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#2F2F2F", // ← Fond gris très foncé
    color: "#FFFFFF", // ← Texte blanc
  },
});
