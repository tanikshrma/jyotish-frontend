import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#3D0404] via-[#2D0303] to-[#1A0202] text-white pt-20 pb-10 border-t border-[#f5c178]/30 relative overflow-hidden">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundSize: '350px',
          backgroundRepeat: 'repeat'
        }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img 
                src="https://vibe.filesafe.space/1782888190245745251/attachments/eeb5c854-e071-4e16-b563-90e6375205fb.png"
                alt="Jyotish Now" 
                loading="lazy"
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="text-white/80 leading-relaxed text-sm">
              Dr. Sandeep Sawhney is a trusted online astrologer brand rooted in a 51+ years legacy of authentic Indian astrology. Built on research, ethics, and responsibility.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/jyotish.now/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300 text-white/80">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@JYOTISH_NOW/featured" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300 text-white/80">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold font-serif text-xl mb-6 text-[#f5c178]">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: 'About Us', url: '/about-us' },
                { name: 'Contact Us', url: '/contact-us' },
                { name: 'Buy Gemstones', url: 'https://manthancrystals.com/' },
                { name: 'Get Consultation', url: '/get-consultation' },
                { name: 'Vastu Consultancy', url: '/vastu-consultancy' },
                { name: 'Kundli Report', url: '/free-kundli' },
                { name: 'Matchmaking Consultation', url: '/matchmaking-consultation' },
                { name: 'Career Guidance', url: '/career-guidance' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.url} target={link.url.startsWith('http') ? '_blank' : undefined} className="text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold font-serif text-xl mb-6 text-[#f5c178]">Horoscope</h4>
            <ul className="space-y-3">
              {[
                { name: 'Complete Horoscope Analysis', url: '/horoscope' },
                { name: 'Daily Horoscope', url: '/daily-horoscope' },
                { name: 'Weekly Horoscope', url: '/weekly-horoscope' },
                { name: 'Yearly Horoscope', url: '/yearly-horoscope-report' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.url} className="text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold font-serif text-xl mb-6 text-[#f5c178]">Contact Details</h4>
            <div className="space-y-4 text-sm text-white/80">
              <p>
                <strong className="text-white">Phone:</strong><br />
                +91-7015544187
              </p>
              <p>
                <strong className="text-white">Email:</strong><br />
                myjyotishnow@gmail.com
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-white/60">
          <p>© 2026 JyotishNow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

