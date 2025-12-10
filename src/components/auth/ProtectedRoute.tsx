"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "cliente")[];
  requireAuth?: boolean;
};

const ProtectedRoute = ({
  children,
  allowedRoles,
  requireAuth = true,
}: Props) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Si requiere autenticación y no hay usuario
      if (requireAuth && !user) {
        router.push("/login");
        return;
      }

      // Si hay roles permitidos y el usuario no tiene el rol correcto
      if (user && allowedRoles && !allowedRoles.includes(user.rol)) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [user, loading, allowedRoles, requireAuth, router]);

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si requiere auth y no hay usuario, no mostrar nada (ya redirigió)
  if (requireAuth && !user) {
    return null;
  }

  // Si todo está OK, mostrar children
  return <>{children}</>;
};

export default ProtectedRoute;
