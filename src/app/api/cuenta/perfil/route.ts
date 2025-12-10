// src/app/api/cuenta/perfil/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function PUT(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "cliente") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { nombre, apellido, telefono, password } = body;

    if (!nombre || !apellido) {
      return NextResponse.json(
        { message: "Nombre y apellido son obligatorios" },
        { status: 400 }
      );
    }

    let hashedPassword;
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json(
          { message: "La contraseña debe tener al menos 6 caracteres" },
          { status: 400 }
        );
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const query = `
      UPDATE usuario
      SET 
        nombre = $1, 
        apellido = $2, 
        telefono = $3
        ${hashedPassword ? ", password = $4" : ""}
      WHERE id = $${hashedPassword ? 5 : 4}
      RETURNING id, nombre, apellido, email, telefono, rol, activo, email_verificado, fecha_registro
    `;

    const values = hashedPassword
      ? [
          nombre.trim(),
          apellido.trim(),
          telefono?.trim() || null,
          hashedPassword,
          user.id,
        ]
      : [nombre.trim(), apellido.trim(), telefono?.trim() || null, user.id];

    const { rows } = await pool.query(query, values);
    const actualizado = rows[0];

    if (!actualizado) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    console.log(`✅ Cliente actualizó su perfil: ${actualizado.email}`);

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado correctamente",
      usuario: actualizado,
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json(
      { message: "Error al actualizar perfil" },
      { status: 500 }
    );
  }
}
