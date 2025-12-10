// src/app/api/auth/registro/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import { z } from "zod";

// ✅ Schema de validación
const RegistroSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(8, "Teléfono inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validar datos
    const validationResult = RegistroSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          mensaje: "Datos inválidos",
          errores: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { nombre, apellido, email, telefono, password } =
      validationResult.data;

    // ✅ Verificar si el email ya existe
    const existeQuery = "SELECT id FROM usuario WHERE email = $1";
    const existeResult = await pool.query(existeQuery, [email.toLowerCase()]);

    if (existeResult.rows.length > 0) {
      return NextResponse.json(
        { mensaje: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // ✅ Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insertar nuevo usuario como CLIENTE
    const insertQuery = `
      INSERT INTO usuario (
        nombre, 
        apellido, 
        email, 
        telefono, 
        password, 
        rol,
        activo,
        email_verificado
      )
      VALUES ($1, $2, $3, $4, $5, 'cliente', true, false)
      RETURNING id, nombre, apellido, email, telefono, rol, activo, email_verificado, fecha_registro
    `;

    const insertResult = await pool.query(insertQuery, [
      nombre.trim(),
      apellido.trim(),
      email.toLowerCase().trim(),
      telefono.trim(),
      hashedPassword,
    ]);

    const nuevoUsuario = insertResult.rows[0];

    console.log(`✅ Cliente registrado: ${nombre} ${apellido} (${email})`);

    // 📧 TODO: Enviar email de bienvenida/verificación
    // await enviarEmailBienvenida(email, nombre);

    return NextResponse.json(
      {
        mensaje: "Cuenta creada exitosamente",
        usuario: {
          id: nuevoUsuario.id,
          nombre: nuevoUsuario.nombre,
          apellido: nuevoUsuario.apellido,
          email: nuevoUsuario.email,
          rol: nuevoUsuario.rol,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error en registro:", error);

    return NextResponse.json(
      { mensaje: "Error al crear la cuenta. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
