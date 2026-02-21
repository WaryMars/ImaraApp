// ========================================
// BOOKING SERVICE - Logique métier RDV
// ========================================
// Gère toutes les opérations Firebase pour les réservations
// CREATE, READ, UPDATE, DELETE (CRUD)
// ========================================

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { Booking } from "@/types/booking.types";

// ========== CREATE ==========
/**
 * Crée une nouvelle réservation dans Firebase
 * @param booking - Objet booking à créer
 * @returns Promise<string> - ID de la réservation créée
 */
export async function createBooking(
  booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "bookings"), {
      ...booking,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: "pending", // Par défaut, en attente de confirmation
    });
    console.log("✅ Réservation créée:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Erreur création réservation:", error);
    throw error;
  }
}

// ========== READ ==========
/**
 * Récupère TOUTES les réservations d'un client
 * @param clientId - ID du client
 * @param status - (optionnel) Filtrer par statut
 * @returns Promise<Booking[]>
 */
export async function getClientBookings(
  clientId: string,
  status?: string
): Promise<Booking[]> {
  try {
    // Construire les contraintes de la requête
    const constraints: QueryConstraint[] = [
      where("clientId", "==", clientId),
      orderBy("date", "desc"),
    ];

    // Ajouter filtre optionnel par statut
    if (status) {
      constraints.push(where("status", "==", status));
    }

    const q = query(collection(db, "bookings"), ...constraints);
    const querySnapshot = await getDocs(q);

    const bookings: Booking[] = [];
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      } as Booking);
    });

    console.log(`📦 ${bookings.length} réservations chargées`);
    return bookings;
  } catch (error) {
    console.error("❌ Erreur fetch réservations:", error);
    throw error;
  }
}

/**
 * Récupère TOUTES les réservations d'un professionnel
 * @param businessId - ID du business
 * @returns Promise<Booking[]>
 */
export async function getBusinessBookings(
  businessId: string
): Promise<Booking[]> {
  try {
    const q = query(
      collection(db, "bookings"),
      where("businessId", "==", businessId),
      orderBy("date", "asc")
    );

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      } as Booking);
    });

    return bookings;
  } catch (error) {
    console.error("❌ Erreur fetch bookings pro:", error);
    throw error;
  }
}

/**
 * Récupère une réservation spécifique par ID
 * @param bookingId - ID de la réservation
 * @returns Promise<Booking | null>
 */
export async function getBookingById(
  bookingId: string
): Promise<Booking | null> {
  try {
    const docRef = doc(db, "bookings", bookingId);
    const docSnapshot = await getDocs(
      query(collection(db, "bookings"), where("id", "==", bookingId))
    );

    if (docSnapshot.empty) {
      return null;
    }

    const data = docSnapshot.docs[0].data();
    return {
      id: bookingId,
      ...data,
    } as Booking;
  } catch (error) {
    console.error("❌ Erreur fetch booking by ID:", error);
    throw error;
  }
}

// ========== UPDATE ==========
/**
 * Met à jour une réservation existante
 * @param bookingId - ID de la réservation
 * @param updates - Champs à mettre à jour
 */
export async function updateBooking(
  bookingId: string,
  updates: Partial<Booking>
): Promise<void> {
  try {
    const docRef = doc(db, "bookings", bookingId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    console.log("✅ Réservation mise à jour:", bookingId);
  } catch (error) {
    console.error("❌ Erreur update réservation:", error);
    throw error;
  }
}

/**
 * Annule une réservation avec raison
 * @param bookingId - ID de la réservation
 * @param reason - Raison de l'annulation
 * @param cancelledBy - Qui annule ('client' ou 'professional')
 */
export async function cancelBooking(
  bookingId: string,
  reason: string,
  cancelledBy: "client" | "professional"
): Promise<void> {
  try {
    await updateBooking(bookingId, {
      status: "cancelled" as const,
      cancellationReason: reason,
      cancelledBy,
    });
    console.log("✅ Réservation annulée");
  } catch (error) {
    console.error("❌ Erreur annulation:", error);
    throw error;
  }
}

/**
 * Confirme une réservation (change status à 'confirmed')
 * @param bookingId - ID de la réservation
 */
export async function confirmBooking(bookingId: string): Promise<void> {
  try {
    await updateBooking(bookingId, {
      status: "confirmed" as const,
    });
    console.log("✅ Réservation confirmée");
  } catch (error) {
    console.error("❌ Erreur confirmation:", error);
    throw error;
  }
}

// ========== DELETE ==========
/**
 * Supprime une réservation (rare, généralement annuler au lieu de supprimer)
 * @param bookingId - ID de la réservation
 */
export async function deleteBooking(bookingId: string): Promise<void> {
  try {
    const docRef = doc(db, "bookings", bookingId);
    await deleteDoc(docRef);
    console.log("✅ Réservation supprimée");
  } catch (error) {
    console.error("❌ Erreur suppression:", error);
    throw error;
  }
}

// ========== HELPERS ==========
/**
 * Vérifie si un créneau est disponible
 * @param businessId - ID du business
 * @param date - Date à vérifier (format YYYY-MM-DD)
 * @param startTime - Heure de début
 * @param duration - Durée en minutes
 * @returns Promise<boolean>
 */
export async function isSlotAvailable(
  businessId: string,
  date: string,
  startTime: string,
  duration: number
): Promise<boolean> {
  try {
    const bookings = await getBusinessBookings(businessId);

    // Filtrer les réservations de ce jour ET confirmées
    const dayBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.date as any).toISOString().split("T")[0];
      return bookingDate === date && b.status === "confirmed";
    });

    // Convertir les heures en minutes pour la comparaison
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + duration;

    // Vérifier s'il y a un conflit
    for (const booking of dayBookings) {
      const existingStart = timeToMinutes(booking.startTime);
      const existingEnd = timeToMinutes(booking.endTime);

      // Conflit si les plages se chevauchent
      if (startMinutes < existingEnd && endMinutes > existingStart) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Erreur vérification disponibilité:", error);
    return false;
  }
}

/**
 * Convertit une heure (HH:MM) en minutes
 * @param time - Format "HH:MM"
 * @returns Nombre de minutes
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
