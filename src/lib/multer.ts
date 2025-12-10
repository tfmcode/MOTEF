import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

/**
 * Middleware de multer para subir imágenes de productos
 * Crea una carpeta específica para cada producto
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
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) {
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext).replace(/\s+/g, "-");
      const unique = Date.now();
      cb(null, `${name}-${unique}${ext}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|webp/;
      const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error("Solo se permiten imágenes (JPEG, PNG, WebP)"));
      }
    },
  });
}

/**
 * Middleware genérico para imágenes de la tienda (banners, logos, etc.)
 */
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
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) {
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext).replace(/\s+/g, "-");
      const unique = Date.now();
      cb(null, `${name}-${unique}${ext}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|webp/;
      const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error("Solo se permiten imágenes (JPEG, PNG, WebP)"));
      }
    },
  });
}
