export default (request: Request, context: any) => {
  return new Response(
    JSON.stringify({
      method: request.method,
      url: request.url,
      params: context.params,
      headers: Object.fromEntries(request.headers),
    }),
    {
      headers: { "content-type": "text/plain" },
    }
  );
};

export const config = {
  path: ["/", "/:url", "/~/:url"],
};
