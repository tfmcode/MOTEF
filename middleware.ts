import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth";
import {
  applySecurityMiddleware,
  addSecurityHeadersToResponse,
} from "@/lib/security/securityMiddleware";
import { apiRateLimit } from "@/lib/security/rateLimit";
import { securityLogger } from "@/lib/security/logger";

export async function middleware(request: NextRequest) {
  const startTime = Date.now();

  const securityCheck = applySecurityMiddleware(request);
  if (securityCheck) {
    return addSecurityHeadersToResponse(securityCheck);
  }

  const path = request.nextUrl.pathname;
  const isApiRoute = path.startsWith("/api/");

  if (isApiRoute && !path.startsWith("/api/webhooks")) {
    const rateLimitResponse = await apiRateLimit(request);
    if (rateLimitResponse) {
      return addSecurityHeadersToResponse(rateLimitResponse);
    }
  }

  const token = request.cookies.get("token")?.value;

  if (!token && requiresAuth(path)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    const user = verifyJwt(token);

    if (!user) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");

      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
      securityLogger.unauthorizedAccess(path, ip);

      return addSecurityHeadersToResponse(response);
    }

    if (path.startsWith("/panel/admin") && user.rol !== "admin") {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
      securityLogger.unauthorizedAccess(path, ip, user.id, user.email);

      return addSecurityHeadersToResponse(
        NextResponse.redirect(new URL("/unauthorized", request.url))
      );
    }

    if (path.startsWith("/cuenta") && user.rol !== "cliente") {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
      securityLogger.unauthorizedAccess(path, ip, user.id, user.email);

      return addSecurityHeadersToResponse(
        NextResponse.redirect(new URL("/unauthorized", request.url))
      );
    }

    if (isApiRoute) {
      const adminApis = ["/api/admin/", "/api/usuarios"];
      const clienteApis = ["/api/cuenta/", "/api/carrito", "/api/checkout"];

      if (
        adminApis.some((api) => path.startsWith(api)) &&
        user.rol !== "admin"
      ) {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
        securityLogger.unauthorizedAccess(path, ip, user.id, user.email);

        return addSecurityHeadersToResponse(
          NextResponse.json(
            { success: false, message: "No autorizado" },
            { status: 403 }
          )
        );
      }

      if (
        clienteApis.some((api) => path.startsWith(api)) &&
        user.rol !== "cliente"
      ) {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
        securityLogger.unauthorizedAccess(path, ip, user.id, user.email);

        return addSecurityHeadersToResponse(
          NextResponse.json(
            { success: false, message: "No autorizado" },
            { status: 403 }
          )
        );
      }
    }
  }

  const response = NextResponse.next();

  const duration = Date.now() - startTime;
  response.headers.set("X-Response-Time", `${duration}ms`);

  if (process.env.NODE_ENV === "development" && duration > 1000) {
    console.warn(`⚠️ Respuesta lenta: ${path} - ${duration}ms`);
  }

  return addSecurityHeadersToResponse(response);
}

function requiresAuth(path: string): boolean {
  const protectedPaths = [
    "/panel",
    "/cuenta",
    "/api/admin",
    "/api/cuenta",
    "/api/carrito",
    "/api/checkout",
    "/api/usuarios",
    "/api/auth/me",
  ];

  return protectedPaths.some((protectedPath) => path.startsWith(protectedPath));
}

export const config = {
  matcher: [
    "/api/:path*",
    "/panel/:path*",
    "/cuenta/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
