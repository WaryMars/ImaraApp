import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  increment,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/config/firebase";
import { Conversation, Message, MessageAttachment } from "@/types/chat.types";

// ========== CRÉE UNE CONVERSATION ==========
export async function createConversation(
  bookingId: string,
  clientId: string,
  clientName: string,
  clientAvatar: string | null,
  professionalId: string,
  professionalName: string,
  professionalAvatar: string | null,
  businessName: string,
  serviceBooked: string,
  bookingDate: Date
): Promise<string> {
  try {
    console.log("💬 [CHAT] Création conversation pour booking:", bookingId);

    const conversationId = doc(collection(db, "conversations")).id;

    const conversation: Conversation = {
      id: conversationId,
      bookingId,
      clientId,
      professionalId,
      clientName,
      professionalName,
      clientAvatar,
      professionalAvatar,
      businessName,
      serviceBooked,
      bookingDate: Timestamp.fromDate(new Date(bookingDate)),
      lastMessage: "Conversation créée",
      lastMessageTime: Timestamp.now(),
      unreadCountClient: 0,
      unreadCountPro: 0,
      createdAt: Timestamp.now(),
      isActive: true,
      isArchived: false,
    };

    await setDoc(doc(db, "conversations", conversationId), conversation);

    console.log("✅ [CHAT] Conversation créée:", conversationId);
    return conversationId;
  } catch (error) {
    console.error("❌ [CHAT] Erreur création conversation:", error);
    throw error;
  }
}

// ========== RÉCUPÈRE LES CONVERSATIONS D'UN USER ==========
export async function getConversations(
  userId: string
): Promise<Conversation[]> {
  try {
    console.log("💬 [CHAT] Chargement conversations pour:", userId);

    const q = query(
      collection(db, "conversations"),
      where("isArchived", "==", false),
      orderBy("lastMessageTime", "desc")
    );

    const snapshot = await getDocs(q);
    const conversations: Conversation[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as Conversation;
      if (data.clientId === userId || data.professionalId === userId) {
        conversations.push({ ...data, id: doc.id });
      }
    });

    console.log("✅ [CHAT] Conversations chargées:", conversations.length);
    return conversations;
  } catch (error) {
    console.error("❌ [CHAT] Erreur chargement conversations:", error);
    throw error;
  }
}

// ========== RÉCUPÈRE LES MESSAGES D'UNE CONVERSATION ==========
export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    console.log("💬 [CHAT] Chargement messages pour:", conversationId);

    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy("createdAt", "asc"),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const messages: Message[] = [];

    snapshot.forEach((doc) => {
      messages.push({ ...(doc.data() as Message), id: doc.id });
    });

    console.log("✅ [CHAT] Messages chargés:", messages.length);
    return messages;
  } catch (error) {
    console.error("❌ [CHAT] Erreur chargement messages:", error);
    throw error;
  }
}

// ========== ENVOIE UN MESSAGE ==========
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string | null,
  text: string,
  attachments?: MessageAttachment[]
): Promise<void> {
  try {
    if (!text.trim() && (!attachments || attachments.length === 0)) {
      console.warn("⚠️  [CHAT] Message vide");
      return;
    }

    console.log("📤 [CHAT] Envoi message:", { conversationId, senderId });

    const messageId = doc(collection(db, "messages")).id;
    const timestamp = Timestamp.now();

    const message: Message = {
      id: messageId,
      conversationId,
      senderId,
      senderName,
      senderAvatar,
      text: text.trim(),
      attachments,
      createdAt: timestamp,
      isRead: false,
    };

    await setDoc(
      doc(db, `conversations/${conversationId}/messages/${messageId}`),
      message
    );

    // Récupère la conversation pour déterminer qui est qui
    const convRef = doc(db, "conversations", conversationId);
    const convSnap = await getDoc(convRef);
    const convData = convSnap.data() as Conversation;

    // Met à jour la conversation
    await updateDoc(convRef, {
      lastMessage: text.trim() || "📎 Pièce jointe",
      lastMessageTime: timestamp,
      unreadCountClient: increment(senderId === convData.clientId ? 0 : 1),
      unreadCountPro: increment(senderId === convData.professionalId ? 0 : 1),
    });

    console.log("✅ [CHAT] Message envoyé");
  } catch (error) {
    console.error("❌ [CHAT] Erreur envoi message:", error);
    throw error;
  }
}

// ========== MARQUE LES MESSAGES COMME LUS ==========
export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    console.log("📖 [CHAT] Marquage comme lu:", conversationId);

    const conversationRef = doc(db, "conversations", conversationId);
    const conversation = await getDoc(conversationRef);

    if (!conversation.exists()) {
      console.warn("⚠️  [CHAT] Conversation introuvable");
      return;
    }

    const data = conversation.data() as Conversation;
    const isClient = data.clientId === userId;

    if (isClient) {
      await updateDoc(conversationRef, { unreadCountClient: 0 });
    } else {
      await updateDoc(conversationRef, { unreadCountPro: 0 });
    }

    const messagesQuery = query(
      collection(db, `conversations/${conversationId}/messages`),
      where("isRead", "==", false)
    );

    const snapshot = await getDocs(messagesQuery);
    const batch = writeBatch(db);

    snapshot.forEach((msgDoc) => {
      batch.update(msgDoc.ref, {
        isRead: true,
        readAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log("✅ [CHAT] Marqués comme lus");
  } catch (error) {
    console.error("❌ [CHAT] Erreur marquage comme lu:", error);
    throw error;
  }
}

// ========== UPLOAD UNE PIÈCE JOINTE ==========
export async function uploadAttachment(
  conversationId: string,
  file: any,
  fileType: "image" | "document"
): Promise<MessageAttachment> {
  try {
    console.log("📎 [CHAT] Upload pièce jointe:", fileType);

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `conversations/${conversationId}/${fileType}s/${fileName}`;
    const fileRef = ref(storage, filePath);

    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    const attachment: MessageAttachment = {
      id: doc(collection(db, "attachments")).id,
      type: fileType,
      url,
      fileName: file.name,
      size: file.size,
      uploadedAt: Timestamp.now(),
    };

    console.log("✅ [CHAT] Pièce jointe uploadée");
    return attachment;
  } catch (error) {
    console.error("❌ [CHAT] Erreur upload pièce jointe:", error);
    throw error;
  }
}

// ========== ÉCOUTEUR TEMPS RÉEL ==========
export function listenToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  try {
    console.log("🔔 [CHAT] Écoute messages temps réel");

    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({ ...(doc.data() as Message), id: doc.id });
      });
      callback(messages);
    });

    return unsubscribe;
  } catch (error) {
    console.error("❌ [CHAT] Erreur écoute messages:", error);
    return () => {};
  }
}

// ========== ARCHIVE UNE CONVERSATION ==========
export async function archiveConversation(
  conversationId: string
): Promise<void> {
  try {
    console.log("📦 [CHAT] Archive conversation:", conversationId);

    await updateDoc(doc(db, "conversations", conversationId), {
      isArchived: true,
    });

    console.log("✅ [CHAT] Conversation archivée");
  } catch (error) {
    console.error("❌ [CHAT] Erreur archive:", error);
    throw error;
  }
}

// ========== SEARCH CONVERSATIONS ==========
export async function searchConversations(
  userId: string,
  searchQuery: string
): Promise<Conversation[]> {
  try {
    console.log("🔍 [CHAT] Recherche:", searchQuery);

    const conversations = await getConversations(userId);

    return conversations.filter(
      (conv) =>
        conv.professionalName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.businessName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  } catch (error) {
    console.error("❌ [CHAT] Erreur recherche:", error);
    throw error;
  }
}
