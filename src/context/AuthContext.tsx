"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// =====================================================
// TIPOS
// =====================================================

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol: "cliente" | "admin";
  activo: boolean;
  email_verificado: boolean;
  fecha_registro: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCliente: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  login: (user: User) => void;
}

// =====================================================
// CONTEXT
// =====================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // ✅ Determinar tipo de ruta
  const isAdminRoute = pathname.startsWith("/admin");
  const isCuentaRoute = pathname.startsWith("/cuenta");
  const isCheckoutRoute = pathname.startsWith("/checkout");
  const isAuthRoute = pathname === "/login" || pathname === "/registro";
  const isPrivateRoute = isAdminRoute || isCuentaRoute || isCheckoutRoute;

  // ✅ Valores computados
  const isAuthenticated = !!user;
  const isAdmin = user?.rol === "admin";
  const isCliente = user?.rol === "cliente";

  /**
   * Verificar autenticación del usuario
   */
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.usuario);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Error verificando auth:", error);
      setUser(null);
    } finally {
      setLoading(false);
      setHasCheckedAuth(true);
    }
  };

  /**
   * Refrescar datos del usuario actual
   */
  const refreshUser = async () => {
    await checkAuth();
  };

  /**
   * Login manual (llamar después de login exitoso)
   */
  const login = (userData: User) => {
    setUser(userData);
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("❌ Error en logout:", error);
    } finally {
      setUser(null);
      router.push("/");
      router.refresh();
    }
  };

  // ✅ Verificar auth al montar
  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuth();
    }
  }, [hasCheckedAuth]);

  // ✅ Protección de rutas
  useEffect(() => {
    if (loading || !hasCheckedAuth) return;

    // Redirigir si no está autenticado en ruta privada
    if (isPrivateRoute && !isAuthenticated) {
      console.log("🔒 Ruta privada sin auth, redirigiendo a /login");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Redirigir si está autenticado en página de login/registro
    if (isAuthRoute && isAuthenticated) {
      console.log("✅ Ya autenticado, redirigiendo...");
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/cuenta");
      }
      return;
    }

    // Verificar permisos de admin
    if (isAdminRoute && !isAdmin) {
      console.log("⛔ Acceso denegado a zona admin");
      router.push("/unauthorized");
      return;
    }

    // Verificar permisos de cliente
    if (isCuentaRoute && !isCliente) {
      console.log("⛔ Acceso denegado a cuenta de cliente");
      router.push("/unauthorized");
      return;
    }
  }, [
    loading,
    hasCheckedAuth,
    isAuthenticated,
    isPrivateRoute,
    isAuthRoute,
    isAdminRoute,
    isCuentaRoute,
    isAdmin,
    pathname,
    router,
  ]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isCliente,
    logout,
    checkAuth,
    refreshUser,
    login,
  };

  // ✅ Mostrar loading en rutas privadas
  if (loading && isPrivateRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =====================================================
// HOOK
// =====================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
