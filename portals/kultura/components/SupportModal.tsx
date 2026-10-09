
import React, { useCallback } from 'react';
import { ToastMessage, fixOrphans, CHRISTIAN_CULTURE_HOMEPAGE_URL } from '../types';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (message: string, type?: ToastMessage['type']) => void;
  onReturnToTop: () => void;
  appLanguage: 'pl' | 'en';
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, addToast, appLanguage }) => {
  if (!isOpen) return null;

  const handleCopyBlik = () => {
    navigator.clipboard.writeText("537 147 043");
    addToast(appLanguage === 'pl' ? "Numer BLIK skopiowany!" : "BLIK number copied!", "success");
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[3rem] shadow-3xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="px-8 pt-8 pb-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              {appLanguage === 'pl' ? 'Wesprzyj' : 'Support'} <span className="text-[#C5A059]">{appLanguage === 'pl' ? 'Misję' : 'Mission'}</span>
            </h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Razem głosimy Ewangelię</p>
          </div>
          <button onClick={onClose} className="p-3 bg-zinc-900 text-zinc-500 hover:text-white rounded-full transition-all border border-zinc-800">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
          <div className="bg-[#C5A059]/10 p-6 rounded-[2rem] border border-[#C5A059]/20 text-center">
            <p className="text-zinc-300 text-sm leading-relaxed italic">
              {fixOrphans(appLanguage === 'pl' 
                ? "Twoje dobrowolne wsparcie pozwala nam na rozwój aplikacji, utrzymanie radia i docieranie z Dobrą Nowiną do tysięcy serc. Dziękujemy za każdą cegiełkę!" 
                : "Your voluntary support allows us to develop the app, maintain the radio, and reach thousands of hearts with the Good News. Thank you for every contribution!")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Zrzutka 1: Budowa aplikacji */}
            <button 
              onClick={() => window.open("https://zrzutka.pl/3bbxzn", "_blank")}
              className="group p-6 bg-zinc-900 border border-zinc-800 rounded-[2rem] hover:border-[#C5A059]/50 transition-all text-left"
            >
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🚀</span>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">Zrzutka: Aplikacja</h4>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Budowa i utrzymanie CC Lite</p>
            </button>

            {/* Zrzutka 2: Misja Globalna */}
            <button 
              onClick={() => window.open("https://zrzutka.pl/rs4g4v", "_blank")}
              className="group p-6 bg-zinc-900 border border-zinc-800 rounded-[2rem] hover:border-[#C5A059]/50 transition-all text-left"
            >
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🌍</span>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">Zrzutka: Misja</h4>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Wsparcie działań globalnych</p>
            </button>

            {/* BLIK */}
            <button 
              onClick={handleCopyBlik}
              className="group p-6 bg-zinc-900 border border-zinc-800 rounded-[2rem] hover:border-[#C5A059]/50 transition-all text-left relative overflow-hidden"
            >
              <div className="absolute top-4 right-6 text-[8px] font-black text-[#C5A059] opacity-40 group-hover:opacity-100 transition-opacity">KLIKNIJ BY KOPIOWAĆ</div>
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">📲</span>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">Wsparcie BLIK</h4>
              <p className="text-[11px] text-[#C5A059] font-black tracking-widest">537 147 043</p>
            </button>

            {/* Revolut */}
            <button 
              onClick={() => window.open("https://revolut.me/christianculture", "_blank")}
              className="group p-6 bg-zinc-900 border border-zinc-800 rounded-[2rem] hover:border-[#C5A059]/50 transition-all text-left"
            >
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">💳</span>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">Revolut Link</h4>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Bezpieczne wpłaty online</p>
            </button>
          </div>

          <div className="pt-4 space-y-3">
             <button 
                onClick={() => window.open("https://www.paypal.me/CezaryRogowski", "_blank")}
                className="w-full py-5 bg-blue-900/40 border border-blue-500/30 text-blue-200 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-800 transition-all flex items-center justify-center gap-3"
             >
               <span className="text-xl">🅿️</span> PAYPAL SUPPORT
             </button>
             <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 text-center">Numer Konta Bankowego</p>
                <p className="text-[11px] font-mono text-zinc-300 text-center select-all">48 2910 0006 0000 0000 0527 2629</p>
                <p className="text-[8px] text-zinc-600 text-center mt-2 uppercase tracking-tighter">Tytuł: Darowizna na cele misyjne</p>
             </div>
          </div>
        </div>

        <div className="p-8 border-t border-white/5 bg-zinc-900/50 flex-shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-5 bg-[#C5A059] text-black font-black uppercase tracking-widest rounded-[1.5rem] shadow-2xl text-xs hover:scale-[1.02] active:scale-95 transition-all"
          >
            {appLanguage === 'pl' ? 'POWRÓT DO RADIA' : 'BACK TO RADIO'}
          </button>
        </div>
      </div>
    </div>
  );
};
