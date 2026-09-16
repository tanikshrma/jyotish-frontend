import { useState } from "react";
import { ArrowRight, CalendarDays, Check, Clock3, Lock, PhoneCall, ShieldCheck, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingModal } from "@/components/BookingModal";
import { formatINR } from "../../../shared/pricing";
import { CONSULTATION_OPTIONS, CONSULTATION_SERVICE } from "../../../shared/consultation";
import type { PickerTheme } from "./SlotPicker";

export const DOCTOR_PHOTO =
  "https://vibe.filesafe.space/1782888190245745251/attachments/bb04e9ad-4df5-45a2-b9e1-777b70d984e1.jpg";

const INCLUDES = [
  "In-depth reading of your birth chart",
  "Clear answers on career, marriage, health or money",
  "Remedies matched to your chart",
];

type Minutes = 30 | 60;
type Mode = "Audio" | "Video";

/**
 * A full consultation with Dr. Sandeep Sawhney, sold on its own at the site's
 * consultation-call prices.
 *
 * The page only picks the length and call type. Booking runs in the site's
 * appointment modal — details, then a live slot, then Razorpay — and the
 * server books the slot once the payment is confirmed.
 */
export function ConsultationSection({
  id = "consultation",
  theme,
  title = "Talk to Dr. Sandeep Sawhney",
  sub = "A one-to-one consultation on your chart — ask about career, marriage, health, money or timing, and get remedies that fit your life.",
}: {
  id?: string;
  theme: PickerTheme;
  /** Landing slug. Kept for callers; the modal records its own lead source. */
  source?: string;
  title?: string;
  sub?: string;
}) {
  const [minutes, setMinutes] = useState<Minutes>(30);
  const [mode, setMode] = useState<Mode>("Audio");
  const option = CONSULTATION_OPTIONS.find((o) => o.minutes === minutes && o.mode === mode)!;
  const cta = `linear-gradient(180deg, ${theme.cta}, ${theme.ctaDark})`;

  return (
    <section id={id} className="scroll-mt-20 border-y border-[#EFE4D3] bg-[#FFF9F0]">
      <div className="mx-auto grid w-[92%] max-w-6xl items-center gap-8 py-14 sm:py-16 lg:grid-cols-[1fr_460px] lg:gap-14">
        {/* pitch */}
        <div>
          <p className="text-[11.5px] font-extrabold uppercase tracking-[.14em]" style={{ color: theme.cta }}>
            One-to-one consultation
          </p>
          <h2
            className="mt-2 font-serif text-[clamp(1.7rem,3.6vw,2.4rem)] font-extrabold leading-tight"
            style={{ color: theme.ink }}
          >
            {title}
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#5B504A]">{sub}</p>

          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#EFE4D3] bg-white p-4 shadow-sm sm:max-w-md">
            <img
              src={DOCTOR_PHOTO}
              alt="Dr. Sandeep Sawhney"
              className="h-16 w-16 shrink-0 rounded-full border-2 object-cover object-top"
              style={{ borderColor: `${theme.cta}66` }}
            />
            <div className="min-w-0">
              <div className="font-serif text-[17px] font-bold" style={{ color: theme.ink }}>Dr. Sandeep Sawhney</div>
              <div className="text-[13px] text-[#6B605A]">25+ years · 1,00,000+ consultations · 4.9★</div>
            </div>
          </div>
        </div>

        {/* booking card */}
        <div className="rounded-2xl border border-[#EFE4D3] bg-white p-5 shadow-[0_24px_50px_-28px_rgba(122,8,8,.45)] sm:p-6">
          <div className="grid grid-cols-2 gap-4">
            <Segmented<Minutes>
              label="Duration"
              theme={theme}
              value={minutes}
              onChange={setMinutes}
              options={[
                { value: 30, label: "30 min", icon: Clock3 },
                { value: 60, label: "1 hour", icon: Clock3 },
              ]}
            />
            <Segmented<Mode>
              label="Call type"
              theme={theme}
              value={mode}
              onChange={setMode}
              options={[
                { value: "Audio", label: "Audio", icon: PhoneCall },
                { value: "Video", label: "Video", icon: Video },
              ]}
            />
          </div>

          <div className="mt-5 flex items-end justify-between gap-3 border-y border-[#F2E8D8] py-4">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wide text-[#8A7C72]">{option.label}</div>
              <div className="font-serif text-[2.1rem] font-extrabold leading-none" style={{ color: theme.ink }}>
                {formatINR(option.rupees)}
              </div>
            </div>
            <span className="rounded-full bg-[#16A34A]/10 px-2.5 py-1 text-[11.5px] font-bold text-[#15803D]">
              Live calendar
            </span>
          </div>

          <ul className="mt-4 space-y-2">
            {INCLUDES.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[13.5px] text-[#3D3531]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} />
                {t}
              </li>
            ))}
          </ul>

          <BookingModal defaultService={CONSULTATION_SERVICE} consultationVariant={option.variant}>
            <button
              type="button"
              className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-[16px] font-extrabold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: cta }}
            >
              <CalendarDays className="h-5 w-5" /> Book {option.label.toLowerCase()}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </BookingModal>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-[#6B605A]">
            <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" style={{ color: theme.ink }} /> Pick your date &amp; time next</span>
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" style={{ color: theme.ink }} /> Secured by Razorpay</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" style={{ color: theme.ink }} /> Booked instantly</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Segmented<T extends string | number>({
  label, options, value, onChange, theme,
}: {
  label: string;
  options: { value: T; label: string; icon: typeof Clock3 }[];
  value: T;
  onChange: (v: T) => void;
  theme: PickerTheme;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[12px] font-semibold text-[#6B605A]">{label}</div>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#F6EFE4] p-1" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-bold transition-all",
                active ? "bg-white shadow-sm" : "text-[#8A7C72] hover:text-[#3D3531]",
              )}
              style={active ? { color: theme.ink } : undefined}
            >
              <o.icon className="h-3.5 w-3.5" /> {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
