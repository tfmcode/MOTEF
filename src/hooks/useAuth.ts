// src/hooks/useAuth.ts
import { useAuth as useAuthContext } from "@/context/AuthContext";

// ✅ Re-exportar el hook del contexto
export function useAuth() {
  return useAuthContext();
}

// ✅ También exportarlo como default por compatibilidad
export default useAuth;
