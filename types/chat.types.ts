// ========================================
// TYPES - Chat & Messaging
// ========================================

import { Timestamp } from "firebase/firestore";

export interface MessageAttachment {
  id: string;
  type: "image" | "document";
  url: string;
  fileName: string;
  size: number; // en bytes
  uploadedAt: Timestamp;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  text: string;
  attachments?: MessageAttachment[];
  createdAt: Timestamp;
  isRead: boolean;
  readAt?: Timestamp | null;
}

export interface Conversation {
  id: string;
  bookingId: string; // ← Lié à la réservation
  clientId: string;
  professionalId: string;
  clientName: string;
  professionalName: string;
  clientAvatar: string | null;
  professionalAvatar: string | null;
  businessName: string; // Nom du business/service
  serviceBooked: string; // Ex: "Coupe cheveux"
  bookingDate: Timestamp; // Date de la réservation
  lastMessage: string;
  lastMessageTime: Timestamp;
  unreadCountClient: number; // Messages non lus côté client
  unreadCountPro: number; // Messages non lus côté pro
  createdAt: Timestamp;
  isActive: boolean;
  isArchived?: boolean;
}

export interface UseConversationReturn {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  setSelectedConversation: (conv: Conversation | null) => void;
  sendMessage: (text: string, attachments?: MessageAttachment[]) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  searchConversations: (query: string) => Promise<Conversation[]>;
  archiveConversation: (conversationId: string) => Promise<void>;
  unreadCount: number;
}
