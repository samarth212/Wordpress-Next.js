# Deploy `seedmoney.org` (WordPress.com) + `/app` (Next.js) via Cloudflare Worker

## Goal

- `https://seedmoney.org/` → WordPress.com marketing site
- `https://seedmoney.org/app` and `https://seedmoney.org/app/*` → Next.js app (proxied to your Next origin)

## Prerequisites

- You own `seedmoney.org`.
- WordPress.com site on a plan that supports custom domains.
- Cloudflare is your authoritative DNS (nameservers at the registrar point to Cloudflare).
- Your Next.js app is deployed publicly (example: Vercel) and has an origin like:
  - `SEEDMONEY_NEXT_ORIGIN=https://seedmoney-next.vercel.app` (no trailing slash)

## Repo changes (Next.js)

- `next.config.ts` sets `basePath: "/app"` (this is build-time; redeploy after changing it).
- Smoke tests:
  - `app/page.tsx` shows: `SeedMoney App mounted at /app`
  - `app/health/page.tsx` is a trivial deep-link route for refresh testing

## 1) Deploy the Next.js app (origin)

Deploy this repo to your hosting provider (recommended: Vercel).

Verify the origin works directly:

```txt
https://SEEDMONEY_NEXT_ORIGIN/app
https://SEEDMONEY_NEXT_ORIGIN/app/health
```

If these don’t work at the origin, fix that first (Cloudflare will only proxy what the origin serves).

## 2) Connect `seedmoney.org` to WordPress.com

In WordPress.com:

1. Dashboard → Domains
2. Add domain → **Connect domain you own**
3. Follow the wizard until WordPress.com shows the DNS records it expects
4. Ensure `seedmoney.org` is set as the **primary** domain for the marketing site

Keep the DNS record values WordPress.com provides handy (you’ll add them in Cloudflare next).

## 3) Move authoritative DNS to Cloudflare

1. Add `seedmoney.org` as a zone in Cloudflare.
2. At your registrar, update `seedmoney.org` nameservers to the Cloudflare nameservers.
3. Wait for nameserver propagation.

## 4) Configure Cloudflare DNS for WordPress.com

In Cloudflare DNS for `seedmoney.org`, add exactly what the WordPress.com domain-connection wizard specifies.

Common patterns:

- **CNAME (preferred when offered):**
  - `@` → WordPress-provided target (Cloudflare apex CNAME flattening)
  - `www` → `@`
- **A records (if WordPress provides IPs):**
  - `@` → WordPress-provided IP(s)
  - `www` → `@`

Important:

- The `@` (apex) and `www` records should be **Proxied (orange cloud)** so Cloudflare Worker routes can run on `seedmoney.org`.

## 5) Create and deploy the Cloudflare Worker (`/app*` proxy)

In Cloudflare:

1. Workers & Pages → Create Worker
2. Paste the contents of `infra/cloudflare/worker-seedmoney-app-proxy.js`
3. Replace `https://SEEDMONEY_NEXT_ORIGIN` with your real origin, for example:

```js
const UPSTREAM = "https://seedmoney-next.vercel.app";
```

4. Deploy the Worker

## 6) Attach Worker routes

In the Worker settings, add routes (must include the zone):

```txt
seedmoney.org/app*
www.seedmoney.org/app*   (optional; include if you serve both hosts)
```

Notes:

- Requests to `/app/_next/*` are also matched (good; those are Next.js assets).
- If Cloudflare DNS records are set to **DNS only (gray cloud)**, Worker routes will not execute.

## Acceptance tests

After DNS + deploy:

1. `https://seedmoney.org/` loads the WordPress.com marketing site.
2. `https://seedmoney.org/app` loads the Next.js app page.
3. `https://seedmoney.org/app/health` loads, and a full refresh still works.
4. In DevTools → Network, assets load from:

```txt
https://seedmoney.org/app/_next/...
```

5. No redirect loops between `http`/`https` (Cloudflare SSL/TLS mode is typically **Full** or **Full (strict)**).

## Rollback plan

Fast rollback (recommended):

1. Remove the Worker route(s) for `seedmoney.org/app*` (or disable the Worker).
2. `/app` will stop proxying to Next and will fall back to WordPress.com handling (likely a 404 or a WP page).

DNS rollback (only if needed):

1. Switch Cloudflare DNS records back to whatever WordPress.com expects (still works without the Worker).
2. If you need to bypass Cloudflare entirely, set records to **DNS only (gray cloud)** (this also disables Workers).

