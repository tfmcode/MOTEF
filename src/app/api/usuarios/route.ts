import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const tokenStore = await cookies();
  const token = tokenStore.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
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
      ORDER BY fecha_registro DESC
    `;
    const { rows } = await pool.query(query);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { message: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const tokenStore = await cookies();
  const token = tokenStore.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, nombre, apellido, telefono, password, rol } = body;

    // ✅ Validaciones
    if (!email || !nombre || !apellido || !password || !rol) {
      return NextResponse.json(
        { message: "Todos los campos son obligatorios" },
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

    // Verificar existencia del usuario
    const existeQuery = "SELECT id FROM usuario WHERE email = $1";
    const existeResult = await pool.query(existeQuery, [email.trim()]);

    if (existeResult.rows.length > 0) {
      return NextResponse.json(
        { message: "Email ya registrado" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    // ✅ Insertar usuario
    const insertQuery = `
      INSERT INTO usuario (nombre, apellido, email, telefono, password, rol, activo, email_verificado)
      VALUES ($1, $2, $3, $4, $5, $6, true, false)
      RETURNING id, nombre, apellido, email, telefono, rol, activo, email_verificado, fecha_registro
    `;
    const values = [
      nombre.trim(),
      apellido.trim(),
      email.trim(),
      telefono?.trim() || null,
      hashed,
      rol,
    ];

    const { rows } = await pool.query(insertQuery, values);
    const nuevoUsuario = rows[0];

    console.log(`✅ Usuario ${rol} creado: ${nuevoUsuario.email}`);

    return NextResponse.json(nuevoUsuario, { status: 201 });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { message: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
