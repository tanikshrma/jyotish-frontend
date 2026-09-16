/**
 * Production server for self-hosting (client server / VPS).
 *
 * On Vercel the files in /api are serverless functions and this file is unused.
 * Anywhere else there is nothing to run them, so this server does two jobs:
 *
 *   1. Mounts each /api handler on a real Express route, adapting Express's
 *      req/res to the small slice of the Vercel signature the handlers use.
 *   2. Serves the built SPA from dist/ with a history fallback, while leaving
 *      /api alone so API 404s stay JSON instead of returning index.html.
 *
 * Run:  npm run build && npm start
 */

import "dotenv/config";
import express, { type Request, type Response } from "express";
import compression from "compression";
import path from "node:path";
import { fileURLToPath } from "node:url";

import createOrder from "./api/create-order.js";
import verifyPayment from "./api/verify-payment.js";
import prospectiq from "./api/prospectiq.js";
import astro from "./api/astro.js";
import geocode from "./api/geocode.js";
import kundliPdf from "./api/kundli-pdf.js";
import kundliPdfStatus from "./api/kundli-pdf-status.js";
import matchmakingPdf from "./api/matchmaking-pdf.js";
import bookConsultation from "./api/book-consultation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

type VercelLikeHandler = (req: unknown, res: unknown) => unknown;

/**
 * Express `res` already has status()/json()/setHeader()/send(), which is all the
 * handlers use, so it passes through unchanged. `req` needs `query` and `body`
 * present, which express.json() and the router give us.
 */
const adapt =
  (handler: VercelLikeHandler) => async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(`[api] ${req.method} ${req.path} failed:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };

const app = express();

app.disable("x-powered-by");
app.use(compression());
// Razorpay/Prospect IQ payloads are small; the cap blocks oversized bodies.
app.use(express.json({ limit: "1mb" }));

// ---------------------------------------------------------------- API ---
app.all("/api/create-order", adapt(createOrder as VercelLikeHandler));
app.all("/api/verify-payment", adapt(verifyPayment as VercelLikeHandler));
app.all("/api/prospectiq", adapt(prospectiq as VercelLikeHandler));
app.all("/api/astro", adapt(astro as VercelLikeHandler));
app.all("/api/geocode", adapt(geocode as VercelLikeHandler));
app.all("/api/kundli-pdf", adapt(kundliPdf as VercelLikeHandler));
app.all("/api/kundli-pdf-status", adapt(kundliPdfStatus as VercelLikeHandler));
app.all("/api/matchmaking-pdf", adapt(matchmakingPdf as VercelLikeHandler));
app.all("/api/book-consultation", adapt(bookConsultation as VercelLikeHandler));


/** Health check for uptime monitors and load balancers. */
app.get("/healthz", (_req, res) => {
  res.json({
    ok: true,
    razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    prospectiq: Boolean(process.env.PROSPECTIQ_PRIVATE_TOKEN),
    vedicastro: Boolean(process.env.VEDICASTRO_API_KEY),
  });
});

// Unknown /api routes must not fall through to the SPA.
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// -------------------------------------------------------------- STATIC ---
// Hashed assets are immutable; index.html must never be cached or users get a
// stale bundle after a deploy.
app.use(
  "/assets",
  express.static(path.join(DIST, "assets"), {
    immutable: true,
    maxAge: "1y",
  }),
);
app.use(express.static(DIST, { index: false, maxAge: "1h" }));

app.get(/.*/, (_req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.join(DIST, "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`JyotishNow listening on http://${HOST}:${PORT}`);
  for (const [label, key] of [
    ["Razorpay", "RAZORPAY_KEY_SECRET"],
    ["Prospect IQ", "PROSPECTIQ_PRIVATE_TOKEN"],
    ["VedicAstro", "VEDICASTRO_API_KEY"],
  ] as const) {
    if (!process.env[key]) console.warn(`  WARNING: ${label} not configured (${key} missing)`);
  }
});
