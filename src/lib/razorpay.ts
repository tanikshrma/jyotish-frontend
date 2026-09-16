/**
 * Razorpay Standard Checkout client helpers.
 *
 * Only the publishable key id ever reaches this file. The secret stays in the
 * serverless functions under /api.
 */

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export type CreateOrderResponse = {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
};

export type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayFailure = {
  error: {
    code?: string;
    description?: string;
    reason?: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (res: RazorpayFailure) => void) => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpaySuccess) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

/** Loads checkout.js once and reuses the same promise on later calls. */
export const loadRazorpayScript = (): Promise<void> => {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CHECKOUT_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Razorpay Checkout")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Razorpay Checkout"));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
};

const parseError = async (response: Response, fallback: string) => {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallback;
  } catch {
    return fallback;
  }
};

/**
 * Creates an order server-side. The price is looked up on the server from
 * shared/pricing.ts — deliberately no `amount` here, so the browser cannot
 * influence what is charged.
 */
export const createOrder = async (input: {
  service: string;
  variant?: string;
  /** Add-on keys, e.g. ["consultation-15"]. */
  addons?: string[];
  /** The consultation slot, when the order includes a call. */
  slot?: string;
  receipt?: string;
  notes?: Record<string, string>;
}): Promise<CreateOrderResponse> => {
  const response = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let message = "Could not start payment";
    let code: string | undefined;
    try {
      const data = (await response.json()) as { error?: string; code?: string };
      message = data.error || message;
      code = data.code;
    } catch {
      /* non-JSON error body */
    }
    throw Object.assign(new Error(message), { code });
  }

  return (await response.json()) as CreateOrderResponse;
};

/**
 * Verifies the signature server-side. Never treat a payment as successful
 * until this resolves — the browser result alone is not trustworthy.
 */
export const verifyPayment = async (
  payload: RazorpaySuccess & {
    customer?: { name?: string; email?: string; phone?: string };
    service?: string;
    amount?: number | string;
  },
): Promise<{
  verified: true;
  order_id: string;
  payment_id: string;
  whatsappAdminUrl?: string;
  whatsappCustomerUrl?: string;
}> => {
  const response = await fetch("/api/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Payment verification failed"));
  }

  return (await response.json()) as {
    verified: true;
    order_id: string;
    payment_id: string;
    whatsappAdminUrl?: string;
    whatsappCustomerUrl?: string;
  };
};

export type { RazorpayOptions };
