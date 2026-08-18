import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { KundliBook } from '../components/KundliBook';

// Mock react-pageflip to avoid canvas dependency in node
vi.mock('react-pageflip', () => {
  return {
    default: React.forwardRef(({ children }: any, ref: any) => (
      <div ref={ref} data-testid="mock-flipbook">{children}</div>
    ))
  };
});

describe('KundliBook Live API Payload Test', () => {
  it('renders with exact live VedicAstro API data', () => {
    const liveKundliData = {
      user: {
        name: "Siddharth Tiwari",
        dob: "30/06/2003",
        tob: "12:00",
        pob: "New Delhi, Delhi, India",
        gender: "Male"
      },
      panchang: {
        day: { name: "Monday" },
        tithi: { name: "Pratipada", number: 1, next_tithi: "Dwitiya" },
        nakshatra: { pada: 1, name: "Punarvasu", number: 7 },
        karana: { name: "Bawa", number: 1 },
        yoga: { name: "Dhruva", number: 12 },
        ayanamsa: { name: "23 54'9\"", number: 23.9 },
        rasi: { name: "Gemini" }
      },
      planets: {
        "0": { name: "As", full_name: "Ascendant", local_degree: 8.4, global_degree: 158.4, rasi_no: 6, zodiac: "Virgo", house: 1 },
        "1": { name: "Su", full_name: "Sun", local_degree: 14.1, global_degree: 74.1, rasi_no: 3, zodiac: "Gemini", house: 10 },
        "2": { name: "Mo", full_name: "Moon", local_degree: 19.8, global_degree: 79.8, rasi_no: 3, zodiac: "Gemini", house: 10 },
        "3": { name: "Ma", full_name: "Mars", local_degree: 11.0, global_degree: 311.0, rasi_no: 11, zodiac: "Aquarius", house: 6 },
        "4": { name: "Me", full_name: "Mercury", local_degree: 7.9, global_degree: 67.9, rasi_no: 3, zodiac: "Gemini", house: 10 },
        "5": { name: "Ju", full_name: "Jupiter", local_degree: 23.9, global_degree: 113.9, rasi_no: 4, zodiac: "Cancer", house: 11 },
        "6": { name: "Ve", full_name: "Venus", local_degree: 0.6, global_degree: 60.6, rasi_no: 3, zodiac: "Gemini", house: 10 },
        "7": { name: "Sa", full_name: "Saturn", local_degree: 9.4, global_degree: 69.4, rasi_no: 3, zodiac: "Gemini", house: 10 },
        "8": { name: "Ra", full_name: "Rahu", local_degree: 3.6, global_degree: 33.6, rasi_no: 2, zodiac: "Taurus", house: 9 },
        "9": { name: "Ke", full_name: "Ketu", local_degree: 3.6, global_degree: 213.6, rasi_no: 8, zodiac: "Scorpio", house: 3 },
        birth_dasa: "Rahu>Ma>Ve",
        current_dasa: "Sa>Ve>Ve",
        lucky_gem: ["gomedhaka"],
        lucky_num: [4],
        lucky_colors: ["Green"],
        rasi: "Gemini"
      },
      charts: {
        d1North: '',
        d1South: '',
        d9North: ''
      },
      doshas: {
        manglik: { manglik_by_mars: true, score: 11.5, bot_response: "You are 11.5% manglik." },
        kaalsarp: { is_present: false },
        sadesati: { is_present: false }
      },
      yogas: {
        "0": { yoga: "Saraswati Yoga", meaning: "High intellect, good looks, and fame." },
        "1": { yoga: "Raja Yoga", meaning: "Exceptional power and prosperity." },
        yogas_count: 41,
        raja_yoga_count: 13
      },
      dasha: {
        mahadasha: ["Rahu", "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun", "Moon", "Mars"],
        mahadasha_order: ["Sat Sep 06 2003", "Fri Sep 06 2019", "Mon Sep 06 2038"],
        start_year: 1985
      },
      lucky: {
        lucky_number: [4],
        lucky_color: ["Green"],
        lucky_gemstone: ["gomedhaka"]
      },
      planetReport: null
    };

    const { getAllByText } = render(
      <KundliBook
        kundliData={liveKundliData}
        step="book"
        onOpenBook={() => {}}
        onClose={() => {}}
      />
    );

    expect(getAllByText(/Siddharth Tiwari/i).length).toBeGreaterThan(0);
    console.log("✓ KundliBook successfully rendered with live API data!");
  });
});
