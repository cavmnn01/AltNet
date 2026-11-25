import rateLimit from 'express-rate-limit';

const base = { standardHeaders: 'draft-7', legacyHeaders: false };

// Capa general por IP (app-layer; ver README sobre DDoS volumétrico)
export const globalLimiter = rateLimit({
  ...base,
  windowMs: 60_000,
  limit: 100,
  message: { error: 'Demasiadas solicitudes, intenta en un minuto.' },
});

// Fuerza bruta de login: 5 fallos / 15 min por IP (los logins correctos no cuentan)
export const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Demasiados intentos de acceso. Espera 15 minutos.' },
});

// Aprovisionamiento: por técnico autenticado (se monta DESPUÉS de requireAuth)
export const provisioningLimiter = rateLimit({
  ...base,
  windowMs: 60_000,
  limit: 20,
  keyGenerator: (req) => `tech:${req.user.sub}`,
  message: { error: 'Límite de operaciones de aprovisionamiento excedido.' },
});
