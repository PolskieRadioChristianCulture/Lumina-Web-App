import React, { useState } from 'react';
import { fixOrphans, APP_VERSION } from '../types';

interface InstallationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  appLanguage: 'pl' | 'en';
}

export const InstallationGuideModal: React.FC<InstallationGuideModalProps> = ({ isOpen, onClose, appLanguage }) => {
  if (!isOpen) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <div className="fixed inset-0 z-[7000] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-hidden">
      
      {/* Dynamiczne poświaty w tle - Efekt WOW */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#C5A059]/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="relative w-full max-w-lg bg-zinc-950/80 border border-white/10 rounded-[3.5rem] p-8 sm:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] flex flex-col items-center text-center overflow-hidden">
        
        {/* Dekoracyjne linie perłowe */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent"></div>
        
        {/* Floating Logo with Halo */}
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-[#C5A059] rounded-[2.5rem] blur-3xl opacity-30 animate-pulse"></div>
          <div className="w-28 h-28 bg-black rounded-[2.5rem] flex items-center justify-center border-2 border-[#C5A059]/40 relative z-10 shadow-2xl overflow-hidden animate-floating-button-pulse">
            <img src="https://drive.google.com/thumbnail?id=1dHi9QX86UWj21YAIk3I8xyAXalzQkZpj&sz=w512" alt="CC Logo" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#C5A059] text-black text-[8px] font-black px-3 py-1 rounded-full shadow-lg z-20 uppercase tracking-widest border border-white/20">
            {APP_VERSION}
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 leading-tight italic">
          {appLanguage === 'pl' ? 'Zainstaluj' : 'Install'} <span className="text-[#C5A059]">Christian Culture</span>
        </h2>
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-10">
          Twoje Cyfrowe Centrum Uświęcenia
        </p>

        <div className="space-y-4 w-full text-left relative z-10 mb-10">
          <p className="text-zinc-400 text-xs font-medium leading-relaxed mb-6 text-center italic px-4">
            {isIOS 
              ? (appLanguage === 'pl' ? fixOrphans("Aplikacja Christian Culture jest gotowa do zamieszkania na Twoim iPhone. To tylko 3 proste kroki:") : "Christian Culture is ready to live on your iPhone. Just 3 simple steps:")
              : (appLanguage === 'pl' ? fixOrphans("Zainstaluj Christian Culture na swoim urządzeniu, aby cieszyć się pełną mocą radia HI-RES i organizera.") : "Install Christian Culture on your device to enjoy the full power of HI-RES radio and organizer.")
            }
          </p>

          <div className="grid grid-cols-1 gap-3">
            {(isIOS ? [
              { id: 1, text: appLanguage === 'pl' ? 'Dotknij ikonę "Udostępnij" w Safari.' : 'Tap the "Share" icon in Safari.' },
              { id: 2, text: appLanguage === 'pl' ? 'Wybierz "Do ekranu początkowego".' : 'Select "Add to Home Screen".' },
              { id: 3, text: appLanguage === 'pl' ? 'Potwierdź klikając przycisk "Dodaj".' : 'Confirm by tapping "Add".' }
            ] : [
              { id: 1, text: appLanguage === 'pl' ? 'Otwórz menu (3 kropki) w przeglądarce.' : 'Open menu (3 dots) in your browser.' },
              { id: 2, text: appLanguage === 'pl' ? 'Kliknij "Zainstaluj" lub "Dodaj do ekranu".' : 'Click "Install app" or "Add to screen".' },
              { id: 3, text: appLanguage === 'pl' ? 'Zatwierdź instalację w oknie systemowym.' : 'Confirm installation in system window.' }
            ]).map((step) => (
              <div key={step.id} className="flex items-center gap-5 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-[#C5A059]/30 text-[#C5A059] flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                  {step.id}
                </span>
                <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-tight leading-tight">
                  {step.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-6 bg-gradient-to-r from-[#C5A059] to-[#A68043] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_20px_50px_rgba(197,160,89,0.4)] hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
          {appLanguage === 'pl' ? 'ROZUMIEM I INSTALUJĘ' : 'I UNDERSTAND & INSTALL'}
        </button>
        
        <p className="mt-8 text-[7px] text-zinc-600 font-mono uppercase tracking-[0.5em] opacity-50">
          Christian Culture Global Network • Soli Deo Gloria
        </p>
      </div>
    </div>
  );
};