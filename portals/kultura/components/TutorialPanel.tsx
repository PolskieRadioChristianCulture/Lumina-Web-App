import React from 'react';
import { fixOrphans, APP_VERSION } from '../types';

interface TutorialPanelProps {
  isOpen: boolean;
  onClose: () => void;
  appLanguage: 'pl' | 'en';
  onOpenRadioMode: () => void;
}

interface TutorialItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  tag?: string;
}

const TUTORIAL_ITEMS_PL: TutorialItem[] = [
  {
    id: 'christian-cloud',
    title: "Christian Cloud 2026",
    tag: "STABILNOŚĆ",
    description: "Wprowadziliśmy 'Persistence Service'. Twoje połączenie z Dyskiem Google i Kalendarzem jest teraz stałe. Raz podłączone serwisy pozostają aktywne aż do Twojego rozłączenia.",
    icon: "☁️"
  },
  {
    id: 'pro-key-verify',
    title: "Weryfikacja Klucza AI",
    tag: "NOWOŚĆ",
    description: "Teraz możesz potwierdzić status swojego klucza Google AI. Przycisk weryfikacji w sekcji 'Opcje' sprawdza stabilność połączenia z serwerami Google Intelligence.",
    icon: "💎"
  },
  {
    id: 'yt-premiere',
    title: "Premiery o 18:00",
    tag: "INTERAKCJA",
    description: "System 'Cuda Każdego Dnia' otrzymał opcję drzemki. Jeśli nie możesz obejrzeć audycji o 18:00, system przypomni Ci o niej później, zgodnie z Twoim wyborem.",
    icon: "📺"
  },
  {
    id: 'smart-start-v2',
    title: "Smart Mode & GPS",
    tag: "V4.5",
    description: "Ulepszony tryb inteligentny. Aplikacja nie tylko dobiera język, ale inteligentnie zarządza energią ekranu ('Keep Screen On'), by radio nie przerywało pracy.",
    icon: "🚀"
  },
  {
    id: 'biblical-order',
    title: "Biblijny Porządek Czasu",
    tag: "FUNDAMENT",
    description: "Niedziela to zawsze I dzień tygodnia. W sekcji 'Twój Dzień' znajdziesz precyzyjne czasy rozpoczęcia i zakończenia Sabatu dla Twojej lokalizacji.",
    icon: "📅"
  }
];

const TUTORIAL_ITEMS_EN: TutorialItem[] = [
  {
    id: 'christian-cloud',
    title: "Christian Cloud 2026",
    tag: "STABILITY",
    description: "Persistence Service is live. Your connection to Google Drive and Calendar is now permanent. Once connected, services stay active until you decide to disconnect.",
    icon: "☁️"
  },
  {
    id: 'pro-key-verify',
    title: "AI Key Verification",
    tag: "NEW",
    description: "Now you can confirm your Google AI key status. The verification button in 'Prefs' checks the stability of your connection to Google Intelligence servers.",
    icon: "💎"
  },
  {
    id: 'yt-premiere',
    title: "18:00 Premieres",
    tag: "INTERACTION",
    description: "The 'Miracles Every Day' system now features a snooze option. If you can't watch at 18:00, the system will remind you later based on your preference.",
    icon: "📺"
  },
  {
    id: 'smart-start-v2',
    title: "Smart Mode & GPS",
    tag: "V4.5",
    description: "Enhanced smart mode. The app not only selects the language but intelligently manages screen power ('Keep Screen On') to ensure uninterrupted radio playback.",
    icon: "🚀"
  },
  {
    id: 'biblical-order',
    title: "Biblical Time Order",
    tag: "FOUNDATION",
    description: "Sunday is always the 1st day. In 'Your Day' section, find precise Sabbath start and end times calculated for your location.",
    icon: "📅"
  }
];

export const TutorialPanel: React.FC<TutorialPanelProps> = ({ isOpen, onClose, appLanguage, onOpenRadioMode }) => {
  const items = appLanguage === 'pl' ? TUTORIAL_ITEMS_PL : TUTORIAL_ITEMS_EN;

  return (
    <>
      <div 
        className={`fixed inset-0 z-[4000] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] z-[4001] bg-zinc-950 border-l border-white/10 shadow-4xl transform transition-transform duration-500 ease-in-out overflow-hidden flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-center px-8 sm:px-10 pt-8 pb-6 flex-shrink-0 relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">
              {appLanguage === 'pl' ? 'Przewodnik' : 'Guide'} <span className="text-[#C5A059]">CC v{APP_VERSION}</span>
            </h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">
              Building Your Spiritual Fortress
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-zinc-900 rounded-full text-zinc-500 shadow-lg hover:bg-zinc-800 transition-all hover:text-[#C5A059] active:scale-90 border border-zinc-800"
            title={appLanguage === 'pl' ? "Zamknij" : "Close"}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 sm:px-10 pb-10 space-y-4 relative z-10 scrollbar-thin">
          <div className="bg-[#C5A059]/5 rounded-2xl p-5 border border-[#C5A059]/10 mb-4 text-center">
            <p className="text-zinc-400 text-[11px] leading-relaxed italic">
              {appLanguage === 'pl' ? 'Odkryj pełen potencjał Christian Culture w roku 2026.' : 'Discover the full potential of Christian Culture in 2026.'}
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800/50 hover:border-[#C5A059]/30 transition-all group relative overflow-hidden">
                {item.tag && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-[#C5A059] text-black text-[7px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
                    {item.tag}
                  </div>
                )}
                <div className="flex items-center gap-5 mb-3">
                  <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#C5A059] transition-colors pr-10">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {fixOrphans(item.description)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 border-t border-white/10 bg-black/40 flex-shrink-0 relative z-20 space-y-4">
          <button
            onClick={onClose}
            className="w-full py-5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            {appLanguage === 'pl' ? 'GOTOWE' : 'DONE'}
          </button>
          
          <button 
            onClick={() => { onClose(); onOpenRadioMode(); }}
            className="w-full py-6 bg-[#C5A059] text-black font-black uppercase tracking-widest rounded-[2rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            {appLanguage === 'pl' ? 'POWRÓT DO PANELU GŁÓWNEGO' : 'BACK TO MAIN PANEL'}
          </button>
        </div>
      </div>
    </>
  );
};