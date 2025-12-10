// src/app/api/admin/pedidos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import pool from "@/lib/db";

/**
 * GET /api/admin/pedidos/[id]
 * Obtiene el detalle completo de un pedido
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

  const { id } = await context.params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  }

  try {
    // Query principal del pedido con dirección y usuario
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
        p.notas_admin,
        p.usuario_id,
        u.nombre || ' ' || u.apellido as usuario_nombre,
        u.email as usuario_email,
        d.nombre_contacto,
        d.telefono_contacto,
        d.direccion,
        d.ciudad,
        d.provincia,
        d.codigo_postal,
        d.referencias
      FROM pedido p
      LEFT JOIN usuario u ON p.usuario_id = u.id
      LEFT JOIN direccion d ON p.direccion_id = d.id
      WHERE p.id = $1;
    `;

    const pedidoResult = await pool.query(pedidoQuery, [Number(id)]);

    if (pedidoResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    const pedido = pedidoResult.rows[0];

    // Query para los items del pedido
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

    // Construir respuesta completa
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
      notas_admin: pedido.notas_admin,
      usuario_id: pedido.usuario_id,
      usuario_nombre: pedido.usuario_nombre,
      usuario_email: pedido.usuario_email,
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
    console.error("❌ Error al obtener detalle del pedido:", error);
    return NextResponse.json(
      { message: "Error al obtener detalle del pedido" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/pedidos/[id]
 * Actualiza el estado de un pedido
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

  const { id } = await context.params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { estado } = body;

    // Validar estado
    const estadosValidos = [
      "pendiente",
      "procesando",
      "enviado",
      "entregado",
      "cancelado",
    ];

    if (!estado || !estadosValidos.includes(estado)) {
      return NextResponse.json({ message: "Estado inválido" }, { status: 400 });
    }

    // Verificar que el pedido existe
    const checkQuery = "SELECT id, estado FROM pedido WHERE id = $1";
    const checkResult = await pool.query(checkQuery, [Number(id)]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar el pedido con fechas correspondientes
    const updateQuery = `
      UPDATE pedido
      SET 
        estado = $1,
        fecha_procesado = CASE 
          WHEN $1 = 'procesando' AND fecha_procesado IS NULL 
          THEN NOW() 
          ELSE fecha_procesado 
        END,
        fecha_enviado = CASE 
          WHEN $1 = 'enviado' AND fecha_enviado IS NULL 
          THEN NOW() 
          ELSE fecha_enviado 
        END,
        fecha_entregado = CASE 
          WHEN $1 = 'entregado' AND fecha_entregado IS NULL 
          THEN NOW() 
          ELSE fecha_entregado 
        END
      WHERE id = $2
      RETURNING id, numero_pedido, estado;
    `;

    const { rows } = await pool.query(updateQuery, [estado, Number(id)]);

    console.log(
      `✅ Pedido ${rows[0].numero_pedido} actualizado a estado: ${rows[0].estado}`
    );

    return NextResponse.json({
      success: true,
      message: "Estado actualizado correctamente",
      pedido: rows[0],
    });
  } catch (error) {
    console.error("❌ Error al actualizar estado del pedido:", error);
    return NextResponse.json(
      { message: "Error al actualizar estado del pedido" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/pedidos/[id]
 * Elimina un pedido (solo si está en estado pendiente o cancelado)
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

  const { id } = await context.params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  }

  const dbClient = await pool.connect();

  try {
    await dbClient.query("BEGIN");

    // Verificar que el pedido existe y su estado
    const checkQuery =
      "SELECT id, numero_pedido, estado FROM pedido WHERE id = $1 FOR UPDATE";
    const checkResult = await dbClient.query(checkQuery, [Number(id)]);

    if (checkResult.rows.length === 0) {
      await dbClient.query("ROLLBACK");
      return NextResponse.json(
        { message: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    const pedido = checkResult.rows[0];

    // Solo permitir eliminar pedidos pendientes o cancelados
    if (!["pendiente", "cancelado"].includes(pedido.estado)) {
      await dbClient.query("ROLLBACK");
      return NextResponse.json(
        {
          message: "Solo se pueden eliminar pedidos pendientes o cancelados",
        },
        { status: 400 }
      );
    }

    // Restaurar stock de los productos
    const itemsQuery =
      "SELECT producto_id, cantidad FROM detalle_pedido WHERE pedido_id = $1";
    const itemsResult = await dbClient.query(itemsQuery, [Number(id)]);

    for (const item of itemsResult.rows) {
      await dbClient.query(
        "UPDATE producto SET stock = stock + $1 WHERE id = $2",
        [item.cantidad, item.producto_id]
      );
      console.log(
        `✅ Stock restaurado: producto ${item.producto_id} +${item.cantidad}`
      );
    }

    // Eliminar detalles del pedido
    await dbClient.query("DELETE FROM detalle_pedido WHERE pedido_id = $1", [
      Number(id),
    ]);

    // Eliminar el pedido
    await dbClient.query("DELETE FROM pedido WHERE id = $1", [Number(id)]);

    await dbClient.query("COMMIT");

    console.log(`✅ Pedido ${pedido.numero_pedido} eliminado completamente`);

    return NextResponse.json({
      success: true,
      message: "Pedido eliminado correctamente",
    });
  } catch (error) {
    await dbClient.query("ROLLBACK");
    console.error("❌ Error al eliminar pedido:", error);
    return NextResponse.json(
      { message: "Error al eliminar pedido" },
      { status: 500 }
    );
  } finally {
    dbClient.release();
  }
}
