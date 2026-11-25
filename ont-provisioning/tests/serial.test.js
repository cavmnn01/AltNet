import { describe, expect, it } from 'vitest';
import { normalizeSerial, serialSchema } from '../src/domain/serial.js';

describe('ONT serial validation', () => {
  it('normalizes Huawei serials and separated MAC addresses', () => {
    expect(normalizeSerial(' hwtc1a2b3c4d ')).toBe('485754431A2B3C4D');
    expect(serialSchema.parse('A4:2B:B0:11:22:33')).toBe('A42BB0112233');
  });

  it('rejects values outside supported serial formats', () => {
    expect(serialSchema.safeParse('HWTC12345678;NOPE').success).toBe(false);
    expect(serialSchema.safeParse('not-a-device').success).toBe(false);
  });
});
