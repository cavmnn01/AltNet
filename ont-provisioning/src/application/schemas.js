import { z } from 'zod';
import { serialSchema } from '../domain/serial.js';

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().min(8).max(128),
});

export const discoverSchema = z.object({ serial: serialSchema });

export const authorizeSchema = z.object({
  serial: serialSchema,
  serviceProfileId: z.number().int().positive(),
  workOrderId: z.number().int().positive().optional(),
});
