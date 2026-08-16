import React, { useEffect, useRef, useState } from 'react';
import HTMLFlipBookComponent from 'react-pageflip';
const HTMLFlipBook = HTMLFlipBookComponent as any;
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Minimize, Download, X } from 'lucide-react';
import { parseTypedDate } from './FormDateInput';

interface KundliBookProps {
  kundliData: any;
  step: 'cover' | 'book';
  onOpenBook: () => void;
  onClose: () => void;
  isPaid?: boolean;
  onUnlockExport?: () => void;
}

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode; number?: number; isCover?: boolean }>(
  ({ children, number, isCover }, ref) => {
    return (
      <div 
        ref={ref} 
        className={`bg-[#F8F1E4] text-[#5C3A21] shadow-[0_10px_30px_rgba(0,0,0,0.25)] overflow-hidden relative w-[550px] h-[750px] shrink-0 ${!isCover ? 'border border-[#e6d5b8]' : ''}`}
        style={{
          backgroundImage: isCover ? 'url("https://vibe.filesafe.space/1782888190245745251/attachments/af506b42-4c06-484a-ad39-f675cba28ba9.png")' : 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
          backgroundSize: isCover ? '100% 100%' : 'auto',
          backgroundPosition: 'center',
          backgroundRepeat: isCover ? 'no-repeat' : 'repeat',
          boxShadow: !isCover ? 'inset 0 0 100px rgba(92, 58, 33, 0.05)' : undefined
        }}
      >
        {isCover && <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>}
        
        {isCover ? (
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-10 px-10">
            {children}
          </div>
        ) : (
          <div className="relative z-10 w-full h-full flex flex-col pt-8 pb-6 px-8">
            {/* Elegant Page Frame */}
            <div className="absolute inset-5 border border-[#B98A45]/30 pointer-events-none z-0">
               <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-[#5C3A21]"></div>
               <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-[#5C3A21]"></div>
               <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-[#5C3A21]"></div>
               <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-[#5C3A21]"></div>
               
               <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-[#B98A45]"></div>
               <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-[#B98A45]"></div>
               <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-[#B98A45]"></div>
               <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-[#B98A45]"></div>
            </div>

            <div className="flex-1 relative z-10 flex flex-col h-full w-full">
              {children}
            </div>
            
            {/* Footer */}
            <div className="mt-auto pt-2 w-full relative z-10 shrink-0 flex flex-col items-center">
              <div className="flex flex-col items-center text-[#5C3A21] font-serif text-[11px] tracking-widest uppercase">
                {number && <span className="opacity-70 mb-1">Page {number}</span>}
                <img src="https://vibe.filesafe.space/1782888190245745251/attachments/53ab10a6-dcc4-4eef-954f-c47b36673eef.png" alt="Jyotish Now" className="w-[75px] h-auto mix-blend-multiply opacity-80" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
Page.displayName = 'Page';

export function generateNorthIndianChartSvg(planetsData: any[], chartType: 'd1' | 'd9' = 'd1', ascendantZodiacSign: any = 'Aries') {
  const zodiacMap: Record<string, number> = {
    'aries': 1, 'taurus': 2, 'gemini': 3, 'cancer': 4, 'leo': 5, 'virgo': 6,
    'libra': 7, 'scorpio': 8, 'sagittarius': 9, 'capricorn': 10, 'aquarius': 11, 'pisces': 12
  };

  const signStr = typeof ascendantZodiacSign === 'string'
    ? ascendantZodiacSign
    : (typeof ascendantZodiacSign === 'object' && ascendantZodiacSign !== null ? ascendantZodiacSign.name || ascendantZodiacSign.title || 'Aries' : 'Aries');

  const ascSignNum = zodiacMap[signStr.toLowerCase()] || 1;

  const housePlanets: Record<number, string[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []
  };

  const shortNames: Record<string, string> = {
    'Ascendant': 'As', 'Lagna': 'As', 'Sun': 'Su', 'Moon': 'Mo', 'Mars': 'Ma',
    'Mercury': 'Me', 'Jupiter': 'Ju', 'Venus': 'Ve', 'Saturn': 'Sa', 'Rahu': 'Ra', 'Ketu': 'Ke'
  };

  if (Array.isArray(planetsData) && planetsData.length > 0) {
    planetsData.forEach((p: any) => {
      const house = parseInt(p?.house || p?.house_number || "1");
      const rawName = typeof p?.name === 'object' ? (p.name?.name || p.name?.planet || 'Planet') : (p?.name || p?.planet || '');
      const name = shortNames[rawName] || rawName.substring(0, 2) || "";
      if (house >= 1 && house <= 12 && name) {
        if (!housePlanets[house].includes(name)) {
          housePlanets[house].push(name);
        }
      }
    });
  } else {
    housePlanets[1] = ['As'];
    housePlanets[4] = ['Su', 'Mo', 'Me'];
    housePlanets[5] = ['Ju'];
    housePlanets[3] = ['Ve'];
    housePlanets[4].push('Sa');
    housePlanets[12] = ['Ma'];
  }

  // Geometry coordinates for North Indian chart:
  // (numX, numY) for Zodiac Rashi number, (textX, textY) for Planet symbols
  const houseCoords: Record<number, { numX: number; numY: number; textX: number; textY: number }> = {
    1:  { numX: 200, numY: 160, textX: 200, textY: 95 },
    2:  { numX: 165, numY: 75,  textX: 115, textY: 45 },
    3:  { numX: 75,  numY: 165, textX: 45,  textY: 115 },
    4:  { numX: 160, numY: 200, textX: 95,  textY: 200 },
    5:  { numX: 75,  numY: 235, textX: 45,  textY: 285 },
    6:  { numX: 165, numY: 325, textX: 115, textY: 355 },
    7:  { numX: 200, numY: 240, textX: 200, textY: 305 },
    8:  { numX: 235, numY: 325, textX: 285, textY: 355 },
    9:  { numX: 325, numY: 235, textX: 355, textY: 285 },
    10: { numX: 240, numY: 200, textX: 305, textY: 200 },
    11: { numX: 325, numY: 165, textX: 355, textY: 115 },
    12: { numX: 235, numY: 75,  textX: 285, textY: 45 }
  };

  let svgContent = `<svg viewBox="0 0 400 400" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`;
  
  svgContent += `<rect x="6" y="6" width="388" height="388" fill="transparent" stroke="#7A0808" stroke-width="2.5" />`;
  svgContent += `<line x1="6" y1="6" x2="394" y2="394" stroke="#7A0808" stroke-width="2" />`;
  svgContent += `<line x1="394" y1="6" x2="6" y2="394" stroke="#7A0808" stroke-width="2" />`;
  svgContent += `<polygon points="200,6 394,200 200,394 6,200" fill="transparent" stroke="#7A0808" stroke-width="2" />`;

  for (let house = 1; house <= 12; house++) {
    const coords = houseCoords[house];
    const signNum = ((ascSignNum - 1 + (house - 1)) % 12) + 1;
    svgContent += `<text x="${coords.numX}" y="${coords.numY}" font-family="'Cinzel', 'Cormorant Garamond', serif" font-size="12.5px" font-weight="700" fill="#B98A45" text-anchor="middle" dominant-baseline="central">${signNum}</text>`;

    const planetsInHouse = housePlanets[house] || [];
    if (planetsInHouse.length > 0) {
      if (planetsInHouse.length === 1) {
        svgContent += `<text x="${coords.textX}" y="${coords.textY}" font-family="'Cinzel', 'Cormorant Garamond', serif" font-size="13px" font-weight="700" fill="#7A0808" text-anchor="middle" dominant-baseline="central">${planetsInHouse[0]}</text>`;
      } else if (planetsInHouse.length === 2) {
        svgContent += `<text x="${coords.textX}" y="${coords.textY}" font-family="'Cinzel', 'Cormorant Garamond', serif" font-size="12px" font-weight="700" fill="#7A0808" text-anchor="middle" dominant-baseline="central">${planetsInHouse.join(' ')}</text>`;
      } else if (planetsInHouse.length <= 4) {
        const row1 = planetsInHouse.slice(0, 2).join(' ');
        const row2 = planetsInHouse.slice(2).join(' ');
        svgContent += `<text x="${coords.textX}" y="${coords.textY - 7}" font-family="'Cinzel', 'Cormorant Garamond', serif" font-size="11px" font-weight="700" fill="#7A0808" text-anchor="middle" dominant-baseline="central">${row1}</text>`;
        svgContent += `<text x="${coords.textX}" y="${coords.textY + 8}" font-family="'Cinzel', 'Cormorant Garamond', serif" font-size="11px" font-weight="700" fill="#7A0808" text-anchor="middle" dominant-baseline="central">${row2}</text>`;
      } else {
        const row1 = planetsInHouse.slice(0, 2).join(' ');
        const row2 = planetsInHouse.slice(2, 4).join(' ');
        const row3 = planetsInHouse.slice(4).join(' ');
        svgContent += `<text x="${coords.textX}" y="${coords.textY - 12}" font-family="'Cinzel', 'Cormorant Garamond', serif" font-size="10px" font-weight="700" fill="#7A0808" text-anchor="middle" dominant-baseline="central">${row1}</text>`;
        svgContent += `<text x="${coords.textX}" y="${coords.textY}" font-family="'Cinzel', 'Cormorant Garamond', serif" font-size="10px" font-weight="700" fill="#7A0808" text-anchor="middle" dominant-baseline="central">${row2}</text>`;
        if (row3) {
          svgContent += `<text x="${coords.textX}" y="${coords.textY + 12}" font-family="'Cinzel', 'Cormorant Garamond', serif" font-size="10px" font-weight="700" fill="#7A0808" text-anchor="middle" dominant-baseline="central">${row3}</text>`;
        }
      }
    }
  }

  svgContent += `</svg>`;
  return svgContent;
}

export const renderSafeString = (val: any, fallback = ""): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.name || val.title || val.value || val.label || val.description || fallback;
  }
  return fallback;
};

export const getPlanetFullName = (name: string) => {
  const map: Record<string, string> = {
    'As': 'Ascendant (Lagna)',
    'Su': 'Sun (Surya)',
    'Mo': 'Moon (Chandra)',
    'Ma': 'Mars (Mangal)',
    'Me': 'Mercury (Budh)',
    'Ju': 'Jupiter (Guru)',
    'Ve': 'Venus (Shukra)',
    'Sa': 'Saturn (Shani)',
    'Ra': 'Rahu',
    'Ke': 'Ketu'
  };
  return map[name] || name;
};

const normalizePlanet = (item: any) => {
  if (!item || typeof item !== 'object') return item;
  return {
    ...item,
    name: renderSafeString(item.name || item.planet, "Planet"),
    zodiac: renderSafeString(item.zodiac || item.sign || item.rasi, "-"),
    sign: renderSafeString(item.sign || item.zodiac || item.rasi, "-"),
    house: typeof item.house === 'object' ? renderSafeString(item.house.name || item.house.house || item.house.number, "-") : String(item.house || "-")
  };
};

export function KundliBook({ kundliData, step, onOpenBook, onClose, isPaid, onUnlockExport }: KundliBookProps) {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [zoom, setZoom] = React.useState(1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleExportClick = () => {
    if (isPaid) {
      window.print();
    } else if (onUnlockExport) {
      onUnlockExport();
    } else {
      window.print();
    }
  };
  
  const p = kundliData.panchang || {};

  const extractPlanets = (input: any): any[] => {
    if (!input) return [];
    let data = input.response || input.planets || input.data || input;
    let list: any[] = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (typeof data === 'object' && data !== null) {
      if (data.response) data = data.response;
      if (Array.isArray(data)) {
        list = data;
      } else {
        list = Object.values(data);
      }
    }
    return list
      .filter((item: any) => item && typeof item === 'object' && !Array.isArray(item) && (item.name || item.planet || item.full_name) && (item.house !== undefined || item.local_degree !== undefined || item.normDegree !== undefined || item.zodiac !== undefined || item.sign !== undefined))
      .map(normalizePlanet);
  };

  const extractYogas = (input: any): { name: string; description: string }[] => {
    if (!input) return [];
    let data = input.response || input.yogas || input;
    if (data?.response) data = data.response;
    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (typeof data === 'object' && data !== null) {
      rawList = Object.values(data).filter((item: any) => typeof item === 'object' && item !== null && (item.yoga || item.name || item.title));
    }
    return rawList.map((item: any) => ({
      name: renderSafeString(item?.yoga || item?.name || item?.yoga_name || item?.title, "Vedic Yoga"),
      description: renderSafeString(item?.meaning || item?.description || item?.details, "An auspicious planetary combination in your chart.")
    }));
  };

  const extractDasha = (input: any): { planet: string; start: string; end: string }[] => {
    if (!input) return [];
    let data = input;
    if (data?.response) data = data.response;
    if (data?.dasha && typeof data.dasha === 'object' && !Array.isArray(data.dasha)) data = data.dasha;
    
    if (data && Array.isArray(data.mahadasha)) {
      const planets = data.mahadasha;
      const order = Array.isArray(data.mahadasha_order) ? data.mahadasha_order : [];
      let prevDate = data.start_year ? String(data.start_year) : (data.dasha_start_date ? String(new Date(data.dasha_start_date).getFullYear()) : "Birth");
      return planets.map((p: string, idx: number) => {
        const orderDate = order[idx] ? new Date(order[idx]) : null;
        const endYear = orderDate && !isNaN(orderDate.getFullYear()) ? String(orderDate.getFullYear()) : (idx === planets.length - 1 ? "Beyond" : "");
        const planetName = typeof p === 'string' ? p : renderSafeString(p, "Planet");
        const dashaObj = {
          planet: planetName,
          start: prevDate,
          end: endYear || "Ongoing"
        };
        if (endYear && endYear !== "Beyond") prevDate = endYear;
        return dashaObj;
      });
    }

    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        planet: typeof item === 'string' ? item : renderSafeString(item?.planet || item?.planet_name || item?.name, "Planet"),
        start: renderSafeString(item?.start || item?.start_year || item?.start_date, "-"),
        end: renderSafeString(item?.end || item?.end_year || item?.end_date, "-")
      }));
    }
    return [];
  };

  const extractPredictions = (input: any, planetsList: any[] = []): { planet: string; house: string | number; report: string }[] => {
    if (input) {
      let data = input.response || input.planetReport || input.report || input;
      if (data?.response) data = data.response;
      let rawList: any[] = [];
      if (Array.isArray(data)) {
        rawList = data;
      } else if (typeof data === 'object' && data !== null) {
        rawList = Object.values(data).filter((item: any) => typeof item === 'object' && item !== null && (item.planet || item.name));
      }
      if (rawList.length > 0) {
        return rawList.map((item: any) => ({
          planet: renderSafeString(item?.planet || item?.planet_name || item?.name, "Planet"),
          house: renderSafeString(item?.house || item?.house_number, "Chart"),
          report: renderSafeString(item?.report || item?.description || item?.meaning, "Influential placement in your horoscope.")
        }));
      }
    }

    // Default rich interpretations based on actual planet placements
    const defaultReports: Record<string, string> = {
      'Sun': 'Grants administrative prowess, willpower, leadership qualities, and dignity in personal enterprise.',
      'Moon': 'Enhances emotional intelligence, public popularity, mental peace, and intuitive creativity.',
      'Mars': 'Bestows courage, dynamic initiative, passion for accomplishments, and victory over obstacles.',
      'Mercury': 'Sharpens communication, commerce skills, analytical reasoning, and strategic adaptability.',
      'Jupiter': 'Blesses with higher wisdom, fortune, spiritual expansion, and philosophical integrity.',
      'Venus': 'Attracts refined arts, harmonious relationships, marital contentment, and aesthetic prosperity.',
      'Saturn': 'Instills discipline, endurance, long-term mastery, and structured career stability.',
      'Rahu': 'Drives ambition, unconventional vision, breakthroughs, and worldly prominence.',
      'Ketu': 'Promotes spiritual liberation, deep research capabilities, and transcendental insight.'
    };

    if (planetsList && planetsList.length > 0) {
      return planetsList
        .filter((p: any) => p && p.name && p.name !== 'Ascendant' && p.name !== 'As')
        .slice(0, 5)
        .map((p: any) => {
          const fullName = getPlanetFullName(p.name);
          const houseText = p.house ? `${p.house}th` : 'Birth';
          return {
            planet: fullName,
            house: houseText,
            report: `${fullName} placed in the ${houseText} house (${p.zodiac || 'your sign'}): ${defaultReports[fullName] || 'Brings distinct cosmic energy to your destiny.'}`
          };
        });
    }

    return [];
  };

  const pl = extractPlanets(kundliData.planets);
  const yogasList = extractYogas(kundliData.yogas);
  const dashaList = extractDasha(kundliData.dasha);
  const predictionsList = extractPredictions(kundliData.planetReport, pl);

  const parsedBirthDate = parseTypedDate(kundliData?.user?.dob) || (kundliData?.user?.dob ? new Date(kundliData.user.dob) : undefined);
  const validBirthDate = parsedBirthDate && !isNaN(parsedBirthDate.getTime()) ? parsedBirthDate : undefined;

  const birthYear = validBirthDate 
    ? validBirthDate.getFullYear() 
    : parseInt(kundliData?.user?.dob?.split(/[-/]/)[2] || kundliData?.user?.dob?.split(/[-/]/)[0] || "2000");
  const age = Math.max(0, new Date().getFullYear() - (isNaN(birthYear) ? 2000 : birthYear));

  const birthDayOfWeek = renderSafeString(
    p.day || (validBirthDate ? validBirthDate.toLocaleDateString('en-US', { weekday: 'long' }) : "-"),
    "-"
  );

  const pobParts = kundliData?.user?.pob ? kundliData.user.pob.split(',').map((s: string) => s.trim()) : [];
  const city = kundliData?.user?.city || pobParts[0] || kundliData?.user?.pob || "-";
  const state = kundliData?.user?.state || (pobParts.length >= 3 ? pobParts[1] : (pobParts.length === 2 && pobParts[1].toLowerCase() !== "india" ? pobParts[1] : "-"));
  const country = kundliData?.user?.country || (pobParts.length >= 3 ? pobParts[2] : (pobParts.length >= 1 ? pobParts[pobParts.length - 1] : "India"));

  const formatPlanetDegree = (planet: any) => {
    if (!planet || typeof planet !== 'object') return "-";
    const rawDeg = planet.local_degree ?? planet.normDegree ?? planet.norm_degree ?? planet.fullDegree ?? planet.degree ?? planet.deg;
    if (rawDeg !== undefined && rawDeg !== null && !isNaN(Number(rawDeg))) {
      const num = Number(rawDeg);
      const deg = Math.floor(num);
      const min = Math.round((num - deg) * 60);
      return `${deg}° ${min.toString().padStart(2, '0')}'`;
    }
    if (planet.formattedDegree) return renderSafeString(planet.formattedDegree, "-");
    return "-";
  };

  const formatChartSvg = (chartInput: any, fallbackType: 'd1' | 'd9' = 'd1') => {
    let svg = '';
    if (chartInput) {
      if (typeof chartInput === 'object') {
        svg = chartInput.response || chartInput.svg || chartInput.chart || chartInput.data || '';
      } else if (typeof chartInput === 'string' && chartInput.includes('<svg')) {
        svg = chartInput;
      }
    }

    if (svg && svg.includes('<svg')) {
      const svgStart = svg.indexOf('<svg');
      const svgEnd = svg.lastIndexOf('</svg>');
      if (svgStart !== -1 && svgEnd !== -1) {
        svg = svg.substring(svgStart, svgEnd + 6);
      }
    }

    if (!svg || !svg.includes('<svg')) {
      const ascSign = p.sun_sign || p.moon_sign || "Aries";
      svg = generateNorthIndianChartSvg(pl, fallbackType, ascSign);
    }

    if (!svg.includes('viewBox')) {
      const widthMatch = svg.match(/width="(\d+)"/);
      const heightMatch = svg.match(/height="(\d+)"/);
      const w = widthMatch ? widthMatch[1] : '500';
      const h = heightMatch ? heightMatch[1] : '500';
      svg = svg.replace('<svg', `<svg viewBox="0 0 ${w} ${h}"`);
    }

    svg = svg
      .replace(/width="[^"]*"/, 'width="100%"')
      .replace(/height="[^"]*"/, 'height="100%"');

    if (!svg.includes('preserveAspectRatio')) {
      svg = svg.replace('<svg', '<svg preserveAspectRatio="xMidYMid meet"');
    }

    svg = svg
      .replace(/stroke="[^"]*"/g, 'stroke="#7A0808"')
      .replace(/stroke-width="[^"]*"/g, 'stroke-width="2.2"');

    svg = svg.replace(/<text\b([^>]*)>(.*?)<\/text>/g, (match, attrs, content) => {
      const trimmed = content.trim();
      const isNumber = /^\d+$/.test(trimmed);
      const color = isNumber ? '#B98A45' : '#7A0808';
      const fontSize = isNumber ? '12.5px' : '13.5px';
      let cleanedAttrs = attrs
        .replace(/font-family="[^"]*"/g, '')
        .replace(/font-size="[^"]*"/g, '')
        .replace(/font-weight="[^"]*"/g, '')
        .replace(/fill="[^"]*"/g, '')
        .replace(/style="[^"]*"/g, '');
      return `<text ${cleanedAttrs} font-family="'Cinzel', 'Cormorant Garamond', serif" font-weight="700" font-size="${fontSize}" fill="${color}">${content}</text>`;
    });

    svg = svg
      .replace(/fill="#ffffff"/gi, 'fill="transparent"')
      .replace(/fill="#fff"/gi, 'fill="transparent"')
      .replace(/fill="white"/gi, 'fill="transparent"');

    return svg;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const onPage = (e: any) => {
    setCurrentPage(e.data);
  };

  const nextButtonClick = () => bookRef.current?.pageFlip().flipNext();
  const prevButtonClick = () => bookRef.current?.pageFlip().flipPrev();
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="text-center mb-3 relative w-full flex flex-col items-center">
      <h2 className="text-[24px] sm:text-[28px] font-bold text-[#7A0808] tracking-widest uppercase drop-shadow-sm" style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif" }}>{title}</h2>
      {subtitle && <p className="text-[10px] font-sans font-bold text-[#B98A45] tracking-[0.2em] uppercase mt-0.5">{subtitle}</p>}
      <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#B98A45] to-transparent mt-1"></div>
    </div>
  );

  const pages = [
    <Page isCover key="cover">
      <div className="w-full h-full flex flex-col items-center justify-between cursor-pointer" onClick={() => bookRef.current?.pageFlip().flipNext()}>
        <div className="flex flex-col items-center w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#7A0808] tracking-widest uppercase mb-8" style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif" }}>
            ॥ अथ श्री गणेशाय नमः ॥
          </h1>
          
          <div className="w-[300px] flex justify-center shrink-0">
            <img src="https://vibe.filesafe.space/1782888190245745251/attachments/159302af-825b-48d1-b4db-28b31939f562.png" alt="Lord Ganesha" className="w-full h-auto object-contain drop-shadow-md" />
          </div>
        </div>
        
        <div className="flex flex-col items-center w-full mt-4">
          <p className="text-[#4a2e1b] text-xl leading-[1.6] whitespace-pre-line font-medium text-center mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {`गजवदनमचिन्त्यं तीक्ष्णदन्तं गणेशं\nदुर्धर्षविघ्ननाशं भूषणैः प्राणनाथम्।\nअमरवरसुपूज्यं रक्तवर्णं धरेशं\nपशुपतिसुतमीशं विघ्नराजं नमामि॥`}
          </p>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-[#7A0808] tracking-wide text-center" style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif" }}>
            {kundliData.user.name || "Siddharth Tiwari"}
          </h2>
        </div>
        
        <div className="flex flex-col items-center mt-auto">
          <img src="https://vibe.filesafe.space/1782888190245745251/attachments/53ab10a6-dcc4-4eef-954f-c47b36673eef.png" alt="Jyotish Now" className="w-[110px] h-auto object-contain mix-blend-multiply mb-1" />
          <p className="text-xs font-serif text-[#4a2e1b] tracking-widest uppercase font-bold" style={{ fontFamily: "'Cinzel', serif" }}>Dr. Sandeep Sawhney</p>
        </div>
      </div>
    </Page>,
    <Page number={1} key="p1">
      <SectionHeader title="Table of Contents" subtitle="Horoscope Index" />
      <div className="flex-1 px-8 mt-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar pb-4">
        {[
          { page: 2, title: "Birth Details" },
          { page: 3, title: "Kundli (Lagna Chart)" },
          { page: 4, title: "Navamsa Chart" },
          { page: 5, title: "Planetary Positions" },
          { page: 6, title: "Summary Dashboard" },
          { page: 7, title: "Predictions" },
          { page: 8, title: "Dosha Analysis" },
          { page: 9, title: "Yogas" },
          { page: 10, title: "Mahadasha" },
          { page: 11, title: "Conclusion" }
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between border-b border-[#B98A45]/30 pb-1.5">
            <span className="font-serif text-lg text-[#5C3A21]">{item.title}</span>
            <span className="font-bold text-base text-[#7A0808]" style={{ fontFamily: "'Cinzel', serif" }}>{item.page}</span>
          </div>
        ))}
      </div>
    </Page>,
    <Page number={2} key="p2">
      <SectionHeader title={kundliData.user.name ? `${kundliData.user.name}'s Birth Details` : "Birth Details"} subtitle="Vedic Horoscope Profile" />
      <div className="mt-2 flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar pb-4 px-2">
        <div className="flex flex-row justify-between w-full max-w-[500px] mx-auto gap-6">
          <div className="flex-1 flex flex-col gap-y-4">
            <div className="flex justify-between items-center border-b border-[#B98A45]/30 pb-1.5">
              <p className="text-[11px] uppercase tracking-widest font-bold text-[#B98A45] font-sans">Sex</p>
              <p className="font-serif text-base font-bold text-[#5C3A21] capitalize">{kundliData.user.gender || "Male"}</p>
            </div>
            <div className="flex justify-between items-center border-b border-[#B98A45]/30 pb-1.5">
              <p className="text-[11px] uppercase tracking-widest font-bold text-[#B98A45] font-sans">Date of Birth</p>
              <p className="font-serif text-base font-bold text-[#5C3A21]">{kundliData.user.dob}</p>
            </div>
            <div className="flex justify-between items-center border-b border-[#B98A45]/30 pb-1.5">
              <p className="text-[11px] uppercase tracking-widest font-bold text-[#B98A45] font-sans">Day</p>
              <p className="font-serif text-base font-bold text-[#5C3A21] capitalize">{birthDayOfWeek}</p>
            </div>
            <div className="flex justify-between items-center border-b border-[#B98A45]/30 pb-1.5">
              <p className="text-[11px] uppercase tracking-widest font-bold text-[#B98A45] font-sans">Time of Birth</p>
              <p className="font-serif text-base font-bold text-[#5C3A21]">{kundliData.user.tob}</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col gap-y-4">
            <div className="flex justify-between items-center border-b border-[#B98A45]/30 pb-1.5">
              <p className="text-[11px] uppercase tracking-widest font-bold text-[#B98A45] font-sans">Age</p>
              <p className="font-serif text-base font-bold text-[#5C3A21]">{age} Yrs</p>
            </div>
            <div className="flex justify-between items-center border-b border-[#B98A45]/30 pb-1.5">
              <p className="text-[11px] uppercase tracking-widest font-bold text-[#B98A45] font-sans">City</p>
              <p className="font-serif text-base font-bold text-[#5C3A21] text-right max-w-[130px] truncate">{city}</p>
            </div>
            <div className="flex justify-between items-center border-b border-[#B98A45]/30 pb-1.5">
              <p className="text-[11px] uppercase tracking-widest font-bold text-[#B98A45] font-sans">State</p>
              <p className="font-serif text-base font-bold text-[#5C3A21] text-right max-w-[130px] truncate">{state}</p>
            </div>
            <div className="flex justify-between items-center border-b border-[#B98A45]/30 pb-1.5">
              <p className="text-[11px] uppercase tracking-widest font-bold text-[#B98A45] font-sans">Country</p>
              <p className="font-serif text-base font-bold text-[#5C3A21] text-right max-w-[130px] truncate">{country}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-center gap-6 mt-8 mb-2 px-2">
          <div className="flex-1 border-2 border-[#B98A45]/40 rounded-2xl bg-[#F8F1E4]/90 p-5 flex flex-col items-center shadow-md relative overflow-hidden">
            <p className="font-sans text-[#B98A45] text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Sun Sign</p>
            <img src={`/zodiac/${(renderSafeString(p.sun_sign, 'cancer')).toLowerCase()}.png`} alt="Sun Sign" className="w-[56px] h-[56px] object-contain mb-3 opacity-90 drop-shadow-sm" onError={(e) => e.currentTarget.src = 'https://vibe.filesafe.space/1782888190245745251/attachments/c1378bd9-28a1-4a14-bebf-d092cc87a63a.png'} />
            <p className="font-bold text-xl text-[#7A0808] capitalize" style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif" }}>{renderSafeString(p.sun_sign, "Cancer")}</p>
          </div>
          <div className="flex-1 border-2 border-[#B98A45]/40 rounded-2xl bg-[#F8F1E4]/90 p-5 flex flex-col items-center shadow-md relative overflow-hidden">
            <p className="font-sans text-[#B98A45] text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Moon Sign</p>
            <img src={`/zodiac/${(renderSafeString(p.moon_sign, 'aquarius')).toLowerCase()}.png`} alt="Moon Sign" className="w-[56px] h-[56px] object-contain mb-3 opacity-90 drop-shadow-sm" onError={(e) => e.currentTarget.src = 'https://vibe.filesafe.space/1782888190245745251/attachments/697e618d-9f03-4478-b51e-c65f755688d2.png'} />
            <p className="font-bold text-xl text-[#7A0808] capitalize" style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif" }}>{renderSafeString(p.moon_sign, "Aquarius")}</p>
          </div>
        </div>
      </div>
    </Page>,
    <Page number={3} key="p3">
      <SectionHeader title="Kundli (Lagna Chart)" subtitle="D1 Main Birth Chart" />
      <div className="flex-1 flex flex-col items-center justify-center relative mt-1 w-full max-w-[460px] mx-auto pb-4">
        <div className="w-full aspect-square relative z-10 flex flex-col items-center justify-center p-3 border-2 border-[#B98A45]/50 rounded-2xl bg-[#F8F1E4]/90 shadow-lg">
          <div className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:overflow-visible" dangerouslySetInnerHTML={{ __html: formatChartSvg(kundliData.charts?.d1North, 'd1') }} />
        </div>
      </div>
    </Page>,
    <Page number={4} key="p4">
      <SectionHeader title="Navamsa Chart" subtitle="D9 Destiny & Marriage Chart" />
      <div className="flex-1 flex flex-col items-center justify-center relative mt-1 w-full max-w-[460px] mx-auto pb-4">
        <div className="w-full aspect-square relative z-10 flex flex-col items-center justify-center p-3 border-2 border-[#B98A45]/50 rounded-2xl bg-[#F8F1E4]/90 shadow-lg">
          <div className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:overflow-visible" dangerouslySetInnerHTML={{ __html: formatChartSvg(kundliData.charts?.d9North, 'd9') }} />
        </div>
      </div>
    </Page>,
    <Page number={5} key="p5">
      <SectionHeader title="Planetary Positions" subtitle="Graha Sthiti & Degrees" />
      <div className="flex-1 mt-2 px-4 overflow-y-auto custom-scrollbar pb-4">
        <table className="w-full text-left border-collapse bg-[#F8F1E4] shadow-sm relative z-10 border border-[#B98A45]/40 rounded-lg overflow-hidden">
          <thead>
            <tr className="border-b-2 border-[#B98A45]/50 bg-[#7A0808]/10">
              <th className="p-3 font-bold text-[#7A0808] text-sm sm:text-base border-r border-[#B98A45]/30" style={{ fontFamily: "'Cinzel', serif" }}>Planet</th>
              <th className="p-3 font-bold text-[#7A0808] text-sm sm:text-base border-r border-[#B98A45]/30" style={{ fontFamily: "'Cinzel', serif" }}>Sign</th>
              <th className="p-3 font-bold text-[#7A0808] text-sm sm:text-base text-center border-r border-[#B98A45]/30" style={{ fontFamily: "'Cinzel', serif" }}>Degree</th>
              <th className="p-3 font-bold text-[#7A0808] text-sm sm:text-base text-center" style={{ fontFamily: "'Cinzel', serif" }}>House</th>
            </tr>
          </thead>
          <tbody>
            {(pl.length > 0 ? pl.slice(0, 9) : [
              { name: "Ascendant", sign: "Cancer", house: 1, normDegree: 25.4 },
              { name: "Sun", sign: "Cancer", house: 4, normDegree: 14.2 },
              { name: "Moon", sign: "Aquarius", house: 11, normDegree: 8.7 },
              { name: "Mars", sign: "Aries", house: 10, normDegree: 19.3 },
              { name: "Mercury", sign: "Gemini", house: 4, normDegree: 3.8 },
              { name: "Jupiter", sign: "Pisces", house: 5, normDegree: 22.1 },
              { name: "Venus", sign: "Taurus", house: 3, normDegree: 12.5 },
              { name: "Saturn", sign: "Aquarius", house: 8, normDegree: 27.9 },
              { name: "Rahu", sign: "Taurus", house: 2, normDegree: 16.4 }
            ]).map((planet: any, i: number) => (
              <tr key={i} className={`border-b border-[#B98A45]/20 ${i % 2 === 0 ? 'bg-[#F8F1E4]' : 'bg-[#5C3A21]/5'}`}>
                <td className="p-3 font-bold text-[#7A0808] text-sm border-r border-[#B98A45]/30" style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif" }}>
                  {getPlanetFullName(renderSafeString(planet.name || planet.planet, "Planet"))}
                </td>
                <td className="p-3 font-medium text-[#5C3A21] text-sm border-r border-[#B98A45]/30">{renderSafeString(planet.zodiac || planet.sign, "-")}</td>
                <td className="p-3 text-center font-bold text-[#7A0808] text-sm border-r border-[#B98A45]/30" style={{ fontFamily: "'Cinzel', serif" }}>{formatPlanetDegree(planet)}</td>
                <td className="p-3 text-center font-bold text-[#7A0808] text-base" style={{ fontFamily: "'Cinzel', serif" }}>{renderSafeString(planet.house, "-")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>,
    <Page number={6} key="p6">
      <SectionHeader title="Summary Dashboard" subtitle="Astrological Highlights" />
      <div className="flex-1 grid grid-cols-2 gap-3.5 px-4 mt-2">
        <div className="p-4 border-2 border-[#B98A45]/40 bg-[#F8F1E4]/90 rounded-xl text-center flex flex-col items-center justify-center shadow-sm">
          <h4 className="font-bold text-[#7A0808] text-base mb-1" style={{ fontFamily: "'Cinzel', serif" }}>Yogas</h4>
          <p className="text-[#5C3A21]/80 text-xs font-sans font-medium">Auspicious combinations</p>
          <p className="font-bold text-4xl text-[#7A0808] mt-2" style={{ fontFamily: "'Cinzel', serif" }}>
            {yogasList.length > 0 ? yogasList.length : 3}
          </p>
        </div>
        <div className="p-4 border-2 border-[#B98A45]/40 bg-[#F8F1E4]/90 rounded-xl text-center flex flex-col items-center justify-center shadow-sm">
          <h4 className="font-bold text-[#7A0808] text-base mb-1" style={{ fontFamily: "'Cinzel', serif" }}>Doshas</h4>
          <p className="text-[#5C3A21]/80 text-xs font-sans font-medium">Flaws to remedy</p>
          <p className="font-bold text-4xl text-[#7A0808] mt-2" style={{ fontFamily: "'Cinzel', serif" }}>
            {[
              kundliData.doshas?.manglik?.manglik_by_mars ?? kundliData.doshas?.manglik?.is_present,
              kundliData.doshas?.kaalsarp?.is_present,
              kundliData.doshas?.sadesati?.is_present
            ].filter(Boolean).length}
          </p>
        </div>
        <div className="p-4 border-2 border-[#B98A45]/40 bg-[#F8F1E4]/90 rounded-xl text-center flex flex-col items-center justify-center col-span-2 shadow-sm">
          <h4 className="font-bold text-[#7A0808] text-base mb-2" style={{ fontFamily: "'Cinzel', serif" }}>Lucky Elements</h4>
          <div className="flex justify-around w-full mt-1">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#B98A45] font-bold font-sans">Number</p>
              <p className="font-bold text-xl text-[#7A0808]" style={{ fontFamily: "'Cinzel', serif" }}>
                {Array.isArray(kundliData.lucky?.lucky_number || kundliData.lucky?.lucky_num || kundliData.planets?.lucky_num) 
                  ? (kundliData.lucky?.lucky_number || kundliData.lucky?.lucky_num || kundliData.planets?.lucky_num).map((n: any) => renderSafeString(n)).join(', ') 
                  : renderSafeString(kundliData.lucky?.lucky_number || kundliData.lucky?.lucky_num || kundliData.planets?.lucky_num, "3, 9")}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#B98A45] font-bold font-sans">Color</p>
              <p className="font-bold text-xl text-[#7A0808] capitalize" style={{ fontFamily: "'Cinzel', serif" }}>
                {Array.isArray(kundliData.lucky?.lucky_color || kundliData.lucky?.lucky_colors || kundliData.planets?.lucky_colors)
                  ? (kundliData.lucky?.lucky_color || kundliData.lucky?.lucky_colors || kundliData.planets?.lucky_colors).map((c: any) => renderSafeString(c)).join(', ')
                  : renderSafeString(kundliData.lucky?.lucky_color || kundliData.lucky?.lucky_colors || kundliData.planets?.lucky_colors, "Yellow, Gold")}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#B98A45] font-bold font-sans">Gemstone</p>
              <p className="font-bold text-xl text-[#7A0808] capitalize" style={{ fontFamily: "'Cinzel', serif" }}>
                {Array.isArray(kundliData.lucky?.lucky_gemstone || kundliData.lucky?.lucky_gem || kundliData.planets?.lucky_gem)
                  ? (kundliData.lucky?.lucky_gemstone || kundliData.lucky?.lucky_gem || kundliData.planets?.lucky_gem).map((g: any) => renderSafeString(g)).join(', ')
                  : renderSafeString(kundliData.lucky?.lucky_gemstone || kundliData.lucky?.lucky_gem || kundliData.planets?.lucky_gem, "Yellow Sapphire")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Page>,
    <Page number={7} key="p7">
      <SectionHeader title="Predictions" subtitle="Planetary Interpretations" />
      <div className="flex-1 mt-2 px-4 overflow-y-auto custom-scrollbar pb-4">
        {(predictionsList.length > 0 ? predictionsList : [
          { planet: "Sun", house: "4th", report: "Sun in the 4th house grants administrative strength, dignified family lineage, and deep emotional courage." },
          { planet: "Moon", house: "11th", report: "Moon in the 11th house brings high social standing, supportive friendships, and steady financial gains." },
          { planet: "Jupiter", house: "5th", report: "Jupiter in the 5th house bestows high education, creative intelligence, and spiritual wisdom." }
        ]).slice(0, 3).map((report: any, i: number) => (
          <div key={i} className="p-3.5 border border-[#B98A45]/40 bg-[#F8F1E4] shadow-sm rounded-sm mb-3">
            <h4 className="font-bold text-lg text-[#7A0808] mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
              {renderSafeString(report.planet, "Planet")} in {renderSafeString(report.house, "Chart")} House
            </h4>
            <p className="text-[#5C3A21]/90 font-serif leading-relaxed text-xs sm:text-sm">
              {renderSafeString(report.report, "This placement brings unique cosmic energies to your chart.")}
            </p>
          </div>
        ))}
      </div>
    </Page>,
    <Page number={8} key="p8">
      <SectionHeader title="Dosha Analysis" subtitle="Vedic Flaw Assessments" />
      <div className="flex-1 flex flex-col gap-4 mt-2 px-3 overflow-y-auto custom-scrollbar pb-4">
        {[
          { title: "Manglik Dosha", isPresent: Boolean(kundliData.doshas?.manglik?.manglik_by_mars || kundliData.doshas?.manglik?.is_present || kundliData.doshas?.manglik?.present) },
          { title: "Kaal Sarp Dosha", isPresent: Boolean(kundliData.doshas?.kaalsarp?.is_present || kundliData.doshas?.kaalsarp?.present) },
          { title: "Sade Sati", isPresent: Boolean(kundliData.doshas?.sadesati?.is_present || kundliData.doshas?.sadesati?.present) }
        ].map((dosha, i) => (
          <div key={i} className="p-4 border border-[#B98A45]/40 shadow-sm relative bg-[#F8F1E4] rounded-sm">
            <div className="flex justify-between items-center mb-2 border-b border-[#B98A45]/20 pb-2">
              <h4 className="font-bold text-xl text-[#7A0808]" style={{ fontFamily: "'Cinzel', serif" }}>{dosha.title}</h4>
              <span className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase border ${dosha.isPresent ? 'border-[#7A0808] text-[#7A0808] bg-[#7A0808]/10' : 'border-[#B98A45] text-[#B98A45]'}`}>
                {dosha.isPresent ? 'Present' : 'Not Present'}
              </span>
            </div>
            <p className="text-[#5C3A21] leading-relaxed font-serif text-sm">
              {dosha.isPresent 
                ? 'This dosha is present in your chart. Specific Vedic remedies are highly recommended to mitigate its effects.' 
                : 'Auspicious! This dosha is not present in your birth chart.'}
            </p>
          </div>
        ))}
      </div>
    </Page>,
    <Page number={9} key="p9">
      <SectionHeader title="Yogas" subtitle="Planetary Combinations" />
      <div className="flex-1 mt-2 px-4 overflow-y-auto custom-scrollbar pb-4">
        {(yogasList.length > 0 ? yogasList : [
          { name: "Budhaditya Yoga", description: "Conjunction of Sun and Mercury forming high intellect, sharp memory, and executive communication skills." },
          { name: "Gajakesari Yoga", description: "Jupiter in Kendra from Moon providing wisdom, reputation, financial stability, and respected status in society." },
          { name: "Lagna Lord In Kendra", description: "Ascendant lord situated in a cardinal house bringing longevity, vitality, and strong self-direction." }
        ]).slice(0, 4).map((yoga: any, i: number) => (
          <div key={i} className="p-3.5 border border-[#B98A45]/40 bg-[#F8F1E4] shadow-sm rounded-sm mb-3">
            <h4 className="font-bold text-lg text-[#7A0808] mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
              {renderSafeString(yoga.name, "Vedic Yoga")}
            </h4>
            <p className="text-[#5C3A21]/90 font-serif leading-relaxed text-xs sm:text-sm">
              {renderSafeString(yoga.description, "A special planetary combination forming this yoga in your chart.")}
            </p>
          </div>
        ))}
      </div>
    </Page>,
    <Page number={10} key="p10">
      <SectionHeader title="Mahadasha" subtitle="Vimshottari Timeline" />
      <div className="flex-1 mt-2 px-4 overflow-y-auto custom-scrollbar pb-4">
        {(dashaList.length > 0 ? dashaList : [
          { planet: "Sun", start: `${birthYear}`, end: `${birthYear + 6}` },
          { planet: "Moon", start: `${birthYear + 6}`, end: `${birthYear + 16}` },
          { planet: "Mars", start: `${birthYear + 16}`, end: `${birthYear + 23}` },
          { planet: "Rahu", start: `${birthYear + 23}`, end: `${birthYear + 41}` },
          { planet: "Jupiter", start: `${birthYear + 41}`, end: `${birthYear + 57}` },
          { planet: "Saturn", start: `${birthYear + 57}`, end: `${birthYear + 76}` },
          { planet: "Mercury", start: `${birthYear + 76}`, end: `${birthYear + 93}` }
        ]).slice(0, 9).map((d: any, i: number) => {
          const rawPlanet = renderSafeString(d.planet, "Planet").replace(/\s*dasha$/i, '');
          const cleanPlanet = rawPlanet === "Planet" || rawPlanet === "Dasha"
            ? ["Rahu", "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun", "Moon", "Mars"][i] || "Dasha"
            : rawPlanet;
          const displayStart = d.start && d.start !== "-" ? d.start : (validBirthDate ? String(birthYear + i * 7) : "-");
          const displayEnd = d.end && d.end !== "-" ? d.end : (validBirthDate ? String(birthYear + (i + 1) * 7) : "-");
          return (
            <div key={i} className="flex justify-between items-center p-2.5 border-b border-[#B98A45]/30">
              <span className="font-bold text-base text-[#7A0808]" style={{ fontFamily: "'Cinzel', serif" }}>
                {cleanPlanet} Dasha
              </span>
              <span className="font-serif text-sm font-bold text-[#5C3A21]">
                {displayStart} - {displayEnd}
              </span>
            </div>
          );
        })}
      </div>
    </Page>,
    <Page number={11} key="p11">
      <SectionHeader title="Conclusion" subtitle="Final Guidance" />
      <div className="flex-1 flex flex-col items-center justify-between px-4 py-2">
        <div className="p-6 border border-[#B98A45]/40 bg-[#F8F1E4] shadow-sm relative max-w-md mx-auto text-center rounded-sm">
          <p className="text-[#5C3A21] leading-relaxed italic text-base sm:text-lg font-serif">
            "The stars incline us, they do not bind us. Your birth chart reveals a soul with great potential. By understanding these cosmic patterns, you can navigate life's challenges with wisdom and grace."
          </p>
          <div className="mt-4 pt-4 border-t border-[#B98A45]/40">
            <p className="font-bold text-[#7A0808] text-xl mb-1" style={{ fontFamily: "'Cinzel', serif" }}>Dr. Sandeep Sawhney</p>
            <p className="text-[10px] uppercase tracking-widest text-[#B98A45] font-bold">Vedic Astrologer</p>
          </div>
        </div>

        {/* High-Resolution PDF Export Call-to-Action */}
        <div className="w-full max-w-md mx-auto mt-3 p-4 bg-gradient-to-r from-[#7A0808]/10 via-[#F5C27A]/15 to-[#7A0808]/10 border border-[#B98A45]/40 rounded-xl text-center shadow-inner flex flex-col items-center gap-2">
          <button
            onClick={handleExportClick}
            className="w-full py-2.5 px-4 bg-[#7A0808] hover:bg-[#5C0606] text-white rounded-lg font-serif text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="w-4 h-4 text-[#F5C27A]" />
            {isPaid ? "Download & Print Full PDF Report" : "Unlock Full Kundli PDF Export (₹999)"}
          </button>
          <p className="text-[11px] text-[#5C3A21]/80 font-medium">
            {isPaid 
              ? "✓ High-Resolution 16-Page Printable Report Unlocked" 
              : "Includes printable 16-page PDF report + personal astrologer consultation"}
          </p>
        </div>
      </div>
    </Page>,
    <Page isCover key="back">
      <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer" onClick={() => bookRef.current?.pageFlip().flipPrev()}>
        <img src="https://vibe.filesafe.space/1782888190245745251/attachments/53ab10a6-dcc4-4eef-954f-c47b36673eef.png" alt="Jyotish Now" className="w-[140px] h-auto object-contain mix-blend-multiply mb-5 opacity-80" />
        <h2 className="text-3xl font-bold text-[#7A0808] tracking-wide mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
          Jyotish Now
        </h2>
        <p className="text-[#4a2e1b] font-serif tracking-widest uppercase text-xs mb-6" style={{ fontFamily: "'Cinzel', serif" }}>Dr. Sandeep Sawhney</p>
        <p className="text-[#4a2e1b]/70 font-serif text-sm">www.jyotishnow.com</p>
      </div>
    </Page>
  ];

  const [bookScale, setBookScale] = useState(1);
  const [coverScale, setCoverScale] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      const containerW = window.innerWidth;
      const containerH = window.innerHeight;
      
      const targetW = mobile ? 550 : 1100;
      const targetH = 750;
      
      const padW = mobile ? 0.94 : 0.92;
      const padH = mobile ? 0.78 : 0.80;
      
      const bScaleX = (containerW * padW) / targetW;
      const bScaleY = (containerH * padH) / targetH;
      const fitScale = Math.min(bScaleX, bScaleY);
      setBookScale(fitScale);
      
      const cScaleX = (containerW * padW) / 550;
      const cScaleY = (containerH * padH) / 750;
      const cFitScale = Math.min(cScaleX, cScaleY);
      setCoverScale(cFitScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center relative bg-transparent pt-12 sm:pt-16" id="printable-report-container">
      
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 md:top-6 md:right-8 z-[120] p-3 bg-[#5C3A21]/90 hover:bg-[#5C3A21] backdrop-blur-md rounded-full transition-all duration-300 text-[#F8F1E4] shadow-xl border border-[#B98A45]/40"
        title="Close Viewer"
      >
        <X className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <div className={`absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-1.5 sm:gap-2 bg-[#5C3A21]/95 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-2xl border border-[#B98A45]/40 text-[#F8F1E4] no-print transition-all duration-300 ${currentPage >= 12 ? 'opacity-0 pointer-events-none translate-y-[-20px]' : 'opacity-100 translate-y-0'}`}>
        <button onClick={prevButtonClick} className="p-1.5 sm:p-2 hover:bg-[#B98A45]/30 rounded-full transition-colors active:scale-95" title="Previous Page">
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <span className="font-serif text-xs sm:text-sm px-2 min-w-[55px] text-center font-bold">
          {currentPage === 0 ? 'Cover' : (currentPage >= 12 ? 'Back' : `Pg ${currentPage}`)}
        </span>
        <button onClick={nextButtonClick} className="p-1.5 sm:p-2 hover:bg-[#B98A45]/30 rounded-full transition-colors active:scale-95" title="Next Page">
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <div className="w-px h-5 sm:h-6 bg-[#B98A45]/40 mx-0.5 sm:mx-1"></div>
        
        <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-1.5 sm:p-2 hover:bg-[#B98A45]/30 rounded-full transition-colors" title="Zoom In">
          <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-1.5 sm:p-2 hover:bg-[#B98A45]/30 rounded-full transition-colors" title="Zoom Out">
          <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <div className="w-px h-5 sm:h-6 bg-[#B98A45]/40 mx-0.5 sm:mx-1 hidden md:block"></div>
        
        <button onClick={toggleFullscreen} className="p-2 hover:bg-[#B98A45]/30 rounded-full transition-colors hidden md:block" title="Fullscreen">
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
        <button onClick={handleExportClick} className="p-2 hover:bg-[#B98A45]/30 rounded-full transition-colors hidden md:flex items-center gap-1.5" title={isPaid ? "Download PDF" : "Unlock Full PDF Export"}>
          <Download className="w-5 h-5" />
          {!isPaid && <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5C27A]">PDF Export</span>}
        </button>
      </div>

      <div className="no-print w-full h-full flex items-center justify-center overflow-hidden pt-8 sm:pt-12" style={{ perspective: '2000px' }}>
        <div style={{ transform: `scale(${((currentPage === 0 || currentPage >= 12) && !isMobile) ? (coverScale * zoom) : (bookScale * zoom)})`, transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)', transformOrigin: 'center center' }}>
          <div 
            style={{ 
              transform: !isMobile ? `translateX(${currentPage === 0 ? '-25%' : (currentPage >= 12 ? '25%' : '0')})` : 'none',
              transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          >
            <HTMLFlipBook 
              ref={bookRef}
              width={550} 
              height={750} 
              size="fixed"
              minWidth={550} 
              maxWidth={550} 
              minHeight={750} 
              maxHeight={750} 
              maxShadowOpacity={0.5} 
              showCover={true} 
              mobileScrollSupport={true}
              className="flip-book shadow-[0_30px_70px_rgba(0,0,0,0.6)]"
              style={{ margin: '0 auto' }}
              onFlip={onPage}
              usePortrait={isMobile}
              drawShadow={true}
              flippingTime={600}
              useMouseEvents={true}
              clickEventForward={true}
            >
              {pages}
            </HTMLFlipBook>
          </div>
        </div>
      </div>

      {/* Print-only sequential pages */}
      <div id="printable-report" className="hidden print:flex print:flex-col print:w-full print:gap-8">
        {pages.map((page, index) => (
          <React.Fragment key={index}>
            {page}
            {index < pages.length - 1 && <div className="page-break"></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

