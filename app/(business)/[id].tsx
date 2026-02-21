import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Share2,
  Heart,
  Instagram,
  ChevronRight,
  X,
  ChevronLeft,
  Check,
} from "lucide-react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Business } from "@/hooks/useBusinesses";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "react-native-calendars";
import { BlurView } from "expo-blur";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useBooking } from "@/hooks/useBooking";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import {
  sendBookingConfirmation,
  scheduleBookingReminder,
} from "@/services/notification.service";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MOCK_GALLERY = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800",
];

// ========================================
// FONCTION POUR GÉNÉRER LES CRÉNEAUX
// ========================================
function generateAvailableTimeSlots(
  date: string | null,
  business: Business | null
): string[] {
  if (!date || !business) return [];

  const selectedDate = new Date(date + "T00:00:00");
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();

  const [openHour, openMin] = business.openingHours.open.split(":").map(Number);
  const [closeHour, closeMin] = business.openingHours.close
    .split(":")
    .map(Number);

  const slots: string[] = [];
  let currentHour = openHour;
  let currentMin = openMin;

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMin < closeMin)
  ) {
    const slotEndMin = currentMin + 30;
    let slotEndHour = currentHour;
    if (slotEndMin >= 60) {
      slotEndHour += 1;
    }

    if (
      slotEndHour > closeHour ||
      (slotEndHour === closeHour && slotEndMin % 60 > closeMin)
    ) {
      break;
    }

    const timeStr = `${String(currentHour).padStart(2, "0")}:${String(
      currentMin
    ).padStart(2, "0")}`;

    if (isToday) {
      const slotTime = new Date(selectedDate);
      slotTime.setHours(currentHour, currentMin, 0, 0);
      if (slotTime > today) {
        slots.push(timeStr);
      }
    } else {
      slots.push(timeStr);
    }

    currentMin += 30;
    if (currentMin >= 60) {
      currentMin -= 60;
      currentHour += 1;
    }
  }

  return slots;
}

// ========================================
// COMPOSANT SNACKBAR
// ========================================
function ReservationSnackbar({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <View style={snackbarStyles.snackbar}>
      <Text style={snackbarStyles.snackbarText}>{message}</Text>
    </View>
  );
}

// ========================================
// COMPOSANT NOTIFICATION CARD
// ========================================
function ReservationCardNotification({
  visible,
  title,
  subtitle,
  onUndo,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  onUndo: () => void;
}) {
  if (!visible) return null;
  return (
    <View style={notifCardStyles.root}>
      <View style={{ flex: 1 }}>
        <Text style={notifCardStyles.title}>{title}</Text>
        <Text style={notifCardStyles.subtitle}>{subtitle}</Text>
      </View>
      <TouchableOpacity style={notifCardStyles.undoBtn} onPress={onUndo}>
        <Text style={notifCardStyles.undoText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

// ========================================
// COMPOSANT BOOKING MODAL
// ========================================
function BookingModal({
  visible,
  onClose,
  onConfirm,
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  loading,
  business,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  loading: boolean;
  business: Business | null;
}) {
  const today = new Date();
  const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const availableTimeSlots = useMemo(() => {
    return generateAvailableTimeSlots(selectedDate, business);
  }, [selectedDate, business]);

  const markedDates: { [key: string]: any } = {};
  if (selectedDate) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: "#14B8A6",
      selectedTextColor: "#000",
    };
  }

  const todayString = today.toISOString().split("T")[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.modalContainer}>
          <View style={styles.bookingModalBox}>
            <View style={styles.bookingModalHeader}>
              <Text style={styles.bookingModalTitle}>Réserver une date</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.bookingModalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.datePickerSection}>
                <Text style={styles.sectionSubtitle}>
                  Sélectionnez une date
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.datePickerScroll}
                >
                  {Array.from({ length: 30 }).map((_, index) => {
                    const date = new Date(today);
                    date.setDate(date.getDate() + index);
                    const dateStr = date.toISOString().split("T")[0];
                    const isSelected = selectedDate === dateStr;
                    const dayOfWeek =
                      date
                        .toLocaleDateString("fr-FR", { weekday: "short" })
                        .charAt(0)
                        .toUpperCase() +
                      date
                        .toLocaleDateString("fr-FR", { weekday: "short" })
                        .slice(1);
                    const dayOfMonth = date.getDate();

                    return (
                      <TouchableOpacity
                        key={dateStr}
                        style={[
                          styles.datePicker,
                          isSelected && styles.datePickerSelected,
                        ]}
                        onPress={() => onDateSelect(dateStr)}
                      >
                        <Text
                          style={[
                            styles.datePickerDay,
                            isSelected && styles.datePickerDaySelected,
                          ]}
                        >
                          {dayOfWeek}
                        </Text>
                        <Text
                          style={[
                            styles.datePickerDate,
                            isSelected && styles.datePickerDateSelected,
                          ]}
                        >
                          {dayOfMonth}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {selectedDate && (
                <View style={styles.timeSection}>
                  <Text style={styles.sectionSubtitle}>
                    Sélectionnez une heure
                  </Text>

                  <View style={styles.dateDisplayBox}>
                    <Text style={styles.dateDisplayLabel}>
                      Date sélectionnée
                    </Text>
                    <Text style={styles.dateDisplayValue}>
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                        "fr-FR",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </Text>
                  </View>

                  {availableTimeSlots.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.timeSlotScroll}
                    >
                      {availableTimeSlots.map((slot) => (
                        <TouchableOpacity
                          key={slot}
                          style={[
                            styles.timeSlot,
                            selectedTime === slot && styles.timeSlotSelected,
                          ]}
                          onPress={() => onTimeSelect(slot)}
                        >
                          <Text
                            style={[
                              styles.timeSlotText,
                              selectedTime === slot &&
                                styles.timeSlotTextSelected,
                            ]}
                          >
                            {slot}
                          </Text>
                          {selectedTime === slot && (
                            <Check
                              size={16}
                              color="#000"
                              style={styles.timeSlotCheck}
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.noSlotsContainer}>
                      <Text style={styles.noSlotsText}>
                        Aucun créneau disponible pour cette date
                      </Text>
                    </View>
                  )}

                  {selectedTime && (
                    <View style={styles.confirmationSummary}>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Date</Text>
                        <Text style={styles.summaryValue}>
                          {new Date(
                            selectedDate + "T00:00:00"
                          ).toLocaleDateString("fr-FR")}
                        </Text>
                      </View>
                      <View style={styles.summaryDivider} />
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Heure</Text>
                        <Text style={styles.summaryValue}>{selectedTime}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.bookingModalFooter}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.btnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btnConfirm,
                  (!selectedDate || !selectedTime || loading) &&
                    styles.btnConfirmDisabled,
                ]}
                onPress={onConfirm}
                disabled={!selectedDate || !selectedTime || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.btnConfirmText}>Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

// ========================================
// SCREEN PRINCIPALE
// ========================================
export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user, isGuest } = useAuth();
  const {
    createNewBooking,
    loading: bookingLoading,
    error: bookingError,
  } = useBooking();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const galleryFlatListRef = useRef<FlatList>(null);

  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifSubtitle, setNotifSubtitle] = useState("");

  useEffect(() => {
    fetchBusinessDetails();
  }, [id]);

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      const businessDoc = await getDoc(doc(db, "businesses", id));
      if (businessDoc.exists()) {
        setBusiness({
          id: businessDoc.id,
          ...businessDoc.data(),
        } as Business);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du business:", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger les informations du professionnel"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (notifVisible) {
      const timeout = setTimeout(() => setNotifVisible(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [notifVisible]);

  const handleBooking = () => {
    if (isGuest) {
      Alert.alert(
        "Connexion requise",
        "Connectez-vous pour effectuer une réservation"
      );
      return;
    }
    setBookingModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    // Validation
    if (!selectedDate || !selectedTime || !business || !user) {
      Alert.alert("Erreur", "Veuillez sélectionner une date et une heure");
      return;
    }

    try {
      // Parse selectedTime (format: "HH:MM" depuis le DateTimePicker)
      const [hours, minutes] = selectedTime.split(":").map(Number);

      // Crée une Date complète avec la date et l'heure
      const displayDate = new Date(selectedDate + "T00:00:00");
      displayDate.setHours(hours, minutes, 0, 0);

      // Heure de début (string format "HH:MM")
      const startTime = selectedTime;

      // Calcule l'heure de fin (+30 minutes)
      const endDate = new Date(displayDate);
      endDate.setMinutes(endDate.getMinutes() + 30);
      const endHours = String(endDate.getHours()).padStart(2, "0");
      const endMinutes = String(endDate.getMinutes()).padStart(2, "0");
      const endTime = `${endHours}:${endMinutes}`;

      // ✅ CRÉE LA RÉSERVATION
      const bookingId = await createNewBooking({
        clientId: user.id,
        businessId: business.id,
        serviceId: "service-default",
        date: new Date(selectedDate),
        startTime,
        endTime,
        duration: 30,
        status: "pending",
        notes: null,
        price: 35,
        totalPrice: 35,
        depositRequired: false,
        depositPercentage: 0,
        depositAmount: 0,
        paymentStatus: "pending",
        depositPaidAt: null,
        completedPaymentAt: null,
        cancelledBy: null,
        cancellationReason: null,
      });

      console.log("✅ Booking créée:", bookingId);

      // ✅ ENVOIE LES NOTIFICATIONS
      // selectedTime est déjà un string ("HH:MM"), pas besoin de conversion
      const bookingDate = new Date(selectedDate);
      const bookingTime = startTime; // Utilise directement le string

      await sendBookingConfirmation(bookingId, bookingDate, bookingTime);
      await scheduleBookingReminder(bookingId, bookingDate, bookingTime);

      // ✅ FERME LE MODAL
      setBookingModalVisible(false);

      // ✅ AFFICHE LA NOTIFICATION DE SUCCÈS
      const d = new Date(selectedDate);
      setNotifTitle("✅ Réservation confirmée!");
      setNotifSubtitle(`${d.toLocaleDateString("fr-FR")} à ${startTime}`);
      setNotifVisible(true);

      // Auto-hide la notification après 2 secondes
      setTimeout(() => setNotifVisible(false), 2000);

      // ✅ RESET LES ÉTATS
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      Alert.alert(
        "Erreur",
        error.message || "Impossible de créer la réservation"
      );
    }
  };

  const handleUndo = () => {
    setNotifVisible(false);
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingModalVisible(true);
  };

  const handleToggleFavorite = () => {
    if (isGuest) {
      Alert.alert(
        "Connexion requise",
        "Connectez-vous pour ajouter des favoris"
      );
      return;
    }
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    Alert.alert("Partage", "Fonctionnalité à implémenter");
  };

  const handleInstagramPress = () => {
    Linking.openURL("https://instagram.com/thebarber_shop");
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  const handleGalleryImagePress = (index: number) => {
    setSelectedGalleryIndex(index);
    setGalleryModalVisible(true);
  };

  const handleGalleryScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setSelectedGalleryIndex(index);
  };

  const handleNextGalleryImage = () => {
    if (selectedGalleryIndex < MOCK_GALLERY.length - 1) {
      const newIndex = selectedGalleryIndex + 1;
      setSelectedGalleryIndex(newIndex);
      galleryFlatListRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
      });
    }
  };

  const handlePrevGalleryImage = () => {
    if (selectedGalleryIndex > 0) {
      const newIndex = selectedGalleryIndex - 1;
      setSelectedGalleryIndex(newIndex);
      galleryFlatListRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!business) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Professionnel introuvable</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const images = [business.image, ...MOCK_GALLERY];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleFavorite}
          >
            <Heart
              size={18}
              color={isFavorite ? "#EF4444" : "#fff"}
              fill={isFavorite ? "#EF4444" : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.carouselImage} />
            )}
          />

          <View style={styles.paginationContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentImageIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1} / {images.length}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.businessName}>{business.businessName}</Text>
            <View style={styles.ratingRow}>
              <Star size={16} color="#14B8A6" fill="#14B8A6" />
              <Text style={styles.ratingText}>
                {business.rating} · {business.reviewCount} reviews
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{business.category}</Text>
            </View>
            <TouchableOpacity
              style={styles.instagramButton}
              onPress={handleInstagramPress}
            >
              <Instagram size={20} color="#E4405F" />
              <Text style={styles.instagramText}>@thebarber_shop</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <Clock size={20} color="#14B8A6" />
              <View>
                <Text style={styles.infoLabel}>Horaires</Text>
                <Text style={styles.infoValue}>
                  {business.openingHours.open} - {business.openingHours.close}
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <MapPin size={20} color="#14B8A6" />
              <View>
                <Text style={styles.infoLabel}>Distance</Text>
                <Text style={styles.infoValue}>
                  {business.location.distance} km
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services proposés</Text>
            <View style={styles.serviceGrid}>
              {business.services.map((service, index) => (
                <View key={index} style={styles.serviceChip}>
                  <Text style={styles.serviceChipText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.aboutText}>
              {business.businessName} vous accueille pour tous vos besoins en{" "}
              {business.category.toLowerCase()}. Notre équipe de professionnels
              qualifiés vous garantit un service de qualité dans une ambiance
              chaleureuse et conviviale.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.gallerySectionHeader}>
              <Text style={styles.sectionTitle}>Nos réalisations</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>Voir tout</Text>
                <ChevronRight size={16} color="#14B8A6" />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryScroll}
            >
              {MOCK_GALLERY.map((imageUrl, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.galleryItem}
                  onPress={() => handleGalleryImagePress(index)}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.galleryImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            <View style={styles.locationCard}>
              <MapPin size={20} color="#14B8A6" />
              <Text style={styles.addressText}>
                {business.location.address}
              </Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBooking}
          disabled={bookingLoading}
        >
          {bookingLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.bookButtonText}>Réserver</Text>
          )}
        </TouchableOpacity>
      </View>

      <BookingModal
        visible={bookingModalVisible}
        onClose={() => setBookingModalVisible(false)}
        onConfirm={handleConfirmBooking}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        selectedTime={selectedTime}
        onTimeSelect={setSelectedTime}
        loading={bookingLoading}
        business={business}
      />

      <Modal
        visible={galleryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGalleryModalVisible(false)}
      >
        <View style={styles.galleryModal}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setGalleryModalVisible(false)}
          >
            <X size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.galleryCounter}>
            <Text style={styles.galleryCounterText}>
              {selectedGalleryIndex + 1} / {MOCK_GALLERY.length}
            </Text>
          </View>

          <FlatList
            ref={galleryFlatListRef}
            data={MOCK_GALLERY}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.galleryImageContainer}>
                <Image
                  source={{ uri: item }}
                  style={styles.galleryFullscreenImage}
                />
              </View>
            )}
          />

          <TouchableOpacity
            style={[styles.navButton, styles.navButtonLeft]}
            onPress={handlePrevGalleryImage}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonRight]}
            onPress={handleNextGalleryImage}
          >
            <ChevronRight size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      <ReservationSnackbar
        message={snackbarMessage}
        visible={snackbarVisible}
      />

      <ReservationCardNotification
        visible={notifVisible}
        title={notifTitle}
        subtitle={notifSubtitle}
        onUndo={handleUndo}
      />
    </SafeAreaView>
  );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  blurContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#14B8A6",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  headerActions: {
    position: "absolute",
    top: 60,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ffffffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rightActions: {
    flexDirection: "row",
    gap: 12,
  },
  carouselContainer: {
    height: 350,
    position: "relative",
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: 350,
  },
  paginationContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  paginationDotActive: {
    backgroundColor: "#FFFFFF",
    width: 20,
  },
  imageCounter: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageCounterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    backgroundColor: "#000",
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  businessName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  categoryBadge: {
    backgroundColor: "#222222ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#c3c5caff",
  },
  instagramButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#222222ff",
    borderWidth: 1,
  },
  instagramText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E4405F",
  },
  divider: {
    height: 1,
    backgroundColor: "#444444ff",
    marginHorizontal: 24,
    marginVertical: 24,
  },
  quickInfo: {
    paddingHorizontal: 24,
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: "#c3c5caff",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  serviceChip: {
    backgroundColor: "#444444ff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "#6B7280",
  },
  serviceChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#c3c5caff",
  },
  aboutText: {
    fontSize: 15,
    color: "#c3c5caff",
    lineHeight: 24,
  },
  gallerySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#14B8A6",
  },
  galleryScroll: {
    gap: 12,
  },
  galleryItem: {
    width: 200,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#444444ff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6B7280ff",
  },
  addressText: {
    fontSize: 15,
    color: "#c3c5caff",
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  bookButton: {
    backgroundColor: "#14B8A6",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bookingModalBox: {
    backgroundColor: "#18181a",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "85%",
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  bookingModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2c",
  },
  bookingModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  bookingModalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  datePickerSection: {
    marginBottom: 24,
  },
  datePickerScroll: {
    gap: 8,
    paddingRight: 24,
  },
  datePicker: {
    width: 60,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#222222",
    borderWidth: 2,
    borderColor: "#2a2a2c",
    alignItems: "center",
    justifyContent: "center",
  },
  datePickerSelected: {
    backgroundColor: "#14B8A6",
    borderColor: "#14B8A6",
  },
  datePickerDay: {
    fontSize: 11,
    fontWeight: "600",
    color: "#c3c5ca",
    marginBottom: 4,
  },
  datePickerDaySelected: {
    color: "#000000",
  },
  datePickerDate: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  datePickerDateSelected: {
    color: "#000000",
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#c3c5ca",
    marginBottom: 12,
  },
  timeSection: {
    marginBottom: 24,
  },
  dateDisplayBox: {
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2a2a2c",
  },
  dateDisplayLabel: {
    fontSize: 12,
    color: "#c3c5ca",
    fontWeight: "500",
    marginBottom: 6,
  },
  dateDisplayValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textTransform: "capitalize",
  },
  timeSlotScroll: {
    gap: 12,
    paddingRight: 24,
  },
  timeSlot: {
    width: 80,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#222222",
    borderWidth: 2,
    borderColor: "#2a2a2c",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  timeSlotSelected: {
    backgroundColor: "#14B8A6",
    borderColor: "#14B8A6",
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  timeSlotTextSelected: {
    color: "#000000",
  },
  timeSlotCheck: {
    marginTop: 4,
  },
  noSlotsContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  noSlotsText: {
    fontSize: 14,
    color: "#c3c5ca",
    fontStyle: "italic",
  },
  confirmationSummary: {
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a2a2c",
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#c3c5ca",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#2a2a2c",
    marginVertical: 12,
  },
  bookingModalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#2a2a2c",
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#222222",
    borderWidth: 1,
    borderColor: "#2a2a2c",
    alignItems: "center",
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  btnConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#14B8A6",
    alignItems: "center",
  },
  btnConfirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  btnConfirmDisabled: {
    backgroundColor: "#999999",
    opacity: 0.5,
  },
  galleryModal: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryCounter: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  galleryCounterText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  galleryImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryFullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -22 }],
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  navButtonLeft: {
    left: 24,
  },
  navButtonRight: {
    right: 24,
  },
});

const snackbarStyles = StyleSheet.create({
  snackbar: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  snackbarText: {
    backgroundColor: "#18181a",
    color: "#fff",
    fontWeight: "700",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 9,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    textAlign: "center",
  },
});

const notifCardStyles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 100,
    left: 10,
    right: 10,
    backgroundColor: "#18181a",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 30,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 3,
  },
  subtitle: {
    color: "#c3c5caff",
    fontSize: 13,
  },
  undoBtn: {
    backgroundColor: "#252526",
    borderRadius: 7,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginLeft: 13,
  },
  undoText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
});
