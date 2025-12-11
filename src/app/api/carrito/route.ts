// src/app/api/carrito/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";
import { createApiHandler } from "@/lib/security/apiValidation";
import { apiRateLimit } from "@/lib/security/rateLimit";

const AddToCarritoSchema = z.object({
  producto_id: z.number().int().positive(),
  cantidad: z.number().int().min(1).max(100).default(1),
});

type AddToCarritoBody = z.infer<typeof AddToCarritoSchema>;

export const GET = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["cliente"],
    rateLimit: apiRateLimit,
    allowedMethods: ["GET"],
  },
  async (req, { user }) => {
    try {
      const query = `
        SELECT 
          c.id,
          c.cantidad,
          c.fecha_agregado,
          p.id as producto_id,
          p.nombre,
          p.slug,
          p.precio,
          p.precio_anterior,
          p.stock,
          p.imagen_url,
          p.sku,
          p.activo
        FROM carrito c
        INNER JOIN producto p ON c.producto_id = p.id
        WHERE c.usuario_id = $1 AND p.activo = true
        ORDER BY c.fecha_agregado DESC
      `;

      const { rows } = await pool.query(query, [user!.id]);

      const items = rows.map((row) => ({
        id: row.id,
        producto: {
          id: row.producto_id,
          nombre: row.nombre,
          slug: row.slug,
          precio: parseFloat(row.precio),
          precio_anterior: row.precio_anterior
            ? parseFloat(row.precio_anterior)
            : null,
          stock: parseInt(row.stock),
          imagen_url: row.imagen_url,
          sku: row.sku,
          activo: row.activo,
        },
        cantidad: parseInt(row.cantidad),
        fecha_agregado: row.fecha_agregado,
      }));

      return NextResponse.json({ items });
    } catch (error) {
      console.error("❌ Error al obtener carrito:", error);
      return NextResponse.json(
        { message: "Error al obtener carrito" },
        { status: 500 }
      );
    }
  }
);

export const POST = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["cliente"],
    schema: AddToCarritoSchema,
    rateLimit: apiRateLimit,
    allowedMethods: ["POST"],
    maxBodySize: 1024,
  },
  async (req, { body, user }) => {
    const { producto_id, cantidad } = body as AddToCarritoBody;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const productoQuery = await client.query(
        "SELECT stock, activo, precio FROM producto WHERE id = $1 FOR UPDATE",
        [producto_id]
      );

      if (productoQuery.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: "Producto no encontrado" },
          { status: 404 }
        );
      }

      const producto = productoQuery.rows[0];

      if (!producto.activo) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: "Producto no disponible" },
          { status: 400 }
        );
      }

      const carritoActual = await client.query(
        "SELECT cantidad FROM carrito WHERE usuario_id = $1 AND producto_id = $2",
        [user!.id, producto_id]
      );

      const cantidadActual = carritoActual.rows[0]?.cantidad || 0;
      const cantidadTotal = cantidadActual + cantidad;

      if (producto.stock < cantidadTotal) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: `Solo hay ${producto.stock} unidades disponibles` },
          { status: 400 }
        );
      }

      const upsertQuery = `
        INSERT INTO carrito (usuario_id, producto_id, cantidad)
        VALUES ($1, $2, $3)
        ON CONFLICT (usuario_id, producto_id)
        DO UPDATE SET 
          cantidad = carrito.cantidad + EXCLUDED.cantidad,
          fecha_actualizacion = NOW()
        RETURNING id
      `;

      await client.query(upsertQuery, [user!.id, producto_id, cantidad]);
      await client.query("COMMIT");

      console.log(
        `✅ Producto ${producto_id} agregado al carrito de usuario ${user!.id}`
      );

      return NextResponse.json({
        message: "Producto agregado al carrito",
        cantidad_total: cantidadTotal,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ Error al agregar al carrito:", error);
      return NextResponse.json(
        { message: "Error al agregar al carrito" },
        { status: 500 }
      );
    } finally {
      client.release();
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
    try {
      await pool.query("DELETE FROM carrito WHERE usuario_id = $1", [user!.id]);
      console.log(`✅ Carrito vaciado para usuario ${user!.id}`);
      return NextResponse.json({ message: "Carrito vaciado" });
    } catch (error) {
      console.error("❌ Error al vaciar carrito:", error);
      return NextResponse.json(
        { message: "Error al vaciar carrito" },
        { status: 500 }
      );
    }
  }
);
