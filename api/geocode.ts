import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readJsonResponse } from "./_razorpay.js";

/**
 * GET|POST /api/geocode?q=Ambala
 * Returns: { results: [{ name, region, country, lat, lon, timezone, tzOffset }] }
 *
 * Birth charts are wrong if the coordinates are wrong, so this deliberately
 * does NOT use VedicAstro's utilities/geo-search: that endpoint bills against
 * the same credit pool as the chart calls, and location lookup happens on every
 * keystroke. Two free providers are used instead, in order:
 *
 *   1. Open-Meteo geocoding — no key, CORS-friendly, returns an IANA timezone.
 *   2. Nominatim (OpenStreetMap) — better on Indian localities such as
 *      "Ambala Cantt", which Open-Meteo misses entirely.
 *
 * Nominatim's usage policy requires an identifying User-Agent and no more than
 * ~1 request/second, so it is only consulted when Open-Meteo returns nothing.
 */

const OPEN_METEO = "https://geocoding-api.open-meteo.com/v1/search";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const CONTACT =
  process.env.GEOCODE_CONTACT_EMAIL || "myjyotishnow@gmail.com";

export type GeoResult = {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  /** Hours offset from UTC — VedicAstro wants `tz` as a number, e.g. 5.5. */
  tzOffset: number;
};

/** Converts an IANA zone to the numeric UTC offset VedicAstro expects. */
export const offsetForTimezone = (timeZone: string, when = new Date()): number => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    }).formatToParts(when);
    const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    const m = raw.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!m) return 0;
    const [, sign, hh, mm = "0"] = m;
    const value = Number(hh) + Number(mm) / 60;
    return sign === "-" ? -value : value;
  } catch {
    return 0;
  }
};

const fromOpenMeteo = async (query: string): Promise<GeoResult[]> => {
  const url = `${OPEN_METEO}?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await readJsonResponse(response);
  return (data.results ?? []).map((r: Record<string, unknown>) => {
    const timezone = String(r.timezone ?? "UTC");
    return {
      name: String(r.name ?? ""),
      region: String(r.admin1 ?? ""),
      country: String(r.country ?? ""),
      lat: Number(r.latitude),
      lon: Number(r.longitude),
      timezone,
      tzOffset: offsetForTimezone(timezone),
    };
  });
};

const fromNominatim = async (query: string): Promise<GeoResult[]> => {
  const url = `${NOMINATIM}?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=1`;
  const response = await fetch(url, {
    headers: { "User-Agent": `JyotishNow/1.0 (${CONTACT})` },
  });
  if (!response.ok) return [];
  const data = (await response.json().catch(() => [])) as Record<string, unknown>[];
  return (Array.isArray(data) ? data : []).map((r) => {
    const a = (r.address ?? {}) as Record<string, string>;
    // Nominatim has no timezone; India is the overwhelming majority here and
    // the caller can override, so fall back to IST rather than UTC.
    const timezone = a.country_code === "in" ? "Asia/Kolkata" : "UTC";
    return {
      name:
        a.city || a.town || a.village || a.suburb || a.county ||
        String(r.display_name ?? "").split(",")[0],
      region: a.state ?? "",
      country: a.country ?? "",
      lat: Number(r.lat),
      lon: Number(r.lon),
      timezone,
      tzOffset: offsetForTimezone(timezone),
    };
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw =
    (req.query?.q as string) ??
    (typeof req.body === "object" && req.body
      ? (req.body as Record<string, unknown>).q
      : undefined);
  const query = String(raw ?? "").trim();

  if (query.length < 2) {
    return res.status(400).json({ error: "q must be at least 2 characters" });
  }

  try {
    let results = await fromOpenMeteo(query);
    if (results.length === 0) results = await fromNominatim(query);

    // Location lists are stable; cache hard so typing doesn't hammer upstream.
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=604800",
    );
    return res.status(200).json({ results });
  } catch (error) {
    console.error("[geocode] lookup failed", error);
    return res.status(502).json({ error: "Location lookup failed" });
  }
}
