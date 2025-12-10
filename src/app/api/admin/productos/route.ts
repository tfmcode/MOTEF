// src/app/api/admin/productos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import pool from "@/lib/db";

// Generar slug automático
function generarSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

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

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
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
      destacado = false,
      activo = true,
    } = body;

    // Validaciones
    if (!nombre || !sku || !precio || !categoria_id) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Verificar SKU único
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

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    return NextResponse.json(
      { message: "Error al crear producto" },
      { status: 500 }
    );
  }
}
