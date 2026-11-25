export function createProvisioningController(provisioningService) {
  return {
    async listServiceProfiles(_req, res) {
      res.json(await provisioningService.listServiceProfiles());
    },

    async discover(req, res) {
      res.json(await provisioningService.discover({
        serial: req.body.serial,
        technicianId: Number(req.user.sub),
        ip: req.ip,
      }));
    },

    async authorize(req, res) {
      res.json(await provisioningService.authorize({
        ...req.body,
        technicianId: Number(req.user.sub),
        role: req.user.role,
        ip: req.ip,
      }));
    },
  };
}
