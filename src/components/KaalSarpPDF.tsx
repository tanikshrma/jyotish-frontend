import React from 'react';
import { format } from 'date-fns';
import { Shield, AlertCircle, CheckCircle2, Info, Star, Sparkles } from 'lucide-react';

interface KaalSarpPDFProps {
  data: any;
  userData: {
    name: string;
    dob: string;
    tob: string;
    pob: string;
  };
}

export const KaalSarpPDF = React.forwardRef<HTMLDivElement, KaalSarpPDFProps>(({ data, userData }, ref) => {
  if (!data || !data.response) return null;

  const { is_dosha_present, bot_response, remedies } = data.response;
  const generatedDate = format(new Date(), 'MMMM dd, yyyy');

  const PageWrapper = ({ children, pageNumber, hideHeader = false }: { children: React.ReactNode; pageNumber: number; hideHeader?: boolean }) => (
    <div className="w-[210mm] min-h-[297mm] bg-white relative p-[20mm] border-[1px] border-border/10 overflow-hidden flex flex-col font-sans text-foreground mb-8 shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-repeat opacity-30"></div>
      </div>
      
      {/* Page Border - Double Border for Luxury Feel */}
      <div className="absolute inset-[10mm] border-[3px] border-primary/20 pointer-events-none"></div>
      <div className="absolute inset-[13mm] border-[1px] border-secondary/30 pointer-events-none"></div>
      <div className="absolute inset-[14mm] border-[0.5px] border-primary/10 pointer-events-none"></div>

      {/* Decorative Corners */}
      <div className="absolute top-[10mm] left-[10mm] w-12 h-12 border-t-[6px] border-l-[6px] border-secondary/40 rounded-tl-sm"></div>
      <div className="absolute top-[10mm] right-[10mm] w-12 h-12 border-t-[6px] border-r-[6px] border-secondary/40 rounded-tr-sm"></div>
      <div className="absolute bottom-[10mm] left-[10mm] w-12 h-12 border-b-[6px] border-l-[6px] border-secondary/40 rounded-bl-sm"></div>
      <div className="absolute bottom-[10mm] right-[10mm] w-12 h-12 border-b-[6px] border-r-[6px] border-secondary/40 rounded-br-sm"></div>

      {/* Page Header */}
      {!hideHeader && (
        <div className="relative z-10 flex justify-between items-center mb-10 border-b-2 border-primary/20 pb-6">
          <div className="flex items-center">
            <img 
              src="https://vibe.filesafe.space/1782888190245745251/attachments/2cff7b68-c742-4cf8-9a74-5c87998941a6.png" 
              alt="Jyotish Now" 
              className="h-16 w-auto object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <div className="text-right">
            <p className="text-[12px] font-serif font-bold text-primary uppercase tracking-[0.2em] mb-1">Kaal Sarp Dosha Report</p>
            <p className="text-[10px] text-foreground/60 font-medium tracking-wider">{userData.name} | {generatedDate}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-auto pt-4 border-t border-primary/10 flex justify-between items-center text-[10px] text-foreground/50 font-medium tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-primary/30"></span>
          <span>© {new Date().getFullYear()} JyotishNow Astrology Services</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-primary/40 font-bold">Confidential</span>
          <div className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
            <span className="font-bold text-primary">PAGE {pageNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      ref={ref} 
      className="hidden-pdf-container" 
      style={{ 
        position: 'absolute', 
        left: '-10000px', 
        top: '0', 
        width: '210mm',
        background: 'white',
        zIndex: -100
      }}
    >
      {/* Page 1: Cover */}
      <PageWrapper pageNumber={1} hideHeader={true}>
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-16 py-20">
          <div className="w-80 h-40 relative mb-4">
            <img 
              src="https://vibe.filesafe.space/1782888190245745251/attachments/2cff7b68-c742-4cf8-9a74-5c87998941a6.png" 
              alt="Jyotish Now" 
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
          </div>

          <div className="space-y-4">
            <div className="h-0.5 w-24 bg-secondary mx-auto mb-6"></div>
            <h1 className="text-6xl font-serif font-bold text-primary tracking-tight leading-tight">
              Kaal Sarp Dosha
            </h1>
            <h2 className="text-2xl font-serif text-secondary tracking-[0.3em] uppercase font-medium">
              Premium Analysis Report
            </h2>
            <div className="h-0.5 w-24 bg-secondary mx-auto mt-6"></div>
          </div>

          <div className="w-full max-w-lg mx-auto bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-secondary/20 shadow-xl space-y-8">
            <div className="border-b border-secondary/10 pb-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-foreground/40 mb-3 font-bold">Prepared For</p>
              <p className="text-4xl font-serif font-bold text-primary">{userData.name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-left">
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Date of Birth</p>
                <p className="text-base font-semibold text-foreground/90">{userData.dob}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Time of Birth</p>
                <p className="text-base font-semibold text-foreground/90">{userData.tob}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Place of Birth</p>
                <p className="text-base font-semibold text-foreground/90">{userData.pob}</p>
              </div>
            </div>
          </div>

          <div className="pt-20 opacity-[0.05]">
            <img 
              src="https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png" 
              alt="Mandala" 
              className="w-48 h-48 object-contain animate-spin-slow"
            />
          </div>
        </div>
      </PageWrapper>

      {/* Page 2: Analysis */}
      <PageWrapper pageNumber={2}>
        <div className="space-y-10">
          <div className="flex items-center gap-5 border-b border-primary/10 pb-6">
            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 p-2.5">
              <Shield className="text-primary w-full h-full" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-primary text-3xl">Dosha Analysis</h3>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] mt-1">Detailed Planetary Assessment</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className={`p-10 rounded-[2rem] border-2 flex items-center justify-between shadow-sm ${is_dosha_present ? 'bg-destructive/5 border-destructive/10' : 'bg-green-50/50 border-green-200/50'}`}>
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40">Current Status</p>
                <h4 className={`text-4xl font-serif font-bold ${is_dosha_present ? 'text-destructive' : 'text-green-700'}`}>
                  {is_dosha_present ? 'Kaal Sarp Dosha Present' : 'No Kaal Sarp Dosha Found'}
                </h4>
              </div>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner ${is_dosha_present ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'}`}>
                {is_dosha_present ? <AlertCircle size={40} /> : <CheckCircle2 size={40} />}
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-primary/5 shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-primary border-b border-primary/5 pb-4">
                <Star size={20} className="text-secondary" fill="currentColor" />
                <h5 className="font-serif font-bold text-xl">Vedic Interpretation</h5>
              </div>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-[16px]">
                {bot_response}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl bg-white border border-border/50 shadow-sm space-y-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                  <Sparkles size={14} className="text-secondary" /> Calculation Method
                </span>
                <p className="text-xl font-serif font-bold text-primary">Standard Vedic</p>
              </div>
              <div className="p-8 rounded-2xl bg-white border border-border/50 shadow-sm space-y-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                  <Info size={14} className="text-secondary" /> Analysis Depth
                </span>
                <p className="text-xl font-serif font-bold text-primary">Comprehensive</p>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* Remedies Pages */}
      {remedies && remedies.length > 0 && (
        <div className="remedies-pages">
          {Array.from({ length: Math.ceil(remedies.length / 3) }).map((_, pageIdx) => (
            <PageWrapper key={pageIdx} pageNumber={3 + pageIdx}>
              <div className="space-y-10">
                <div className="flex items-center gap-5 border-b border-primary/10 pb-6">
                  <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary border border-secondary/20">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-primary text-3xl">Vedic Remedies</h3>
                    <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] mt-1">Recommended Solutions</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {remedies.slice(pageIdx * 3, (pageIdx + 1) * 3).map((remedy: string, idx: number) => {
                    const globalIdx = pageIdx * 3 + idx;
                    return (
                      <div key={globalIdx} className="bg-white p-10 rounded-[2rem] border border-secondary/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-secondary/20"></div>
                        <div className="flex items-start gap-8">
                          <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-serif font-bold text-xl shrink-0 border border-secondary/20">
                            {globalIdx + 1}
                          </div>
                          <div className="space-y-4 flex-1">
                            <h6 className="font-serif font-bold text-primary text-xl">Remedy Assessment #{globalIdx + 1}</h6>
                            <p className="text-foreground/80 leading-relaxed text-[15px] whitespace-pre-wrap">
                              {remedy}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </PageWrapper>
          ))}
        </div>
      )}

      {/* Final Page */}
      <PageWrapper pageNumber={3 + (remedies ? Math.ceil(remedies.length / 3) : 0)}>
        <div className="space-y-10">
          <div className="flex items-center gap-5 border-b border-primary/10 pb-6">
            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-primary text-3xl">Path to Well-being</h3>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] mt-1">Final Guidance & Notes</p>
            </div>
          </div>

          <div className="grid gap-8">
            <div className="bg-primary/[0.02] p-10 rounded-[2.5rem] border border-primary/5 space-y-6">
              <h5 className="font-serif font-bold text-primary text-xl flex items-center gap-3">
                <CheckCircle2 size={22} className="text-green-600" />
                Precautions
              </h5>
              <ul className="space-y-4 text-foreground/80 text-[15px] list-disc pl-6">
                <li>Maintain a disciplined daily routine (Dincharya).</li>
                <li>Practice regular meditation and pranayama.</li>
                <li>Avoid major decisions during unfavorable transits.</li>
                <li>Consult a qualified Vedic astrologer for deeper insights.</li>
              </ul>
            </div>

            <div className="bg-secondary/[0.03] p-10 rounded-[2.5rem] border border-secondary/10 space-y-6">
              <h5 className="font-serif font-bold text-primary text-xl flex items-center gap-3">
                <Info size={22} className="text-secondary" />
                Important Information
              </h5>
              <p className="text-foreground/70 text-[15px] leading-relaxed italic">
                Astrology is a guiding science. While remedies help mitigate unfavorable influences, karma (actions) and divine grace play a significant role. Use these insights to empower your life journey.
              </p>
            </div>

            <div className="pt-16 text-center space-y-8">
              <div className="w-40 h-20 mx-auto opacity-30 grayscale contrast-125">
                <img 
                  src="https://vibe.filesafe.space/1782888190245745251/attachments/2cff7b68-c742-4cf8-9a74-5c87998941a6.png" 
                  alt="Jyotish Now Logo Small" 
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-px w-20 bg-primary/10 mx-auto"></div>
                <p className="text-[10px] text-foreground/40 leading-relaxed uppercase tracking-widest px-10">
                  This report is based on Vedic astrology principles. Predictions are indicative and should not substitute professional advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
      `}</style>
    </div>
  );
});

KaalSarpPDF.displayName = 'KaalSarpPDF';
