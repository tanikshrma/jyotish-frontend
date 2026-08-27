import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { BookingModal } from "./BookingModal";

export const Header = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  (props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileReportsOpen, setMobileReportsOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileHoroscopeOpen, setMobileHoroscopeOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 20) {
        setIsScrolled(false);
        setIsVisible(true);
      } else {
        setIsScrolled(true);
        if (currentScrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <header ref={ref} className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isVisible || isOpen ? "translate-y-0" : "-translate-y-full"
      } ${
        !isScrolled && !isOpen
          ? "bg-transparent py-3" 
          : "bg-primary shadow-lg py-1"
      }`}>
        <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${!isScrolled && !isOpen ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        </div>
        <div className="container mx-auto px-4 h-16 lg:h-24 flex items-center justify-between transition-all duration-300 relative z-10">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105 duration-300">
            <img 
              src="https://vibe.filesafe.space/1782888190245745251/attachments/eeb5c854-e071-4e16-b563-90e6375205fb.png"
              alt="Jyotish Now" 
              className="h-12 lg:h-20 w-auto object-contain drop-shadow-sm transition-all duration-300"
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          <a href="https://manthancrystals.com/" target="_blank" rel="noopener noreferrer" className="group relative text-sm font-semibold text-white/90 hover:text-secondary transition-colors duration-300 py-6">
            Gemstones
          </a>

          <div className="relative group">
            <button className="group relative text-sm font-semibold text-white/90 hover:text-secondary transition-colors duration-300 py-6 flex items-center gap-1">
              Horoscope
              <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
            </button>
            <div className="absolute top-[80%] left-0 mt-2 w-64 bg-background/95 backdrop-blur-xl border border-border/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left scale-95 group-hover:scale-100 z-50 rounded-2xl overflow-hidden">
              <div className="py-2 flex flex-col">
                <Link to="/horoscope" className="px-4 py-3 text-sm font-medium text-black/80 hover:text-secondary hover:bg-secondary/10 transition-colors border-b border-border/50 last:border-0 relative overflow-hidden group/item">
                  <span className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover/item:translate-x-1">
                    Complete Horoscope Analysis
                  </span>
                </Link>
                <Link to="/daily-horoscope" className="px-4 py-3 text-sm font-medium text-black/80 hover:text-secondary hover:bg-secondary/10 transition-colors border-b border-border/50 last:border-0 relative overflow-hidden group/item">
                  <span className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover/item:translate-x-1">
                    Daily Horoscope
                  </span>
                </Link>
                <Link to="/weekly-horoscope" className="px-4 py-3 text-sm font-medium text-black/80 hover:text-secondary hover:bg-secondary/10 transition-colors border-b border-border/50 last:border-0 relative overflow-hidden group/item">
                  <span className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover/item:translate-x-1">
                    Weekly Horoscope
                  </span>
                </Link>

                <Link to="/yearly-horoscope-report" className="px-4 py-3 text-sm font-medium text-black/80 hover:text-secondary hover:bg-secondary/10 transition-colors border-b border-border/50 last:border-0 relative overflow-hidden group/item">
                  <span className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover/item:translate-x-1">
                    Yearly Horoscope
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative group">
            <button className="group relative text-sm font-semibold text-white/90 hover:text-secondary transition-colors duration-300 py-6 flex items-center gap-1">
              Get Your Reports
              <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
            </button>
            <div className="absolute top-[80%] left-0 mt-2 w-64 bg-background/95 backdrop-blur-xl border border-border/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left scale-95 group-hover:scale-100 z-50 rounded-2xl overflow-hidden">
              <div className="py-2 flex flex-col">
                <Link to="/free-kundli" className="px-4 py-3 text-sm font-medium text-black/80 hover:text-secondary hover:bg-secondary/10 transition-colors border-b border-border/50 last:border-0 relative overflow-hidden group/item">
                  <span className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover/item:translate-x-1">Kundli Report</span>
                </Link>
                <Link to="/lal-kitab-report" className="px-4 py-3 text-sm font-medium text-black/80 hover:text-secondary hover:bg-secondary/10 transition-colors border-b border-border/50 last:border-0 relative overflow-hidden group/item">
                  <span className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover/item:translate-x-1">Lal Kitab Report</span>
                </Link>
                <Link to="/sade-sati-report" className="px-4 py-3 text-sm font-medium text-black/80 hover:text-secondary hover:bg-secondary/10 transition-colors border-b border-border/50 last:border-0 relative overflow-hidden group/item">
                  <span className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover/item:translate-x-1">Sade Sati Report</span>
                </Link>
                <Link to="/kundli-matching" className="px-4 py-3 text-sm font-medium text-black/80 hover:text-secondary hover:bg-secondary/10 transition-colors border-b border-border/50 last:border-0 relative overflow-hidden group/item">
                  <span className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover/item:translate-x-1">Match Making Report</span>
                </Link>
                <Link to="/couple-kundli-analysis" className="px-4 py-3 text-sm font-medium text-black/80 hover:text-secondary hover:bg-secondary/10 transition-colors border-b border-border/50 last:border-0 relative overflow-hidden group/item">
                  <span className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover/item:translate-x-1">Love Report</span>
                </Link>
                <Link to="/baby-name-report" className="px-4 py-3 text-sm font-medium text-black/80 hover:text-secondary hover:bg-secondary/10 transition-colors border-b border-border/50 last:border-0 relative overflow-hidden group/item">
                  <span className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover/item:translate-x-1">Baby Name Report</span>
                </Link>
              </div>
            </div>
          </div>

          <Link to="/vastu-consultancy" className="group relative text-sm font-semibold text-white/90 hover:text-secondary transition-colors duration-300 py-6">
            Vastu Consultancy
          </Link>



          <div className="relative group">
            <button className="group relative text-sm font-semibold text-white/90 hover:text-secondary transition-colors duration-300 py-6 flex items-center gap-1">
              Services
              <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
            </button>
            <div className="absolute top-[80%] left-0 mt-2 w-64 bg-background/95 backdrop-blur-xl border border-border/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left scale-95 group-hover:scale-100 z-50 rounded-2xl overflow-hidden">
              <div className="py-2 flex flex-col">
                <Link to="/matchmaking-consultation" className="px-4 py-3 text-sm font-medium text-black/80 hover:text-secondary hover:bg-secondary/10 transition-colors border-b border-border/50 last:border-0 relative overflow-hidden group/item">
                  <span className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover/item:translate-x-1">Matchmaking Consultation</span>
                </Link>
                <Link to="/couple-kundli-analysis" className="px-4 py-3 text-sm font-medium text-black/80 hover:text-secondary hover:bg-secondary/10 transition-colors border-b border-border/50 last:border-0 relative overflow-hidden group/item">
                  <span className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover/item:translate-x-1">Couple Kundli Analysis</span>
                </Link>
                <Link to="/career-guidance" className="px-4 py-3 text-sm font-medium text-black/80 hover:text-secondary hover:bg-secondary/10 transition-colors border-b border-border/50 last:border-0 relative overflow-hidden group/item">
                  <span className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover/item:translate-x-1">Career Guidance</span>
                </Link>
              </div>
            </div>
          </div>

          <Link to="/about-us" className="group relative text-sm font-semibold text-white/90 hover:text-secondary transition-colors duration-300 py-6">
            About Us
          </Link>

          <Link to="/contact-us" className="group relative text-sm font-semibold text-white/90 hover:text-secondary transition-colors duration-300 py-6">
            Contact Us
          </Link>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link to="/get-consultation">
            <Button className="bg-white hover:bg-white/90 text-black px-7 py-6 text-base font-semibold shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5">
              Get Consultation
            </Button>
          </Link>
        </div>

        {/* Mobile Nav Toggle */}
        <button
          className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>
      </header>

      {/* Mobile Nav Menu */}
      <div 
        className={`lg:hidden fixed inset-0 z-40 bg-background transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full pt-24 pb-8 px-6 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <a 
              href="https://manthancrystals.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lg font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Gemstones
            </a>
            
            <div className="flex flex-col">
              <button 
                onClick={() => setMobileHoroscopeOpen(!mobileHoroscopeOpen)}
                className="flex items-center justify-between text-lg font-medium text-foreground hover:text-secondary transition-colors text-left"
              >
                Horoscope
                <ChevronDown size={20} className={`transition-transform duration-300 ${mobileHoroscopeOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileHoroscopeOpen ? "max-h-[400px] mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="flex flex-col gap-4 pl-4 border-l-2 border-secondary/20">
                  <Link to="/horoscope" className="text-base text-foreground/80 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Complete Horoscope Analysis</Link>
                  <Link to="/daily-horoscope" className="text-base text-foreground/80 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Daily Horoscope</Link>
                  <Link to="/weekly-horoscope" className="text-base text-foreground/80 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Weekly Horoscope</Link>
                  <Link to="/yearly-horoscope-report" className="text-base text-foreground/80 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Yearly Horoscope</Link>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <button 
                onClick={() => setMobileReportsOpen(!mobileReportsOpen)}
                className="flex items-center justify-between text-lg font-medium text-foreground hover:text-secondary transition-colors text-left"
              >
                Get Your Reports
                <ChevronDown size={20} className={`transition-transform duration-300 ${mobileReportsOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileReportsOpen ? "max-h-[400px] mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="flex flex-col gap-4 pl-4 border-l-2 border-secondary/20">
                  <Link to="/free-kundli" className="text-base text-foreground/80 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Kundli Report</Link>
                  <Link to="/lal-kitab-report" className="text-base text-foreground/80 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Lal Kitab Report</Link>
                  <Link to="/sade-sati-report" className="text-base text-foreground/80 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Sade Sati Report</Link>
                  <Link to="/kundli-matching" className="text-base text-foreground/80 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Match Making Report</Link>
                  <Link to="/couple-kundli-analysis" className="text-base text-foreground/80 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Love Report</Link>
                  <Link to="/baby-name-report" className="text-base text-foreground/80 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Baby Name Report</Link>
                </div>
              </div>
            </div>

            <Link to="/vastu-consultancy" className="text-lg font-medium text-foreground hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Vastu Consultancy</Link>


            <div className="flex flex-col">
              <button 
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="flex items-center justify-between text-lg font-medium text-foreground hover:text-secondary transition-colors text-left"
              >
                Services
                <ChevronDown size={20} className={`transition-transform duration-300 ${mobileServicesOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileServicesOpen ? "max-h-[400px] mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="flex flex-col gap-4 pl-4 border-l-2 border-secondary/20">
                  <Link to="/matchmaking-consultation" className="text-base text-foreground/80 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Matchmaking Consultation</Link>
                  <Link to="/couple-kundli-analysis" className="text-base text-foreground/80 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Couple Kundli Analysis</Link>
                  <Link to="/career-guidance" className="text-base text-foreground/80 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Career Guidance</Link>
                </div>
              </div>
            </div>

            <Link to="/about-us" className="text-lg font-medium text-foreground hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>About Us</Link>
            <Link to="/contact-us" className="text-lg font-medium text-foreground hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>Contact Us</Link>
          </div>
          
          <div className="mt-10 mb-4">
            <Link to="/get-consultation" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg font-semibold shadow-[0_8px_20px_-6px_rgba(129,9,9,0.4)] rounded-xl transition-all duration-300">
                Get Consultation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
});

Header.displayName = "Header";
