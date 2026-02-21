import { ToastContainer } from "@/components/common/ToastContainer";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/useToast";
import { Conversation } from "@/types/chat.types";
import { useRouter } from "expo-router";
import { MessageCircle, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function ChatScreen() {
  const router = useRouter();
  const { conversations, loading, error, unreadCount, searchConversations } =
    useChat();
  const { toasts, removeToast } = useToast();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  // ========== HANDLE SEARCH ==========
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setFilteredConversations(conversations);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchConversations(query);
      setFilteredConversations(results);
    } catch (err) {
      console.error("Erreur recherche:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // ========== AFFICHER CONVERSATIONS ==========
  const displayConversations =
    searchQuery.trim().length > 0 ? filteredConversations : conversations;

  // ========== RENDU MESSAGE CARD ==========
  const renderConversationCard = ({ item }: { item: Conversation }) => {
    const unreadBadge = item.unreadCountClient > 0 || item.unreadCountPro > 0;
    const unreadNum = Math.max(item.unreadCountClient, item.unreadCountPro);

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <Image
          source={{
            uri:
              item.clientAvatar ||
              item.professionalAvatar ||
              "https://randomuser.me/api/portraits/men/1.jpg",
          }}
          style={styles.avatar}
        />

        {/* Unread Badge */}
        {unreadBadge && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadNum}</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.conversationContent}>
          {/* Header: Name & Time */}
          <View style={styles.headerRow}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {item.businessName}
            </Text>
            <Text style={styles.timestamp}>
              {formatTime(new Date(item.lastMessageTime.toMillis()))}
            </Text>
          </View>

          {/* Service info */}
          <Text style={styles.serviceInfo} numberOfLines={1}>
            {item.serviceBooked}
          </Text>

          {/* Last message */}
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>

          {/* Booking date */}
          <Text style={styles.bookingDate}>
            📅{" "}
            {new Date(item.bookingDate.toMillis()).toLocaleDateString("fr-FR")}
          </Text>
        </View>

        {/* Right arrow */}
        <View style={styles.arrowContainer}>
          <MessageCircle size={20} color="#14B8A6" />
        </View>
      </TouchableOpacity>
    );
  };

  // ========== RENDER EMPTY STATE ==========
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MessageCircle size={48} color="#6B7280" />
      <Text style={styles.emptyTitle}>Pas de messages</Text>
      <Text style={styles.emptySubtitle}>
        Vos conversations s'afficheront ici
      </Text>
    </View>
  );

  // ========== RENDER ERROR STATE ==========
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>⚠️ Erreur lors du chargement</Text>
      <Text style={styles.errorSubtext}>{error}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Chargement des messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Messages</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCountText}>
              {unreadCount} nouveau{unreadCount > 1 ? "x" : ""}
            </Text>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une conversation..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Conversations List */}
      {error ? (
        renderErrorState()
      ) : displayConversations.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={displayConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Loading indicator during search */}
      {isSearching && (
        <View style={styles.searchLoadingContainer}>
          <ActivityIndicator size="small" color="#14B8A6" />
          <Text style={styles.searchLoadingText}>Recherche en cours...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ========== HELPERS ==========
function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}j`;
  return date.toLocaleDateString("fr-FR");
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F1F",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  unreadCountText: {
    fontSize: 12,
    color: "#14B8A6",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginVertical: 16,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: "#1F1F1F",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
  },
  clearButton: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 16,
  },
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#0F0F0F",
    marginVertical: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1F1F1F",
    marginRight: 12,
  },
  unreadBadge: {
    position: "absolute",
    left: 44,
    top: -4,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0F0F0F",
  },
  unreadText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  conversationContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 8,
  },
  serviceInfo: {
    fontSize: 12,
    color: "#14B8A6",
    fontWeight: "500",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 13,
    color: "#A3A3A3",
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 11,
    color: "#6B7280",
  },
  arrowContainer: {
    marginLeft: 8,
    opacity: 0.6,
  },
  separator: {
    height: 1,
    backgroundColor: "#1F1F1F",
    marginVertical: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
  errorSubtext: {
    fontSize: 12,
    color: "#6B7280",
  },
  searchLoadingContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#1F1F1F",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchLoadingText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
});
