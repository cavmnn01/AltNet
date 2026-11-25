import { Router } from 'express';
import { authorizeSchema, discoverSchema } from '../../application/schemas.js';
import { createProvisioningController } from '../controllers/provisioningController.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { provisioningLimiter } from '../middleware/limiters.js';
import { validate } from '../middleware/validate.js';

export function createProvisioningRoutes(provisioningService) {
  const router = Router();
  const controller = createProvisioningController(provisioningService);
  router.use(requireAuth, requireRole('technician', 'admin'));
  router.get('/service-profiles', asyncHandler(controller.listServiceProfiles));
  router.post('/discover', provisioningLimiter, validate(discoverSchema), asyncHandler(controller.discover));
  router.post('/authorize', provisioningLimiter, validate(authorizeSchema), asyncHandler(controller.authorize));
  return router;
}
