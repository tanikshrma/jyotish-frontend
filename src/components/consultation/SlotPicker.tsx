import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IST_ZONE,
  formatDayChip,
  formatSlotTime,
  loadBookableDays,
  type SlotDays,
} from "@/lib/consultation";

export type PickerTheme = { ink: string; cta: string; ctaDark: string };

/**
 * Dr. Sandeep's live availability as date chips and time chips.
 *
 * Times are shown in IST — his calendar runs on it — with the visitor's own
 * time alongside when they are elsewhere. Only slots that can really be booked
 * are offered: 2+ hours ahead, and for an hour-long call, two free slots in a
 * row. `refreshKey` reloads after the server reports a slot was just taken.
 */
export function SlotPicker({
  calendarId,
  minutes,
  value,
  onChange,
  theme,
  refreshKey = 0,
  error,
}: {
  calendarId: string;
  minutes: number;
  value: string | null;
  onChange: (slot: string | null) => void;
  theme: PickerTheme;
  refreshKey?: number;
  error?: string;
}) {
  const [days, setDays] = useState<SlotDays>([]);
  const [day, setDay] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  const localZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const showLocal = localZone !== IST_ZONE && localZone !== "Asia/Calcutta";

  const load = useCallback(async () => {
    setState("loading");
    try {
      const next = await loadBookableDays(calendarId, minutes);
      setDays(next);
      setState("ready");
      setDay((current) => (current && next.some((d) => d.date === current) ? current : next[0]?.date ?? null));
    } catch {
      setState("failed");
    }
  }, [calendarId, minutes]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  // A picked time that is no longer offered (reload, or a duration change that
  // needs two slots) is cleared rather than silently kept.
  useEffect(() => {
    if (state !== "ready" || !value) return;
    if (!days.some((d) => d.slots.includes(value))) onChange(null);
  }, [days, state, value, onChange]);

  const slots = days.find((d) => d.date === day)?.slots ?? [];

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#E6DACA] py-6 text-[13px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading Dr. Sandeep's calendar…
      </div>
    );
  }

  if (state === "failed" || days.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#E6DACA] px-4 py-5 text-center text-[13px] text-muted-foreground">
        {state === "failed" ? "Couldn't load the calendar." : "No open slots in the next three weeks."}
        <button
          type="button"
          onClick={() => void load()}
          className="mx-auto mt-2 flex items-center gap-1.5 text-[13px] font-bold"
          style={{ color: theme.ink }}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2" role="listbox" aria-label="Choose a date">
        {days.map((d) => {
          const chip = formatDayChip(d.date);
          const active = d.date === day;
          return (
            <button
              key={d.date}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => setDay(d.date)}
              className={cn(
                "flex w-[58px] shrink-0 snap-start flex-col items-center rounded-xl border py-2 text-center transition-colors",
                active ? "text-white shadow-md" : "border-[#E6DACA] bg-white hover:border-[#CDBBA3]",
              )}
              style={active ? { background: theme.ink, borderColor: theme.ink } : undefined}
            >
              <span className={cn("text-[10.5px] font-semibold uppercase", active ? "text-white/80" : "text-muted-foreground")}>
                {chip.weekday}
              </span>
              <span className="font-serif text-lg font-extrabold leading-tight">{chip.day}</span>
              <span className={cn("text-[10.5px]", active ? "text-white/80" : "text-muted-foreground")}>{chip.month}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4" role="listbox" aria-label="Choose a time">
        {slots.map((s) => {
          const active = s === value;
          return (
            <button
              key={s}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onChange(s)}
              className={cn(
                "rounded-lg border px-1 py-2 text-[13px] font-semibold transition-colors",
                active ? "text-white shadow" : "border-[#E6DACA] bg-white hover:border-[#CDBBA3]",
              )}
              style={active ? { background: theme.cta, borderColor: theme.ctaDark } : { color: theme.ink }}
            >
              {formatSlotTime(s)}
            </button>
          );
        })}
      </div>

      <p className={cn("mt-2 flex items-center gap-1.5 text-[11.5px]", error ? "font-medium text-destructive" : "text-muted-foreground")}>
        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
        {error ??
          (value
            ? `${formatDayChip(days.find((d) => d.slots.includes(value))?.date ?? "").weekday}, ${formatSlotTime(value)} IST${
                showLocal ? ` · ${formatSlotTime(value, localZone)} your time` : ""
              }`
            : `Times in IST${showLocal ? " (India)" : ""} · ${minutes}-minute call`)}
      </p>
    </div>
  );
}
