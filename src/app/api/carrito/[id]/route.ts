// src/app/api/carrito/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";
import { createApiHandler } from "@/lib/security/apiValidation";
import { apiRateLimit } from "@/lib/security/rateLimit";
import { sanitizeInteger } from "@/lib/security/sanitize";

const UpdateCantidadSchema = z.object({
  cantidad: z.number().int().min(1).max(100),
});

type UpdateCantidadBody = z.infer<typeof UpdateCantidadSchema>;

export const PUT = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["cliente"],
    schema: UpdateCantidadSchema,
    rateLimit: apiRateLimit,
    allowedMethods: ["PUT"],
    maxBodySize: 1024,
  },
  async (req, { body, user }) => {
    const pathId = req.nextUrl.pathname.split("/").pop();
    const productoId = sanitizeInteger(pathId);

    if (!productoId) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const { cantidad } = body as UpdateCantidadBody;

    try {
      const checkQuery = `
        SELECT c.id as carrito_id, p.stock
        FROM carrito c
        INNER JOIN producto p ON c.producto_id = p.id
        WHERE c.producto_id = $1 AND c.usuario_id = $2
      `;

      const checkResult = await pool.query(checkQuery, [productoId, user!.id]);

      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { message: "Item no encontrado" },
          { status: 404 }
        );
      }

      const { stock } = checkResult.rows[0];

      if (stock < cantidad) {
        return NextResponse.json(
          { message: `Solo hay ${stock} unidades disponibles` },
          { status: 400 }
        );
      }

      await pool.query(
        "UPDATE carrito SET cantidad = $1, fecha_actualizacion = NOW() WHERE producto_id = $2 AND usuario_id = $3",
        [cantidad, productoId, user!.id]
      );

      console.log(
        `✅ Cantidad actualizada para producto ${productoId} del usuario ${
          user!.id
        }`
      );

      return NextResponse.json({ message: "Cantidad actualizada" });
    } catch (error) {
      console.error("❌ Error al actualizar carrito:", error);
      return NextResponse.json(
        { message: "Error al actualizar carrito" },
        { status: 500 }
      );
    }
  }
);

export const DELETE = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["cliente"],
    rateLimit: apiRateLimit,
    allowedMethods: ["DELETE"],
  },
  async (req, { user }) => {
    const pathId = req.nextUrl.pathname.split("/").pop();
    const productoId = sanitizeInteger(pathId);

    if (!productoId) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    try {
      const result = await pool.query(
        "DELETE FROM carrito WHERE producto_id = $1 AND usuario_id = $2 RETURNING id",
        [productoId, user!.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { message: "Item no encontrado" },
          { status: 404 }
        );
      }

      console.log(
        `✅ Producto ${productoId} eliminado del carrito del usuario ${
          user!.id
        }`
      );

      return NextResponse.json({ message: "Producto eliminado del carrito" });
    } catch (error) {
      console.error("❌ Error al eliminar del carrito:", error);
      return NextResponse.json(
        { message: "Error al eliminar del carrito" },
        { status: 500 }
      );
    }
  }
);
