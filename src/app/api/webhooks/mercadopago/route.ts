import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { MercadoPagoConfig, Payment } from "mercadopago";
import {
  checkIdempotency,
  saveIdempotencyKey,
  generateWebhookKey,
} from "@/lib/idempotency";
import crypto from "crypto";

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const MP_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET;

const client = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN!,
});

const payment = new Payment(client);

function validateWebhookSignature(req: NextRequest): boolean {
  if (!MP_WEBHOOK_SECRET) {
    console.warn("⚠️ MERCADOPAGO_WEBHOOK_SECRET no configurado");
    return true;
  }

  const signature = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");

  if (!signature || !requestId) {
    console.error("❌ Headers de firma faltantes");
    return false;
  }

  const parts = signature.split(",");
  const ts = parts.find((p) => p.startsWith("ts="))?.split("=")[1];
  const hash = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

  if (!ts || !hash) {
    console.error("❌ Formato de firma inválido");
    return false;
  }

  const manifest = `id:${requestId};request-id:${requestId};ts:${ts};`;

  const hmac = crypto
    .createHmac("sha256", MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  const isValid = hmac === hash;

  if (!isValid) {
    console.error("❌ Firma inválida. Expected:", hmac, "Received:", hash);
  }

  return isValid;
}

export async function POST(req: NextRequest) {
  let dbClient = null;

  try {
    const bodyText = await req.text();

    if (!validateWebhookSignature(req)) {
      console.error("❌ Webhook rechazado: firma inválida");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(bodyText);

    console.log("📧 Webhook de Mercado Pago recibido:", {
      type: body.type,
      action: body.action,
      data: body.data,
    });

    if (body.type !== "payment") {
      console.log("ℹ️ Notificación ignorada, tipo:", body.type);
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;
    const action = body.action || "payment.updated";

    if (!paymentId) {
      console.error("❌ Payment ID no encontrado");
      return NextResponse.json(
        { error: "Payment ID missing" },
        { status: 400 }
      );
    }

    const idempotencyKey = generateWebhookKey(paymentId, action);
    const existingResponse = await checkIdempotency(idempotencyKey);

    if (existingResponse) {
      console.log(`♻️ Webhook duplicado: payment ${paymentId}`);
      return NextResponse.json(existingResponse.response);
    }

    const paymentInfo = await payment.get({ id: paymentId });

    console.log("💳 Información del pago:", {
      id: paymentInfo.id,
      status: paymentInfo.status,
      transaction_amount: paymentInfo.transaction_amount,
      external_reference: paymentInfo.external_reference,
    });

    const numeroPedido = paymentInfo.external_reference;

    if (!numeroPedido) {
      console.error("❌ External reference no encontrado");
      return NextResponse.json(
        { error: "External reference missing" },
        { status: 400 }
      );
    }

    dbClient = await pool.connect();
    await dbClient.query("BEGIN");

    const pedidoQuery = await dbClient.query(
      "SELECT id, estado, total FROM pedido WHERE numero_pedido = $1 FOR UPDATE",
      [numeroPedido]
    );

    if (pedidoQuery.rows.length === 0) {
      await dbClient.query("ROLLBACK");
      console.error("❌ Pedido no encontrado:", numeroPedido);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const pedido = pedidoQuery.rows[0];

    const montoPagado = parseFloat(String(paymentInfo.transaction_amount || 0));
    const totalPedido = parseFloat(pedido.total);
    const diferencia = Math.abs(montoPagado - totalPedido);

    if (diferencia > 1) {
      await dbClient.query("ROLLBACK");
      console.error(
        `❌ Monto no coincide: pagado ${montoPagado} vs pedido ${totalPedido}`
      );

      await pool.query(
        `UPDATE pedido SET 
          notas_admin = $1,
          mercadopago_payment_id = $2,
          mercadopago_status = $3
         WHERE id = $4`,
        [
          `⚠️ ALERTA: Monto pagado ($${montoPagado}) ≠ total ($${totalPedido})`,
          paymentInfo.id?.toString(),
          paymentInfo.status,
          pedido.id,
        ]
      );

      return NextResponse.json(
        { error: "Payment amount mismatch", received: true },
        { status: 200 }
      );
    }

    let nuevoEstado = pedido.estado;
    let fechaPago = null;

    const estadosFinal = ["procesando", "enviado", "entregado"];

    switch (paymentInfo.status) {
      case "approved":
        if (!estadosFinal.includes(pedido.estado)) {
          nuevoEstado = "procesando";
          fechaPago = new Date().toISOString();
          console.log("✅ Pago aprobado → procesando");
        }
        break;

      case "pending":
      case "in_process":
        if (pedido.estado === "pendiente") {
          nuevoEstado = "pendiente";
          console.log("⏳ Pago pendiente");
        }
        break;

      case "rejected":
      case "cancelled":
        if (!["procesando", "enviado", "entregado"].includes(pedido.estado)) {
          nuevoEstado = "cancelado";
          console.log("❌ Pago rechazado");
        }
        break;

      default:
        console.log("ℹ️ Estado:", paymentInfo.status);
    }

    const updateQuery = `
      UPDATE pedido
      SET 
        estado = $1,
        mercadopago_payment_id = $2,
        mercadopago_status = $3,
        fecha_pago = COALESCE($4, fecha_pago),
        fecha_procesado = CASE 
          WHEN $1 = 'procesando' AND fecha_procesado IS NULL 
          THEN NOW() 
          ELSE fecha_procesado 
        END
      WHERE id = $5
      RETURNING id, numero_pedido, estado;
    `;

    const updateResult = await dbClient.query(updateQuery, [
      nuevoEstado,
      paymentInfo.id?.toString(),
      paymentInfo.status,
      fechaPago,
      pedido.id,
    ]);

    const pagoQuery = `
      INSERT INTO pago (
        pedido_id, mercadopago_payment_id, mercadopago_preference_id,
        status, status_detail, payment_method_id, payment_type_id,
        transaction_amount, net_amount, fee_amount,
        payer_email, payer_id, external_reference, 
        fecha_aprobado, raw_response
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (mercadopago_payment_id) 
      DO UPDATE SET
        status = EXCLUDED.status,
        status_detail = EXCLUDED.status_detail,
        fecha_actualizacion = NOW(),
        fecha_aprobado = COALESCE(EXCLUDED.fecha_aprobado, pago.fecha_aprobado),
        raw_response = EXCLUDED.raw_response;
    `;

    await dbClient.query(pagoQuery, [
      pedido.id,
      paymentInfo.id?.toString(),
      null,
      paymentInfo.status,
      paymentInfo.status_detail || null,
      paymentInfo.payment_method_id || null,
      paymentInfo.payment_type_id || null,
      paymentInfo.transaction_amount || 0,
      paymentInfo.transaction_amount_refunded
        ? (paymentInfo.transaction_amount || 0) -
          (paymentInfo.transaction_amount_refunded || 0)
        : paymentInfo.transaction_amount || 0,
      paymentInfo.fee_details?.[0]?.amount || 0,
      paymentInfo.payer?.email || null,
      paymentInfo.payer?.id?.toString() || null,
      numeroPedido,
      paymentInfo.status === "approved" ? new Date().toISOString() : null,
      JSON.stringify(paymentInfo),
    ]);

    await dbClient.query("COMMIT");

    console.log(
      `✅ Pedido ${updateResult.rows[0].numero_pedido} → ${updateResult.rows[0].estado}`
    );

    const response = {
      received: true,
      pedido_id: pedido.id,
      nuevo_estado: nuevoEstado,
      payment_status: paymentInfo.status,
      monto_validado: true,
    };

    await saveIdempotencyKey(idempotencyKey, response);

    return NextResponse.json(response);
  } catch (error) {
    if (dbClient) {
      try {
        await dbClient.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("❌ Error rollback:", rollbackError);
      }
    }

    console.error("❌ Error webhook:", error);

    const shouldRetry =
      error instanceof Error &&
      (error.message.includes("network") || error.message.includes("timeout"));

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        received: !shouldRetry,
      },
      { status: shouldRetry ? 500 : 200 }
    );
  } finally {
    if (dbClient) {
      dbClient.release();
    }
  }
}
