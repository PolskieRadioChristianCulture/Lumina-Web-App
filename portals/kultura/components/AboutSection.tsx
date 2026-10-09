

import React, { useState } from 'react';
import { fixOrphans } from '../types';

interface AboutSectionProps {
  appLanguage: 'pl' | 'en'; 
}

export const AboutSection: React.FC<AboutSectionProps> = ({ appLanguage }) => {
  const [expanded, setExpanded] = useState(false);

  const NazirLink = () => (
    <a 
      href="https://wa.me/48537137043" 
      target="_blank" 
      rel="noopener noreferrer" // Added for security
      className="text-[#C5A059] font-black no-underline hover:text-[#E2B859] transition-all"
    >
      NAZIR
    </a>
  );

  return (
    <div className="py-8 text-center text-zinc-500 dark:text-zinc-600 transition-all duration-500">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="text-[10px] font-black uppercase tracking-widest hover:text-[#C5A059] transition-colors flex items-center justify-center gap-2 mx-auto"
      >
        <span className="text-xl">✨</span> {expanded ? (appLanguage === 'pl' ? 'Ukryj szczegóły' : 'Hide details') : (appLanguage === 'pl' ? 'Poznajmy się bliżej' : 'Get to know us better')}
      </button>

      {expanded && (
        <div className="mt-6 space-y-4 animate-fade-in-down text-zinc-400 dark:text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto">
          <p>
            {appLanguage === 'pl' ? (
              <>
                {fixOrphans("Christian Culture 2026 to owoc głębokiej pasji do Słowa Bożego i pragnienia, aby każdy dzień był świadectwem żywej wiary. Stworzona przez ")}
                <NazirLink />
                {fixOrphans(", aby służyć Tobie w Twojej drodze uświęcenia.")}
              </>
            ) : (
              <>
                {"Christian Culture 2026 is the fruit of a deep passion for God's Word and a desire for every day to be a testament to living faith. Created by "}
                <NazirLink />
                {" to serve you on your path of sanctification."}
              </>
            )}
          </p>
          <p>{fixOrphans(appLanguage === 'pl' 
            ? "Wierzymy, że technologia, jeśli jest używana z mądrością, może stać się potężnym narzędziem w budowaniu Królestwa Bożego na ziemi. Dziękujemy, że jesteś częścią tej misji!"
            : "We believe that technology, when used with wisdom, can become a powerful tool in building the Kingdom of God on earth. Thank you for being part of this mission!")}</p>
          <p className="font-bold text-[#C5A059]">{fixOrphans(appLanguage === 'pl' ? "Soli Deo Gloria!" : "To God Alone Be the Glory!")}</p>
        </div>
      )}
    </div>
  );
};