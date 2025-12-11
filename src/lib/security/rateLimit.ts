import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

function cleanupExpiredEntries() {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

setInterval(cleanupExpiredEntries, 60000);

export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = "Demasiadas solicitudes. Intentá más tarde.",
    skipSuccessfulRequests = false,
  } = config;

  return async (
    req: NextRequest,
    identifier?: string
  ): Promise<NextResponse | null> => {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const key = identifier || `${ip}:${req.nextUrl.pathname}`;
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return null;
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);

      return NextResponse.json(
        {
          success: false,
          message,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(store[key].resetTime).toISOString(),
          },
        }
      );
    }

    if (!skipSuccessfulRequests) {
      return null;
    }

    return null;
  };
}

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: "Demasiados intentos de login. Intentá en 15 minutos.",
});

export const registroRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
  message: "Demasiados registros desde esta IP. Intentá en 1 hora.",
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: "Límite de solicitudes excedido. Intentá en 1 minuto.",
});

export const checkoutRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  maxRequests: 3,
  message: "Demasiados intentos de compra. Intentá en 5 minutos.",
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: "Demasiadas subidas de archivos. Intentá en 1 minuto.",
});

export function getRateLimitInfo(req: NextRequest, identifier?: string) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const key = identifier || `${ip}:${req.nextUrl.pathname}`;
  const record = store[key];

  if (!record) {
    return null;
  }

  const now = Date.now();
  const remaining = Math.max(0, record.resetTime - now);

  return {
    count: record.count,
    resetTime: record.resetTime,
    remaining: Math.ceil(remaining / 1000),
  };
}
