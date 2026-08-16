import axios from 'axios';

/**
 * Client for VedicAstroAPI.
 *
 * Every call goes through /api/astro. The API key lives in VEDICASTRO_API_KEY
 * on the server and never reaches the browser — it used to be inlined here,
 * which meant any visitor could read it and spend the plan's credits.
 *
 * The public shape of `vedicAstroApi` is unchanged so existing callers work as
 * before; only the transport moved.
 */

const PROXY = '/api/astro';

export interface AstroParams {
  dob: string; // DD/MM/YYYY
  tob: string; // HH:MM
  lat: number;
  lon: number;
  tz: number;
  lang?: string;
}

/** Raised when the proxy reports the upstream subscription is exhausted. */
export class AstroCreditsError extends Error {
  constructor(detail: string) {
    super(detail || 'Astrology service is temporarily unavailable');
    this.name = 'AstroCreditsError';
  }
}

type QueryValue = string | number | boolean | undefined | null;

// VedicAstro payloads are deeply nested, free-form and differ per endpoint;
// callers index into them directly (e.g. data.response.prediction.phase_1).
// Typing this as `unknown` would require a cast at every one of those reads.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callProxy = async <T = any>(
  endpoint: string,
  params: Record<string, QueryValue> = {},
): Promise<T> => {
  try {
    const response = await axios.get(PROXY, {
      params: { endpoint, ...params },
    });
    return response.data as T;
  } catch (error) {
    // The proxy answers 502 + code UPSTREAM_CREDITS when VedicAstro is out of
    // calls, so the UI can say something honest instead of showing nothing.
    if (axios.isAxiosError(error) && error.response?.data?.code === 'UPSTREAM_CREDITS') {
      throw new AstroCreditsError(String(error.response.data.detail ?? ''));
    }
    throw error;
  }
};

const chartParams = (p: AstroParams) => ({
  dob: p.dob,
  tob: p.tob,
  lat: p.lat,
  lon: p.lon,
  tz: p.tz,
  lang: p.lang || 'en',
});

const ZODIAC_IDS: Record<string, number> = {
  aries: 1, taurus: 2, gemini: 3, cancer: 4, leo: 5, virgo: 6,
  libra: 7, scorpio: 8, sagittarius: 9, capricorn: 10, aquarius: 11, pisces: 12,
};

export const vedicAstroApi = {
  getSunSignPrediction: async (
    zodiacName: string,
    timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly',
    lang: string = 'en',
  ) => {
    const zodiac = ZODIAC_IDS[zodiacName.toLowerCase()];
    if (!zodiac) throw new Error(`Invalid zodiac name: ${zodiacName}`);

    const d = new Date();
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    if (timeframe === 'weekly') {
      return callProxy('weekly-sun', { zodiac, week: 'thisweek', type: 'big', lang });
    }
    if (timeframe === 'yearly') {
      return callProxy('yearly', { zodiac, year: d.getFullYear(), lang });
    }
    // monthly has no dedicated endpoint in the catalogue; daily-sun covers it.
    return callProxy('daily-sun', { zodiac, date, type: 'big', lang });
  },

  getPlanetDetails: (params: AstroParams) =>
    callProxy('planet-details', chartParams(params)),

  getPlanetReport: (params: AstroParams) =>
    callProxy('planet-report', chartParams(params)).catch(() => null),

  getPanchang: (params: AstroParams) =>
    callProxy('panchang', {
      date: params.dob,
      time: params.tob,
      lat: params.lat,
      lon: params.lon,
      tz: params.tz,
      lang: params.lang || 'en',
    }),

  getBabyNames: (params: AstroParams) => vedicAstroApi.getPanchang(params),

  getChart: (
    params: AstroParams,
    chartId: string = 'D1',
    style: 'north' | 'south' = 'north',
  ) =>
    callProxy('chart-image', {
      ...chartParams(params),
      div: chartId,
      style,
      color: '#810909',
      font_style: 'sans-serif',
    }),

  getDoshas: async (params: AstroParams) => {
    const p = chartParams(params);
    const [manglik, kaalsarp, sadesati] = await Promise.all([
      callProxy('manglik-dosh', p).catch(() => ({ response: null })),
      callProxy('kaalsarp-dosh', p).catch(() => ({ response: null })),
      callProxy('current-sade-sati', p).catch(() => ({ response: null })),
    ]);
    return {
      manglik: manglik?.response ?? null,
      kaalsarp: kaalsarp?.response ?? null,
      sadesati: sadesati?.response ?? null,
    };
  },

  getKaalSarp: (params: AstroParams) =>
    callProxy('kaalsarp-dosh', chartParams(params)),

  getYogas: (params: AstroParams) =>
    callProxy('yoga-list', chartParams(params)).catch(() => null),

  getDasha: (params: AstroParams) =>
    callProxy('maha-dasha', chartParams(params)).catch(() => null),

  getLuckyDetails: (params: AstroParams) =>
    callProxy('extended-kundli-details', chartParams(params)).catch(() => null),

  getMatchmaking: (boy: AstroParams, girl: AstroParams) =>
    callProxy('ashtakoot-with-astro-details', {
      boy_dob: boy.dob, boy_tob: boy.tob, boy_lat: boy.lat, boy_lon: boy.lon, boy_tz: boy.tz,
      girl_dob: girl.dob, girl_tob: girl.tob, girl_lat: girl.lat, girl_lon: girl.lon, girl_tz: girl.tz,
      lang: boy.lang || 'en',
    }).catch(() => null),

  /**
   * Location lookup. Uses /api/geocode (Open-Meteo + Nominatim, both free)
   * rather than VedicAstro's geo-search, which bills the same credit pool on
   * every keystroke. The response is reshaped to the old geo-search format so
   * existing callers keep working.
   */
  geoSearch: async (city: string) => {
    const response = await axios.get('/api/geocode', { params: { q: city } });
    const results = (response.data?.results ?? []) as Array<{
      name: string; region: string; country: string;
      lat: number; lon: number; timezone: string; tzOffset: number;
    }>;
    return {
      status: 200,
      // Both naming styles are provided because existing callers read
      // `lat`/`lon` in some places and `latitude`/`longitude` in others.
      // `tz` stays numeric (5.5) — that is what VedicAstro expects — while
      // `timezone` carries the IANA name.
      response: results.map((r) => ({
        name: r.name,
        full_name: [r.name, r.region, r.country].filter(Boolean).join(', '),
        country: r.country,
        state: r.region,
        coordinates: [r.lat, r.lon] as [number, number],
        lat: r.lat,
        lon: r.lon,
        latitude: r.lat,
        longitude: r.lon,
        tz: r.tzOffset,
        timezone: r.timezone,
      })),
    };
  },

  /** Paid: full kundli PDF. Requires a verified Razorpay payment. */
  getHoroscopePdf: (
    params: AstroParams,
    extra: { name: string; pob: string; style?: string; pdf_type?: string },
    payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
  ) =>
    callProxy('pdf-horoscope', {
      ...chartParams(params),
      name: extra.name,
      pob: extra.pob,
      style: extra.style ?? 'north',
      color: '140',
      pdf_type: extra.pdf_type ?? 'medium',
      ...payment,
    }),

  /** Paid: matchmaking PDF. Requires a verified Razorpay payment. */
  getMatchingPdf: (
    boy: AstroParams & { name: string; pob: string },
    girl: AstroParams & { name: string; pob: string },
    payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
  ) =>
    callProxy('pdf-matching', {
      boy_dob: boy.dob, boy_tob: boy.tob, boy_lat: boy.lat, boy_lon: boy.lon, boy_tz: boy.tz,
      boy_name: boy.name, boy_pob: boy.pob,
      girl_dob: girl.dob, girl_tob: girl.tob, girl_lat: girl.lat, girl_lon: girl.lon, girl_tz: girl.tz,
      girl_name: girl.name, girl_pob: girl.pob,
      lang: boy.lang || 'en', style: 'north', color: '140',
      ...payment,
    }),
};
