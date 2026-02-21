// ========================================
// NOTIFICATION SERVICE - Expo Notifications
// ========================================
// Gère les notifications locales pour l'app
// - Notification immédiate après réservation
// - Rappel 24h avant la réservation
// - Enregistrement du token Expo
// ========================================

import * as Notifications from "expo-notifications";
import { Booking } from "@/types/booking.types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

// ========== CONFIG ==========
/**
 * Configure le comportement des notifications
 * Quand l'app est au premier plan
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ========== REGISTER PUSH NOTIFICATIONS ==========
/**
 * Enregistre l'appareil pour les notifications push
 * Demande les permissions et retourne le token Expo
 * @returns Promise<string | null> - Token Expo ou null
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    console.log("🔔 [NOTIF] Enregistrement pour les push notifications...");

    // 1. Demander les permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    // Si pas accordé, demander
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("⚠️  [NOTIF] Permission refusée pour les notifications");
      return null;
    }

    // 2. Récupérer le token Expo
    const token = (await Notifications.getExpoPushTokenAsync()).data;

    console.log("✅ [NOTIF] Token Expo obtenu:", token);
    return token;
  } catch (error) {
    console.error("❌ [NOTIF] Erreur enregistrement:", error);
    return null;
  }
}

// ========== SAVE TOKEN TO FIREBASE ==========
/**
 * Sauvegarde le token Expo dans Firestore (champ user)
 * @param userId - ID du user
 * @param token - Token Expo
 */
export async function saveExpoPushToken(
  userId: string,
  token: string
): Promise<void> {
  try {
    console.log("💾 [NOTIF] Sauvegarde du token Expo pour:", userId);

    await updateDoc(doc(db, "users", userId), {
      expoPushToken: token,
    });

    console.log("✅ [NOTIF] Token sauvegardé");
  } catch (error) {
    console.error("❌ [NOTIF] Erreur sauvegarde token:", error);
    throw error;
  }
}

// ========== SEND LOCAL NOTIFICATION ==========
/**
 * Envoie une notification locale IMMÉDIATE
 * Utilisée après création de réservation
 * @param title - Titre de la notif
 * @param body - Corps du message
 * @param data - Données supplémentaires (bookingId, etc.)
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    console.log("📲 [NOTIF] Envoi notification locale:", title);

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: "default",
        badge: 1,
        data: data || {},
      },
      trigger: null, // Immédiate
    });

    console.log("✅ [NOTIF] Notification envoyée");
  } catch (error) {
    console.error("❌ [NOTIF] Erreur envoi notif:", error);
  }
}

// ========== SEND BOOKING CONFIRMATION ==========
/**
 * Envoie la notification de confirmation de réservation
 * Appelée après createBooking()
 * @param bookingId - ID de la réservation
 * @param date - Date du booking
 * @param startTime - Heure de début
 */
export async function sendBookingConfirmation(
  bookingId: string,
  date: Date,
  startTime: string
): Promise<void> {
  try {
    const dateStr = new Date(date).toLocaleDateString("fr-FR");

    const title = "✅ Réservation confirmée!";
    const body = `RDV le ${dateStr} à ${startTime}`;

    await sendLocalNotification(title, body, {
      bookingId,
      type: "booking_confirmation",
    });

    console.log("✅ [NOTIF] Confirmation envoyée pour:", bookingId);
  } catch (error) {
    console.error("❌ [NOTIF] Erreur confirmation:", error);
  }
}

// ========== SCHEDULE BOOKING REMINDER ==========
/**
 * Programme une notification 24h AVANT la réservation
 * Rappel pour le client
 * @param bookingId - ID de la réservation
 * @param date - Date du booking
 * @param startTime - Heure de début
 */
export async function scheduleBookingReminder(
  bookingId: string,
  date: Date,
  startTime: string
): Promise<void> {
  try {
    const bookingDate = new Date(date);
    const reminderDate = new Date(bookingDate.getTime() - 24 * 60 * 60 * 1000); // -24h

    // Si la date est dans le passé, ne pas programmer
    if (reminderDate < new Date()) {
      console.warn("⚠️  [NOTIF] Date de rappel dans le passé, non programmée");
      return;
    }

    console.log("📅 [NOTIF] Programmation rappel pour:", reminderDate);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Rappel: Votre RDV approche!",
        body: `Demain à ${startTime}`,
        sound: "default",
        badge: 1,
        data: {
          bookingId,
          type: "booking_reminder",
        },
      },
      trigger: {
        type: "date",
        date: reminderDate,
      } as any,
    });

    console.log("✅ [NOTIF] Rappel programmé:", notificationId);
  } catch (error) {
    console.error("❌ [NOTIF] Erreur programmation rappel:", error);
  }
}

// ========== CANCEL NOTIFICATION ==========
/**
 * Annule une notification programmée
 * Utilisée si booking annulée
 * @param notificationId - ID de la notif
 */
export async function cancelNotification(
  notificationId: string
): Promise<void> {
  try {
    console.log("❌ [NOTIF] Annulation notification:", notificationId);

    await Notifications.cancelScheduledNotificationAsync(notificationId);

    console.log("✅ [NOTIF] Notification annulée");
  } catch (error) {
    console.error("❌ [NOTIF] Erreur annulation notification:", error);
  }
}

// ========== LISTEN TO NOTIFICATION RESPONSES ==========
/**
 * Écoute les clics sur les notifications
 * Navigue vers la page appropriée
 * À appeler dans App.tsx ou layout root
 */
export function setupNotificationListeners(): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log(
        "📬 [NOTIF] Notification tapée:",
        response.notification.request.content.data
      );

      const data = response.notification.request.content.data;

      // Navigation selon le type
      if (data.type === "booking_confirmation") {
        console.log("→ Naviguer vers réservations");
        // router.push('(tabs)/bookings')
      } else if (data.type === "booking_reminder") {
        console.log("→ Naviguer vers détail réservation");
        // router.push(`(tabs)/bookings/${data.bookingId}`)
      }
    }
  );

  return () => {
    subscription.remove();
  };
}

// ========== HELPERS ==========
/**
 * Envoie une notif de test
 * Pour vérifier que tout marche
 */
export async function sendTestNotification(): Promise<void> {
  try {
    console.log("🧪 [NOTIF] Envoi notif TEST");

    await sendLocalNotification(
      "🧪 Test Notification",
      "Ceci est une notification de test",
      {
        type: "test",
      }
    );

    console.log("✅ [NOTIF] Test envoyé");
  } catch (error) {
    console.error("❌ [NOTIF] Erreur test:", error);
  }
}

/**
 * Nettoie TOUTES les notifications programmées
 * À utiliser avec prudence
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    console.log("🗑️  [NOTIF] Annulation de TOUTES les notifs");

    await Notifications.cancelAllScheduledNotificationsAsync();

    console.log("✅ [NOTIF] Toutes les notifs annulées");
  } catch (error) {
    console.error("❌ [NOTIF] Erreur annulation globale:", error);
  }
}
