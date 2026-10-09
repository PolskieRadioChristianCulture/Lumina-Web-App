import React from 'react';

const TICKER_ITEMS = [
  "Kultura Christian Culture: Piękno, prawda i dobro jako Boży wzorzec w sztuce i muzyce (Flp 4:8)",
  "Twórczość z Misją: Chrześcijańskie inspiracje w literaturze, teatrze i mediach cyfrowych",
  "Dziedzictwo Wiary: Odkrywanie chrześcijańskich korzeni tożsamości kulturowej",
  "Festiwale i Koncerty: Promocja artystów i projektów audiowizualnych na chwałę Stwórcy"
];
const DUPLICATED_ITEMS = [...TICKER_ITEMS, ...TICKER_ITEMS];

export const BroadcastTicker: React.FC = () => {
  return (
    <div className="bg-[#0a0a0a] text-gray-200 border-b border-[#222222] select-none py-2 px-3 sm:px-4 relative overflow-hidden z-20">
      <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-4">
        {/* Badge */}
        <div className="flex items-center gap-1.5 shrink-0 bg-[#bb142e] text-white font-extrabold px-2.5 py-1 rounded text-[10px] sm:text-[11px] tracking-widest uppercase shadow-sm z-10 border border-red-700/40">
          <svg className="w-3.5 h-3.5 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>KULTURA</span>
        </div>

        {/* Continuous Scrolling Track */}
        <div 
          className="flex-1 overflow-hidden relative"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)'
          }}
        >
          <div className="ccn-ticker-track">
            {DUPLICATED_ITEMS.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2.5 mx-5 sm:mx-7 text-xs sm:text-[13px] text-zinc-300 font-medium hover:text-[#f9282b] transition-colors cursor-pointer shrink-0"
                title={item}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f9282b] shrink-0 shadow-[0_0_6px_#f9282b]" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ccnBroadcastTicker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .ccn-ticker-track {
          display: inline-flex !important;
          white-space: nowrap !important;
          width: max-content !important;
          will-change: transform;
          animation: ccnBroadcastTicker 40s linear infinite !important;
        }
        .ccn-ticker-track:hover {
          animation-play-state: paused !important;
        }
      `}} />
    </div>
  );
};
