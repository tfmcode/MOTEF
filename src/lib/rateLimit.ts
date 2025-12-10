// src/lib/rateLimit.ts
import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: "Demasiados intentos de login. Intentá en 15 minutos.",
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // 60 requests
  message: "Demasiadas solicitudes. Intentá más tarde.",
});
