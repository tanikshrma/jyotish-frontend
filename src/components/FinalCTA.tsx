import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BookingModal } from "./BookingModal";

interface FinalCTAProps {
  title: string;
  description: string;
  primaryBtnText: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
}

export const FinalCTA = React.forwardRef<HTMLElement, FinalCTAProps>(({
  title,
  description,
  primaryBtnText,
  primaryBtnLink = "/get-consultation",
  secondaryBtnText,
  secondaryBtnLink = "/contact-us"
}: FinalCTAProps, ref) => {
  return (
    <section ref={ref} className="relative overflow-hidden bg-primary text-primary-foreground pt-32 pb-14">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-primary"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            {title}
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {description}
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            {primaryBtnLink === "/get-consultation" ? (
              <BookingModal>
                <Button className="h-14 px-8 text-base sm:text-lg font-semibold rounded-xl bg-white hover:bg-white/90 text-primary shadow-lg transition-all duration-300 hover:scale-105">
                  {primaryBtnText} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </BookingModal>
            ) : (
              <Button asChild className="h-14 px-8 text-base sm:text-lg font-semibold rounded-xl bg-white hover:bg-white/90 text-primary shadow-lg transition-all duration-300 hover:scale-105">
                <Link to={primaryBtnLink}>
                  {primaryBtnText} <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            )}
            {secondaryBtnText && (
              <Button asChild className="h-14 px-8 text-base sm:text-lg font-semibold rounded-xl bg-transparent border-2 border-white/80 text-white hover:bg-white hover:text-primary transition-all duration-300 shadow-sm">
                <Link to={secondaryBtnLink}>
                  {secondaryBtnText}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

FinalCTA.displayName = "FinalCTA";
