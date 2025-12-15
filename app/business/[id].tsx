import React, { useEffect, useState, useRef } from "react";
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
} from "lucide-react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Business } from "@/hooks/useBusinesses";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "react-native-calendars";
import { BlurView } from "expo-blur";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MOCK_GALLERY = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800",
];

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

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isGuest } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const galleryFlatListRef = useRef<FlatList>(null);

  // Reservation states
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const todayString = new Date().toISOString().split("T")[0];

  // Snackbar state
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
      console.error("Erreur lors de la récupération du business:", error);
    } finally {
      setLoading(false);
    }
  };

  // Affichage du résumé choix (snackbar) :
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const d = new Date(selectedDate);
      const hourStr = selectedTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setNotifTitle("Réservation créée");
      setNotifSubtitle(`${d.toLocaleDateString()} à ${hourStr}`);
      setNotifVisible(true);
      // Auto-hide after 4s
      const timeout = setTimeout(() => setNotifVisible(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [selectedDate, selectedTime]);

  const handleUndo = () => {
    setNotifVisible(false);
    setSelectedDate(null);
    setSelectedTime(null);
    // Ajoute toute action d’annulation business ici (ex: suppression de la réservation)
  };

  const handleBooking = () => setCalendarVisible(true);
  const handleToggleFavorite = () => {
    if (isGuest) {
      alert("Connectez-vous pour ajouter des favoris");
      return;
    }
    setIsFavorite(!isFavorite);
  };
  const handleShare = async () => alert("Partage - À implémenter");
  const handleInstagramPress = () =>
    Linking.openURL("https://instagram.com/thebarber_shop");
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
          <Text style={styles.errorText}>Professionel introuvable</Text>
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

  let reservationText = "";
  if (selectedDate && selectedTime) {
    const dateObj = new Date(selectedDate);
    const dateStr = `${dateObj.getDate().toString().padStart(2, "0")}/${(
      dateObj.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${dateObj.getFullYear()}`;
    const hourStr = selectedTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    reservationText = `Réservation pour le ${dateStr} à ${hourStr}`;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header Actions */}
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
        {/* Image Carousel */}
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

          {/* Pagination Dots */}
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
          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1} / {images.length}
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title & Rating */}
          <View style={styles.titleSection}>
            <Text style={styles.businessName}>{business.businessName}</Text>
            <View style={styles.ratingRow}>
              <Star size={16} color="#14B8A6" fill="#14B8A6" />
              <Text style={styles.ratingText}>
                {business.rating} · {business.reviewCount} reviews
              </Text>
            </View>
          </View>

          {/* Category & Instagram */}
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
          {/* Divider */}
          <View style={styles.divider} />
          {/* Quick Info */}
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
          {/* Divider */}
          <View style={styles.divider} />
          {/* Services */}
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
          {/* Divider */}
          <View style={styles.divider} />
          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.aboutText}>
              {business.businessName} vous accueille pour tous vos besoins en{" "}
              {business.category.toLowerCase()}. Notre équipe de professionnels
              qualifiés vous garantit un service de qualité dans une ambiance
              chaleureuse et conviviale.
            </Text>
          </View>
          {/* Divider */}
          <View style={styles.divider} />
          {/* Gallery Section */}
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
          {/* Divider */}
          <View style={styles.divider} />
          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            <View style={styles.locationCard}>
              <MapPin size={20} color="#14B8A6" />
              <Text style={styles.addressText}>
                {business.location.address}
              </Text>
            </View>
          </View>
          {/* Spacing */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Snackbar custom style */}
      <ReservationSnackbar
        message={snackbarMessage}
        visible={snackbarVisible}
      />

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceSection}>
          <Text style={styles.priceAmount}>€35</Text>
          <Text style={styles.priceLabel}>/ service</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>Réserver</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL CALENDAR + TIMEPICKER */}
      <Modal
        visible={calendarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalContainer}>
          <View style={styles.calendarBox}>
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setTimePickerVisible(true);
              }}
              minDate={todayString}
              style={{
                borderRadius: 18,
                overflow: "hidden",
                width: 320,
                height: 370,
                alignSelf: "center",
              }}
              theme={{
                backgroundColor: "#18181a",
                calendarBackground: "#18181a",
                textSectionTitleColor: "#fff",
                monthTextColor: "#fff",
                selectedDayBackgroundColor: "#14B8A6",
                selectedDayTextColor: "#fff",
                todayTextColor: "#14B8A6",
                dayTextColor: "#fff",
                textDisabledColor: "#555",
                arrowColor: "#14B8A6",
                textDayFontWeight: "600",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "600",
                textDayFontSize: 17,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              hideExtraDays={false}
              markedDates={
                selectedDate
                  ? {
                      [selectedDate]: {
                        selected: true,
                        selectedColor: "#14B8A6",
                        selectedTextColor: "#fff",
                      },
                    }
                  : {}
              }
            />
            <TouchableOpacity
              onPress={() => {
                setCalendarVisible(false);
                setTimePickerVisible(false);
              }}
              style={styles.btnClose}
            >
              <Text style={styles.txtClose}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {timePickerVisible && (
        <DateTimePicker
          value={selectedTime || new Date()}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, time) => {
            if (event.type !== "dismissed" && time) {
              setSelectedTime(time);
              setCalendarVisible(false);
              setTimePickerVisible(false);
            } else {
              setTimePickerVisible(false);
            }
          }}
        />
      )}

      {/* Fullscreen gallery modal (inchangé) */}
      <Modal
        visible={galleryModalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setGalleryModalVisible(false)}
      >
        <View style={styles.galleryModal}>
          <StatusBar barStyle="light-content" />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setGalleryModalVisible(false)}
          >
            <X size={28} color="#FFFFFF" />
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
            showsHorizontalScrollIndicator={false}
            onScroll={handleGalleryScroll}
            scrollEventThrottle={16}
            initialScrollIndex={selectedGalleryIndex}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.galleryImageContainer}>
                <Image
                  source={{ uri: item }}
                  style={styles.galleryFullscreenImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />
          {selectedGalleryIndex > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonLeft]}
              onPress={handlePrevGalleryImage}
            >
              <ChevronLeft size={32} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {selectedGalleryIndex < MOCK_GALLERY.length - 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonRight]}
              onPress={handleNextGalleryImage}
            >
              <ChevronRight size={32} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </Modal>
      <ReservationCardNotification
        visible={notifVisible}
        title={notifTitle}
        subtitle={notifSubtitle}
        onUndo={handleUndo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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

  // Bottom Bar Style (Airbnb)
  bottomBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#1c1c1cff", // ← Fond noir
    borderRadius: 45, // ← Bords arrondis 35px
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  priceSection: {
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF", // ← Texte blanc sur fond noir
  },
  priceLabel: {
    fontSize: 14,
    color: "#CCCCCC", // ← Texte gris clair
    marginLeft: 4,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 13,
    color: "#CCCCCC", // ← Texte gris clair
  },
  bookButton: {
    backgroundColor: "#FFFFFF", // ← Bouton blanc
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50, // ← Bords très arrondis (pill shape)
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000", // ← Texte noir sur fond blanc
  },

  bottomBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  bookButtonNew: {
    backgroundColor: "#000000",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  bookButtonTextNew: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarBox: {
    backgroundColor: "#18181a",
    borderRadius: 18,
    padding: 18,
    minWidth: 320,
    alignItems: "center",
    elevation: 10,
  },
  reservationSummary: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: "center",
  },
  reservationSummaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: 6,
    backgroundColor: "#18181a",
    borderRadius: 10,
    paddingHorizontal: 22,
    marginBottom: 2,
  },
  btnClose: {
    marginTop: 16,
    paddingHorizontal: 34,
    paddingVertical: 12,
    backgroundColor: "#232324",
    borderRadius: 8,
  },
  txtClose: {
    color: "#14B8A6",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Fullscreen Gallery Modal
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
