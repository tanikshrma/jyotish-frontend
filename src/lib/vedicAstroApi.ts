import axios from 'axios';

const API_KEY = 'd2c18f93-e2dd-554c-9232-b586c646bc13';
const BASE_URL = 'https://api.vedicastroapi.com/v3-json';

export interface AstroParams {
  dob: string; // DD/MM/YYYY
  tob: string; // HH:MM
  lat: number;
  lon: number;
  tz: number;
  lang?: string;
}

export const vedicAstroApi = {
  getSunSignPrediction: async (zodiacName: string, timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly', lang: string = 'en') => {
    const zodiacMap: Record<string, number> = {
      aries: 1, taurus: 2, gemini: 3, cancer: 4, leo: 5, virgo: 6,
      libra: 7, scorpio: 8, sagittarius: 9, capricorn: 10, aquarius: 11, pisces: 12
    };
    const zodiacId = zodiacMap[zodiacName.toLowerCase()];
    if (!zodiacId) throw new Error(`Invalid zodiac name: ${zodiacName}`);

    try {
      const d = new Date();
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      
      let endpoint = '';
      const params: any = {
        api_key: API_KEY,
        zodiac: zodiacId,
        lang: lang || 'en',
      };
      
      if (timeframe === 'daily') {
        endpoint = 'prediction/daily-sun';
        params.date = dateStr;
        params.type = 'big';
      } else if (timeframe === 'weekly') {
        endpoint = 'prediction/weekly-sun';
        params.week = 'thisweek';
        params.type = 'big';
      } else if (timeframe === 'yearly') {
        endpoint = 'prediction/yearly';
        params.year = d.getFullYear();
      } else {
        endpoint = `prediction/${timeframe}-sun`;
        params.date = dateStr;
      }

      console.log(`VedicAstro API Request URL: ${BASE_URL}/${endpoint}`);
      console.log(`VedicAstro API Request Params:`, params);

      const response = await axios.get(`${BASE_URL}/${endpoint}`, { params });
      console.log(`VedicAstro API Full Response for ${timeframe} - ${zodiacName}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${timeframe} prediction for ${zodiacName}:`, error);
      throw error; // Throw error so React Query can catch it
    }
  },

  getPlanetDetails: async (params: AstroParams) => {
    try {
      const response = await axios.get(`${BASE_URL}/horoscope/planet-details`, {
        params: {
          api_key: API_KEY,
          ...params,
          lang: params.lang || 'en'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching planet details:', error);
      throw error;
    }
  },
  
  getPlanetReport: async (params: AstroParams) => {
    try {
      const response = await axios.get(`${BASE_URL}/horoscope/planet-report`, {
        params: {
          api_key: API_KEY,
          ...params,
          lang: params.lang || 'en'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching planet report:', error);
      return null;
    }
  },
  
  getPanchang: async (params: AstroParams) => {
    try {
      const response = await axios.get(`${BASE_URL}/panchang/panchang`, {
        params: {
          api_key: API_KEY,
          ...params,
          lang: params.lang || 'en'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching panchang:', error);
      throw error;
    }
  },
  
  getBabyNames: async (params: AstroParams) => {
    return vedicAstroApi.getPanchang(params);
  },
  
  getChart: async (params: AstroParams, chartId: string = 'D1', style: 'north' | 'south' = 'north') => {
    try {
      const response = await axios.get(`${BASE_URL}/horoscope/chart-image`, {
        params: {
          api_key: API_KEY,
          ...params,
          chart_id: chartId,
          style,
          lang: params.lang || 'en',
          color: '#810909', // Primary color
          font: 'sans-serif'
        }
      });
      return response.data; // Usually an SVG string
    } catch (error) {
      console.error('Error fetching chart:', error);
      throw error;
    }
  },

  getDoshas: async (params: AstroParams) => {
    try {
      const [manglik, kaalsarp, sadesati] = await Promise.all([
        axios.get(`${BASE_URL}/dosha/manglik-dosha`, { params: { api_key: API_KEY, ...params } }).catch(() => ({ data: { response: null } })),
        axios.get(`${BASE_URL}/dosha/kaalsarp-dosha`, { params: { api_key: API_KEY, ...params } }).catch(() => ({ data: { response: null } })),
        axios.get(`${BASE_URL}/dosha/sadesati`, { params: { api_key: API_KEY, ...params } }).catch(() => ({ data: { response: null } }))
      ]);
      return {
        manglik: manglik.data.response,
        kaalsarp: kaalsarp.data.response,
        sadesati: sadesati.data.response
      };
    } catch (error) {
      console.error('Error fetching doshas:', error);
      return null;
    }
  },

  getKaalSarp: async (params: AstroParams) => {
    try {
      const response = await axios.get(`${BASE_URL}/dosha/kaalsarp-dosh`, {
        params: { api_key: API_KEY, ...params, lang: params.lang || 'en' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching kaalsarp dosha:', error);
      throw error;
    }
  },

  getYogas: async (params: AstroParams) => {
    try {
      const response = await axios.get(`${BASE_URL}/horoscope/yoga-details`, {
        params: { api_key: API_KEY, ...params, lang: params.lang || 'en' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching yogas:', error);
      return null;
    }
  },

  getDasha: async (params: AstroParams) => {
    try {
      const response = await axios.get(`${BASE_URL}/dashas/maha-dasha`, {
        params: { api_key: API_KEY, ...params, lang: params.lang || 'en' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dasha:', error);
      return null;
    }
  },

  getLuckyDetails: async (params: AstroParams) => {
    try {
      const response = await axios.get(`${BASE_URL}/horoscope/lucky-details`, {
        params: { api_key: API_KEY, ...params, lang: params.lang || 'en' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching lucky details:', error);
      return null;
    }
  },

  getMatchmaking: async (boyParams: AstroParams, girlParams: AstroParams) => {
    try {
      const response = await axios.get(`${BASE_URL}/matching/ashtakoot-with-astro-details`, {
        params: {
          api_key: API_KEY,
          boy_dob: boyParams.dob,
          boy_tob: boyParams.tob,
          boy_lat: boyParams.lat,
          boy_lon: boyParams.lon,
          boy_tz: boyParams.tz,
          girl_dob: girlParams.dob,
          girl_tob: girlParams.tob,
          girl_lat: girlParams.lat,
          girl_lon: girlParams.lon,
          girl_tz: girlParams.tz,
          lang: boyParams.lang || 'en'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching matchmaking details:', error);
      return null;
    }
  },

  geoSearch: async (city: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/utilities/geo-search`, {
        params: {
          api_key: API_KEY,
          city
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching geo search:', error);
      throw error;
    }
  }
};
