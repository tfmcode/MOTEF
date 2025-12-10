// src/app/api/auth/logout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // ✅ Obtener las cookies de forma correcta
    const cookieStore = await cookies();

    // ✅ Eliminar la cookie del token
    cookieStore.delete("token");

    console.log("✅ Logout exitoso - Cookie eliminada");

    return NextResponse.json(
      { mensaje: "Sesión cerrada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error en logout:", error);

    return NextResponse.json(
      { mensaje: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
