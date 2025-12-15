import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell } from "lucide-react-native";
import { router } from "expo-router";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterDrawer } from "@/components/common/FilterDrawer";
import { FilterChip } from "@/components/common/FilterChips";
import { BusinessCard } from "@/components/business/BusinessCard";
import { LastVisitCard } from "@/components/business/LastVisitCard";
import { DrawerContext } from "./_layout";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinesses } from "@/hooks/useBusinesses";

const MOCK_FILTERS: FilterChip[] = [
  { id: "coiffure", label: "Coiffure", value: "Coiffure", emoji: "💇" },
  { id: "barbier", label: "Barbier", value: "Barbier", emoji: "✂️" },
  { id: "esthetique", label: "Esthétique", value: "Esthétique", emoji: "💅" },
  { id: "manucure", label: "Manucure", value: "Manucure", emoji: "💅" },
  { id: "massage", label: "Massage", value: "Massage", emoji: "💆" },
  { id: "tattoo", label: "Tattoo", value: "Tattoo", emoji: "🎨" },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { isDrawerOpen, setIsDrawerOpen } = useContext(DrawerContext);
  const { user } = useAuth();

  // Récupérer la valeur du filtre sélectionné
  const selectedCategory =
    selectedFilters.length > 0
      ? MOCK_FILTERS.find((f) => f.id === selectedFilters[0])?.value
      : undefined;

  // console.log("🎯 Filtre sélectionné ID:", selectedFilters[0]);
  // console.log("🎯 Catégorie correspondante:", selectedCategory);

  // Récupérer les businesses depuis Firebase
  const { businesses, loading, error } = useBusinesses({
    category: selectedCategory,
  });

  const handleChipPress = (chipId: string) => {
    // Toggle du filtre (un seul à la fois)
    setSelectedFilters((prev) => (prev.includes(chipId) ? [] : [chipId]));
  };

  const handleApplyFilters = () => {
    // console.log("✅ Filtres appliqués - ID:", selectedFilters);
    // console.log("✅ Catégorie:", selectedCategory);
    setIsDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedFilters([]);
  };

  const currentDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hey, {user?.firstName || "Invité"} 👋
            </Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile")}
              style={styles.profileButton}
            >
              <Image
                source={{
                  uri:
                    user?.profilePicture ||
                    "https://randomuser.me/api/portraits/men/32.jpg",
                }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => setIsDrawerOpen(true)}
          style={styles.searchBar}
        />

        {/* Latest Visit Section */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>LATEST VISIT</Text>
          <LastVisitCard
            id="pro-1"
            name="Richard Anderson"
            image="https://randomuser.me/api/portraits/men/1.jpg"
            rating={4.8}
            reviewCount={114}
            badge="PRO"
          />
        </View> */}

        {/* Nearby Barbershop Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory
                ? `${selectedCategory.toUpperCase()} À PROXIMITÉ`
                : "PROFESSIONNELS À PROXIMITÉ"}
            </Text>
            {selectedFilters.length > 0 && (
              <TouchableOpacity onPress={handleResetFilters}>
                <Text style={styles.clearFilter}>Effacer</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#14B8A6" />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : businesses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Aucun professionnel trouvé
                {selectedCategory && ` dans la catégorie "${selectedCategory}"`}
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.businessList}
            >
              {businesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  id={business.id}
                  name={business.businessName}
                  image={business.image}
                  rating={business.rating}
                  reviewCount={business.reviewCount}
                  isOpen={true}
                  openTime={business.openingHours.open}
                  closeTime={business.openingHours.close}
                  distance={business.location.distance}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Filter Drawer */}
      <FilterDrawer
        visible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        chips={MOCK_FILTERS}
        selectedChips={selectedFilters}
        onChipPress={handleChipPress}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#6B7280",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 2,
    // borderColor: "#14B8A6",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  searchBar: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 1,
  },
  clearFilter: {
    fontSize: 12,
    color: "#14B8A6",
    fontWeight: "600",
  },
  businessList: {
    paddingHorizontal: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 14,
  },
  errorContainer: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
});
