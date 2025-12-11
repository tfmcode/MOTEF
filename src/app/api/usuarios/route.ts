import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import { z } from "zod";
import { createApiHandler } from "@/lib/security/apiValidation";
import { apiRateLimit } from "@/lib/security/rateLimit";
import {
  sanitizeEmail,
  sanitizeString,
  sanitizePhoneNumber,
} from "@/lib/security/sanitize";
import { securityLogger } from "@/lib/security/logger";

const CreateUserSchema = z.object({
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
    .transform(sanitizePhoneNumber),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(["admin", "cliente"], {
    errorMap: () => ({ message: "Rol inválido" }),
  }),
});

type CreateUserBody = z.infer<typeof CreateUserSchema>;

export const GET = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["admin"],
    rateLimit: apiRateLimit,
    allowedMethods: ["GET"],
  },
  async () => {
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
);

export const POST = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["admin"],
    schema: CreateUserSchema,
    rateLimit: apiRateLimit,
    allowedMethods: ["POST"],
    maxBodySize: 2048,
  },
  async (req, { body, user, ip }) => {
    const { email, nombre, apellido, telefono, password, rol } =
      body as CreateUserBody;

    try {
      const existeQuery = "SELECT id FROM usuario WHERE email = $1";
      const existeResult = await pool.query(existeQuery, [email]);

      if (existeResult.rows.length > 0) {
        return NextResponse.json(
          { message: "Email ya registrado" },
          { status: 400 }
        );
      }

      const hashed = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO usuario (nombre, apellido, email, telefono, password, rol, activo, email_verificado)
        VALUES ($1, $2, $3, $4, $5, $6, true, false)
        RETURNING id, nombre, apellido, email, telefono, rol, activo, email_verificado, fecha_registro
      `;
      const values = [nombre, apellido, email, telefono, hashed, rol];

      const { rows } = await pool.query(insertQuery, values);
      const nuevoUsuario = rows[0];

      securityLogger.dataModification(
        user!.id,
        user!.email,
        "usuario",
        "CREATE",
        nuevoUsuario.id,
        ip
      );

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
);
