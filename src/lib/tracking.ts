import type { MouseEvent } from "react";

/**
 * Submit only once the form is valid.
 *
 * The tracking script captures every `submit` event — including ones our own
 * validation then rejects — and these forms use `noValidate`, so a
 * type="submit" button turned each failed attempt into a partial CRM record
 * (often with no email), followed by a duplicate once the visitor fixed it.
 * The final button is therefore type="button": this fires the real submit
 * event, which the script captures, only when `validate()` passes.
 */
export const submitWhenValid =
  (validate: () => boolean) => (e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLButtonElement;
    const form = el.form ?? (el.closest("form") as HTMLFormElement | null);
    if (!form || !validate()) return;
    if (typeof form.requestSubmit === "function") form.requestSubmit();
    else form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  };

/**
 * Page views for Prospect IQ's External Tracking script on a single-page app.
 *
 * The script records one page view when it loads and never listens for route
 * changes, so on this React Router site every page after the first went
 * unrecorded. This reports each client-side navigation in the same shape the
 * script uses for its own initial view.
 *
 * It calls the tracker the script stores on `window._lcTracking` — not a
 * documented API — so every step is guarded: if the script is blocked, still
 * loading, or changes shape in a future version, this quietly does nothing
 * rather than breaking navigation.
 */
type LcTracker = { sendEvent?: (event: Record<string, unknown>) => unknown };

export const trackPageView = (referrer: string): void => {
  try {
    const tracker = (window as unknown as { _lcTracking?: { tracker?: LcTracker } })
      ._lcTracking?.tracker;
    if (typeof tracker?.sendEvent !== "function") return;
    void Promise.resolve(
      tracker.sendEvent({
        type: "external_script_page_view",
        timestamp: Date.now(),
        title: document.title,
        url: window.location.href,
        path: window.location.pathname,
        referrer,
        userAgent: navigator.userAgent,
      }),
    ).catch(() => undefined);
  } catch {
    /* tracking must never break navigation */
  }
};
