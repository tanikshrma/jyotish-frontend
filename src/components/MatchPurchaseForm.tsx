import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, FileDown, Loader2, Lock, Mail, MapPin, ShieldCheck, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/PhoneInput";
import { DateInputField, TimeInputField } from "@/components/FormDateInput";
import { vedicAstroApi } from "@/lib/vedicAstroApi";
import { verifyPayment, type RazorpaySuccess } from "@/lib/razorpay";
import { CheckoutError, payWithRazorpay } from "@/lib/consultation";
import {
  deliverMatchmakingPdf, KundliPdfError, openInNewTab, type DeliveredPdf,
} from "@/lib/kundliPdf";
import { submitProspectIQLead, splitName } from "@/lib/prospectiq";
import { DEFAULT_COUNTRY_ISO, toE164, validateEmail, validatePhone } from "@/lib/validation";
import { submitWhenValid } from "@/lib/tracking";
import { ConsultationAddon, addonDetails } from "@/components/consultation/ConsultationAddon";
import { BookingStatus } from "@/components/consultation/BookingStatus";
import type { PickerTheme } from "@/components/consultation/SlotPicker";
import { Field, toApiDob, type GeoPick, type PaidCall } from "@/components/ReportPurchaseForm";
import { formatINR, getPriceInRupees } from "../../shared/pricing";
import { CONSULTATION_ADDON } from "../../shared/consultation";

const SERVICE = "matchmaking-pdf";
const REPORT_NAME = "Kundli Matching Report";

type Person = { name: string; dob: string; hour: string; minute: string; pob: string; place: GeoPick | null };
const emptyPerson = (): Person => ({ name: "", dob: "", hour: "", minute: "", pob: "", place: null });

type Theme = PickerTheme & { gold: string };

/**
 * Two birth charts → Razorpay → Ashtakoot matching PDF, with the optional
 * ₹999 call with Dr. Sandeep booked into his matchmaking calendar.
 *
 * Three short steps rather than one long form: each partner's details, then
 * where to send it. The lead is captured before checkout, like the kundli form.
 */
export function MatchPurchaseForm({
  theme,
  source,
  idPrefix = "match",
  title = "Get your Kundli Matching report",
  sub = "Enter both partners' birth details. The 36-guna match is computed from them.",
  compareAt = 999,
}: {
  theme: Theme;
  source: string;
  idPrefix?: string;
  title?: string;
  sub?: string;
  compareAt?: number;
}) {
  const price = getPriceInRupees(SERVICE) ?? 0;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [boy, setBoy] = useState<Person>(emptyPerson);
  const [girl, setGirl] = useState<Person>(emptyPerson);
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY_ISO);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [withCall, setWithCall] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);
  const [slotRefresh, setSlotRefresh] = useState(0);
  const [paidCall, setPaidCall] = useState<PaidCall | null>(null);
  const addon = addonDetails(SERVICE);
  const total = price + (withCall && addon ? addon.rupees : 0);

  const [status, setStatus] = useState<"idle" | "starting" | "delivering" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [delivered, setDelivered] = useState<DeliveredPdf[]>([]);
  const [emailed, setEmailed] = useState(false);

  useEffect(() => {
    if (status !== "delivering") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const clearError = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: "" } : e));

  const validatePerson = (p: Person, key: string) => {
    const e: Record<string, string> = {};
    if (!p.name.trim()) e[`${key}.name`] = "Please enter the name";
    if (!p.dob) e[`${key}.dob`] = "Please choose the date of birth";
    if (!p.hour || !p.minute) e[`${key}.tob`] = "Please set the time of birth";
    if (!p.pob.trim()) e[`${key}.pob`] = "Please choose the place of birth";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateContact = () => {
    const e: Record<string, string> = {};
    const emailErr = validateEmail(contact.email);
    if (emailErr) e.email = emailErr;
    const phoneErr = validatePhone(contact.phone, countryIso);
    if (phoneErr) e.phone = phoneErr;
    if (withCall && !slot) e.slot = "Please pick a time for your call";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resolvePlace = async (p: Person): Promise<GeoPick> => {
    if (p.place) return p.place;
    const res = await vedicAstroApi.geoSearch(p.pob);
    const first = res?.response?.[0];
    if (!first) throw new Error(`We couldn't find "${p.pob}". Please pick the birth place from the suggestions.`);
    return {
      label: first.full_name || [first.name, first.state || first.region, first.country].filter(Boolean).join(", "),
      lat: Number(first.lat ?? first.latitude),
      lon: Number(first.lon ?? first.longitude),
      tz: Number(first.tz ?? 5.5),
    };
  };

  const handleBuy = async () => {
    if (status !== "idle" || !validateContact()) return;
    setStatus("starting");
    const phone = toE164(contact.phone, countryIso);
    const customer = { name: boy.name.trim(), email: contact.email.trim(), phone };
    const couple = `${boy.name.trim()} & ${girl.name.trim()}`;

    let boyPlace: GeoPick;
    let girlPlace: GeoPick;
    let resp: RazorpaySuccess;
    try {
      [boyPlace, girlPlace] = await Promise.all([resolvePlace(boy), resolvePlace(girl)]);

      void submitProspectIQLead({
        ...splitName(boy.name),
        email: customer.email,
        phone,
        dateOfBirth: toApiDob(boy.dob),
        timeOfBirth: `${boy.hour}:${boy.minute}`,
        placeOfBirth: boyPlace.label,
        partnerDateOfBirth: toApiDob(girl.dob),
        partnerTimeOfBirth: `${girl.hour}:${girl.minute}`,
        partnerPlaceOfBirth: girlPlace.label,
        service: "matchmaking",
        serviceLabel: REPORT_NAME,
        sourceForm: `Landing: ${source}`,
        tags: ["Matching PDF: Checkout Started", ...(withCall ? ["Consultation add-on: Checkout Started"] : [])],
      }).catch(() => undefined);

      resp = await payWithRazorpay({
        service: SERVICE,
        addons: withCall ? [CONSULTATION_ADDON.key] : [],
        slot: withCall ? slot : null,
        notes: { type: REPORT_NAME, couple, email: customer.email, phone },
        description: withCall ? `${REPORT_NAME} + 15-min call` : REPORT_NAME,
        prefill: { name: customer.name, email: customer.email, contact: phone },
        themeColor: theme.ink,
      });
    } catch (caught) {
      const err = caught as { code?: string; message?: string };
      setStatus("idle");
      if (caught instanceof CheckoutError && caught.code === "DISMISSED") return;
      if (err?.code === "SLOT_UNAVAILABLE" || err?.code === "SLOT_REQUIRED") {
        setSlot(null);
        setSlotRefresh((k) => k + 1);
        setErrors((e) => ({ ...e, slot: err.message }));
        return;
      }
      toast.error(err?.message || "Something went wrong. Please try again.");
      return;
    }

    void verifyPayment({ ...resp, customer }).catch(() => undefined);
    if (withCall) setPaidCall({ payment: resp, customer });

    setStatus("delivering");
    setElapsed(0);
    try {
      const delivery = await deliverMatchmakingPdf(
        {
          email: customer.email,
          boy_name: boy.name.trim(),
          boy_dob: toApiDob(boy.dob),
          boy_tob: `${boy.hour}:${boy.minute}`,
          boy_lat: boyPlace.lat,
          boy_lon: boyPlace.lon,
          boy_tz: boyPlace.tz,
          boy_pob: boyPlace.label,
          girl_name: girl.name.trim(),
          girl_dob: toApiDob(girl.dob),
          girl_tob: `${girl.hour}:${girl.minute}`,
          girl_lat: girlPlace.lat,
          girl_lon: girlPlace.lon,
          girl_tz: girlPlace.tz,
          girl_pob: girlPlace.label,
          razorpay_order_id: resp.razorpay_order_id,
          razorpay_payment_id: resp.razorpay_payment_id,
          razorpay_signature: resp.razorpay_signature,
        },
        (ms) => setElapsed(Math.round(ms / 1000)),
      );
      setDelivered(delivery.downloadUrls);
      setEmailed(Boolean(delivery.emailed));
      setStatus("done");
      toast.success("Your matching report is ready", {
        description: delivery.emailed
          ? "Downloaded and emailed to you. The link never expires."
          : "Downloaded to your device. Save it — the link never expires.",
        duration: 12000,
      });
    } catch (err) {
      setStatus("done");
      toast.error("Couldn't prepare your report", {
        description:
          err instanceof KundliPdfError
            ? err.message
            : "Your payment went through. Please contact us and we'll send the report right away.",
        duration: 20000,
      });
    }
  };

  const busy = status === "starting" || status === "delivering";
  const cta = `linear-gradient(180deg, ${theme.cta}, ${theme.ctaDark})`;

  const callPanel = paidCall && addon && (
    <div className="mt-3">
      <BookingStatus
        payment={paidCall.payment}
        customer={paidCall.customer}
        calendarId={addon.calendarId}
        minutes={addon.minutes}
        theme={theme}
      />
    </div>
  );

  const view = status === "done" && delivered.length ? (
    <div className="rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-8">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: `${theme.gold}33` }}>
        <Check className="h-7 w-7" style={{ color: theme.ink }} strokeWidth={3} />
      </div>
      <h3 className="mt-4 font-serif text-xl font-bold sm:text-2xl" style={{ color: theme.ink }}>
        Your matching report is ready
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {emailed ? (
          <>It's on its way to <b className="break-all">{contact.email}</b>. The download link below never expires.</>
        ) : (
          <>Please save the download link below — it never expires. Message us on WhatsApp and we'll email it too.</>
        )}
      </p>
      <div className="mt-5 space-y-2.5">
        {delivered.map((p) => (
          <Button
            key={p.url}
            onClick={() => openInNewTab(p.url)}
            className="h-auto w-full justify-between gap-3 rounded-xl px-4 py-3.5 text-left text-white"
            style={{ background: cta }}
          >
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
            <FileDown className="h-4 w-4 shrink-0" />
          </Button>
        ))}
      </div>
    </div>
  ) : (
    <form
      id={`jn-${source}-${idPrefix}`}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (step === 1) {
          if (validatePerson(boy, "boy")) setStep(2);
        } else if (step === 2) {
          if (validatePerson(girl, "girl")) setStep(3);
        } else {
          void handleBuy();
        }
      }}
      className="rounded-xl bg-white shadow-2xl sm:rounded-2xl"
    >
      <div className="h-1.5 w-full rounded-t-xl sm:rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${theme.cta}, ${theme.ctaDark})` }} />
      <div className="p-5 sm:p-6">
        <h3 className="font-serif text-lg font-bold leading-tight sm:text-xl" style={{ color: theme.ink }}>{title}</h3>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{sub}</p>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-y py-3" style={{ borderColor: "#EFE6D8" }}>
          <span className="font-serif text-3xl font-extrabold leading-none" style={{ color: theme.ink }}>{formatINR(price)}</span>
          <span className="text-[13px] text-muted-foreground line-through">{formatINR(compareAt)}</span>
          <span className="ml-auto text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: `${theme.ink}aa` }}>
            ~23 pages · 36 gunas
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2" aria-hidden>
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-1 flex-1 rounded-full transition-colors duration-300" style={{ background: step >= n ? theme.ink : "#E7E1D8" }} />
          ))}
        </div>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Step {step} of 3 · {step === 1 ? "Boy's birth details" : step === 2 ? "Girl's birth details" : "Where to send it"}
        </p>

        <div className="mt-4 space-y-3.5">
          {step === 1 && (
            <PersonFields key="boy" idPrefix={`${idPrefix}-boy`} errKey="boy" person={boy} onChange={setBoy} errors={errors} clearError={clearError} whose="Boy's" />
          )}
          {step === 2 && (
            <PersonFields key="girl" idPrefix={`${idPrefix}-girl`} errKey="girl" person={girl} onChange={setGirl} errors={errors} clearError={clearError} whose="Girl's" />
          )}
          {step === 3 && (
            <>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="Email address" htmlFor={`${idPrefix}-email`} error={errors.email}>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={`${idPrefix}-email`}
                      type="email"
                      inputMode="email"
                      value={contact.email}
                      onChange={(e) => { setContact((c) => ({ ...c, email: e.target.value })); clearError("email"); }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-12 rounded-xl pl-9 text-base"
                    />
                  </div>
                </Field>
                <Field label="Mobile number" htmlFor={`${idPrefix}-phone`} error={errors.phone}>
                  <PhoneInput
                    id={`${idPrefix}-phone`}
                    value={contact.phone}
                    onChange={(v) => { setContact((c) => ({ ...c, phone: v })); clearError("phone"); }}
                    countryIso={countryIso}
                    onCountryChange={setCountryIso}
                    error={errors.phone}
                  />
                </Field>
              </div>

              {!paidCall && (
                <ConsultationAddon
                  idPrefix={idPrefix}
                  service={SERVICE}
                  checked={withCall}
                  onCheckedChange={(v) => { setWithCall(v); clearError("slot"); }}
                  slot={slot}
                  onSlotChange={(v) => { setSlot(v); if (v) clearError("slot"); }}
                  theme={theme}
                  refreshKey={slotRefresh}
                  error={errors.slot || undefined}
                />
              )}

              <div className="rounded-xl px-4 py-3" style={{ background: `${theme.gold}1f` }}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold" style={{ color: theme.ink }}>{REPORT_NAME}</span>
                  <span className="font-serif text-lg font-extrabold" style={{ color: theme.ink }}>{formatINR(price)}</span>
                </div>
                {withCall && addon && (
                  <div className="mt-1 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold" style={{ color: theme.ink }}>15-min call with Dr. Sandeep</span>
                    <span className="font-serif text-lg font-extrabold" style={{ color: theme.ink }}>{formatINR(addon.rupees)}</span>
                  </div>
                )}
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {boy.name || "Boy"} & {girl.name || "Girl"} · one-time payment
                </p>
              </div>

              <Button
                type="button"
                onClick={submitWhenValid(validateContact)}
                disabled={busy}
                className="h-auto w-full rounded-xl py-4 text-base font-extrabold text-white shadow-lg disabled:opacity-80"
                style={{ background: cta }}
              >
                {status === "starting" ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening secure checkout…</>
                ) : status === "delivering" ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building your report… {elapsed}s</>
                ) : (
                  <><Lock className="mr-2 h-4 w-4" /> Get the match report · {formatINR(total)}</>
                )}
              </Button>
              {status === "delivering" && (
                <p className="text-center text-[12px] text-muted-foreground">
                  Payment received. Please keep this page open — this takes up to two minutes.
                </p>
              )}
            </>
          )}

          {step < 3 ? (
            <Button
              type="submit"
              className="h-auto w-full rounded-xl py-4 text-base font-extrabold text-white shadow-lg"
              style={{ background: cta }}
            >
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : null}

          {step > 1 && !busy && !paidCall && (
            <button
              type="button"
              onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
              className="mx-auto flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}
        </div>

        <ul className="mt-5 grid gap-2 border-t border-border pt-4 text-[12px] text-muted-foreground sm:grid-cols-2">
          <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: theme.ink }} /> Secured by Razorpay</li>
          <li className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: theme.ink }} /> Delivered in minutes</li>
          <li className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 shrink-0" style={{ color: theme.ink }} /> Emailed to you</li>
          <li className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 shrink-0" style={{ color: theme.ink }} /> Details never shared</li>
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

/* --------------------------------------------------- one person's chart */

function PersonFields({
  idPrefix, errKey, person, onChange, errors, clearError, whose,
}: {
  idPrefix: string;
  errKey: string;
  person: Person;
  onChange: (p: Person) => void;
  errors: Record<string, string>;
  clearError: (k: string) => void;
  whose: string;
}) {
  const [dobDate, setDobDate] = useState<Date | undefined>(person.dob ? new Date(person.dob) : undefined);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(1995, 0, 1));
  const [places, setPlaces] = useState<GeoPick[]>([]);
  const [searching, setSearching] = useState(false);
  const [openList, setOpenList] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<Person>, field: string) => {
    onChange({ ...person, ...patch });
    clearError(`${errKey}.${field}`);
  };

  useEffect(() => {
    const q = person.pob.trim();
    if (q.length < 3 || person.place?.label === person.pob) {
      setPlaces([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await vedicAstroApi.geoSearch(q);
        const list: GeoPick[] = (res?.response ?? []).map((r: any) => ({
          label: r.full_name || [r.name, r.state || r.region, r.country].filter(Boolean).join(", "),
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
  }, [person.pob, person.place]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpenList(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="grid gap-3.5 sm:grid-cols-2">
      <Field className="sm:col-span-2" label={`${whose} full name`} htmlFor={`${idPrefix}-name`} error={errors[`${errKey}.name`]}>
        <Input
          id={`${idPrefix}-name`}
          value={person.name}
          onChange={(e) => update({ name: e.target.value }, "name")}
          autoComplete="off"
          className="h-12 rounded-xl text-base"
        />
      </Field>
      <Field label="Date of birth" error={errors[`${errKey}.dob`]}>
        <DateInputField
          date={dobDate}
          onDateChange={(d, iso) => {
            setDobDate(d);
            update({ dob: iso }, "dob");
          }}
          calendarMonth={calendarMonth}
          onMonthChange={setCalendarMonth}
          className="h-12 text-base sm:text-base"
        />
      </Field>
      <Field label="Time of birth" error={errors[`${errKey}.tob`]}>
        <TimeInputField
          time={{ hour: person.hour, minute: person.minute }}
          onTimeChange={(t) => update({ hour: t.hour, minute: t.hour && !t.minute ? "00" : t.minute }, "tob")}
          placeholder="HH:MM"
          className="h-12 text-base sm:text-base"
        />
      </Field>
      <Field className="sm:col-span-2" label="Place of birth" htmlFor={`${idPrefix}-pob`} error={errors[`${errKey}.pob`]}>
        <div className="relative" ref={boxRef}>
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={`${idPrefix}-pob`}
            value={person.pob}
            onChange={(e) => update({ pob: e.target.value, place: null }, "pob")}
            onFocus={() => places.length && setOpenList(true)}
            placeholder="Start typing the city…"
            autoComplete="off"
            className="h-12 rounded-xl pl-9 text-base"
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
          {openList && places.length > 0 && (
            <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-white py-1 shadow-xl">
              {places.map((p, i) => (
                <li key={`${p.label}-${i}`}>
                  <button
                    type="button"
                    onClick={() => {
                      update({ pob: p.label, place: p }, "pob");
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
    </div>
  );
}
