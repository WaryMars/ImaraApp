// ========================================
// BOOKING SCREEN - Liste de mes réservations
// ========================================
// Page client affichant tous ses RDV passés et futurs
// Statuts: pending, confirmed, completed, cancelled, no-show
// ========================================

import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronRight, Clock, MapPin, Calendar } from "lucide-react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/hooks/useBooking";
import { Booking, BookingStatus } from "@/types/booking.types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ========== COMPOSANT CARD ==========
interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
}

function BookingCard({ booking, onPress }: BookingCardProps) {
  // Déterminer la couleur selon le statut
  const statusColors: Record<BookingStatus, string> = {
    pending: "#FFA500", // Orange
    confirmed: "#14B8A6", // Teal
    completed: "#22C55E", // Green
    cancelled: "#EF4444", // Red
    "no-show": "#8B5CF6", // Purple
  };

  // Traduire les statuts
  const statusLabels: Record<BookingStatus, string> = {
    pending: "En attente",
    confirmed: "Confirmé",
    completed: "Complété",
    cancelled: "Annulé",
    "no-show": "Non présent",
  };

  const statusColor = statusColors[booking.status];
  const statusLabel = statusLabels[booking.status];

  // Parser la date
  const bookingDate =
    booking.date instanceof Date ? booking.date : new Date(booking.date as any);

  return (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Barre de couleur de statut */}
      <View style={[styles.statusBar, { backgroundColor: statusColor }]} />

      <View style={styles.cardContent}>
        {/* Haut: Date et Statut */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.bookingDate}>
              {format(bookingDate, "EEEE d MMMM", { locale: fr })}
            </Text>
            <View style={styles.timeRow}>
              <Clock size={14} color="#14B8A6" />
              <Text style={styles.bookingTime}>
                {booking.startTime} - {booking.endTime}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* Prix */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{booking.price.toFixed(2)}€</Text>
          <ChevronRight size={20} color="#6B7280" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ========== MAIN SCREEN ==========
export default function BookingsScreen() {
  const { user } = useAuth();
  const { bookings, loading, error, loadClientBookings, selectBooking } =
    useBooking();

  // Charger les RDV au montage
  useEffect(() => {
    if (user?.id && user.type === "client") {
      loadClientBookings(user.id);
    }
  }, [user?.id]);

  // Séparer les RDV à venir et passés
  const { upcomingBookings, pastBookings } = useMemo(() => {
    const now = new Date();
    const upcoming = bookings.filter((b) => {
      const bookingDate =
        b.date instanceof Date ? b.date : new Date(b.date as any);
      return bookingDate >= now && b.status !== "cancelled";
    });
    const past = bookings.filter((b) => {
      const bookingDate =
        b.date instanceof Date ? b.date : new Date(b.date as any);
      return bookingDate < now || b.status === "cancelled";
    });

    return {
      upcomingBookings: upcoming.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date as any);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date as any);
        return dateA.getTime() - dateB.getTime();
      }),
      pastBookings: past.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date as any);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date as any);
        return dateB.getTime() - dateA.getTime();
      }),
    };
  }, [bookings]);

  // Gérer le clic sur une réservation
  const handleBookingPress = (booking: Booking) => {
    selectBooking(booking);
    router.push(`/booking/${booking.id}`);
  };

  if (loading && bookings.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (user?.id) loadClientBookings(user.id);
            }}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mes Réservations</Text>
          <Text style={styles.headerSubtitle}>
            {bookings.length} réservation{bookings.length > 1 ? "s" : ""}
          </Text>
        </View>

        {/* À VENIR */}
        {upcomingBookings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À venir</Text>
            <View style={styles.bookingsList}>
              {upcomingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onPress={() => handleBookingPress(booking)}
                />
              ))}
            </View>
          </View>
        )}

        {/* PASSÉS */}
        {pastBookings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique</Text>
            <View style={styles.bookingsList}>
              {pastBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onPress={() => handleBookingPress(booking)}
                />
              ))}
            </View>
          </View>
        )}

        {/* VIDE */}
        {bookings.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Aucune réservation</Text>
            <Text style={styles.emptySubtitle}>
              Trouvez un professionnel et réservez dès maintenant
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={styles.emptyButtonText}>Explorer</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 24,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#14B8A6",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  bookingsList: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statusBar: {
    height: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bookingDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bookingTime: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#14B8A6",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: "#14B8A6",
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
