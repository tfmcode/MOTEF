import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Si no hay token, redirige a login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = verifyJwt(token);

  // Si el token es inválido, también redirige a login
  if (!user) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  const path = request.nextUrl.pathname;

  // ✅ Rutas privadas para ADMIN
  if (path.startsWith("/panel/admin") && user.rol !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // ✅ Rutas privadas para CLIENTE (cuenta personal)
  if (path.startsWith("/cuenta") && user.rol !== "cliente") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // ✅ Control de APIs protegidas
  if (path.startsWith("/api/")) {
    const adminApis = ["/api/admin/", "/api/usuarios"];
    const clienteApis = ["/api/cuenta/", "/api/carrito", "/api/checkout"];

    // Proteger rutas de admin
    if (adminApis.some((api) => path.startsWith(api)) && user.rol !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    // Proteger rutas de cliente
    if (
      clienteApis.some((api) => path.startsWith(api)) &&
      user.rol !== "cliente"
    ) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/panel/:path*", // Panel de admin
    "/cuenta/:path*", // Cuenta de cliente
    "/api/admin/:path*", // APIs de admin
    "/api/cuenta/:path*", // APIs de cliente
    "/api/carrito/:path*", // APIs de carrito
    "/api/checkout/:path*", // APIs de checkout
    "/api/usuarios/:path*", // APIs de usuarios
    "/api/auth/me", // API de verificación
  ],
};
