import type { ReportLandingConfig } from "@/pages/landing/reportLandingConfig";

/**
 * A convincing facsimile of the first page of the delivered report.
 *
 * Deliberately NOT a grey wireframe — placeholder bars read as a loading
 * skeleton and make the product look unfinished. Everything here is real
 * typography, a real north-Indian chart with planets in houses, and a real
 * planetary table, so the visitor sees what they are actually buying.
 *
 * The sample data is a fixed illustrative chart, labelled as such.
 */

/* House centres for a north-Indian diamond on a 100x100 viewBox, house 1 at
   top-centre running anticlockwise the way the chart is conventionally read. */
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

const DASHA = [
  ["Ketu", "1994–2001"],
  ["Venus", "2001–2021"],
  ["Sun", "2021–2027"],
  ["Moon", "2027–2037"],
];

export function ReportPage({
  config, className = "",
}: { config: ReportLandingConfig; className?: string }) {
  const { ink, gold } = config.theme;

  return (
    <div
      className={`flex aspect-[1/1.414] w-full flex-col overflow-hidden rounded-[6px] bg-[#FFFDF8] p-[6.5%] shadow-2xl ${className}`}
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

      {/* subject line */}
      <p className="mt-[3.2%]" style={{ color: `${ink}cc`, fontSize: "2.3cqw" }}>
        <span className="font-semibold">Ananya Sharma</span> · 14 March 1996 · 04:42 ·
        Chandigarh, India
      </p>

      {/* chart + positions */}
      <div className="mt-[3.4%] flex gap-[4%]">
        <svg viewBox="0 0 100 100" className="h-auto w-[43%]" aria-hidden>
          <rect x="1" y="1" width="98" height="98" fill="#FFF9EF" stroke={ink} strokeWidth="0.9" />
          <path d="M1 1 L99 99 M99 1 L1 99" fill="none" stroke={`${ink}`} strokeWidth="0.55" />
          <path d="M50 1 L1 50 L50 99 L99 50 Z" fill="none" stroke={ink} strokeWidth="0.55" />
          {HOUSES.map((h) => (
            <g key={h.n}>
              <text
                x={h.x} y={h.y} textAnchor="middle"
                fontSize="4.4" fill={`${ink}70`} fontFamily="Outfit, sans-serif"
              >
                {h.n}
              </text>
              {h.planets && (
                <text
                  x={h.x} y={h.y + 6} textAnchor="middle"
                  fontSize="5" fontWeight="700" fill={ink} fontFamily="Outfit, sans-serif"
                >
                  {h.planets}
                </text>
              )}
            </g>
          ))}
        </svg>

        <div className="flex-1">
          <div
            className="font-semibold uppercase"
            style={{ color: `${ink}99`, fontSize: "1.85cqw", letterSpacing: "0.18em" }}
          >
            Planetary Positions
          </div>
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

          <div
            className="mt-[7%] font-semibold uppercase"
            style={{ color: `${ink}99`, fontSize: "1.85cqw", letterSpacing: "0.18em" }}
          >
            Vimshottari Dasha
          </div>
          <div className="mt-[4%] grid grid-cols-4 gap-[3%]">
            {DASHA.map(([lord, yrs], i) => (
              <div
                key={lord}
                className="rounded-[2px] px-[6%] py-[9%] text-center"
                style={{
                  background: i === 2 ? gold : `${ink}12`,
                  color: i === 2 ? ink : `${ink}bb`,
                }}
              >
                <div className="font-bold" style={{ fontSize: "1.95cqw" }}>{lord}</div>
                <div className="tabular-nums" style={{ fontSize: "1.6cqw" }}>{yrs}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* body section */}
      <h3
        className="mt-[5%] font-serif font-bold"
        style={{ color: ink, fontSize: "3.2cqw" }}
      >
        Your Ascendant &amp; Personality
      </h3>
      <p
        className="mt-[2%] flex-1 leading-[1.55]"
        style={{ color: `${ink}b0`, fontSize: "2.1cqw", textAlign: "justify" }}
      >
        With Sagittarius rising and its lord Jupiter placed in the ninth house, the chart
        carries a strong dharmic axis — a natural pull toward teaching, law, publishing or
        long-distance work. Mars in the first house lends physical drive and a directness
        that reads as confidence to some and impatience to others. Saturn's opposition from
        the seventh asks for patience in partnership, particularly before the twenty-ninth
        year, after which the same placement begins to reward steadiness rather than punish
        haste.
      </p>

      <div className="mt-[3%] flex items-center justify-between border-t pt-[2%]" style={{ borderColor: `${ink}22` }}>
        <span style={{ color: `${ink}66`, fontSize: "1.7cqw" }}>jyotishnow.com</span>
        <span style={{ color: `${ink}66`, fontSize: "1.7cqw" }}>Page 3</span>
      </div>
    </div>
  );
}

/** Two pages fanned, for the bundle; one page alone for the single report. */
export function ReportStack({ config }: { config: ReportLandingConfig }) {
  const two = config.pdfCount > 1;
  return (
    <div className="relative w-full">
      {two && (
        <div
          aria-hidden
          className="absolute inset-0 origin-bottom-left"
          style={{ transform: "rotate(-6deg) translate(-6%, -2%)" }}
        >
          <div className="aspect-[1/1.414] w-full rounded-[6px] bg-[#F3EADA] shadow-xl" />
        </div>
      )}
      <div className="relative" style={two ? { transform: "rotate(1.5deg)" } : undefined}>
        <ReportPage config={config} />
      </div>
    </div>
  );
}
