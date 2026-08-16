import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { COUNTRIES, getCountry, digitsOnly } from "@/lib/validation";

interface PhoneInputProps {
  /** National number only — the dial code lives in `countryIso`. */
  value: string;
  onChange: (value: string) => void;
  countryIso: string;
  onCountryChange: (iso: string) => void;
  error?: string;
  id?: string;
  /** Applied to the number field so each form keeps its own look. */
  className?: string;
  disabled?: boolean;
}

/**
 * Phone field with a country-code selector, defaulting to India (+91).
 *
 * Non-digits are stripped as you type — pasting "+91 98765-43210" or a number
 * with letters can never put invalid characters into state — and the field is
 * capped at the selected country's maximum length.
 */
export function PhoneInput({
  value,
  onChange,
  countryIso,
  onCountryChange,
  error,
  id,
  className,
  disabled,
}: PhoneInputProps) {
  const country = getCountry(countryIso);

  const handleChange = (raw: string) => {
    onChange(digitsOnly(raw).slice(0, country.maxLength));
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex items-stretch rounded-xl border bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary",
          error ? "border-destructive" : "border-border/60",
        )}
      >
        <select
          aria-label="Country code"
          value={countryIso}
          disabled={disabled}
          onChange={(e) => {
            const next = getCountry(e.target.value);
            onCountryChange(e.target.value);
            // Re-clamp when moving to a country with a shorter number.
            onChange(digitsOnly(value).slice(0, next.maxLength));
          }}
          className="shrink-0 bg-muted/40 border-r border-border/60 px-2 text-sm text-foreground outline-none cursor-pointer hover:bg-muted/70 transition-colors"
        >
          {COUNTRIES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.flag} +{c.dial}
            </option>
          ))}
        </select>

        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          disabled={disabled}
          placeholder={country.example}
          maxLength={country.maxLength}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            handleChange(e.clipboardData.getData("text"));
          }}
          className={cn(
            "flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
            className,
          )}
        />
      </div>
      {error && (
        <p className="text-destructive text-xs mt-1 ml-1">{error}</p>
      )}
    </div>
  );
}
