import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  return new Response(
    JSON.stringify({
      url: request.url,
      request,
    })
  );
};

export const config: Config = {
  path: "/~/:url",
};
