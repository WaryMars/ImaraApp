import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

// Empêcher le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

// Composant de navigation protégée
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Rediriger vers login si pas connecté et pas sur une page d'auth
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Rediriger vers la bonne page selon le type d'utilisateur
      if (user.type === "professional") {
        router.replace("/(professional)/dashboard");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [user, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(professional)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Ajouter vos fonts personnalisées ici si nécessaire
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
