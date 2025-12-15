import { Timestamp } from "firebase/firestore";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no-show";
export type CancelledBy = "client" | "professional" | null;
export interface Booking {
  id: string;
  clientId: string;
  businessId: string;
  serviceId: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  duration: number;
  status: BookingStatus;
  notes: string | null;
  price: number;
  cancelledBy: CancelledBy;
  cancellationReason: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt: Timestamp | null;
  // Ajouter à l'interface Booking :
  totalPrice: number; // Prix total du service
  depositRequired: boolean; // Y a-t-il un acompte ?
  depositPercentage: number; // 30, 50, 100 ou 0
  depositAmount: number; // Montant de l'acompte
  paymentStatus: "pending" | "deposit_paid" | "completed" | "refunded";
  depositPaidAt: Timestamp | null;
  completedPaymentAt: Timestamp | null;
}
