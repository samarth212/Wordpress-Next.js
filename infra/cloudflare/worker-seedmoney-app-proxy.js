export default {
  async fetch(request) {
    const url = new URL(request.url);

    // This Worker should only be attached to the /app* route,
    // but keep a guard anyway.
    if (!url.pathname.startsWith("/app")) {
      return fetch(request);
    }

    // Replace SEEDMONEY_NEXT_ORIGIN with your deployed Next.js origin host
    // (no trailing slash), e.g. https://seedmoney-next.vercel.app
    const UPSTREAM = "https://SEEDMONEY_NEXT_ORIGIN";

    const upstreamUrl = new URL(UPSTREAM);
    upstreamUrl.pathname = url.pathname; // keep /app/...
    upstreamUrl.search = url.search;

    // Preserve method/headers/body
    const newReq = new Request(upstreamUrl.toString(), request);

    // Avoid accidental caching of app HTML by Cloudflare
    const resp = await fetch(newReq, {
      cf: { cacheTtl: 0, cacheEverything: false },
      redirect: "manual",
    });

    // Rewrite redirects from the upstream host back to seedmoney.org
    const location = resp.headers.get("Location");
    if (location && location.startsWith(UPSTREAM)) {
      const headers = new Headers(resp.headers);
      headers.set(
        "Location",
        location.replace(UPSTREAM, `${url.protocol}//${url.host}`)
      );
      return new Response(resp.body, { status: resp.status, headers });
    }

    return resp;
  },
};

