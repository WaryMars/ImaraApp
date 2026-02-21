// ========================================
// REVIEW TYPES - Avis et notes
// ========================================

import { Timestamp } from "firebase/firestore";

/**
 * Avis laissé par un client après un RDV
 */
export interface Review {
  id: string;
  bookingId: string; // Référence au RDV
  clientId: string; // Qui a laissé l'avis
  businessId: string; // Quel business
  rating: number; // 1-5 étoiles
  comment?: string; // Texte de l'avis
  photos?: string[]; // URLs des photos (avant/après)
  helpful: number; // Nombre de "utile"
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isVerified: boolean; // L'avis a été laissé par un vrai client
}

/**
 * Résumé des avis d'un business
 */
export interface ReviewSummary {
  businessId: string;
  averageRating: number; // Moyenne 1-5
  totalReviews: number;
  ratingBreakdown: {
    // Nb d'avis par note
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
  };
  recentReviews: Review[]; // Les 5 derniers avis
  updatedAt: Timestamp;
}
