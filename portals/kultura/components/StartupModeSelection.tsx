
import React from 'react';
import { fixOrphans } from '../types';

interface StartupModeSelectionProps {
  onSelectStandard: () => void;
  onSelectBlind: () => void;
  onRequestLocation: () => void;
  appLanguage: 'pl' | 'en';
}

export const StartupModeSelection: React.FC<StartupModeSelectionProps> = ({ onSelectStandard, onSelectBlind, onRequestLocation, appLanguage }) => {
  return (
    <div className="fixed inset-0 z-[7000] bg-black flex flex-col items-center justify-center p-6 sm:p-10 animate-fade-in overflow-y-auto">
      <div className="absolute inset-0 bg-[#C5A059]/5 pointer-events-none"></div>
      
      <div className="w-full max-w-2xl flex flex-col items-center gap-8 sm:gap-12 relative z-10 text-center py-10">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-zinc-900 border-2 border-[#C5A059]/40 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl mb-6">
            <img src="https://drive.google.com/thumbnail?id=1dHi9QX86UWj21YAIk3I8xyAXalzQkZpj&sz=w512" alt="CC" className="w-full h-full object-cover rounded-[2rem]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter italic">
            Christian Culture <span className="text-[#C5A059]">2026</span>
          </h2>
          <div className="flex flex-col gap-1">
            <p className="text-[#C5A059] text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">Wybierz tryb dostępu</p>
            <p className="text-zinc-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Select access mode</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {/* Tryb Standardowy */}
          <button 
            onClick={onSelectStandard}
            className="group relative h-56 sm:h-64 bg-zinc-900 border-2 border-white/5 rounded-[3rem] p-8 flex flex-col items-center justify-center gap-4 transition-all hover:border-[#C5A059]/40 hover:scale-[1.02] active:scale-95 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#C5A059]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-500">📱</span>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">Tryb Standardowy</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Standard Mode</p>
              <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter mt-2 leading-relaxed">
                Interfejs wizualny i planer<br/>Visual interface and planner
              </p>
            </div>
          </button>

          {/* Tryb Głosowy (Dla Niewidomych) */}
          <button 
            onClick={onSelectBlind}
            className="group relative h-56 sm:h-64 bg-zinc-900 border-4 border-[#C5A059]/30 rounded-[3rem] p-8 flex flex-col items-center justify-center gap-4 transition-all hover:border-[#C5A059] hover:scale-[1.02] active:scale-95 shadow-[0_0_50px_rgba(197,160,89,0.2)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#C5A059]/10 animate-pulse"></div>
            <span className="text-5xl sm:text-6xl animate-bounce">🎙️</span>
            <div className="text-center relative z-10">
              <h3 className="text-lg sm:text-xl font-black text-[#C5A059] uppercase tracking-tight">Tryb Głosowy</h3>
              <p className="text-white text-[10px] font-black uppercase tracking-widest mt-1">Voice Mode</p>
              <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-tighter mt-2 leading-relaxed">
                Dla osób niewidomych<br/>For visually impaired
              </p>
            </div>
          </button>
        </div>

        {/* Sekcja Lokalizacji - Teraz jako klikalny przycisk */}
        <button 
          onClick={onRequestLocation}
          className="w-full mt-4 p-6 bg-zinc-900/40 border-2 border-[#C5A059]/40 rounded-[2.5rem] space-y-4 hover:bg-zinc-900/60 hover:border-[#C5A059] transition-all active:scale-[0.98] group shadow-xl"
        >
           <div className="flex items-center justify-center gap-3 text-[#C5A059]">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Lokalizacja & Region / Location & Region</span>
           </div>
           <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed max-w-md mx-auto group-hover:text-zinc-300 transition-colors">
             {fixOrphans("Kliknij tutaj i zezwól na dostęp do lokalizacji, abyśmy mogli automatycznie dobrać Twój język i lokalną stację radiową. Wybór zostanie zapamiętany.")}
             <br/>
             <span className="opacity-60 italic">Click here and allow location access so we can automatically select your language and local radio station. Choice will be remembered.</span>
           </p>
        </button>

        <p className="text-[9px] text-zinc-800 font-black uppercase tracking-[0.3em] italic">
          Tryb możesz zmienić później w opcjach • Change mode later in settings
        </p>
      </div>
    </div>
  );
};
