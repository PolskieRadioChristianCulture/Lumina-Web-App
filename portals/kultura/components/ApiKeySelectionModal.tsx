
import React from 'react';

interface ApiKeySelectionModalProps {
  isOpen: boolean;
  onSelectKey: () => void;
  appLanguage: 'pl' | 'en';
}

export const ApiKeySelectionModal: React.FC<ApiKeySelectionModalProps> = ({ isOpen, onSelectKey, appLanguage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/95 backdrop-blur-2xl px-6 animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-[#C5A059]/30 rounded-[3rem] p-10 sm:p-12 shadow-[0_30px_100px_rgba(0,0,0,1)] text-center">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#C5A059] to-[#A68043] rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl mb-8 animate-floating-button-pulse">
          🔑
        </div>
        
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
          {appLanguage === 'pl' ? 'Wymagana Autoryzacja' : 'Authorization Required'}
        </h2>
        
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          {appLanguage === 'pl' 
            ? 'Aby korzystać z zaawansowanych funkcji generowania grafiki Christian Culture (1K/Pro), musisz wybrać własny klucz API z płatnego projektu Google Cloud.'
            : 'To use advanced Christian Culture graphics generation (1K/Pro), you must select your own API key from a paid Google Cloud project.'}
        </p>

        <div className="space-y-6">
          <button
            onClick={onSelectKey}
            className="w-full py-5 bg-[#C5A059] text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            {appLanguage === 'pl' ? 'WYBIERZ KLUCZ API' : 'SELECT API KEY'}
          </button>
          
          <div className="flex flex-col gap-2">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-[#C5A059] hover:underline uppercase tracking-widest"
            >
              {appLanguage === 'pl' ? 'DOKUMENTACJA ROZLICZEŃ' : 'BILLING DOCUMENTATION'}
            </a>
            <p className="text-[8px] text-zinc-600 font-mono uppercase tracking-tighter">
              Solus Christus • Sola Scriptura
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
