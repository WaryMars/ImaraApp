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
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { Checkbox } from "@/components/ui/Checkbox";
import { Timestamp } from "firebase/firestore";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userType, setUserType] = useState<"client" | "professional">("client");
  const [loading, setLoading] = useState(false);

  // GDPR Checkboxes
  const [gdprDataProcessing, setGdprDataProcessing] = useState(false);
  const [gdprMarketing, setGdprMarketing] = useState(false);
  const [gdprAnalytics, setGdprAnalytics] = useState(false);

  const { signUp } = useAuth();

  const handleSignUp = async () => {
    // Validation
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit contenir au moins 8 caractères"
      );
      return;
    }

    if (!gdprDataProcessing) {
      Alert.alert(
        "Consentement requis",
        "Vous devez accepter le traitement de vos données pour créer un compte"
      );
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, {
        type: userType,
        firstName,
        lastName,
        phoneNumber,
        gdprConsent: {
          marketing: gdprMarketing,
          analytics: gdprAnalytics,
          consentDate: Timestamp.now(),
        },
        dataProcessingConsent: gdprDataProcessing,
      });

      Alert.alert("Succès", "Votre compte a été créé avec succès !", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Imara</Text>
            <Text style={styles.tagline}>Créez votre compte</Text>
          </View>

          {/* Card */}
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>
                Enter your information below to create your account
              </CardDescription>
            </CardHeader>

            <CardContent>
              <View style={styles.formGroup}>
                {/* User Type Selection */}
                <View style={styles.field}>
                  <Label>Type de compte</Label>
                  <View style={styles.typeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        userType === "client" && styles.typeButtonActive,
                      ]}
                      onPress={() => setUserType("client")}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          userType === "client" && styles.typeButtonTextActive,
                        ]}
                      >
                        Client
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        userType === "professional" && styles.typeButtonActive,
                      ]}
                      onPress={() => setUserType("professional")}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          userType === "professional" &&
                            styles.typeButtonTextActive,
                        ]}
                      >
                        Professionnel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* First Name & Last Name (Side by Side) */}
                <View style={styles.row}>
                  <View style={[styles.field, styles.halfField]}>
                    <Label>Prénom</Label>
                    <Input
                      placeholder="John"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={[styles.field, styles.halfField]}>
                    <Label>Nom</Label>
                    <Input
                      placeholder="Doe"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

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

                {/* Phone Number (Optional) */}
                <View style={styles.field}>
                  <Label>Téléphone (optionnel)</Label>
                  <Input
                    placeholder="+33 6 12 34 56 78"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                  />
                </View>

                {/* Password Field with Strength Indicator */}
                <View style={styles.field}>
                  <Label>Mot de passe</Label>
                  <Input
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                  />
                  <PasswordStrength password={password} />
                  <Text style={styles.helperText}>
                    Utilisez au moins 8 caractères avec majuscules, chiffres et
                    symboles
                  </Text>
                </View>

                {/* Confirm Password Field */}
                <View style={styles.field}>
                  <Label>Confirmer le mot de passe</Label>
                  <Input
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoComplete="password"
                  />
                </View>

                {/* GDPR Consents */}
                <View style={styles.gdprSection}>
                  <Text style={styles.gdprTitle}>Consentements RGPD</Text>

                  {/* Obligatoire */}
                  <Checkbox
                    checked={gdprDataProcessing}
                    onPress={() => setGdprDataProcessing(!gdprDataProcessing)}
                  >
                    <Text style={styles.checkboxLabel}>
                      <Text style={styles.required}>* </Text>
                      J&apos;accepte le traitement de mes données personnelles
                      conformément à la{" "}
                      <Text style={styles.link}>
                        Politique de confidentialité
                      </Text>
                    </Text>
                  </Checkbox>

                  {/* Optionnels */}
                  <Checkbox
                    checked={gdprMarketing}
                    onPress={() => setGdprMarketing(!gdprMarketing)}
                  >
                    <Text style={styles.checkboxLabel}>
                      J&apos;accepte de recevoir des communications marketing
                    </Text>
                  </Checkbox>

                  <Checkbox
                    checked={gdprAnalytics}
                    onPress={() => setGdprAnalytics(!gdprAnalytics)}
                  >
                    <Text style={styles.checkboxLabel}>
                      J&apos;accepte l&apos;utilisation de mes données à des
                      fins analytiques
                    </Text>
                  </Checkbox>
                  {/* Dans app/(tabs)/profile.tsx ou settings */}
                  {/* <TouchableOpacity
                    onPress={() => router.push("/(auth)/gdpr-consent")}
                  >
                    <Text>Gérer mes consentements RGPD</Text>
                  </TouchableOpacity> */}
                </View>
              </View>
            </CardContent>

            <CardFooter>
              <Button
                onPress={handleSignUp}
                disabled={loading}
                loading={loading}
                style={styles.fullWidth}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <Button
                variant="outline"
                style={styles.fullWidth}
                onPress={() =>
                  Alert.alert("Info", "Inscription Google à venir")
                }
              >
                Sign up with Google
              </Button>
            </CardFooter>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Vous avez déjà un compte ?{" "}
              <Text
                style={styles.footerLink}
                onPress={() => router.push("/(auth)/login")}
              >
                Se connecter
              </Text>
            </Text>
          </View>
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
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
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
    gap: 20,
  },
  field: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "#2F2F2F",
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  typeButtonTextActive: {
    color: "#000000",
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  gdprSection: {
    gap: 16,
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  gdprTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#A0A0A0",
    lineHeight: 20,
  },
  required: {
    color: "#EF4444",
    fontWeight: "bold",
  },
  link: {
    color: "#FFFFFF",
    textDecorationLine: "underline",
  },
  fullWidth: {
    width: "100%",
  },
  footer: {
    marginTop: 24,
  },
  footerText: {
    textAlign: "center",
    color: "#A0A0A0",
    fontSize: 14,
  },
  footerLink: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
