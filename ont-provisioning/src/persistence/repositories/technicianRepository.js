import { eq } from 'drizzle-orm';
import { technicians } from '../schema.js';

export function createTechnicianRepository(db) {
  return {
    async findByUsername(username) {
      const [technician] = await db
        .select()
        .from(technicians)
        .where(eq(technicians.username, username))
        .limit(1);
      return technician;
    },
  };
}
