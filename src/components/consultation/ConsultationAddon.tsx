import { Check, PhoneCall } from "lucide-react";
import { formatINR } from "../../../shared/pricing";
import { CONSULTATION_ADDON, quoteOrder, isQuote } from "../../../shared/consultation";
import { SlotPicker, type PickerTheme } from "./SlotPicker";

/** Price and calendar of the add-on on a given report, from the shared quote. */
export const addonDetails = (service: string, variant?: string) => {
  const q = quoteOrder(service, variant, [CONSULTATION_ADDON.key]);
  if (!isQuote(q) || !q.consultation) return null;
  return { rupees: q.consultation.rupees, calendarId: q.consultation.calendarId, minutes: q.consultation.minutes };
};

/**
 * "+₹999 — add a 15-minute call with Dr. Sandeep Sawhney", with the slot picker
 * opening underneath once ticked. The slot is part of the order, so it has to
 * be chosen before paying.
 */
export function ConsultationAddon({
  service,
  variant,
  checked,
  onCheckedChange,
  slot,
  onSlotChange,
  theme,
  refreshKey,
  error,
  idPrefix,
}: {
  service: string;
  variant?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  slot: string | null;
  onSlotChange: (slot: string | null) => void;
  theme: PickerTheme;
  refreshKey?: number;
  error?: string;
  idPrefix: string;
}) {
  const addon = addonDetails(service, variant);
  if (!addon) return null;

  return (
    <div
      className="rounded-xl border-2 transition-colors"
      style={{ borderColor: checked ? theme.cta : "#EFE4D3", background: checked ? "#FFF8EF" : "#FFFFFF" }}
    >
      <label htmlFor={`${idPrefix}-addon`} className="flex cursor-pointer items-start gap-3 p-3.5">
        <input
          id={`${idPrefix}-addon`}
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1"
          style={{ borderColor: checked ? theme.cta : "#CDBBA3", background: checked ? theme.cta : "#FFFFFF" }}
        >
          {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline justify-between gap-x-2">
            <span className="text-[14px] font-bold leading-snug" style={{ color: theme.ink }}>
              Add a 15-min call with Dr. Sandeep Sawhney
            </span>
            <span className="font-serif text-[15px] font-extrabold" style={{ color: theme.ink }}>
              +{formatINR(addon.rupees)}
            </span>
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[12px] leading-snug text-muted-foreground">
            <PhoneCall className="h-3.5 w-3.5 shrink-0" /> Audio call to go through your report · pick your time now
          </span>
        </span>
      </label>

      {checked && (
        <div className="border-t border-[#F1E4D0] px-3.5 pb-3.5 pt-3">
          <SlotPicker
            calendarId={addon.calendarId}
            minutes={addon.minutes}
            value={slot}
            onChange={onSlotChange}
            theme={theme}
            refreshKey={refreshKey}
            error={error}
          />
        </div>
      )}
    </div>
  );
}
