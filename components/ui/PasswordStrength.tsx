import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface PasswordStrengthProps {
  password: string;
}

export interface PasswordStrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
}

export function calculatePasswordStrength(
  password: string
): PasswordStrengthResult {
  let score = 0;

  if (!password) return { score: 0, label: "", color: "#6B7280" };

  // Critères de force
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++; // Minuscules et majuscules
  if (/\d/.test(password)) score++; // Chiffres
  if (/[^A-Za-z0-9]/.test(password)) score++; // Caractères spéciaux

  // Normaliser le score sur 4
  score = Math.min(4, score);

  const strength: { [key: number]: { label: string; color: string } } = {
    0: { label: "", color: "#6B7280" },
    1: { label: "Très faible", color: "#EF4444" },
    2: { label: "Faible", color: "#F59E0B" },
    3: { label: "Moyen", color: "#EAB308" },
    4: { label: "Fort", color: "#10B981" },
  };

  return { score, ...strength[score] };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {[1, 2, 3, 4].map((index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor:
                  index <= strength.score ? strength.color : "#2F2F2F",
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: strength.color }]}>
        {strength.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 6,
  },
  barsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
});
