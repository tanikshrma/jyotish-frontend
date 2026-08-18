# JyotishNow — Deployment Guide

Vite + React + TypeScript front end with a small Node API layer.

> **This is not a static site.** Payments, CRM sync, astrology data and location
> search all run through server-side routes under `/api`. Uploading only the
> `dist/` folder to shared hosting will load the pages but every form and every
> payment will fail. You need Node running.

---

## 1. Requirements

| Requirement | Version |
| --- | --- |
| Node.js | 20 LTS or newer (built and tested on 22) |
| npm | 10+ |
| RAM | 1 GB minimum (2 GB recommended — the build is memory-hungry) |
| Outbound HTTPS | Required to `api.razorpay.com`, `services.leadconnectorhq.com`, `api.vedicastroapi.com`, `geocoding-api.open-meteo.com`, `nominatim.openstreetmap.org` |

---

## 2. Quick start

```sh
unzip jyotishnow-website.zip
cd jyotishnow-website

cp .env.example .env     # .env is already included — see section 3
npm ci                   # or: npm install
npm run build            # outputs dist/
npm start                # serves on http://0.0.0.0:3000
```

Change the port with `PORT=8080 npm start`.

Verify it is healthy:

```sh
curl http://localhost:3000/healthz
# {"ok":true,"razorpay":true,"prospectiq":true,"vedicastro":true}
```

Any `false` means that credential is missing from `.env`.

---

## 3. Environment variables

A working `.env` is included in this package. **Treat it as a secret** — see
section 8 before sharing this zip further.

| Variable | Used by | Notes |
| --- | --- | --- |
| `RAZORPAY_KEY_ID` | server | Razorpay key id |
| `RAZORPAY_KEY_SECRET` | server | **Never expose.** Signs and verifies payments |
| `VITE_RAZORPAY_KEY_ID` | browser | Publishable key id. Must match `RAZORPAY_KEY_ID` |
| `PROSPECTIQ_LOCATION_ID` | server | GoHighLevel sub-account id |
| `PROSPECTIQ_PRIVATE_TOKEN` | server | **Full CRM read/write.** Never expose |
| `PROSPECTIQ_CALENDAR_ID` | server | Default booking calendar |
| `VEDICASTRO_API_KEY` | server | Astrology data. See section 7 |
| `VITE_PROSPECTIQ_TRACKING_ID` | browser | Analytics tracking id |
| `GEOCODE_CONTACT_EMAIL` | server | Sent to Nominatim per its usage policy |

Anything prefixed `VITE_` is **compiled into the browser bundle** and is public.
Everything else stays on the server. After changing any `VITE_` value you must
re-run `npm run build`.

---

## 4. Running as a service (PM2)

```sh
npm install -g pm2
pm2 start npm --name jyotishnow -- start
pm2 save
pm2 startup          # prints a command to run once, so it survives reboot
```

Useful: `pm2 logs jyotishnow`, `pm2 restart jyotishnow`, `pm2 status`.

### Alternative: systemd

```ini
# /etc/systemd/system/jyotishnow.service
[Unit]
Description=JyotishNow
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/jyotishnow
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now jyotishnow
```

---

## 5. nginx reverse proxy

```nginx
server {
    listen 80;
    server_name jyotishnow.com www.jyotishnow.com;

    client_max_body_size 2m;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

Then issue SSL:

```sh
sudo certbot --nginx -d jyotishnow.com -d www.jyotishnow.com
```

HTTPS is **mandatory** — Razorpay Checkout refuses to open over plain HTTP.

---

## 6. Deploying updates

```sh
git pull            # or re-upload the files
npm ci
npm run build
pm2 restart jyotishnow
```

`dist/assets/*` is content-hashed and served with a 1-year immutable cache;
`index.html` is served with `no-cache`, so users get the new bundle immediately.

---

## 7. Known issues to resolve before go-live

**a. VedicAstro subscription is exhausted.** As of the last check, every
endpoint returns:

```json
{"status":402,"response":"out of api calls - renew subscription"}
```

Until the subscription is renewed, the Kundli calculator, horoscopes, baby
names and matchmaking will show an "astrology service unavailable" message.
Location search is unaffected — it uses free providers. Fix by putting the
renewed key into `VEDICASTRO_API_KEY` and restarting.

**b. Razorpay is in TEST mode.** `.env` holds `rzp_test_…` keys, so no real
money moves. Swap in the `rzp_live_…` pair for production. Note the live keys
were shared over chat during development and **should be rotated** in the
Razorpay dashboard before use.

**c. Email deliverability is unverified.** Transactional email via Prospect IQ
works at the API level, but the sub-account has no verified sending domain and
sends as `myjyotishnow@gmail.com`. Gmail/Outlook will treat that as spoofed.
Verify a domain (e.g. `mail.jyotishnow.com`) in Prospect IQ → Settings → Email
Services and send as `noreply@jyotishnow.com`.

**d. One pre-existing TypeScript error** in `src/components/KundliBook.tsx`
(a `react-pageflip` prop mismatch). It does not affect the build — Vite strips
types without checking — but `tsc --noEmit` will report it.

---

## 8. Security notes

- `.env` is included in this package **and contains live CRM credentials.**
  `PROSPECTIQ_PRIVATE_TOKEN` grants full read/write over every contact. Do not
  commit this zip to a public repository, email it onward, or leave it in a
  web-accessible directory.
- After deploying, restrict permissions: `chmod 600 .env`.
- `.gitignore` already excludes `.env`. Keep it that way.
- Server-only secrets are never bundled into the browser — verified by grepping
  the built output. Only `VITE_`-prefixed values reach the client.
- Payment amounts are priced **server-side** from `shared/pricing.ts`. The
  browser sends a service key, never a price, so a tampered request cannot
  change what is charged.

---

## 9. Project layout

```
api/                serverless-style handlers, mounted by server.ts
  create-order.ts     Razorpay order creation (server-side pricing)
  verify-payment.ts   HMAC signature verification + CRM sync
  prospectiq.ts       GoHighLevel contacts / calendars / appointments
  astro.ts            VedicAstro proxy (allow-listed, paid-tier gated)
  geocode.ts          Location -> lat/lon/timezone (free providers)
shared/             code shared by browser and server
  pricing.ts          canonical price list — the source of truth
  prospectiq-schema.ts real CRM field/calendar ids
  astro-catalog.ts    VedicAstro endpoints + free/paid tiers
src/                React app
server.ts           production Node server (not used on Vercel)
vercel.json         Vercel config, if hosting there instead
```

## 10. Hosting on Vercel instead

The project is already configured for it. `server.ts` is ignored; Vercel runs
`api/*.ts` as serverless functions.

```sh
npm i -g vercel
vercel link
vercel env add RAZORPAY_KEY_SECRET production   # repeat for each variable
vercel --prod
```
