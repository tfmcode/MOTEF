// src/app/api/usuarios/[id]/route.ts
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
  sanitizeInteger,
} from "@/lib/security/sanitize";
import { securityLogger } from "@/lib/security/logger";

const UpdateUserSchema = z.object({
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
    .optional(),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional(),
  rol: z.enum(["admin", "cliente"], {
    errorMap: () => ({ message: "Rol inválido" }),
  }),
});

type UpdateUserBody = z.infer<typeof UpdateUserSchema>;

export const PUT = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["admin"],
    schema: UpdateUserSchema,
    rateLimit: apiRateLimit,
    allowedMethods: ["PUT"],
    maxBodySize: 2048,
  },
  async (req, { body, user, ip }) => {
    const { nombre, apellido, email, telefono, rol, password } =
      body as UpdateUserBody;

    const pathId = req.nextUrl.pathname.split("/").pop();
    const id = sanitizeInteger(pathId);

    if (!id) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    try {
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
        ? [nombre, apellido, email, telefono || null, rol, hashedPassword, id]
        : [nombre, apellido, email, telefono || null, rol, id];

      const { rows } = await pool.query(query, values);
      const actualizado = rows[0];

      if (!actualizado) {
        return NextResponse.json(
          { message: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      securityLogger.dataModification(
        user!.id,
        user!.email,
        "usuario",
        "UPDATE",
        actualizado.id,
        ip
      );

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
);

export const DELETE = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["admin"],
    rateLimit: apiRateLimit,
    allowedMethods: ["DELETE"],
  },
  async (req, { user, ip }) => {
    const pathId = req.nextUrl.pathname.split("/").pop();
    const id = sanitizeInteger(pathId);

    if (!id) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    try {
      const deleteQuery =
        "DELETE FROM usuario WHERE id = $1 RETURNING id, email";
      const { rows } = await pool.query(deleteQuery, [id]);

      if (rows.length === 0) {
        return NextResponse.json(
          { message: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      securityLogger.dataModification(
        user!.id,
        user!.email,
        "usuario",
        "DELETE",
        id,
        ip
      );

      console.log(`✅ Usuario eliminado: ${rows[0].email} (ID: ${id})`);

      return NextResponse.json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      return NextResponse.json(
        { message: "Error al eliminar usuario" },
        { status: 500 }
      );
    }
  }
);
