// ========================================
// COMPOSANT - ToastContainer (Affichage Toast)
// ========================================

import React from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";
import { ToastMessage } from "@/hooks/useToast";

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const TOAST_COLORS = {
  success: { bg: "#10B981", icon: "✅" },
  error: { bg: "#EF4444", icon: "❌" },
  info: { bg: "#3B82F6", icon: "ℹ️" },
  warning: { bg: "#F59E0B", icon: "⚠️" },
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <View style={styles.container}>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          index={index}
        />
      ))}
    </View>
  );
};

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
  index: number;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove, index }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const color = TOAST_COLORS[toast.type];

  const handleClose = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onRemove(toast.id);
    });
  };

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  const opacity = animatedValue;

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          transform: [{ translateY }],
          opacity,
          top: index * 80,
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: color.bg }]}>
        <View style={styles.content}>
          <Text style={styles.icon}>{color.icon}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.message} numberOfLines={2}>
              {toast.message}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <X size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toastWrapper: {
    marginBottom: 8,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  closeBtn: {
    padding: 4,
  },
});
