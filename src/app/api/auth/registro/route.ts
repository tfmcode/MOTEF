import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import { z } from "zod";
import { createApiHandler } from "@/lib/security/apiValidation";
import { registroRateLimit } from "@/lib/security/rateLimit";
import {
  sanitizeEmail,
  sanitizeString,
  sanitizePhoneNumber,
} from "@/lib/security/sanitize";
import { securityLogger } from "@/lib/security/logger";

const RegistroSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .transform(sanitizeString),
  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .transform(sanitizeString),
  email: z.string().email("Email inválido").transform(sanitizeEmail),
  telefono: z
    .string()
    .min(8, "Teléfono inválido")
    .transform(sanitizePhoneNumber)
    .optional()
    .or(z.literal("")),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type RegistroBody = z.infer<typeof RegistroSchema>;

export const POST = createApiHandler(
  {
    requireAuth: false,
    schema: RegistroSchema,
    rateLimit: registroRateLimit,
    allowedMethods: ["POST"],
    maxBodySize: 2048,
  },
  async (req, { body, ip }) => {
    const { nombre, apellido, email, telefono, password } =
      body as RegistroBody;

    try {
      const existeQuery = "SELECT id FROM usuario WHERE email = $1";
      const existeResult = await pool.query(existeQuery, [email]);

      if (existeResult.rows.length > 0) {
        securityLogger.suspiciousActivity(
          ip,
          `Intento de registro con email existente: ${email}`,
          req.headers.get("user-agent") || "unknown"
        );
        return NextResponse.json(
          { mensaje: "El email ya está registrado" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

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

      const finalTelefono = telefono?.trim() || null;

      const insertResult = await pool.query(insertQuery, [
        nombre,
        apellido,
        email,
        finalTelefono,
        hashedPassword,
      ]);

      const nuevoUsuario = insertResult.rows[0];

      console.log(`Cliente registrado: ${nombre} ${apellido} (${email})`);

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
      console.error("Error en registro:", error);
      return NextResponse.json(
        { mensaje: "Error al crear la cuenta. Intentá de nuevo." },
        { status: 500 }
      );
    }
  }
);
