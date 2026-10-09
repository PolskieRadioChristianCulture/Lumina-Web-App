

import React from 'react';
import { MIRIAM_AVATAR_URL } from '../types';

interface MiriamAvatarTriggerProps {
  onOpen: () => void;
  appLanguage: 'pl' | 'en';
}

export const MiriamAvatarTrigger: React.FC<MiriamAvatarTriggerProps> = ({ onOpen, appLanguage }) => {
  return (
    <button 
      onClick={onOpen}
      className="fixed top-24 left-6 z-[80] w-16 h-16 rounded-full border-2 border-[#C5A059] shadow-lg object-cover flex items-center justify-center bg-zinc-900/80 backdrop-blur-md animate-floating-button-pulse hover:scale-110 active:scale-95 transition-all"
      title={appLanguage === 'pl' ? "Wskazówka Miriam (Asystent CC)" : "Miriam's Insight (CC Assistant)"}
    >
      <img 
        src={MIRIAM_AVATAR_URL} 
        alt="Miriam Avatar" 
        className="w-full h-full rounded-full object-cover"
      />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full animate-pulse"></div>
    </button>
  );
};