export default async (req: Request) => {
  try {
    const reqUrl = new URL(req.url);
    const needProxy = reqUrl.pathname.startsWith("/~/");
    const url =
      reqUrl.pathname.replace(/^\/\~\//, "").replace(/^\//, "") + reqUrl.search;
    console.log(new Date().toLocaleTimeString(), req.method, url);

    if (URL.canParse(url)) {
      // set request headers
      const reqHeaders = new Headers(req.headers);
      reqHeaders.delete("host");
      reqHeaders.delete("origin");

      const options: RequestInit & { client?: any } = {
        method: req.method,
        body: req.body,
        headers: reqHeaders,
        signal: AbortSignal.timeout(10 * 1000),
        client: undefined,
      };

      // get a proxy
      if (needProxy) {
        const proxy = await fetch(Deno.env.get("PROXY_API")!).then((res) =>
          res.text()
        );
        if (typeof proxy !== "string" || !/\d+\.\d+.\d+.\d+\:\d+/.test(proxy)) {
          throw new Error("No usable proxy.");
        }
        options.client = Deno.createHttpClient({
          proxy: { url: `http://${proxy}` },
        });
      }

      const response = await fetch(url, options);

      // set response headers
      const resHeaders = new Headers(response.headers);
      resHeaders.delete("Content-Security-Policy");
      resHeaders.delete("X-Frame-Options");
      resHeaders.set(
        "Access-Control-Allow-Origin",
        req.headers.get("Origin") || "*"
      );
      resHeaders.set("Access-Control-Allow-Headers", "*");

      return new Response(response.body, {
        headers: resHeaders,
        status: response.status,
        statusText: response.statusText,
      });
    }

    return globalThis.fetch("https://iproxy.deno.dev");
  } catch (e) {
    return new Response("Error: " + e.message);
  }
};

export const config = {
  path: ["/", "/*"],
};
