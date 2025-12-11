import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { createApiHandler } from "@/lib/security/apiValidation";
import { uploadRateLimit } from "@/lib/security/rateLimit";
import { sanitizeFilename } from "@/lib/security/sanitize";
import { securityLogger } from "@/lib/security/logger";

export const runtime = "nodejs";

export const POST = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["admin"],
    rateLimit: uploadRateLimit,
    allowedMethods: ["POST"],
  },
  async (req, { user, ip }) => {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { message: "No se envió ningún archivo" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { fileTypeFromBuffer } = await import("file-type");
      const detected = await fileTypeFromBuffer(buffer);

      if (!detected) {
        securityLogger.suspiciousActivity(
          ip,
          `Intento de subir archivo sin tipo detectado: ${file.name}`,
          req.headers.get("user-agent") || "unknown"
        );
        return NextResponse.json(
          { message: "No se pudo detectar el tipo de archivo" },
          { status: 400 }
        );
      }

      const allowedMimes = new Set(["image/jpeg", "image/png", "image/webp"]);
      if (!allowedMimes.has(detected.mime)) {
        securityLogger.suspiciousActivity(
          ip,
          `Intento de subir archivo no permitido: ${detected.mime}`,
          req.headers.get("user-agent") || "unknown"
        );
        return NextResponse.json(
          { message: "Tipo de archivo no permitido" },
          { status: 400 }
        );
      }

      if (buffer.byteLength > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: "El archivo es demasiado grande (máx 5MB)" },
          { status: 400 }
        );
      }

      const uniqueSuffix = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
      const ext = detected.ext;
      const baseName = `producto-${uniqueSuffix}.${ext}`;
      const filename = sanitizeFilename(baseName);

      const uploadDir = join(process.cwd(), "public", "uploads", "productos");
      await mkdir(uploadDir, { recursive: true });

      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);

      const publicUrl = `/uploads/productos/${filename}`;

      securityLogger.fileUpload(
        user!.id,
        user!.email,
        file.name,
        buffer.byteLength,
        ip
      );

      console.log(`✅ Imagen subida: ${filename} por ${user!.email}`);

      return NextResponse.json({
        message: "Imagen subida exitosamente",
        url: publicUrl,
        filename,
      });
    } catch (error) {
      console.error("❌ Error al subir imagen:", error);
      return NextResponse.json(
        { message: "Error al subir imagen" },
        { status: 500 }
      );
    }
  }
);
