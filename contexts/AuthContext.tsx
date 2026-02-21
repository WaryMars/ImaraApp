import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { User, UserType, UserPreferences } from "@/types/user.types";
import {
  registerForPushNotifications,
  saveExpoPushToken,
} from "@/services/notification.service";

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ✅ CRÉER LE CONTEXTE
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ PROVIDER
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
            setIsGuest(false);
          }
        } catch (error) {
          console.error("❌ Erreur récupération utilisateur:", error);
        }
      } else {
        setUser(null);
        setIsGuest(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

      // ✅ PREFERENCES SIMPLIFIÉ
      const preferences: UserPreferences = {
        notifications: userData.type === "client",
        searchRadius: 10,
      };

      const newUser: User = {
        id: uid,
        email,
        type: userData.type || "client",
        mode: "authenticated",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phoneNumber: userData.phoneNumber || "",
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
        ...(userData.type === "client" && {
          favoriteBusinesses: [],
          preferences,
        }),
      };

      await setDoc(doc(db, "users", uid), newUser);
      const token = await registerForPushNotifications();
      if (token) {
        await saveExpoPushToken(uid, token);
      }
      setUser(newUser);
      setIsGuest(false);
    } catch (error) {
      console.error("❌ Erreur inscription:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { uid } = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", uid));
      const token = await registerForPushNotifications();
      if (token) {
        await saveExpoPushToken(uid, token);
      }
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
        setIsGuest(false);
      }
    } catch (error) {
      console.error("❌ Erreur connexion:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsGuest(true);
    } catch (error) {
      console.error("❌ Erreur déconnexion:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isGuest, loading, signUp, signIn, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ EXPORTE LE CONTEXTE
export { AuthContext };

// ✅ EXPORT LE HOOK
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
