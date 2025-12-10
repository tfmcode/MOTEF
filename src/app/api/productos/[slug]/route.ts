// src/app/api/productos/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";

// ✅ Forzar comportamiento dinámico
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ✅ Headers consistentes
const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
} as const;

// ✅ Validación de slug
const SlugSchema = z
  .string()
  .min(1, "El slug no puede estar vacío")
  .max(255, "El slug es demasiado largo")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Formato de slug inválido");

/**
 * GET /api/productos/[slug]
 *
 * Obtiene un producto específico por su slug
 * Incrementa el contador de vistas automáticamente
 *
 * @param slug - Identificador único del producto en formato URL-friendly
 * @returns Producto completo con información de categoría
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const requestId = `req_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  let slug: string | undefined;

  try {
    // ✅ Obtener y validar slug
    const params = await context.params;
    slug = params.slug;

    console.log(
      `🔍 [${requestId}] GET /api/productos/${slug} - Iniciando request`
    );

    const slugValidation = SlugSchema.safeParse(slug);

    if (!slugValidation.success) {
      console.warn(
        `⚠️ [${requestId}] Slug inválido: "${slug}"`,
        slugValidation.error.format()
      );
      return NextResponse.json(
        {
          success: false,
          message: "Formato de slug inválido",
          errors: slugValidation.error.flatten().fieldErrors,
          slug: slug,
        },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const validSlug = slugValidation.data;

    // ✅ Query para obtener producto con toda su información
    const productoQuery = `
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
        c.slug as cat_slug,
        c.descripcion as cat_descripcion
      FROM producto p
      LEFT JOIN categoria c ON p.categoria_id = c.id
      WHERE p.slug = $1 AND p.activo = true
      LIMIT 1
    `;

    console.log(`🔄 [${requestId}] Ejecutando query para slug: "${validSlug}"`);
    const startTime = Date.now();

    const { rows, rowCount } = await pool.query(productoQuery, [validSlug]);

    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Query ejecutada en ${duration}ms`);

    // ✅ Verificar si existe el producto
    if (rowCount === 0 || !rows[0]) {
      console.log(`❌ [${requestId}] Producto no encontrado: "${validSlug}"`);
      return NextResponse.json(
        {
          success: false,
          message: "Producto no encontrado",
          slug: validSlug,
          timestamp: new Date().toISOString(),
        },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const row = rows[0];
    console.log(
      `✅ [${requestId}] Producto encontrado: "${row.nombre}" (ID: ${row.id})`
    );

    // ✅ Incrementar contador de vistas de forma asíncrona (no bloqueante)
    pool
      .query("UPDATE producto SET vistas = vistas + 1 WHERE id = $1", [row.id])
      .catch((error) => {
        console.error(`⚠️ [${requestId}] Error al incrementar vistas:`, error);
        // No fallar la request si falla el contador
      });

    // ✅ Construir respuesta estructurada
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
      vistas: parseInt(row.vistas || 0) + 1, // Incluir la vista actual
      ventas: parseInt(row.ventas || 0),
      categoria: row.cat_id
        ? {
            id: row.cat_id,
            nombre: row.cat_nombre,
            slug: row.cat_slug,
            descripcion: row.cat_descripcion,
          }
        : null,
      // ✅ Información adicional útil
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

    const response = {
      success: true,
      data: producto,
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
    console.error(
      `❌ [${requestId}] Error en GET /api/productos/${slug}:`,
      error
    );

    // Determinar tipo de error
    const isDatabaseError =
      error instanceof Error &&
      (error.message.includes("connection") ||
        error.message.includes("database") ||
        error.message.includes("pool"));

    const isNetworkError =
      error instanceof Error &&
      (error.message.includes("ECONNREFUSED") ||
        error.message.includes("ETIMEDOUT"));

    let errorMessage = "Error interno al obtener el producto";
    let statusCode = 500;

    if (isDatabaseError || isNetworkError) {
      errorMessage = "Error de conexión con la base de datos";
      statusCode = 503;
    }

    const errorResponse = {
      success: false,
      message: errorMessage,
      slug: slug || "unknown",
      error:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? {
                message: error.message,
                name: error.name,
                stack: error.stack,
              }
            : String(error)
          : undefined,
      request_id: requestId,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, {
      status: statusCode,
      headers: NO_CACHE_HEADERS,
    });
  }
}
