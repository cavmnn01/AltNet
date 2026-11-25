import { z } from 'zod';

const env = z
  .object({
    NODE_ENV: z.string().default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
    JWT_EXPIRES_IN: z.string().default('8h'), // un turno de trabajo
    CORS_ORIGINS: z.string().min(1),
    SEED_TECH_USER: z.string().optional(),
    SEED_TECH_PASSWORD: z.string().optional(),
  })
  .parse(process.env); // si falta algo crítico, el proceso no arranca

export const config = {
  ...env,
  corsOrigins: env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
  isProd: env.NODE_ENV === 'production',
};
