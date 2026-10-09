
import React from 'react';
import { OnlineUser, ToastMessage, fixOrphans, MIRIAM_AVATAR_URL, CZAREK_AVATAR_URL } from '../types';

interface ViewUserCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onlineUser: OnlineUser | null;
  appLanguage: 'pl' | 'en';
  addToast: (message: string, type?: ToastMessage['type']) => void;
  onOpenAITextAssistant: (targetAssistantId: string) => void;
  onOpenAIVoiceAssistant: (targetAssistantId: string) => void;
}

export const ViewUserCardModal: React.FC<ViewUserCardModalProps> = ({ isOpen, onClose, onlineUser, appLanguage, addToast, onOpenAITextAssistant, onOpenAIVoiceAssistant }) => {
  if (!isOpen || !onlineUser) return null;

  const isAIAssistant = onlineUser.id === 'miriam-ai';
  const isAdmin = onlineUser.id === 'nazir-admin';
  const isMe = onlineUser.id === 'me';

  const avatarUrl = isAIAssistant ? MIRIAM_AVATAR_URL : isAdmin ? CZAREK_AVATAR_URL : onlineUser.avatar;

  return (
    <div className="fixed inset-0 z-[2001] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-12 animate-fade-in-scale-up" onClick={onClose}>
      <div className="relative w-full max-w-sm bg-zinc-950 border-2 border-white/5 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,1)] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Profile Header Image with Gradient */}
        <div className="relative h-40 bg-gradient-to-br from-[#C5A059]/20 to-black overflow-hidden flex-shrink-0">
           <div className="absolute inset-0 bg-[url('https://drive.google.com/thumbnail?id=1KK3LQ5YpD8rTNgXuHIT6jXhXEPprdIux&sz=w1280')] opacity-10 bg-cover bg-center"></div>
           <div className="absolute inset-0 flex items-center justify-center pt-8">
              <div className={`w-28 h-28 rounded-3xl overflow-hidden border-4 shadow-2xl relative
                ${isAdmin || isAIAssistant ? 'border-[#C5A059] animate-floating-button-pulse' : 'border-white/10'}`}>
                <img src={avatarUrl} alt={onlineUser.name} className="w-full h-full object-cover" />
              </div>
           </div>
        </div>

        <div className="flex flex-col items-center text-center p-8 pt-4 space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-2">
              {onlineUser.name}
              {(isAdmin || isAIAssistant) && <span className="text-[#C5A059] text-xl">✨</span>}
            </h2>
            <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.4em]">
              {onlineUser.roleText || (appLanguage === 'pl' ? 'Współpracownik CC' : 'CC Contributor')}
            </p>
          </div>

          <div className="w-full py-6 px-4 bg-zinc-900/40 rounded-[2rem] border border-white/5 space-y-4">
             <p className="text-zinc-400 text-xs italic leading-relaxed">
               {isAIAssistant 
                 ? (appLanguage === 'pl' ? '"Jestem Twoją asystentką w drodze do uświęcenia. Rozmawiaj ze mną głosowo w panelu głównym."' : '"I am your assistant on the path to sanctification. Talk to me in the main panel."')
                 : (appLanguage === 'pl' ? '"Niech Pan Cię błogosławi i strzeże. Dobrze, że jesteś we wspólnocie Christian Culture."' : '"May the Lord bless you and keep you. Good to have you in the CC community."')}
             </p>
             <div className="h-[1px] w-12 bg-[#C5A059]/40 mx-auto"></div>
             <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-tight">
               SOLI DEO GLORIA • CHRISTIAN CULTURE GLOBAL
             </p>
          </div>

          <div className="w-full pt-4">
            {isAIAssistant ? (
              <button
                onClick={() => { onOpenAIVoiceAssistant(onlineUser.id); onClose(); }}
                className="w-full py-5 bg-[#C5A059] text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                ROZMAWIAJ Z MIRIAM
              </button>
            ) : isMe ? (
              <button
                disabled
                className="w-full py-5 bg-zinc-900 border border-zinc-800 text-zinc-500 font-black text-xs uppercase tracking-[0.2em] rounded-2xl"
              >
                TO TWOJA WIZYTÓWKA
              </button>
            ) : (
              <button
                onClick={() => { addToast(appLanguage === 'pl' ? "Funkcja przesyłania wiadomości wkrótce!" : "Messaging coming soon!", "info"); onClose(); }}
                className="w-full py-5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-800 transition-all"
              >
                WYŚLIJ POZDROWIENIE
              </button>
            )}
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-4 text-[9px] font-black text-zinc-700 uppercase tracking-widest hover:text-[#C5A059] transition-colors"
        >
          {appLanguage === 'pl' ? 'POWRÓT' : 'BACK'}
        </button>
      </div>
    </div>
  );
};
