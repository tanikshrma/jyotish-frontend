import { Check, Loader2, Sparkles, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  KUNDLI_PDF_TIERS,
  getPriceInRupees,
  formatINR,
  type KundliPdfTier,
} from "../../shared/pricing";

/**
 * The five selectable Kundli PDF report tiers, each with its price and what it
 * includes. Presentational only — the parent owns the Razorpay purchase.
 */
export function KundliPdfOptions({
  onBuy,
  busyVariant,
  disabled,
}: {
  onBuy: (tier: KundliPdfTier) => void;
  /** The tier whose purchase is currently in-flight (shows a spinner). */
  busyVariant?: string | null;
  disabled?: boolean;
}) {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary">
          <FileText className="w-4 h-4" /> Choose your report
        </div>
        <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-primary">
          Five ways to keep your Kundli
        </h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xl mx-auto">
          Each report is generated from your real birth chart, delivered instantly,
          and emailed to you — the download links never expire.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {KUNDLI_PDF_TIERS.map((tier) => {
          const price = getPriceInRupees("kundli-pdf", tier.variant) ?? 0;
          const isBusy = busyVariant === tier.variant;
          const featured = !!tier.badge;
          return (
            <div
              key={tier.variant}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-[#FFFDF9] p-5 transition-all",
                featured
                  ? "border-primary/60 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                  : "border-secondary/30 hover:border-secondary/60 hover:shadow-md",
              )}
            >
              {tier.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-[#a31414] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                  {tier.badge}
                </span>
              )}

              <h4 className="font-serif text-lg font-bold text-primary">{tier.name}</h4>
              <p className="mt-0.5 text-xs text-muted-foreground min-h-[2.5rem]">
                {tier.tagline}
              </p>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-foreground">
                  {formatINR(price)}
                </span>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
                {tier.pages}
              </span>

              <ul className="mt-4 space-y-2 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-foreground/80">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => onBuy(tier)}
                disabled={disabled || isBusy}
                className={cn(
                  "mt-5 h-11 w-full rounded-xl font-bold",
                  featured
                    ? "bg-gradient-to-r from-primary to-[#5a0606] text-white hover:opacity-90 shadow-lg"
                    : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20",
                )}
              >
                {isBusy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-4 w-4" /> Buy {formatINR(price)}
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        🔒 Secure payment via Razorpay · Instant download &amp; email delivery
      </p>
    </div>
  );
}
