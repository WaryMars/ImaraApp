import React, { createContext, useState, useEffect, useContext } from "react";
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { router } from "expo-router";
import { auth, db } from "@/config/firebase";
import { User, UserType, UserMode } from "@/types/user.types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isGuest: boolean;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>; // ← AJOUTE CETTE LIGNE
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
          setUser(userData);
          setIsGuest(false);

          // Redirection selon le type d'utilisateur
          if (userData.type === "professional") {
            router.replace("/(professional)/dashboard");
          } else {
            router.replace("/(tabs)");
          }
        }
        setFirebaseUser(firebaseUser);
      } else {
        // Si pas connecté et pas invité, rester sur login
        if (!isGuest) {
          setUser(null);
          setFirebaseUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isGuest]);

  // ← AJOUTE CETTE FONCTION (pour recharger les données utilisateur après modification)
  const refreshUser = async () => {
    if (!firebaseUser) return;
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
        setUser(userData);
      }
    } catch (error) {
      console.error("Erreur lors du refresh utilisateur:", error);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { uid } = userCredential.user;

      const newUser: User = {
        id: uid,
        email,
        type: userData.type || "client",
        mode: "authenticated",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phoneNumber: userData.phoneNumber || "",
        profilePicture: null,
        gdprConsent: userData.gdprConsent!,
        dataProcessingConsent: userData.dataProcessingConsent!,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        ...(userData.type === "client" && {
          favoriteBusinesses: [],
          preferences: {
            notifications: true,
            searchRadius: 10,
          },
        }),
      };

      await setDoc(doc(db, "users", uid), newUser);
      setUser(newUser);
      setIsGuest(false);
    } catch (error) {
      console.error("Erreur inscription:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsGuest(false);
    } catch (error) {
      console.error("Erreur connexion:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      setIsGuest(false);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      throw error;
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser({
      id: "guest",
      email: "",
      type: "client",
      mode: "guest",
      firstName: "Invité",
      lastName: "",
      phoneNumber: "",
      profilePicture: null,
      gdprConsent: {
        marketing: false,
        analytics: false,
        consentDate: Timestamp.now(),
      },
      dataProcessingConsent: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      favoriteBusinesses: [],
      preferences: {
        notifications: false,
        searchRadius: 10,
      },
    });
    router.replace("/(tabs)");
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Erreur réinitialisation:", error);
      throw error;
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    isGuest,
    signUp,
    signIn,
    signOut,
    continueAsGuest,
    resetPassword,
    refreshUser, // ← AJOUTE CETTE LIGNE
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
