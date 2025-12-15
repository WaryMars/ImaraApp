import { Timestamp } from "firebase/firestore";

export type UserType = "client" | "professional";
export type UserMode = "authenticated" | "guest"; // Nouveau

export interface GDPRConsent {
  marketing: boolean;
  analytics: boolean;
  consentDate: Timestamp;
}

export interface NotificationPreferences {
  bookingReminders: boolean; // Rappel avant RDV
  promotions: boolean; // Promos & offres spéciales
  newServices: boolean; // Nouveaux services
  reviews: boolean; // Avis publié
}

export interface User {
  id: string;
  email: string;
  type: UserType;
  mode: UserMode; // Nouveau : 'authenticated' ou 'guest'
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
  preferences?: {
    notifications?: NotificationPreferences;
    searchRadius: number;
  };
  // Pro uniquement
  businessId?: string;
}
