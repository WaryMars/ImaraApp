import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
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
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Erreur", "Veuillez entrer votre adresse email");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
      Alert.alert(
        "Email envoyé",
        "Un lien de réinitialisation a été envoyé à votre adresse email.",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Imara</Text>
          <Text style={styles.tagline}>Réinitialisation du mot de passe</Text>
        </View>

        {/* Card */}
        <Card>
          <CardHeader>
            <CardTitle>Forgot your password?</CardTitle>
            <CardDescription>
              {emailSent
                ? "Vérifiez votre boîte email pour le lien de réinitialisation"
                : "Entrez votre email et nous vous enverrons un lien de réinitialisation"}
            </CardDescription>
          </CardHeader>

          {!emailSent && (
            <>
              <CardContent>
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
              </CardContent>

              <CardFooter>
                <Button
                  onPress={handleResetPassword}
                  disabled={loading}
                  loading={loading}
                  style={styles.fullWidth}
                >
                  {loading ? "Sending..." : "Send reset link"}
                </Button>

                <Button
                  variant="outline"
                  style={styles.fullWidth}
                  onPress={() => router.back()}
                >
                  Back to login
                </Button>
              </CardFooter>
            </>
          )}

          {emailSent && (
            <CardFooter>
              <Button
                variant="outline"
                style={styles.fullWidth}
                onPress={() => router.push("/(auth)/login")}
              >
                Back to login
              </Button>

              <Button
                variant="link"
                onPress={() => setEmailSent(false)}
                style={styles.fullWidth}
              >
                Send another link
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Le lien de réinitialisation expirera dans 1 heure.
          </Text>
          <Text style={styles.helpText}>
            Si vous ne recevez pas l&apos;email, vérifiez vos spams.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
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
  field: {
    gap: 8,
  },
  fullWidth: {
    width: "100%",
  },
  helpContainer: {
    marginTop: 24,
    gap: 8,
  },
  helpText: {
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
});
