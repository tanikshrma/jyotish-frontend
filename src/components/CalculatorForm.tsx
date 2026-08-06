import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Loader2, CalendarIcon, Clock, MapPin, ArrowRight, AlertCircle, Target, Shield, Download, CheckCircle, Star, Heart, Sparkles } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { vedicAstroApi } from "@/lib/vedicAstroApi";
import { postTrackingEvent } from "@/lib/tracking";
import { submitProspectIQLead } from "@/lib/prospectiq";
import { KaalSarpPDF } from "./KaalSarpPDF";
import { MatchmakingPDF } from "./MatchmakingPDF";

export function formatDobForApi(rawDob: string, dateObj?: Date): string {
  if (dateObj) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
  if (!rawDob) return '';
  if (rawDob.includes('/')) {
    const parts = rawDob.split('/');
    if (parts[0].length === 4) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    return rawDob;
  }
  if (rawDob.includes('-')) {
    const parts = rawDob.split('-');
    if (parts[0].length === 4) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
  }
  return rawDob;
}

export function formatFullLocationName(loc: any): string {
  if (!loc) return '';
  const cityName = loc.place_name || loc.name || loc.address || '';
  const parts = [cityName];
  if (loc.state && !cityName.toLowerCase().includes(loc.state.toLowerCase())) {
    parts.push(loc.state);
  }
  if (loc.country && !cityName.toLowerCase().includes(loc.country.toLowerCase())) {
    parts.push(loc.country);
  }
  return parts.filter(Boolean).join(', ');
}

interface CalculatorFormProps {
  type: 'lalkitab' | 'sadesati' | 'matchmaking' | 'love' | 'babyname' | 'career' | 'kundli' | 'kaalsarp';
  title: string;
}

export function CalculatorForm({ type, title }: CalculatorFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  // Person 1 State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: '',
    dob: '',
    tob: '',
    pob: '',
    lang: 'en'
  });
  const [date, setDate] = useState<Date | undefined>();
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [timeState, setTimeState] = useState({ hour: '12', minute: '00' });
  const [locationSearch, setLocationSearch] = useState('');

  // Person 2 State (for Match Making & Love Calculator)
  const [formData2, setFormData2] = useState({
    name: '',
    gender: '',
    dob: '',
    tob: '',
    pob: '',
    lang: 'en'
  });
  const [date2, setDate2] = useState<Date | undefined>();
  const [calendarMonth2, setCalendarMonth2] = useState<Date>(new Date());
  const [timeState2, setTimeState2] = useState({ hour: '12', minute: '00' });
  const [locationSearch2, setLocationSearch2] = useState('');

  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [activeLocationField, setActiveLocationField] = useState<1 | 2 | null>(null);
  
  const locationRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const reportRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const pdfRef2 = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if ((type === 'kaalsarp' || type === 'matchmaking') && (pdfRef.current || pdfRef2.current)) {
      setIsLoading(true);
      const currentPdfRef = type === 'matchmaking' ? pdfRef2 : pdfRef;
      setLoadingMessage(`Generating premium ${type === 'matchmaking' ? 'Matchmaking' : 'Kaal Sarp'} report...`);
      try {
        const container = currentPdfRef.current;
        if (!container) throw new Error("PDF container not found");
        console.log("PDF Container found:", container);
        
        // Ensure all images are loaded
        const images = container.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        });
        await Promise.all(imagePromises);

        // Wait a bit more for layout stabilization
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const pages = container.querySelectorAll('.w-\\[210mm\\]');

        if (pages.length === 0) {
          throw new Error("No PDF pages found in container");
        }

        const pdf = new jsPDF('p', 'mm', 'a4');
        
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i] as HTMLElement;
          const canvas = await html2canvas(page, {
            scale: 2,
            useCORS: true,
            logging: true,
            backgroundColor: "#ffffff",
            allowTaint: false,
            imageTimeout: 15000,
            onclone: (clonedDoc) => {
              const element = clonedDoc.querySelector('.hidden-pdf-container') as HTMLElement;
              if (element) {
                element.style.position = 'relative';
                element.style.left = '0';
              }
            }
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        }
        
        const fileName = type === 'matchmaking' 
          ? `JyotishNow_Matchmaking_Report_${formData.name.replace(/\s+/g, '_')}_${formData2.name.replace(/\s+/g, '_')}.pdf`
          : `JyotishNow_Kaal_Sarp_Dosha_Report_${formData.name.replace(/\s+/g, '_')}.pdf`;
        pdf.save(fileName);
        console.log("PDF Saved successfully:", fileName);
      } catch (error) {
        console.error('PDF Generation Error:', error);
        alert("There was an error generating your PDF. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!reportRef.current) return;
    
    setIsLoading(true);
    setLoadingMessage("Generating your PDF report...");
    
    try {
      const element = reportRef.current;
      
      // Temporary style changes for better PDF capture
      const originalStyle = element.style.maxHeight;
      const originalOverflow = element.style.overflowY;
      
      element.style.maxHeight = 'none';
      element.style.overflowY = 'visible';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1200 // Ensure consistent width for capture
      });
      
      // Restore styles
      element.style.maxHeight = originalStyle;
      element.style.overflowY = originalOverflow;
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2] // Scale back down to 1x for PDF units
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`JyotishNow_${type}_Report_${formData.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isCoupleForm = type === 'matchmaking' || type === 'love';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocation = async (query: string) => {
    if (query.length > 2) {
      setIsSearchingLocation(true);
      try {
        const res = await vedicAstroApi.geoSearch(query);
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
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (activeLocationField === 1 && locationSearch !== formData.pob) {
        searchLocation(locationSearch);
      } else if (activeLocationField === 2 && locationSearch2 !== formData2.pob) {
        searchLocation(locationSearch2);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [locationSearch, locationSearch2, activeLocationField]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!date) newErrors.dob = "Date of Birth is required";
    
    if (isCoupleForm) {
      if (!formData2.name.trim()) newErrors.name2 = "Partner's Name is required";
      if (!date2) newErrors.dob2 = "Partner's Date of Birth is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [apiResult, setApiResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setLoadingMessage("Analyzing planetary positions...");
    
    try {
      const geoData = await vedicAstroApi.geoSearch(formData.pob);
      let lat = 28.6139, lon = 77.2090, tz = 5.5;
      if (geoData.response && geoData.response.length > 0) {
        const location = geoData.response[0];
        lat = parseFloat(location.lat || location.latitude || lat);
        lon = parseFloat(location.lon || location.longitude || lon);
        tz = parseFloat(location.tz || location.timezone || 5.5);
      }

      const formattedDob = date ? format(date, 'dd/MM/yyyy') : '';
      const params1 = { dob: formattedDob, tob: `${timeState.hour}:${timeState.minute}`, lat, lon, tz, lang: formData.lang };

      let resultData = null;

      if (isCoupleForm) {
        const geoData2 = await vedicAstroApi.geoSearch(formData2.pob);
        let lat2 = 28.6139, lon2 = 77.2090, tz2 = 5.5;
        if (geoData2.response && geoData2.response.length > 0) {
          const location2 = geoData2.response[0];
          lat2 = parseFloat(location2.lat || location2.latitude || lat2);
          lon2 = parseFloat(location2.lon || location2.longitude || lon2);
          tz2 = parseFloat(location2.tz || location2.timezone || 5.5);
        }
        const formattedDob2 = date2 ? format(date2, 'dd/MM/yyyy') : '';
        const params2 = { dob: formattedDob2, tob: `${timeState2.hour}:${timeState2.minute}`, lat: lat2, lon: lon2, tz: tz2 };

        resultData = await vedicAstroApi.getMatchmaking(params1, params2);
      } else {
        if (type === 'kaalsarp') {
           resultData = await vedicAstroApi.getKaalSarp(params1);
        } else if (type === 'sadesati') {
           resultData = await vedicAstroApi.getDoshas(params1);
        } else if (type === 'babyname') {
           resultData = await vedicAstroApi.getPanchang(params1);
        } else if (type === 'lalkitab' || type === 'career') {
           resultData = await vedicAstroApi.getPlanetReport(params1);
        } else {
           resultData = await vedicAstroApi.getPlanetDetails(params1);
        }
      }

      console.log(`API Result for ${type}:`, resultData);
      setApiResult(resultData);
      
      // Save all data locally
      try {
        const savedData = JSON.parse(localStorage.getItem('saved_astrology_calculations') || '[]');
        savedData.push({
          type,
          timestamp: new Date().toISOString(),
          formData,
          ...(isCoupleForm ? { formData2 } : {}),
          result: resultData
        });
        localStorage.setItem('saved_astrology_calculations', JSON.stringify(savedData));
      } catch (e) {
        console.error('Failed to save data locally', e);
      }

      // Save lead to Prospect IQ CRM
      submitProspectIQLead({
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formattedDob,
        timeOfBirth: `${timeState.hour}:${timeState.minute}`,
        placeOfBirth: formData.pob,
        service: type,
        tags: [`Calculator: ${title}`, `Service: ${type}`],
      });

      // Tracking
      const trackingPayload = {
        type: "external_form_submission",
        timestamp: Date.now(),
        formId: `Calculator Form - ${title}`,
        formData: {
          first_name: formData.name.split(' ')[0] || formData.name,
          last_name: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          date_of_birth: formattedDob,
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

      const customFields: Record<string, { value: any; label: string }> = {
        't3toxS3cJRwOlgJLnGIv': { value: `${timeState.hour}:${timeState.minute}`, label: 'Time of Birth' },
        'pqLHdWbD2bpUsdE103I0': { value: formData.pob, label: 'Place of Birth' },
        'GQbW8PBfcMus3Opakqn0': { value: type, label: 'Service' }
      };

      if (isCoupleForm) {
        customFields['ItkyfMoMWfIlQBWzQHhG'] = { value: formData2.name, label: 'Partner Name' };
        customFields['Kt2ijktqfAl5fdEtKDyx'] = { value: date2 ? format(date2, 'dd/MM/yyyy') : '', label: 'Partner Date of Birth' };
        customFields['a6G2XT6EQ3xjkVeZFr6U'] = { value: `${timeState2.hour}:${timeState2.minute}`, label: 'Partner Time of Birth' };
        customFields['lljnY6jJyjO1dGqSyczG'] = { value: formData2.pob, label: 'Partner Place of Birth' };
      }

      postTrackingEvent(trackingPayload, { customFields });

      setIsSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="bg-white border border-border/40 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-3xl font-serif font-bold text-foreground mb-4">Calculation Successful</h3>
          
          <div 
            ref={reportRef}
            className="text-left bg-white p-6 md:p-8 rounded-xl border border-border/50 max-h-[400px] overflow-y-auto custom-scrollbar shadow-inner"
          >
            <div className="flex items-center justify-between border-b border-primary/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <img src="https://vibe.filesafe.space/1782888190245745251/attachments/a1bc8dd3-6a25-444f-9550-cff3f539810d.png" alt="Jyotish Now" className="h-10 w-auto object-contain" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-primary uppercase">{title}</p>
                <p className="text-[9px] text-foreground/40">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <h4 className="font-bold text-primary mb-4 border-b border-border/50 pb-2">Your Astrological Results</h4>
            
            {isCoupleForm && type === 'matchmaking' && apiResult?.response && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                
                {/* Score Header */}
                <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 p-10 rounded-[2.5rem] border border-primary/10 text-center relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -ml-16 -mb-16"></div>
                  
                  <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 text-primary text-xs font-bold uppercase tracking-widest border border-secondary/30">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      Guna Milan Score
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    
                    <div className="flex items-center justify-center gap-8">
                      <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary/5" />
                          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" 
                            strokeDasharray="289" 
                            strokeDashoffset={289 - (289 * (apiResult.response.score || 0)) / 36} 
                            strokeLinecap="round"
                            className="text-primary transition-all duration-1500 ease-out" />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-5xl font-serif font-bold text-primary">{apiResult.response.score || 0}</span>
                          <span className="text-sm text-primary/40 font-bold tracking-widest">OUT OF 36</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="inline-block px-8 py-3 rounded-2xl bg-white border border-primary/10 shadow-sm relative z-10">
                        <span className="text-2xl font-serif font-bold text-primary">
                          Compatibility: {Math.round(((apiResult.response.score || 0) / 36) * 100)}%
                        </span>
                      </div>
                      
                      <div className={`text-2xl font-serif font-bold capitalize relative z-10 flex items-center justify-center gap-3 ${apiResult.response.score >= 18 ? 'text-green-600' : 'text-destructive'}`}>
                        {apiResult.response.score >= 18 ? (
                          <><CheckCircle className="w-7 h-7" /> Favorable Match</>
                        ) : (
                          <><AlertCircle className="w-7 h-7" /> Challenging Match</>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compatibility Summary */}
                {apiResult.response.bot_response && (
                  <div className="bg-white p-8 rounded-[2.5rem] border border-border/50 shadow-sm relative group hover:border-secondary/30 transition-all duration-500">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-secondary to-primary rounded-l-[2.5rem]"></div>
                    <h5 className="font-serif font-bold text-2xl text-primary mb-6 flex items-center gap-3">
                      <Heart className="w-7 h-7 text-secondary fill-secondary/20" />
                      Marriage Compatibility Summary
                    </h5>
                    <p className="text-foreground/80 leading-relaxed text-lg whitespace-pre-wrap">
                      {apiResult.response.bot_response}
                    </p>
                  </div>
                )}

                {/* Astro Details */}
                {apiResult.response.boy_astro_details && apiResult.response.girl_astro_details && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <h5 className="font-serif font-bold text-2xl text-primary flex items-center gap-3">
                        <Sparkles className="w-7 h-7 text-secondary" />
                        Astro Details
                      </h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Boy Astro Details */}
                      <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm">
                        <h6 className="font-serif font-bold text-primary text-xl mb-4 text-center border-b border-border/50 pb-2">
                          Boy's Details
                        </h6>
                        <div className="space-y-2">
                          {Object.entries(apiResult.response.boy_astro_details).map(([key, value]) => {
                            if (typeof value !== 'string' && typeof value !== 'number') return null;
                            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            return (
                              <div key={key} className="flex justify-between items-center text-sm py-1 border-b border-border/20 last:border-0">
                                <span className="text-foreground/60 font-medium">{formattedKey}</span>
                                <span className="text-primary font-bold">{value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Girl Astro Details */}
                      <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm">
                        <h6 className="font-serif font-bold text-primary text-xl mb-4 text-center border-b border-border/50 pb-2">
                          Girl's Details
                        </h6>
                        <div className="space-y-2">
                          {Object.entries(apiResult.response.girl_astro_details).map(([key, value]) => {
                            if (typeof value !== 'string' && typeof value !== 'number') return null;
                            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            return (
                              <div key={key} className="flex justify-between items-center text-sm py-1 border-b border-border/20 last:border-0">
                                <span className="text-foreground/60 font-medium">{formattedKey}</span>
                                <span className="text-primary font-bold">{value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ashtakoot Breakdown */}
                {(apiResult.response.ashtakoota || apiResult.response.varna) && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <h5 className="font-serif font-bold text-2xl text-primary flex items-center gap-3">
                        <Target className="w-7 h-7 text-secondary" />
                        Ashtakoot Breakdown
                      </h5>
                      <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">8-Point Analysis</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {['varna', 'vashya', 'tara', 'yoni', 'maitri', 'gana', 'bhakoot', 'nadi'].map((kootKey) => {
                        const apiKootKey = kootKey === 'maitri' ? 'grahamaitri' : kootKey === 'vashya' ? 'vasya' : kootKey;
                        const data = apiResult.response[apiKootKey] || (apiResult.response.ashtakoota && apiResult.response.ashtakoota[apiKootKey]);
                        
                        console.log(`Mapping Koot: ${kootKey}`, data);
                        
                        if (!data) return null;

                        let score = 0, total = 0, boyVal = 'Not Available', girlVal = 'Not Available';
                        if (kootKey === 'varna') { score = data.varna ?? data.score ?? 0; total = data.full_score ?? data.total_score ?? 0; boyVal = data.boy_varna || data.boy || 'Not Available'; girlVal = data.girl_varna || data.girl || 'Not Available'; }
                        else if (kootKey === 'vashya') { score = data.vasya ?? data.score ?? 0; total = data.full_score ?? data.total_score ?? 0; boyVal = data.boy_vasya || data.boy || 'Not Available'; girlVal = data.girl_vasya || data.girl || 'Not Available'; }
                        else if (kootKey === 'tara') { score = data.tara ?? data.score ?? 0; total = data.full_score ?? data.total_score ?? 0; boyVal = data.boy_tara || data.boy || 'Not Available'; girlVal = data.girl_tara || data.girl || 'Not Available'; }
                        else if (kootKey === 'yoni') { score = data.yoni ?? data.score ?? 0; total = data.full_score ?? data.total_score ?? 0; boyVal = data.boy_yoni || data.boy || 'Not Available'; girlVal = data.girl_yoni || data.girl || 'Not Available'; }
                        else if (kootKey === 'maitri') { score = data.grahamaitri ?? data.score ?? 0; total = data.full_score ?? data.total_score ?? 0; boyVal = data.boy_lord || data.boy || 'Not Available'; girlVal = data.girl_lord || data.girl || 'Not Available'; }
                        else if (kootKey === 'gana') { score = data.gana ?? data.score ?? 0; total = data.full_score ?? data.total_score ?? 0; boyVal = data.boy_gana || data.boy || 'Not Available'; girlVal = data.girl_gana || data.girl || 'Not Available'; }
                        else if (kootKey === 'bhakoot') { score = data.bhakoot ?? data.score ?? 0; total = data.full_score ?? data.total_score ?? 0; boyVal = data.boy_rasi_name || data.boy || 'Not Available'; girlVal = data.girl_rasi_name || data.girl || 'Not Available'; }
                        else if (kootKey === 'nadi') { score = data.nadi ?? data.score ?? 0; total = data.full_score ?? data.total_score ?? 0; boyVal = data.boy_nadi || data.boy || 'Not Available'; girlVal = data.girl_nadi || data.girl || 'Not Available'; }

                        const description = data.description || data.meaning || data.interpretation;

                        return (
                          <div key={kootKey} className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-secondary/40 transition-all duration-300 group">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                  <Sparkles className="w-5 h-5" />
                                </div>
                                <h6 className="font-serif font-bold text-primary capitalize text-xl">{kootKey}</h6>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-lg font-bold text-primary">
                                  {score} / {total}
                                </span>
                                <div className="w-16 h-1 bg-primary/10 rounded-full overflow-hidden mt-1">
                                  <div 
                                    className="h-full bg-primary" 
                                    style={{ width: `${(score / (total || 1)) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="bg-secondary/5 p-3 rounded-xl border border-secondary/10">
                                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-1">Boy</p>
                                <p className="text-sm font-bold text-primary">{boyVal}</p>
                              </div>
                              <div className="bg-secondary/5 p-3 rounded-xl border border-secondary/10">
                                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-1">Girl</p>
                                <p className="text-sm font-bold text-primary">{girlVal}</p>
                              </div>
                            </div>
                            
                            {description && (
                              <p className="text-sm text-foreground/70 leading-relaxed italic">
                                {description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Additional Insights */}
                <div className="grid gap-6">
                  {apiResult.response.strengths && (
                    <div className="bg-green-50/50 p-8 rounded-[2rem] border border-green-100 shadow-sm">
                      <h5 className="font-serif font-bold text-xl text-green-800 mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        Strengths of the Relationship
                      </h5>
                      <p className="text-green-900/80 leading-relaxed text-lg whitespace-pre-wrap">
                        {apiResult.response.strengths}
                      </p>
                    </div>
                  )}
                  
                  {apiResult.response.challenges && (
                    <div className="bg-destructive/5 p-8 rounded-[2rem] border border-destructive/10 shadow-sm">
                      <h5 className="font-serif font-bold text-xl text-destructive mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        </div>
                        Possible Challenges
                      </h5>
                      <p className="text-destructive/80 leading-relaxed text-lg whitespace-pre-wrap">
                        {apiResult.response.challenges}
                      </p>
                    </div>
                  )}
                  
                  {apiResult.response.astrological_guidance && (
                    <div className="bg-[#FFFDF9] p-8 rounded-[2rem] border border-secondary/20 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                        <Star className="w-24 h-24 text-secondary" fill="currentColor" />
                      </div>
                      <h5 className="font-serif font-bold text-xl text-primary mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Star className="w-5 h-5 text-secondary" fill="currentColor" />
                        </div>
                        Astrological Guidance
                      </h5>
                      <p className="text-foreground/80 leading-relaxed text-lg whitespace-pre-wrap relative z-10">
                        {apiResult.response.astrological_guidance}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Love Calculator Fallback (if type is love) */}
            {isCoupleForm && type === 'love' && apiResult?.response?.bot_response && (
              <div className="space-y-4">
                <p className="text-foreground/80 leading-relaxed">{apiResult.response.bot_response}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-lg border border-border/50">
                    <p className="text-sm text-foreground/60">Total Score</p>
                    <p className="text-2xl font-bold text-primary">{apiResult.response.score} / 36</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-border/50">
                    <p className="text-sm text-foreground/60">Match Status</p>
                    <p className="text-lg font-bold text-foreground capitalize">{apiResult.response.score >= 18 ? 'Favorable' : 'Not Favorable'}</p>
                  </div>
                </div>
              </div>
            )}

            {!isCoupleForm && type === 'sadesati' && apiResult && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-border/50">
                  <h5 className="font-bold text-foreground mb-2">Sade Sati Status</h5>
                  <p className="text-foreground/80">{apiResult.sadesati?.is_sadesati ? 'You are currently under Sade Sati.' : 'You are NOT under Sade Sati currently.'}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-border/50">
                  <h5 className="font-bold text-foreground mb-2">Manglik Status</h5>
                  <p className="text-foreground/80">{apiResult.manglik?.is_present ? 'Manglik Dosha is present.' : 'Manglik Dosha is NOT present.'}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-border/50">
                  <h5 className="font-bold text-foreground mb-2">Kaal Sarp Status</h5>
                  <p className="text-foreground/80">{apiResult.kaalsarp?.is_present ? 'Kaal Sarp Dosha is present.' : 'Kaal Sarp Dosha is NOT present.'}</p>
                </div>
              </div>
            )}

            {!isCoupleForm && type === 'kaalsarp' && apiResult && apiResult.response && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-xl border border-border/50 shadow-sm md:col-span-2">
                    <h5 className="font-bold text-lg text-primary mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Kaal Sarp Dosha Status
                    </h5>
                    <p className="text-foreground/80 font-medium text-lg">
                      {apiResult.response.is_dosha_present 
                        ? <span className="text-destructive font-bold">Kaal Sarp Dosha Present</span> 
                        : <span className="text-green-600 font-bold">No Kaal Sarp Dosha Found</span>}
                    </p>
                    {apiResult.response.bot_response && (
                      <p className="text-foreground/70 mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                        {apiResult.response.bot_response}
                      </p>
                    )}
                  </div>
                </div>

                {apiResult.response.remedies && Array.isArray(apiResult.response.remedies) && apiResult.response.remedies.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-xl text-primary border-b border-border/50 pb-2 flex items-center gap-2">
                      <Shield className="w-6 h-6 text-secondary" />
                      Vedic Remedies
                    </h4>
                    <div className="grid gap-4">
                      {apiResult.response.remedies.map((remedy: string, idx: number) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-secondary/20 shadow-sm flex items-start gap-4 hover:border-secondary/50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
                            {remedy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

{/* Remaining API Calls removed as requested */}
              </div>
            )}
            
            {!isCoupleForm && type === 'kaalsarp' && apiResult && !apiResult.response && (
              <div className="bg-white p-6 rounded-xl border border-destructive/20 shadow-sm text-center">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
                <h5 className="font-bold text-lg text-destructive mb-2">No Data Available</h5>
                <p className="text-foreground/80">We couldn't fetch your dosha details at this time. Please try again later.</p>
              </div>
            )}

            {!isCoupleForm && type === 'babyname' && apiResult?.response && (
              <div className="space-y-4 bg-white p-4 rounded-lg border border-border/50">
                <h5 className="font-bold text-foreground mb-2">Nakshatra Details</h5>
                <p className="text-foreground/80"><strong>Nakshatra:</strong> {apiResult.response.nakshatra}</p>
                <p className="text-foreground/80"><strong>Moon Sign (Rasi):</strong> {apiResult.response.moon_sign}</p>
                <p className="text-foreground/80 mt-2 text-sm italic">Based on these details, you can choose a baby name with the recommended starting letters for this Nakshatra and Pada.</p>
              </div>
            )}

            {!isCoupleForm && (type === 'lalkitab' || type === 'career') && apiResult && (
              <div className="space-y-4">
                <p className="text-foreground/80">Your planetary positions have been calculated. Our expert astrologers will prepare your detailed personalized report and contact you shortly.</p>
                {apiResult.response && Array.isArray(apiResult.response) && (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {apiResult.response.slice(0, 4).map((p: any, i: number) => (
                      <div key={i} className="bg-white p-2 rounded border border-border/50">
                        <span className="font-bold">{p.name}:</span> {p.sign}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isCoupleForm && type === 'kundli' && apiResult && (
               <div className="space-y-4 bg-white p-4 rounded-lg border border-border/50">
                  <p className="text-foreground/80">Basic planetary details fetched successfully. For a complete Kundli, please use the Free Kundli Calculator on the homepage.</p>
               </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isLoading}
              className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-primary rounded-xl h-14 px-8 text-lg font-bold shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </Button>
            <Button 
              onClick={() => {setIsSuccess(false); setApiResult(null);}} 
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-white rounded-xl h-14 px-8 text-lg font-bold shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              Calculate Again
            </Button>
          </div>
        </CardContent>
        {type === 'matchmaking' && apiResult && (
          <MatchmakingPDF 
            ref={pdfRef2} 
            data={apiResult} 
            userData={{
              boyName: formData.name,
              boyDob: date ? format(date, 'dd/MM/yyyy') : '',
              boyTob: `${timeState.hour}:${timeState.minute}`,
              boyPob: formData.pob,
              girlName: formData2.name,
              girlDob: date2 ? format(date2, 'dd/MM/yyyy') : '',
              girlTob: `${timeState2.hour}:${timeState2.minute}`,
              girlPob: formData2.pob
            }}
          />
        )}
      </Card>
    );
  }

  const renderPersonForm = (isPartner = false) => {
    const currentData = isPartner ? formData2 : formData;
    const setCurrData = (newData: any) => {
      if (isPartner) {
        setFormData2(prev => ({ ...prev, ...newData }));
      } else {
        setFormData(prev => ({ ...prev, ...newData }));
      }
    };
    const currDate = isPartner ? date2 : date;
    const setCurrDate = isPartner ? setDate2 : setDate;
    const currMonth = isPartner ? calendarMonth2 : calendarMonth;
    const setCurrMonth = isPartner ? setCalendarMonth2 : setCalendarMonth;
    const currTime = isPartner ? timeState2 : timeState;
    const setCurrTime = isPartner ? setTimeState2 : setTimeState;
    const locSearch = isPartner ? locationSearch2 : locationSearch;
    const setLocSearch = isPartner ? setLocationSearch2 : setLocationSearch;
    const nameKey = isPartner ? 'name2' : 'name';
    const dobKey = isPartner ? 'dob2' : 'dob';
    const fieldId = isPartner ? 2 : 1;

    return (
      <div className="space-y-6">
        {isCoupleForm && (
          <h4 className="text-xl font-serif font-bold text-primary mb-6 border-b border-border/50 pb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
              {isPartner ? "2" : "1"}
            </span>
            {type === 'matchmaking' 
              ? (isPartner ? "Girl's Details" : "Boy's Details")
              : (isPartner ? "Partner's Details" : "Your Details")}
          </h4>
        )}
        
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2 relative group md:col-span-2">
            <Label className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-primary transition-colors">Full Name</Label>
            <Input placeholder="Enter full name" className={cn("h-14 px-4 rounded-xl border border-border/60 bg-white text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base sm:text-lg hover:border-primary/60 placeholder:text-muted-foreground/60", errors[nameKey] && "border-destructive")} value={currentData.name} onChange={e => {setCurrData({ name: e.target.value }); setErrors({...errors, [nameKey]: ''})}} />
            {errors[nameKey] && <p className="text-destructive text-xs absolute -bottom-5">{errors[nameKey]}</p>}
          </div>

          <div className="space-y-2 relative group flex flex-col">
            <Label className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-primary transition-colors">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className={cn("w-full justify-between text-left font-normal h-14 px-4 rounded-xl border border-border/60 bg-white text-foreground shadow-sm hover:bg-white hover:text-foreground hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base sm:text-lg", !currDate && "text-muted-foreground/60", currDate && "text-foreground font-semibold", errors[dobKey] && "border-destructive")}>
                  <span>{currDate ? format(currDate, "PPP") : <span>DD/MM/YYYY</span>}</span>
                  <CalendarIcon className="h-5 w-5 text-primary/70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="start">
                <div className="bg-white border border-border/60 rounded-xl shadow-xl overflow-hidden flex flex-col p-3 gap-3">
                  <div className="flex items-center border border-border/60 rounded-md bg-white">
                    <Select value={currMonth.getMonth().toString()} onValueChange={(v) => { const newDate = new Date(currMonth); newDate.setMonth(parseInt(v)); setCurrMonth(newDate); }}>
                      <SelectTrigger className="h-10 flex-1 border-none bg-transparent shadow-none focus:ring-0 text-foreground font-medium px-4"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-border/60 max-h-[250px]">
                        {Array.from({ length: 12 }).map((_, i) => {
                          const d = new Date(2000, i, 1);
                          return <SelectItem key={i} value={i.toString()}>{format(d, 'MMMM')}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                    <div className="w-px h-6 bg-border/50"></div>
                    <Select value={currMonth.getFullYear().toString()} onValueChange={(v) => { const newDate = new Date(currMonth); newDate.setFullYear(parseInt(v)); setCurrMonth(newDate); }}>
                      <SelectTrigger className="h-10 flex-1 border-none bg-transparent shadow-none focus:ring-0 text-foreground font-medium px-4"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-border/60 max-h-[250px]">
                        {Array.from({ length: 130 }).map((_, i) => {
                          const year = new Date().getFullYear() - i;
                          return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="border border-border/60 rounded-md bg-white pb-1">
                    <Calendar mode="single" month={currMonth} onMonthChange={setCurrMonth} selected={currDate} onSelect={(d) => { setCurrDate(d); if (d) setCurrMonth(d); setErrors({...errors, [dobKey]: ''}) }} initialFocus disabled={(d) => d > new Date() || d < new Date("1900-01-01")} className="border-none shadow-none bg-transparent p-2" />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {errors[dobKey] && <p className="text-destructive text-xs absolute -bottom-5">{errors[dobKey]}</p>}
          </div>

          <div className="space-y-2 relative group flex flex-col">
            <Label className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-primary transition-colors">Time of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-between text-left font-normal h-14 px-4 rounded-xl border border-border/60 bg-white text-foreground shadow-sm hover:bg-white hover:text-foreground hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base sm:text-lg">
                  <span className="font-semibold text-foreground">{currTime.hour}:{currTime.minute}</span>
                  <Clock className="h-5 w-5 text-primary/70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-6 rounded-2xl border border-border/60 bg-white shadow-xl" align="start">
                <div className="flex gap-4">
                  <div className="flex flex-col gap-3">
                    <Label className="text-sm font-bold text-primary text-center uppercase tracking-wider">Hour</Label>
                    <Select value={currTime.hour} onValueChange={(v) => setCurrTime({...currTime, hour: v})}>
                      <SelectTrigger className="w-[90px] h-12 text-lg px-3 bg-white border-b-2 border-0 border-border/60 text-foreground rounded-none shadow-none focus:ring-0 focus:border-primary"><SelectValue /></SelectTrigger>
                      <SelectContent className="h-[200px] bg-white border-border/60">
                        {Array.from({ length: 24 }).map((_, i) => {
                          const val = i.toString().padStart(2, '0');
                          return <SelectItem key={val} value={val}>{val}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label className="text-sm font-bold text-primary text-center uppercase tracking-wider">Minute</Label>
                    <Select value={currTime.minute} onValueChange={(v) => setCurrTime({...currTime, minute: v})}>
                      <SelectTrigger className="w-[90px] h-12 text-lg px-3 bg-white border-b-2 border-0 border-border/60 text-foreground rounded-none shadow-none focus:ring-0 focus:border-primary"><SelectValue /></SelectTrigger>
                      <SelectContent className="h-[200px] bg-white border-border/60">
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
          </div>

          <div className="space-y-2 relative group flex flex-col md:col-span-2" ref={activeLocationField === fieldId ? locationRef : null}>
            <Label className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-primary transition-colors">Place of Birth</Label>
            <div className="relative">
              <Input placeholder="Search city..." className="h-14 px-4 pr-10 rounded-xl border border-border/60 bg-white text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base sm:text-lg hover:border-primary/60 placeholder:text-muted-foreground/60" value={locSearch} onChange={e => { setLocSearch(e.target.value); setCurrData({ pob: e.target.value }); setActiveLocationField(fieldId as 1 | 2); }} onFocus={() => { setActiveLocationField(fieldId as 1 | 2); if (locationResults.length > 0) setShowLocationDropdown(true); }} autoComplete="off" />
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/70 pointer-events-none" />
              {isSearchingLocation && activeLocationField === fieldId && <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />}
            </div>
            {showLocationDropdown && activeLocationField === fieldId && locationResults.length > 0 && (
              <div className="absolute z-50 w-full top-full mt-2 bg-white border border-border/60 rounded-xl shadow-xl max-h-[250px] overflow-y-auto">
                {locationResults.map((loc, i) => {
                  const fullLocName = formatFullLocationName(loc);
                  return (
                    <div 
                      key={i} 
                      className="px-5 py-3 hover:bg-primary/5 hover:text-primary cursor-pointer transition-colors text-base border-b border-border/10 last:border-0" 
                      onClick={() => { 
                        setLocSearch(fullLocName); 
                        setCurrData({ pob: fullLocName }); 
                        setShowLocationDropdown(false); 
                      }}
                    >
                      <p className="font-semibold text-foreground">{loc.place_name || loc.name || loc.address}</p>
                      {(loc.state || loc.country) && (
                        <p className="text-xs text-muted-foreground">{[loc.state, loc.country].filter(Boolean).join(', ')}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {((!isCoupleForm && type === 'kaalsarp') || (isCoupleForm && type === 'matchmaking' && !isPartner)) && (
            <div className="space-y-2 relative group flex flex-col md:col-span-2">
              <Label className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-primary transition-colors">Language</Label>
              <Select value={currentData.lang || 'en'} onValueChange={(v) => setCurrData({ lang: v })}>
                <SelectTrigger className="h-14 px-4 rounded-xl border border-border/60 bg-white text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base sm:text-lg hover:border-primary/60">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent className="bg-white border-border/60">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-[#FFFDF9] border border-secondary/30 rounded-2xl p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>
      <CardContent className="p-0">
        <div className="text-center mb-10">
          <h3 className="text-3xl md:text-4xl font-bold font-serif text-primary mb-4">{title}</h3>
          <p className="text-foreground/70 text-lg">Enter the details below to generate your report.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 pb-6 border-b border-border/50">
            <div className="space-y-2 relative group">
              <Label className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-secondary transition-colors">Phone Number</Label>
              <Input type="tel" placeholder="Enter phone number" className={cn("h-14 px-4 rounded-xl border border-border/50 bg-background/50 text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary/20 focus-visible:border-secondary transition-all text-lg hover:border-secondary/50", errors.phone && "border-destructive")} value={formData.phone} onChange={e => {setFormData({...formData, phone: e.target.value}); setErrors({...errors, phone: ''})}} />
              {errors.phone && <p className="text-destructive text-xs absolute -bottom-5">{errors.phone}</p>}
            </div>
            <div className="space-y-2 relative group">
              <Label className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-secondary transition-colors">Email Address</Label>
              <Input type="email" placeholder="Enter email" className={cn("h-14 px-4 rounded-xl border border-border/50 bg-background/50 text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary/20 focus-visible:border-secondary transition-all text-lg hover:border-secondary/50", errors.email && "border-destructive")} value={formData.email} onChange={e => {setFormData({...formData, email: e.target.value}); setErrors({...errors, email: ''})}} />
              {errors.email && <p className="text-destructive text-xs absolute -bottom-5">{errors.email}</p>}
            </div>
          </div>

          {isCoupleForm ? (
            <div className="grid lg:grid-cols-2 gap-12">
              {renderPersonForm(false)}
              {renderPersonForm(true)}
            </div>
          ) : (
            renderPersonForm(false)
          )}

          <Button type="submit" disabled={isLoading} className="w-full h-14 bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 text-white rounded-xl text-lg font-bold shadow-[0_8px_20px_-6px_rgba(122,8,8,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 relative overflow-hidden group">
            <span className="relative z-10 flex items-center justify-center">
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {loadingMessage}</>
              ) : (
                <>{type === 'matchmaking' ? "Generate Kundli Matching Report" : "Calculate Now"} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
