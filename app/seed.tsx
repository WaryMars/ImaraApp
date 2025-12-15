import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { seedProfessionals } from "@/scripts/seedProfessionals";
import { router } from "expo-router";

export default function SeedScreen() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeed = async () => {
    setLoading(true);
    setMessage("");

    try {
      const result = await seedProfessionals();
      setMessage(`✅ ${result.count} professionnels créés avec succès !`);
    } catch (error) {
      setMessage(`❌ Erreur : ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seed Database</Text>
      <Text style={styles.subtitle}>Créer 20 professionnels fictifs</Text>

      {message ? (
        <Text style={[styles.message, message.includes("❌") && styles.error]}>
          {message}
        </Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSeed}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.buttonText}>Créer 20 Professionnels</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0F0F",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#10B981",
    marginBottom: 24,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  error: {
    color: "#EF4444",
  },
  button: {
    backgroundColor: "#14B8A6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 250,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 24,
  },
  backButtonText: {
    color: "#6B7280",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
