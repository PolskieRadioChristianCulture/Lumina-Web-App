import React, { useState, useCallback } from 'react';
import { fixOrphans, APP_VERSION } from '../types';

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
}

const STEPS: TutorialStep[] = [
  {
    title: `Christian Culture v${APP_VERSION}\nTwoje Duchowe Centrum`,
    description: fixOrphans("Witaj w roku 2026. Nowa wersja to owoc połączenia najpotężniejszej sztucznej inteligencji z wiecznym Słowem Bożym. Przygotowaliśmy dla Ciebie przestrzeń do uświęcenia w najwyższej jakości."),
    icon: "🌟"
  },
  {
    title: "Christian Cloud & Persistence",
    description: fixOrphans("Twoje modlitwy, cele i notatki są teraz bezpieczne. Dzięki stałej integracji z Dyskiem Google, Twoje dane są synchronizowane między wszystkimi urządzeniami i nie znikną po odświeżeniu aplikacji."),
    icon: "☁️"
  },
  {
    title: "Niedziela - Pierwszy Dzień",
    description: fixOrphans("Nasz kalendarz przywraca biblijny porządek: Niedziela jest zawsze pierwszym dniem tygodnia. Planuj czas od poranka w pierwszym dniu, oddając Panu pierwociny swojego tygodnia."),
    icon: "📅"
  },
  {
    title: "Klucz Inteligencji PRO",
    description: fixOrphans("Podepnij własny klucz Google AI w ustawieniach, aby odblokować generowanie grafik 1K/2K, pełną analizę uświęcenia oraz brak limitów w rozmowach z Miriam AI."),
    icon: "🔑"
  },
  {
    title: "Cuda Każdego Dnia - 18:00",
    description: fixOrphans("Codziennie o 18:00 system powiadomi Cię o premierze na YouTube. Możesz dołączyć natychmiast lub odłożyć przypomnienie o 15, 30 lub 60 minut."),
    icon: "🎬"
  },
  {
    title: "Tryb Inteligentny & GPS",
    description: fixOrphans("Aplikacja potrafi automatycznie dobrać język i regionalną stację radiową na podstawie Twojej lokalizacji. Wystarczy jeden przycisk, by CC Radio dostosowało się do Twojego miejsca na świecie."),
    icon: "🚀"
  },
  {
    title: "Gotowy na wzrost z Panem?",
    description: fixOrphans("Wszystkie te narzędzia służą jednemu celowi: Twojemu uświęceniu i zbliżeniu do Chrystusa. Niech rok 2026 będzie czasem Twojego największego przełomu.<br/>Chwała Panu! ✨"),
    icon: "✨"
  }
];

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  }, [currentStep, onComplete]);

  const handleBack = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  return (
    <div className="fixed inset-0 z-[6100] flex items-center justify-center px-6 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl pointer-events-auto" onClick={() => handleNext()} />
      <div className="relative z-[6110] max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-[3rem] p-10 sm:p-12 shadow-[0_30px_100px_rgba(197,160,89,0.3)] pointer-events-auto animate-fade-in flex flex-col items-center">
        
        {currentStep > 0 && (
          <button 
            onClick={(e) => { e.stopPropagation(); onComplete(); }} 
            className="absolute top-6 right-10 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#C5A059] transition-colors"
          >
            Pomiń
          </button> 
        )}
        
        <div className="flex flex-col items-center text-center space-y-8 w-full mt-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#C5A059] rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-[#C5A059] to-[#A68043] rounded-[2rem] flex items-center justify-center text-white text-5xl shadow-2xl relative z-10 border border-white/20 animate-floating-button-pulse">
              {STEPS[currentStep].icon}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white leading-tight tracking-tighter whitespace-pre-line uppercase italic">{STEPS[currentStep].title}</h3> 
            <p 
              className="text-zinc-400 text-sm font-medium leading-relaxed"
              dangerouslySetInnerHTML={{ __html: fixOrphans(STEPS[currentStep].description) }}
            />
          </div>
          
          <div className="w-full flex flex-col items-center gap-8 pt-10 border-t border-zinc-900">
            <div className="flex gap-2">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${i === currentStep ? 'w-10 bg-[#C5A059]' : 'w-2 bg-zinc-800'}`} />
              ))}
            </div>
            
            <div className="flex gap-4 justify-center w-full">
              {currentStep > 0 && (
                <button 
                  onClick={handleBack} 
                  className="flex-1 py-5 bg-zinc-900 text-zinc-500 font-black text-[11px] uppercase tracking-widest rounded-2xl border border-zinc-800 hover:text-white transition-all"
                >
                  Wstecz
                </button>
              )}
              
              <button 
                onClick={handleNext} 
                className="flex-[2] py-5 bg-[#C5A059] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                {currentStep === STEPS.length - 1 ? 'Chwała Panu!' : 'Dalej'} 
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};