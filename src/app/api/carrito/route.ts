// GET /api/carrito - Obtener carrito del usuario
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "cliente") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

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

    const { rows } = await pool.query(query, [user.id]);

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

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "cliente") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { producto_id, cantidad = 1 } = await req.json();

    // ✅ Lock del producto para evitar race conditions
    const productoQuery = await client.query(
      "SELECT stock, activo, precio FROM producto WHERE id = $1 FOR UPDATE",
      [producto_id]
    );

    if (productoQuery.rows.length === 0) {
      throw new Error("Producto no encontrado");
    }

    const producto = productoQuery.rows[0];

    if (!producto.activo) {
      throw new Error("Producto no disponible");
    }

    // Verificar cantidad actual en carrito
    const carritoActual = await client.query(
      "SELECT cantidad FROM carrito WHERE usuario_id = $1 AND producto_id = $2",
      [user.id, producto_id]
    );

    const cantidadActual = carritoActual.rows[0]?.cantidad || 0;
    const cantidadTotal = cantidadActual + cantidad;

    if (producto.stock < cantidadTotal) {
      throw new Error(`Solo hay ${producto.stock} unidades disponibles`);
    }

    // Insertar o actualizar
    const upsertQuery = `
      INSERT INTO carrito (usuario_id, producto_id, cantidad)
      VALUES ($1, $2, $3)
      ON CONFLICT (usuario_id, producto_id)
      DO UPDATE SET 
        cantidad = carrito.cantidad + EXCLUDED.cantidad,
        fecha_actualizacion = NOW()
      RETURNING id
    `;

    await client.query(upsertQuery, [user.id, producto_id, cantidad]);

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Producto agregado al carrito",
      cantidad_total: cantidadTotal,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error al agregar al carrito:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error al agregar al carrito",
      },
      { status: 400 }
    );
  } finally {
    client.release();
  }
}
// DELETE /api/carrito - Vaciar carrito
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "cliente") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    await pool.query("DELETE FROM carrito WHERE usuario_id = $1", [user.id]);
    return NextResponse.json({ message: "Carrito vaciado" });
  } catch (error) {
    console.error("❌ Error al vaciar carrito:", error);
    return NextResponse.json(
      { message: "Error al vaciar carrito" },
      { status: 500 }
    );
  }
}
