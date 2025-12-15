import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // Navigation directe vers les tabs en mode invité
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Imara</Text>
            <Text style={styles.tagline}>Trouvez vos professionnels</Text>
          </View>

          {/* Card */}
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account.
              </CardDescription>
              {/* <CardAction>
                <Button
                  variant="link"
                  onPress={() => router.push("/(auth)/signup")}
                >
                  Sign Up
                </Button>
              </CardAction> */}
            </CardHeader>

            <CardContent>
              <View style={styles.formGroup}>
                {/* Email Field */}
                <View style={styles.field}>
                  <Label>Email</Label>
                  <Input
                    placeholder="m@example.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>

                {/* Password Field */}
                <View style={styles.field}>
                  <View style={styles.passwordHeader}>
                    <Label>Password</Label>
                    <TouchableOpacity
                      onPress={() => router.push("/(auth)/forgot-password")}
                    >
                      <Text style={styles.forgotPassword}>
                        Forgot your password?
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Input
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                  />
                </View>
              </View>
            </CardContent>

            <CardFooter>
              <Button
                onPress={handleLogin}
                disabled={loading}
                loading={loading}
                style={styles.fullWidth}
              >
                {loading ? "Loading..." : "Login"}
              </Button>

              <Button
                variant="outline"
                style={styles.fullWidth}
                onPress={() => Alert.alert("Info", "Connexion Google à venir")}
              >
                Login with Google
              </Button>

              {/* Bouton Invité */}
              <TouchableOpacity
                onPress={handleGuestLogin}
                style={styles.guestButton}
              >
                <Text style={styles.guestButtonText}>
                  Continuer en tant qu&apos;invité
                </Text>
              </TouchableOpacity>
              <Button
                variant="link"
                onPress={() => router.push("/(auth)/signup")}
              >
                Sign Up
              </Button>
            </CardFooter>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#A0A0A0",
  },
  formGroup: {
    gap: 24,
  },
  field: {
    gap: 8,
  },
  passwordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  forgotPassword: {
    fontSize: 14,
    color: "#FFFFFF",
    textDecorationLine: "underline",
  },
  fullWidth: {
    width: "100%",
  },
  guestButton: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  guestButtonText: {
    fontSize: 14,
    color: "#6B7280",
    textDecorationLine: "underline",
  },
});

// admin1234@test.com
// @zertY1234
