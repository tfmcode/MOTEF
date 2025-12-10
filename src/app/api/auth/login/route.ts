// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { signJwt } from "@/lib/auth";
import pool from "@/lib/db";
import { z } from "zod";

// ✅ Schema de validación
const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validar datos
    const validationResult = LoginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          mensaje: "Datos inválidos",
          errores: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // ✅ Buscar usuario por email
    const query = `
      SELECT 
        id, 
        nombre, 
        apellido, 
        email, 
        telefono, 
        password, 
        rol, 
        activo, 
        email_verificado, 
        fecha_registro
      FROM usuario 
      WHERE email = $1
    `;

    const { rows } = await pool.query(query, [email.toLowerCase()]);
    const usuario = rows[0];

    // ✅ Verificar que existe el usuario
    if (!usuario || !usuario.password) {
      return NextResponse.json(
        { mensaje: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // ✅ Verificar que el usuario está activo
    if (!usuario.activo) {
      return NextResponse.json(
        { mensaje: "Tu cuenta está deshabilitada. Contactá soporte." },
        { status: 403 }
      );
    }

    // ✅ Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return NextResponse.json(
        { mensaje: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // ✅ Generar JWT token
    const token = signJwt({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    // ✅ Guardar cookie HttpOnly
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 2, // 2 horas
      sameSite: "lax",
    });

    // ✅ Actualizar última sesión
    await pool.query("UPDATE usuario SET ultima_sesion = NOW() WHERE id = $1", [
      usuario.id,
    ]);

    // ✅ Excluir password de la respuesta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...usuarioSeguro } = usuario;

    console.log(`✅ Login exitoso: ${usuario.email} (${usuario.rol})`);

    return NextResponse.json(
      {
        mensaje: "Login exitoso",
        usuario: usuarioSeguro,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error en login:", error);

    return NextResponse.json(
      { mensaje: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
