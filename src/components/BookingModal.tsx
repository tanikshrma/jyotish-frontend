import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Calendar, Clock, User, Phone, Mail, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { postTrackingEvent } from "@/lib/tracking";
interface BookingModalProps {
  children: React.ReactNode;
  defaultService?: string;
}

import { fetchProspectIQCalendarSlots, bookProspectIQAppointment, submitProspectIQLead, getCalendarIdForService } from "@/lib/prospectiq";
import { loadRazorpayScript, createOrder, verifyPayment } from "@/lib/razorpay";
import { getPriceInRupees, formatINR, type ServiceId } from "../../shared/pricing";

const LOCATION_ID = "FTD8wmuYqCT7XoIpXJQG";
const SERVICE_CUSTOM_FIELD_ID = "GQbW8PBfcMus3Opakqn0";

const getBrowserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

const clampAvailabilityRange = (startMs: number, endMs: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = Math.max(startMs, today.getTime());
  const maxEndDate = startDate + 31 * 24 * 60 * 60 * 1000;
  const endDate = Math.min(Math.max(endMs, startDate), maxEndDate);

  return { startDate, endDate };
};

const fetchCalendarFreeSlots = async (
  calendarId: string,
  startMs: number,
  endMs: number,
) => {
  const { startDate, endDate } = clampAvailabilityRange(startMs, endMs);
  return await fetchProspectIQCalendarSlots(calendarId, startDate, endDate, getBrowserTimezone());
};

export function normalizeSlotMap(rawData: any): Record<string, string[]> {
  if (!rawData || typeof rawData !== 'object') return {};

  const sourceObj = (rawData.slots && typeof rawData.slots === 'object' && !Array.isArray(rawData.slots))
    ? rawData.slots
    : rawData;

  const normalized: Record<string, string[]> = {};

  for (const [key, val] of Object.entries(sourceObj)) {
    const match = key.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!match) continue;

    const y = match[1];
    const m = match[2].padStart(2, '0');
    const d = match[3].padStart(2, '0');
    const normKey = `${y}-${m}-${d}`;

    let slotsList: string[] = [];

    if (Array.isArray(val)) {
      slotsList = val.map(String);
    } else if (val && typeof val === 'object' && Array.isArray((val as any).slots)) {
      slotsList = (val as any).slots.map(String);
    }

    if (slotsList.length > 0) {
      normalized[normKey] = slotsList;
    }
  }

  return normalized;
}

export function BookingModal({ children, defaultService }: BookingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState(defaultService || "complete-horoscope");

  // Calendar State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [slotsData, setSlotsData] = useState<Record<string, string[]>>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [hasLoadedSlots, setHasLoadedSlots] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDate(undefined);
      setSelectedSlot(null);
      setCurrentMonth(new Date());
      setHasLoadedSlots(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && step === 2 && !hasLoadedSlots) {
      setHasLoadedSlots(true);
      loadSlots(service);
    }
  }, [isOpen, step, service, hasLoadedSlots]);

  const loadSlots = async (targetService: string) => {
    setIsLoadingSlots(true);
    try {
      const activeCalendarId = getCalendarIdForService(targetService);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startMs = today.getTime();
      const endMs = startMs + 45 * 24 * 60 * 60 * 1000;
      const data = await fetchCalendarFreeSlots(activeCalendarId, startMs, endMs);
      const slotMap = normalizeSlotMap(data);
      setSlotsData(slotMap);

      const availableDateKeys = Object.keys(slotMap)
        .filter(dKey => slotMap[dKey] && slotMap[dKey].length > 0)
        .sort();

      if (availableDateKeys.length > 0) {
        const firstAvailableKey = availableDateKeys.find(dKey => {
          const [y, m, d] = dKey.split('-').map(Number);
          const dObj = new Date(y, m - 1, d);
          return dObj >= today;
        }) || availableDateKeys[0];

        const [y, m, d] = firstAvailableKey.split('-').map(Number);
        const autoDate = new Date(y, m - 1, d);

        setSelectedDate(autoDate);
        setCurrentMonth(new Date(y, m - 1, 1));
        if (slotMap[firstAvailableKey]?.[0]) {
          setSelectedSlot(slotMap[firstAvailableKey][0]);
        }
      }
    } catch (error) {
      console.error("Failed to load slots", error);
      toast.error("Failed to load availability. Please try again.");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const availableSlotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return slotsData[dateString] || [];
  }, [selectedDate, slotsData]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
    if (!email) newErrors.email = "Email is required";
    if (!phone) newErrors.phone = "Phone is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!selectedDate) {
      setSelectedDate(new Date());
    }
    setStep(2);
  };

function mapServiceToPricing(serviceName: string): { serviceId: ServiceId; variant: string } {
  const lower = (serviceName || "").toLowerCase();
  if (lower.includes("face") || lower.includes("personal meeting")) {
    return { serviceId: "face-to-face", variant: "default" };
  }
  if (lower.includes("baby") || lower.includes("muhurat")) {
    return { serviceId: "baby-muhurat", variant: "default" };
  }
  if (lower.includes("couple") || lower.includes("relationship")) {
    return { serviceId: "couple-consultation", variant: "30 Min|Video" };
  }
  if (lower.includes("matchmaking") || lower.includes("kundli matching")) {
    return { serviceId: "matchmaking-consultation", variant: "default" };
  }
  if (lower.includes("gemstone")) {
    return { serviceId: "gemstone-analysis", variant: "default" };
  }
  if (lower.includes("career")) {
    return { serviceId: "career-guidance", variant: "default" };
  }
  if (lower.includes("vastu")) {
    return { serviceId: "vastu-consultancy", variant: "default" };
  }
  if (lower.includes("annual") || lower.includes("yearly")) {
    return { serviceId: "annual-horoscope", variant: "Video Call" };
  }
  if (lower.includes("lal kitab")) {
    return { serviceId: "lalkitab-consultation", variant: "default" };
  }
  if (lower.includes("complete")) {
    return { serviceId: "complete-horoscope", variant: "Video Call" };
  }
  return { serviceId: "consultation-call", variant: "30 Min|Video" };
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Submit lead to Prospect IQ CRM immediately (ensures lead is captured before payment)
      await submitProspectIQLead({
        firstName,
        lastName,
        email,
        phone,
        service,
        tags: ["Book Consultation Form", `Service: ${service}`],
      });

      // Tracking
      const trackingPayload = {
        type: "external_form_submission",
        timestamp: Date.now(),
        formId: "Booking Form",
        formData: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
        },
        formLabels: {
          first_name: "First Name",
          last_name: "Last Name",
          email: "Email",
          phone: "Phone",
        },
        url: window.location.href,
        title: document.title,
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        trackingId: "tk_1f4f60a82c8f4c5588febd8434e0192a",
        locationId: LOCATION_ID,
        sessionId: crypto.randomUUID(),
        properties: {
          deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
        },
      };

      const customFields = {
        'GQbW8PBfcMus3Opakqn0': { value: service, label: 'Service' }
      };

      postTrackingEvent(trackingPayload, { customFields });

      // 2. Trigger Razorpay Payment Checkout
      await loadRazorpayScript();
      const pricing = mapServiceToPricing(service);
      const order = await createOrder({
        service: pricing.serviceId,
        variant: pricing.variant,
        notes: {
          service,
          customer_name: `${firstName} ${lastName}`,
          customer_email: email,
          customer_phone: phone,
          selected_slot: selectedSlot,
        },
      });

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout is unavailable");
      }

      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "JyotishNow Consultation",
        description: `${service} (${formatINR(order.amount / 100)})`,
        order_id: order.order_id,
        prefill: {
          name: `${firstName} ${lastName}`,
          email,
          contact: phone,
        },
        theme: { color: "#7A0808" },
        handler: async (response: any) => {
          try {
            const verificationResult = await verifyPayment({
              ...response,
              customer: {
                name: `${firstName} ${lastName}`.trim(),
                email,
                phone,
              },
              service: `${service} (Consultation)`,
              amount: formatINR(order.amount / 100),
            });
            
            // Confirm appointment on Prospect IQ calendar upon payment confirmation
            const activeCalendarId = getCalendarIdForService(service);
            await bookProspectIQAppointment({
              calendarId: activeCalendarId,
              firstName,
              lastName,
              email,
              phone,
              selectedSlot,
              service,
            });

            setIsOpen(false);
            const waUrl = verificationResult.whatsappCustomerUrl || verificationResult.whatsappAdminUrl;
            toast.success("Consultation Booked & Payment Confirmed!", {
              description: `Payment ID: ${response.razorpay_payment_id}. Receipt generated.`,
              icon: <Sparkles className="w-5 h-5 text-secondary" />,
              action: waUrl ? {
                label: "WhatsApp Receipt",
                onClick: () => window.open(waUrl, "_blank"),
              } : undefined,
            });
          } catch (err: any) {
            toast.error("Payment Verification Error", {
              description: err.message || "Please contact support with your Payment ID.",
            });
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            toast.info("Payment cancelled. Your lead information has been saved.");
          },
        },
      });

      checkout.open();
    } catch (error: any) {
      console.error("Booking error", error);
      toast.error("Failed to initiate consultation booking", {
        description: error.message || "Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div onClick={() => setIsOpen(true)} className="contents cursor-pointer">
        {children}
      </div>
      <DialogContent className="sm:max-w-[550px] w-[95vw] p-0 max-h-[90vh] flex flex-col border border-secondary/30 shadow-[0_20px_70px_-10px_rgba(129,9,9,0.15)] rounded-2xl bg-gradient-to-b from-white to-[#faf8f5] overflow-hidden [&>button]:text-white [&>button]:bg-white/10 [&>button]:hover:bg-white/20 [&>button]:rounded-full [&>button]:p-1.5 [&>button]:top-4 [&>button]:right-4 [&>button_svg]:w-5 [&>button_svg]:h-5">
        
        {/* ================= FIXED HEADER ================= */}
        <div className="shrink-0 p-5 sm:p-6 pb-4 relative border-b border-primary/20 bg-primary text-white overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-primary"></div>
          </div>

          <DialogHeader className="text-left relative z-10">
            <div className="mb-2 flex justify-start pr-8">
              <img 
                src="https://vibe.filesafe.space/1782888190245745251/attachments/b527a59c-20b5-4820-a597-6b520f4ed875.png"
                alt="Jyotish Now" 
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm"
              />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              {step === 1 ? "Book Your Session" : "Select Date & Time"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-white/80 mt-1 leading-relaxed">
              {step === 1 
                ? "Step into clarity. Fill out the details below to schedule your personalized reading."
                : "Choose an available date and time slot for your consultation with Dr. Sandeep Sawhney."
              }
            </DialogDescription>

            {/* STEP PROGRESS INDICATORS */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className={`flex items-center gap-1.5 ${step === 1 ? 'text-secondary font-bold' : 'text-white/60'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-secondary text-primary font-bold' : 'bg-white/20 text-white'}`}>1</span>
                  Your Details
                </span>
                <span className={`flex items-center gap-1.5 ${step === 2 ? 'text-secondary font-bold' : 'text-white/60'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-secondary text-primary font-bold' : 'bg-white/20 text-white'}`}>2</span>
                  Date & Time
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className={`h-full bg-secondary transition-all duration-500 rounded-full ${step === 1 ? 'w-1/2' : 'w-full'}`} />
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* ================= SCROLLABLE MIDDLE CONTENT ================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar relative z-10">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold text-foreground/80 ml-1">First Name</Label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                    <Input id="firstName" value={firstName} onChange={e => {setFirstName(e.target.value); setErrors({...errors, firstName: ''})}} className={cn("pl-10 bg-white border-secondary/30 focus-visible:ring-primary focus-visible:border-primary h-11 rounded-xl shadow-sm text-foreground transition-all duration-300", errors.firstName && "border-destructive")} placeholder="John" />
                  </div>
                  {errors.firstName && <p className="text-destructive text-xs ml-1">{errors.firstName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold text-foreground/80 ml-1">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={e => {setLastName(e.target.value); setErrors({...errors, lastName: ''})}} className={cn("bg-white border-secondary/30 focus-visible:ring-primary focus-visible:border-primary h-11 rounded-xl shadow-sm text-foreground transition-all duration-300 px-4", errors.lastName && "border-destructive")} placeholder="Doe" />
                  {errors.lastName && <p className="text-destructive text-xs ml-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground/80 ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                  <Input id="email" type="email" value={email} onChange={e => {setEmail(e.target.value); setErrors({...errors, email: ''})}} className={cn("pl-10 bg-white border-secondary/30 focus-visible:ring-primary focus-visible:border-primary h-11 rounded-xl shadow-sm text-foreground transition-all duration-300", errors.email && "border-destructive")} placeholder="john@example.com" />
                </div>
                {errors.email && <p className="text-destructive text-xs ml-1">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-foreground/80 ml-1">Phone Number</Label>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                  <Input id="phone" type="tel" value={phone} onChange={e => {setPhone(e.target.value); setErrors({...errors, phone: ''})}} className={cn("pl-10 bg-white border-secondary/30 focus-visible:ring-primary focus-visible:border-primary h-11 rounded-xl shadow-sm text-foreground transition-all duration-300", errors.phone && "border-destructive")} placeholder="+91 98765 43210" />
                </div>
                {errors.phone && <p className="text-destructive text-xs ml-1">{errors.phone}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="service" className="text-xs font-semibold text-foreground/80 ml-1">Select Service</Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger className="h-11 px-4 rounded-xl">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="complete-horoscope" className="py-2">Complete Horoscope Analysis</SelectItem>
                    <SelectItem value="annual-horoscope" className="py-2">Annual Horoscope Analysis</SelectItem>
                    <SelectItem value="matchmaking" className="py-2">Matchmaking Consultation</SelectItem>
                    <SelectItem value="gemstone" className="py-2">Gemstone Analysis</SelectItem>
                    <SelectItem value="career" className="py-2">Career Guidance</SelectItem>
                    <SelectItem value="vastu" className="py-2">Vastu Consultancy</SelectItem>
                    <SelectItem value="yearly" className="py-2">Yearly Horoscope</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Date Selector Header & Month Navigation */}
              <div className="bg-white p-4 rounded-2xl border border-secondary/20 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground font-serif">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 text-primary"
                      onClick={() => {
                        const prev = new Date(currentMonth);
                        prev.setMonth(prev.getMonth() - 1);
                        setCurrentMonth(prev);
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 text-primary"
                      onClick={() => {
                        const next = new Date(currentMonth);
                        next.setMonth(next.getMonth() + 1);
                        setCurrentMonth(next);
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Day Headers Row */}
                <div className="grid grid-cols-7 gap-1 text-center border-b border-border/40 pb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <span key={day} className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {day}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {(() => {
                    const year = currentMonth.getFullYear();
                    const month = currentMonth.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const cells = [];
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} className="h-8 sm:h-9 w-full" />);
                    }

                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateObj = new Date(year, month, day);
                      dateObj.setHours(0, 0, 0, 0);
                      const isPast = dateObj < today;
                      const isToday = dateObj.getTime() === today.getTime();
                      const isSelected = selectedDate && 
                        selectedDate.getFullYear() === year && 
                        selectedDate.getMonth() === month && 
                        selectedDate.getDate() === day;

                      const monthStr = String(month + 1).padStart(2, '0');
                      const dayStr = String(day).padStart(2, '0');
                      const dateKey = `${year}-${monthStr}-${dayStr}`;
                      const daySlots = slotsData[dateKey] || [];
                      const hasApiSlots = daySlots.length > 0;

                      cells.push(
                        <button
                          key={`day-${day}`}
                          type="button"
                          disabled={isPast}
                          onClick={() => {
                            setSelectedDate(dateObj);
                            if (daySlots.length > 0) {
                              setSelectedSlot(daySlots[0]);
                            } else {
                              setSelectedSlot(null);
                            }
                          }}
                          className={cn(
                            "h-8 sm:h-9 w-full rounded-xl text-xs font-semibold transition-all flex items-center justify-center relative",
                            isPast && "text-muted-foreground/30 pointer-events-none",
                            !isPast && !isSelected && "hover:bg-primary/10 text-foreground hover:scale-105",
                            isToday && !isSelected && "ring-2 ring-secondary/70 text-primary font-bold bg-secondary/10",
                            isSelected && "bg-primary text-white shadow-md font-bold scale-105"
                          )}
                        >
                          {day}
                          {!isPast && hasApiSlots && (
                            <span className={cn("absolute bottom-1 w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-primary")} />
                          )}
                        </button>
                      );
                    }
                    return cells;
                  })()}
                </div>
              </div>

              {/* Time Slots Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground/90 uppercase tracking-wider">
                    Available Time Slots
                  </Label>
                  {selectedDate && (
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>

                {isLoadingSlots ? (
                  <div className="flex justify-center py-6 bg-white rounded-2xl border border-secondary/20">
                    <div className="flex items-center gap-2 text-xs font-medium text-primary">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Checking real-time calendar availability...
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {(() => {
                      const activeDate = selectedDate || new Date();
                      const year = activeDate.getFullYear();
                      const monthStr = String(activeDate.getMonth() + 1).padStart(2, '0');
                      const dayStr = String(activeDate.getDate()).padStart(2, '0');
                      const dateKey = `${year}-${monthStr}-${dayStr}`;
                      const rawApiSlots = slotsData[dateKey] || [];

                      if (!rawApiSlots || rawApiSlots.length === 0) {
                        return (
                          <div className="col-span-full py-6 px-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center">
                            <p className="text-xs font-semibold text-amber-800">
                              No available consultation slots on this date. Please choose another date on the calendar above.
                            </p>
                          </div>
                        );
                      }

                      const slotsList = rawApiSlots.map(slot => {
                        const d = new Date(slot);
                        return {
                          raw: slot,
                          label: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                      });

                      return slotsList.map((slotObj) => {
                        const isSelected = selectedSlot === slotObj.raw;
                        return (
                          <Button
                            key={slotObj.raw}
                            type="button"
                            className={cn(
                              "h-11 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5",
                              isSelected 
                                ? 'bg-primary text-white border-primary shadow-md ring-2 ring-primary/20 scale-[1.02]' 
                                : 'bg-white border-secondary/30 text-foreground hover:border-primary/60 hover:bg-primary/5 hover:text-primary shadow-sm'
                            )}
                            onClick={() => setSelectedSlot(slotObj.raw)}
                          >
                            <Clock className={cn("w-3.5 h-3.5", isSelected ? "text-white" : "text-primary/60")} />
                            {slotObj.label}
                          </Button>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= FIXED FOOTER ================= */}
        <div className="shrink-0 p-4 sm:p-5 bg-white border-t border-border/40 relative z-10 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.03)]">
          {step === 1 ? (
            <div className="space-y-2">
              <Button 
                type="button"
                onClick={handleNextStep}
                className="w-full bg-gradient-to-r from-primary to-[#5a0606] hover:from-[#5a0606] hover:to-primary text-white h-12 rounded-xl shadow-md shadow-primary/20 transition-all duration-300 text-sm font-semibold relative overflow-hidden group"
              >
                <span className="flex items-center justify-center gap-2 relative z-10">
                  Next: Choose Date & Time
                  <ChevronRight className="w-4 h-4" />
                </span>
              </Button>
              <p className="text-center text-[10px] sm:text-[11px] text-foreground/40 font-medium tracking-wide uppercase">
                Your information is 100% secure and confidential
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="h-12 px-5 rounded-xl bg-secondary/15 text-primary border border-secondary/40 font-bold hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 text-xs flex items-center shadow-sm group"
                >
                  <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" />
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedSlot}
                  className="flex-1 bg-gradient-to-r from-primary to-[#5a0606] hover:from-[#5a0606] hover:to-primary text-white h-12 rounded-xl shadow-md shadow-primary/20 transition-all duration-300 text-sm font-semibold relative overflow-hidden group disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing Payment...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      {(() => {
                        const pricing = mapServiceToPricing(service);
                        const price = getPriceInRupees(pricing.serviceId, pricing.variant);
                        return price ? `Confirm & Pay ${formatINR(price)}` : "Confirm & Pay Fee";
                      })()}
                      <Sparkles className="w-4 h-4 opacity-70" />
                    </span>
                  )}
                </Button>
              </div>
              <p className="text-center text-[10px] sm:text-[11px] text-foreground/40 font-medium tracking-wide uppercase">
                Your information is 100% secure and confidential
              </p>
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
