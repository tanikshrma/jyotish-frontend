export const zodiacSigns = [
  { id: "aries", name: "Aries", icon: "https://vibe.filesafe.space/1782888190245745251/attachments/94c5c0a6-a80c-4d0c-bc85-b33ebace0c3e.png", date: "Mar 21 - Apr 19" },
  { id: "taurus", name: "Taurus", icon: "https://vibe.filesafe.space/1782888190245745251/attachments/c6307ea6-2ae0-42ae-b79f-63340d67edda.png", date: "Apr 20 - May 20" },
  { id: "gemini", name: "Gemini", icon: "https://vibe.filesafe.space/1782888190245745251/attachments/ee1bf341-f985-4844-94a5-71a57821f1e0.png", date: "May 21 - Jun 20" },
  { id: "cancer", name: "Cancer", icon: "https://vibe.filesafe.space/1782888190245745251/attachments/88b9c066-bc00-498b-9dc8-1e11ae72a5b4.png", date: "Jun 21 - Jul 22" },
  { id: "leo", name: "Leo", icon: "https://vibe.filesafe.space/1782888190245745251/attachments/625294bb-6bdb-49b7-8ace-59d0ba1532a8.png", date: "Jul 23 - Aug 22" },
  { id: "virgo", name: "Virgo", icon: "https://vibe.filesafe.space/1782888190245745251/attachments/844d790f-7c15-446d-b2c9-406f014860e0.png", date: "Aug 23 - Sep 22" },
  { id: "libra", name: "Libra", icon: "https://vibe.filesafe.space/1782888190245745251/attachments/51d80fdf-175e-4f81-a61b-62d6952642d7.png", date: "Sep 23 - Oct 22" },
  { id: "scorpio", name: "Scorpio", icon: "https://vibe.filesafe.space/1782888190245745251/attachments/df78d918-4d54-4030-867e-9be48304a97a.png", date: "Oct 23 - Nov 21" },
  { id: "sagittarius", name: "Sagittarius", icon: "https://vibe.filesafe.space/1782888190245745251/attachments/deb2202c-e0ea-4b66-be28-a8ded4f0576f.png", date: "Nov 22 - Dec 21" },
  { id: "capricorn", name: "Capricorn", icon: "https://vibe.filesafe.space/1782888190245745251/attachments/12d5091a-9a55-4de3-8f11-32da5989cdfd.png", date: "Dec 22 - Jan 19" },
  { id: "aquarius", name: "Aquarius", icon: "https://vibe.filesafe.space/1782888190245745251/attachments/a7610d83-c044-43b2-adab-6968487f4f68.png", date: "Jan 20 - Feb 18" },
  { id: "pisces", name: "Pisces", icon: "https://vibe.filesafe.space/1782888190245745251/attachments/35b76b15-fe74-4b2d-b07f-fee6654f0007.png", date: "Feb 19 - Mar 20" },
];

export const horoscopeCategories = [
  { id: "daily", label: "Daily Horoscope" },
  { id: "weekly", label: "Weekly Horoscope" },
  { id: "yearly", label: "Yearly Horoscope" }
];

export const generateMockHoroscope = (sign: string, timeframe: string, language: "en" | "hi" = "en") => {
  if (language === "hi") {
    return {
      overview: `यह ${timeframe} ${sign} के लिए सकारात्मक ऊर्जा और स्पष्टता की लहर लेकर आया है। ग्रहों की स्थिति व्यक्तिगत लक्ष्यों और रिश्तों पर ध्यान केंद्रित करने का एक शानदार समय बताती है। आपको एक अप्रत्याशित अवसर मिल सकता है जो आपके दीर्घकालिक दृष्टिकोण के साथ पूरी तरह से मेल खाता है। अपने अंतर्ज्ञान पर भरोसा करें, क्योंकि ब्रह्मांडीय ऊर्जा आपको अनुकूल परिणामों की ओर ले जा रही है। जमीन से जुड़े रहें और अपने रास्ते में आने वाले सकारात्मक बदलावों को अपनाएं।`,
      finances: `आप उन खर्चों पर नियंत्रण रखने में सक्षम हैं जिनके बारे में आप अपने निजी जीवन में किसी अप्रत्याशित घटना के कारण गंभीर थे। अल्पकालिक लाभ के बजाय दीर्घकालिक निवेश पर ध्यान दें।`,
      career: `आज आपके करियर में नए विकल्प उभरने की संभावना आपके आत्मविश्वास को बढ़ा सकती है। सहयोग के लिए खुले रहें और अपने नवीन विचारों को वरिष्ठों के साथ साझा करने में संकोच न करें।`,
      family: `आज आपके परिवार का साथ आपको आत्मीयता और आंतरिक संतुष्टि का अहसास कराएगा। एक छोटा सा मिलन समारोह या दिल से की गई बातचीत पिछली गलतफहमियों को सुलझा सकती है।`,
      health: `आज आपको कोई भी स्वास्थ्य संबंधी चिंता परेशान नहीं करेगी। ग्रहों की स्थिति स्वास्थ्य के लिहाज से एक सामान्य दिन का संकेत देती है। हालांकि, एक संक्षिप्त ध्यान सत्र को शामिल करने से आपकी मानसिक स्पष्टता बढ़ेगी।`,
      love: `यदि आपका हाल ही में ब्रेकअप हुआ है, तो आप आज अपने साथ समय बिताना पसंद कर सकते हैं। जो लोग रिश्ते में हैं, उनके लिए एक सरप्राइज जेस्चर आपको अपने साथी के करीब लाएगा।`,
      marriedLife: `आज वैवाहिक जीवन में घर के सदस्यों के साथ आपके जीवनसाथी का व्यवहार आपको गौरवान्वित करेगा। आपसी सम्मान और समझ आपके दिन की मुख्य विशेषताएं होंगी।`,
      education: `छात्रों को जटिल विषयों पर ध्यान केंद्रित करना आसान लगेगा। प्रतियोगी परीक्षाओं या कोई नया कौशल सीखने के लिए यह अनुकूल समय है।`,
      business: `उद्यमी एक आकर्षक सौदे को अंतिम रूप दे सकते हैं। बातचीत करते समय अपनी प्रवृत्ति पर भरोसा करें, लेकिन हस्ताक्षर करने से पहले सुनिश्चित करें कि सभी कागजी कार्रवाई की अच्छी तरह से समीक्षा की गई है।`,
      travel: `काम या अवकाश से संबंधित छोटी यात्राएं क्षितिज पर हैं। ये यात्राएं फलदायी होंगी और आपको प्रभावशाली लोगों के संपर्क में ला सकती हैं।`,
      luckyNumber: Math.floor(Math.random() * 9) + 1,
      luckyColor: ["लाल", "नीला", "हरा", "पीला", "सफेद", "नारंगी", "बैंगनी"][Math.floor(Math.random() * 7)],
      luckyDirection: ["उत्तर", "दक्षिण", "पूर्व", "पश्चिम", "उत्तर-पूर्व", "उत्तर-पश्चिम", "दक्षिण-पूर्व", "दक्षिण-पश्चिम"][Math.floor(Math.random() * 8)],
      luckyTime: "सुबह 10:00 - दोपहर 12:00",
      luckyGemstone: ["माणिक", "मोती", "मूंगा", "पन्ना", "पुखराज", "हीरा", "नीलम"][Math.floor(Math.random() * 7)],
      luckyRudraksha: `${Math.floor(Math.random() * 14) + 1} मुखी`,
      luckyMantra: "ओम नमः शिवाय",
      remedy: "सुबह सूर्य देव को जल अर्पित करें और गायत्री मंत्र का जाप करें।",
      positiveTraits: ["साहसी", "दृढ़ संकल्पित", "आत्मविश्वासी", "उत्साही", "आशावादी", "ईमानदार", "भावुक"],
      challenges: ["अधीरता", "मूडीनेस", "क्रोधी", "आवेगी", "आक्रामक"],
      advice: "आज कोई भी आवेगी निर्णय लेने से पहले गहरी सांस लें। धैर्य आपका सबसे बड़ा सहयोगी होगा।",
      planetaryInfluence: "ग्रहों की स्थिति आज आपके पक्ष में है।",
      positiveEnergy: "सकारात्मक रहें और अपने लक्ष्यों पर ध्यान केंद्रित करें।",
      challengingArea: "जल्दबाजी में निर्णय लेने से बचें।",
      auspiciousTime: "सुबह 10:00 - दोपहर 11:30"
    };

  }

  return {
    overview: `This ${timeframe} brings a surge of positive energy and clarity for ${sign}. The planetary alignments suggest an excellent time to focus on personal goals and relationships. You might encounter an unexpected opportunity that aligns perfectly with your long-term vision. Trust your intuition, as the cosmic energies are guiding you toward favorable outcomes. Stay grounded and embrace the positive shifts coming your way.`,
    finances: `You are capable of exercising restraint over the expenses that you were serious about due to an unexpected event in your personal life. Focus on long-term investments rather than short-term gains.`,
    career: `The likelihood of new options emerging in your career today could boost your confidence. Stay open to collaborations and don't hesitate to share your innovative ideas with superiors.`,
    family: `The companionship of your family today will give you a sense of intimacy and inner satisfaction. A small get-together or a heartfelt conversation can resolve past misunderstandings.`,
    health: `You won't be troubled by any health concerns today. The planetary alignments suggest a normal day in terms of health. However, incorporating a brief meditation session will enhance your mental clarity.`,
    love: `If you recently went through a breakup, you might prefer spending time with yourself today. For those in a relationship, a surprise gesture will bring you closer to your partner.`,
    marriedLife: `In married life today, your partner's behavior with family members at home will make you proud. Mutual respect and understanding will be the highlights of your day.`,
    education: `Students will find it easier to concentrate on complex subjects. It's a favorable time for competitive exams or learning a new skill.`,
    business: `Entrepreneurs might finalize a lucrative deal. Trust your instincts when negotiating, but ensure all paperwork is thoroughly reviewed before signing.`,
    travel: `Short trips related to work or leisure are on the horizon. These journeys will be fruitful and might bring you in contact with influential people.`,
    luckyNumber: Math.floor(Math.random() * 9) + 1,
    luckyColor: ["Red", "Blue", "Green", "Yellow", "White", "Orange", "Purple"][Math.floor(Math.random() * 7)],
    luckyDirection: ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"][Math.floor(Math.random() * 8)],
    luckyTime: "10:00 AM - 12:00 PM",
    luckyGemstone: ["Ruby", "Pearl", "Coral", "Emerald", "Yellow Sapphire", "Diamond", "Blue Sapphire"][Math.floor(Math.random() * 7)],
    luckyRudraksha: `${Math.floor(Math.random() * 14) + 1} Mukhi`,
    luckyMantra: "Om Namah Shivaya",
    remedy: "Offer water to the Sun God in the morning and chant the Gayatri Mantra.",
    positiveTraits: ["Courageous", "Determined", "Confident", "Enthusiastic", "Optimistic", "Honest", "Passionate"],
    challenges: ["Impatience", "Moodiness", "Short-tempered", "Impulsive", "Aggressive"],
    advice: "Take a deep breath before making any impulsive decisions today. Patience will be your greatest ally.",
    planetaryInfluence: "The planetary alignments suggest a day of growth.",
    positiveEnergy: "Stay positive and focus on your long-term goals.",
    challengingArea: "Avoid making hasty decisions today.",
    auspiciousTime: "10:00 AM - 11:30 AM"
  };

};

export const horoscopeFaqs = [
  { question: "In what ways reading my daily horoscope helps?", answer: "Reading your daily horoscope helps you prepare for the day by giving you insights into planetary movements and how they might affect your mood, decisions, and interactions." },
  { question: "Why is it crucial to know about the source of horoscopes?", answer: "The accuracy of a horoscope depends heavily on the astrologer's expertise and the astrological system used. A reliable source ensures the guidance is based on authentic calculations." },
  { question: "Can planning the day as per the horoscope actually make a difference to my life?", answer: "Yes, aligning your activities with favorable planetary hours can increase your chances of success and help you avoid unnecessary conflicts or obstacles." },
  { question: "What other information should I check while reading the Daily horoscope?", answer: "Along with your sun sign, checking your moon sign and ascendant can provide a more comprehensive and accurate daily forecast." },
  { question: "What if there is a negative impact on my life?", answer: "Astrology provides guidance, not absolute fate. If a challenging period is predicted, it serves as a warning to be cautious, and often comes with remedies to mitigate negative effects." },
  { question: "Is there a fee to check my daily horoscope?", answer: "No, our daily horoscopes are provided completely free of charge to help you navigate your day with cosmic wisdom." },
  { question: "How accurate is daily horoscope?", answer: "Daily horoscopes provide general trends based on sun signs. For highly accurate and personalized predictions, a complete birth chart analysis is recommended." }
];
