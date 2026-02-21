import { Timestamp } from "firebase/firestore";

export type UserType = "client" | "professional";
export type UserMode = "authenticated" | "guest";

export interface GDPRConsent {
  marketing: boolean;
  analytics: boolean;
  consentDate: Timestamp;
}

// ✅ AJOUTE CETTE INTERFACE
export interface UserPreferences {
  notifications: boolean;
  searchRadius: number;
}

export interface User {
  id: string;
  email: string;
  type: UserType;
  mode: UserMode;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture: string | null;
  gdprConsent: GDPRConsent;
  dataProcessingConsent: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;

  // Client uniquement
  favoriteBusinesses?: string[];
  preferences?: UserPreferences; // ✅ Simplifié

  // Pro uniquement
  businessId?: string;
}
