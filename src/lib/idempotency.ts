// src/lib/idempotency.ts

/**
 * Sistema de idempotencia para operaciones críticas
 * Evita procesamiento duplicado de acciones del usuario
 */

import pool from "./db";

interface IdempotencyRecord {
  key: string;
  response: unknown;
  created_at: Date;
}

/**
 * Verifica si una operación ya fue procesada
 * @param key - Clave única de la operación (ej: `checkout:${userId}:${timestamp}`)
 * @returns Respuesta previa si existe, null si es nueva
 */
export async function checkIdempotency(
  key: string
): Promise<IdempotencyRecord | null> {
  try {
    const result = await pool.query(
      `SELECT key, response, created_at 
       FROM idempotency_keys 
       WHERE key = $1 AND created_at > NOW() - INTERVAL '24 hours'`,
      [key]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error checking idempotency:", error);
    return null;
  }
}

/**
 * Guarda el resultado de una operación idempotente
 * @param key - Clave única
 * @param response - Respuesta a guardar
 */
export async function saveIdempotencyKey(
  key: string,
  response: unknown
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO idempotency_keys (key, response, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET response = $2`,
      [key, JSON.stringify(response)]
    );
  } catch (error) {
    console.error("Error saving idempotency key:", error);
  }
}

/**
 * Genera una clave de idempotencia para checkout
 * Combina userId + items del carrito para detectar duplicados
 */
export function generateCheckoutKey(
  userId: number,
  items: Array<{ producto_id: number; cantidad: number }>
): string {
  const itemsHash = items
    .map((i) => `${i.producto_id}:${i.cantidad}`)
    .sort()
    .join("|");

  return `checkout:${userId}:${itemsHash}`;
}

/**
 * Genera una clave de idempotencia para webhook de Mercado Pago
 */
export function generateWebhookKey(paymentId: string, action: string): string {
  return `mp-webhook:${paymentId}:${action}`;
}

/**
 * Limpia claves de idempotencia antiguas (> 7 días)
 * Ejecutar como tarea programada
 */
export async function cleanupOldKeys(): Promise<void> {
  try {
    await pool.query(
      `DELETE FROM idempotency_keys WHERE created_at < NOW() - INTERVAL '7 days'`
    );
  } catch (error) {
    console.error("Error cleaning up idempotency keys:", error);
  }
}
