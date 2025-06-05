import axios, { AxiosRequestConfig } from "axios";

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

      const options: AxiosRequestConfig = {
        method: req.method,
        headers: Object.fromEntries(reqHeaders),
        data: req.body,
        responseType: "stream",
      };

      // get a proxy
      if (needProxy) {
        const proxy = await fetch(
          "http://api.dmdaili.com/dmgetip.asp?apikey=6a0bf61f&pwd=400e52b5aef21b2c9cb728f99705803c&getnum=1&httptype=0&geshi=1&fenge=1&fengefu=&Contenttype=1&operate=all&setcity=all&provin=zhejiang"
        ).then((res) => res.text());
        if (typeof proxy !== "string" || !/\d+\.\d+.\d+.\d+\:\d+/.test(proxy)) {
          throw new Error("No usable proxy.");
        }
        console.log("using proxy: ", proxy);
        options.proxy = {
          host: proxy.split(":")[0],
          port: Number(proxy.split(":")[1]),
        };
      }

      const axiosResponse = await axios(url, options);
      const response = new Response(axiosResponse.data, {
        status: axiosResponse.status,
        statusText: axiosResponse.statusText,
        // @ts-ignore
        headers: axiosResponse.headers,
      });

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
