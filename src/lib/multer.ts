import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { sanitizeFilename, isSuspiciousInput } from "./security/sanitize";
import { securityLogger } from "./security/logger";
import { fileTypeFromBuffer } from "file-type";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    rol: "admin" | "cliente";
  };
}

const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|webp/;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getRequestIP(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || "unknown";
}

function getUserAgent(req: Request): string {
  return req.headers["user-agent"] || "unknown";
}

async function validarRealMimeType(
  filepath: string,
  filename: string,
  ip: string
): Promise<boolean> {
  try {
    const buffer = await fs.promises.readFile(filepath);

    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType) {
      securityLogger.suspiciousActivity(
        ip,
        `Archivo sin tipo MIME detectado: ${filename}`,
        filepath
      );
      await eliminarArchivo(filepath);
      return false;
    }

    if (!ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      securityLogger.suspiciousActivity(
        ip,
        `MIME spoofing detectado: ${filename} - Real: ${fileType.mime}`,
        filepath
      );
      await eliminarArchivo(filepath);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validando MIME type:", error);
    await eliminarArchivo(filepath);
    return false;
  }
}

export async function validarArchivoSubido(
  filepath: string,
  filename: string,
  ip: string
): Promise<boolean> {
  return await validarRealMimeType(filepath, filename, ip);
}

export function createMulterProductoUpload(productoId: number) {
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "productos",
    String(productoId)
  );

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

      if (isSuspiciousInput(originalName)) {
        securityLogger.suspiciousActivity(
          ip,
          `Intento de subir archivo con nombre sospechoso: ${originalName}`,
          userAgent
        );
        return cb(new Error("Nombre de archivo no permitido"), "");
      }

      const ext = path.extname(originalName).toLowerCase();
      if (!ext || ext.length < 2) {
        securityLogger.suspiciousActivity(
          ip,
          `Intento de subir archivo sin extensión válida: ${originalName}`,
          userAgent
        );
        return cb(new Error("Archivo debe tener una extensión válida"), "");
      }

      const nameWithoutExt = path.basename(originalName, ext);
      const sanitizedName = sanitizeFilename(nameWithoutExt);

      if (!sanitizedName || sanitizedName.length < 1) {
        securityLogger.suspiciousActivity(
          ip,
          `Nombre de archivo inválido después de sanitizar: ${originalName}`,
          userAgent
        );
        return cb(new Error("Nombre de archivo inválido"), "");
      }

      const unique = Date.now();
      const finalName = `${sanitizedName}-${unique}${ext}`;

      cb(null, finalName);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 10,
    },
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      const ip = getRequestIP(req);
      const userAgent = getUserAgent(req);
      const authReq = req as AuthenticatedRequest;

      const ext = path.extname(file.originalname).toLowerCase();
      const extname = ALLOWED_IMAGE_TYPES.test(ext);
      const mimetype = ALLOWED_IMAGE_TYPES.test(file.mimetype);

      if (mimetype && extname) {
        securityLogger.fileUpload(
          authReq.user?.id || 0,
          authReq.user?.email || "guest",
          file.originalname,
          file.size,
          ip
        );
        return cb(null, true);
      } else {
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

export function createMulterGeneralUpload() {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "general");

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

      if (isSuspiciousInput(originalName)) {
        securityLogger.suspiciousActivity(
          ip,
          `Intento de subir archivo con nombre sospechoso: ${originalName}`,
          userAgent
        );
        return cb(new Error("Nombre de archivo no permitido"), "");
      }

      const ext = path.extname(originalName).toLowerCase();
      if (!ext || ext.length < 2) {
        securityLogger.suspiciousActivity(
          ip,
          `Intento de subir archivo sin extensión válida: ${originalName}`,
          userAgent
        );
        return cb(new Error("Archivo debe tener una extensión válida"), "");
      }

      const nameWithoutExt = path.basename(originalName, ext);
      const sanitizedName = sanitizeFilename(nameWithoutExt);

      if (!sanitizedName || sanitizedName.length < 1) {
        securityLogger.suspiciousActivity(
          ip,
          `Nombre de archivo inválido después de sanitizar: ${originalName}`,
          userAgent
        );
        return cb(new Error("Nombre de archivo inválido"), "");
      }

      const unique = Date.now();
      const finalName = `${sanitizedName}-${unique}${ext}`;

      cb(null, finalName);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 5,
    },
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      const ip = getRequestIP(req);
      const userAgent = getUserAgent(req);
      const authReq = req as AuthenticatedRequest;

      const ext = path.extname(file.originalname).toLowerCase();
      const extname = ALLOWED_IMAGE_TYPES.test(ext);
      const mimetype = ALLOWED_IMAGE_TYPES.test(file.mimetype);

      if (mimetype && extname) {
        securityLogger.fileUpload(
          authReq.user?.id || 0,
          authReq.user?.email || "guest",
          file.originalname,
          file.size,
          ip
        );
        return cb(null, true);
      } else {
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

export async function eliminarArchivo(filepath: string): Promise<boolean> {
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const absolutePath = path.resolve(filepath);

    if (!absolutePath.startsWith(uploadsDir)) {
      console.error(
        "❌ Intento de eliminar archivo fuera de /uploads:",
        filepath
      );
      return false;
    }

    if (!fs.existsSync(absolutePath)) {
      console.warn("⚠️ Archivo no existe:", absolutePath);
      return false;
    }

    fs.unlinkSync(absolutePath);
    console.log("✅ Archivo eliminado:", absolutePath);
    return true;
  } catch (error) {
    console.error("❌ Error al eliminar archivo:", error);
    return false;
  }
}

export function formatearTamanoArchivo(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
