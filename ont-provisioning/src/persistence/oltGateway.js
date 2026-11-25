/**
 * SIMULACIÓN de la OLT. Sustituye por tu integración real.
  */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ONTs "no aprovisionadas" detectadas por la OLT (datos demo)
const UNPROVISIONED = new Map([
  ['485754431A2B3C4D', { model: 'Huawei HG8145V5', port: '0/1/3', rxPowerDbm: -19.8, txPowerDbm: 2.1 }],
  ['485754430F0F0F0F', { model: 'Huawei HG8010H', port: '0/1/4', rxPowerDbm: -26.4, txPowerDbm: 2.0 }], // señal débil
  ['ZTEG12345678', { model: 'ZTE F670L', port: '0/2/1', rxPowerDbm: -22.1, txPowerDbm: 2.3 }],
  ['A42BB0112233', { model: 'TP-Link XC220-G3v', port: '0/2/7', rxPowerDbm: -21.0, txPowerDbm: 1.9 }],
]);
const PROVISIONED = new Set();

export async function discoverOnt(serial) {
  await delay(400); // latencia simulada
  const ont = UNPROVISIONED.get(serial);
  if (!ont) return null;
  return { serial, ...ont, alreadyProvisioned: PROVISIONED.has(serial) };
}

const SAFE = /^[A-Z0-9_]+$/;
export function buildAuthCommand({ serial, port, profile, vlan }) {
  if (![serial, profile].every((v) => SAFE.test(v)) || !/^\d+\/\d+\/\d+$/.test(port) || !Number.isInteger(vlan)) {
    throw new Error('Parámetros inválidos para la OLT');
  }
  return `ont add ${port} sn-auth ${serial} omci ont-lineprofile-name ${profile} vlan ${vlan}`;
}

export async function authorizeOnt({ serial, profile, vlan }) {
  const ont = UNPROVISIONED.get(serial);
  if (!ont) throw new Error('ONT no encontrada en la OLT');
  const command = buildAuthCommand({ serial, port: ont.port, profile, vlan });
  await delay(800);
  PROVISIONED.add(serial);
  return { command }; // en la OLT real: devolver la respuesta / ont-id
}
