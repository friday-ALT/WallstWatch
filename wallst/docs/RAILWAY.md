# Railway (API only)

The **API** lives in `wallst/server`. The **website** is `wallst/website` (deploy on Vercel).

## Fix “old Banking Command Center” at your Railway URL

If `https://your-app.up.railway.app/` shows the legacy HTML (BANK MAP, CREDIT SYSTEM, ~57KB page) and `/api/news` returns **404**, Railway is serving a **static site** (Caddy in logs: `http.log.access.log0`, `Content-Type: text/html`, etag `dixz8rxib6yo18b8`). That means the **repo root** `index.html` is being deployed, not `wallst/server`.

The API uses a **Dockerfile** in `wallst/server` so builds always run `npm start` (Express), not Caddy static.

1. Railway → your service → **Settings** → **Source**
2. Set **Root Directory** to: `wallst/server` (no leading `/` — use `wallst/server`, not `/wallst/server`)
3. Confirm the service type is **Web Service** (not Static Site)
4. **Redeploy**, then open **Deployments → View logs** and search for: `◆ WallSt Watch server`

After a correct deploy:

- `GET /` → JSON: `{ "service": "wallst-watch-api", ... }`
- `GET /api/health` → `{ "ok": true }`
- `GET /api/news` → news JSON (with `FINNHUB_API_KEY` set)

Do **not** point users at the Railway URL for the product UI. Use Vercel for the React app and set `VITE_API_URL` (or proxy `/api`) to this Railway host.

## Required env vars

See `wallst/server/.env.example` if present, or server README. Minimum for production:

- `FINNHUB_API_KEY`
- `JWT_SECRET`
- `CLIENT_URL` = your Vercel URL (after Step 3)
- `UNLOCK_ALL=false`
- Stripe keys + price IDs when billing is live

Railway injects `PORT` — do not set a custom `PORT` unless you know why.
