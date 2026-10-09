
import React, { useCallback } from 'react';
import { SMS_SUB_NUMBER } from '../types';

interface StripeSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: 'PL' | 'GLOBAL';
  addToast: (msg: string, type?: 'info' | 'success') => void;
  appLanguage: 'pl' | 'en';
  onOpenRadioMode: () => void;
}

const StripeBuyButton = 'stripe-buy-button' as any;

export const StripeSupportModal: React.FC<StripeSupportModalProps> = ({ isOpen, onClose, region, addToast, appLanguage, onOpenRadioMode }) => {
  const handleSmsSupport = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneNumber = SMS_SUB_NUMBER;
    const message = "Duchowe Inspiracje";
    addToast(appLanguage === 'pl' ? "Otwieranie aplikacji SMS..." : "Opening SMS app...", "success");
    window.location.href = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
  }, [addToast, appLanguage]);

  if (!isOpen) return null;

  const BUY_BTN_GENERAL = "buy_btn_1StrnL7fVEX4acCUQG8KUVJ1";
  const BUY_BTN_PROJECTS = "buy_btn_1StWFz7fVEX4acCUSyrvJc5M";
  const PUBLISHABLE_KEY = "pk_live_51StVn37fVEX4acCU4e0JW4Zpc0WhogMeyeMwxd91VWDDp8sxWeuClHqdo76Vi5mdi9oprv4mk1JmJrSRaPAmxn6O00WLnDfOtR";

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in overflow-hidden">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] flex flex-col max-h-[90dvh] overflow-hidden animate-fade-in-scale-up">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#D4AF37]"></div>
        <div className="relative z-10 flex flex-col items-center pt-12 pb-4 px-8 text-center">
          <div className="absolute top-6 right-8">
            <button onClick={onClose} className="p-2.5 bg-zinc-100 border border-zinc-200 rounded-full text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter flex flex-col items-center gap-1 mb-2 leading-none">{region === 'PL' ? 'WESPRZYJ' : 'SUPPORT'} <span className="text-[#D4AF37]">{region === 'PL' ? 'MISJĘ' : 'MISSION'}</span></h2>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] leading-none">SZYBKA PŁATNOŚĆ STRIPE</p>
        </div>
        <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-hide space-y-10">
          <div className="bg-zinc-50 border border-zinc-100 rounded-[2.5rem] p-8 text-center relative overflow-hidden group">
            <p className="text-sm text-zinc-600 leading-relaxed font-semibold italic relative z-10">
              {region === 'PL' ? "„Radosnego dawcę Bóg miłuje”. Twoje wsparcie pozwala nam nieść Ewangelię w jakości HI-RES do tysięcy serc." : "“God loves a cheerful giver”. Your support allows us to carry the Gospel in HI-RES quality to thousands of hearts."}
            </p>
          </div>
          <div className="text-center space-y-4 pt-4">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] px-4">WSPARCIE PROJEKTÓW CC</p>
            <div className="flex justify-center w-full min-h-[60px] transform scale-110 bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
              <StripeBuyButton buy-button-id={BUY_BTN_PROJECTS} publishable-key={PUBLISHABLE_KEY} locale={appLanguage} />
            </div>
          </div>
          <div className="text-center px-4 animate-fade-in space-y-6">
             <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest leading-relaxed italic">Subskrypcja SMS - Żyj w Mocy Słowa - Codzienna porcja chrześcijańskich inspiracji biblijnych</p>
              <div className="flex justify-center w-full min-h-[60px] transform scale-110 bg-white rounded-2xl p-4 shadow-md border border-zinc-100">
                <StripeBuyButton buy-button-id={BUY_BTN_GENERAL} publishable-key={PUBLISHABLE_KEY} locale={appLanguage} />
              </div>
          </div>
          <div className="text-center space-y-4 border-t border-zinc-100 pt-8">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] px-4">DOŁĄCZ DO SPOŁECZNOŚCI CODZIENNEGO SŁOWA</p>
            <button onClick={handleSmsSupport} className="w-full inline-flex items-center justify-center gap-4 bg-zinc-900 text-white px-6 py-6 rounded-[1.5rem] shadow-xl group hover:bg-black transition-all active:scale-95 relative overflow-hidden">
              <span className="text-2xl group-hover:scale-110 transition-transform">✉️</span>
              <span className="text-lg font-black uppercase tracking-widest">Subskrypcja SMS</span>
            </button>
          </div>
          <div className="pt-2">
            <button onClick={() => { onClose(); onOpenRadioMode(); }} className="w-full py-6 bg-[#C5A059] text-black font-black uppercase tracking-widest rounded-[2rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
              POWRÓT DO PANELU GŁÓWNEGO
            </button>
          </div>
        </div>
        <div className="py-6 text-center border-t border-zinc-100 bg-zinc-50 flex-shrink-0">
          <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.5em]">SOLI DEO GLORIA • CC LITE 2026</p>
        </div>
      </div>
    </div>
  );
};
