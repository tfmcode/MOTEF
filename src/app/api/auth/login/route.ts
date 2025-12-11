// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { signJwt } from "@/lib/auth";
import pool from "@/lib/db";
import { z } from "zod";
import { createApiHandler } from "@/lib/security/apiValidation";
import { loginRateLimit } from "@/lib/security/rateLimit";
import { sanitizeEmail } from "@/lib/security/sanitize";
import { securityLogger } from "@/lib/security/logger";

const LoginSchema = z.object({
  email: z.string().email("Email inválido").transform(sanitizeEmail),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginBody = z.infer<typeof LoginSchema>;

export const POST = createApiHandler(
  {
    requireAuth: false,
    schema: LoginSchema,
    rateLimit: loginRateLimit,
    allowedMethods: ["POST"],
    maxBodySize: 1024,
  },
  async (req, { body, ip }) => {
    const userAgent = req.headers.get("user-agent") || "unknown";
    const { email, password } = body as LoginBody;

    try {
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

      const { rows } = await pool.query(query, [email]);
      const usuario = rows[0];

      if (!usuario || !usuario.password) {
        securityLogger.loginFailure(email, ip, "Usuario no encontrado");
        return NextResponse.json(
          { mensaje: "Email o contraseña incorrectos" },
          { status: 401 }
        );
      }

      if (!usuario.activo) {
        securityLogger.loginFailure(email, ip, "Cuenta deshabilitada");
        return NextResponse.json(
          { mensaje: "Tu cuenta está deshabilitada. Contactá soporte." },
          { status: 403 }
        );
      }

      const passwordValido = await bcrypt.compare(password, usuario.password);

      if (!passwordValido) {
        securityLogger.loginFailure(email, ip, "Contraseña incorrecta");
        return NextResponse.json(
          { mensaje: "Email o contraseña incorrectos" },
          { status: 401 }
        );
      }

      const token = signJwt({
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      });

      const cookieStore = await cookies();
      cookieStore.set("token", token, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 2,
        sameSite: "lax",
      });

      await pool.query(
        "UPDATE usuario SET ultima_sesion = NOW() WHERE id = $1",
        [usuario.id]
      );

      securityLogger.loginSuccess(usuario.id, email, ip, userAgent);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pass, ...usuarioSeguro } = usuario;

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
);
