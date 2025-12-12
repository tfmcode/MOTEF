import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const { id } = await context.params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  }

  try {
    const pedidoQuery = `
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
        p.fecha_pago,
        p.fecha_procesado,
        p.fecha_enviado,
        p.fecha_entregado,
        p.notas,
        d.nombre_contacto,
        d.telefono_contacto,
        d.direccion,
        d.ciudad,
        d.provincia,
        d.codigo_postal,
        d.referencias
      FROM pedido p
      LEFT JOIN direccion d ON p.direccion_id = d.id
      WHERE p.id = $1 AND p.usuario_id = $2;
    `;

    const pedidoResult = await pool.query(pedidoQuery, [Number(id), user.id]);

    if (pedidoResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    const pedido = pedidoResult.rows[0];

    const itemsQuery = `
      SELECT 
        dp.id,
        dp.producto_id,
        dp.nombre_producto,
        dp.sku,
        dp.cantidad,
        dp.precio_unitario,
        dp.subtotal,
        p.imagen_url,
        p.slug
      FROM detalle_pedido dp
      LEFT JOIN producto p ON dp.producto_id = p.id
      WHERE dp.pedido_id = $1
      ORDER BY dp.id;
    `;

    const itemsResult = await pool.query(itemsQuery, [Number(id)]);

    const response = {
      id: pedido.id,
      numero_pedido: pedido.numero_pedido,
      fecha_pedido: pedido.fecha_pedido,
      estado: pedido.estado,
      subtotal: parseFloat(pedido.subtotal),
      descuento: parseFloat(pedido.descuento),
      costo_envio: parseFloat(pedido.costo_envio),
      total: parseFloat(pedido.total),
      metodo_pago: pedido.metodo_pago,
      mercadopago_payment_id: pedido.mercadopago_payment_id,
      mercadopago_status: pedido.mercadopago_status,
      fecha_pago: pedido.fecha_pago,
      fecha_procesado: pedido.fecha_procesado,
      fecha_enviado: pedido.fecha_enviado,
      fecha_entregado: pedido.fecha_entregado,
      notas: pedido.notas,
      direccion: {
        nombre_contacto: pedido.nombre_contacto,
        telefono_contacto: pedido.telefono_contacto,
        direccion: pedido.direccion,
        ciudad: pedido.ciudad,
        provincia: pedido.provincia,
        codigo_postal: pedido.codigo_postal,
        referencias: pedido.referencias,
      },
      items: itemsResult.rows.map((item) => ({
        id: item.id,
        producto_id: item.producto_id,
        nombre_producto: item.nombre_producto,
        sku: item.sku,
        cantidad: parseInt(item.cantidad),
        precio_unitario: parseFloat(item.precio_unitario),
        subtotal: parseFloat(item.subtotal),
        imagen_url: item.imagen_url,
        slug: item.slug,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error al obtener pedido:", error);
    return NextResponse.json(
      { message: "Error al obtener pedido" },
      { status: 500 }
    );
  }
}
