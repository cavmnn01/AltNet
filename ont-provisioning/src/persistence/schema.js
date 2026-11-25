import {
  pgTable, pgEnum, serial, varchar, integer, boolean, timestamp, real, text, index,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('technician_role', ['technician', 'admin']);
export const orderStatusEnum = pgEnum('work_order_status', ['pending', 'in_progress', 'completed', 'failed']);
export const logResultEnum = pgEnum('log_result', ['success', 'rejected', 'error', 'info']);

export const technicians = pgTable('technicians', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 100 }).notNull(),
  fullName: varchar('full_name', { length: 120 }).notNull(),
  role: roleEnum('role').notNull().default('technician'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Planes de internet (perfil de servicio en la OLT)
export const serviceProfiles = pgTable('service_profiles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 80 }).notNull(),
  vlan: integer('vlan').notNull(),
  downMbps: integer('down_mbps').notNull(),
  upMbps: integer('up_mbps').notNull(),
  oltProfileName: varchar('olt_profile_name', { length: 40 }).notNull().unique(),
  active: boolean('active').notNull().default(true),
});

export const workOrders = pgTable('work_orders', {
  id: serial('id').primaryKey(),
  customerName: varchar('customer_name', { length: 120 }).notNull(),
  address: text('address').notNull(),
  technicianId: integer('technician_id').references(() => technicians.id),
  serviceProfileId: integer('service_profile_id').references(() => serviceProfiles.id),
  status: orderStatusEnum('status').notNull().default('pending'),
  ontSerial: varchar('ont_serial', { length: 32 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const provisioningLogs = pgTable(
  'provisioning_logs',
  {
    id: serial('id').primaryKey(),
    workOrderId: integer('work_order_id').references(() => workOrders.id),
    technicianId: integer('technician_id').references(() => technicians.id).notNull(),
    serial: varchar('serial', { length: 32 }).notNull(),
    rxPowerDbm: real('rx_power_dbm'),
    txPowerDbm: real('tx_power_dbm'),
    action: varchar('action', { length: 30 }).notNull(), // discover | authorize
    result: logResultEnum('result').notNull(),
    message: text('message'),
    ip: varchar('ip', { length: 64 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('logs_serial_idx').on(t.serial), index('logs_tech_idx').on(t.technicianId)],
);
