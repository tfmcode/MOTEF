// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { createApiHandler } from "@/lib/security/apiValidation";
import { apiRateLimit } from "@/lib/security/rateLimit";

export const GET = createApiHandler(
  {
    requireAuth: true,
    rateLimit: apiRateLimit,
    allowedMethods: ["GET"],
  },
  async (req, { user }) => {
    try {
      if (!user) {
        return NextResponse.json(
          { mensaje: "No autenticado" },
          { status: 401 }
        );
      }

      const query = `
        SELECT 
          id,
          nombre,
          apellido,
          email,
          telefono,
          rol,
          activo,
          email_verificado,
          fecha_registro,
          ultima_sesion
        FROM usuario
        WHERE id = $1 AND activo = true
      `;

      const { rows } = await pool.query(query, [user.id]);
      const usuario = rows[0];

      if (!usuario) {
        return NextResponse.json(
          { mensaje: "Usuario no encontrado o inactivo" },
          { status: 404 }
        );
      }

      console.log(`✅ Usuario verificado: ${usuario.email} (${usuario.rol})`);

      return NextResponse.json(
        {
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            telefono: usuario.telefono,
            rol: usuario.rol,
            activo: usuario.activo,
            email_verificado: usuario.email_verificado,
            fecha_registro: usuario.fecha_registro,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("❌ Error en /api/auth/me:", error);
      return NextResponse.json(
        { mensaje: "Error al obtener usuario" },
        { status: 500 }
      );
    }
  }
);
