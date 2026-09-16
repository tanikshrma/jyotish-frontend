import type { Connect, Plugin, ViteDevServer } from "vite";
import type { ServerResponse } from "node:http";

/**
 * Serves the Vercel Functions in /api during `vite dev`.
 *
 * Vite only serves the client bundle, so without this the checkout calls to
 * /api/create-order would 404 locally and you would need `vercel dev` instead.
 * In production Vercel runs the same handlers directly — this plugin is
 * dev-only (`apply: "serve"`) and never ships.
 */

const ROUTES: Record<string, string> = {
  "/api/create-order": "/api/create-order.ts",
  "/api/verify-payment": "/api/verify-payment.ts",
  "/api/prospectiq": "/api/prospectiq.ts",
  "/api/astro": "/api/astro.ts",
  "/api/geocode": "/api/geocode.ts",
  "/api/kundli-pdf": "/api/kundli-pdf.ts",
  "/api/kundli-pdf-status": "/api/kundli-pdf-status.ts",
  "/api/matchmaking-pdf": "/api/matchmaking-pdf.ts",
  "/api/book-consultation": "/api/book-consultation.ts",
};

const readBody = (req: Connect.IncomingMessage): Promise<unknown> =>
  new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(raw);
      }
    });
    req.on("error", () => resolve({}));
  });

/** Minimal VercelResponse shim over a Node ServerResponse. */
const wrapResponse = (res: ServerResponse) => {
  const shim = {
    statusCode: 200,
    status(code: number) {
      shim.statusCode = code;
      return shim;
    },
    json(body: unknown) {
      res.statusCode = shim.statusCode;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(body));
      return shim;
    },
    setHeader(key: string, value: string) {
      res.setHeader(key, value);
    },
    /**
     * Non-JSON responses (chart-image returns an SVG string) go through
     * send(). Without it the handler throws and the dev server answers 502,
     * while production (Vercel / Express) works — a dev-only discrepancy.
     */
    send(body: string | Buffer) {
      res.statusCode = shim.statusCode;
      res.end(body);
      return shim;
    },
    /** Bodyless responses (e.g. a 204 CORS preflight) call end() directly. */
    end(body?: string | Buffer) {
      res.statusCode = shim.statusCode;
      res.end(body ?? undefined);
      return shim;
    },
  };
  return shim;
};

export function devApiPlugin(): Plugin {
  return {
    name: "dev-api-functions",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? "").split("?")[0];
        const modulePath = ROUTES[url];
        if (!modulePath) return next();

        try {
          const body = req.method === "POST" ? await readBody(req) : {};
          const url2 = new URL(req.url ?? "", "http://localhost");
          const query = Object.fromEntries(url2.searchParams.entries());
          const mod = await server.ssrLoadModule(modulePath);
          const handler = mod.default as (
            req: unknown,
            res: unknown,
          ) => Promise<void>;

          await handler(
            { method: req.method, body, headers: req.headers, query },
            wrapResponse(res),
          );
        } catch (error) {
          server.config.logger.error(`[dev-api] ${url} failed: ${error}`);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Dev API handler crashed" }));
          }
        }
      });
    },
  };
}
