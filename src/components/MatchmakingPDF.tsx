import React from 'react';
import { format } from 'date-fns';
import { Shield, AlertCircle, CheckCircle2, Info, Star, Sparkles, Heart, Users, Target } from 'lucide-react';

interface MatchmakingPDFProps {
  data: any;
  userData: {
    boyName: string;
    boyDob: string;
    boyTob: string;
    boyPob: string;
    girlName: string;
    girlDob: string;
    girlTob: string;
    girlPob: string;
  };
}

export const MatchmakingPDF = React.forwardRef<HTMLDivElement, MatchmakingPDFProps>(({ data, userData }, ref) => {
  if (!data || !data.response) return null;

  const { score, bot_response, ashtakoota } = data.response;
  const generatedDate = format(new Date(), 'MMMM dd, yyyy');
  const compatibilityPercentage = Math.round(((score || 0) / 36) * 100);

  const PageWrapper = ({ children, pageNumber, hideHeader = false }: { children: React.ReactNode; pageNumber: number; hideHeader?: boolean }) => (
    <div className="w-[210mm] min-h-[297mm] bg-white relative p-[20mm] border-[1px] border-border/10 overflow-hidden flex flex-col font-sans text-foreground mb-8 shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-repeat opacity-30"></div>
      </div>
      
      {/* Page Border */}
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
              src="https://vibe.filesafe.space/1782888190245745251/attachments/eeb5c854-e071-4e16-b563-90e6375205fb.png" 
              alt="Jyotish Now" 
              className="h-16 w-auto object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <div className="text-right">
            <p className="text-[12px] font-serif font-bold text-primary uppercase tracking-[0.2em] mb-1">Kundli Matching Report</p>
            <p className="text-[10px] text-foreground/60 font-medium tracking-wider">{userData.boyName} & {userData.girlName} | {generatedDate}</p>
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
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 py-8">
          <div className="w-64 h-28 relative mb-2">
            <img 
              src="https://vibe.filesafe.space/1782888190245745251/attachments/eeb5c854-e071-4e16-b563-90e6375205fb.png" 
              alt="Jyotish Now" 
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
          </div>

          <div className="space-y-4">
            <div className="h-0.5 w-24 bg-secondary mx-auto mb-6"></div>
            <h1 className="text-6xl font-serif font-bold text-primary tracking-tight leading-tight">
              Kundli Matching
            </h1>
            <h2 className="text-2xl font-serif text-secondary tracking-[0.3em] uppercase font-medium">
              Premium Compatibility Report
            </h2>
            <div className="h-0.5 w-24 bg-secondary mx-auto mt-6"></div>
          </div>

          <div className="w-full max-w-2xl mx-auto grid grid-cols-2 gap-6 shrink-0">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-secondary/20 shadow-xl space-y-4 text-left">
              <p className="text-[10px] uppercase tracking-[0.4em] text-foreground/40 font-bold">Boy's Details</p>
              <p className="text-2xl font-serif font-bold text-primary">{userData.boyName}</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Birth Data</p>
                  <p className="text-sm font-semibold text-foreground/90">{userData.boyDob} | {userData.boyTob}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Birth Place</p>
                  <p className="text-sm font-semibold text-foreground/90 break-words">{userData.boyPob}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-secondary/20 shadow-xl space-y-4 text-left">
              <p className="text-[10px] uppercase tracking-[0.4em] text-foreground/40 font-bold">Girl's Details</p>
              <p className="text-2xl font-serif font-bold text-primary">{userData.girlName}</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Birth Data</p>
                  <p className="text-sm font-semibold text-foreground/90">{userData.girlDob} | {userData.girlTob}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Birth Place</p>
                  <p className="text-sm font-semibold text-foreground/90 break-words">{userData.girlPob}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 opacity-[0.05]">
            <img 
              src="https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png" 
              alt="Mandala" 
              className="w-48 h-48 object-contain animate-spin-slow"
            />
          </div>
        </div>
      </PageWrapper>

      {/* Page 2: Overall Compatibility */}
      <PageWrapper pageNumber={2}>
        <div className="space-y-10">
          <div className="flex items-center gap-5 border-b border-primary/10 pb-6">
            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 p-2.5">
              <Heart className="text-primary w-full h-full" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-primary text-3xl">Compatibility Summary</h3>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] mt-1">Ashtakoot Guna Milan Assessment</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/10 p-10 rounded-[2.5rem] border border-primary/10 text-center relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Guna Milan Score</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-7xl font-serif font-bold text-primary">{score || 0}</div>
                  <div className="text-2xl font-serif text-primary/40 mt-4">/ 36</div>
                </div>
                
                <div className="inline-block px-8 py-3 rounded-full bg-white border border-primary/20 shadow-sm">
                  <span className="text-2xl font-serif font-bold text-primary">
                    Compatibility: {compatibilityPercentage}%
                  </span>
                </div>

                <p className={`text-2xl font-serif font-bold mt-4 ${score >= 18 ? 'text-green-700' : 'text-destructive'}`}>
                  {score >= 18 ? 'Favorable Match' : 'Challenging Match'}
                </p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-primary/5 shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-primary border-b border-primary/5 pb-4">
                <Star size={20} className="text-secondary" fill="currentColor" />
                <h5 className="font-serif font-bold text-xl">Vedic Match Interpretation</h5>
              </div>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-[16px]">
                {bot_response}
              </p>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* Page 3: Astro Details */}
      {data.response.boy_astro_details && data.response.girl_astro_details && (
        <PageWrapper pageNumber={3}>
          <div className="space-y-10">
            <div className="flex items-center gap-5 border-b border-primary/10 pb-6">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary border border-secondary/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-primary text-3xl">Astro Details</h3>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] mt-1">Planetary Positions & Details</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Boy Astro Details */}
              <div className="bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm">
                <h4 className="font-serif font-bold text-primary text-2xl mb-6 text-center border-b border-primary/10 pb-4">
                  Boy's Details
                </h4>
                <div className="space-y-3">
                  {Object.entries(data.response.boy_astro_details).map(([key, value]) => {
                    if (typeof value !== 'string' && typeof value !== 'number') return null;
                    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return (
                      <div key={key} className="flex justify-between items-center text-[12px] py-1 border-b border-border/20 last:border-0">
                        <span className="text-foreground/60 font-medium">{formattedKey}</span>
                        <span className="text-primary font-bold">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Girl Astro Details */}
              <div className="bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm">
                <h4 className="font-serif font-bold text-primary text-2xl mb-6 text-center border-b border-primary/10 pb-4">
                  Girl's Details
                </h4>
                <div className="space-y-3">
                  {Object.entries(data.response.girl_astro_details).map(([key, value]) => {
                    if (typeof value !== 'string' && typeof value !== 'number') return null;
                    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return (
                      <div key={key} className="flex justify-between items-center text-[12px] py-1 border-b border-border/20 last:border-0">
                        <span className="text-foreground/60 font-medium">{formattedKey}</span>
                        <span className="text-primary font-bold">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </PageWrapper>
      )}

      {/* Page 4: Ashtakoot Breakdown */}
      <PageWrapper pageNumber={data.response.boy_astro_details ? 4 : 3}>
        <div className="space-y-10">
          <div className="flex items-center gap-5 border-b border-primary/10 pb-6">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary border border-secondary/20">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-primary text-3xl">Ashtakoot Breakdown</h3>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] mt-1">Detailed 8-Point Analysis</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {['varna', 'vashya', 'tara', 'yoni', 'maitri', 'gana', 'bhakoot', 'nadi'].map((kootKey) => {
              const apiKootKey = kootKey === 'maitri' ? 'grahamaitri' : kootKey === 'vashya' ? 'vasya' : kootKey;
              const kData = ashtakoota ? ashtakoota[apiKootKey] : data.response[apiKootKey];
              
              if (!kData) return null;

              let score = 0, total = 0, boyVal = 'Not Available', girlVal = 'Not Available';
              if (kootKey === 'varna') { score = kData.varna ?? kData.score ?? 0; total = kData.full_score ?? kData.total_score ?? 0; boyVal = kData.boy_varna || kData.boy || 'Not Available'; girlVal = kData.girl_varna || kData.girl || 'Not Available'; }
              else if (kootKey === 'vashya') { score = kData.vasya ?? kData.score ?? 0; total = kData.full_score ?? kData.total_score ?? 0; boyVal = kData.boy_vasya || kData.boy || 'Not Available'; girlVal = kData.girl_vasya || kData.girl || 'Not Available'; }
              else if (kootKey === 'tara') { score = kData.tara ?? kData.score ?? 0; total = kData.full_score ?? kData.total_score ?? 0; boyVal = kData.boy_tara || kData.boy || 'Not Available'; girlVal = kData.girl_tara || kData.girl || 'Not Available'; }
              else if (kootKey === 'yoni') { score = kData.yoni ?? kData.score ?? 0; total = kData.full_score ?? kData.total_score ?? 0; boyVal = kData.boy_yoni || kData.boy || 'Not Available'; girlVal = kData.girl_yoni || kData.girl || 'Not Available'; }
              else if (kootKey === 'maitri') { score = kData.grahamaitri ?? kData.score ?? 0; total = kData.full_score ?? kData.total_score ?? 0; boyVal = kData.boy_lord || kData.boy || 'Not Available'; girlVal = kData.girl_lord || kData.girl || 'Not Available'; }
              else if (kootKey === 'gana') { score = kData.gana ?? kData.score ?? 0; total = kData.full_score ?? kData.total_score ?? 0; boyVal = kData.boy_gana || kData.boy || 'Not Available'; girlVal = kData.girl_gana || kData.girl || 'Not Available'; }
              else if (kootKey === 'bhakoot') { score = kData.bhakoot ?? kData.score ?? 0; total = kData.full_score ?? kData.total_score ?? 0; boyVal = kData.boy_rasi_name || kData.boy || 'Not Available'; girlVal = kData.girl_rasi_name || kData.girl || 'Not Available'; }
              else if (kootKey === 'nadi') { score = kData.nadi ?? kData.score ?? 0; total = kData.full_score ?? kData.total_score ?? 0; boyVal = kData.boy_nadi || kData.boy || 'Not Available'; girlVal = kData.girl_nadi || kData.girl || 'Not Available'; }

              const description = kData.description || kData.meaning || kData.interpretation;

              return (
                <div key={kootKey} className="bg-white p-6 rounded-[1.5rem] border border-primary/5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-primary/5 pb-2">
                    <h6 className="font-serif font-bold text-primary capitalize text-lg">{kootKey}</h6>
                    <span className="text-primary font-bold">{score} / {total}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-secondary/5 p-2 rounded-lg font-medium">
                    <div>Boy: <span className="text-primary">{boyVal}</span></div>
                    <div>Girl: <span className="text-primary">{girlVal}</span></div>
                  </div>
                  {description && (
                    <p className="text-[11px] text-foreground/70 leading-snug">
                      {description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </PageWrapper>

      {/* Page 5: Guidance */}
      <PageWrapper pageNumber={data.response.boy_astro_details ? 5 : 4}>
        <div className="space-y-10">
          <div className="flex items-center gap-5 border-b border-primary/10 pb-6">
            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
              <Shield size={28} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-primary text-3xl">Astrological Guidance</h3>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] mt-1">Strengths, Challenges & Remedies</p>
            </div>
          </div>

          <div className="space-y-8">
            {data.response.strengths && (
              <div className="bg-green-50/30 p-8 rounded-[2rem] border border-green-100 space-y-4">
                <h5 className="font-serif font-bold text-green-800 text-xl flex items-center gap-3">
                  <CheckCircle2 size={22} />
                  Strengths of the Relationship
                </h5>
                <p className="text-green-900/80 text-[14px] leading-relaxed whitespace-pre-wrap">
                  {data.response.strengths}
                </p>
              </div>
            )}

            {data.response.challenges && (
              <div className="bg-destructive/5 p-8 rounded-[2rem] border border-destructive/10 space-y-4">
                <h5 className="font-serif font-bold text-destructive text-xl flex items-center gap-3">
                  <AlertCircle size={22} />
                  Possible Challenges
                </h5>
                <p className="text-destructive/80 text-[14px] leading-relaxed whitespace-pre-wrap">
                  {data.response.challenges}
                </p>
              </div>
            )}

            {data.response.astrological_guidance && (
              <div className="bg-secondary/5 p-8 rounded-[2rem] border border-secondary/10 space-y-4">
                <h5 className="font-serif font-bold text-primary text-xl flex items-center gap-3">
                  <Star size={22} className="text-secondary" />
                  Final Astrological Guidance
                </h5>
                <p className="text-foreground/80 text-[14px] leading-relaxed whitespace-pre-wrap">
                  {data.response.astrological_guidance}
                </p>
              </div>
            )}

            <div className="pt-8 text-center space-y-6">
              <div className="h-px w-20 bg-primary/10 mx-auto"></div>
              <p className="text-[10px] text-foreground/40 leading-relaxed uppercase tracking-widest px-10">
                This report is based on Vedic Ashtakoot principles. A complete horoscope analysis is recommended before making any final life decisions.
              </p>
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

MatchmakingPDF.displayName = 'MatchmakingPDF';