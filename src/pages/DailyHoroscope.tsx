import { HoroscopeCategoryTemplate } from "@/components/HoroscopeCategoryTemplate";

const DailyHoroscope = () => {
  return (
    <HoroscopeCategoryTemplate 
      title="Daily Horoscope"
      timeframe="day"
      category="daily"
      description="Plan your day better with accurate daily predictions based on your zodiac sign. Discover what the stars have in store for your career, love life, and health today."
    />
  );
};

export default DailyHoroscope;
