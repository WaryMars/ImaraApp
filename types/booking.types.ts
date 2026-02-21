import { Timestamp } from "firebase/firestore";

/**
 * ✅ BOOKING INTERFACE COMPLÈTE
 */
export interface Booking {
  id: string;
  clientId: string;
  businessId: string;
  serviceId: string;

  // 📅 DATE & TIME
  date: Date | Timestamp;
  startTime: string;
  endTime: string;
  duration: number;

  // 🔖 STATUS & NOTES
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no-show";
  notes: string | null;

  // 💰 PRICING
  price: number;
  totalPrice: number;
  depositRequired: boolean;
  depositPercentage: number;
  depositAmount: number;

  // 💳 PAYMENT
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  depositPaidAt: Timestamp | null;
  completedPaymentAt: Timestamp | null;

  // ❌ CANCELLATION
  cancelledBy: "client" | "professional" | null;
  cancellationReason: string | null;

  // ⏰ TIMESTAMPS
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/**
 * ✅ INPUT TYPE POUR CRÉER UNE RÉSERVATION
 */
export type CreateBookingInput = Omit<
  Booking,
  "id" | "createdAt" | "updatedAt"
>;

export type BookingStatus = Booking["status"];
export type UpdateBookingInput = Partial<Booking>;
