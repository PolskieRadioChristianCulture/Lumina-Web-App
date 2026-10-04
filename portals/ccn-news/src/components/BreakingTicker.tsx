import React from 'react';
import { Volume2 } from 'lucide-react';
import { BREAKING_NEWS } from '../data/articles';

interface BreakingTickerProps {
  badgeText?: string;
  items?: string[];
  onSelectHeadline?: (text: string) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  badgeText = 'PILNE',
  items = BREAKING_NEWS,
  onSelectHeadline,
}) => {
  const tickerItems = items && items.length > 0 ? items : BREAKING_NEWS;
  // Zdublowana lista dla idealnie płynnej, bezszwowej pętli (seamless infinite loop)
  const duplicatedItems = [...tickerItems, ...tickerItems];

  return (
    <div className="bg-[#0a0a0a] text-gray-200 border-b border-[#222222] select-none py-2 px-3 sm:px-4 relative overflow-hidden z-20">
      <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-4">
        {/* Plakietka kategorii / statusu */}
        <div className="flex items-center gap-1.5 shrink-0 bg-[#bb142e] text-white font-extrabold px-2.5 py-1 rounded text-[10px] sm:text-[11px] tracking-widest uppercase shadow-sm z-10 border border-red-700/40">
          <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
          <span>{badgeText}</span>
        </div>

        {/* Płynny przewijany pasek (Marquee) z maską gradientową */}
        <div
          className="flex-1 overflow-hidden relative"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
          }}
        >
          <div className="ccn-ticker-track">
            {duplicatedItems.map((item, idx) => (
              <span
                key={idx}
                onClick={() => onSelectHeadline?.(item)}
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

      {/* Pancerne style animacji ticker wstrzyknięte bezpośrednio */}
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
