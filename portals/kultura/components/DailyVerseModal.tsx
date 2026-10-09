
import React, { useState, useEffect, useCallback } from 'react';
import { BibleVerse, fixOrphans, ToastMessage } from '../types';

interface DailyVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyVerse: BibleVerse;
  appLanguage: 'pl' | 'en';
  onSpeakVerse: (verse: BibleVerse) => void;
  isMiriamSpeaking: boolean;
  onRefreshDailyVerse: () => void;
  addToast: (message: string, type?: ToastMessage['type']) => void; 
}

export const DailyVerseModal: React.FC<DailyVerseModalProps> = ({
  isOpen, onClose, dailyVerse, appLanguage, onSpeakVerse, isMiriamSpeaking, onRefreshDailyVerse, addToast,
}) => {
  const [fontSize, setFontSize] = useState<'text-base' | 'text-lg' | 'text-xl' | 'text-2xl'>('text-xl');
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);

  useEffect(() => { setIsLoadingVerse(false); }, [dailyVerse]);

  const handleShare = useCallback(async () => {
    const shareText = `"${dailyVerse.text}" — ${dailyVerse.reference}\n\nKorzystam z aplikacji Christian Culture | cclite.pl`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Werset Dnia - Christian Culture',
          text: shareText,
          url: 'https://cclite.pl'
        });
      } catch (err) {
        console.debug("Share cancelled or failed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        addToast(appLanguage === 'pl' ? "Skopiowano do schowka! ✨" : "Copied to clipboard! ✨", "success");
      } catch (err) {
        addToast(appLanguage === 'pl' ? "Nie udało się skopiować." : "Copy failed.", "info");
      }
    }
  }, [dailyVerse, appLanguage, addToast]);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIsLoadingVerse(true);
    onRefreshDailyVerse();
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-fade-in-scale-up">
      <div className="relative w-full max-w-4xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-[3rem] p-8 sm:p-12 shadow-3xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter leading-none">
              {appLanguage === 'pl' ? 'Werset z Biblii UBG' : 'UBG Bible Verse'}
            </h2>
            <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest mt-2">
              {dailyVerse.reference}
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-zinc-900 text-zinc-500 hover:text-white rounded-full transition-all border border-zinc-800 shadow-xl active:scale-95">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto px-2 space-y-6 scrollbar-thin ${fontSize} text-zinc-300 leading-relaxed font-serif`}>
          <div className="text-center py-10">
             <p className="text-white font-black !font-serif !italic text-3xl sm:text-4xl drop-shadow-lg">
                "{fixOrphans(dailyVerse.text)}"
             </p>
          </div>

          {dailyVerse.reflection && (
            <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 animate-fade-in">
              <h3 className="font-black text-[#C5A059] uppercase tracking-tight mb-2 text-base">Refleksja</h3>
              <p>{fixOrphans(dailyVerse.reflection)}</p>
            </div>
          )}

          <div className="p-6 border-t border-zinc-800 text-center opacity-40">
             <p className="text-[10px] uppercase font-black tracking-[0.3em]">Uwspółcześniona Biblia Gdańska</p>
          </div>

          {/* Wymagana stopka wewnątrz modala */}
          <div className="w-full text-center py-6 border-t border-white/5">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest opacity-80">
              Korzystam z aplikacji Christian Culture | <span className="text-[#C5A059] underline">cclite.pl</span>
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 px-8 py-6 flex items-center justify-center gap-6 bg-zinc-950 border-t border-zinc-800">
          <button
            onClick={() => onSpeakVerse(dailyVerse)}
            disabled={isMiriamSpeaking}
            className={`w-14 h-14 bg-zinc-900 rounded-full text-[#C5A059] flex items-center justify-center border border-zinc-800 shadow-md active:scale-90 transition-all ${isMiriamSpeaking ? 'animate-pulse' : ''}`}
            title={appLanguage === 'pl' ? 'Czytaj werset' : 'Read verse'}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          </button>

          <button
            onClick={handleShare}
            className="w-16 h-16 bg-[#C5A059] text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(197,160,89,0.3)] active:scale-90 transition-all"
            title={appLanguage === 'pl' ? 'Udostępnij werset' : 'Share verse'}
          >
            <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
          
          <button 
              onClick={handleRefresh} 
              disabled={isLoadingVerse}
              className="w-14 h-14 bg-zinc-900 text-[#C5A059] rounded-full flex items-center justify-center border border-zinc-800 shadow-md active:scale-90 transition-all"
              title={appLanguage === 'pl' ? 'Losuj nowy werset' : 'Randomize new verse'}
          >
              <svg className={`w-8 h-8 ${isLoadingVerse ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
