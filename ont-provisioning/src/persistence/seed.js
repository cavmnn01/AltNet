import bcrypt from 'bcryptjs';
import { db, pool } from './database.js';
import { technicians, serviceProfiles, workOrders } from './schema.js';
import { config } from '../config.js';

if (config.SEED_TECH_USER && config.SEED_TECH_PASSWORD) {
  const passwordHash = await bcrypt.hash(config.SEED_TECH_PASSWORD, 12);
  await db
    .insert(technicians)
    .values({ username: config.SEED_TECH_USER, passwordHash, fullName: 'Técnico de Campo', role: 'technician' })
    .onConflictDoUpdate({
      target: technicians.username,
      set: { passwordHash, fullName: 'Técnico de Campo', role: 'technician', active: true },
    });
}

await db
  .insert(serviceProfiles)
  .values([
    { name: 'Residencial 100 Mbps', vlan: 110, downMbps: 100, upMbps: 50, oltProfileName: 'RES_100M' },
    { name: 'Residencial 300 Mbps', vlan: 120, downMbps: 300, upMbps: 150, oltProfileName: 'RES_300M' },
    { name: 'Empresarial 1 Gbps', vlan: 200, downMbps: 1000, upMbps: 1000, oltProfileName: 'BIZ_1G' },
  ])
  .onConflictDoNothing();

const existing = await db.select().from(workOrders).limit(1);
if (existing.length === 0) {
  await db.insert(workOrders).values({ customerName: 'Cliente Demo', address: 'Manta, Manabí', status: 'pending' });
}

console.log('Seed OK');
await pool.end();
