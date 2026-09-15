/**
 * Theme defaults for the VedicAstro-generated PDF reports (kundli + matching).
 *
 * `color` is a HUE IN DEGREES (0-360) — NOT a hex code. Verified against the
 * live API on 2026-09-16:
 *   - "140" (VedicAstro's sample value, previously hard-coded here) renders
 *     their green cover band;
 *   - "#7A0808" is rejected and silently falls back to a slate default;
 *   - "0" renders #d00101 with a #ffe1e1 tint — the JyotishNow red family.
 *
 * Hue is the only control: saturation and lightness are fixed by their
 * template, so the exact brand maroon (#7A0808) cannot be reproduced.
 *
 * The report's LOGO and page WATERMARK are not request parameters at all —
 * they come from the white-label settings on the VedicAstro dashboard. If a
 * report shows someone else's logo, it is set there, not here.
 */
export const DEFAULT_PDF_THEME_HUE = "0";

/** Report language. VedicAstro supports 21; the cover invocation follows this. */
export const DEFAULT_PDF_LANG = "en";
