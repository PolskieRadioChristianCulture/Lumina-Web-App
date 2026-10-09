import React, { useState } from 'react';

interface YouTubeNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSnooze: (minutes: number) => void;
}

export const YouTubeNotificationModal: React.FC<YouTubeNotificationModalProps> = ({ isOpen, onClose, onSnooze }) => {
  const [view, setView] = useState<'promo' | 'snooze'>('promo');
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen && !isClosing) return null;

  const performClose = (callback: () => void) => {
    setIsClosing(true);
    setTimeout(() => {
      callback();
      setIsClosing(false);
      setView('promo');
    }, 500);
  };

  const handleClose = () => performClose(onClose);
  
  const handleSnoozeClick = (minutes: number) => {
    performClose(() => onSnooze(minutes));
  };

  const handleOpenPlaylist = () => {
    // Official playlist link provided by user
    window.open("https://youtube.com/playlist?list=PLQBdxcl9HBc8jNIM45udIp2N6ucvK75rW&si=fDyyvGRqhw5XL1MJ", "_blank");
    performClose(onClose);
  };

  return (
    <div className="fixed top-16 sm:top-24 left-0 right-0 z-[3000] flex justify-center p-4 sm:p-6 pointer-events-none">
      <style>{`
        @keyframes slideInTop { from { transform: translateY(-120%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideOutTop { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-120%); opacity: 0; } }
        .animate-in-top { animation: slideInTop 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-out-top { animation: slideOutTop 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>
      
      <div 
        className={`pointer-events-auto w-full max-w-md bg-zinc-950/95 backdrop-blur-2xl border border-[#C5A059]/40 rounded-[2.5rem] shadow-[0_30px_70px_-10px_rgba(197,160,89,0.3)] overflow-hidden relative ${isClosing ? 'animate-out-top' : 'animate-in-top'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top decorative line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#C5A059]/5 to-transparent pointer-events-none"></div>
        
        {view === 'promo' ? (
          <div className="p-7 flex flex-col items-center text-center relative z-10">
            <button 
              onClick={handleClose}
              className="absolute top-4 right-6 p-2 text-zinc-600 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-5 mb-5 w-full">
               <div className="relative group cursor-pointer flex-shrink-0" onClick={handleOpenPlaylist}>
                 <div className="absolute inset-0 bg-[#C5A059] rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                 <div className="w-16 h-13 bg-white rounded-2xl flex items-center justify-center shadow-xl relative z-10 border border-[#C5A059]/30 transition-transform group-hover:scale-105">
                   <svg className="w-9 h-9 text-red-600 fill-current" viewBox="0 0 24 24">
                     <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                   </svg>
                 </div>
               </div>
               <div className="text-left">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-1">
                    Cuda Każdego Dnia
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#C5A059] rounded-full animate-gold-glowing-pulse"></span>
                    <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest">
                      Premiera w Studio Dobrego Słowa
                    </p>
                  </div>
               </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-8 text-left w-full pl-1 font-medium italic">
              "Wszystko jest możliwe dla tego, kto wierzy." Rozpoczynamy wieczorną audycję świadectw. Dołącz do naszej wspólnoty na YouTube.
            </p>

            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setView('snooze')}
                className="flex-1 py-4 bg-zinc-900 text-zinc-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-zinc-800 hover:text-white transition-all border border-zinc-800"
              >
                Później
              </button>
              <button 
                onClick={handleOpenPlaylist}
                className="flex-[2] py-4 bg-[#C5A059] text-black font-black text-[10px] uppercase tracking-widest rounded-xl shadow-[0_10px_30px_rgba(197,160,89,0.3)] hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>📺</span> OGLĄDAJ TERAZ
              </button>
            </div>
          </div>
        ) : (
          <div className="p-7 flex flex-col items-center text-center relative z-10 animate-fade-in">
             <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6">
               Przypomnij o audycji za:
             </h4>
             <div className="grid grid-cols-2 gap-3 w-full mb-8">
                {[15, 30, 60, 120].map(mins => (
                  <button 
                    key={mins}
                    onClick={() => handleSnoozeClick(mins)}
                    className="py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-[11px] font-black text-[#C5A059] hover:bg-[#C5A059] hover:text-black transition-all shadow-lg"
                  >
                    {mins >= 60 ? `${mins/60} Godziny` : `${mins} Minut`}
                  </button>
                ))}
             </div>
             <button 
               onClick={() => setView('promo')}
               className="text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-[#C5A059] transition-colors"
             >
               ← WRÓĆ DO OGŁOSZENIA
             </button>
          </div>
        )}
      </div>
    </div>
  );
};