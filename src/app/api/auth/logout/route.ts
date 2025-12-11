// src/app/api/auth/logout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/security/apiValidation";
import { apiRateLimit } from "@/lib/security/rateLimit";
import { securityLogger } from "@/lib/security/logger";

export const POST = createApiHandler(
  {
    requireAuth: false,
    rateLimit: apiRateLimit,
    allowedMethods: ["POST"],
  },
  async (req, { user, ip }) => {
    try {
      const cookieStore = await cookies();

      if (user) {
        securityLogger.logout(user.id, user.email, ip);
      }

      cookieStore.delete("token");

      console.log(`✅ Logout exitoso - ${user?.email || "Usuario anónimo"}`);

      return NextResponse.json(
        { mensaje: "Sesión cerrada exitosamente" },
        { status: 200 }
      );
    } catch (error) {
      console.error("❌ Error en logout:", error);
      return NextResponse.json(
        { mensaje: "Error al cerrar sesión" },
        { status: 500 }
      );
    }
  }
);
