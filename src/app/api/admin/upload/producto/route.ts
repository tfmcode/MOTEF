// src/app/api/admin/upload/producto/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// ✅ Asegura runtime Node (fs, path, file-type)
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No se envió ningún archivo" },
        { status: 400 }
      );
    }

    // 1) Traemos los bytes primero
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2) Validamos tipo real por contenido (no por extensión declarada)
    const { fileTypeFromBuffer } = await import("file-type");
    const detected = await fileTypeFromBuffer(buffer);

    if (!detected) {
      return NextResponse.json(
        { message: "No se pudo detectar el tipo de archivo" },
        { status: 400 }
      );
    }

    const allowedMimes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowedMimes.has(detected.mime)) {
      return NextResponse.json(
        { message: "Tipo de archivo no permitido" },
        { status: 400 }
      );
    }

    // 3) Validamos tamaño (máx 5MB)
    if (buffer.byteLength > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "El archivo es demasiado grande (máx 5MB)" },
        { status: 400 }
      );
    }

    // 4) Generamos nombre único con la extensión detectada
    const uniqueSuffix = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const ext = detected.ext; // "jpg" | "png" | "webp"
    const baseName = `producto-${uniqueSuffix}.${ext}`;

    // 5) Sanitizamos el nombre final (por si en el futuro concatenás algo)
    const filename = baseName.replace(/[^a-z0-9.\-_]/gi, "_");

    // 6) Aseguramos carpeta destino
    const uploadDir = join(process.cwd(), "public", "uploads", "productos");
    await mkdir(uploadDir, { recursive: true });

    // 7) Guardamos el archivo
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // 8) URL pública
    const publicUrl = `/uploads/productos/${filename}`;
    console.log(`✅ Imagen subida: ${filename}`);

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
