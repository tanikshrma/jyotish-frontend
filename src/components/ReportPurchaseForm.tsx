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
import { cn } from "@/lib/utils";
import { vedicAstroApi } from "@/lib/vedicAstroApi";
import { createOrder, loadRazorpayScript, verifyPayment } from "@/lib/razorpay";
import {
  deliverKundliPdf, KundliPdfError, openInNewTab, type DeliveredPdf,
} from "@/lib/kundliPdf";
import { submitProspectIQLead } from "@/lib/prospectiq";
import {
  DEFAULT_COUNTRY_ISO, validateEmail, validatePhone, toE164,
} from "@/lib/validation";
import { formatINR } from "../../shared/pricing";
import type { ReportLandingConfig } from "@/pages/landing/reportLandingConfig";

/* ------------------------------------------------------------------ utils */

/** DD/MM/YYYY for the astro API, from the native date input's YYYY-MM-DD. */
const toApiDob = (isoDate: string): string => {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return y && m && d ? `${d}/${m}/${y}` : "";
};

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

type GeoPick = { label: string; lat: number; lon: number; tz: number };

type Status = "idle" | "starting" | "delivering" | "done";

/* ------------------------------------------------------------- component */

/**
 * Birth details → Razorpay → PDF, all on the landing page.
 *
 * Split into two steps so the first screen asks only for chart data (which
 * feels like part of the product) and the contact fields arrive once the
 * visitor is already committed. The lead is pushed to Prospect IQ at the end of
 * step one — before checkout — so abandoned carts are still captured; the
 * contact endpoint upserts, so the post-payment push updates the same record.
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
  const [elapsed, setElapsed] = useState(0);

  const [form, setForm] = useState({
    name: "", dob: "", hour: "", minute: "", pob: "", email: "", phone: "",
  });
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY_ISO);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const priceLabel = formatINR(config.price);
    const [firstName, ...rest] = form.name.trim().split(/\s+/);
    const tob = `${form.hour}:${form.minute}`;
    const dobApi = toApiDob(form.dob);

    try {
      const place = await resolvePlace();

      // Capture the lead before checkout so an abandoned payment is still a
      // contact. Fire-and-forget — a CRM hiccup must never block the sale.
      void submitProspectIQLead({
        firstName: firstName || "Client",
        lastName: rest.join(" "),
        email: form.email,
        phone: toE164(form.phone, countryIso),
        dateOfBirth: dobApi,
        timeOfBirth: tob,
        placeOfBirth: place.label,
        service: "kundli",
        serviceLabel: config.name,
        sourceForm: `Landing: ${config.slug}`,
        tags: ["Kundli PDF: Checkout Started", `Tier: ${config.name}`],
      }).catch(() => undefined);

      await loadRazorpayScript();
      const order = await createOrder({
        service: "kundli-pdf",
        variant: config.variant,
        notes: {
          type: `Kundli PDF: ${config.name}`,
          name: form.name,
          email: form.email,
          phone: form.phone,
        },
      });
      if (!window.Razorpay) throw new Error("Payment gateway unavailable");

      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "JyotishNow",
        description: `${config.name} — Kundli PDF`,
        order_id: order.order_id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: config.theme.ink },
        modal: { ondismiss: () => setStatus("idle") },
        handler: async (resp) => {
          try {
            await verifyPayment({
              ...resp,
              customer: { name: form.name, email: form.email, phone: form.phone },
              service: `Kundli PDF: ${config.name}`,
              amount: priceLabel,
            });

            void submitProspectIQLead({
              firstName: firstName || "Client",
              lastName: rest.join(" "),
              email: form.email,
              phone: toE164(form.phone, countryIso),
              dateOfBirth: dobApi,
              timeOfBirth: tob,
              placeOfBirth: place.label,
              service: "kundli",
              serviceLabel: config.name,
              amountPaid: priceLabel,
              sourceForm: `Landing: ${config.slug}`,
              tags: ["Paid: Kundli PDF", `Tier: ${config.name}`, "Paid Customer"],
            }).catch(() => undefined);

            setStatus("delivering");
            setElapsed(0);

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
            setStatus("done");
            pdfs.forEach((p, i) => setTimeout(() => openInNewTab(p.url), i * 300));
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
        },
      });

      checkout.on("payment.failed", () => {
        setStatus("idle");
        toast.error("Payment failed", { description: "No money was taken. Please try again." });
      });

      checkout.open();
    } catch (err: any) {
      setStatus("idle");
      toast.error(err?.message || "Something went wrong. Please try again.");
    }
  };

  /* ------------------------------------------------------------- render */

  const gold = config.theme.gold;
  const busy = status === "starting" || status === "delivering";

  if (status === "done" && delivered.length) {
    return (
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
          We've emailed it to <b className="break-all">{form.email}</b>. The download links never expire.
        </p>
        <div className="mt-5 space-y-2.5">
          {delivered.map((p) => (
            <Button
              key={p.url}
              onClick={() => openInNewTab(p.url)}
              className="h-auto w-full justify-between gap-3 rounded-xl px-4 py-3.5 text-left text-white"
              style={{ background: config.theme.ink }}
            >
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
              <FileDown className="h-4 w-4 shrink-0" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-2xl sm:rounded-2xl">
      <div className="h-1 w-full" style={{ background: gold }} />
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
          <>
            <Field label="Full name" htmlFor={`${idPrefix}-name`} error={errors.name}>
              <Input
                id={`${idPrefix}-name`}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="As it appears on your records"
                autoComplete="name"
                className="h-12 rounded-xl text-base"
              />
            </Field>

            <Field label="Date of birth" htmlFor={`${idPrefix}-dob`} error={errors.dob}>
              <Input
                id={`${idPrefix}-dob`}
                type="date"
                value={form.dob}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => set("dob", e.target.value)}
                className="h-12 w-full rounded-xl text-base"
              />
            </Field>

            <Field label="Time of birth" error={errors.tob}>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Hour of birth"
                  value={form.hour}
                  onChange={(e) => { set("hour", e.target.value); setErrors((x) => ({ ...x, tob: "" })); }}
                  className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-base"
                >
                  <option value="">HH</option>
                  {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-muted-foreground">:</span>
                <select
                  aria-label="Minute of birth"
                  value={form.minute}
                  onChange={(e) => { set("minute", e.target.value); setErrors((x) => ({ ...x, tob: "" })); }}
                  className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-base"
                >
                  <option value="">MM</option>
                  {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">24-hour</span>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Not sure? The closest time you know is enough.
              </p>
            </Field>

            <Field label="Place of birth" htmlFor={`${idPrefix}-pob`} error={errors.pob}>
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
              onClick={goStep2}
              className="h-auto w-full rounded-xl py-4 text-base font-bold text-white"
              style={{ background: config.theme.ink }}
            >
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
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
                Your {config.pdfCount > 1 ? "reports are" : "report is"} emailed here as {config.pdfCount > 1 ? "attachments" : "an attachment"}.
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

            <div className="rounded-xl px-4 py-3" style={{ background: `${gold}1f` }}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold" style={{ color: config.theme.ink }}>{config.name}</span>
                <span className="font-serif text-lg font-extrabold" style={{ color: config.theme.ink }}>
                  {formatINR(config.price)}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {config.pages} · one-time payment · no subscription
              </p>
            </div>

            <Button
              onClick={handleBuy}
              disabled={busy}
              className="h-auto w-full rounded-xl py-4 text-base font-bold text-white disabled:opacity-80"
              style={{ background: config.theme.ink }}
            >
              {status === "starting" ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening secure checkout…</>
              ) : status === "delivering" ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building your report… {elapsed}s</>
              ) : (
                <><Lock className="mr-2 h-4 w-4" /> {config.cta} · {formatINR(config.price)}</>
              )}
            </Button>

            {status === "delivering" && (
              <p className="text-center text-[12px] text-muted-foreground">
                Payment received. Please keep this page open — this takes up to two minutes.
              </p>
            )}

            {!busy && (
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
    </div>
  );
}

/* ------------------------------------------------------------ field shell */

function Field({
  label, htmlFor, error, children,
}: {
  label: string; htmlFor?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-foreground">
        {label}
      </Label>
      {children}
      {error && <p className={cn("mt-1 text-[12px] font-medium text-destructive")}>{error}</p>}
    </div>
  );
}
