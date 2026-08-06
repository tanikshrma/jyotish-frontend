import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Sparkles, Moon, Star, Palette, Hash, CalendarIcon as Calendar, MapPin, Clock, History, Trash2, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { vedicAstroApi } from "@/lib/vedicAstroApi";
import { postTrackingEvent } from "@/lib/tracking";
import { submitProspectIQLead } from "@/lib/prospectiq";

// Mock interface for the API response
interface AstroReport {
  id: string;
  timestamp: number;
  dob: string;
  tob: string;
  pob: string;
  nakshatra: string;
  nakshatraLord: string;
  rashi: string;
  rashiLord: string;
  moonSign: string;
  startingLetters: string[];
  luckyNumber: number;
  luckyColor: string;
  traits: string;
  recommendedNames: string[];
}

export const BabyNameGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AstroReport | null>(null);
  const [savedReports, setSavedReports] = useState<AstroReport[]>(() => {
    const saved = localStorage.getItem('baby_name_reports');
    return saved ? JSON.parse(saved) : [];
  });
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', dob: '', tob: '', pob: '' });

  const [date, setDate] = useState<Date | undefined>();
  const [timeState, setTimeState] = useState({ hour: '12', minute: '00' });
  
  const [locationSearch, setLocationSearch] = useState('');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!date) newErrors.dob = "Date of Birth is required";
    if (!formData.pob) newErrors.pob = "Place of Birth is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
    localStorage.setItem('baby_name_reports', JSON.stringify(savedReports));
  }, [savedReports]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    
    const finalDob = date ? format(date, 'yyyy-MM-dd') : formData.dob;
    const finalTob = `${timeState.hour}:${timeState.minute}`;

    try {
      // 1. Get Geo Details
      const geoRes = await fetch(`https://api.vedicastroapi.com/v3-json/utilities/geo-search?api_key=d2c18f93-e2dd-554c-9232-b586c646bc13&city=${encodeURIComponent(formData.pob)}`);
      const geoData = await geoRes.json();
      
      if (!geoData.response || geoData.response.length === 0) {
        throw new Error("Could not find coordinates for the given place of birth.");
      }
      
      const location = geoData.response[0];
      let lat = 28.6139;
      let lon = 77.2090;
      
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
      
      if (isNaN(lat)) lat = 28.6139;
      if (isNaN(lon)) lon = 77.2090;
      const tz = location.tz || location.timezone || 5.5;

      // Format dob: DD/MM/YYYY
      const [year, month, day] = finalDob.split('-');
      const formattedDob = `${day}/${month}/${year}`;

      // 2. Get Panchang for Nakshatra, Rashi
      const panchangRes = await fetch(`https://api.vedicastroapi.com/v3-json/panchang/panchang?api_key=d2c18f93-e2dd-554c-9232-b586c646bc13&dob=${formattedDob}&tob=${finalTob}&lat=${lat}&lon=${lon}&tz=${tz}&lang=en`);
      const panchangData = await panchangRes.json();
      
      if (panchangData.status !== 200) {
        throw new Error(panchangData.message || panchangData.error || "Failed to fetch Panchang data from API.");
      }
      
      const p = panchangData.response;

      // 3. Get Planet details for Ascendant
      const planetRes = await fetch(`https://api.vedicastroapi.com/v3-json/horoscope/planet-details?api_key=d2c18f93-e2dd-554c-9232-b586c646bc13&dob=${formattedDob}&tob=${finalTob}&lat=${lat}&lon=${lon}&tz=${tz}&lang=en`);
      const planetData = await planetRes.json();
      
      if (planetData.status !== 200) {
        throw new Error(planetData.message || planetData.error || "Failed to fetch Planet data from API.");
      }

      const moonSign = p.moon_sign || planetData.response.find((pl: any) => pl.name === "Moon")?.zodiac || "Unknown";
      
      // Starting letters based on Nakshatra Pada
      const lettersStr = p.nakshatra_pada_letters || "A, I, U, E";
      const startingLetters = lettersStr.split(',').map((l: string) => l.trim());

      const newReport: AstroReport = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        dob: finalDob,
        tob: finalTob,
        pob: formData.pob,
        nakshatra: p.nakshatra || "Unknown",
        nakshatraLord: p.nakshatra_lord || "Unknown",
        rashi: p.moon_sign || "Unknown",
        rashiLord: p.moon_sign_lord || "Unknown",
        moonSign: moonSign,
        startingLetters: startingLetters,
        luckyNumber: Math.floor(Math.random() * 9) + 1, // API might not give this directly in panchang
        luckyColor: "White/Silver", // Fallback
        traits: "Creative, stable, reliable, and deeply affectionate.",
        recommendedNames: ["Aarav", "Ishaan", "Aadhya", "Uma", "Eshaan", "Advik"]
      };
      
      // Save lead to Prospect IQ CRM
      submitProspectIQLead({
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formattedDob,
        timeOfBirth: finalTob,
        placeOfBirth: formData.pob,
        service: 'Baby Name Generator',
        tags: ['Baby Name Generator', 'Service: babyname'],
      });

      // Tracking
      const trackingPayload = {
        type: "external_form_submission",
        timestamp: Date.now(),
        formId: "Baby Name Generator Form",
        formData: {
          first_name: formData.name.split(' ')[0] || formData.name,
          last_name: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formattedDob,
        },
        formLabels: {
          first_name: "First Name",
          last_name: "Last Name",
          email: "Email",
          phone: "Phone",
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
        't3toxS3cJRwOlgJLnGIv': { value: finalTob, label: 'Time of Birth' },
        'pqLHdWbD2bpUsdE103I0': { value: formData.pob, label: 'Place of Birth' },
        'GQbW8PBfcMus3Opakqn0': { value: 'babyname', label: 'Service' }
      };

      postTrackingEvent(trackingPayload, { customFields });

      setReport(newReport);
      
      // Automatically save to local storage history
      setSavedReports(prev => [newReport, ...prev]);
      
      toast.success("Astrology calculations complete and saved to history!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (!report) return;
    const exists = savedReports.find(r => r.id === report.id);
    if (exists) {
      toast.info("Report already saved to history");
      return;
    }
    setSavedReports([report, ...savedReports]);
    toast.success("Report saved to history!");
  };

  const handleDelete = (id: string) => {
    setSavedReports(savedReports.filter(r => r.id !== id));
    toast.success("Report removed from history");
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="generator">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 no-print">
          <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6">
            Generate Your <span className="text-secondary">Baby Name Report</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Enter the birth details below to instantly calculate the most auspicious starting letters and astrological insights based on Vedic astrology.
          </p>
        </div>

        {!report ? (
          <Card className="max-w-2xl mx-auto bg-[#FFFDF9] border border-secondary/30 rounded-2xl p-2 md:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden no-print">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>
            <CardHeader className="pt-8">
              <CardTitle className="text-3xl font-serif font-bold text-primary text-center">Birth Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      className={cn("h-12 rounded-xl border-2 border-[#f5c27a]/50 bg-[#fdfbf7] text-[#7a0808] font-sans shadow-sm hover:border-[#f5c27a] focus-visible:ring-[#7a0808] focus-visible:border-[#f5c27a] transition-all duration-300 placeholder:text-[#7a0808]/50 text-base", errors.name && "border-destructive")}
                      style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
                      value={formData.name}
                      onChange={e => {setFormData({...formData, name: e.target.value}); setErrors({...errors, name: ''})}}
                    />
                    {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        className={cn("h-12 rounded-xl border-2 border-[#f5c27a]/50 bg-[#fdfbf7] text-[#7a0808] font-sans shadow-sm hover:border-[#f5c27a] focus-visible:ring-[#7a0808] focus-visible:border-[#f5c27a] transition-all duration-300 placeholder:text-[#7a0808]/50 text-base", errors.phone && "border-destructive")}
                        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
                        value={formData.phone}
                        onChange={e => {setFormData({...formData, phone: e.target.value}); setErrors({...errors, phone: ''})}}
                      />
                      {errors.phone && <p className="text-destructive text-sm">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        className={cn("h-12 rounded-xl border-2 border-[#f5c27a]/50 bg-[#fdfbf7] text-[#7a0808] font-sans shadow-sm hover:border-[#f5c27a] focus-visible:ring-[#7a0808] focus-visible:border-[#f5c27a] transition-all duration-300 placeholder:text-[#7a0808]/50 text-base", errors.email && "border-destructive")}
                        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
                        value={formData.email}
                        onChange={e => {setFormData({...formData, email: e.target.value}); setErrors({...errors, email: ''})}}
                      />
                      {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-12 px-4 rounded-xl border-2 border-[#f5c27a]/50 bg-[#fdfbf7] text-[#7a0808] font-sans shadow-sm hover:border-[#f5c27a] hover:shadow-[0_4px_15px_-3px_rgba(245,194,122,0.3)] transition-all duration-300 relative overflow-hidden", !date && "text-[#7a0808]/50", errors.dob && "border-destructive")} style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f5c27a]/5 to-transparent pointer-events-none" />
                          <Calendar className="mr-2 h-5 w-5 text-[#f5c27a] opacity-80 relative z-10" />
                          <span className="relative z-10">{date ? format(date, "PPP") : <span>Pick a date</span>}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={(d) => {setDate(d); setErrors({...errors, dob: ''})}}
                          initialFocus
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.dob && <p className="text-destructive text-sm">{errors.dob}</p>}
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="tob">Time of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-12 px-4 rounded-xl border-2 border-[#f5c27a]/50 bg-[#fdfbf7] text-[#7a0808] font-sans shadow-sm hover:border-[#f5c27a] hover:shadow-[0_4px_15px_-3px_rgba(245,194,122,0.3)] transition-all duration-300 relative overflow-hidden", errors.tob && "border-destructive")} style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f5c27a]/5 to-transparent pointer-events-none" />
                          <Clock className="mr-2 h-5 w-5 text-[#f5c27a] opacity-80 relative z-10" />
                          <span className="relative z-10">{timeState.hour}:{timeState.minute}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-6 rounded-2xl border-2 border-[#f5c27a]/60 bg-[#fdfbf7] shadow-[0_10px_30px_-5px_rgba(122,8,8,0.2)] font-sans" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} align="start">
                        <div className="flex gap-4">
                          <div className="flex flex-col gap-3">
                            <Label className="text-sm font-bold text-[#7a0808] text-center">Hour (24h)</Label>
                            <Select value={timeState.hour} onValueChange={(v) => {setTimeState({...timeState, hour: v}); setErrors({...errors, tob: ''})}}>
                              <SelectTrigger className="w-[90px] h-12 text-lg px-3">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="h-[200px]">
                                {Array.from({ length: 24 }).map((_, i) => {
                                  const val = i.toString().padStart(2, '0');
                                  return <SelectItem key={val} value={val}>{val}</SelectItem>;
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-3">
                            <Label className="text-sm font-bold text-[#7a0808] text-center">Minute</Label>
                            <Select value={timeState.minute} onValueChange={(v) => {setTimeState({...timeState, minute: v}); setErrors({...errors, tob: ''})}}>
                              <SelectTrigger className="w-[90px] h-12 text-lg px-3">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="h-[200px]">
                                {Array.from({ length: 60 }).map((_, i) => {
                                  const val = i.toString().padStart(2, '0');
                                  return <SelectItem key={val} value={val}>{val}</SelectItem>;
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {errors.tob && <p className="text-destructive text-sm">{errors.tob}</p>}
                  </div>
                </div>
                <div className="space-y-2 flex flex-col relative" ref={locationRef}>
                  <Label htmlFor="pob">Place of Birth (City, Country)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="pob" 
                      placeholder="e.g. New Delhi, India" 
                      className={cn("h-12 pl-10 rounded-xl border-2 border-[#f5c27a]/50 bg-[#fdfbf7] text-[#7a0808] font-sans shadow-sm hover:border-[#f5c27a] focus-visible:ring-[#7a0808] focus-visible:border-[#f5c27a] transition-all duration-300 placeholder:text-[#7a0808]/50 text-base", errors.pob && "border-destructive")} 
                      style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
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
                    {isSearchingLocation && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  
                  {showLocationDropdown && locationResults.length > 0 && (
                    <div className="absolute z-50 w-full top-full mt-2 bg-[#fdfbf7] border-2 border-[#f5c27a]/60 rounded-2xl shadow-[0_10px_30px_-5px_rgba(122,8,8,0.2)] max-h-[250px] overflow-y-auto font-sans overflow-hidden" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}>
                      {locationResults.map((loc, i) => (
                        <div 
                          key={i} 
                          className="px-5 py-3 hover:bg-[#7a0808] hover:text-[#f5c27a] cursor-pointer transition-colors text-base border-b border-[#f5c27a]/30 last:border-0 group text-[#7a0808]"
                          onClick={() => {
                            const locName = loc.place_name || loc.name || loc.address || '';
                            setLocationSearch(locName);
                            setFormData({...formData, pob: locName});
                            setShowLocationDropdown(false);
                          }}
                        >
                          <p className="font-bold group-hover:text-[#f5c27a]">{loc.place_name || loc.name}</p>
                          {loc.state && <p className="text-sm text-[#7a0808]/70 group-hover:text-[#f5c27a]/80">{loc.state}, {loc.country}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.pob && <p className="text-destructive text-sm">{errors.pob}</p>}
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Calculating Cosmic Alignments...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Free Report
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8" id="printable-report">
            {/* Report UI */}
            <div className="bg-card border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                    <Star className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif text-primary mb-4">Vedic Baby Name Analysis</h2>
                  <p className="text-muted-foreground">Generated by JyotishNow</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-6">
                    <h3 className="text-xl font-serif border-b border-border pb-2">Astrological Profile</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-secondary" />
                          <span className="font-medium">Nakshatra</span>
                        </div>
                        <span className="text-primary font-semibold">{report.nakshatra}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <Moon className="w-5 h-5 text-secondary" />
                          <span className="font-medium">Rashi (Moon Sign)</span>
                        </div>
                        <span className="text-primary font-semibold">{report.rashi}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-serif border-b border-border pb-2">Auspicious Elements</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <Hash className="w-5 h-5 text-secondary" />
                          <span className="font-medium">Lucky Number</span>
                        </div>
                        <span className="text-primary font-semibold">{report.luckyNumber}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <Palette className="w-5 h-5 text-secondary" />
                          <span className="font-medium">Lucky Colors</span>
                        </div>
                        <span className="text-primary font-semibold">{report.luckyColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <h3 className="text-xl font-serif border-b border-border pb-2 mb-6">Auspicious Starting Letters</h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {report.startingLetters.map((letter, i) => (
                      <div key={i} className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-serif shadow-lg">
                        {letter}
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-muted-foreground mt-4 text-sm">
                    Names starting with these letters will bring harmony, success, and good health.
                  </p>
                </div>

                <div className="bg-primary/5 rounded-3xl p-6 md:p-8 mb-8">
                  <h3 className="text-xl font-serif text-primary mb-4">Personality Traits</h3>
                  <p className="text-lg leading-relaxed">{report.traits}</p>
                </div>

                <div>
                  <h3 className="text-xl font-serif border-b border-border pb-2 mb-6">Sample Recommended Names</h3>
                  <div className="flex flex-wrap gap-3">
                    {report.recommendedNames.map((name, i) => (
                      <span key={i} className="px-4 py-2 rounded-full border border-primary/20 bg-background text-foreground font-medium shadow-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4 no-print">
              <Button onClick={() => setReport(null)} variant="outline" className="h-12 px-8">
                <Plus className="mr-2 h-5 w-5" />
                Generate Another
              </Button>
              <Button onClick={handlePrint} className="h-12 px-8 bg-primary hover:bg-primary/90">
                <Download className="mr-2 h-5 w-5" />
                Export as PDF
              </Button>
            </div>
          </div>
        )}

        {savedReports.length > 0 && (
          <div className="mt-24 no-print">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-serif text-primary">Saved Reports History</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-destructive"
                onClick={() => {
                  if (window.confirm("Clear all history?")) {
                    setSavedReports([]);
                    toast.success("History cleared");
                  }
                }}
              >
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedReports.map((saved) => (
                <Card key={saved.id} className="bg-white border border-border/40 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-primary/5 text-primary">
                        <History className="w-5 h-5" />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(saved.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(saved.dob).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {saved.pob}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Nakshatra</div>
                        <div className="font-serif text-primary">{saved.nakshatra}</div>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-muted hover:bg-primary hover:text-white transition-colors"
                      onClick={() => {
                        setReport(saved);
                        window.scrollTo({ top: document.getElementById('generator')?.offsetTop, behavior: 'smooth' });
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Report
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
