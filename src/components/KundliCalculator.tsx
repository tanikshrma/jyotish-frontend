import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { KundliBook } from "./KundliBook";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Loader2, Download, Printer, CalendarIcon, Clock, MapPin, X, ArrowRight, Lock, Sparkles, CheckCircle2, ShieldCheck, FileText, Star, Eye } from "lucide-react";
import { toast } from "sonner";
import { vedicAstroApi } from "@/lib/vedicAstroApi";
import { postTrackingEvent } from "@/lib/tracking";
import { submitProspectIQLead } from "@/lib/prospectiq";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { loadRazorpayScript, createOrder, verifyPayment } from "@/lib/razorpay";
import { formatDobForApi, formatFullLocationName } from "./CalculatorForm";
import { DateInputField, TimeInputField } from "./FormDateInput";
import { generateNorthIndianChartSvg } from "./KundliBook";

export function KundliCalculator() {
  const navigate = useNavigate();
  const location = useLocation();

  const [generationStep, setGenerationStep] = useState<'idle' | 'loading' | 'teaser' | 'cover' | 'book'>('idle');
  const [isPaid, setIsPaid] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [kundliData, setKundliData] = useState<any>(location.state?.kundliData || null);
  
  const [formData, setFormData] = useState({
    name: location.state?.formData?.name || '',
    phone: location.state?.formData?.phone || '',
    email: location.state?.formData?.email || '',
    gender: location.state?.formData?.gender || '',
    dob: location.state?.formData?.dob || '',
    tob: location.state?.formData?.tob || '',
    pob: location.state?.formData?.pob || ''
  });

  const [date, setDate] = useState<Date | undefined>(
    location.state?.formData?.dob ? new Date(location.state.formData.dob) : undefined
  );
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    date || new Date()
  );
  
  const [timeState, setTimeState] = useState({
    hour: location.state?.formData?.tob ? location.state.formData.tob.split(':')[0] : '12',
    minute: location.state?.formData?.tob ? location.state.formData.tob.split(':')[1] : '00',
  });

  const [locationSearch, setLocationSearch] = useState(location.state?.formData?.pob || '');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (location.state?.kundliData) {
      setKundliData(location.state.kundliData);
      setGenerationStep('book');
      // Clear state so refresh doesn't keep it forever if not wanted, but actually keeping it is fine.
    } else if (location.state?.autoSubmit && location.state?.formData) {
      // Clear autoSubmit so it doesn't loop
      navigate(location.pathname, { replace: true, state: {} });
      handleSubmit(null, location.state.formData);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (generationStep !== 'idle') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [generationStep]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (locationSearch.length > 2 && locationSearch !== formData.pob) {
        setIsSearchingLocation(true);
        try {
          const res = await vedicAstroApi.geoSearch(locationSearch);
          if (res?.response) {
            setLocationResults(res.response);
            setShowLocationDropdown(true);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearchingLocation(false);
        }
      } else {
        setLocationResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [locationSearch]);

  const validateForm = (dataToValidate = formData) => {
    const newErrors: { [key: string]: string } = {};
    if (!dataToValidate.name?.trim()) newErrors.name = "Name is required";
    if (!dataToValidate.phone?.trim()) newErrors.phone = "Phone is required";
    if (!dataToValidate.email?.trim()) newErrors.email = "Email is required";
    if (!dataToValidate.gender) newErrors.gender = "Gender is required";
    if (!date && !dataToValidate.dob) newErrors.dob = "Date of Birth is required";
    if (!dataToValidate.pob?.trim()) newErrors.pob = "Place of Birth is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent | null, dataToSubmit = formData) => {
    e?.preventDefault?.();
    
    if (!validateForm(dataToSubmit)) {
      return;
    }

    if (date) {
      dataToSubmit.dob = format(date, 'yyyy-MM-dd');
    }

    submitProspectIQLead({
      firstName: dataToSubmit.name.split(' ')[0] || dataToSubmit.name,
      lastName: dataToSubmit.name.split(' ').slice(1).join(' ') || '',
      email: dataToSubmit.email,
      phone: dataToSubmit.phone,
      gender: dataToSubmit.gender,
      dateOfBirth: dataToSubmit.dob,
      timeOfBirth: dataToSubmit.tob,
      placeOfBirth: dataToSubmit.pob,
      service: 'kundli',
      tags: ['Free Kundli Lead', 'Kundli Calculator'],
    });

    // 1. Post lead to CRM immediately so no lead is EVER lost
    const trackingPayload = {
      type: "external_form_submission",
      timestamp: Date.now(),
      formId: "Kundli Calculator",
      formData: {
        first_name: dataToSubmit.name.split(' ')[0] || dataToSubmit.name,
        last_name: dataToSubmit.name.split(' ').slice(1).join(' ') || '',
        email: dataToSubmit.email,
        phone: dataToSubmit.phone,
        gender: dataToSubmit.gender,
        date_of_birth: dataToSubmit.dob,
      },
      formLabels: {
        first_name: "First Name",
        last_name: "Last Name",
        email: "Email",
        phone: "Phone",
        gender: "Gender",
        date_of_birth: "Date of Birth",
      },
      url: window.location.href,
      title: document.title,
      path: window.location.pathname,
      userAgent: navigator.userAgent,
      trackingId: "tk_1f4f60a82c8f4c5588febd8434e0192a",
      locationId: "FTD8wmuYqCT7XoIpXJQG",
      sessionId: crypto.randomUUID(),
      properties: {
        deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
      },
    };

    const customFields = {
      't3toxS3cJRwOlgJLnGIv': { value: dataToSubmit.tob, label: 'Time of Birth' },
      'pqLHdWbD2bpUsdE103I0': { value: dataToSubmit.pob, label: 'Place of Birth' },
      'GQbW8PBfcMus3Opakqn0': { value: 'kundli', label: 'Service' }
    };

    postTrackingEvent(trackingPayload, { customFields });
    console.log("✅ Kundli Lead captured & submitted to CRM:", trackingPayload);

    if (location.pathname !== '/free-kundli') {
      navigate('/free-kundli', { state: { formData: dataToSubmit, autoSubmit: true } });
      return;
    }

    setGenerationStep('loading');
    setLoadingProgress(0);
    
    const loadingMessages = [
      "Calculating Planetary Positions...",
      "Preparing Birth Chart...",
      "Generating Lagna Chart...",
      "Calculating Navamsa...",
      "Analyzing Yogas...",
      "Checking Doshas...",
      "Calculating Mahadasha...",
      "Preparing Personalized Report..."
    ];
    
    let msgIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[msgIndex]);
    }, 800);

    const progressSteps = [0, 15, 30, 48, 63, 79, 91, 100];
    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < progressSteps.length) {
        setLoadingProgress(progressSteps[stepIndex]);
      }
    }, 500);

    const minTimePromise = new Promise(resolve => setTimeout(resolve, 3500));
    
    try {
      // 1. Get Coordinates
      const geoData = await vedicAstroApi.geoSearch(formData.pob);
      let lat = 28.6139, lon = 77.2090, tz = 5.5;

      if (geoData.response && geoData.response.length > 0) {
        const location = geoData.response[0];
        if (location.lat !== undefined) lat = location.lat;
        if (location.lon !== undefined) lon = location.lon;
        if (location.latitude !== undefined) lat = location.latitude;
        if (location.longitude !== undefined) lon = location.longitude;
        
        if (location.coordinates) {
          if (typeof location.coordinates === 'string') {
            lat = parseFloat(location.coordinates.split(',')[0]);
            lon = parseFloat(location.coordinates.split(',')[1]);
          } else if (Array.isArray(location.coordinates)) {
            lat = parseFloat(location.coordinates[0]);
            lon = parseFloat(location.coordinates[1]);
          } else if (typeof location.coordinates === 'object') {
            lat = parseFloat(location.coordinates.lat || location.coordinates.latitude || lat);
            lon = parseFloat(location.coordinates.lon || location.coordinates.longitude || lon);
          }
        }
        tz = location.tz || location.timezone || 5.5;
      }

      const formattedDob = formatDobForApi(formData.dob, date);
      const params = { dob: formattedDob, tob: formData.tob, lat, lon, tz };

      // 2. Fetch all data in parallel
      const [panchang, planets, d1North, d1South, d9North, doshas, yogas, dasha, lucky, planetReport] = await Promise.all([
        vedicAstroApi.getPanchang(params).catch(() => null),
        vedicAstroApi.getPlanetDetails(params).catch(() => null),
        vedicAstroApi.getChart(params, 'D1', 'north').catch(() => null),
        vedicAstroApi.getChart(params, 'D1', 'south').catch(() => null),
        vedicAstroApi.getChart(params, 'D9', 'north').catch(() => null),
        vedicAstroApi.getDoshas(params).catch(() => null),
        vedicAstroApi.getYogas(params).catch(() => null),
        vedicAstroApi.getDasha(params).catch(() => null),
        vedicAstroApi.getLuckyDetails(params).catch(() => null),
        vedicAstroApi.getPlanetReport(params).catch(() => null),
      ]);

      const getChartSvgString = (chartRes: any): string => {
        if (!chartRes) return '';
        let rawStr = '';
        if (typeof chartRes === 'string') rawStr = chartRes;
        else if (typeof chartRes?.response === 'string') rawStr = chartRes.response;
        else if (typeof chartRes?.svg === 'string') rawStr = chartRes.svg;
        else if (typeof chartRes?.data === 'string') rawStr = chartRes.data;

        if (rawStr && rawStr.trim().toLowerCase().startsWith('<svg')) {
          return rawStr;
        }
        return '';
      };

      setKundliData({
        user: dataToSubmit,
        panchang: panchang?.response || panchang,
        planets: Array.isArray(planets?.response) ? planets.response : (Array.isArray(planets) ? planets : (planets?.response ? Object.values(planets.response) : [])),
        charts: {
          d1North: getChartSvgString(d1North),
          d1South: getChartSvgString(d1South),
          d9North: getChartSvgString(d9North)
        },
        doshas,
        yogas: yogas?.response || yogas,
        dasha: dasha?.response || dasha,
        lucky: lucky?.response || lucky,
        planetReport: planetReport?.response || planetReport
      });

      await minTimePromise;
      setLoadingProgress(100);
      
      setTimeout(() => {
        setGenerationStep('teaser');
      }, 500);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate Kundli. Please try again.");
      setGenerationStep('idle');
    } finally {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    }
  };

  return (
    <>
      {generationStep === 'loading' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/5 backdrop-blur-[18px] flex flex-col items-center justify-center p-4 transition-all duration-500">
          <div className="text-center max-w-3xl w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <style>{`
              @keyframes dots {
                0% { content: ''; }
                25% { content: '.'; }
                50% { content: '..'; }
                75% { content: '...'; }
                100% { content: ''; }
              }
              .loading-dots::after {
                content: '';
                animation: dots 2s infinite;
              }
            `}</style>
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-4 font-medium drop-shadow-2xl" style={{ textShadow: "0 2px 15px rgba(0,0,0,0.5)" }}>
              Generating your Personalized Kundli<span className="loading-dots inline-block w-8 text-left"></span>
            </h2>
          </div>
        </div>,
        document.body
      )}

      {(generationStep === 'cover' || generationStep === 'book') && kundliData && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/5 backdrop-blur-[18px] overflow-hidden animate-in fade-in duration-700 print:static print:overflow-visible print:p-0 print:bg-transparent print:backdrop-blur-none"
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-700 print:max-w-none print:h-auto print:max-h-none print:shadow-none print:border-none print:rounded-none print:overflow-visible print:bg-transparent print:transform-none print:animate-none">
            <KundliBook kundliData={kundliData} step={generationStep} onOpenBook={() => setGenerationStep('book')} onClose={() => { setGenerationStep('idle'); setKundliData(null); }} />
          </div>
        </div>,
        document.body
      )}

      <div className="relative max-w-4xl mx-auto p-4">
        <Card className="bg-[#FFFDF9] border border-secondary/30 rounded-2xl p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden h-full">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>
          <CardContent className="p-0 relative z-10">
            <div className="text-center mb-10">
              <h3 className="text-3xl md:text-4xl font-bold font-serif text-primary mb-4">Kundli Calculator</h3>
              <p className="text-foreground/70 text-lg">Enter the details below to generate your premium report.</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Full Name */}
                <div className="space-y-2 relative group">
                  <Label htmlFor="name" className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-primary transition-colors">Full Name</Label>
                  <Input id="name" placeholder="Enter your full name" className={cn("h-14 px-4 rounded-xl border border-border/60 bg-white text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base sm:text-lg hover:border-primary/60 placeholder:text-muted-foreground/60", errors.name && "border-destructive")} value={formData.name} onChange={e => {setFormData({...formData, name: e.target.value}); setErrors({...errors, name: ''})}} />
                  {errors.name && <p className="text-destructive text-xs absolute -bottom-5">{errors.name}</p>}
                </div>
                
                {/* Phone Number */}
                <div className="space-y-2 relative group">
                  <Label htmlFor="phone" className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-primary transition-colors">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="Enter your phone number" className={cn("h-14 px-4 rounded-xl border border-border/60 bg-white text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base sm:text-lg hover:border-primary/60 placeholder:text-muted-foreground/60", errors.phone && "border-destructive")} value={formData.phone} onChange={e => {setFormData({...formData, phone: e.target.value}); setErrors({...errors, phone: ''})}} />
                  {errors.phone && <p className="text-destructive text-xs absolute -bottom-5">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2 relative group">
                  <Label htmlFor="email" className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-primary transition-colors">Email Address</Label>
                  <Input id="email" type="email" placeholder="Enter your email" className={cn("h-14 px-4 rounded-xl border border-border/60 bg-white text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base sm:text-lg hover:border-primary/60 placeholder:text-muted-foreground/60", errors.email && "border-destructive")} value={formData.email} onChange={e => {setFormData({...formData, email: e.target.value}); setErrors({...errors, email: ''})}} />
                  {errors.email && <p className="text-destructive text-xs absolute -bottom-5">{errors.email}</p>}
                </div>

                {/* Gender */}
                <div className="space-y-2 relative group">
                  <Label htmlFor="gender" className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-primary transition-colors">Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => {setFormData({...formData, gender: v}); setErrors({...errors, gender: ''})}}>
                    <SelectTrigger className={cn("h-14 px-4 rounded-xl border border-border/60 bg-white text-foreground shadow-sm hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base sm:text-lg", errors.gender && "border-destructive", !formData.gender && "text-muted-foreground/60")}>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-border/60 rounded-xl shadow-xl">
                      <SelectItem value="male" className="text-foreground focus:bg-primary/5 focus:text-primary cursor-pointer">Male</SelectItem>
                      <SelectItem value="female" className="text-foreground focus:bg-primary/5 focus:text-primary cursor-pointer">Female</SelectItem>
                      <SelectItem value="other" className="text-foreground focus:bg-primary/5 focus:text-primary cursor-pointer">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-destructive text-xs absolute -bottom-5">{errors.gender}</p>}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2 relative group flex flex-col">
                  <Label htmlFor="dob" className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-primary transition-colors">Date of Birth</Label>
                  <DateInputField
                    date={date}
                    onDateChange={(d, formattedStr) => {
                      setDate(d);
                      setFormData(prev => ({ ...prev, dob: formattedStr }));
                      setErrors(prev => ({ ...prev, dob: '' }));
                    }}
                    calendarMonth={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    error={errors.dob}
                  />
                  {errors.dob && <p className="text-destructive text-xs absolute -bottom-5">{errors.dob}</p>}
                </div>
                
                {/* Time of Birth */}
                <div className="space-y-2 relative group flex flex-col">
                  <Label htmlFor="tob" className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-primary transition-colors">Time of Birth</Label>
                  <TimeInputField
                    time={timeState}
                    onTimeChange={(newTime) => {
                      setTimeState(newTime);
                      setFormData(prev => ({ ...prev, tob: `${newTime.hour}:${newTime.minute}` }));
                      setErrors(prev => ({ ...prev, tob: '' }));
                    }}
                  />
                  {errors.tob && <p className="text-destructive text-xs absolute -bottom-5">{errors.tob}</p>}
                </div>

                {/* Place of Birth */}
                <div className="space-y-2 relative group flex flex-col md:col-span-2" ref={locationRef}>
                  <Label htmlFor="pob" className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-secondary transition-colors">Place of Birth</Label>
                  <div className="relative">
                    <Input 
                      id="pob" 
                      placeholder="Search city, state, or country..." 
                      className={cn("h-14 px-4 pr-10 rounded-xl border border-border/50 bg-background/50 text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary/20 focus-visible:border-secondary transition-all text-lg hover:border-secondary/50 placeholder:text-foreground/40", errors.pob && "border-destructive")}
                      value={locationSearch} 
                      onChange={e => {
                        setLocationSearch(e.target.value);
                        setFormData({...formData, pob: e.target.value});
                        setErrors({...errors, pob: ''});
                      }} 
                      onFocus={() => {
                        if (locationResults.length > 0) setShowLocationDropdown(true);
                      }}
                      autoComplete="off"
                    />
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary pointer-events-none" />
                    {isSearchingLocation && (
                      <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-secondary" />
                    )}
                  </div>
                  
                  {showLocationDropdown && locationResults.length > 0 && (
                    <div className="absolute z-50 w-full top-full mt-2 bg-background border border-border/50 rounded-xl shadow-xl max-h-[250px] overflow-y-auto overflow-hidden custom-scrollbar">
                      {locationResults.map((loc, i) => {
                        const fullLocName = formatFullLocationName(loc);
                        return (
                          <div 
                            key={i} 
                            className="px-5 py-3 hover:bg-primary/5 hover:text-primary cursor-pointer transition-colors text-base border-b border-border/10 last:border-0 group text-foreground"
                            onClick={() => {
                              setLocationSearch(fullLocName);
                              setFormData({...formData, pob: fullLocName});
                              setShowLocationDropdown(false);
                            }}
                          >
                            <p className="font-bold group-hover:text-primary">{loc.place_name || loc.name || loc.address}</p>
                            {(loc.state || loc.country) && (
                              <p className="text-sm text-foreground/70 group-hover:text-primary/80">
                                {[loc.state, loc.country].filter(Boolean).join(', ')}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {errors.pob && <p className="text-destructive text-xs absolute -bottom-5">{errors.pob}</p>}
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={generationStep !== 'idle'} className="w-full h-14 bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 text-white rounded-xl text-lg font-bold shadow-[0_8px_20px_-6px_rgba(122,8,8,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 relative overflow-hidden group">
                  <div className="absolute top-0 -left-[100%] w-[120%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:left-[200%] transition-all duration-1000 ease-in-out pointer-events-none" />
                  <span className="relative z-10 flex items-center justify-center">
                    {generationStep !== 'idle' ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Generating Kundli...
                      </>
                    ) : (
                      <>
                        Calculate Now
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ================= FREEMIUM 1-PAGE TEASER MODAL ================= */}
      {generationStep === 'teaser' && kundliData && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-white border border-secondary/40 rounded-3xl shadow-2xl overflow-hidden my-auto relative">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-primary via-[#5a0606] to-primary text-white p-6 sm:p-8 text-center relative overflow-hidden">
              <button 
                onClick={() => setGenerationStep('idle')} 
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Free Vedic Astrological Teaser
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-2">
                {kundliData.user.name}'s Birth Chart Overview
              </h2>
              <p className="text-white/80 text-sm sm:text-base font-light">
                Birth Details: {kundliData.user.dob} • {kundliData.user.tob} • {kundliData.user.pob}
              </p>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 pb-24 sm:pb-28 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              {/* Basic Astro Summary Badges */}
              {(() => {
                const planetsList = Array.isArray(kundliData?.planets)
                  ? kundliData.planets
                  : (typeof kundliData?.planets === 'object' && kundliData?.planets !== null ? Object.values(kundliData.planets) : []);
                
                const moonPlanet = planetsList.find((p: any) => p?.name === "Moon" || p?.planet === "Moon");
                const sunPlanet = planetsList.find((p: any) => p?.name === "Sun" || p?.planet === "Sun");
                const lagnaPlanet = planetsList.find((p: any) => p?.name === "Ascendant" || p?.name === "Lagna" || p?.planet === "Ascendant") || planetsList[0];

                const moonSign = kundliData?.panchang?.moon_sign || moonPlanet?.zodiac || moonPlanet?.sign || "Calculated";
                const sunSign = sunPlanet?.zodiac || sunPlanet?.sign || "Calculated";
                const lagnaSign = lagnaPlanet?.zodiac || lagnaPlanet?.sign || "Calculated";
                const nakshatra = kundliData?.panchang?.nakshatra || "Pushya";

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-secondary/10 border border-secondary/30 p-4 rounded-2xl text-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Ascendant (Lagna)</span>
                      <span className="text-lg font-serif font-bold text-primary">
                        {lagnaSign}
                      </span>
                    </div>
                    <div className="bg-secondary/10 border border-secondary/30 p-4 rounded-2xl text-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Rashi (Moon Sign)</span>
                      <span className="text-lg font-serif font-bold text-primary">
                        {moonSign}
                      </span>
                    </div>
                    <div className="bg-secondary/10 border border-secondary/30 p-4 rounded-2xl text-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Nakshatra</span>
                      <span className="text-lg font-serif font-bold text-primary">
                        {nakshatra}
                      </span>
                    </div>
                    <div className="bg-secondary/10 border border-secondary/30 p-4 rounded-2xl text-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Sun Sign</span>
                      <span className="text-lg font-serif font-bold text-primary">
                        {sunSign}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* D1 Lagna Chart Preview & Consultation Banner */}
              {(() => {
                const planetsList = Array.isArray(kundliData?.planets)
                  ? kundliData.planets
                  : (typeof kundliData?.planets === 'object' && kundliData?.planets !== null ? Object.values(kundliData.planets) : []);
                const lagnaPlanet = planetsList.find((p: any) => p?.name === "Ascendant" || p?.name === "Lagna" || p?.planet === "Ascendant") || planetsList[0];
                const lagnaSign = lagnaPlanet?.zodiac || lagnaPlanet?.sign || "Aries";

                const chartSvg = kundliData?.charts?.d1North && kundliData.charts.d1North.trim().startsWith('<svg')
                  ? kundliData.charts.d1North
                  : generateNorthIndianChartSvg(planetsList, 'd1', lagnaSign);

                return (
                  <div className="space-y-6">
                    <div className="bg-[#FFFDF9] border border-secondary/20 p-6 rounded-2xl text-center shadow-inner">
                      <h4 className="font-serif font-bold text-primary text-xl mb-4 flex items-center justify-center gap-2">
                        <Star className="w-5 h-5 text-secondary" /> D1 Lagna Chart (Basic Preview)
                      </h4>
                      <div 
                        className="w-full max-w-[340px] mx-auto flex items-center justify-center border border-secondary/30 rounded-xl p-3 bg-white shadow-sm"
                        dangerouslySetInnerHTML={{ __html: chartSvg }}
                      />
                    </div>

                    {/* Book Astrologer Consultation Option */}
                    <div className="bg-gradient-to-r from-amber-500/10 via-primary/5 to-amber-500/10 border border-secondary/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-11 h-11 rounded-full bg-secondary/20 flex items-center justify-center text-primary shrink-0">
                          <Sparkles className="w-6 h-6 text-secondary fill-secondary" />
                        </div>
                        <div>
                          <h5 className="font-serif font-bold text-primary text-base sm:text-lg">Need In-Depth Personal Chart Guidance?</h5>
                          <p className="text-xs sm:text-sm text-foreground/70">Connect 1-on-1 with our Senior Vedic Astrologers to discuss remedies, dashas & timings.</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setGenerationStep('idle');
                          navigate('/get-consultation');
                        }}
                        className="bg-secondary hover:bg-secondary/90 text-primary font-bold px-6 h-12 rounded-xl text-sm shadow-md shrink-0 whitespace-nowrap flex items-center gap-2"
                      >
                        <CalendarIcon className="w-4 h-4" /> Book Consultation Now
                      </Button>
                    </div>
                  </div>
                );
              })()}

              {/* Locked Teaser Cards with Suspense */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                    <Lock className="w-5 h-5 text-secondary" /> Lifetime Predictions & Detailed Analysis
                  </h3>
                  <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/30">
                    Premium Insights Locked
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  
                  {/* Blurred Card 1 */}
                  <div className="relative border border-secondary/30 rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-secondary/10 overflow-hidden group">
                    <div className="filter blur-[4px] opacity-40 select-none space-y-2 pointer-events-none">
                      <h4 className="font-bold text-base">10-Year Mahadasha Timeline (2026-2035)</h4>
                      <p className="text-xs">Your current Rahu-Jupiter dasha influences wealth and status. Major career transformation window opens in late 2026...</p>
                      <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-[3px] text-white text-center">
                      <Lock className="w-6 h-6 text-secondary mb-2" />
                      <span className="font-bold text-sm">10-Year Mahadasha Predictions</span>
                      <span className="text-[11px] text-white/80">Unlock exact dates of favorable periods</span>
                    </div>
                  </div>

                  {/* Blurred Card 2 */}
                  <div className="relative border border-secondary/30 rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-secondary/10 overflow-hidden group">
                    <div className="filter blur-[4px] opacity-40 select-none space-y-2 pointer-events-none">
                      <h4 className="font-bold text-base">Career, Wealth & Financial Timing</h4>
                      <p className="text-xs">10th house Saturn indicates delayed success turning into massive permanent stability after age 30...</p>
                      <div className="h-4 bg-primary/20 rounded w-2/3"></div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-[3px] text-white text-center">
                      <Lock className="w-6 h-6 text-secondary mb-2" />
                      <span className="font-bold text-sm">Career & Financial Timing</span>
                      <span className="text-[11px] text-white/80">Unlock business vs job suitability</span>
                    </div>
                  </div>

                  {/* Blurred Card 3 */}
                  <div className="relative border border-secondary/30 rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-secondary/10 overflow-hidden group">
                    <div className="filter blur-[4px] opacity-40 select-none space-y-2 pointer-events-none">
                      <h4 className="font-bold text-base">Marriage & Relationship Compatibility</h4>
                      <p className="text-xs">7th house lord in 9th house brings high spiritual alignment and marriage with a supportive partner...</p>
                      <div className="h-4 bg-primary/20 rounded w-4/5"></div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-[3px] text-white text-center">
                      <Lock className="w-6 h-6 text-secondary mb-2" />
                      <span className="font-bold text-sm">Marriage & Love Life Timing</span>
                      <span className="text-[11px] text-white/80">Unlock partner traits & marriage age</span>
                    </div>
                  </div>

                  {/* Blurred Card 4 */}
                  <div className="relative border border-secondary/30 rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-secondary/10 overflow-hidden group">
                    <div className="filter blur-[4px] opacity-40 select-none space-y-2 pointer-events-none">
                      <h4 className="font-bold text-base">Dosha Analysis & Vedic Remedies</h4>
                      <p className="text-xs">Manglik status, Kaal Sarp check, and customized gemstone recommendations for peace and prosperity...</p>
                      <div className="h-4 bg-primary/20 rounded w-1/2"></div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-[3px] text-white text-center">
                      <Lock className="w-6 h-6 text-secondary mb-2" />
                      <span className="font-bold text-sm">Doshas & Gemstone Remedies</span>
                      <span className="text-[11px] text-white/80">Unlock effective remedies & lucky stones</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Sticky Action Footer */}
            <div className="p-6 bg-[#FFFDF9] border-t border-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block">Full Lifetime Kundli + PDF Report</span>
                <span className="text-2xl font-serif font-bold text-primary">Special Unlock Price: ₹999</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button 
                  onClick={() => setGenerationStep('cover')}
                  variant="outline"
                  className="w-full sm:w-auto border-secondary/40 text-primary hover:bg-secondary/10 rounded-xl h-12 px-6 font-bold"
                >
                  <Eye className="w-4 h-4 mr-2" /> Preview Cover
                </Button>

                <Button 
                  onClick={async () => {
                    setIsUnlocking(true);
                    try {
                      await loadRazorpayScript();
                      const order = await createOrder({
                        service: "consultation-call",
                        variant: "default",
                        notes: {
                          type: "Full Kundli Unlock",
                          name: kundliData.user.name,
                          email: kundliData.user.email,
                          phone: kundliData.user.phone,
                        }
                      });

                      if (!window.Razorpay) throw new Error("Razorpay unavailable");

                      const checkout = new window.Razorpay({
                        key: order.key_id,
                        amount: order.amount,
                        currency: order.currency,
                        name: "JyotishNow Full Kundli Unlock",
                        description: `Full Lifetime Kundli Report for ${kundliData.user.name}`,
                        order_id: order.order_id,
                        prefill: {
                          name: kundliData.user.name,
                          email: kundliData.user.email,
                          contact: kundliData.user.phone,
                        },
                        theme: { color: "#7A0808" },
                        handler: async (resp: any) => {
                          try {
                            await verifyPayment(resp);
                            setIsPaid(true);
                            setGenerationStep('book');
                            toast.success("Full Kundli Report Unlocked!", {
                              icon: <Sparkles className="w-5 h-5 text-secondary" />
                            });
                          } catch (e: any) {
                            toast.error("Payment verification failed", { description: e.message });
                          } finally {
                            setIsUnlocking(false);
                          }
                        },
                        modal: {
                          ondismiss: () => {
                            setIsUnlocking(false);
                          }
                        }
                      });

                      checkout.open();
                    } catch (e: any) {
                      setIsUnlocking(false);
                      toast.error("Unlock Error", { description: e.message });
                    }
                  }}
                  disabled={isUnlocking}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-[#5a0606] hover:opacity-90 text-white rounded-xl h-12 px-8 font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  {isUnlocking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Unlocking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-secondary fill-secondary" /> Unlock Full Kundli (₹999)
                    </>
                  )}
                </Button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}