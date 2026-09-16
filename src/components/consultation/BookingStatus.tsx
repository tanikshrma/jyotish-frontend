import { useEffect, useRef, useState } from "react";
import { CalendarCheck2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BookingError,
  bookConsultation,
  type BookedConsultation,
} from "@/lib/consultation";
import type { RazorpaySuccess } from "@/lib/razorpay";
import { SlotPicker, type PickerTheme } from "./SlotPicker";

type Customer = { name: string; email: string; phone: string };

/**
 * Books the paid call and shows where it stands. If the slot was taken while
 * they were paying, the customer picks another right here — the payment is
 * already safe, so this never sends them back through checkout.
 */
export function BookingStatus({
  payment,
  customer,
  calendarId,
  minutes,
  theme,
  onBooked,
}: {
  payment: RazorpaySuccess;
  customer: Customer;
  calendarId: string;
  minutes: number;
  theme: PickerTheme;
  onBooked?: (b: BookedConsultation) => void;
}) {
  const [state, setState] = useState<"booking" | "booked" | "repick" | "failed">("booking");
  const [booking, setBooking] = useState<BookedConsultation | null>(null);
  const [message, setMessage] = useState("");
  const [slot, setSlot] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const started = useRef(false);

  const run = async (newSlot?: string) => {
    setState("booking");
    try {
      const b = await bookConsultation({ ...payment, customer, slot: newSlot });
      setBooking(b);
      setState("booked");
      onBooked?.(b);
    } catch (err) {
      const e = err instanceof BookingError ? err : new BookingError("Could not book your consultation");
      setMessage(e.message);
      if (e.code === "SLOT_UNAVAILABLE") {
        setSlot(null);
        setRefreshKey((k) => k + 1);
        setState("repick");
      } else {
        setState("failed");
      }
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "booking") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#EFE4D3] bg-white p-4 text-left">
        <Loader2 className="h-5 w-5 shrink-0 animate-spin" style={{ color: theme.ink }} />
        <span className="text-[13.5px] font-semibold" style={{ color: theme.ink }}>
          Booking your call with Dr. Sandeep…
        </span>
      </div>
    );
  }

  if (state === "booked" && booking) {
    return (
      <div className="flex items-start gap-3 rounded-xl border-2 border-[#16A34A]/40 bg-[#F0FBF3] p-4 text-left">
        <CalendarCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
        <div className="min-w-0">
          <div className="text-[14px] font-extrabold text-[#14532D]">Your call is booked</div>
          <div className="mt-0.5 text-[13.5px] font-semibold" style={{ color: theme.ink }}>{booking.when}</div>
          <div className="mt-1 text-[12px] leading-snug text-[#3F5F48]">
            {booking.label}. Dr. Sandeep's team will call you on {customer.phone || "your number"} at this time.
          </div>
        </div>
      </div>
    );
  }

  if (state === "repick") {
    return (
      <div className="rounded-xl border-2 border-[#F59E0B]/50 bg-[#FFFBEB] p-4 text-left">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#D97706]" />
          <p className="text-[13px] leading-snug text-[#78350F]">{message}</p>
        </div>
        <div className="mt-3">
          <SlotPicker
            calendarId={calendarId}
            minutes={minutes}
            value={slot}
            onChange={setSlot}
            theme={theme}
            refreshKey={refreshKey}
          />
        </div>
        <Button
          type="button"
          disabled={!slot}
          onClick={() => slot && void run(slot)}
          className="mt-3 h-auto w-full rounded-xl py-3 font-bold text-white"
          style={{ background: `linear-gradient(180deg, ${theme.cta}, ${theme.ctaDark})` }}
        >
          Book this time
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-[#F59E0B]/50 bg-[#FFFBEB] p-4 text-left">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#D97706]" />
        <div className="text-[13px] leading-snug text-[#78350F]">
          <b>Your payment is safe, but the call isn't booked yet.</b> {message}. Try again, or our team will call you
          to schedule it (payment ID {payment.razorpay_payment_id}).
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => void run()}
        className="mt-3 w-full rounded-xl font-bold"
        style={{ color: theme.ink }}
      >
        Try booking again
      </Button>
    </div>
  );
}
