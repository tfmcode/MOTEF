import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";
import { createApiHandler } from "@/lib/security/apiValidation";
import { apiRateLimit } from "@/lib/security/rateLimit";
import { sanitizeSlug } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SlugSchema = z
  .string()
  .min(1, "El slug no puede estar vacío")
  .max(255, "El slug es demasiado largo")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Formato de slug inválido")
  .transform(sanitizeSlug);

export const GET = createApiHandler(
  {
    requireAuth: false,
    rateLimit: apiRateLimit,
    allowedMethods: ["GET"],
  },
  async (req) => {
    try {
      const pathSlug = req.nextUrl.pathname.split("/").pop();
      const slugValidation = SlugSchema.safeParse(pathSlug);

      if (!slugValidation.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Formato de slug inválido",
            errors: slugValidation.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      const validSlug = slugValidation.data;

      const productoQuery = `
        SELECT 
          p.id, p.nombre, p.slug, p.descripcion, p.descripcion_corta,
          p.precio, p.precio_anterior, p.stock, p.categoria_id, p.imagen_url,
          p.imagenes_adicionales, p.sku, p.peso_gramos, p.destacado, p.activo,
          p.fecha_creacion, p.fecha_actualizacion, p.vistas, p.ventas,
          c.id as cat_id, c.nombre as cat_nombre, c.slug as cat_slug, c.descripcion as cat_descripcion
        FROM producto p
        LEFT JOIN categoria c ON p.categoria_id = c.id
        WHERE p.slug = $1 AND p.activo = true
        LIMIT 1
      `;

      const { rows, rowCount } = await pool.query(productoQuery, [validSlug]);

      if (rowCount === 0 || !rows[0]) {
        return NextResponse.json(
          {
            success: false,
            message: "Producto no encontrado",
            slug: validSlug,
          },
          { status: 404 }
        );
      }

      const row = rows[0];

      pool
        .query("UPDATE producto SET vistas = vistas + 1 WHERE id = $1", [
          row.id,
        ])
        .catch((error) => {
          console.error("⚠️ Error al incrementar vistas:", error);
        });

      const producto = {
        id: row.id,
        nombre: row.nombre,
        slug: row.slug,
        descripcion: row.descripcion,
        descripcion_corta: row.descripcion_corta,
        precio: parseFloat(row.precio),
        precio_anterior: row.precio_anterior
          ? parseFloat(row.precio_anterior)
          : null,
        stock: parseInt(row.stock),
        categoria_id: row.categoria_id,
        imagen_url: row.imagen_url,
        imagenes_adicionales: row.imagenes_adicionales || [],
        sku: row.sku,
        peso_gramos: row.peso_gramos,
        destacado: row.destacado,
        activo: row.activo,
        fecha_creacion: row.fecha_creacion,
        fecha_actualizacion: row.fecha_actualizacion,
        vistas: parseInt(row.vistas || 0) + 1,
        ventas: parseInt(row.ventas || 0),
        categoria: row.cat_id
          ? {
              id: row.cat_id,
              nombre: row.cat_nombre,
              slug: row.cat_slug,
              descripcion: row.cat_descripcion,
            }
          : null,
        estado_stock:
          row.stock === 0
            ? "sin_stock"
            : row.stock <= 5
            ? "stock_bajo"
            : "disponible",
        tiene_descuento:
          row.precio_anterior &&
          parseFloat(row.precio_anterior) > parseFloat(row.precio),
        porcentaje_descuento: row.precio_anterior
          ? Math.round(
              ((parseFloat(row.precio_anterior) - parseFloat(row.precio)) /
                parseFloat(row.precio_anterior)) *
                100
            )
          : 0,
      };

      return NextResponse.json({
        success: true,
        data: producto,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Error en GET /api/productos/[slug]:", error);
      return NextResponse.json(
        { success: false, message: "Error interno al obtener el producto" },
        { status: 500 }
      );
    }
  }
);
