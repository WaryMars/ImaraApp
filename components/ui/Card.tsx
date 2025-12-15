import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface TextCardProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardHeader({ children, style }: CardProps) {
  return <View style={[styles.cardHeader, style]}>{children}</View>;
}

export function CardTitle({ children, style }: TextCardProps) {
  return <Text style={[styles.cardTitle, style]}>{children}</Text>;
}

export function CardDescription({ children, style }: TextCardProps) {
  return <Text style={[styles.cardDescription, style]}>{children}</Text>;
}

export function CardAction({ children, style }: CardProps) {
  return <View style={[styles.cardAction, style]}>{children}</View>;
}

export function CardContent({ children, style }: CardProps) {
  return <View style={[styles.cardContent, style]}>{children}</View>;
}

export function CardFooter({ children, style }: CardProps) {
  return <View style={[styles.cardFooter, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#2A2A2A", // ← Fond gris foncé
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)", // ← Bordure gris transparent
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF", // ← Texte blanc
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#A0A0A0", // ← Gris clair
  },
  cardAction: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  cardContent: {
    marginBottom: 24,
  },
  cardFooter: {
    gap: 12,
  },
});
