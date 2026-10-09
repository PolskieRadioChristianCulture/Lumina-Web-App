import React from 'react';
import { ToastMessage, APP_VERSION, fixOrphans } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  appLanguage: 'pl' | 'en';
  addToast: (message: string, type?: ToastMessage['type']) => void;
  onOpenRadioMode: () => void;
  onOpenDashboard: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, appLanguage, addToast, onOpenRadioMode, onOpenDashboard }) => {
  if (!isOpen) return null;

  const handleClearCache = () => {
    localStorage.clear();
    addToast(appLanguage === 'pl' ? "Wyczyszczono pamięć podręczną aplikacji!" : "Application cache cleared!", "success");
  };

  const handleResetOnboarding = () => {
    localStorage.setItem('onboarding_completed_2026', 'false');
    addToast(appLanguage === 'pl' ? "Samouczek zostanie wyświetlony ponownie przy następnym uruchomieniu." : "Onboarding will be shown again on next launch.", "info");
    onClose();
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] dark bg-zinc-950 z-[250] transform transition-transform duration-500 ease-in-out shadow-4xl border-l border-white/5 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full p-8 sm:p-10 relative overflow-y-auto scrollbar-thin">
        
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-center w-full mb-6 flex-shrink-0 relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">{appLanguage === 'pl' ? 'Panel' : 'Admin'} <span className="text-[#C5A059]">{appLanguage === 'pl' ? 'Administratora' : 'Panel'}</span></h2>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
              {appLanguage === 'pl' ? 'Narzędzia administracyjne' : 'Administrative tools'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-zinc-900 rounded-full text-zinc-500 shadow-lg hover:bg-zinc-800 transition-all hover:text-[#C5A059] active:scale-90 border border-zinc-800"
            title={appLanguage === 'pl' ? "Zamknij" : "Close"}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 text-center py-12 px-4 relative z-10">
          <div className="w-24 h-24 mx-auto bg-[#C5A059]/10 rounded-full flex items-center justify-center text-5xl mb-6 shadow-xl border border-[#C5A059]/20">
            ⚙️
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">
            {appLanguage === 'pl' ? 'Funkcje administracyjne' : 'Admin Functions'}
          </h3>
          <p className="text-zinc-400 leading-relaxed max-w-sm mx-auto mb-8">
            {fixOrphans(appLanguage === 'pl' 
              ? 'Ostrożnie korzystaj z tych narzędzi. Mogą one wpłynąć na dane aplikacji.' 
              : 'Use these tools carefully. They may affect application data.')}
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleClearCache}
              className="w-full py-4 bg-red-600 border border-red-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md hover:bg-red-700 hover:text-white transition-all active:scale-95"
            >
              {appLanguage === 'pl' ? 'Wyczyść Pamięć Podręczną' : 'Clear Cache'}
            </button>
            <button
              onClick={handleResetOnboarding}
              className="w-full py-4 bg-orange-600 border border-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md hover:bg-orange-700 hover:text-white transition-all active:scale-95"
            >
              {appLanguage === 'pl' ? 'Zresetuj Samouczek' : 'Reset Onboarding'}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800 flex flex-col items-center gap-4 flex-shrink-0 relative z-10 bg-zinc-950 mt-auto">
          <button
            onClick={() => { onClose(); onOpenDashboard(); }}
            className="w-full py-5 bg-zinc-900 border border-[#C5A059]/30 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-zinc-800"
          >
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {appLanguage === 'pl' ? 'OTWÓRZ DASHBOARD / KALENDARZ' : 'OPEN DASHBOARD / CALENDAR'}
          </button>

          <button 
            onClick={() => { onClose(); onOpenRadioMode(); }}
            className="w-full py-6 bg-[#C5A059] text-black font-black uppercase tracking-widest rounded-[2rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            {appLanguage === 'pl' ? 'POWRÓT DO RADIA' : 'BACK TO RADIO'}
          </button>
        </div>
        
        <footer className="py-4 text-center text-zinc-600 text-xs flex-shrink-0">
          Created by <a href="https://wa.me/48537137043" target="_blank" rel="noopener noreferrer" className="text-[#C5A059] hover:text-[#E2B859] transition-all font-bold">NAZIR</a> 2025 • v{APP_VERSION}
        </footer>
      </div>
    </div>
  );
};