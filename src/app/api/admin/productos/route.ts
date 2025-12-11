import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";
import { createApiHandler } from "@/lib/security/apiValidation";
import { apiRateLimit } from "@/lib/security/rateLimit";
import { sanitizeString } from "@/lib/security/sanitize";
import { securityLogger } from "@/lib/security/logger";
import { generarSlug } from "@/lib/slugify";

const CreateProductoSchema = z.object({
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
  imagen_url: z.string().url().optional(),
  sku: z.string().min(1, "SKU es requerido").transform(sanitizeString),
  peso_gramos: z.number().int().positive().optional(),
  destacado: z.boolean().default(false),
  activo: z.boolean().default(true),
});

type CreateProductoBody = z.infer<typeof CreateProductoSchema>;

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
          p.*,
          c.nombre as categoria_nombre,
          c.slug as categoria_slug
        FROM producto p
        LEFT JOIN categoria c ON p.categoria_id = c.id
        ORDER BY p.fecha_creacion DESC;
      `;

      const { rows } = await pool.query(query);

      return NextResponse.json({
        data: rows,
        total: rows.length,
      });
    } catch (error) {
      console.error("❌ Error al obtener productos:", error);
      return NextResponse.json(
        { message: "Error al obtener productos" },
        { status: 500 }
      );
    }
  }
);

export const POST = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["admin"],
    schema: CreateProductoSchema,
    rateLimit: apiRateLimit,
    allowedMethods: ["POST"],
    maxBodySize: 10240,
  },
  async (req, { body, user, ip }) => {
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
    } = body as CreateProductoBody;

    try {
      const skuCheck = await pool.query(
        "SELECT id FROM producto WHERE sku = $1",
        [sku]
      );

      if (skuCheck.rows.length > 0) {
        return NextResponse.json(
          { message: "El SKU ya existe" },
          { status: 400 }
        );
      }

      const slug = generarSlug(nombre);

      const insertQuery = `
        INSERT INTO producto (
          nombre, slug, descripcion, descripcion_corta, precio, precio_anterior,
          stock, categoria_id, imagen_url, sku, peso_gramos, destacado, activo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
      ];

      const { rows } = await pool.query(insertQuery, values);

      securityLogger.dataModification(
        user!.id,
        user!.email,
        "producto",
        "CREATE",
        rows[0].id,
        ip
      );

      console.log(`✅ Producto creado: ${rows[0].nombre} (ID: ${rows[0].id})`);

      return NextResponse.json(rows[0], { status: 201 });
    } catch (error) {
      console.error("❌ Error al crear producto:", error);
      return NextResponse.json(
        { message: "Error al crear producto" },
        { status: 500 }
      );
    }
  }
);
