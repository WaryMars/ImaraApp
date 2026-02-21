
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Send,
  Paperclip,
  MoreVertical,
  Archive,
} from "lucide-react-native";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { ToastContainer } from "@/components/common/ToastContainer";
import { Message } from "@/types/chat.types";

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { toasts, removeToast, showToast } = useToast();
  const {
    conversations,
    messages,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    archiveConversation,
  } = useChat();

  // State
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // ========== CHARGER LA CONVERSATION ==========
  useEffect(() => {
    if (!id) return;

    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setSelectedConversation(conv);
    }
  }, [id, conversations]);

  // ========== SCROLL VERS DERNIER MESSAGE ==========
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // ========== HANDLE SEND MESSAGE ==========
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      showToast({
        type: "warning",
        message: "Le message ne peut pas être vide",
        duration: 2000,
      });
      return;
    }

    try {
      setIsSending(true);
      await sendMessage(messageText.trim());
      setMessageText("");
    } catch (err) {
      console.error("Erreur envoi:", err);
    } finally {
      setIsSending(false);
    }
  };

  // ========== HANDLE ARCHIVE ==========
  const handleArchive = async () => {
    if (!selectedConversation) return;

    try {
      await archiveConversation(selectedConversation.id);
      router.back();
    } catch (err) {
      console.error("Erreur archive:", err);
    }
  };

  // ========== RENDER MESSAGE BUBBLE ==========
  const renderMessageBubble = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.id;
    const isRead = item.isRead;

    return (
      <View
        style={[
          styles.messageBubbleContainer,
          isOwnMessage
            ? styles.ownMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {/* Avatar - Only for other messages */}
        {!isOwnMessage && (
          <Image
            source={{
              uri:
                selectedConversation?.professionalAvatar ||
                selectedConversation?.clientAvatar ||
                "https://randomuser.me/api/portraits/men/1.jpg",
            }}
            style={styles.messageAvatar}
          />
        )}

        {/* Bubble */}
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          {/* Sender name - Only for other messages in groups */}
          {!isOwnMessage && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}

          {/* Message text */}
          <Text
            style={[
              styles.messageText,
              isOwnMessage
                ? styles.ownMessageText
                : styles.otherMessageText,
            ]}
          >
            {item.text}
          </Text>

          {/* Attachments */}
          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              {item.attachments.map((attachment) => (
                <TouchableOpacity
                  key={attachment.id}
                  style={[
                    styles.attachment,
                    isOwnMessage
                      ? styles.ownAttachment
                      : styles.otherAttachment,
                  ]}
                >
                  <Text style={styles.attachmentIcon}>
                    {attachment.type === "image" ? "🖼️" : "📎"}
                  </Text>
                  <Text
                    style={[
                      styles.attachmentName,
                      isOwnMessage
                        ? styles.ownAttachmentText
                        : styles.otherAttachmentText,
                    ]}
                    numberOfLines={1}
                  >
                    {attachment.fileName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Time */}
          <Text
            style={[
              styles.messageTime,
              isOwnMessage
                ? styles.ownMessageTime
                : styles.otherMessageTime,
            ]}
          >
            {formatMessageTime(new Date(item.createdAt.toMillis()))}
          </Text>
        </View>

        {/* Read status - Only for own messages */}
        {isOwnMessage && (
          <View style={styles.readStatus}>
            <Text style={styles.readStatusIcon}>
              {isRead ? "✓✓" : "✓"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (!selectedConversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      </SafeAreaView>
    );
  }

  const otherName =
    user?.id === selectedConversation.clientId
      ? selectedConversation.professionalName
      : selectedConversation.clientName;

  const otherAvatar =
    user?.id === selectedConversation.clientId
      ? selectedConversation.professionalAvatar
      : selectedConversation.clientAvatar;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Image
              source={{
                uri:
                  otherAvatar ||
                  "https://randomuser.me/api/portraits/men/1.jpg",
              }}
              style={styles.headerAvatar}
            />

            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{otherName}</Text>
              <Text style={styles.headerSubtitle}>
                {selectedConversation.businessName}
              </Text>
            </View>
          </View>

          {/* Menu */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowMenu(!showMenu)}
            >
              <MoreVertical size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Menu Dropdown */}
            {showMenu && (
              <View style={styles.menuDropdown}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    handleArchive();
                    setShowMenu(false);
                  }}
                >
                  <Archive size={16} color="#FFFFFF" />
                  <Text style={styles.menuItemText}>Archiver</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Messages List */}
        {messages.length === 0 ? (
          <View style={styles.emptyMessagesContainer}>
            <Text style={styles.emptyMessagesText}>
              Aucun message pour le moment
            </Text>
            <Text style={styles.emptyMessagesSubtext}>
              Commencez la conversation!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageBubble}
            contentContainerStyle={styles.messagesListContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputBox}>
            {/* Text Input */}
            <TextInput
              style={styles.textInput}
              placeholder="Écrire un message..."
              placeholderTextColor="#6B7280"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              editable={!isSending}
            />

            {/* Attachment Button */}
            <TouchableOpacity
              style={styles.attachButton}
              disabled={isSending}
              onPress={() => {
                showToast({
                  type: "info",
                  message: "Fonctionnalité à venir",
                  duration: 2000,
                });
              }}
            >
              <Paperclip size={18} color="#14B8A6" />
            </TouchableOpacity>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              isSending && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={isSending || !messageText.trim()}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ========== HELPERS ==========
function formatMessageTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F1F",
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#1F1F1F",
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    position: "relative",
  },
  menuButton: {
    padding: 8,
  },
  menuDropdown: {
    position: "absolute",
    right: 0,
    top: 40,
    backgroundColor: "#1F1F1F",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    minWidth: 150,
    zIndex: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  menuItemText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  messagesListContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexGrow: 1,
  },
  messageBubbleContainer: {
    flexDirection: "row",
    marginVertical: 8,
    alignItems: "flex-end",
  },
  ownMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#1F1F1F",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ownBubble: {
    backgroundColor: "#14B8A6",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#1F1F1F",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ownMessageText: {
    color: "#000000",
  },
  otherMessageText: {
    color: "#FFFFFF",
  },
  senderName: {
    fontSize: 11,
    color: "#A3A3A3",
    fontWeight: "600",
    marginBottom: 2,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  ownMessageTime: {
    color: "rgba(0, 0, 0, 0.6)",
  },
  otherMessageTime: {
    color: "#6B7280",
  },
  readStatus: {
    marginLeft: 4,
    marginRight: 0,
  },
  readStatusIcon: {
    fontSize: 10,
    color: "#6B7280",
  },
  attachmentsContainer: {
    marginTop: 8,
    gap: 6,
  },
  attachment: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  ownAttachment: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  otherAttachment: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  attachmentIcon: {
    fontSize: 14,
  },
  attachmentName: {
    fontSize: 11,
    flex: 1,
  },
  ownAttachmentText: {
    color: "#000000",
  },
  otherAttachmentText: {
    color: "#FFFFFF",
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyMessagesText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyMessagesSubtext: {
    fontSize: 12,
    color: "#6B7280",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#1F1F1F",
  },
  inputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#1F1F1F",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    paddingVertical: 8,
  },
  attachButton: {
    padding: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#14B8A6",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});