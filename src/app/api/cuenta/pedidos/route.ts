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
    const pedidosQuery = `
      SELECT 
        p.id,
        p.numero_pedido,
        p.fecha_pedido,
        p.estado,
        p.subtotal,
        p.descuento,
        p.costo_envio,
        p.total,
        COUNT(DISTINCT dp.id) as items_count,
        SUM(dp.cantidad) as productos_count
      FROM pedido p
      LEFT JOIN detalle_pedido dp ON p.id = dp.pedido_id
      WHERE p.usuario_id = $1
      GROUP BY p.id, p.numero_pedido, p.fecha_pedido, p.estado, 
               p.subtotal, p.descuento, p.costo_envio, p.total
      ORDER BY p.fecha_pedido DESC;
    `;

    const { rows } = await pool.query(pedidosQuery, [user.id]);

    const pedidos = rows.map((row) => ({
      id: row.id,
      numero_pedido: row.numero_pedido,
      fecha_pedido: row.fecha_pedido,
      estado: row.estado,
      subtotal: parseFloat(row.subtotal),
      descuento: parseFloat(row.descuento),
      costo_envio: parseFloat(row.costo_envio),
      total: parseFloat(row.total),
      items_count: parseInt(row.items_count) || 0,
      productos_count: parseInt(row.productos_count) || 0,
    }));

    return NextResponse.json({
      pedidos,
      total: pedidos.length,
    });
  } catch (error) {
    console.error("❌ Error al obtener pedidos del cliente:", error);
    return NextResponse.json(
      { message: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}
