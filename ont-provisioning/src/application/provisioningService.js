import { ApplicationError } from './errors.js';

const MIN_RX_DBM = -25;

export function createProvisioningService({ provisioningRepository, oltGateway }) {
  return {
    listServiceProfiles() {
      return provisioningRepository.listActiveServiceProfiles();
    },

    async discover({ serial, technicianId, ip }) {
      const log = { technicianId, serial, action: 'discover', ip };
      const ont = await oltGateway.discoverOnt(serial);
      if (!ont) {
        await provisioningRepository.writeLog({
          ...log,
          result: 'rejected',
          message: 'Serial no encontrado entre ONTs no aprovisionadas',
        });
        throw new ApplicationError(
          404,
          'ONT no detectada en la OLT. Verifica que esté encendida y conectada.',
        );
      }

      await provisioningRepository.writeLog({
        ...log,
        result: 'info',
        rxPowerDbm: ont.rxPowerDbm,
        txPowerDbm: ont.txPowerDbm,
        message: 'Descubierta',
      });
      return { ...ont, minRxDbm: MIN_RX_DBM, signalOk: ont.rxPowerDbm > MIN_RX_DBM };
    },

    async authorize({ serial, serviceProfileId, workOrderId, technicianId, role, ip }) {
      const log = {
        technicianId,
        serial,
        action: 'authorize',
        workOrderId: workOrderId ?? null,
        ip,
      };
      const profile = await provisioningRepository.findActiveServiceProfile(serviceProfileId);
      if (!profile) throw new ApplicationError(400, 'Perfil de servicio inválido');

      if (workOrderId) {
        const workOrder = await provisioningRepository.findWorkOrder(workOrderId);
        const available = workOrder &&
          ['pending', 'in_progress'].includes(workOrder.status) &&
          (role === 'admin' || workOrder.technicianId === null || workOrder.technicianId === technicianId);
        if (!available) {
          throw new ApplicationError(403, 'Orden de trabajo no disponible para este técnico');
        }
      }

      const ont = await oltGateway.discoverOnt(serial);
      if (!ont) throw new ApplicationError(404, 'ONT no detectada en la OLT');
      if (ont.alreadyProvisioned) throw new ApplicationError(409, 'La ONT ya fue aprovisionada');

      const power = { rxPowerDbm: ont.rxPowerDbm, txPowerDbm: ont.txPowerDbm };
      if (!(ont.rxPowerDbm > MIN_RX_DBM)) {
        const message = `Potencia Rx ${ont.rxPowerDbm} dBm fuera de rango (mínimo ${MIN_RX_DBM} dBm). Revisa fibra y conectores.`;
        await provisioningRepository.writeLog({
          ...log,
          ...power,
          result: 'rejected',
          message,
        });
        throw new ApplicationError(422, message, { rxPowerDbm: ont.rxPowerDbm });
      }

      try {
        await oltGateway.authorizeOnt({
          serial,
          profile: profile.oltProfileName,
          vlan: profile.vlan,
        });
      } catch (error) {
        console.error('OLT error:', error.message);
        await provisioningRepository.writeLog({
          ...log,
          ...power,
          result: 'error',
          message: 'Fallo al comunicarse con la OLT',
        });
        throw new ApplicationError(502, 'No se pudo completar el aprovisionamiento en la OLT');
      }

      await provisioningRepository.completeAuthorization({
        workOrderId,
        workOrder: workOrderId
          ? { status: 'completed', ontSerial: serial, serviceProfileId, technicianId, completedAt: new Date() }
          : null,
        log: {
          ...log,
          ...power,
          result: 'success',
          message: `Autorizada con perfil ${profile.oltProfileName} (VLAN ${profile.vlan})`,
        },
      });
      return { success: true, message: `ONT ${serial} aprovisionada con ${profile.name}`, ...power };
    },
  };
}
