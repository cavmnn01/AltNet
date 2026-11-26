import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { ApplicationError } from './application/errors.js';
import { config } from './config.js';
import { createAuthRoutes } from './presentation/routes/auth.js';
import { createProvisioningRoutes } from './presentation/routes/provisioning.js';
import { globalLimiter } from './presentation/middleware/limiters.js';

export function createApp({ authenticationService, provisioningService }) {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      return callback(Object.assign(new Error('Origen no permitido'), { status: 403 }));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  }));
  app.use(globalLimiter);
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/openapi.json', (_req, res) => {
    res.sendFile(new URL('../docs/openapi.json', import.meta.url));
  });
  app.use('/api/auth', createAuthRoutes(authenticationService));
  app.use('/api/provisioning', createProvisioningRoutes(provisioningService));

  app.use((_req, res) => res.status(404).json({ error: 'No encontrado' }));
  app.use((error, _req, res, _next) => {
    if (error instanceof ApplicationError) {
      return res.status(error.status).json({
        error: error.message,
        ...(error.details ? error.details : {}),
      });
    }

    const status = error.status ?? (error.type === 'entity.parse.failed' ? 400 : 500);
    if (status >= 500) console.error(error);
    return res.status(status).json({
      error: status >= 500 ? 'Error interno' : error.message,
    });
  });

  return app;
}
