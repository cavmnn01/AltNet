export function createAuthController(authenticationService) {
  return {
    async login(req, res) {
      res.json(await authenticationService.login(req.body));
    },
  };
}
