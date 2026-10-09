import React, { useCallback } from 'react';
import { fixOrphans, SMS_SUB_NUMBER, SMS_SUB_MESSAGE_PL, SMS_SUB_MESSAGE_EN, ToastMessage } from '../types';

interface SmsSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appLanguage: 'pl' | 'en';
  addToast: (message: string, type?: ToastMessage['type']) => void;
}

export const SmsSubscriptionModal: React.FC<SmsSubscriptionModalProps> = ({ isOpen, onClose, appLanguage, addToast }) => {
  if (!isOpen) return null;

  const handleSendSms = useCallback(() => {
    const message = appLanguage === 'pl' ? SMS_SUB_MESSAGE_PL : SMS_SUB_MESSAGE_EN;
    const smsUri = `sms:${SMS_SUB_NUMBER}?body=${encodeURIComponent(message)}`;
    
    addToast(appLanguage === 'pl' ? "Otwieranie aplikacji SMS..." : "Opening SMS app...", "info");
    window.location.href = smsUri;
    onClose(); // Close the modal after initiating SMS
  }, [appLanguage, addToast, onClose]);

  return (
    <div className="fixed inset-0 z-[6500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-hidden" onClick={onClose}>
      
      {/* Dynamiczne poświaty w tle - Efekt WOW */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#C5A059]/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="relative w-full max-w-md bg-zinc-950/80 border border-[#C5A059]/40 rounded-[3.5rem] p-8 sm:p-12 shadow-[0_50px_100px_-20px_rgba(197,160,89,0.3)] flex flex-col items-center text-center overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Top decorative line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-60"></div>

        {/* Floating Icon with Halo */}
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-[#C5A059] rounded-[2.5rem] blur-3xl opacity-30 animate-pulse"></div>
          <div className="w-28 h-28 bg-black rounded-[2.5rem] flex items-center justify-center border-2 border-[#C5A059]/40 relative z-10 shadow-2xl overflow-hidden animate-floating-button-pulse">
            <span className="text-5xl">📜</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 leading-tight italic">
          {appLanguage === 'pl' ? 'Subskrypcja SMS' : 'SMS Subscription'}
        </h2>
        <p className="text-[11px] font-black text-[#C5A059] uppercase tracking-[0.4em] mb-10">
          {appLanguage === 'pl' ? 'Duchowe Inspiracje Codziennie' : 'Daily Spiritual Inspirations'}
        </p>

        <div className="space-y-6 w-full relative z-10 mb-10">
          <p className="text-zinc-400 text-xs font-medium leading-relaxed italic px-4">
            {fixOrphans(appLanguage === 'pl' 
              ? "Otrzymuj chrześcijańską motywację biblijną prosto na Twój telefon! Dołącz do subskrypcji SMS wysyłając wiadomość o treści 'Duchowe Inspiracje'." 
              : "Receive Christian biblical motivation directly to your phone! Join the SMS subscription by sending a message with the text 'Spiritual Inspirations'.")
            }
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
              {appLanguage === 'pl' ? 'Wyślij na numer:' : 'Send to number:'}
            </p>
            <p className="text-white text-xl font-black tracking-widest mb-3">
              {SMS_SUB_NUMBER}
            </p>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
              {appLanguage === 'pl' ? `Treść wiadomości: "${SMS_SUB_MESSAGE_PL}"` : `Message content: "${SMS_SUB_MESSAGE_EN}"`}
            </p>
          </div>

          <button
            onClick={handleSendSms}
            className="w-full py-6 bg-gradient-to-r from-[#C5A059] to-[#A68043] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_20px_50px_rgba(197,160,89,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <span>✉️</span> {appLanguage === 'pl' ? 'WYŚLIJ SMS' : 'SEND SMS'}
          </button>
          
          <button 
            onClick={onClose}
            className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors"
          >
            {appLanguage === 'pl' ? 'ZAMKNIJ' : 'CLOSE'}
          </button>
        </div>

        <footer className="mt-8 pt-6 border-t border-white/5 w-full">
           <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest">
             Soli Deo Gloria • Christian Culture Global
           </p>
        </footer>
      </div>
    </div>
  );
};