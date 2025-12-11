import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { createApiHandler } from "@/lib/security/apiValidation";
import { apiRateLimit } from "@/lib/security/rateLimit";

export const GET = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["admin"],
    rateLimit: apiRateLimit,
    allowedMethods: ["GET"],
  },
  async () => {
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
          p.metodo_pago,
          p.mercadopago_payment_id,
          p.mercadopago_status,
          p.usuario_id,
          u.nombre || ' ' || u.apellido as usuario_nombre,
          u.email as usuario_email,
          COUNT(DISTINCT dp.id) as items_count,
          SUM(dp.cantidad) as productos_count
        FROM pedido p
        LEFT JOIN usuario u ON p.usuario_id = u.id
        LEFT JOIN detalle_pedido dp ON p.id = dp.pedido_id
        GROUP BY p.id, p.numero_pedido, p.fecha_pedido, p.estado, 
                 p.subtotal, p.descuento, p.costo_envio, p.total, p.metodo_pago,
                 p.mercadopago_payment_id, p.mercadopago_status, p.usuario_id,
                 u.nombre, u.apellido, u.email
        ORDER BY p.fecha_pedido DESC;
      `;

      const { rows } = await pool.query(pedidosQuery);

      const pedidos = rows.map((row) => ({
        id: row.id,
        numero_pedido: row.numero_pedido,
        fecha_pedido: row.fecha_pedido,
        estado: row.estado,
        subtotal: parseFloat(row.subtotal),
        descuento: parseFloat(row.descuento),
        costo_envio: parseFloat(row.costo_envio),
        total: parseFloat(row.total),
        metodo_pago: row.metodo_pago,
        mercadopago_payment_id: row.mercadopago_payment_id,
        mercadopago_status: row.mercadopago_status,
        usuario_id: row.usuario_id,
        usuario_nombre: row.usuario_nombre,
        usuario_email: row.usuario_email,
        items_count: parseInt(row.items_count) || 0,
        productos_count: parseInt(row.productos_count) || 0,
      }));

      return NextResponse.json({
        pedidos,
        total: pedidos.length,
      });
    } catch (error) {
      console.error("❌ Error al obtener pedidos:", error);
      return NextResponse.json(
        { message: "Error al obtener pedidos" },
        { status: 500 }
      );
    }
  }
);
