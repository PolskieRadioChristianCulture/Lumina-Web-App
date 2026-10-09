import React, { useEffect } from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
  isIntentionsVisible?: boolean;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove, isIntentionsVisible = false }) => {
  // Obliczanie pozycji top:
  // Mobile: Ticker=32px (8), Intentions=28px (7). Total=60px
  // Desktop: Ticker=64px (16), Intentions=48px (12). Total=112px
  const topClass = isIntentionsVisible 
    ? "top-[60px] sm:top-[112px]" 
    : "top-8 sm:top-16";

  return (
    <div className={`fixed ${topClass} inset-x-0 z-[5000] flex flex-col items-center pointer-events-none transition-all duration-700 ease-in-out`}>
      <div className="flex flex-col w-full">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    // Nie usuwaj automatycznie, jeśli Toast ma akcję (np. aktualizacja)
    if (toast.action) return;

    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove, toast.action]);

  const icons = {
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    news: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  };

  const colors = {
    info: "bg-zinc-950/98 text-white border-zinc-800 shadow-[0_30px_60px_rgba(0,0,0,0.8)]",
    success: "bg-indigo-950/98 text-white border-indigo-500/20 shadow-[0_30px_60px_rgba(79,70,229,0.2)]",
    news: "bg-orange-950/98 text-white border-orange-500/20 shadow-[0_30px_60px_rgba(249,115,22,0.2)]",
  };

  return (
    <div 
      className={`pointer-events-auto w-full flex flex-col gap-4 px-8 py-7 sm:py-9 rounded-b-[2.5rem] border-b animate-slide-down-full backdrop-blur-3xl transition-all duration-700 ${colors[toast.type]} z-50`}
    >
      <div className="flex items-center gap-6 max-w-5xl mx-auto w-full">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-[#C5A059] border border-white/5 shadow-inner">
          {icons[toast.type]}
        </div>
        <div className="flex-1 flex flex-col gap-1">
           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] leading-none mb-1">Powiadomienie Systemowe</p>
           <p className="text-sm sm:text-base font-black tracking-tight uppercase leading-tight">{toast.message}</p>
        </div>
        
        {toast.action ? (
          <button 
            onClick={(e) => { e.stopPropagation(); toast.action?.onClick(); }}
            className="px-6 py-3.5 bg-[#C5A059] text-black font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
          >
            {toast.action.label}
          </button>
        ) : (
          <button onClick={() => onRemove(toast.id)} className="p-3 text-white/20 hover:text-white transition-colors bg-white/5 rounded-full">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="h-[2px] w-12 bg-[#C5A059]/40 mx-auto rounded-full opacity-40"></div>
    </div>
  );
};