// src/lib/auth.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// ✅ Tipos actualizados para e-commerce
export type UserRole = "admin" | "cliente";

export interface JwtPayload {
  id: number;
  email: string;
  rol: UserRole;
}

/**
 * Genera un JWT token para el usuario
 * @param payload - Datos del usuario (id, email, rol)
 * @returns Token JWT firmado válido por 2 horas
 */
export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
}

/**
 * Verifica y decodifica un JWT token
 * @param token - Token JWT a verificar
 * @returns Payload decodificado o null si es inválido
 */
export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error("❌ Error verificando JWT:", error);
    return null;
  }
}

/**
 * Verifica si un usuario tiene rol de administrador
 * @param user - Usuario a verificar
 * @returns true si es admin
 */
export function isAdmin(user: JwtPayload | null): boolean {
  return user?.rol === "admin";
}

/**
 * Verifica si un usuario tiene rol de cliente
 * @param user - Usuario a verificar
 * @returns true si es cliente
 */
export function isCliente(user: JwtPayload | null): boolean {
  return user?.rol === "cliente";
}
