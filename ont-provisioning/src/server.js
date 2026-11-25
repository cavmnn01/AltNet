import { createAuthenticationService } from './application/authenticationService.js';
import { createProvisioningService } from './application/provisioningService.js';
import { config } from './config.js';
import { db, pool } from './persistence/database.js';
import { createProvisioningRepository } from './persistence/repositories/provisioningRepository.js';
import { createTechnicianRepository } from './persistence/repositories/technicianRepository.js';
import * as oltGateway from './persistence/oltGateway.js';
import { createApp } from './app.js';

export function startServer() {
  const authenticationService = createAuthenticationService(createTechnicianRepository(db));
  const provisioningService = createProvisioningService({
    provisioningRepository: createProvisioningRepository(db),
    oltGateway,
  });
  const app = createApp({ authenticationService, provisioningService });
  const server = app.listen(config.PORT, () => {
    console.log(`API escuchando en :${config.PORT}`);
  });
  server.on('close', () => pool.end());
  return server;
}
