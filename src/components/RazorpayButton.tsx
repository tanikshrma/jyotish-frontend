import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createOrder,
  loadRazorpayScript,
  verifyPayment,
  type RazorpayFailure,
  type RazorpaySuccess,
} from "@/lib/razorpay";
import {
  DEFAULT_VARIANT,
  formatINR,
  getPriceInRupees,
  type ServiceId,
} from "../../shared/pricing";

interface RazorpayButtonProps {
  /** Service id from shared/pricing.ts. The server prices it — not the browser. */
  service: ServiceId;
  /** Variant key, e.g. "1 Hour|Video". Defaults to "default". */
  variant?: string;
  /** Shown inside the Razorpay modal. */
  description?: string;
  /** Pre-fills the Checkout contact fields. */
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  className?: string;
  children?: React.ReactNode;
  onSuccess?: (result: { order_id: string; payment_id: string }) => void;
}

export function RazorpayButton({
  service,
  variant = DEFAULT_VARIANT,
  description,
  prefill,
  notes,
  className,
  children,
  onSuccess,
}: RazorpayButtonProps) {
  // Display price only. The charged amount comes back from the server.
  const displayPrice = getPriceInRupees(service, variant);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    setIsProcessing(true);

    try {
      await loadRazorpayScript();

      const order = await createOrder({ service, variant, notes });

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout is unavailable");
      }

      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "JyotishNow",
        description: description ?? "Astrology Consultation",
        order_id: order.order_id,
        prefill,
        notes,
        theme: { color: "#7A0808" },
        handler: async (response: RazorpaySuccess) => {
          try {
            const result = await verifyPayment({
              ...response,
              customer: {
                name: prefill?.name || "Valued Client",
                email: prefill?.email || "",
                phone: prefill?.contact || "",
              },
              service: description || service,
            });
            const waUrl = result.whatsappCustomerUrl || result.whatsappAdminUrl;
            if (waUrl) {
              try {
                window.open(waUrl, "_blank");
              } catch (e) {
                console.warn("Popup blocked:", e);
              }
            }
            toast.success("Payment Successful!", {
              description: `Payment ID: ${result.payment_id}. Click below if WhatsApp did not open automatically.`,
              action: waUrl ? {
                label: "WhatsApp Receipt",
                onClick: () => window.open(waUrl, "_blank"),
              } : undefined,
            });
            onSuccess?.({
              order_id: result.order_id,
              payment_id: result.payment_id,
            });
          } catch (error) {
            // Money may have been captured but the signature did not verify.
            // Never treat this as paid.
            toast.error("Payment could not be verified", {
              description:
                error instanceof Error
                  ? error.message
                  : "Please contact us with your payment ID.",
            });
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info("Payment cancelled");
          },
        },
      });

      checkout.on("payment.failed", (response: RazorpayFailure) => {
        setIsProcessing(false);
        toast.error("Payment Failed", {
          description:
            response.error?.description ?? "Please try a different method.",
        });
      });

      checkout.open();
    } catch (error) {
      setIsProcessing(false);
      toast.error("Could not start payment", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isProcessing}
      className={cn("h-14 px-8 rounded-xl text-base font-medium", className)}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        (children ??
        (displayPrice === null ? "Pay" : `Pay ${formatINR(displayPrice)}`))
      )}
    </Button>
  );
}
