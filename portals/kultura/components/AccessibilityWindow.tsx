
import React from 'react';
import { BibleVerse, fixOrphans } from '../types';

interface AccessibilityWindowProps {
  isOpen: boolean;
  onClose: () => void;
  verse: BibleVerse | null;
  appLanguage: 'pl' | 'en';
}

export const AccessibilityWindow: React.FC<AccessibilityWindowProps> = ({ isOpen, onClose, verse, appLanguage }) => {
  if (!isOpen || !verse) return null;

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto" onClick={onClose}></div>
      <div className="relative w-full max-w-[320px] bg-zinc-900 border-2 border-[#C5A059] rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto animate-fade-in-scale-up">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 bg-[#C5A059]/10 rounded-2xl flex items-center justify-center border border-[#C5A059]/30 text-[#C5A059] shadow-inner animate-pulse">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">{appLanguage === 'pl' ? 'DOSTĘP DO WERSETU' : 'VERSE ACCESS'}</h3>
            <p className="text-[#C5A059] text-[9px] font-bold uppercase tracking-widest">{appLanguage === 'pl' ? 'Werset skopiowany i gotowy' : 'Verse copied and ready'}</p>
          </div>

          <div className="w-full p-4 bg-black/40 rounded-2xl border border-white/5">
            <p className="text-[10px] font-serif italic text-zinc-400 leading-relaxed">
              "{fixOrphans(verse.text.substring(0, 80))}..."
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full py-4 bg-[#C5A059] text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            {appLanguage === 'pl' ? 'ZAMKNIJ POWIADOMIENIE' : 'CLOSE NOTIFICATION'}
          </button>
        </div>
      </div>
    </div>
  );
};
