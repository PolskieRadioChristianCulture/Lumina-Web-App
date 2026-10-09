
import React from 'react';
import { BIBLE_TRANSLATIONS, BibleTranslation, AppLanguage } from '../types';

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId: string;
  onSelect: (translation: BibleTranslation) => void;
  onSelectRandom: () => void;
  appLanguage: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
}

export const TranslationModal: React.FC<TranslationModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedId, 
  onSelect, 
  onSelectRandom,
  appLanguage,
  onLanguageChange
}) => {
  if (!isOpen) return null;

  const languages: { id: AppLanguage; name: string; flag: string }[] = [
    { id: 'pl', name: 'Polski', flag: '🇵🇱' },
    { id: 'en', name: 'English', flag: '🇺🇸' },
    { id: 'es', name: 'Español', flag: '🇪🇸' },
    { id: 'pt', name: 'Português', flag: '🇵🇹' },
    { id: 'fr', name: 'Français', flag: '🇫🇷' },
    { id: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { id: 'it', name: 'Italiano', flag: '🇮🇹' },
    { id: 'uk', name: 'Українська', flag: '🇺🇦' },
  ];

  const categories = Array.from(new Set(BIBLE_TRANSLATIONS.map(t => t.category)));

  return (
    <div className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in-scale-up" onClick={onClose}>
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[3rem] p-10 shadow-3xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8 flex-shrink-0">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">
            {appLanguage === 'pl' ? 'Wybierz' : 'Select'} <span className="text-[#C5A059]">{appLanguage === 'pl' ? 'Język / Przekład' : 'Language / Translation'}</span>
          </h3>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 pr-2 scrollbar-thin">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1">
              {appLanguage === 'pl' ? 'Język Aplikacji' : 'App Language'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {languages.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => onLanguageChange(lang.id)}
                  className={`py-4 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                    appLanguage === lang.id 
                      ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-lg shadow-[#C5A059]/20 scale-105' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-[#C5A059]/50 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-4">
             <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1">
               {appLanguage === 'pl' ? 'Baza Słowa Bożego' : 'Word of God Database'}
             </h4>
             <button
               onClick={onSelectRandom}
               className="w-full py-4 bg-zinc-900 border border-[#C5A059]/40 text-[#C5A059] font-black text-xs uppercase tracking-widest rounded-xl shadow-md hover:bg-[#C5A059] hover:text-black transition-all flex items-center justify-center gap-2"
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 14a4 4 0 100-8 4 4 0 000 8zM12 8a1 1 0 100 2 1 1 0 000-2z" /></svg>
               {appLanguage === 'pl' ? 'Losowy Przekład Dnia' : 'Random Verse Translation'}
             </button>

             {categories.map(cat => (
               <div key={cat} className="space-y-3">
                 <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{cat} VERSIONS</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                   {BIBLE_TRANSLATIONS.filter(t => t.category === cat).map(translation => (
                     <button
                       key={translation.id}
                       onClick={() => onSelect(translation)}
                       className={`text-left p-4 rounded-xl border text-xs font-bold transition-all ${
                         selectedId === translation.id 
                           ? 'bg-[#C5A059]/10 border-[#C5A059] text-white shadow-inner' 
                           : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                       }`}
                     >
                       {translation.name}
                     </button>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
