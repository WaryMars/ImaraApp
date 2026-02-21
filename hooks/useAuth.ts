// ========================================
// USE AUTH - Wrapper du AuthContext
// ========================================
// Hook custom pour utiliser l'authentification
// Encapsule le context et ajoute de la logique supplémentaire
// ========================================

import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

/**
 * Hook pour accéder au contexte d'authentification
 * Plus court que useContext(AuthContext)
 *
 * Usage:
 * const { user, signIn, signOut } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
