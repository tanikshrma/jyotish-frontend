import React, { useEffect, useState } from "react";

export const Preloader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Hide scrollbar while loading
    document.body.style.overflow = 'hidden';
    
    const timer = setTimeout(() => {
      setFade(true);
      document.body.style.overflow = 'unset';
      setTimeout(() => setLoading(false), 500);
    }, 1200);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!loading) return null;

  return (
    <div ref={ref} className={`fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative flex items-center justify-center">
        <div className="w-24 h-24 border-4 border-[#f5c178]/20 border-t-[#f5c178] rounded-full animate-spin"></div>
        <div className="absolute w-16 h-16 border-4 border-[#810909]/20 border-b-[#810909] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <div className="absolute w-8 h-8 border-4 border-[#f5c178]/20 border-l-[#f5c178] rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
      </div>
      <img src="https://vibe.filesafe.space/1782888190245745251/attachments/a28543f7-fe60-49bd-b7e1-8e75e813ccfd.png" alt="JyotishNow Logo" className="mt-8 h-16 object-contain animate-pulse" />
    </div>
  );
});

Preloader.displayName = "Preloader";
