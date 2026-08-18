import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('https://api.vedicastroapi.com/v3-json/prediction/weekly-sun', {
      params: {
        api_key: 'd2c18f93-e2dd-554c-9232-b586c646bc13',
        zodiac: 1,
        date: '21/07/2026',
        lang: 'en',
        split: true
      }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error(e.response?.data || e.message);
  }
}

test();
