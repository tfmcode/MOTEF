import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";
import { createApiHandler } from "@/lib/security/apiValidation";
import { apiRateLimit } from "@/lib/security/rateLimit";
import { sanitizeInteger } from "@/lib/security/sanitize";
import { securityLogger } from "@/lib/security/logger";

const UpdateEstadoSchema = z.object({
  estado: z.enum([
    "pendiente",
    "procesando",
    "enviado",
    "entregado",
    "cancelado",
  ]),
});

type UpdateEstadoBody = z.infer<typeof UpdateEstadoSchema>;

export const GET = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["admin"],
    rateLimit: apiRateLimit,
    allowedMethods: ["GET"],
  },
  async (req) => {
    const pathId = req.nextUrl.pathname.split("/").pop();
    const pedidoId = sanitizeInteger(pathId);

    if (!pedidoId) {
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

      const pedidoResult = await pool.query(pedidoQuery, [pedidoId]);

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

      const itemsResult = await pool.query(itemsQuery, [pedidoId]);

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
);

export const PUT = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["admin"],
    schema: UpdateEstadoSchema,
    rateLimit: apiRateLimit,
    allowedMethods: ["PUT"],
    maxBodySize: 1024,
  },
  async (req, { body, user, ip }) => {
    const pathId = req.nextUrl.pathname.split("/").pop();
    const pedidoId = sanitizeInteger(pathId);

    if (!pedidoId) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const { estado } = body as UpdateEstadoBody;

    try {
      const checkQuery =
        "SELECT id, estado, numero_pedido FROM pedido WHERE id = $1";
      const checkResult = await pool.query(checkQuery, [pedidoId]);

      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { message: "Pedido no encontrado" },
          { status: 404 }
        );
      }

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

      const { rows } = await pool.query(updateQuery, [estado, pedidoId]);

      securityLogger.dataModification(
        user!.id,
        user!.email,
        "pedido",
        "UPDATE",
        pedidoId,
        ip
      );

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
);

export const DELETE = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["admin"],
    rateLimit: apiRateLimit,
    allowedMethods: ["DELETE"],
  },
  async (req, { user, ip }) => {
    const pathId = req.nextUrl.pathname.split("/").pop();
    const pedidoId = sanitizeInteger(pathId);

    if (!pedidoId) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const dbClient = await pool.connect();

    try {
      await dbClient.query("BEGIN");

      const checkQuery =
        "SELECT id, numero_pedido, estado FROM pedido WHERE id = $1 FOR UPDATE";
      const checkResult = await dbClient.query(checkQuery, [pedidoId]);

      if (checkResult.rows.length === 0) {
        await dbClient.query("ROLLBACK");
        return NextResponse.json(
          { message: "Pedido no encontrado" },
          { status: 404 }
        );
      }

      const pedido = checkResult.rows[0];

      if (!["pendiente", "cancelado"].includes(pedido.estado)) {
        await dbClient.query("ROLLBACK");
        return NextResponse.json(
          {
            message: "Solo se pueden eliminar pedidos pendientes o cancelados",
          },
          { status: 400 }
        );
      }

      const itemsQuery =
        "SELECT producto_id, cantidad FROM detalle_pedido WHERE pedido_id = $1";
      const itemsResult = await dbClient.query(itemsQuery, [pedidoId]);

      for (const item of itemsResult.rows) {
        await dbClient.query(
          "UPDATE producto SET stock = stock + $1 WHERE id = $2",
          [item.cantidad, item.producto_id]
        );
        console.log(
          `✅ Stock restaurado: producto ${item.producto_id} +${item.cantidad}`
        );
      }

      await dbClient.query("DELETE FROM detalle_pedido WHERE pedido_id = $1", [
        pedidoId,
      ]);
      await dbClient.query("DELETE FROM pedido WHERE id = $1", [pedidoId]);

      await dbClient.query("COMMIT");

      securityLogger.dataModification(
        user!.id,
        user!.email,
        "pedido",
        "DELETE",
        pedidoId,
        ip
      );

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
);
