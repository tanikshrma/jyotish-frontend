import { useState } from "react";
import { Check, Loader2, Lock, Mail, PhoneCall, ShieldCheck, User, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/PhoneInput";
import { cn } from "@/lib/utils";
import { verifyPayment } from "@/lib/razorpay";
import { CheckoutError, payWithRazorpay } from "@/lib/consultation";
import { submitProspectIQLead, splitName } from "@/lib/prospectiq";
import { DEFAULT_COUNTRY_ISO, toE164, validateEmail, validatePhone } from "@/lib/validation";
import { formatINR } from "../../../shared/pricing";
import {
  CONSULTATION_OPTIONS,
  CONSULTATION_SERVICE,
  isQuote,
  quoteOrder,
} from "../../../shared/consultation";
import { Field, type PaidCall } from "@/components/ReportPurchaseForm";
import { SlotPicker, type PickerTheme } from "./SlotPicker";
import { BookingStatus } from "./BookingStatus";

export const DOCTOR_PHOTO =
  "https://vibe.filesafe.space/1782888190245745251/attachments/bb04e9ad-4df5-45a2-b9e1-777b70d984e1.jpg";

/**
 * A full consultation with Dr. Sandeep Sawhney, sold on its own: pick a length
 * and mode (the same prices as the site's consultation call), a live slot,
 * pay, and the server books it once Razorpay confirms the payment.
 */
export function ConsultationSection({
  id = "consultation",
  theme,
  source,
  title = "Talk to Dr. Sandeep Sawhney",
  sub = "A one-to-one consultation on your chart — ask about career, marriage, health, money or timing, and get remedies that fit your life.",
}: {
  id?: string;
  theme: PickerTheme;
  /** Landing slug, recorded on the lead. */
  source: string;
  title?: string;
  sub?: string;
}) {
  const [variant, setVariant] = useState(CONSULTATION_OPTIONS[0].variant);
  const [slot, setSlot] = useState<string | null>(null);
  const [slotRefresh, setSlotRefresh] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY_ISO);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState<PaidCall | null>(null);

  const quote = quoteOrder(CONSULTATION_SERVICE, variant);
  const booking = isQuote(quote) ? quote.consultation : null;
  const option = CONSULTATION_OPTIONS.find((o) => o.variant === variant)!;

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: "" } : e));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Please enter your name";
    const emailErr = validateEmail(form.email);
    if (emailErr) e.email = emailErr;
    const phoneErr = validatePhone(form.phone, countryIso);
    if (phoneErr) e.phone = phoneErr;
    if (!slot) e.slot = "Please pick a time";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pay = async () => {
    if (paying || !validate() || !booking) return;
    setPaying(true);
    const phone = toE164(form.phone, countryIso);
    const customer = { name: form.name.trim(), email: form.email.trim(), phone };

    void submitProspectIQLead({
      ...splitName(customer.name),
      email: customer.email,
      phone,
      service: CONSULTATION_SERVICE,
      serviceLabel: booking.label,
      consultationType: variant.replace("|", " | "),
      sourceForm: `Landing: ${source}`,
      tags: ["Consultation: Checkout Started"],
    }).catch(() => undefined);

    try {
      const resp = await payWithRazorpay({
        service: CONSULTATION_SERVICE,
        variant,
        slot,
        notes: { type: booking.label, name: customer.name, email: customer.email, phone },
        description: booking.label,
        prefill: { name: customer.name, email: customer.email, contact: phone },
        themeColor: theme.ink,
      });
      void verifyPayment({ ...resp, customer }).catch(() => undefined);
      setPaid({ payment: resp, customer });
    } catch (caught) {
      const err = caught as { code?: string; message?: string };
      if (caught instanceof CheckoutError && caught.code === "DISMISSED") return;
      if (err?.code === "SLOT_UNAVAILABLE" || err?.code === "SLOT_REQUIRED") {
        setSlot(null);
        setSlotRefresh((k) => k + 1);
        setErrors((e) => ({ ...e, slot: err.message }));
        return;
      }
      toast.error(err?.message || "Could not start payment. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <section id={id} className="scroll-mt-20 border-y border-[#EFE4D3] bg-[#FFF9F0]">
      <div className="mx-auto grid w-[92%] max-w-6xl items-start gap-8 py-14 sm:py-20 lg:grid-cols-[1fr_520px] lg:gap-14">
        <div>
          <div className="flex items-center gap-4">
            <img
              src={DOCTOR_PHOTO}
              alt="Dr. Sandeep Sawhney"
              className="h-20 w-20 shrink-0 rounded-full border-4 object-cover object-top shadow-md"
              style={{ borderColor: `${theme.cta}55` }}
            />
            <div>
              <p className="text-[11.5px] font-extrabold uppercase tracking-[.14em]" style={{ color: theme.cta }}>
                One-to-one consultation
              </p>
              <h2 className="font-serif text-[clamp(1.6rem,3.6vw,2.3rem)] font-extrabold leading-tight" style={{ color: theme.ink }}>
                {title}
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#5B504A]">{sub}</p>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {[
              "25+ years of practice, over a lakh consultations",
              "Pick a time from his live calendar",
              "Audio or video call — from anywhere",
              "Booked instantly, confirmed by email",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[14px] text-[#3D3531]">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#16A34A]">
                  <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
          {paid && booking ? (
            <div className="space-y-3 text-center">
              <h3 className="font-serif text-xl font-bold" style={{ color: theme.ink }}>Payment received</h3>
              <p className="text-[13px] text-muted-foreground">
                {booking.label} · {formatINR(booking.rupees)}. A receipt is on its way to{" "}
                <b className="break-all">{paid.customer.email}</b>.
              </p>
              <BookingStatus
                payment={paid.payment}
                customer={paid.customer}
                calendarId={booking.calendarId}
                minutes={booking.minutes}
                theme={theme}
              />
            </div>
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void pay();
              }}
              className="space-y-4"
            >
              <div>
                <p className="mb-2 text-[13px] font-semibold">Choose your consultation</p>
                <div className="grid grid-cols-2 gap-2">
                  {CONSULTATION_OPTIONS.map((o) => {
                    const active = o.variant === variant;
                    const Icon = o.mode === "Video" ? Video : PhoneCall;
                    return (
                      <button
                        key={o.variant}
                        type="button"
                        onClick={() => setVariant(o.variant)}
                        aria-pressed={active}
                        className={cn(
                          "rounded-xl border-2 px-3 py-2.5 text-left transition-colors",
                          active ? "shadow-sm" : "border-[#EFE4D3] hover:border-[#D9C7AE]",
                        )}
                        style={active ? { borderColor: theme.cta, background: "#FFF8EF" } : undefined}
                      >
                        <span className="flex items-center gap-1.5 text-[12.5px] font-bold" style={{ color: theme.ink }}>
                          <Icon className="h-3.5 w-3.5" /> {o.label}
                        </span>
                        <span className="mt-0.5 block font-serif text-lg font-extrabold" style={{ color: theme.ink }}>
                          {formatINR(o.rupees)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[13px] font-semibold">Pick a time</p>
                {booking && (
                  <SlotPicker
                    calendarId={booking.calendarId}
                    minutes={booking.minutes}
                    value={slot}
                    onChange={(v) => {
                      setSlot(v);
                      if (v) setErrors((e) => (e.slot ? { ...e, slot: "" } : e));
                    }}
                    theme={theme}
                    refreshKey={slotRefresh}
                    error={errors.slot || undefined}
                  />
                )}
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field className="sm:col-span-2" label="Full name" htmlFor={`${id}-name`} error={errors.name}>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={`${id}-name`}
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      autoComplete="name"
                      className="h-12 rounded-xl pl-9 text-base"
                    />
                  </div>
                </Field>
                <Field label="Email address" htmlFor={`${id}-email`} error={errors.email}>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={`${id}-email`}
                      type="email"
                      inputMode="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      autoComplete="email"
                      className="h-12 rounded-xl pl-9 text-base"
                    />
                  </div>
                </Field>
                <Field label="Mobile number" htmlFor={`${id}-phone`} error={errors.phone}>
                  <PhoneInput
                    id={`${id}-phone`}
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                    countryIso={countryIso}
                    onCountryChange={setCountryIso}
                    error={errors.phone}
                  />
                </Field>
              </div>

              <Button
                type="submit"
                disabled={paying}
                className="h-auto w-full rounded-xl py-4 text-base font-extrabold text-white shadow-lg disabled:opacity-80"
                style={{ background: `linear-gradient(180deg, ${theme.cta}, ${theme.ctaDark})` }}
              >
                {paying ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening secure checkout…</>
                ) : (
                  <><Lock className="mr-2 h-4 w-4" /> Book {option.label.toLowerCase()} · {formatINR(option.rupees)}</>
                )}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" style={{ color: theme.ink }} /> Secured by Razorpay · booked the moment you pay
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
