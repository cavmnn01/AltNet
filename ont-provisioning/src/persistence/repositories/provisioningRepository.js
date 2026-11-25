import { and, eq } from 'drizzle-orm';
import { provisioningLogs, serviceProfiles, workOrders } from '../schema.js';

export function createProvisioningRepository(db) {
  return {
    listActiveServiceProfiles() {
      return db
        .select()
        .from(serviceProfiles)
        .where(eq(serviceProfiles.active, true));
    },

    async findActiveServiceProfile(id) {
      const [profile] = await db
        .select()
        .from(serviceProfiles)
        .where(and(eq(serviceProfiles.id, id), eq(serviceProfiles.active, true)));
      return profile;
    },

    async findWorkOrder(id) {
      const [workOrder] = await db
        .select()
        .from(workOrders)
        .where(eq(workOrders.id, id));
      return workOrder;
    },

    writeLog(values) {
      return db.insert(provisioningLogs).values(values);
    },

    completeAuthorization({ workOrderId, workOrder, log }) {
      return db.transaction(async (tx) => {
        if (workOrderId) {
          await tx.update(workOrders).set(workOrder).where(eq(workOrders.id, workOrderId));
        }
        await tx.insert(provisioningLogs).values(log);
      });
    },
  };
}
