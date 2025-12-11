import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";
import { createApiHandler } from "@/lib/security/apiValidation";
import { apiRateLimit } from "@/lib/security/rateLimit";
import { sanitizeString } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ProductoQuerySchema = z.object({
  categoria: z
    .string()
    .max(100)
    .optional()
    .transform((val) => (val ? sanitizeString(val) : undefined)),
  busqueda: z
    .string()
    .max(200)
    .optional()
    .transform((val) => (val ? sanitizeString(val) : undefined)),
  precioMin: z.coerce.number().min(0).max(999999).optional(),
  precioMax: z.coerce.number().min(0).max(999999).optional(),
  soloStock: z.enum(["true", "false"]).optional(),
  destacado: z.enum(["true", "false"]).optional(),
  ordenar: z
    .enum([
      "reciente",
      "precio_asc",
      "precio_desc",
      "nombre_asc",
      "nombre_desc",
      "popular",
    ])
    .optional()
    .default("reciente"),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  page: z.coerce.number().min(1).max(1000).optional().default(1),
});

type ProductoQuery = z.infer<typeof ProductoQuerySchema>;
type OrderByClause =
  | "p.fecha_creacion DESC"
  | "p.precio ASC"
  | "p.precio DESC"
  | "p.nombre ASC"
  | "p.nombre DESC"
  | "p.ventas DESC";
type QueryValue = string | number;

export const GET = createApiHandler(
  {
    requireAuth: false,
    rateLimit: apiRateLimit,
    allowedMethods: ["GET"],
  },
  async (req) => {
    try {
      const rawParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validationResult = ProductoQuerySchema.safeParse(rawParams);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Parámetros de búsqueda inválidos",
            errors: validationResult.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      const params: ProductoQuery = validationResult.data;
      const queryValues: QueryValue[] = [];
      let paramIndex = 1;

      let query = `
        SELECT 
          p.id, p.nombre, p.slug, p.descripcion, p.descripcion_corta,
          p.precio, p.precio_anterior, p.stock, p.categoria_id, p.imagen_url,
          p.imagenes_adicionales, p.sku, p.peso_gramos, p.destacado, p.activo,
          p.fecha_creacion, p.fecha_actualizacion, p.vistas, p.ventas,
          c.id as cat_id, c.nombre as cat_nombre, c.slug as cat_slug
        FROM producto p
        LEFT JOIN categoria c ON p.categoria_id = c.id
        WHERE p.activo = true
      `;

      if (params.categoria) {
        query += ` AND c.slug = $${paramIndex}`;
        queryValues.push(params.categoria);
        paramIndex++;
      }

      if (params.busqueda && params.busqueda.trim()) {
        const searchTerm = `%${params.busqueda.trim()}%`;
        query += ` AND (p.nombre ILIKE $${paramIndex} OR p.descripcion ILIKE $${paramIndex} OR p.descripcion_corta ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
        queryValues.push(searchTerm);
        paramIndex++;
      }

      if (params.precioMin !== undefined) {
        query += ` AND p.precio >= $${paramIndex}`;
        queryValues.push(params.precioMin);
        paramIndex++;
      }

      if (params.precioMax !== undefined) {
        query += ` AND p.precio <= $${paramIndex}`;
        queryValues.push(params.precioMax);
        paramIndex++;
      }

      if (params.soloStock === "true") {
        query += ` AND p.stock > 0`;
      }

      if (params.destacado === "true") {
        query += ` AND p.destacado = true`;
      }

      const orderByMap: Record<string, OrderByClause> = {
        precio_asc: "p.precio ASC",
        precio_desc: "p.precio DESC",
        nombre_asc: "p.nombre ASC",
        nombre_desc: "p.nombre DESC",
        popular: "p.ventas DESC",
        reciente: "p.fecha_creacion DESC",
      };

      const orderBy = orderByMap[params.ordenar];
      query += ` ORDER BY ${orderBy}, p.id DESC`;

      query += ` LIMIT $${paramIndex}`;
      queryValues.push(params.limit);
      paramIndex++;

      const offset = (params.page - 1) * params.limit;
      query += ` OFFSET $${paramIndex}`;
      queryValues.push(offset);

      const { rows } = await pool.query(query, queryValues);

      const productos = rows.map((row) => ({
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
        vistas: parseInt(row.vistas || 0),
        ventas: parseInt(row.ventas || 0),
        categoria: row.cat_id
          ? { id: row.cat_id, nombre: row.cat_nombre, slug: row.cat_slug }
          : null,
      }));

      return NextResponse.json({
        success: true,
        data: productos,
        meta: {
          count: productos.length,
          page: params.page,
          limit: params.limit,
          filters_applied: {
            categoria: params.categoria || null,
            busqueda: params.busqueda || null,
            precio_min: params.precioMin || null,
            precio_max: params.precioMax || null,
            solo_stock: params.soloStock === "true",
            destacado: params.destacado === "true",
            orden: params.ordenar,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Error en GET /api/productos:", error);
      return NextResponse.json(
        { success: false, message: "Error interno al obtener productos" },
        { status: 500 }
      );
    }
  }
);
