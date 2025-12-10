import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function PUT(req: NextRequest) {
  const tokenStore = await cookies();
  const token = tokenStore.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const id = req.nextUrl.pathname.split("/").pop();
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { nombre, apellido, email, telefono, rol, password } = body;

    // ✅ Validaciones
    if (!nombre || !apellido || !email || !rol) {
      return NextResponse.json(
        { message: "Nombre, apellido, email y rol son obligatorios" },
        { status: 400 }
      );
    }

    // ✅ Validar rol válido
    if (rol !== "admin" && rol !== "cliente") {
      return NextResponse.json(
        { message: "Rol inválido. Solo se permite 'admin' o 'cliente'" },
        { status: 400 }
      );
    }

    let hashedPassword;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const query = `
      UPDATE usuario
      SET 
        nombre = $1, 
        apellido = $2, 
        email = $3, 
        telefono = $4,
        rol = $5
        ${hashedPassword ? ", password = $6" : ""}
      WHERE id = $${hashedPassword ? 7 : 6}
      RETURNING id, nombre, apellido, email, telefono, rol, activo, email_verificado, fecha_registro
    `;

    const values = hashedPassword
      ? [
          nombre.trim(),
          apellido.trim(),
          email.trim(),
          telefono?.trim() || null,
          rol,
          hashedPassword,
          Number(id),
        ]
      : [
          nombre.trim(),
          apellido.trim(),
          email.trim(),
          telefono?.trim() || null,
          rol,
          Number(id),
        ];

    const { rows } = await pool.query(query, values);
    const actualizado = rows[0];

    if (!actualizado) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    console.log(
      `✅ Usuario actualizado: ${actualizado.email} (${actualizado.rol})`
    );

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { message: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const tokenStore = await cookies();
  const token = tokenStore.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const id = req.nextUrl.pathname.split("/").pop();
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  }

  try {
    const deleteQuery = "DELETE FROM usuario WHERE id = $1 RETURNING id";
    const { rows } = await pool.query(deleteQuery, [Number(id)]);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    console.log(`✅ Usuario eliminado: ID ${id}`);

    return NextResponse.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { message: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}
