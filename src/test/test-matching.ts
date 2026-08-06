import { vedicAstroApi } from "../lib/vedicAstroApi";

async function testMatchmaking() {
  const boy = { dob: "12/12/1990", tob: "12:00", lat: 28.6139, lon: 77.2090, tz: 5.5, lang: "en" };
  const girl = { dob: "15/05/1992", tob: "14:30", lat: 28.6139, lon: 77.2090, tz: 5.5, lang: "en" };
  const res = await vedicAstroApi.getMatchmaking(boy, girl);
  console.log(JSON.stringify(res, null, 2));
}

testMatchmaking();