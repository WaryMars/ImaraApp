// ========================================
// BOOKING STORE - Gestion de l'état global des réservations
// ========================================
// Zustand est un state management léger et performant
// Alternative plus simple que Redux pour React Native
// ========================================

import { create } from "zustand";
import { Booking } from "@/types/booking.types";

interface BookingStore {
  // ========== STATE ==========
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;

  // ========== ACTIONS ==========
  // Ajouter une réservation
  addBooking: (booking: Booking) => void;

  // Récupérer toutes les réservations du client
  setBookings: (bookings: Booking[]) => void;

  // Sélectionner une réservation
  selectBooking: (booking: Booking) => void;

  // Mettre à jour une réservation
  updateBooking: (id: string, updates: Partial<Booking>) => void;

  // Supprimer une réservation
  deleteBooking: (id: string) => void;

  // Annuler une réservation
  cancelBooking: (id: string, reason: string) => void;

  // Gérer le loading
  setLoading: (loading: boolean) => void;

  // Gérer les erreurs
  setError: (error: string | null) => void;

  // Réinitialiser le store
  reset: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,

  // Ajouter une réservation au store
  addBooking: (booking: Booking) =>
    set((state) => ({
      bookings: [booking, ...state.bookings],
      selectedBooking: booking,
    })),

  // Charger toutes les réservations
  setBookings: (bookings: Booking[]) =>
    set({
      bookings: bookings.sort(
        (a, b) =>
          new Date(b.createdAt as any).getTime() -
          new Date(a.createdAt as any).getTime()
      ),
    }),

  // Sélectionner une réservation pour l'afficher
  selectBooking: (booking: Booking) => set({ selectedBooking: booking }),

  // Mettre à jour une réservation existante
  updateBooking: (id: string, updates: Partial<Booking>) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
      selectedBooking:
        state.selectedBooking?.id === id
          ? { ...state.selectedBooking, ...updates }
          : state.selectedBooking,
    })),

  // Supprimer une réservation du store
  deleteBooking: (id: string) =>
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== id),
      selectedBooking:
        state.selectedBooking?.id === id ? null : state.selectedBooking,
    })),

  // Annuler une réservation (change le status à 'cancelled')
  cancelBooking: (id: string, reason: string) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id
          ? {
              ...b,
              status: "cancelled" as const,
              cancellationReason: reason,
              cancelledBy: "client",
            }
          : b
      ),
    })),

  // Mettre le store en mode chargement
  setLoading: (loading: boolean) => set({ loading }),

  // Définir une erreur
  setError: (error: string | null) => set({ error }),

  // Réinitialiser complètement le store
  reset: () =>
    set({
      bookings: [],
      selectedBooking: null,
      loading: false,
      error: null,
    }),
}));
