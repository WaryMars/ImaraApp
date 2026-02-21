import { useState, useEffect, useCallback, useRef } from "react";
import {
  Conversation,
  Message,
  MessageAttachment,
  UseConversationReturn,
} from "@/types/chat.types";
import * as ChatService from "@/services/chat.service";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";

export function useChat(): UseConversationReturn {
  // Auth
  const { user } = useAuth();
  const { showToast } = useToast();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs pour les écouteurs Firestore
  const unsubscribeMessages = useRef<(() => void) | null>(null);
  const unsubscribeConversations = useRef<(() => void) | null>(null);

  // ========== CHARGER LES CONVERSATIONS ==========
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const convs = await ChatService.getConversations(user.id);
      setConversations(convs as Conversation[]);

      console.log("✅ [HOOK] Conversations chargées:", convs.length);
    } catch (err: any) {
      console.error("❌ [HOOK] Erreur chargement conversations:", err);
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ========== CHARGER LES MESSAGES (avec écouteur temps réel) ==========
  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!user) return;

      try {
        // Nettoie l'écouteur précédent
        if (unsubscribeMessages.current) {
          unsubscribeMessages.current();
        }

        // Marque comme lu
        await ChatService.markConversationAsRead(conversationId, user.id);

        // Écoute les messages en temps réel
        unsubscribeMessages.current = ChatService.listenToMessages(
          conversationId,
          (msgs) => {
            setMessages(msgs as Message[]);
          }
        );

        console.log("✅ [HOOK] Écouteur messages activé");
      } catch (err: any) {
        console.error("❌ [HOOK] Erreur chargement messages:", err);
        setError(err.message);
      }
    },
    [user]
  );

  // ========== SÉLECTIONNER UNE CONVERSATION ==========
  const handleSelectConversation = useCallback(
    (conv: Conversation | null) => {
      setSelectedConversation(conv);
      if (conv) {
        loadMessages(conv.id);
      }
    },
    [loadMessages]
  );

  // ========== ENVOYER UN MESSAGE ==========
  const sendMessage = useCallback(
    async (text: string, attachments?: MessageAttachment[]) => {
      if (!user || !selectedConversation) {
        console.warn("⚠️  [HOOK] Pas de user ou conversation sélectionnée");
        return;
      }

      try {
        await ChatService.sendMessage(
          selectedConversation.id,
          user.id,
          user.firstName || "Utilisateur",
          user.profilePicture || null,
          text,
          attachments
        );

        // Toast de succès
        showToast({
          type: "success",
          message: "Message envoyé ✅",
          duration: 2000,
        });

        console.log("✅ [HOOK] Message envoyé");
      } catch (err: any) {
        console.error("❌ [HOOK] Erreur envoi message:", err);
        showToast({
          type: "error",
          message: "Erreur lors de l'envoi du message",
          duration: 3000,
        });
      }
    },
    [user, selectedConversation, showToast]
  );

  // ========== MARQUER COMME LU ==========
  const markAsRead = useCallback(
    async (conversationId: string) => {
      if (!user) return;

      try {
        await ChatService.markConversationAsRead(conversationId, user.id);
        console.log("✅ [HOOK] Marqué comme lu");
      } catch (err: any) {
        console.error("❌ [HOOK] Erreur marquage comme lu:", err);
      }
    },
    [user]
  );

  // ========== RECHERCHER CONVERSATIONS ==========
  const searchConversations = useCallback(
    async (query: string): Promise<Conversation[]> => {
      if (!user) return [];

      try {
        const results = await ChatService.searchConversations(user.id, query);
        return results as Conversation[];
      } catch (err: any) {
        console.error("❌ [HOOK] Erreur recherche:", err);
        return [];
      }
    },
    [user]
  );

  // ========== ARCHIVER CONVERSATION ==========
  const archiveConversation = useCallback(
    async (conversationId: string) => {
      try {
        await ChatService.archiveConversation(conversationId);
        setConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId)
        );
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
          setMessages([]);
        }
        showToast({
          type: "success",
          message: "Conversation archivée",
          duration: 2000,
        });
        console.log("✅ [HOOK] Conversation archivée");
      } catch (err: any) {
        console.error("❌ [HOOK] Erreur archive:", err);
        showToast({
          type: "error",
          message: "Erreur lors de l'archivage",
          duration: 3000,
        });
      }
    },
    [selectedConversation, showToast]
  );

  // ========== CALCULER LE NOMBRE TOTAL DE NON-LUS ==========
  const unreadCount = conversations.reduce((acc, conv) => {
    if (user?.type === "client" || user?.mode === "guest") {
      return acc + conv.unreadCountClient;
    } else {
      return acc + conv.unreadCountPro;
    }
  }, 0);

  // ========== EFFET - CHARGEMENT INITIAL ==========
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ========== CLEANUP - Désabonner les écouteurs ==========
  useEffect(() => {
    return () => {
      if (unsubscribeMessages.current) {
        unsubscribeMessages.current();
      }
      if (unsubscribeConversations.current) {
        unsubscribeConversations.current();
      }
    };
  }, []);

  return {
    conversations,
    selectedConversation,
    messages,
    loading,
    error,
    setSelectedConversation: handleSelectConversation,
    sendMessage,
    markAsRead,
    searchConversations,
    archiveConversation,
    unreadCount,
  };
}
