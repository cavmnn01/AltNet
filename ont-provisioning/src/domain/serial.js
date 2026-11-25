import { z } from 'zod';

export function normalizeSerial(input) {
  let serial = String(input).trim().toUpperCase().replace(/[:\-.\s]/g, '');
  if (/^HWTC[0-9A-F]{8}$/.test(serial)) serial = `48575443${serial.slice(4)}`;
  return serial;
}

export const serialSchema = z
  .string()
  .min(8)
  .max(40)
  .transform(normalizeSerial)
  .pipe(z.string().regex(/^([0-9A-F]{16}|[A-Z]{4}[0-9A-F]{8}|[0-9A-F]{12})$/, 'Serial o MAC inválido'));
