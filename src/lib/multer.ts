// src/lib/multer.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { sanitizeFilename, isSuspiciousInput } from "./security/sanitize";
import { securityLogger } from "./security/logger";

/**
 * Extensión del tipo Request para incluir usuario autenticado
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    rol: "admin" | "cliente";
  };
}

/**
 * Validar extensión de archivo
 */
const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|webp/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Helper para obtener IP del request
 */
function getRequestIP(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || "unknown";
}

/**
 * Helper para obtener User Agent
 */
function getUserAgent(req: Request): string {
  return req.headers["user-agent"] || "unknown";
}

/**
 * Middleware de multer para subir imágenes de productos
 * Crea una carpeta específica para cada producto
 *
 * @param productoId - ID del producto para organizar uploads
 * @returns Configuración de multer con validaciones de seguridad
 */
export function createMulterProductoUpload(productoId: number) {
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "productos",
    String(productoId)
  );

  // Crear directorio si no existe
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (
      _req: Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) {
      cb(null, uploadDir);
    },
    filename: function (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) {
      const ip = getRequestIP(req);
      const userAgent = getUserAgent(req);
      const originalName = file.originalname;

      // ✅ VALIDACIÓN 1: Detectar nombres sospechosos
      if (isSuspiciousInput(originalName)) {
        securityLogger.suspiciousActivity(
          ip,
          `Intento de subir archivo con nombre sospechoso: ${originalName}`,
          userAgent
        );
        return cb(new Error("Nombre de archivo no permitido"), "");
      }

      // ✅ VALIDACIÓN 2: Verificar que tenga extensión
      const ext = path.extname(originalName).toLowerCase();
      if (!ext || ext.length < 2) {
        securityLogger.suspiciousActivity(
          ip,
          `Intento de subir archivo sin extensión válida: ${originalName}`,
          userAgent
        );
        return cb(new Error("Archivo debe tener una extensión válida"), "");
      }

      // ✅ SANITIZACIÓN: Limpiar nombre de archivo
      const nameWithoutExt = path.basename(originalName, ext);
      const sanitizedName = sanitizeFilename(nameWithoutExt);

      // ✅ VALIDACIÓN 3: Verificar que después de sanitizar quede algo
      if (!sanitizedName || sanitizedName.length < 1) {
        securityLogger.suspiciousActivity(
          ip,
          `Nombre de archivo inválido después de sanitizar: ${originalName}`,
          userAgent
        );
        return cb(new Error("Nombre de archivo inválido"), "");
      }

      // ✅ Generar nombre único
      const unique = Date.now();
      const finalName = `${sanitizedName}-${unique}${ext}`;

      cb(null, finalName);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 10, // Máximo 10 archivos por request
    },
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      const ip = getRequestIP(req);
      const userAgent = getUserAgent(req);
      const authReq = req as AuthenticatedRequest;

      // ✅ Validar extensión del archivo
      const ext = path.extname(file.originalname).toLowerCase();
      const extname = ALLOWED_IMAGE_TYPES.test(ext);
      const mimetype = ALLOWED_IMAGE_TYPES.test(file.mimetype);

      if (mimetype && extname) {
        // ✅ Log de upload exitoso
        securityLogger.fileUpload(
          authReq.user?.id || 0,
          authReq.user?.email || "guest",
          file.originalname,
          file.size,
          ip
        );
        return cb(null, true);
      } else {
        // ❌ Tipo de archivo no permitido
        securityLogger.suspiciousActivity(
          ip,
          `Intento de subir archivo con tipo no permitido: ${file.mimetype} (${file.originalname})`,
          userAgent
        );
        cb(new Error("Solo se permiten imágenes (JPEG, JPG, PNG, WebP)"));
      }
    },
  });
}

/**
 * Middleware genérico para imágenes de la tienda (banners, logos, etc.)
 *
 * @returns Configuración de multer con validaciones de seguridad
 */
export function createMulterGeneralUpload() {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "general");

  // Crear directorio si no existe
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (
      _req: Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) {
      cb(null, uploadDir);
    },
    filename: function (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) {
      const ip = getRequestIP(req);
      const userAgent = getUserAgent(req);
      const originalName = file.originalname;

      // ✅ VALIDACIÓN 1: Detectar nombres sospechosos
      if (isSuspiciousInput(originalName)) {
        securityLogger.suspiciousActivity(
          ip,
          `Intento de subir archivo con nombre sospechoso: ${originalName}`,
          userAgent
        );
        return cb(new Error("Nombre de archivo no permitido"), "");
      }

      // ✅ VALIDACIÓN 2: Verificar que tenga extensión
      const ext = path.extname(originalName).toLowerCase();
      if (!ext || ext.length < 2) {
        securityLogger.suspiciousActivity(
          ip,
          `Intento de subir archivo sin extensión válida: ${originalName}`,
          userAgent
        );
        return cb(new Error("Archivo debe tener una extensión válida"), "");
      }

      // ✅ SANITIZACIÓN: Limpiar nombre de archivo
      const nameWithoutExt = path.basename(originalName, ext);
      const sanitizedName = sanitizeFilename(nameWithoutExt);

      // ✅ VALIDACIÓN 3: Verificar que después de sanitizar quede algo
      if (!sanitizedName || sanitizedName.length < 1) {
        securityLogger.suspiciousActivity(
          ip,
          `Nombre de archivo inválido después de sanitizar: ${originalName}`,
          userAgent
        );
        return cb(new Error("Nombre de archivo inválido"), "");
      }

      // ✅ Generar nombre único
      const unique = Date.now();
      const finalName = `${sanitizedName}-${unique}${ext}`;

      cb(null, finalName);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 5, // Máximo 5 archivos para uploads generales
    },
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      const ip = getRequestIP(req);
      const userAgent = getUserAgent(req);
      const authReq = req as AuthenticatedRequest;

      // ✅ Validar extensión del archivo
      const ext = path.extname(file.originalname).toLowerCase();
      const extname = ALLOWED_IMAGE_TYPES.test(ext);
      const mimetype = ALLOWED_IMAGE_TYPES.test(file.mimetype);

      if (mimetype && extname) {
        // ✅ Log de upload exitoso
        securityLogger.fileUpload(
          authReq.user?.id || 0,
          authReq.user?.email || "guest",
          file.originalname,
          file.size,
          ip
        );
        return cb(null, true);
      } else {
        // ❌ Tipo de archivo no permitido
        securityLogger.suspiciousActivity(
          ip,
          `Intento de subir archivo con tipo no permitido: ${file.mimetype} (${file.originalname})`,
          userAgent
        );
        cb(new Error("Solo se permiten imágenes (JPEG, JPG, PNG, WebP)"));
      }
    },
  });
}

/**
 * Helper para eliminar archivo de forma segura
 *
 * @param filepath - Ruta completa del archivo a eliminar
 * @returns true si se eliminó correctamente
 */
export async function eliminarArchivo(filepath: string): Promise<boolean> {
  try {
    // ✅ Validar que la ruta esté dentro de /uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const absolutePath = path.resolve(filepath);

    if (!absolutePath.startsWith(uploadsDir)) {
      console.error(
        "❌ Intento de eliminar archivo fuera de /uploads:",
        filepath
      );
      return false;
    }

    // ✅ Verificar que el archivo existe
    if (!fs.existsSync(absolutePath)) {
      console.warn("⚠️ Archivo no existe:", absolutePath);
      return false;
    }

    // ✅ Eliminar archivo
    fs.unlinkSync(absolutePath);
    console.log("✅ Archivo eliminado:", absolutePath);
    return true;
  } catch (error) {
    console.error("❌ Error al eliminar archivo:", error);
    return false;
  }
}

/**
 * Helper para obtener tamaño de archivo en formato legible
 *
 * @param bytes - Tamaño en bytes
 * @returns String formateado (ej: "2.5 MB")
 */
export function formatearTamanoArchivo(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
