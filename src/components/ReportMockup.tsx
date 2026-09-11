import type { ReportLandingConfig } from "@/pages/landing/reportLandingConfig";

/**
 * Convincing facsimiles of pages from the delivered report.
 *
 * Deliberately NOT grey placeholder bars — those read as a loading skeleton and
 * make the product look unfinished. Everything here is real typography, a real
 * north-Indian chart with planets in houses, real tables.
 *
 * Three distinct spreads are available so the "sample pages" strip shows three
 * different pages rather than the same one three times. The sample data is one
 * fixed illustrative chart, labelled as such wherever it is shown.
 */

export type MockPage = "chart" | "houses" | "dasha";

/* House centres for a north-Indian diamond on a 100x100 viewBox. */
const HOUSES: { n: number; x: number; y: number; planets?: string }[] = [
  { n: 1, x: 50, y: 22, planets: "Ma" },
  { n: 2, x: 26, y: 11 },
  { n: 3, x: 11, y: 26, planets: "Su Me" },
  { n: 4, x: 26, y: 50, planets: "Ve" },
  { n: 5, x: 11, y: 74 },
  { n: 6, x: 26, y: 89, planets: "Ke" },
  { n: 7, x: 50, y: 78, planets: "Sa" },
  { n: 8, x: 74, y: 89 },
  { n: 9, x: 89, y: 74, planets: "Ju" },
  { n: 10, x: 74, y: 50, planets: "Mo" },
  { n: 11, x: 89, y: 26, planets: "Ra" },
  { n: 12, x: 74, y: 11 },
];

const POSITIONS = [
  ["Sun", "Aquarius", "29°14'", "P.Bhadra"],
  ["Moon", "Scorpio", "07°52'", "Anuradha"],
  ["Mars", "Taurus", "18°03'", "Rohini"],
  ["Mercury", "Aquarius", "11°37'", "Shatabhisha"],
];

const DASHA_CHIPS = [
  ["Ketu", "1994–2001"],
  ["Venus", "2001–2021"],
  ["Sun", "2021–2027"],
  ["Moon", "2027–2037"],
];

const DASHA_TABLE = [
  ["Ketu", "Jul 1994", "Jul 2001", "7 yrs"],
  ["Venus", "Jul 2001", "Jul 2021", "20 yrs"],
  ["Sun", "Jul 2021", "Jul 2027", "6 yrs"],
  ["Moon", "Jul 2027", "Jul 2037", "10 yrs"],
  ["Mars", "Jul 2037", "Jul 2044", "7 yrs"],
  ["Rahu", "Jul 2044", "Jul 2062", "18 yrs"],
  ["Jupiter", "Jul 2062", "Jul 2078", "16 yrs"],
];

const HOUSE_BLOCKS = [
  {
    h: "First House — Lagna, the self",
    t: "Sagittarius rises, with Mars placed here. The body is active and the manner direct; people read you quickly, and not always as you intend. Jupiter's lordship from the ninth steadies what Mars would otherwise rush.",
  },
  {
    h: "Second House — wealth and speech",
    t: "Capricorn on the cusp, its lord Saturn in the seventh. Money accumulates slowly and through partnership rather than windfall. Speech is measured, occasionally blunt, rarely careless.",
  },
  {
    h: "Third House — courage and siblings",
    t: "Sun and Mercury together in Aquarius give an analytical courage — you argue rather than fight. Writing, negotiation and short journeys are all supported through the current period.",
  },
  {
    h: "Fourth House — home and mother",
    t: "Venus in Pisces here is well placed. Domestic comfort improves markedly after the Venus period closes, and property is indicated in the second half of life rather than the first.",
  },
];

const ASHTAKVARGA = [30, 28, 25, 34, 22, 27, 31, 19, 36, 29, 24, 26];

/* --------------------------------------------------------------- page */

export function ReportPage({
  config, page = "chart", className = "",
}: { config: ReportLandingConfig; page?: MockPage; className?: string }) {
  const ink = config.theme.ink;
  const gold = config.theme.gold;

  const pageNo = page === "chart" ? "Page 3" : page === "houses" ? "Page 18" : "Page 34";

  return (
    <div
      className={`flex aspect-[1/1.414] w-full flex-col overflow-hidden rounded-[6px] bg-[#FFFDF8] p-[6.5%] shadow-xl ${className}`}
      style={{ containerType: "inline-size" }}
    >
      {/* masthead */}
      <div className="flex items-baseline justify-between">
        <span className="font-serif font-bold" style={{ color: ink, fontSize: "4.2cqw" }}>
          JyotishNow
        </span>
        <span
          className="font-semibold uppercase"
          style={{ color: `${ink}88`, fontSize: "1.9cqw", letterSpacing: "0.22em" }}
        >
          {config.name}
        </span>
      </div>
      <div className="mt-[1.6%] h-[2px] w-full" style={{ background: gold }} />
      <div className="mt-[0.6%] h-[1px] w-full" style={{ background: `${ink}33` }} />

      <p className="mt-[3.2%]" style={{ color: `${ink}cc`, fontSize: "2.3cqw" }}>
        <span className="font-semibold">Ananya Sharma</span> · 14 March 1996 · 04:42 ·
        Chandigarh, India
      </p>

      {page === "chart" && <ChartBody ink={ink} gold={gold} />}
      {page === "houses" && <HousesBody ink={ink} gold={gold} />}
      {page === "dasha" && <DashaBody ink={ink} gold={gold} />}

      <div className="mt-[3%] flex items-center justify-between border-t pt-[2%]" style={{ borderColor: `${ink}22` }}>
        <span style={{ color: `${ink}66`, fontSize: "1.7cqw" }}>jyotishnow.com</span>
        <span style={{ color: `${ink}66`, fontSize: "1.7cqw" }}>{pageNo}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- page bodies */

function ChartBody({ ink, gold }: { ink: string; gold: string }) {
  return (
    <>
      <div className="mt-[3.4%] flex gap-[4%]">
        <svg viewBox="0 0 100 100" className="h-auto w-[43%]" aria-hidden>
          <rect x="1" y="1" width="98" height="98" fill="#FFF9EF" stroke={ink} strokeWidth="0.9" />
          <path d="M1 1 L99 99 M99 1 L1 99" fill="none" stroke={ink} strokeWidth="0.55" />
          <path d="M50 1 L1 50 L50 99 L99 50 Z" fill="none" stroke={ink} strokeWidth="0.55" />
          {HOUSES.map((h) => (
            <g key={h.n}>
              <text x={h.x} y={h.y} textAnchor="middle" fontSize="4.4" fill={`${ink}70`} fontFamily="Outfit, sans-serif">
                {h.n}
              </text>
              {h.planets && (
                <text x={h.x} y={h.y + 6} textAnchor="middle" fontSize="5" fontWeight="700" fill={ink} fontFamily="Outfit, sans-serif">
                  {h.planets}
                </text>
              )}
            </g>
          ))}
        </svg>

        <div className="flex-1">
          <SectionLabel ink={ink}>Planetary Positions</SectionLabel>
          <table className="mt-[4%] w-full" style={{ fontSize: "2.05cqw", color: `${ink}dd` }}>
            <tbody>
              {POSITIONS.map(([p, sign, deg, nak], i) => (
                <tr key={p} style={{ background: i % 2 ? `${gold}1f` : "transparent" }}>
                  <td className="py-[2.5%] pl-[3%] font-semibold">{p}</td>
                  <td>{sign}</td>
                  <td className="tabular-nums">{deg}</td>
                  <td className="pr-[3%] text-right">{nak}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-[7%]"><SectionLabel ink={ink}>Vimshottari Dasha</SectionLabel></div>
          <div className="mt-[4%] grid grid-cols-4 gap-[3%]">
            {DASHA_CHIPS.map(([lord, yrs], i) => (
              <div
                key={lord}
                className="rounded-[2px] px-[6%] py-[9%] text-center"
                style={{ background: i === 2 ? gold : `${ink}12`, color: i === 2 ? "#fff" : `${ink}bb` }}
              >
                <div className="font-bold" style={{ fontSize: "1.95cqw" }}>{lord}</div>
                <div className="tabular-nums" style={{ fontSize: "1.6cqw" }}>{yrs}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="mt-[5%] font-serif font-bold" style={{ color: ink, fontSize: "3.2cqw" }}>
        Your Ascendant &amp; Personality
      </h3>
      <p className="mt-[2%] flex-1 leading-[1.55]" style={{ color: `${ink}b0`, fontSize: "2.1cqw", textAlign: "justify" }}>
        With Sagittarius rising and its lord Jupiter placed in the ninth house, the chart carries a
        strong dharmic axis — a natural pull toward teaching, law, publishing or long-distance work.
        Mars in the first house lends physical drive and a directness that reads as confidence to
        some and impatience to others. Saturn's opposition from the seventh asks for patience in
        partnership, particularly before the twenty-ninth year.
      </p>
    </>
  );
}

function HousesBody({ ink, gold }: { ink: string; gold: string }) {
  return (
    <>
      <h3 className="mt-[4%] font-serif font-bold" style={{ color: ink, fontSize: "3.4cqw" }}>
        House-by-House Analysis
      </h3>
      <div className="mt-[1.5%] h-[1px] w-[22%]" style={{ background: gold }} />

      <div className="mt-[3.5%] flex-1 space-y-[3.4%]">
        {HOUSE_BLOCKS.map((b) => (
          <div key={b.h}>
            <h4 className="font-serif font-bold" style={{ color: ink, fontSize: "2.35cqw" }}>{b.h}</h4>
            <p className="mt-[1%] leading-[1.5]" style={{ color: `${ink}a8`, fontSize: "2cqw", textAlign: "justify" }}>
              {b.t}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-[3%] rounded-[3px] p-[3.5%]" style={{ background: `${gold}1f` }}>
        <SectionLabel ink={ink}>House lords at a glance</SectionLabel>
        <div className="mt-[2.5%] grid grid-cols-6 gap-[2%]">
          {["Ju", "Sa", "Sa", "Ju", "Ma", "Ve"].map((l, i) => (
            <div key={i} className="rounded-[2px] bg-white/70 py-[8%] text-center">
              <div style={{ color: `${ink}77`, fontSize: "1.5cqw" }}>{i + 1}H</div>
              <div className="font-bold" style={{ color: ink, fontSize: "1.9cqw" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function DashaBody({ ink, gold }: { ink: string; gold: string }) {
  const max = Math.max(...ASHTAKVARGA);
  return (
    <>
      <h3 className="mt-[4%] font-serif font-bold" style={{ color: ink, fontSize: "3.4cqw" }}>
        Vimshottari Dasha Timeline
      </h3>
      <div className="mt-[1.5%] h-[1px] w-[22%]" style={{ background: gold }} />

      <table className="mt-[3.5%] w-full" style={{ fontSize: "2.05cqw", color: `${ink}dd` }}>
        <thead>
          <tr style={{ color: `${ink}88` }}>
            <th className="pb-[1.5%] pl-[2%] text-left font-semibold">Mahadasha</th>
            <th className="pb-[1.5%] text-left font-semibold">From</th>
            <th className="pb-[1.5%] text-left font-semibold">To</th>
            <th className="pb-[1.5%] pr-[2%] text-right font-semibold">Length</th>
          </tr>
        </thead>
        <tbody>
          {DASHA_TABLE.map(([lord, from, to, len], i) => {
            const active = i === 2;
            return (
              <tr
                key={lord}
                style={{
                  background: active ? gold : i % 2 ? `${gold}17` : "transparent",
                  color: active ? "#fff" : `${ink}dd`,
                }}
              >
                <td className="py-[2.1%] pl-[2%] font-semibold">{lord}</td>
                <td className="tabular-nums">{from}</td>
                <td className="tabular-nums">{to}</td>
                <td className="pr-[2%] text-right tabular-nums">{len}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-[5%]"><SectionLabel ink={ink}>Sarvashtakavarga — points per house</SectionLabel></div>
      <div className="mt-[2.5%] flex items-end gap-[1.4%]" style={{ height: "18%" }}>
        {ASHTAKVARGA.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end" style={{ height: "100%" }}>
            <span className="tabular-nums" style={{ color: `${ink}88`, fontSize: "1.5cqw" }}>{v}</span>
            <div
              className="w-full rounded-t-[1px]"
              style={{ height: `${(v / max) * 78}%`, background: v >= 30 ? gold : `${ink}33` }}
            />
            <span style={{ color: `${ink}66`, fontSize: "1.4cqw" }}>{i + 1}</span>
          </div>
        ))}
      </div>

      <p className="mt-[3.5%] flex-1 leading-[1.5]" style={{ color: `${ink}a8`, fontSize: "2cqw", textAlign: "justify" }}>
        The Sun period running to 2027 activates the third house, which is why writing, negotiation
        and self-directed work have come forward recently. Houses nine and four carry the strongest
        Ashtakvarga scores in this chart, and periods touching them tend to be the productive ones.
      </p>
    </>
  );
}

function SectionLabel({ ink, children }: { ink: string; children: React.ReactNode }) {
  return (
    <div
      className="font-semibold uppercase"
      style={{ color: `${ink}99`, fontSize: "1.85cqw", letterSpacing: "0.18em" }}
    >
      {children}
    </div>
  );
}

/** Two pages fanned, for the bundle; one page alone for the single report. */
export function ReportStack({ config }: { config: ReportLandingConfig }) {
  const two = config.pdfCount > 1;
  return (
    <div className="relative w-full">
      {two && (
        <div aria-hidden className="absolute inset-0 origin-bottom-left" style={{ transform: "rotate(-6deg) translate(-6%, -2%)" }}>
          <div className="aspect-[1/1.414] w-full rounded-[6px] bg-[#F3EADA] shadow-xl" />
        </div>
      )}
      <div className="relative" style={two ? { transform: "rotate(1.5deg)" } : undefined}>
        <ReportPage config={config} />
      </div>
    </div>
  );
}
