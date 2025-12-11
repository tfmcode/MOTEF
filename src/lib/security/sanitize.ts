import { z } from "zod";

export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .substring(0, 5000);
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().substring(0, 255);
}

export function sanitizeHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "");
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .substring(0, 255);
}

export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);
}

export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9+]/g, "").substring(0, 20);
}

export function sanitizeNumber(value: unknown): number | null {
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
    return isNaN(parsed) ? null : parsed;
  }

  return null;
}

export function sanitizeInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = parseInt(value.replace(/[^0-9-]/g, ""), 10);
    return isNaN(parsed) ? null : parsed;
  }

  return null;
}

export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    } else if (typeof value === "number") {
      sanitized[key as keyof T] = value as T[keyof T];
    } else if (typeof value === "boolean") {
      sanitized[key as keyof T] = value as T[keyof T];
    } else if (value === null || value === undefined) {
      sanitized[key as keyof T] = value as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map((item) =>
        typeof item === "string" ? sanitizeString(item) : item
      ) as T[keyof T];
    }
  }

  return sanitized;
}

export const CommonSchemas = {
  email: z.string().email("Email inválido").transform(sanitizeEmail),

  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña es demasiado larga"),

  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo")
    .transform(sanitizeString),

  telefono: z
    .string()
    .min(8, "Teléfono inválido")
    .max(20, "Teléfono demasiado largo")
    .transform(sanitizePhoneNumber),

  slug: z
    .string()
    .min(1, "El slug no puede estar vacío")
    .max(200, "El slug es demasiado largo")
    .transform(sanitizeSlug),

  descripcion: z
    .string()
    .max(5000, "La descripción es demasiado larga")
    .transform(sanitizeString)
    .optional(),

  precio: z
    .number()
    .positive("El precio debe ser positivo")
    .max(9999999, "El precio es demasiado alto"),

  stock: z
    .number()
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo")
    .max(999999, "El stock es demasiado alto"),
};

export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(UNION\s+SELECT)/i,
    /(OR\s+1\s*=\s*1)/i,
    /(AND\s+1\s*=\s*1)/i,
    /('|\"|;|--|\*|\/\*|\*\/)/,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[^>]*>/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

export function isSuspiciousInput(input: string): boolean {
  return detectSQLInjection(input) || detectXSS(input);
}

export function logSuspiciousActivity(
  type: string,
  input: string,
  ip: string,
  userId?: number
) {
  console.warn("🚨 ACTIVIDAD SOSPECHOSA DETECTADA:", {
    type,
    input: input.substring(0, 100),
    ip,
    userId,
    timestamp: new Date().toISOString(),
  });
}
