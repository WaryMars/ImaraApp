// ========================================
// HOOK - useToast (Simple Toast Notifications)
// ========================================

import { useState, useCallback } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number; // en ms, défaut 3000
}

interface UseToastReturn {
  toasts: ToastMessage[];
  showToast: (options: Omit<ToastMessage, "id"> & { duration?: number }) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    ({
      type,
      message,
      duration = 3000,
    }: Omit<ToastMessage, "id"> & { duration?: number }) => {
      const id = `toast-${Date.now()}`;

      const newToast: ToastMessage = {
        id,
        type,
        message,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove après la durée
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      console.log(`🍞 [TOAST] ${type.toUpperCase()}: ${message}`);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    clearAll,
  };
}
