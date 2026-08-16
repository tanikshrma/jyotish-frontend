/**
 * Shared form validation: email + international phone numbers.
 *
 * Every form on the site uses these helpers so the rules can't drift apart.
 */

export type Country = {
  /** ISO 3166-1 alpha-2 — also the React key. */
  iso: string;
  name: string;
  /** Dial code without the leading "+". */
  dial: string;
  flag: string;
  /** Allowed national-number lengths, in digits. */
  minLength: number;
  maxLength: number;
  /** Optional extra rule for the national number (e.g. Indian mobiles start 6-9). */
  pattern?: RegExp;
  /** Shown as the input placeholder. */
  example: string;
};

/** India first — it is the default and the overwhelming majority of traffic. */
export const COUNTRIES: Country[] = [
  { iso: "IN", name: "India", dial: "91", flag: "🇮🇳", minLength: 10, maxLength: 10, pattern: /^[6-9]\d{9}$/, example: "98765 43210" },
  { iso: "US", name: "United States", dial: "1", flag: "🇺🇸", minLength: 10, maxLength: 10, example: "201 555 0123" },
  { iso: "CA", name: "Canada", dial: "1", flag: "🇨🇦", minLength: 10, maxLength: 10, example: "506 234 5678" },
  { iso: "GB", name: "United Kingdom", dial: "44", flag: "🇬🇧", minLength: 10, maxLength: 10, example: "7400 123456" },
  { iso: "AE", name: "United Arab Emirates", dial: "971", flag: "🇦🇪", minLength: 9, maxLength: 9, example: "50 123 4567" },
  { iso: "AU", name: "Australia", dial: "61", flag: "🇦🇺", minLength: 9, maxLength: 9, example: "412 345 678" },
  { iso: "SG", name: "Singapore", dial: "65", flag: "🇸🇬", minLength: 8, maxLength: 8, example: "8123 4567" },
  { iso: "MY", name: "Malaysia", dial: "60", flag: "🇲🇾", minLength: 9, maxLength: 10, example: "12 345 6789" },
  { iso: "SA", name: "Saudi Arabia", dial: "966", flag: "🇸🇦", minLength: 9, maxLength: 9, example: "51 234 5678" },
  { iso: "QA", name: "Qatar", dial: "974", flag: "🇶🇦", minLength: 8, maxLength: 8, example: "3312 3456" },
  { iso: "KW", name: "Kuwait", dial: "965", flag: "🇰🇼", minLength: 8, maxLength: 8, example: "500 12345" },
  { iso: "OM", name: "Oman", dial: "968", flag: "🇴🇲", minLength: 8, maxLength: 8, example: "9212 3456" },
  { iso: "BH", name: "Bahrain", dial: "973", flag: "🇧🇭", minLength: 8, maxLength: 8, example: "3600 1234" },
  { iso: "NP", name: "Nepal", dial: "977", flag: "🇳🇵", minLength: 10, maxLength: 10, example: "984 1234567" },
  { iso: "LK", name: "Sri Lanka", dial: "94", flag: "🇱🇰", minLength: 9, maxLength: 9, example: "71 234 5678" },
  { iso: "BD", name: "Bangladesh", dial: "880", flag: "🇧🇩", minLength: 10, maxLength: 10, example: "1812 345678" },
  { iso: "PK", name: "Pakistan", dial: "92", flag: "🇵🇰", minLength: 10, maxLength: 10, example: "301 2345678" },
  { iso: "DE", name: "Germany", dial: "49", flag: "🇩🇪", minLength: 10, maxLength: 11, example: "1512 3456789" },
  { iso: "FR", name: "France", dial: "33", flag: "🇫🇷", minLength: 9, maxLength: 9, example: "6 12 34 56 78" },
  { iso: "IT", name: "Italy", dial: "39", flag: "🇮🇹", minLength: 9, maxLength: 10, example: "312 345 6789" },
  { iso: "ES", name: "Spain", dial: "34", flag: "🇪🇸", minLength: 9, maxLength: 9, example: "612 34 56 78" },
  { iso: "NL", name: "Netherlands", dial: "31", flag: "🇳🇱", minLength: 9, maxLength: 9, example: "6 12345678" },
  { iso: "ZA", name: "South Africa", dial: "27", flag: "🇿🇦", minLength: 9, maxLength: 9, example: "71 123 4567" },
  { iso: "NZ", name: "New Zealand", dial: "64", flag: "🇳🇿", minLength: 8, maxLength: 10, example: "21 123 4567" },
  { iso: "JP", name: "Japan", dial: "81", flag: "🇯🇵", minLength: 10, maxLength: 10, example: "90 1234 5678" },
  { iso: "CN", name: "China", dial: "86", flag: "🇨🇳", minLength: 11, maxLength: 11, example: "131 2345 6789" },
  { iso: "HK", name: "Hong Kong", dial: "852", flag: "🇭🇰", minLength: 8, maxLength: 8, example: "5123 4567" },
  { iso: "TH", name: "Thailand", dial: "66", flag: "🇹🇭", minLength: 9, maxLength: 9, example: "81 234 5678" },
  { iso: "ID", name: "Indonesia", dial: "62", flag: "🇮🇩", minLength: 9, maxLength: 12, example: "812 345 678" },
  { iso: "PH", name: "Philippines", dial: "63", flag: "🇵🇭", minLength: 10, maxLength: 10, example: "905 123 4567" },
  { iso: "RU", name: "Russia", dial: "7", flag: "🇷🇺", minLength: 10, maxLength: 10, example: "912 345 6789" },
  { iso: "BR", name: "Brazil", dial: "55", flag: "🇧🇷", minLength: 10, maxLength: 11, example: "11 96123 4567" },
  { iso: "MX", name: "Mexico", dial: "52", flag: "🇲🇽", minLength: 10, maxLength: 10, example: "222 123 4567" },
  { iso: "NG", name: "Nigeria", dial: "234", flag: "🇳🇬", minLength: 10, maxLength: 10, example: "802 123 4567" },
  { iso: "KE", name: "Kenya", dial: "254", flag: "🇰🇪", minLength: 9, maxLength: 9, example: "712 345678" },
];

export const DEFAULT_COUNTRY_ISO = "IN";

export const getCountry = (iso: string): Country =>
  COUNTRIES.find((c) => c.iso === iso) ??
  (COUNTRIES.find((c) => c.iso === DEFAULT_COUNTRY_ISO) as Country);

/**
 * Requires a local part, an "@", a domain, and a dot-separated TLD of at least
 * two letters. Deliberately accepts .in / .co.in / .org — restricting to ".com"
 * would reject a large share of genuine Indian customers.
 */
const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

/** Returns an error message, or "" when the email is valid. */
export const validateEmail = (raw: string): string => {
  const value = raw.trim();
  if (!value) return "Email address is required";
  if (!value.includes("@")) return "Email must include an '@' (e.g. name@example.com)";
  if (value.includes("..")) return "Please enter a valid email address";
  const [, domain = ""] = value.split("@");
  if (!domain.includes(".")) return "Email must include a domain (e.g. name@example.com)";
  if (!EMAIL_REGEX.test(value)) return "Please enter a valid email address (e.g. name@example.com)";
  return "";
};

export const isValidEmail = (raw: string) => validateEmail(raw) === "";

/** Strips everything that is not a digit. */
export const digitsOnly = (raw: string) => raw.replace(/\D/g, "");

/**
 * Validates the national number against the selected country's rules.
 * `raw` is the national part only — the dial code is not included.
 * Returns an error message, or "" when valid.
 */
export const validatePhone = (raw: string, iso: string): string => {
  const country = getCountry(iso);
  const digits = digitsOnly(raw);

  if (!digits) return "Phone number is required";
  if (/[A-Za-z]/.test(raw)) return "Phone number can only contain digits";

  if (digits.length < country.minLength) {
    return country.minLength === country.maxLength
      ? `Phone number must be ${country.minLength} digits for ${country.name}`
      : `Phone number must be at least ${country.minLength} digits for ${country.name}`;
  }
  if (digits.length > country.maxLength) {
    return country.minLength === country.maxLength
      ? `Phone number must be ${country.maxLength} digits for ${country.name}`
      : `Phone number must be at most ${country.maxLength} digits for ${country.name}`;
  }
  if (country.pattern && !country.pattern.test(digits)) {
    return `Please enter a valid ${country.name} mobile number`;
  }
  return "";
};

export const isValidPhone = (raw: string, iso: string) =>
  validatePhone(raw, iso) === "";

/** Builds the E.164 form (e.g. +919876543210) sent to the CRM and Razorpay. */
export const toE164 = (raw: string, iso: string): string => {
  const country = getCountry(iso);
  return `+${country.dial}${digitsOnly(raw)}`;
};

/** Required-text helper so "Name is required" checks stay consistent too. */
export const validateRequired = (raw: string, label: string): string =>
  raw.trim() ? "" : `${label} is required`;
