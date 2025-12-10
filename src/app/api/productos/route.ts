// src/app/api/productos/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";

// ✅ Forzar comportamiento dinámico
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ✅ Headers consistentes para evitar cache
const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
} as const;

// ✅ Schema de validación con Zod
const ProductoQuerySchema = z.object({
  categoria: z.string().max(100).optional(),
  busqueda: z.string().max(200).optional(),
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
  limit: z.coerce.number().min(1).max(100).optional(),
  page: z.coerce.number().min(1).max(1000).optional(),
});

// ✅ Tipos
type ProductoQuery = z.infer<typeof ProductoQuerySchema>;
type OrderByClause =
  | "p.fecha_creacion DESC"
  | "p.precio ASC"
  | "p.precio DESC"
  | "p.nombre ASC"
  | "p.nombre DESC"
  | "p.ventas DESC";

// ✅ FIX: Tipo específico para valores de query (reemplaza any[])
type QueryValue = string | number;

/**
 * GET /api/productos
 *
 * Obtiene listado de productos con filtros opcionales
 *
 * Query Params:
 * - categoria: slug de la categoría
 * - busqueda: término de búsqueda
 * - precioMin: precio mínimo
 * - precioMax: precio máximo
 * - soloStock: "true" para solo productos en stock
 * - destacado: "true" para solo destacados
 * - ordenar: reciente|precio_asc|precio_desc|nombre_asc|nombre_desc|popular
 * - limit: cantidad de resultados (1-100)
 * - page: número de página
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const requestId = `req_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    console.log(`🔍 [${requestId}] GET /api/productos - Iniciando request`);

    // ✅ Validar query params
    const rawParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const validationResult = ProductoQuerySchema.safeParse(rawParams);

    if (!validationResult.success) {
      console.warn(
        `⚠️ [${requestId}] Validación fallida:`,
        validationResult.error.format()
      );
      return NextResponse.json(
        {
          success: false,
          message: "Parámetros de búsqueda inválidos",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const params: ProductoQuery = validationResult.data;
    console.log(`📋 [${requestId}] Parámetros validados:`, params);

    // ✅ FIX: Cambiado de any[] a QueryValue[]
    const queryValues: QueryValue[] = [];
    let paramIndex = 1;

    // Query base con todos los campos necesarios
    let query = `
      SELECT 
        p.id,
        p.nombre,
        p.slug,
        p.descripcion,
        p.descripcion_corta,
        p.precio,
        p.precio_anterior,
        p.stock,
        p.categoria_id,
        p.imagen_url,
        p.imagenes_adicionales,
        p.sku,
        p.peso_gramos,
        p.destacado,
        p.activo,
        p.fecha_creacion,
        p.fecha_actualizacion,
        p.vistas,
        p.ventas,
        c.id as cat_id,
        c.nombre as cat_nombre,
        c.slug as cat_slug
      FROM producto p
      LEFT JOIN categoria c ON p.categoria_id = c.id
      WHERE p.activo = true
    `;

    // ✅ Aplicar filtros de forma segura
    if (params.categoria) {
      query += ` AND c.slug = $${paramIndex}`;
      queryValues.push(params.categoria);
      paramIndex++;
    }

    if (params.busqueda && params.busqueda.trim()) {
      const searchTerm = `%${params.busqueda.trim()}%`;
      query += ` AND (
        p.nombre ILIKE $${paramIndex} OR 
        p.descripcion ILIKE $${paramIndex} OR
        p.descripcion_corta ILIKE $${paramIndex} OR
        p.sku ILIKE $${paramIndex}
      )`;
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

    // ✅ Ordenamiento seguro (sin inyección SQL)
    const orderByMap: Record<string, OrderByClause> = {
      precio_asc: "p.precio ASC",
      precio_desc: "p.precio DESC",
      nombre_asc: "p.nombre ASC",
      nombre_desc: "p.nombre DESC",
      popular: "p.ventas DESC",
      reciente: "p.fecha_creacion DESC",
    };

    const orderBy = orderByMap[params.ordenar || "reciente"];
    query += ` ORDER BY ${orderBy}, p.id DESC`;

    // ✅ Paginación
    if (params.limit) {
      query += ` LIMIT $${paramIndex}`;
      queryValues.push(params.limit);
      paramIndex++;
    }

    if (params.page && params.limit) {
      const offset = (params.page - 1) * params.limit;
      query += ` OFFSET $${paramIndex}`;
      queryValues.push(offset);
      paramIndex++;
    }

    // ✅ Ejecutar query
    console.log(`🔄 [${requestId}] Ejecutando query en DB...`);
    const startTime = Date.now();

    const { rows } = await pool.query(query, queryValues);

    const duration = Date.now() - startTime;
    console.log(
      `✅ [${requestId}] Query ejecutada en ${duration}ms - ${rows.length} resultados`
    );

    // ✅ Transformar resultados
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
        ? {
            id: row.cat_id,
            nombre: row.cat_nombre,
            slug: row.cat_slug,
          }
        : null,
    }));

    // ✅ Respuesta estructurada
    const response = {
      success: true,
      data: productos,
      meta: {
        count: productos.length,
        page: params.page || 1,
        limit: params.limit || productos.length,
        filters_applied: {
          categoria: params.categoria || null,
          busqueda: params.busqueda || null,
          precio_min: params.precioMin || null,
          precio_max: params.precioMax || null,
          solo_stock: params.soloStock === "true",
          destacado: params.destacado === "true",
          orden: params.ordenar || "reciente",
        },
      },
      timestamp: new Date().toISOString(),
      request_id: requestId,
    };

    console.log(`✅ [${requestId}] Respuesta exitosa enviada`);

    return NextResponse.json(response, {
      status: 200,
      headers: NO_CACHE_HEADERS,
    });
  } catch (error) {
    // ✅ Manejo robusto de errores
    console.error(`❌ [${requestId}] Error en GET /api/productos:`, error);

    // Determinar tipo de error
    const isDatabaseError =
      error instanceof Error &&
      (error.message.includes("connection") ||
        error.message.includes("database"));

    const errorResponse = {
      success: false,
      message: isDatabaseError
        ? "Error de conexión con la base de datos"
        : "Error interno al obtener productos",
      error:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : String(error)
          : undefined,
      request_id: requestId,
      timestamp: new Date().toISOString(),
    };

    const statusCode = isDatabaseError ? 503 : 500;

    return NextResponse.json(errorResponse, {
      status: statusCode,
      headers: NO_CACHE_HEADERS,
    });
  }
}
