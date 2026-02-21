// ========================================
// USE BOOKING - Hook principal pour les RDV
// ========================================
// Encapsule la logique métier des réservations
// Combine le store Zustand + les services Firebase
// ========================================

import { useState, useCallback, useEffect } from "react";
import { useBookingStore } from "@/store/booking.store";
import * as BookingService from "@/services/booking.service";
import * as NotificationService from "@/services/notification.service";
import { Booking } from "@/types/booking.types";

interface UseBookingReturn {
  // State
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadClientBookings: (clientId: string, status?: string) => Promise<void>;
  loadBusinessBookings: (businessId: string) => Promise<void>;
  createNewBooking: (
    booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ) => Promise<string>;
  confirmBooking: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string, reason: string) => Promise<void>;
  selectBooking: (booking: Booking | null) => void;
  checkSlotAvailability: (
    businessId: string,
    date: string,
    startTime: string,
    duration: number
  ) => Promise<boolean>;
}

export function useBooking(): UseBookingReturn {
  // Récupérer le store Zustand
const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const {
    bookings,
    loading,
    error,
    setBookings,
    addBooking,
    updateBooking,
    setLoading,
    setError,
  } = useBookingStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // ========== LOAD BOOKINGS ==========
  /**
   * Charge toutes les réservations d'un client depuis Firebase
   * Met à jour le store automatiquement
   */
  const loadClientBookings = useCallback(
    async (clientId: string, status?: string) => {
      try {
        setLoading(true);
        setError(null);

        const fetchedBookings = await BookingService.getClientBookings(
          clientId,
          status
        );
        setBookings(fetchedBookings);
        setIsInitialized(true);

        console.log("✅ Réservations client chargées:", fetchedBookings.length);
      } catch (err: any) {
        const errorMsg =
          err.message || "Erreur lors du chargement des réservations";
        setError(errorMsg);
        console.error("❌", errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [setBookings, setLoading, setError]
  );

  /**
   * Charge toutes les réservations d'un business depuis Firebase
   */
  const loadBusinessBookings = useCallback(
    async (businessId: string) => {
      try {
        setLoading(true);
        setError(null);

        const fetchedBookings = await BookingService.getBusinessBookings(
          businessId
        );
        setBookings(fetchedBookings);
        setIsInitialized(true);

        console.log(
          "✅ Réservations business chargées:",
          fetchedBookings.length
        );
      } catch (err: any) {
        const errorMsg =
          err.message || "Erreur chargement réservations business";
        setError(errorMsg);
        console.error("❌", errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [setBookings, setLoading, setError]
  );

  // ========== CREATE BOOKING ==========
  /**
   * Crée une nouvelle réservation
   * 1. Vérifie la disponibilité
   * 2. Crée dans Firebase
   * 3. Met à jour le store
   * 4. Envoie une confirmation
   */
  const createNewBooking = useCallback(
    async (
      booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
    ): Promise<string> => {
      try {
        setLoading(true);
        setError(null);

        // 1. Vérifier la disponibilité
        const isAvailable = await BookingService.isSlotAvailable(
          booking.businessId,
          booking.date as any,
          booking.startTime,
          booking.duration
        );

        if (!isAvailable) {
          throw new Error("Ce créneau n'est pas disponible");
        }

        // 2. Créer dans Firebase
        const bookingId = await BookingService.createBooking(booking);

        // 3. Ajouter au store
        const newBooking: Booking = {
          id: bookingId,
          ...booking,
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
        };
        addBooking(newBooking);

        // 4. Envoyer confirmation (mock)
        // await NotificationService.sendConfirmationEmail(newBooking, clientEmail, businessName);

        console.log("✅ Réservation créée avec succès");
        return bookingId;
      } catch (err: any) {
        const errorMsg = err.message || "Erreur création réservation";
        setError(errorMsg);
        console.error("❌", errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addBooking, setLoading, setError]
  );

  // ========== CONFIRM BOOKING ==========
  /**
   * Confirme une réservation (change status à 'confirmed')
   */
  const confirmBookingFn = useCallback(
    async (bookingId: string) => {
      try {
        setLoading(true);
        setError(null);

        await BookingService.confirmBooking(bookingId);
        updateBooking(bookingId, { status: "confirmed" });

        console.log("✅ Réservation confirmée");
      } catch (err: any) {
        const errorMsg = err.message || "Erreur confirmation";
        setError(errorMsg);
        console.error("❌", errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateBooking, setLoading, setError]
  );

  // ========== CANCEL BOOKING ==========
  /**
   * Annule une réservation avec raison
   */
  const cancelBookingFn = useCallback(
    async (bookingId: string, reason: string) => {
      try {
        setLoading(true);
        setError(null);

        await BookingService.cancelBooking(bookingId, reason, "client");
        updateBooking(bookingId, {
          status: "cancelled",
          cancellationReason: reason,
          cancelledBy: "client",
        });

        console.log("✅ Réservation annulée");
      } catch (err: any) {
        const errorMsg = err.message || "Erreur annulation";
        setError(errorMsg);
        console.error("❌", errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateBooking, setLoading, setError]
  );

  // ========== CHECK SLOT AVAILABILITY ==========
  /**
   * Vérifie si un créneau est disponible sans créer de réservation
   */
  const checkSlotAvailability = useCallback(
    async (
      businessId: string,
      date: string,
      startTime: string,
      duration: number
    ): Promise<boolean> => {
      try {
        const available = await BookingService.isSlotAvailable(
          businessId,
          date,
          startTime,
          duration
        );
        return available;
      } catch (err) {
        console.error("❌ Erreur vérification disponibilité:", err);
        return false;
      }
    },
    []
  );

  return {
    // State
    bookings,
    selectedBooking,
    loading,
    error,

    // Actions
    loadClientBookings,
    loadBusinessBookings,
    createNewBooking,
    confirmBooking: confirmBookingFn,
    cancelBooking: cancelBookingFn,
    selectBooking: (booking: Booking | null) => setSelectedBooking(booking),
    checkSlotAvailability,
  };
}
