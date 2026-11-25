import jwt from 'jsonwebtoken';
import { config } from '../../config.js';

export function requireAuth(req, res, next) {
  const header = req.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'No autenticado' });
  try {
    // Algoritmo fijado: evita ataques "alg: none" / confusión de algoritmos
    req.user = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch {
    res.status(401).json({ error: 'Sesión expirada o token inválido' });
  }
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'Sin permisos' });
