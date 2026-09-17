import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, ArrowLeft, Check, Loader2, MapPin, Lock, Mail,
  FileDown, ShieldCheck, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/PhoneInput";
import { DateInputField, TimeInputField } from "@/components/FormDateInput";
import { cn } from "@/lib/utils";
import { vedicAstroApi } from "@/lib/vedicAstroApi";
import { verifyPayment, type RazorpaySuccess } from "@/lib/razorpay";
import { CheckoutError, payWithRazorpay } from "@/lib/consultation";
import {
  deliverKundliPdf, KundliPdfError, openInNewTab, type DeliveredPdf,
} from "@/lib/kundliPdf";
import { submitProspectIQLead, splitName, type LeadData } from "@/lib/prospectiq";
import { TrackingFields } from "@/components/TrackingFields";
import { ConsultationAddon, addonDetails } from "@/components/consultation/ConsultationAddon";
import { BookingStatus } from "@/components/consultation/BookingStatus";
import { submitWhenValid } from "@/lib/tracking";
import {
  DEFAULT_COUNTRY_ISO, validateEmail, validatePhone, toE164,
} from "@/lib/validation";
import { formatINR } from "../../shared/pricing";
import { CONSULTATION_ADDON } from "../../shared/consultation";
import type { ReportLandingConfig } from "@/pages/landing/reportLandingConfig";

/* ------------------------------------------------------------------ utils */

/** DD/MM/YYYY for the astro API, from the date picker's YYYY-MM-DD. */
export const toApiDob = (isoDate: string): string => {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return y && m && d ? `${d}/${m}/${y}` : "";
};

export type GeoPick = { label: string; lat: number; lon: number; tz: number };

type Status = "idle" | "starting" | "delivering" | "done";

/** A paid call waiting to be (or already) booked. */
export type PaidCall = {
  payment: RazorpaySuccess;
  customer: { name: string; email: string; phone: string };
};

/* ------------------------------------------------------------- component */

/**
 * Birth details → Razorpay → PDF, all on the landing page.
 *
 * Split into two steps so the first screen asks only for chart data (which
 * feels like part of the product) and the contact fields arrive once the
 * visitor is already committed. The lead is pushed to Prospect IQ at the end of
 * step one — before checkout — so abandoned carts are still captured; the
 * contact endpoint upserts, so the post-payment push updates the same record.
 *
 * Step two also offers the ₹999 add-on: a 15-minute call with Dr. Sandeep
 * Sawhney. Its slot is chosen before paying (it is part of the order) and the
 * server books it once the payment is confirmed, alongside the report.
 */
export function ReportPurchaseForm({
  config,
  idPrefix = "buy",
}: {
  config: ReportLandingConfig;
  idPrefix?: string;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<Status>("idle");
  const [delivered, setDelivered] = useState<DeliveredPdf[]>([]);
  // Whether the server handed the email to Prospect IQ — not proof of arrival.
  const [emailed, setEmailed] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const [form, setForm] = useState({
    name: "", dob: "", hour: "", minute: "", pob: "", email: "", phone: "",
  });
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY_ISO);
  const [dobDate, setDobDate] = useState<Date | undefined>();
  // Open the calendar in a plausible birth decade rather than on today's month.
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(1995, 0, 1));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [withCall, setWithCall] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);
  const [slotRefresh, setSlotRefresh] = useState(0);
  const [paidCall, setPaidCall] = useState<PaidCall | null>(null);
  const addon = addonDetails("kundli-pdf", config.variant);
  const total = config.price + (withCall && addon ? addon.rupees : 0);

  const [placeQuery, setPlaceQuery] = useState("");
  const [places, setPlaces] = useState<GeoPick[]>([]);
  const [picked, setPicked] = useState<GeoPick | null>(null);
  const [searching, setSearching] = useState(false);
  const [openList, setOpenList] = useState(false);
  const placeBoxRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: "" } : e));
  };

  /* ------------------------------------------------ place autocomplete */

  useEffect(() => {
    if (placeQuery.trim().length < 3 || picked?.label === placeQuery) {
      setPlaces([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await vedicAstroApi.geoSearch(placeQuery);
        const list: GeoPick[] = (res?.response ?? []).map((r: any) => ({
          label:
            r.full_name ||
            [r.name, r.state || r.region, r.country].filter(Boolean).join(", "),
          lat: Number(r.lat ?? r.latitude),
          lon: Number(r.lon ?? r.longitude),
          tz: Number(r.tz ?? 5.5),
        }));
        setPlaces(list);
        setOpenList(list.length > 0);
      } catch {
        setPlaces([]);
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [placeQuery, picked]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (placeBoxRef.current && !placeBoxRef.current.contains(e.target as Node)) {
        setOpenList(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* ------------------------------------------------------- delivery timer */

  useEffect(() => {
    if (status !== "delivering") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  /* ------------------------------------------------------------ validation */

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Please enter your name";
    if (!form.dob) e.dob = "Please choose your date of birth";
    if (!form.hour || !form.minute) e.tob = "Please set your time of birth";
    if (!form.pob.trim()) e.pob = "Please choose your place of birth";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    const emailErr = validateEmail(form.email);
    if (emailErr) e.email = emailErr;
    const phoneErr = validatePhone(form.phone, countryIso);
    if (phoneErr) e.phone = phoneErr;
    if (withCall && !slot) e.slot = "Please pick a time for your call";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goStep2 = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  /* ---------------------------------------------------------------- buy */

  /** Resolves coordinates from the typed place when nothing was picked. */
  const resolvePlace = async (): Promise<GeoPick> => {
    if (picked) return picked;
    const res = await vedicAstroApi.geoSearch(form.pob);
    const first = res?.response?.[0];
    if (!first) {
      throw new Error(
        "We couldn't find that birth place. Please pick it from the suggestions.",
      );
    }
    return {
      label:
        first.full_name ||
        [first.name, first.state || first.region, first.country].filter(Boolean).join(", "),
      lat: Number(first.lat ?? first.latitude),
      lon: Number(first.lon ?? first.longitude),
      tz: Number(first.tz ?? 5.5),
    };
  };

  const handleBuy = async () => {
    if (status !== "idle") return;
    if (!validateStep2()) return;

    setStatus("starting");
    const [firstName, ...rest] = form.name.trim().split(/\s+/);
    const tob = `${form.hour}:${form.minute}`;
    const dobApi = toApiDob(form.dob);
    const phone = toE164(form.phone, countryIso);
    const customer = { name: form.name.trim(), email: form.email.trim(), phone };

    let place: GeoPick;
    let resp: RazorpaySuccess;
    try {
      place = await resolvePlace();

      // Capture the lead before checkout so an abandoned payment is still a
      // contact. Fire-and-forget — a CRM hiccup must never block the sale.
      void submitProspectIQLead({
        firstName: firstName || "Client",
        lastName: rest.join(" "),
        email: form.email,
        phone,
        dateOfBirth: dobApi,
        timeOfBirth: tob,
        placeOfBirth: place.label,
        service: "kundli",
        serviceLabel: config.name,
        sourceForm: `Landing: ${config.slug}`,
        tags: [
          "Kundli PDF: Checkout Started",
          `Tier: ${config.name}`,
          ...(withCall ? ["Consultation add-on: Checkout Started"] : []),
        ],
      }).catch(() => undefined);

      resp = await payWithRazorpay({
        service: "kundli-pdf",
        variant: config.variant,
        addons: withCall ? [CONSULTATION_ADDON.key] : [],
        slot: withCall ? slot : null,
        notes: { type: `Kundli PDF: ${config.name}`, name: form.name, email: form.email, phone },
        description: withCall ? `${config.name} + 15-min call` : `${config.name} — Kundli PDF`,
        prefill: { name: form.name, email: form.email, contact: phone },
        themeColor: config.theme.ink,
      });
    } catch (caught) {
      const err = caught as { code?: string; message?: string };
      setStatus("idle");
      if (caught instanceof CheckoutError && caught.code === "DISMISSED") return;
      if (err?.code === "SLOT_UNAVAILABLE" || err?.code === "SLOT_REQUIRED") {
        // Taken while they were filling the form — offer fresh times.
        setSlot(null);
        setSlotRefresh((k) => k + 1);
        setErrors((e) => ({ ...e, slot: err.message }));
        return;
      }
      toast.error(err?.message || "Something went wrong. Please try again.");
      return;
    }

    // Paid. The receipt, booking and report each confirm this payment with
    // Razorpay on the server, so none of them waits on another.
    void verifyPayment({ ...resp, customer }).catch(() => undefined);
    if (withCall) setPaidCall({ payment: resp, customer });

    void submitProspectIQLead({
      firstName: firstName || "Client",
      lastName: rest.join(" "),
      email: form.email,
      phone,
      dateOfBirth: dobApi,
      timeOfBirth: tob,
      placeOfBirth: place.label,
      service: "kundli",
      serviceLabel: config.name,
      amountPaid: formatINR(total),
      sourceForm: `Landing: ${config.slug}`,
      tags: ["Paid: Kundli PDF", `Tier: ${config.name}`, "Paid Customer"],
    }).catch(() => undefined);

    setStatus("delivering");
    setElapsed(0);

    try {
      const delivery = await deliverKundliPdf(
        {
          name: form.name,
          email: form.email,
          dob: dobApi,
          tob,
          lat: place.lat,
          lon: place.lon,
          tz: place.tz,
          pob: place.label,
          variant: config.variant,
          razorpay_order_id: resp.razorpay_order_id,
          razorpay_payment_id: resp.razorpay_payment_id,
          razorpay_signature: resp.razorpay_signature,
        },
        (ms) => setElapsed(Math.round(ms / 1000)),
      );

      const pdfs = delivery.downloadUrls?.length
        ? delivery.downloadUrls
        : [{
            name: delivery.tierName ?? config.name,
            url: delivery.downloadUrl,
            fileName: delivery.fileName,
          }];
      setDelivered(pdfs);
      setEmailed(Boolean(delivery.emailed));
      setStatus("done");
      // deliverKundliPdf already opens each PDF in a tab and saves a copy
      // to disk. Opening again here gave every customer two tabs per
      // report; the success card below is the deliberate re-open path.
      toast.success(`Your ${config.name} is ready`, {
        description: delivery.emailed
          ? "Downloaded and emailed to you. The links never expire."
          : "Downloaded to your device. Save it — the link never expires.",
        duration: 12000,
      });
    } catch (err) {
      setStatus("done");
      const detail =
        err instanceof KundliPdfError
          ? err.message
          : "Your payment went through. Please contact us and we'll send the report right away.";
      toast.error("Couldn't prepare your report", {
        description: detail,
        duration: 20000,
      });
    }
  };

  /* ------------------------------------------------------------- render */

  const gold = config.theme.gold;
  const busy = status === "starting" || status === "delivering";

  // Hero and closing forms render on the same page, so the id includes idPrefix.
  const formId = `jn-${config.slug}-${idPrefix}`;
  const trackingLead: LeadData = {
    ...splitName(form.name),
    email: form.email.trim(),
    phone: form.phone ? toE164(form.phone, countryIso) : "",
    dateOfBirth: form.dob,
    timeOfBirth: form.hour && form.minute ? `${form.hour}:${form.minute}` : "",
    placeOfBirth: picked?.label || form.pob,
    service: "kundli",
    serviceLabel: config.name,
  };

  // Kept in one position whichever view shows, so the booking runs once and
  // its result survives the switch to the "report ready" card.
  const callPanel = paidCall && addon && (
    <div className="mt-3">
      <BookingStatus
        payment={paidCall.payment}
        customer={paidCall.customer}
        calendarId={addon.calendarId}
        minutes={addon.minutes}
        theme={config.theme}
      />
    </div>
  );

  const view = status === "done" && delivered.length ? (
    <div className="rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-8 shadow-2xl text-center">
      <div
        className="mx-auto grid h-14 w-14 place-items-center rounded-full"
        style={{ background: `${gold}33` }}
      >
        <Check className="h-7 w-7" style={{ color: config.theme.ink }} strokeWidth={3} />
      </div>
      <h3 className="mt-4 font-serif text-xl sm:text-2xl font-bold" style={{ color: config.theme.ink }}>
        Your report is ready
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {emailed ? (
          <>
            It's on its way to <b className="break-all">{form.email}</b> and usually arrives within a few
            minutes. The download links below never expire.
          </>
        ) : (
          <>
            We couldn't email it this time, so please save the download links below — they never
            expire. Message us on WhatsApp and we'll send it over.
          </>
        )}
      </p>
      <div className="mt-5 space-y-2.5">
        {delivered.map((p) => (
          <Button
            key={p.url}
            onClick={() => openInNewTab(p.url)}
            className="h-auto w-full justify-between gap-3 rounded-xl px-4 py-3.5 text-left text-white"
            style={{ background: `linear-gradient(180deg, ${config.theme.cta}, ${config.theme.ctaDark})` }}
          >
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
            <FileDown className="h-4 w-4 shrink-0" />
          </Button>
        ))}
      </div>
    </div>
  ) : (
    // deliberately no overflow-hidden here: it would clip the place-of-birth
    // suggestion list, which hangs below the input.
    <form
      id={formId}
      name={formId}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (step === 1) goStep2();
        else void handleBuy();
      }}
      className="rounded-xl bg-white shadow-2xl sm:rounded-2xl"
    >
      <TrackingFields formId={formId} lead={trackingLead} />
      <div className="h-1.5 w-full rounded-t-xl sm:rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${config.theme.cta}, ${config.theme.ctaDark})` }} />
      <div className="p-5 sm:p-6">
        {/* header */}
        <h3 className="font-serif text-lg font-bold leading-tight sm:text-xl" style={{ color: config.theme.ink }}>
          {config.formTitle}
        </h3>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{config.formSub}</p>

        {/* price row */}
        <div
          className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-y py-3"
          style={{ borderColor: "#EFE6D8" }}
        >
          <span className="font-serif text-3xl font-extrabold leading-none" style={{ color: config.theme.ink }}>
            {formatINR(config.price)}
          </span>
          <span className="text-[13px] text-muted-foreground line-through">
            {formatINR(config.compareAt)}
          </span>
          <span className="ml-auto text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: `${config.theme.ink}aa` }}>
            {config.pages}
          </span>
        </div>

        {/* step rail */}
        <div className="mt-4 flex items-center gap-2" aria-hidden>
        {[1, 2].map((n) => (
          <div
            key={n}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ background: step >= n ? config.theme.ink : "#E7E1D8" }}
          />
        ))}
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Step {step} of 2 · {step === 1 ? "Birth details" : "Where to send it"}
      </p>

      <div className="mt-4 space-y-3.5">
        {step === 1 ? (
          /* two columns from sm up — keeps the card inside one screen */
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field className="sm:col-span-2" label="Full name" htmlFor={`${idPrefix}-name`} error={errors.name}>
              <Input
                id={`${idPrefix}-name`}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="As it appears on your records"
                autoComplete="name"
                className="h-12 rounded-xl text-base"
              />
            </Field>

            <Field label="Date of birth" error={errors.dob}>
              <DateInputField
                date={dobDate}
                onDateChange={(d, iso) => {
                  setDobDate(d);
                  set("dob", iso);
                }}
                calendarMonth={calendarMonth}
                onMonthChange={setCalendarMonth}
                className="h-12 text-base sm:text-base"
              />
            </Field>

            <Field label="Time of birth" error={errors.tob}>
              <TimeInputField
                time={{ hour: form.hour, minute: form.minute }}
                onTimeChange={(t) => {
                  // Picking an hour first shouldn't leave the minutes blank.
                  const minute = t.hour && !t.minute ? "00" : t.minute;
                  setForm((f) => ({ ...f, hour: t.hour, minute }));
                  setErrors((e) => (e.tob ? { ...e, tob: "" } : e));
                }}
                placeholder="HH:MM"
                className="h-12 text-base sm:text-base"
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                24-hour, e.g. 14:30. The closest time you know is fine.
              </p>
            </Field>

            <Field className="sm:col-span-2" label="Place of birth" htmlFor={`${idPrefix}-pob`} error={errors.pob}>
              <div className="relative" ref={placeBoxRef}>
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={`${idPrefix}-pob`}
                  value={form.pob}
                  onChange={(e) => {
                    set("pob", e.target.value);
                    setPlaceQuery(e.target.value);
                    setPicked(null);
                  }}
                  onFocus={() => places.length && setOpenList(true)}
                  placeholder="Start typing your city…"
                  autoComplete="off"
                  className="h-12 rounded-xl pl-9 text-base"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
                {openList && places.length > 0 && (
                  <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-white py-1 shadow-xl">
                    {places.map((p, i) => (
                      <li key={`${p.label}-${i}`}>
                        <button
                          type="button"
                          onClick={() => {
                            setPicked(p);
                            set("pob", p.label);
                            setPlaceQuery(p.label);
                            setOpenList(false);
                          }}
                          className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted"
                        >
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="min-w-0">{p.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Field>

            <Button
              type="button"
              onClick={goStep2}
              className="h-auto w-full rounded-xl py-4 text-base font-extrabold text-white shadow-lg sm:col-span-2"
              style={{ background: `linear-gradient(180deg, ${config.theme.cta}, ${config.theme.ctaDark})` }}
            >
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Email address" htmlFor={`${idPrefix}-email`} error={errors.email}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={`${idPrefix}-email`}
                  type="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-12 rounded-xl pl-9 text-base"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Your {config.pdfCount > 1 ? "reports are" : "report is"} emailed here, with download links that never expire.
              </p>
            </Field>

            <Field label="Mobile number" htmlFor={`${idPrefix}-phone`} error={errors.phone}>
              <PhoneInput
                id={`${idPrefix}-phone`}
                value={form.phone}
                onChange={(v) => set("phone", v)}
                countryIso={countryIso}
                onCountryChange={setCountryIso}
                error={errors.phone}
              />
            </Field>
            </div>

            {!paidCall && (
              <ConsultationAddon
                idPrefix={idPrefix}
                service="kundli-pdf"
                variant={config.variant}
                checked={withCall}
                onCheckedChange={(v) => {
                  setWithCall(v);
                  setErrors((e) => (e.slot ? { ...e, slot: "" } : e));
                }}
                slot={slot}
                onSlotChange={(v) => {
                  setSlot(v);
                  if (v) setErrors((e) => (e.slot ? { ...e, slot: "" } : e));
                }}
                theme={config.theme}
                refreshKey={slotRefresh}
                error={errors.slot || undefined}
              />
            )}

            <div className="rounded-xl px-4 py-3" style={{ background: `${gold}1f` }}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold" style={{ color: config.theme.ink }}>{config.name}</span>
                <span className="font-serif text-lg font-extrabold" style={{ color: config.theme.ink }}>
                  {formatINR(config.price)}
                </span>
              </div>
              {withCall && addon && (
                <div className="mt-1 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold" style={{ color: config.theme.ink }}>15-min call with Dr. Sandeep</span>
                  <span className="font-serif text-lg font-extrabold" style={{ color: config.theme.ink }}>
                    {formatINR(addon.rupees)}
                  </span>
                </div>
              )}
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {config.pages} · one-time payment · no subscription
              </p>
            </div>

            <Button
              type="button"
              onClick={submitWhenValid(validateStep2)}
              disabled={busy}
              className="h-auto w-full rounded-xl py-4 text-base font-extrabold text-white shadow-lg disabled:opacity-80"
              style={{ background: `linear-gradient(180deg, ${config.theme.cta}, ${config.theme.ctaDark})` }}
            >
              {status === "starting" ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening secure checkout…</>
              ) : status === "delivering" ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building your report… {elapsed}s</>
              ) : (
                <><Lock className="mr-2 h-4 w-4" /> {config.slug === "premium-kundli" || config.slug === "complete-kundli" ? config.cta : `${config.cta} · ${formatINR(total)}`}</>
              )}
            </Button>

            {status === "delivering" && (
              <p className="text-center text-[12px] text-muted-foreground">
                Payment received. Please keep this page open — this takes up to two minutes.
              </p>
            )}

            {!busy && !paidCall && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mx-auto flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to birth details
              </button>
            )}
          </>
        )}
      </div>

      <ul className="mt-5 grid gap-2 border-t border-border pt-4 text-[12px] text-muted-foreground sm:grid-cols-2">
        <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: config.theme.ink }} /> Secured by Razorpay</li>
        <li className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: config.theme.ink }} /> Delivered in minutes</li>
        <li className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 shrink-0" style={{ color: config.theme.ink }} /> Emailed to you</li>
        <li className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 shrink-0" style={{ color: config.theme.ink }} /> Details never shared</li>
        </ul>
      </div>
    </form>
  );

  return (
    <div>
      {view}
      {callPanel}
    </div>
  );
}

/* ------------------------------------------------------------ field shell */

export function Field({
  label, htmlFor, error, children, className,
}: {
  label: string; htmlFor?: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-foreground">
        {label}
      </Label>
      {children}
      {error && <p className={cn("mt-1 text-[12px] font-medium text-destructive")}>{error}</p>}
    </div>
  );
}
