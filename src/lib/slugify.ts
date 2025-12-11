import { isSuspiciousInput } from "./security/sanitize";
import { securityLogger } from "./security/logger";

export function generarSlug(nombre: string): string {
  if (typeof nombre !== "string" || !nombre.trim()) {
    console.warn("⚠️ generarSlug: Input inválido o vacío");
    return "";
  }

  const MAX_LENGTH = 200; // Límite generoso para input
  if (nombre.length > MAX_LENGTH) {
    console.warn(
      `⚠️ generarSlug: Input demasiado largo (${nombre.length} caracteres)`
    );
    nombre = nombre.substring(0, MAX_LENGTH);
  }

  if (isSuspiciousInput(nombre)) {
    securityLogger.suspiciousActivity(
      "system",
      `Intento de generar slug con input sospechoso: ${nombre}`,
      "slugify"
    );
    console.warn("⚠️ generarSlug: Input sospechoso detectado, limpiando...");
  }

  let slug = nombre
    .toLowerCase()
    .trim() // Eliminar espacios al inicio/fin
    .normalize("NFD") // Descomponer caracteres (á → a + ´)
    .replace(/[\u0300-\u036f]/g, "") // Eliminar marcas diacríticas (acentos)
    .replace(/\s+/g, "-") // Espacios múltiples → un guión
    .replace(/[^a-z0-9\-]/g, "") // Solo letras, números y guiones
    .replace(/\-+/g, "-") // Guiones múltiples → uno solo
    .replace(/^-+|-+$/g, ""); // Eliminar guiones al inicio/fin

  if (!slug || slug.length === 0) {
    console.warn("⚠️ generarSlug: Slug vacío después de procesar");
    return "";
  }

  const MAX_SLUG_LENGTH = 100;
  if (slug.length > MAX_SLUG_LENGTH) {
    slug = slug.substring(0, MAX_SLUG_LENGTH);
    // Eliminar guión final si quedó cortado en medio de una palabra
    slug = slug.replace(/-+$/, "");
  }

  const RESERVED_SLUGS = [
    "admin",
    "api",
    "login",
    "logout",
    "registro",
    "cuenta",
    "carrito",
    "checkout",
    "unauthorized",
    "null",
    "undefined",
    "true",
    "false",
  ];

  if (RESERVED_SLUGS.includes(slug)) {
    console.warn(`⚠️ generarSlug: Slug reservado detectado: ${slug}`);
    slug = `producto-${slug}`;
  }

  return slug;
}
export async function generarSlugUnico(
  nombre: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = generarSlug(nombre);
  let contador = 2;

  while (await checkExists(slug)) {
    slug = `${generarSlug(nombre)}-${contador}`;
    contador++;

    if (contador > 1000) {
      console.error("❌ generarSlugUnico: Demasiadas iteraciones, abortando");
      slug = `${generarSlug(nombre)}-${Date.now()}`;
      break;
    }
  }

  return slug;
}

export function esSlugValido(slug: string): boolean {
  if (typeof slug !== "string" || !slug) return false;

  const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  if (!regex.test(slug)) return false;

  if (slug.length > 100) return false;

  const RESERVED_SLUGS = [
    "admin",
    "api",
    "login",
    "logout",
    "registro",
    "cuenta",
    "carrito",
    "checkout",
    "unauthorized",
  ];

  if (RESERVED_SLUGS.includes(slug)) return false;

  return true;
}

export function slugANombre(slug: string): string {
  if (!slug || typeof slug !== "string") return "";

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
