import { NextRequest, NextResponse } from "next/server";
import { addSecurityHeaders } from "./securityHeaders";
import { securityLogger } from "./logger";
import { detectSQLInjection, detectXSS } from "./sanitize";

const PROTECTED_PATHS = [
  "/api/admin",
  "/api/cuenta",
  "/api/carrito",
  "/api/checkout",
  "/api/usuarios",
  "/panel",
];

const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/registro",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/productos",
  "/api/categorias",
  "/login",
  "/registro",
];

const RATE_LIMIT_EXEMPT_PATHS = ["/api/webhooks"];

interface SecurityCheckResult {
  allowed: boolean;
  response?: NextResponse;
  reason?: string;
}

function getClientInfo(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = req.headers.get("user-agent") || "unknown";

  return { ip, userAgent };
}

function checkSuspiciousPatterns(req: NextRequest): SecurityCheckResult {
  const { ip } = getClientInfo(req);
  const url = req.nextUrl;

  const suspiciousPatterns = [
    /\.\.\/|\.\.\\/,
    /<script|javascript:|onerror=|onload=/i,
    /union.*select|insert.*into|drop.*table/i,
    /eval\(|exec\(|system\(/i,
    /cmd\.exe|powershell|bash/i,
  ];

  const fullUrl = url.toString();

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl)) {
      securityLogger.suspiciousActivity(
        "SUSPICIOUS_URL_PATTERN",
        ip,
        url.pathname,
        { pattern: pattern.toString(), url: fullUrl }
      );

      return {
        allowed: false,
        response: NextResponse.json(
          { success: false, message: "Solicitud rechazada" },
          { status: 400 }
        ),
        reason: "Patrón sospechoso en URL",
      };
    }
  }

  const queryString = url.search;
  if (queryString) {
    if (detectSQLInjection(queryString)) {
      securityLogger.sqlInjectionAttempt(ip, queryString, url.pathname);
      return {
        allowed: false,
        response: NextResponse.json(
          { success: false, message: "Solicitud rechazada" },
          { status: 400 }
        ),
        reason: "SQL Injection detectado",
      };
    }

    if (detectXSS(queryString)) {
      securityLogger.xssAttempt(ip, queryString, url.pathname);
      return {
        allowed: false,
        response: NextResponse.json(
          { success: false, message: "Solicitud rechazada" },
          { status: 400 }
        ),
        reason: "XSS detectado",
      };
    }
  }

  return { allowed: true };
}

function checkCSRF(req: NextRequest): SecurityCheckResult {
  if (req.method === "GET" || req.method === "HEAD") {
    return { allowed: true };
  }

  if (req.nextUrl.pathname.startsWith("/api/webhooks")) {
    return { allowed: true };
  }

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    `https://${host}`,
    `http://${host}`,
    "http://localhost:3000",
  ].filter(Boolean);

  if (origin) {
    const isAllowed = allowedOrigins.some((allowed) =>
      origin.startsWith(allowed!)
    );

    if (!isAllowed) {
      const { ip } = getClientInfo(req);
      securityLogger.suspiciousActivity(
        "CSRF_ORIGIN_MISMATCH",
        ip,
        req.nextUrl.pathname,
        { origin, allowedOrigins }
      );

      return {
        allowed: false,
        response: NextResponse.json(
          { success: false, message: "Origen no permitido" },
          { status: 403 }
        ),
        reason: "CSRF - Origen no válido",
      };
    }
  }

  return { allowed: true };
}

function checkFileUploadSecurity(req: NextRequest): SecurityCheckResult {
  if (!req.nextUrl.pathname.includes("/upload")) {
    return { allowed: true };
  }

  const contentType = req.headers.get("content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return { allowed: true };
  }

  const contentLength = req.headers.get("content-length");
  const maxSize = 10 * 1024 * 1024;

  if (contentLength && parseInt(contentLength) > maxSize) {
    const { ip } = getClientInfo(req);
    securityLogger.suspiciousActivity(
      "FILE_TOO_LARGE",
      ip,
      req.nextUrl.pathname,
      { size: contentLength, maxSize }
    );

    return {
      allowed: false,
      response: NextResponse.json(
        { success: false, message: "Archivo demasiado grande (máx 10MB)" },
        { status: 413 }
      ),
      reason: "Archivo muy grande",
    };
  }

  return { allowed: true };
}

function logRequest(req: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    const { ip } = getClientInfo(req);
    console.log(`📨 ${req.method} ${req.nextUrl.pathname} - IP: ${ip}`);
  }
}

export function applySecurityMiddleware(req: NextRequest): NextResponse | null {
  logRequest(req);

  const patternCheck = checkSuspiciousPatterns(req);
  if (!patternCheck.allowed) {
    return patternCheck.response!;
  }

  const csrfCheck = checkCSRF(req);
  if (!csrfCheck.allowed) {
    return csrfCheck.response!;
  }

  const fileCheck = checkFileUploadSecurity(req);
  if (!fileCheck.allowed) {
    return fileCheck.response!;
  }

  return null;
}

export function addSecurityHeadersToResponse(
  response: NextResponse
): NextResponse {
  return addSecurityHeaders(response);
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

export function shouldApplyRateLimit(pathname: string): boolean {
  return !RATE_LIMIT_EXEMPT_PATHS.some((path) => pathname.startsWith(path));
}

export function handleSecurityError(
  error: unknown,
  req: NextRequest
): NextResponse {
  const { ip } = getClientInfo(req);

  securityLogger.error(`Error de seguridad en ${req.nextUrl.pathname}`, error, {
    ip,
    method: req.method,
  });

  return NextResponse.json(
    {
      success: false,
      message: "Error de seguridad",
    },
    { status: 500 }
  );
}
