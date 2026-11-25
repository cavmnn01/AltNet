import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { ApplicationError } from './errors.js';

const DUMMY_HASH = bcrypt.hashSync('dummy-password', 12);

export function createAuthenticationService(technicianRepository) {
  return {
    async login({ username, password }) {
      const technician = await technicianRepository.findByUsername(username);
      const passwordMatches = await bcrypt.compare(password, technician?.passwordHash ?? DUMMY_HASH);
      if (!technician || !technician.active || !passwordMatches) {
        throw new ApplicationError(401, 'Credenciales inválidas');
      }

      const token = jwt.sign(
        { sub: String(technician.id), role: technician.role, name: technician.fullName },
        config.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: config.JWT_EXPIRES_IN },
      );
      return {
        token,
        technician: { id: technician.id, name: technician.fullName, role: technician.role },
      };
    },
  };
}
