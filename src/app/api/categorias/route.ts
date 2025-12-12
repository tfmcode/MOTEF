import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
} as const;

const CategoriaQuerySchema = z.object({
  includeCount: z.enum(["true", "false"]).optional().default("true"),
  includeSubcategorias: z.enum(["true", "false"]).optional().default("true"),
  soloActivas: z.enum(["true", "false"]).optional().default("true"),
});

type CategoriaQuery = z.infer<typeof CategoriaQuerySchema>;

interface CategoriaRow {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  parent_id: number | null;
  imagen_url: string | null;
  orden: number;
  activo: boolean;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  productos_count?: string;
}

interface CategoriaResponse {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  parent_id: number | null;
  imagen_url: string | null;
  orden: number;
  activo: boolean;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  productos_count?: number;
  subcategorias: CategoriaResponse[];
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const requestId = `req_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    console.log(`🔍 [${requestId}] GET /api/categorias - Iniciando request`);

    const rawParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const validationResult = CategoriaQuerySchema.safeParse(rawParams);

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

    const params: CategoriaQuery = validationResult.data;
    const includeCount = params.includeCount === "true";
    const soloActivas = params.soloActivas === "true";

    console.log(`📋 [${requestId}] Parámetros validados:`, params);

    let query = `
      SELECT 
        c.id,
        c.nombre,
        c.slug,
        c.descripcion,
        c.parent_id,
        c.imagen_url,
        c.orden,
        c.activo,
        c.fecha_creacion,
        c.fecha_actualizacion
    `;

    if (includeCount) {
      query += `,
        COUNT(DISTINCT p.id) FILTER (WHERE p.activo = true) as productos_count
      `;
    }

    query += `
      FROM categoria c
    `;

    if (includeCount) {
      query += `
        LEFT JOIN producto p ON c.id = p.categoria_id
      `;
    }

    if (soloActivas) {
      query += `
        WHERE c.activo = true
      `;
    }

    query += `
      GROUP BY c.id, c.nombre, c.slug, c.descripcion, c.parent_id, 
               c.imagen_url, c.orden, c.activo, c.fecha_creacion, c.fecha_actualizacion
      ORDER BY c.orden ASC, c.nombre ASC
    `;

    console.log(`🔄 [${requestId}] Ejecutando query en DB...`);
    const startTime = Date.now();

    const { rows } = await pool.query<CategoriaRow>(query);

    const duration = Date.now() - startTime;
    console.log(
      `✅ [${requestId}] Query ejecutada en ${duration}ms - ${rows.length} categorías`
    );

    const categoriasMap = new Map<number, CategoriaResponse>();
    const categoriasPrincipales: CategoriaResponse[] = [];

    rows.forEach((row) => {
      const categoria: CategoriaResponse = {
        id: row.id,
        nombre: row.nombre,
        slug: row.slug,
        descripcion: row.descripcion,
        parent_id: row.parent_id,
        imagen_url: row.imagen_url,
        orden: row.orden,
        activo: row.activo,
        fecha_creacion: row.fecha_creacion,
        fecha_actualizacion: row.fecha_actualizacion,
        ...(includeCount && {
          productos_count: parseInt(row.productos_count || "0"),
        }),
        subcategorias: [],
      };

      categoriasMap.set(row.id, categoria);
    });

    if (params.includeSubcategorias === "true") {
      rows.forEach((row) => {
        const categoria = categoriasMap.get(row.id);
        if (!categoria) return;

        if (row.parent_id) {
          const padre = categoriasMap.get(row.parent_id);
          if (padre) {
            padre.subcategorias.push(categoria);
          } else {
            console.warn(
              `⚠️ [${requestId}] Categoría ${row.id} tiene parent_id ${row.parent_id} no encontrado`
            );
            categoriasPrincipales.push(categoria);
          }
        } else {
          categoriasPrincipales.push(categoria);
        }
      });
    } else {
      categoriasMap.forEach((cat) => categoriasPrincipales.push(cat));
    }

    const totalCategorias = rows.length;
    const categoriasConProductos = includeCount
      ? rows.filter((r) => parseInt(r.productos_count || "0") > 0).length
      : undefined;
    const totalProductos = includeCount
      ? rows.reduce((sum, r) => sum + parseInt(r.productos_count || "0"), 0)
      : undefined;

    const response = {
      success: true,
      data: categoriasPrincipales,
      meta: {
        total_categorias: totalCategorias,
        categorias_principales: categoriasPrincipales.length,
        ...(includeCount && {
          categorias_con_productos: categoriasConProductos,
          total_productos: totalProductos,
        }),
        jerarquia_incluida: params.includeSubcategorias === "true",
        solo_activas: soloActivas,
      },
      timestamp: new Date().toISOString(),
      request_id: requestId,
    };

    console.log(`✅ [${requestId}] Respuesta exitosa enviada`);
    console.log(
      `📊 [${requestId}] ${categoriasPrincipales.length} categorías principales`
    );

    return NextResponse.json(response, {
      status: 200,
      headers: NO_CACHE_HEADERS,
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Error en GET /api/categorias:`, error);

    const isDatabaseError =
      error instanceof Error &&
      (error.message.includes("connection") ||
        error.message.includes("database") ||
        error.message.includes("pool"));

    const isNetworkError =
      error instanceof Error &&
      (error.message.includes("ECONNREFUSED") ||
        error.message.includes("ETIMEDOUT"));

    let errorMessage = "Error interno al obtener categorías";
    let statusCode = 500;

    if (isDatabaseError || isNetworkError) {
      errorMessage = "Error de conexión con la base de datos";
      statusCode = 503;
    }

    const errorResponse = {
      success: false,
      message: errorMessage,
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
