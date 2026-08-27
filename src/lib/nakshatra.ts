/**
 * Nakshatra + Pada → auspicious starting syllables for baby names.
 *
 * The Vedic convention maps each of the 27 nakshatras' four padas to a specific
 * sound; a child's name traditionally begins with the syllable for the pada the
 * Moon occupied at birth. VedicAstro's panchang gives us the nakshatra name and
 * pada, so we resolve the exact syllable here (with the other three shown as
 * alternatives). Names come from VedicAstro exactly as spelled below.
 */
const NAKSHATRA_SYLLABLES: Record<string, [string, string, string, string]> = {
  Ashwini: ["Chu", "Che", "Cho", "La"],
  Bharani: ["Li", "Lu", "Le", "Lo"],
  Krittika: ["A", "I", "U", "E"],
  Rohini: ["O", "Va", "Vi", "Vu"],
  Mrigashira: ["Ve", "Vo", "Ka", "Ki"],
  Mrigasira: ["Ve", "Vo", "Ka", "Ki"],
  Ardra: ["Ku", "Gha", "Nga", "Chha"],
  Punarvasu: ["Ke", "Ko", "Ha", "Hi"],
  Pushya: ["Hu", "He", "Ho", "Da"],
  Ashlesha: ["Di", "Du", "De", "Do"],
  Aslesha: ["Di", "Du", "De", "Do"],
  Magha: ["Ma", "Mi", "Mu", "Me"],
  "Purva Phalguni": ["Mo", "Ta", "Ti", "Tu"],
  Pubba: ["Mo", "Ta", "Ti", "Tu"],
  "Uttara Phalguni": ["Te", "To", "Pa", "Pi"],
  Uttara: ["Te", "To", "Pa", "Pi"],
  Hasta: ["Pu", "Sha", "Na", "Tha"],
  Chitra: ["Pe", "Po", "Ra", "Ri"],
  Swati: ["Ru", "Re", "Ro", "Ta"],
  Vishakha: ["Ti", "Tu", "Te", "To"],
  Visakha: ["Ti", "Tu", "Te", "To"],
  Anuradha: ["Na", "Ni", "Nu", "Ne"],
  Jyeshtha: ["No", "Ya", "Yi", "Yu"],
  Jyestha: ["No", "Ya", "Yi", "Yu"],
  Mula: ["Ye", "Yo", "Bha", "Bhi"],
  Moola: ["Ye", "Yo", "Bha", "Bhi"],
  "Purva Ashadha": ["Bhu", "Dha", "Pha", "Dha"],
  Purvashada: ["Bhu", "Dha", "Pha", "Dha"],
  "Uttara Ashadha": ["Bhe", "Bho", "Ja", "Ji"],
  Uttarashada: ["Bhe", "Bho", "Ja", "Ji"],
  Shravana: ["Ju", "Je", "Jo", "Gha"],
  Sravana: ["Ju", "Je", "Jo", "Gha"],
  Dhanishta: ["Ga", "Gi", "Gu", "Ge"],
  Dhanishtha: ["Ga", "Gi", "Gu", "Ge"],
  Shatabhisha: ["Go", "Sa", "Si", "Su"],
  Sathabhisha: ["Go", "Sa", "Si", "Su"],
  "Purva Bhadrapada": ["Se", "So", "Da", "Di"],
  Purvabhadra: ["Se", "So", "Da", "Di"],
  "Uttara Bhadrapada": ["Du", "Tha", "Jha", "Tra"],
  Uttarabhadra: ["Du", "Tha", "Jha", "Tra"],
  Revati: ["De", "Do", "Cha", "Chi"],
};

export type NakshatraSyllables = {
  /** The single syllable for the exact pada (1-4). */
  primary: string;
  /** All four pada syllables for the nakshatra. */
  all: string[];
};

/** Resolves baby-name starting syllables for a nakshatra + pada, or null. */
export const syllablesForNakshatra = (
  name?: string,
  pada?: number,
): NakshatraSyllables | null => {
  if (!name) return null;
  const key = Object.keys(NAKSHATRA_SYLLABLES).find(
    (k) => k.toLowerCase() === name.trim().toLowerCase(),
  );
  if (!key) return null;
  const all = NAKSHATRA_SYLLABLES[key];
  const idx = pada && pada >= 1 && pada <= 4 ? pada - 1 : 0;
  return { primary: all[idx], all };
};
