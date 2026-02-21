// ========================================
// CONFIG - Constantes globales de l'app
// ========================================

export const APP_CONFIG = {
  // Durées par défaut
  BOOKING_REMINDER_24H: 24 * 60 * 60 * 1000, // 24h en ms
  BOOKING_REMINDER_2H: 2 * 60 * 60 * 1000, // 2h en ms

  // Paiement (Phase 2)
  PAYMENT_METHODS: ["card", "paypal", "apple_pay", "google_pay"] as const,
  DEPOSIT_PERCENTAGES: [0, 30, 50, 100] as const,

  // Rayon de recherche par défaut
  DEFAULT_SEARCH_RADIUS: 10, // km

  // Pagination
  ITEMS_PER_PAGE: 20,

  // Statuts de réservation
  BOOKING_STATUSES: [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "no-show",
  ] as const,

  // URLs (à mettre dans .env)
  FIREBASE_FUNCTIONS_URL: process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_URL || "",
} as const;

export const STATUS_LABELS = {
  pending: "En attente",
  confirmed: "Confirmé",
  completed: "Complété",
  cancelled: "Annulé",
  "no-show": "Non présent",
} as const;

export const STATUS_COLORS = {
  pending: "#FFA500",
  confirmed: "#14B8A6",
  completed: "#22C55E",
  cancelled: "#EF4444",
  "no-show": "#8B5CF6",
} as const;
