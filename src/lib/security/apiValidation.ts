import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyJwt } from "@/lib/auth";
import {
  sanitizeObject,
  isSuspiciousInput,
  detectSQLInjection,
  detectXSS,
} from "./sanitize";
import { securityLogger } from "./logger";

export interface ApiValidationConfig {
  requireAuth?: boolean;
  allowedRoles?: ("admin" | "cliente")[];
  schema?: z.ZodSchema;
  rateLimit?: (
    req: NextRequest,
    identifier?: string
  ) => Promise<NextResponse | null>;
  maxBodySize?: number;
  allowedMethods?: string[];
}

interface ValidatedRequest {
  user: {
    id: number;
    email: string;
    rol: "admin" | "cliente";
  } | null;
  body: unknown;
  ip: string;
  userAgent: string;
}

function getClientInfo(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = req.headers.get("user-agent") || "unknown";

  return { ip, userAgent };
}

async function checkAuth(
  req: NextRequest,
  config: ApiValidationConfig
): Promise<{ user: ValidatedRequest["user"]; response: NextResponse | null }> {
  if (!config.requireAuth) {
    return { user: null, response: null };
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    const { ip } = getClientInfo(req);
    securityLogger.unauthorizedAccess(req.nextUrl.pathname, ip);

    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: "No autenticado" },
        { status: 401 }
      ),
    };
  }

  const user = verifyJwt(token);

  if (!user) {
    const { ip } = getClientInfo(req);
    securityLogger.unauthorizedAccess(req.nextUrl.pathname, ip);

    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: "Token inválido o expirado" },
        { status: 401 }
      ),
    };
  }

  if (config.allowedRoles && !config.allowedRoles.includes(user.rol)) {
    const { ip } = getClientInfo(req);
    securityLogger.unauthorizedAccess(
      req.nextUrl.pathname,
      ip,
      user.id,
      user.email
    );

    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "No tenés permisos para acceder a este recurso",
        },
        { status: 403 }
      ),
    };
  }

  return { user, response: null };
}

async function validateBody(
  req: NextRequest,
  config: ApiValidationConfig
): Promise<{ body: unknown; response: NextResponse | null }> {
  if (req.method === "GET" || req.method === "DELETE") {
    return { body: null, response: null };
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return {
        body: null,
        response: NextResponse.json(
          {
            success: false,
            message: "Content-Type debe ser application/json",
          },
          { status: 400 }
        ),
      };
    }

    const text = await req.text();

    if (config.maxBodySize && text.length > config.maxBodySize) {
      const { ip } = getClientInfo(req);
      securityLogger.suspiciousActivity(
        "BODY_TOO_LARGE",
        ip,
        req.nextUrl.pathname,
        { size: text.length, maxSize: config.maxBodySize }
      );

      return {
        body: null,
        response: NextResponse.json(
          { success: false, message: "Body demasiado grande" },
          { status: 413 }
        ),
      };
    }

    if (isSuspiciousInput(text)) {
      const { ip } = getClientInfo(req);

      if (detectSQLInjection(text)) {
        securityLogger.sqlInjectionAttempt(ip, text, req.nextUrl.pathname);
      }

      if (detectXSS(text)) {
        securityLogger.xssAttempt(ip, text, req.nextUrl.pathname);
      }

      return {
        body: null,
        response: NextResponse.json(
          { success: false, message: "Input sospechoso detectado" },
          { status: 400 }
        ),
      };
    }

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return {
        body: null,
        response: NextResponse.json(
          { success: false, message: "JSON inválido" },
          { status: 400 }
        ),
      };
    }

    if (config.schema) {
      const validation = config.schema.safeParse(body);

      if (!validation.success) {
        return {
          body: null,
          response: NextResponse.json(
            {
              success: false,
              message: "Datos inválidos",
              errors: validation.error.flatten().fieldErrors,
            },
            { status: 400 }
          ),
        };
      }

      body = validation.data;
    }

    if (typeof body === "object" && body !== null) {
      body = sanitizeObject(body as Record<string, unknown>);
    }

    return { body, response: null };
  } catch (error) {
    console.error("Error validando body:", error);
    return {
      body: null,
      response: NextResponse.json(
        { success: false, message: "Error procesando la solicitud" },
        { status: 500 }
      ),
    };
  }
}

function checkMethod(
  req: NextRequest,
  config: ApiValidationConfig
): NextResponse | null {
  if (!config.allowedMethods || config.allowedMethods.length === 0) {
    return null;
  }

  if (!config.allowedMethods.includes(req.method)) {
    return NextResponse.json(
      {
        success: false,
        message: `Método ${req.method} no permitido`,
        allowedMethods: config.allowedMethods,
      },
      {
        status: 405,
        headers: { Allow: config.allowedMethods.join(", ") },
      }
    );
  }

  return null;
}

export async function validateApiRequest(
  req: NextRequest,
  config: ApiValidationConfig = {}
): Promise<{ validated: ValidatedRequest; response: NextResponse | null }> {
  const { ip, userAgent } = getClientInfo(req);

  const methodCheck = checkMethod(req, config);
  if (methodCheck) {
    return {
      validated: { user: null, body: null, ip, userAgent },
      response: methodCheck,
    };
  }

  if (config.rateLimit) {
    const rateLimitResponse = await config.rateLimit(req);
    if (rateLimitResponse) {
      securityLogger.rateLimitExceeded(ip, req.nextUrl.pathname, userAgent);
      return {
        validated: { user: null, body: null, ip, userAgent },
        response: rateLimitResponse,
      };
    }
  }

  const { user, response: authResponse } = await checkAuth(req, config);
  if (authResponse) {
    return {
      validated: { user: null, body: null, ip, userAgent },
      response: authResponse,
    };
  }

  const { body, response: bodyResponse } = await validateBody(req, config);
  if (bodyResponse) {
    return {
      validated: { user, body: null, ip, userAgent },
      response: bodyResponse,
    };
  }

  return {
    validated: { user, body, ip, userAgent },
    response: null,
  };
}

export function createApiHandler(
  config: ApiValidationConfig,
  handler: (
    req: NextRequest,
    validated: ValidatedRequest
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { validated, response } = await validateApiRequest(req, config);

      if (response) {
        return response;
      }

      return await handler(req, validated);
    } catch (error) {
      console.error("Error en API handler:", error);

      const { ip } = getClientInfo(req);
      securityLogger.error(`Error en ${req.nextUrl.pathname}`, error, {
        ip,
        method: req.method,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Error interno del servidor",
          ...(process.env.NODE_ENV === "development" && {
            error: error instanceof Error ? error.message : String(error),
          }),
        },
        { status: 500 }
      );
    }
  };
}

export function handleApiError(error: unknown, req: NextRequest): NextResponse {
  console.error("API Error:", error);

  const { ip } = getClientInfo(req);
  securityLogger.error(`Error en ${req.nextUrl.pathname}`, error, {
    ip,
    method: req.method,
  });

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validación fallida",
        errors: error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const errorMessage =
    error instanceof Error ? error.message : "Error interno del servidor";

  return NextResponse.json(
    {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? errorMessage
          : "Error interno del servidor",
    },
    { status: 500 }
  );
}
