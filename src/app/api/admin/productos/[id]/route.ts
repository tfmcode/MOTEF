import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";
import { createApiHandler } from "@/lib/security/apiValidation";
import { apiRateLimit } from "@/lib/security/rateLimit";
import { sanitizeString, sanitizeInteger } from "@/lib/security/sanitize";
import { securityLogger } from "@/lib/security/logger";
import { generarSlug } from "@/lib/slugify";

// Validador personalizado para URLs e imagen (acepta rutas relativas y URLs completas)
const imagenUrlSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true; // Permitir vacío
      // Acepta rutas relativas (/img/..., /uploads/...) o URLs completas
      return (
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://")
      );
    },
    { message: "URL de imagen inválida" }
  )
  .optional();

const UpdateProductoSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .transform(sanitizeString),
  descripcion: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeString(val) : undefined)),
  descripcion_corta: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeString(val) : undefined)),
  precio: z.number().positive("El precio debe ser positivo"),
  precio_anterior: z.number().positive().optional(),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  categoria_id: z.number().int().positive(),
  imagen_url: imagenUrlSchema,
  sku: z.string().min(1, "SKU es requerido").transform(sanitizeString),
  peso_gramos: z.number().int().positive().optional(),
  destacado: z.boolean(),
  activo: z.boolean(),
});

type UpdateProductoBody = z.infer<typeof UpdateProductoSchema>;

export const GET = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["admin"],
    rateLimit: apiRateLimit,
    allowedMethods: ["GET"],
  },
  async (req) => {
    const pathId = req.nextUrl.pathname.split("/").pop();
    const productoId = sanitizeInteger(pathId);

    if (!productoId) {
      return NextResponse.json(
        { message: "ID de producto inválido" },
        { status: 400 }
      );
    }

    try {
      const query = `
        SELECT 
          p.*,
          c.nombre as categoria_nombre,
          c.slug as categoria_slug
        FROM producto p
        LEFT JOIN categoria c ON p.categoria_id = c.id
        WHERE p.id = $1;
      `;

      const { rows } = await pool.query(query, [productoId]);

      if (rows.length === 0) {
        return NextResponse.json(
          { message: "Producto no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      console.error("❌ Error al obtener producto:", error);
      return NextResponse.json(
        { message: "Error al obtener producto" },
        { status: 500 }
      );
    }
  }
);

export const PUT = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["admin"],
    schema: UpdateProductoSchema,
    rateLimit: apiRateLimit,
    allowedMethods: ["PUT"],
    maxBodySize: 10240,
  },
  async (req, { body, user, ip }) => {
    const pathId = req.nextUrl.pathname.split("/").pop();
    const productoId = sanitizeInteger(pathId);

    if (!productoId) {
      return NextResponse.json(
        { message: "ID de producto inválido" },
        { status: 400 }
      );
    }

    const {
      nombre,
      descripcion,
      descripcion_corta,
      precio,
      precio_anterior,
      stock,
      categoria_id,
      imagen_url,
      sku,
      peso_gramos,
      destacado,
      activo,
    } = body as UpdateProductoBody;

    try {
      const checkQuery = "SELECT id FROM producto WHERE id = $1";
      const checkResult = await pool.query(checkQuery, [productoId]);

      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { message: "Producto no encontrado" },
          { status: 404 }
        );
      }

      const skuCheck = await pool.query(
        "SELECT id FROM producto WHERE sku = $1 AND id != $2",
        [sku, productoId]
      );

      if (skuCheck.rows.length > 0) {
        return NextResponse.json(
          { message: "El SKU ya existe en otro producto" },
          { status: 400 }
        );
      }

      const slug = generarSlug(nombre);

      const updateQuery = `
        UPDATE producto
        SET 
          nombre = $1,
          slug = $2,
          descripcion = $3,
          descripcion_corta = $4,
          precio = $5,
          precio_anterior = $6,
          stock = $7,
          categoria_id = $8,
          imagen_url = $9,
          sku = $10,
          peso_gramos = $11,
          destacado = $12,
          activo = $13,
          fecha_actualizacion = NOW()
        WHERE id = $14
        RETURNING *;
      `;

      const values = [
        nombre,
        slug,
        descripcion || null,
        descripcion_corta || null,
        precio,
        precio_anterior || null,
        stock,
        categoria_id,
        imagen_url || null,
        sku,
        peso_gramos || null,
        destacado,
        activo,
        productoId,
      ];

      const { rows } = await pool.query(updateQuery, values);

      securityLogger.dataModification(
        user!.id,
        user!.email,
        "producto",
        "UPDATE",
        rows[0].id,
        ip
      );

      console.log(
        `✅ Producto actualizado: ${rows[0].nombre} (ID: ${productoId})`
      );

      return NextResponse.json({
        success: true,
        data: rows[0],
        message: "Producto actualizado correctamente",
      });
    } catch (error) {
      console.error("❌ Error al actualizar producto:", error);
      return NextResponse.json(
        { message: "Error al actualizar producto" },
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
    const productoId = sanitizeInteger(pathId);

    if (!productoId) {
      return NextResponse.json(
        { message: "ID de producto inválido" },
        { status: 400 }
      );
    }

    try {
      const checkQuery = "SELECT id, nombre FROM producto WHERE id = $1";
      const checkResult = await pool.query(checkQuery, [productoId]);

      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { message: "Producto no encontrado" },
          { status: 404 }
        );
      }

      const productoNombre = checkResult.rows[0].nombre;

      const pedidosCheck = await pool.query(
        "SELECT COUNT(*) as count FROM detalle_pedido WHERE producto_id = $1",
        [productoId]
      );

      const tienePedidos = parseInt(pedidosCheck.rows[0].count) > 0;

      if (tienePedidos) {
        await pool.query(
          "UPDATE producto SET activo = false, fecha_actualizacion = NOW() WHERE id = $1",
          [productoId]
        );

        securityLogger.dataModification(
          user!.id,
          user!.email,
          "producto",
          "UPDATE",
          productoId,
          ip
        );

        console.log(
          `⚠️ Producto desactivado (tiene pedidos): ${productoNombre} (ID: ${productoId})`
        );

        return NextResponse.json({
          success: true,
          message:
            "El producto tiene pedidos asociados y fue desactivado en lugar de eliminarse",
          desactivado: true,
        });
      }

      const deleteQuery =
        "DELETE FROM producto WHERE id = $1 RETURNING id, nombre";
      const { rows } = await pool.query(deleteQuery, [productoId]);

      securityLogger.dataModification(
        user!.id,
        user!.email,
        "producto",
        "DELETE",
        productoId,
        ip
      );

      console.log(
        `✅ Producto eliminado: ${productoNombre} (ID: ${productoId})`
      );

      return NextResponse.json({
        success: true,
        message: "Producto eliminado correctamente",
        eliminado: true,
        producto: rows[0],
      });
    } catch (error) {
      console.error("❌ Error al eliminar producto:", error);
      return NextResponse.json(
        { message: "Error al eliminar producto" },
        { status: 500 }
      );
    }
  }
);
