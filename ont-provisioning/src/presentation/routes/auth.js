import { Router } from 'express';
import { loginSchema } from '../../application/schemas.js';
import { createAuthController } from '../controllers/authController.js';
import { asyncHandler } from '../asyncHandler.js';
import { loginLimiter } from '../middleware/limiters.js';
import { validate } from '../middleware/validate.js';

export function createAuthRoutes(authenticationService) {
  const router = Router();
  const controller = createAuthController(authenticationService);
  router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(controller.login));
  return router;
}
