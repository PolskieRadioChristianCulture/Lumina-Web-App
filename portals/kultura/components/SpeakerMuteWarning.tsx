import React, { useState, useEffect } from 'react';

interface SpeakerMuteWarningProps {
  appLanguage: 'pl' | 'en';
}

export const SpeakerMuteWarning: React.FC<SpeakerMuteWarningProps> = ({ appLanguage }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleTrigger = (e: any) => {
      if (e.detail?.type === 'check_audio') {
        setIsVisible(true);
        
        // Haptic Feedback: Morse Code for "V" (Volume) - [dot, dot, dot, dash]
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100, 50, 100, 50, 400]);
        }

        // Auto-hide after 8 seconds
        setTimeout(() => setIsVisible(false), 8000);
      }
    };
    window.addEventListener('cc-trigger-mute-warning', handleTrigger);
    return () => window.removeEventListener('cc-trigger-mute-warning', handleTrigger);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col items-center justify-center animate-fade-in px-8">
      <div className="bg-black/90 backdrop-blur-3xl border-2 border-[#C5A059] rounded-[4rem] p-12 flex flex-col items-center text-center shadow-[0_0_150px_rgba(197,160,89,0.4)]">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-[#C5A059] rounded-full blur-3xl opacity-40 animate-ping"></div>
          <div className="w-32 h-32 bg-[#C5A059] rounded-full flex items-center justify-center text-black shadow-2xl relative z-10 animate-bounce">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </div>
          
          {/* Efekt wizualny fal dźwiękowych */}
          <div className="absolute -inset-4 border-2 border-[#C5A059] rounded-full animate-ping opacity-20"></div>
          <div className="absolute -inset-8 border-2 border-[#C5A059] rounded-full animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-none italic">
          {appLanguage === 'pl' ? 'Włącz Dźwięk!' : 'Turn on Sound!'}
        </h3>
        <p className="text-[#C5A059] text-[11px] font-black uppercase tracking-[0.4em] leading-relaxed max-w-[200px]">
          {appLanguage === 'pl' 
            ? 'Sprawdź przełącznik boczny lub głośność multimediów.' 
            : 'Check side switch or media volume.'}
        </p>
        
        <button 
          onClick={() => setIsVisible(false)}
          className="mt-10 px-8 py-3 bg-white/10 rounded-full text-[9px] font-black text-zinc-400 uppercase tracking-widest pointer-events-auto hover:text-white transition-colors"
        >
          Zamknij powiadomienie
        </button>
      </div>
    </div>
  );
};
