
import React from 'react';
import { fixOrphans } from '../types';

interface PrivacyComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  appLanguage: 'pl' | 'en';
}

export const PrivacyComplianceModal: React.FC<PrivacyComplianceModalProps> = ({ isOpen, onClose, appLanguage }) => {
  if (!isOpen) return null;

  const contentPl = [
    {
      title: "1. Przechowywanie Danych",
      text: "Christian Culture Lite 2026 jest aplikacją typu Client-Side. Oznacza to, że Twoje modlitwy, cele, notatki oraz dane profilowe są przechowywane wyłącznie w pamięci podręcznej Twojej przeglądarki (LocalStorage). My, jako twórcy, nie mamy do nich dostępu."
    },
    {
      title: "2. Integracja z Chmurą (Christian Cloud)",
      text: "Jeśli zdecydujesz się podłączyć Dysk Google lub Kalendarz, aplikacja będzie wysyłać Twoje dane bezpośrednio do Twojej prywatnej chmury. Połączenie odbywa się przez oficjalne API Google i wymaga Twojej wyraźnej zgody przy każdym logowaniu."
    },
    {
      title: "3. Sztuczna Inteligencja (Miriam AI)",
      text: "Aplikacja korzysta z usług Google Gemini AI. Treści wierszy, analiz i rozmów są generowane w chmurze Google. Jeśli korzystasz z własnego klucza API, Twoje limity i prywatność podlegają regulaminom Google Cloud Platform."
    },
    {
      title: "4. Geolokalizacja",
      text: "Dostęp do lokalizacji jest opcjonalny i służy wyłącznie do automatycznego doboru języka oraz regionalnej stacji radiowej w Trybie Inteligentnym. Twoje współrzędne nie są zapisywane na zewnętrznych serwerach."
    },
    {
      title: "5. Prawa Użytkownika",
      text: "Masz pełną kontrolę nad swoimi danymi. Możesz je w każdej chwili usunąć, korzystając z przycisku 'Wyczyść dane' w ustawieniach systemowych lub czyszcząc pamięć podręczną przeglądarki."
    }
  ];

  const contentEn = [
    {
      title: "1. Data Storage",
      text: "Christian Culture Lite 2026 is a Client-Side application. This means your prayers, goals, notes, and profile data are stored exclusively in your browser's LocalStorage. We, as creators, have no access to them."
    },
    {
      title: "2. Cloud Integration (Christian Cloud)",
      text: "If you choose to connect Google Drive or Calendar, the app will send your data directly to your private cloud. The connection is made through the official Google API and requires your explicit consent at each login."
    },
    {
      title: "3. Artificial Intelligence (Miriam AI)",
      text: "The app uses Google Gemini AI services. Verse content, analysis, and conversations are generated in the Google cloud. If you use your own API key, your limits and privacy are subject to Google Cloud Platform terms."
    },
    {
      title: "4. Geolocation",
      text: "Location access is optional and used solely for automatic language selection and regional radio station picking in Smart Mode. Your coordinates are not saved on external servers."
    },
    {
      title: "5. User Rights",
      text: "You have full control over your data. You can delete them at any time using the 'Clear Data' button in system settings or by clearing your browser cache."
    }
  ];

  const activeContent = appLanguage === 'pl' ? contentPl : contentEn;

  return (
    <div className="fixed inset-0 z-[8000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-10 animate-fade-in">
      <div className="relative w-full max-w-2xl h-[85vh] bg-zinc-950 border border-zinc-800 rounded-[3rem] shadow-3xl flex flex-col overflow-hidden">
        
        <div className="px-8 pt-8 pb-6 flex justify-between items-center border-b border-white/5 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
              {appLanguage === 'pl' ? 'Prywatność' : 'Privacy'} <span className="text-[#C5A059]">& {appLanguage === 'pl' ? 'Zgodność' : 'Compliance'}</span>
            </h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">Legal & Security Overview</p>
          </div>
          <button onClick={onClose} className="p-3 bg-zinc-900 text-zinc-400 hover:text-white rounded-full transition-all border border-zinc-800">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
          <div className="bg-[#C5A059]/5 rounded-2xl p-6 border border-[#C5A059]/10">
             <p className="text-zinc-300 text-sm leading-relaxed italic">
               {appLanguage === 'pl' 
                 ? "Twoja prywatność jest dla nas święta. CC Lite została zaprojektowana tak, abyś to Ty miał pełną władzę nad swoimi danymi duchowymi."
                 : "Your privacy is sacred to us. CC Lite is designed so that you have full power over your spiritual data."}
             </p>
          </div>

          <div className="space-y-8">
            {activeContent.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-sm font-black text-[#C5A059] uppercase tracking-widest">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{fixOrphans(item.text)}</p>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5">
             <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Wersja Dokumentu: 2026.01.v4</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ostatnia aktualizacja: {new Date().toLocaleDateString()}</p>
             </div>
          </div>
        </div>

        <div className="p-8 bg-zinc-900/50 border-t border-white/5 flex-shrink-0">
           <button 
             onClick={onClose}
             className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-102 active:scale-95 transition-all"
           >
             {appLanguage === 'pl' ? 'ROZUMIEM I AKCEPTUJĘ' : 'I UNDERSTAND & ACCEPT'}
           </button>
        </div>
      </div>
    </div>
  );
};