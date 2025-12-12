import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import pool from "@/lib/db";
import { MercadoPagoConfig, Preference } from "mercadopago";
import type { PoolClient } from "pg";
import {
  checkIdempotency,
  saveIdempotencyKey,
  generateCheckoutKey,
} from "@/lib/idempotency";

export const runtime = "nodejs";

type CheckoutItem = { producto_id: number; cantidad: number };
type CheckoutBody = {
  items: CheckoutItem[];
  direccion: {
    nombre_contacto: string;
    telefono_contacto: string;
    direccion: string;
    ciudad: string;
    provincia?: string;
    codigo_postal?: string;
    referencias?: string | null;
  };
  metodo_pago: "mercadopago" | "transferencia";
};

type MPItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: "ARS";
};

type MPBackUrls = {
  success: string;
  failure: string;
  pending: string;
};

type MPPreferenceBody = {
  items: MPItem[];
  payer: {
    email: string;
    name: string;
    phone: { number: string };
  };
  back_urls: MPBackUrls;
  external_reference: string;
  notification_url: string;
  statement_descriptor?: string;
  auto_return?: "approved";
};

type MPPreferenceCreateResponse = {
  id: string;
  init_point: string;
};

type MPApiError = {
  message?: string;
  status?: number;
  error?: string;
  cause?: unknown;
  response?: unknown;
};

function isMPPreferenceCreateResponse(
  x: unknown
): x is MPPreferenceCreateResponse {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as MPPreferenceCreateResponse).id === "string" &&
    typeof (x as MPPreferenceCreateResponse).init_point === "string"
  );
}

function isMPApiError(x: unknown): x is MPApiError {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  return (
    ("message" in obj && typeof obj.message === "string") ||
    ("status" in obj && typeof obj.status === "number") ||
    ("error" in obj && typeof obj.error === "string") ||
    "cause" in obj ||
    "response" in obj
  );
}

function isLocalOrInsecure(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.endsWith(".local");
    const isHttps = u.protocol === "https:";
    return isLocal || !isHttps;
  } catch {
    return true;
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "cliente") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const envSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const origin = req.nextUrl?.origin ?? "http://localhost:3000";
  const siteUrl = (
    envSite && /^https?:\/\//i.test(envSite) ? envSite : origin
  ).replace(/\/+$/, "");
  const useAutoReturn = !isLocalOrInsecure(siteUrl);

  const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const isDevelopmentMode =
    !MP_ACCESS_TOKEN ||
    MP_ACCESS_TOKEN === "TEST-" ||
    MP_ACCESS_TOKEN.includes("your_");

  if (isDevelopmentMode) {
    console.warn(
      "⚠️ Mercado Pago no configurado correctamente - Modo desarrollo"
    );
  }

  let dbClient: PoolClient | null = null;

  try {
    const body: CheckoutBody = await req.json();
    const { items, direccion, metodo_pago } = body;

    if (!items?.length) {
      return NextResponse.json(
        { message: "El carrito está vacío" },
        { status: 400 }
      );
    }
    if (!direccion?.direccion || !direccion?.ciudad) {
      return NextResponse.json(
        { message: "Faltan datos de dirección" },
        { status: 400 }
      );
    }
    if (!direccion?.nombre_contacto || !direccion?.telefono_contacto) {
      return NextResponse.json(
        { message: "Faltan datos de contacto" },
        { status: 400 }
      );
    }
    if (!["mercadopago", "transferencia"].includes(metodo_pago)) {
      return NextResponse.json(
        { message: "Método de pago inválido" },
        { status: 400 }
      );
    }

    const idempotencyKey = generateCheckoutKey(user.id, items);
    const existingResponse = await checkIdempotency(idempotencyKey);
    if (existingResponse) {
      console.log(
        `♻️ Checkout duplicado para usuario ${user.id}, devolviendo respuesta previa`
      );
      return NextResponse.json(existingResponse.response);
    }

    dbClient = await pool.connect();
    await dbClient.query("BEGIN");

    const direccionResult = await dbClient.query(
      `INSERT INTO direccion (
        usuario_id, nombre_contacto, telefono_contacto, direccion,
        ciudad, provincia, codigo_postal, referencias, es_principal, pais
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,'Argentina') RETURNING id`,
      [
        user.id,
        direccion.nombre_contacto.trim(),
        direccion.telefono_contacto.trim(),
        direccion.direccion.trim(),
        direccion.ciudad.trim(),
        direccion.provincia?.trim() || "",
        direccion.codigo_postal?.trim() || "",
        direccion.referencias?.trim() || null,
      ]
    );
    const direccionId: number = direccionResult.rows[0].id;

    type ProductoLinea = {
      producto_id: number;
      nombre: string;
      sku: string;
      cantidad: number;
      precio: number;
      subtotal: number;
    };
    const productosData: ProductoLinea[] = [];
    const noDisponibles: string[] = [];
    const stockInsuf: Array<{
      nombre: string;
      disponible: number;
      solicitado: number;
    }> = [];
    let subtotal = 0;

    for (const it of items) {
      if (!it.producto_id || !it.cantidad || it.cantidad <= 0) {
        throw new Error("Datos de producto inválidos en el carrito");
      }
      const r = await dbClient.query(
        "SELECT id, nombre, precio, stock, sku, activo FROM producto WHERE id = $1 FOR UPDATE",
        [it.producto_id]
      );
      if (!r.rowCount) {
        noDisponibles.push(`Producto ID ${it.producto_id}`);
        continue;
      }
      const row = r.rows[0] as {
        id: number;
        nombre: string;
        precio: string | number;
        stock: number;
        sku: string;
        activo: boolean;
      };
      if (!row.activo) {
        noDisponibles.push(row.nombre);
        continue;
      }
      if (row.stock < it.cantidad) {
        stockInsuf.push({
          nombre: row.nombre,
          disponible: row.stock,
          solicitado: it.cantidad,
        });
        continue;
      }
      const precio =
        typeof row.precio === "number" ? row.precio : parseFloat(row.precio);
      const lineSub = precio * it.cantidad;
      subtotal += lineSub;
      productosData.push({
        producto_id: row.id,
        nombre: row.nombre,
        sku: row.sku,
        cantidad: it.cantidad,
        precio,
        subtotal: lineSub,
      });
    }

    if (noDisponibles.length) {
      throw new Error(
        `Los siguientes productos ya no están disponibles: ${noDisponibles.join(
          ", "
        )}`
      );
    }
    if (stockInsuf.length) {
      const det = stockInsuf
        .map((p) => `${p.nombre} (disp: ${p.disponible}, sol: ${p.solicitado})`)
        .join(", ");
      throw new Error(`Stock insuficiente para: ${det}`);
    }
    if (!productosData.length) {
      throw new Error("No hay productos válidos en el carrito");
    }

    const totalItems = productosData.reduce((s, p) => s + p.cantidad, 0);
    const costoEnvio = totalItems >= 2 ? 0 : 5000;
    const total = subtotal + costoEnvio;

    const numeroPedido = `XYN-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    const pedidoResult = await dbClient.query(
      `INSERT INTO pedido (
        numero_pedido, usuario_id, direccion_id, subtotal,
        descuento, costo_envio, total, estado, metodo_pago
      ) VALUES ($1,$2,$3,$4,0,$5,$6,'pendiente',$7) RETURNING id`,
      [
        numeroPedido,
        user.id,
        direccionId,
        subtotal,
        costoEnvio,
        total,
        metodo_pago,
      ]
    );
    const pedidoId: number = pedidoResult.rows[0].id;

    for (const p of productosData) {
      await dbClient.query(
        `INSERT INTO detalle_pedido (
          pedido_id, producto_id, nombre_producto, sku,
          cantidad, precio_unitario, subtotal
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          pedidoId,
          p.producto_id,
          p.nombre,
          p.sku,
          p.cantidad,
          p.precio,
          p.subtotal,
        ]
      );
      const upd = await dbClient.query(
        "UPDATE producto SET stock = stock - $1 WHERE id = $2 RETURNING stock",
        [p.cantidad, p.producto_id]
      );
      if (!upd.rowCount)
        throw new Error(`Error al actualizar stock de ${p.nombre}`);
      console.log(
        `✅ Stock actualizado - ${p.nombre}: ${upd.rows[0].stock} restantes`
      );
    }

    let initPoint: string | null = null;
    let preferenceId: string | null = null;

    if (metodo_pago === "mercadopago") {
      if (isDevelopmentMode) {
        initPoint = `${siteUrl}/pedido/${pedidoId}/pending`;
        await dbClient.query(
          "UPDATE pedido SET mercadopago_preference_id = $1, notas_admin = $2 WHERE id = $3",
          ["DEV-MODE-NO-MP", "Pedido en DEV, confirmar manualmente", pedidoId]
        );
      } else {
        try {
          const mpClient = new MercadoPagoConfig({
            accessToken: MP_ACCESS_TOKEN!,
          });
          const preference = new Preference(mpClient);

          const successUrl = `${siteUrl}/pedido/${pedidoId}/success`;
          const failureUrl = `${siteUrl}/pedido/${pedidoId}/failure`;
          const pendingUrl = `${siteUrl}/pedido/${pedidoId}/pending`;

          const mpItems: MPItem[] = productosData.map((p) => ({
            id: p.sku,
            title: p.nombre,
            quantity: p.cantidad,
            unit_price: p.precio,
            currency_id: "ARS",
          }));
          if (costoEnvio > 0) {
            mpItems.push({
              id: "ENVIO",
              title: "Costo de envío",
              quantity: 1,
              unit_price: costoEnvio,
              currency_id: "ARS",
            });
          }

          const body: MPPreferenceBody = {
            items: mpItems,
            payer: {
              email: user.email,
              name: direccion.nombre_contacto,
              phone: { number: direccion.telefono_contacto },
            },
            back_urls: {
              success: successUrl,
              failure: failureUrl,
              pending: pendingUrl,
            },
            external_reference: numeroPedido,
            notification_url: `${siteUrl}/api/webhooks/mercadopago`,
            statement_descriptor: "MOTEF",
          };
          if (useAutoReturn) body.auto_return = "approved";

          console.log(
            "📦 Creando preferencia MP con back_urls:",
            body.back_urls,
            "auto_return:",
            body.auto_return ?? "<omitido>"
          );

          const preferenceResponse = await preference.create({ body });

          if (isMPPreferenceCreateResponse(preferenceResponse)) {
            initPoint = preferenceResponse.init_point;
            preferenceId = preferenceResponse.id;
          } else {
            const maybe = preferenceResponse as unknown as Record<
              string,
              unknown
            >;
            const ip =
              typeof maybe["init_point"] === "string"
                ? (maybe["init_point"] as string)
                : null;
            const pid =
              typeof maybe["id"] === "string" ? (maybe["id"] as string) : null;
            if (!ip || !pid) {
              throw new Error(
                "Respuesta inesperada de Mercado Pago al crear la preferencia."
              );
            }
            initPoint = ip;
            preferenceId = pid;
          }

          await dbClient.query(
            "UPDATE pedido SET mercadopago_preference_id = $1 WHERE id = $2",
            [preferenceId, pedidoId]
          );

          console.log(`✅ Preferencia MP creada: ${preferenceId}`);
        } catch (e: unknown) {
          if (isMPApiError(e)) {
            console.error("❌ Error al crear preferencia MP:", {
              message: e.message,
              status: e.status,
              error: e.error,
              cause: e.cause,
              response: e.response,
            });
          } else {
            console.error("❌ Error al crear preferencia MP (desconocido):", e);
          }
          throw new Error(
            "Error al procesar el pago con Mercado Pago. Intentá nuevamente."
          );
        }
      }
    }

    await dbClient.query("DELETE FROM carrito WHERE usuario_id = $1", [
      user.id,
    ]);

    await dbClient.query("COMMIT");

    const response = {
      success: true,
      pedido_id: pedidoId,
      numero_pedido: numeroPedido,
      init_point: initPoint,
      preference_id: preferenceId,
      total,
      subtotal,
      costo_envio: costoEnvio,
      message: "Pedido creado exitosamente",
    };
    await saveIdempotencyKey(idempotencyKey, response);
    return NextResponse.json(response);
  } catch (error) {
    if (dbClient) {
      try {
        await dbClient.query("ROLLBACK");
        console.log("🔄 Transacción revertida por error");
      } catch (e) {
        console.error("❌ Error al hacer rollback:", e);
      }
    }
    console.error("❌ Error en checkout:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error al procesar el pedido. Intentá nuevamente.",
      },
      { status: 500 }
    );
  } finally {
    if (dbClient) dbClient.release();
  }
}
