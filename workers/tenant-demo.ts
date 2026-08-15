type AssetEnv = {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
};

export default {
  async fetch(request: Request, env: AssetEnv): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
};
