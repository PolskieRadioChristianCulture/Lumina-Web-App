import React, { useState, useEffect, useMemo } from 'react';
import { fixOrphans } from '../types';

interface InstallationCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  appLanguage: 'pl' | 'en';
}

export const InstallationCounterModal: React.FC<InstallationCounterModalProps> = ({ isOpen, onClose, onInstall, appLanguage }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const savedCount = parseInt(localStorage.getItem('cc_global_install_sim') || '5');
      setCount(savedCount);

      let start = 0;
      const end = savedCount; 
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(Math.floor(end));
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const formattedCount = useMemo(() => {
    return count.toString().padStart(9, '0').replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }, [count]);

  if (!isOpen) return null;

  const handleJoinChallenge = () => {
    const newCount = count + 1;
    setCount(newCount);
    localStorage.setItem('cc_global_install_sim', newCount.toString());
    onInstall();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[8500] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-[#C5A059]/30 rounded-[3.5rem] p-8 sm:p-12 shadow-[0_50px_100px_-20px_rgba(197,160,89,0.3)] flex flex-col items-center text-center overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#C5A059]/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 mb-6">
          <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center border-2 border-[#C5A059]/20 shadow-2xl mx-auto mb-6 animate-floating-button-pulse">
            <span className="text-4xl">🌍</span>
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight italic mb-2">
            Wyzwanie!
          </h2>
          <p className="text-[11px] font-black text-[#C5A059] uppercase tracking-[0.4em]">
            Miliard pobrań ku Bożej chwale
          </p>
        </div>

        <div className="relative z-10 w-full bg-black/40 border border-white/5 rounded-[2.5rem] p-6 sm:p-8 mb-8 shadow-inner group overflow-hidden">
           <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-4 group-hover:text-zinc-400 transition-colors">
                AKTUALNY STAN LICZNIKA
              </span>
              <div className="text-[8vw] sm:text-4xl md:text-5xl font-mono font-black text-white tracking-[0.1em] drop-shadow-[0_0_15px_rgba(197,160,89,0.5)] whitespace-nowrap">
                {formattedCount}
              </div>
           </div>
        </div>

        <div className="space-y-6 w-full relative z-10">
          <p className="text-zinc-400 text-[11px] font-medium leading-relaxed italic px-4">
            {fixOrphans("Bądź częścią największej cyfrowej ewangelizacji w historii. Każda instalacja to jeden głos więcej głoszący Dobrą Nowinę w jakości HI-RES.")}
          </p>

          <button
            onClick={handleJoinChallenge}
            className="w-full py-6 bg-[#C5A059] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span>✨</span> DOŁĄCZ DO WYZWANIA
          </button>
          
          <button 
            onClick={onClose}
            className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors"
          >
            MOŻE PÓŹNIEJ
          </button>
        </div>

        <footer className="mt-8 pt-6 border-t border-white/5 w-full">
           <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest">
             Soli Deo Gloria • Christian Culture Global
           </p>
        </footer>
      </div>
    </div>
  );
};