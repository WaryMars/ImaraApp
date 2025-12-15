import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "default" | "outline" | "link";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = "default",
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [
    styles.button,
    variant === "default" && styles.buttonDefault,
    variant === "outline" && styles.buttonOutline,
    variant === "link" && styles.buttonLink,
    (disabled || loading) && styles.buttonDisabled,
    style,
  ];

  const textStyleCombined = [
    styles.buttonText,
    variant === "default" && styles.textDefault,
    variant === "outline" && styles.textOutline,
    variant === "link" && styles.textLink,
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyle}
    >
      {loading ? (
        <ActivityIndicator color={variant === "default" ? "#000" : "#FFF"} />
      ) : (
        <Text style={textStyleCombined}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDefault: {
    backgroundColor: "#FFFFFF", // ← Bouton blanc
  },
  buttonOutline: {
    backgroundColor: "#2A2A2A", // ← Fond gris foncé
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)", // ← Bordure gris transparent
  },
  buttonLink: {
    backgroundColor: "transparent",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  textDefault: {
    color: "#000000", // ← Texte noir pour bouton blanc
  },
  textOutline: {
    color: "#FFFFFF", // ← Texte blanc pour bouton outline
  },
  textLink: {
    color: "#FFFFFF", // ← Texte blanc pour lien
    fontSize: 14,
  },
});
