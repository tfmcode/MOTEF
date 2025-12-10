// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // ✅ Obtener token de las cookies
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 });
    }

    // ✅ Verificar token
    const payload = verifyJwt(token);

    if (!payload) {
      return NextResponse.json(
        { mensaje: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    // ✅ Obtener datos actualizados del usuario
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

    const { rows } = await pool.query(query, [payload.id]);
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
