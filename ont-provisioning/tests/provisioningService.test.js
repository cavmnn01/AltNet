import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationError } from '../src/application/errors.js';
import { createProvisioningService } from '../src/application/provisioningService.js';

const profile = {
  id: 1,
  name: 'Residencial 100 Mbps',
  vlan: 110,
  oltProfileName: 'RES_100M',
};

describe('ONT provisioning use cases', () => {
  let provisioningRepository;
  let oltGateway;
  let service;

  beforeEach(() => {
    provisioningRepository = {
      listActiveServiceProfiles: vi.fn().mockResolvedValue([profile]),
      findActiveServiceProfile: vi.fn().mockResolvedValue(profile),
      findWorkOrder: vi.fn().mockResolvedValue(null),
      writeLog: vi.fn().mockResolvedValue(undefined),
      completeAuthorization: vi.fn().mockResolvedValue(undefined),
    };
    oltGateway = {
      discoverOnt: vi.fn(),
      authorizeOnt: vi.fn().mockResolvedValue(undefined),
    };
    service = createProvisioningService({ provisioningRepository, oltGateway });
  });

  it('reports weak optical signal during discovery without hiding the ONT', async () => {
    oltGateway.discoverOnt.mockResolvedValue({
      serial: '485754430F0F0F0F',
      rxPowerDbm: -26.4,
      txPowerDbm: 2,
      alreadyProvisioned: false,
    });

    const result = await service.discover({
      serial: '485754430F0F0F0F',
      technicianId: 7,
      ip: '127.0.0.1',
    });

    expect(result.signalOk).toBe(false);
    expect(result.minRxDbm).toBe(-25);
    expect(provisioningRepository.writeLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'discover', result: 'info', technicianId: 7 }),
    );
  });

  it('rejects authorization when Rx power is below the minimum', async () => {
    oltGateway.discoverOnt.mockResolvedValue({
      serial: '485754430F0F0F0F',
      rxPowerDbm: -26.4,
      txPowerDbm: 2,
      alreadyProvisioned: false,
    });

    await expect(service.authorize({
      serial: '485754430F0F0F0F',
      serviceProfileId: 1,
      technicianId: 7,
      role: 'technician',
      ip: '127.0.0.1',
    })).rejects.toMatchObject({ status: 422 });

    expect(oltGateway.authorizeOnt).not.toHaveBeenCalled();
    expect(provisioningRepository.writeLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'authorize', result: 'rejected', rxPowerDbm: -26.4 }),
    );
  });

  it('authorizes a healthy ONT and records the successful provisioning', async () => {
    provisioningRepository.findWorkOrder.mockResolvedValue({
      status: 'pending',
      technicianId: 7,
    });
    oltGateway.discoverOnt.mockResolvedValue({
      serial: '485754431A2B3C4D',
      rxPowerDbm: -19.8,
      txPowerDbm: 2.1,
      alreadyProvisioned: false,
    });

    const result = await service.authorize({
      serial: '485754431A2B3C4D',
      serviceProfileId: 1,
      workOrderId: 12,
      technicianId: 7,
      role: 'technician',
      ip: '127.0.0.1',
    });

    expect(oltGateway.authorizeOnt).toHaveBeenCalledWith({
      serial: '485754431A2B3C4D',
      profile: 'RES_100M',
      vlan: 110,
    });
    expect(provisioningRepository.completeAuthorization).toHaveBeenCalledWith(
      expect.objectContaining({
        workOrderId: 12,
        workOrder: expect.objectContaining({ status: 'completed', technicianId: 7 }),
        log: expect.objectContaining({ result: 'success', rxPowerDbm: -19.8 }),
      }),
    );
    expect(result.success).toBe(true);
  });

  it('rejects invalid service profiles before contacting the OLT', async () => {
    provisioningRepository.findActiveServiceProfile.mockResolvedValue(undefined);

    await expect(service.authorize({
      serial: '485754431A2B3C4D',
      serviceProfileId: 999,
      technicianId: 7,
      role: 'technician',
      ip: '127.0.0.1',
    })).rejects.toBeInstanceOf(ApplicationError);

    expect(oltGateway.discoverOnt).not.toHaveBeenCalled();
  });
});
