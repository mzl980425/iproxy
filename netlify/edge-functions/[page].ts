import axios, { type AxiosRequestConfig } from "axios";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";

export default async (req: Request) => {
  try {
    const proxy = await fetch(
      "http://api.dmdaili.com/dmgetip.asp?apikey=6a0bf61f&pwd=400e52b5aef21b2c9cb728f99705803c&getnum=1&httptype=0&geshi=1&fenge=1&fengefu=&Contenttype=1&operate=all&setcity=all&provin=zhejiang"
    ).then((res) => res.text());
    if (typeof proxy !== "string" || !/\d+\.\d+.\d+.\d+\:\d+/.test(proxy)) {
      throw new Error("No usable proxy.");
    }
    console.log("using proxy: ", proxy);
    const httpProxyAgent = new HttpProxyAgent(`http://${proxy}`, {
      rejectUnauthorized: false,
    });
    const httpsProxyAgent = new HttpsProxyAgent(`http://${proxy}`, {
      rejectUnauthorized: false,
    });

    const options: AxiosRequestConfig = {
      method: "GET",
      httpAgent: httpProxyAgent,
      httpsAgent: httpsProxyAgent,
    };
    const axiosResponse = await axios("https://api.myip.la/", options);
    return new Response(
      JSON.stringify({
        proxy,
        result: axiosResponse.data,
      })
    );
  } catch (e) {
    return new Response("Error: " + e.message);
  }
};

export const config = {
  path: ["/", "/*"],
};
