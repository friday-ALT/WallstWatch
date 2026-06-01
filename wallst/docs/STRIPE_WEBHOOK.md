# Stripe webhook setup — WallSt Watch

After a customer pays, Stripe must notify your API so their account upgrades from `free` to `pro` / `professional`. That notification is the **webhook**.

## What you need in `.env`

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
```

The app listens at: **`POST /api/stripe/webhook`**

---

## Option A — Local development (recommended)

1. Install Stripe CLI (pick one):
   ```bash
   brew install stripe/stripe-cli/stripe
   ```
   If brew fails (outdated Xcode tools), use the binary in this repo:
   ```bash
   wallst/server/bin/stripe --version
   ```
   Or download: https://github.com/stripe/stripe-cli/releases

2. Log in:
   ```bash
   stripe login
   ```

3. Forward events to your local server (API must be running on port 3001):
   ```bash
   # if installed via brew:
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   # OR use project binary:
   cd "wallst/server" && ./bin/stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```

4. The CLI prints something like:
   ```text
   Ready! Your webhook signing secret is whsec_xxxxxxxx
   ```

5. Copy that into `wallst/server/.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
   ```

6. Restart the API server.

7. Test a payment, or trigger a test event:
   ```bash
   stripe trigger checkout.session.completed
   ```

---

## Option B — Production (live site)

1. Stripe Dashboard → **Developers** → **Webhooks**  
   https://dashboard.stripe.com/webhooks

2. Click **Add endpoint**

3. **Endpoint URL:**
   ```text
   https://YOUR-API-DOMAIN.com/api/stripe/webhook
   ```
   Example: `https://wallst-api.railway.app/api/stripe/webhook`

4. **Events to send** — at minimum:
   - `checkout.session.completed`

5. Click **Add endpoint**

6. Open the new endpoint → **Signing secret** → **Reveal** → copy `whsec_...`

7. Add to your **production** server environment (Railway/Render/etc.):
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
   ```

8. Redeploy the API.

---

## How to verify it works

1. Sign up on the site and log in.  
2. Go to **Pricing** → **Start Pro** → complete checkout.  
3. After payment, you should land on `/dashboard?upgraded=1`.  
4. Your plan in the DB should be `pro` (check header badge or Pro features unlocked).

If payment succeeds but plan stays `free`, the webhook secret is wrong or the endpoint URL is unreachable.

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| Plan never upgrades | Webhook secret missing or wrong; check server logs |
| `400` on webhook | `STRIPE_WEBHOOK_SECRET` doesn't match the endpoint signing secret |
| Works locally, not prod | Production endpoint URL must be HTTPS and publicly reachable |
| Using live keys | Webhook must be created in **Live** mode (toggle top-right in Stripe) |

---

## Related `.env` (payments)

```env
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=https://your-frontend-domain.com
```
