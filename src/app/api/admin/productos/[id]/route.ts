// src/app/api/admin/productos/[id]/route.ts
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

/**
 * PUT /api/admin/productos/[id]
 * Actualiza un producto existente
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const productoId = parseInt(id);

    if (isNaN(productoId)) {
      return NextResponse.json(
        { message: "ID de producto inválido" },
        { status: 400 }
      );
    }

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
      destacado,
      activo,
    } = body;

    // Validaciones
    if (!nombre || !sku || !precio || !categoria_id) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const checkQuery = "SELECT id FROM producto WHERE id = $1";
    const checkResult = await pool.query(checkQuery, [productoId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar SKU único (excluyendo el producto actual)
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

/**
 * DELETE /api/admin/productos/[id]
 * Elimina un producto
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const productoId = parseInt(id);

    if (isNaN(productoId)) {
      return NextResponse.json(
        { message: "ID de producto inválido" },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const checkQuery = "SELECT id, nombre FROM producto WHERE id = $1";
    const checkResult = await pool.query(checkQuery, [productoId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const productoNombre = checkResult.rows[0].nombre;

    // Verificar si el producto tiene pedidos asociados
    const pedidosCheck = await pool.query(
      "SELECT COUNT(*) as count FROM detalle_pedido WHERE producto_id = $1",
      [productoId]
    );

    const tienePedidos = parseInt(pedidosCheck.rows[0].count) > 0;

    if (tienePedidos) {
      // Si tiene pedidos, solo desactivar en lugar de eliminar
      await pool.query(
        "UPDATE producto SET activo = false, fecha_actualizacion = NOW() WHERE id = $1",
        [productoId]
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

    // Si no tiene pedidos, eliminar completamente
    const deleteQuery =
      "DELETE FROM producto WHERE id = $1 RETURNING id, nombre";
    const { rows } = await pool.query(deleteQuery, [productoId]);

    console.log(`✅ Producto eliminado: ${productoNombre} (ID: ${productoId})`);

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

/**
 * GET /api/admin/productos/[id]
 * Obtiene un producto por ID (opcional, para el admin)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const productoId = parseInt(id);

    if (isNaN(productoId)) {
      return NextResponse.json(
        { message: "ID de producto inválido" },
        { status: 400 }
      );
    }

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
