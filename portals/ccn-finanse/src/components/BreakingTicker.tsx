import React from 'react';
import { AlertCircle } from 'lucide-react';

const TICKER_ITEMS = [
  "Szafarstwo Boże: Ponad 2350 wersetów w Biblii dotyczy pieniędzy i odpowiedzialności za powierzone dobra",
  "Wolność od Zadłużenia: Zasada „dłużnik jest sługą wierzyciela” (Prz 22:7) i sprawdzona droga do wolności",
  "Mądrość Przysłów: Oszczędność, pracowitość i unikanie pochopnych poręczeń fundamentem stabilności",
  "Serce Dawcy: „Więcej szczęścia jest w dawaniu aniżeli w braniu” (Dz 20:35) – tajemnica Bożego pomnożenia"
];

export const BreakingTicker: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-[#010101] via-[#141414] to-[#010101] border-b border-[#262626] text-white py-2 px-4 select-none">
      <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-hidden text-xs">
        <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-sm bg-[#bb142e] text-white font-black tracking-widest uppercase text-[10px] shadow-xs">
          <AlertCircle className="w-3 h-3 animate-pulse" />
          <span>FINANSE</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
            {TICKER_ITEMS.map((item, idx) => (
              <span key={idx} className="flex items-center gap-2 text-zinc-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f9282b]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
