

import React, { useCallback } from 'react';
import { MIRIAM_AVATAR_URL, fixOrphans } from '../types';

interface MiriamInsightCardProps {
  insight: string;
  onClose: () => void;
  onSpeak: (title: string, content: string, autoStartAudio?: boolean) => void;
  appLanguage: 'pl' | 'en';
}

export const MiriamInsightCard: React.FC<MiriamInsightCardProps> = ({ insight, onClose, onSpeak, appLanguage }) => {
  const title = appLanguage === 'pl' ? "Wskazówka Miriam" : "Miriam's Insight";

  return (
    <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-12 animate-fade-in-scale-up">
      <div className="relative w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 shadow-3xl flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={MIRIAM_AVATAR_URL} 
                alt="Miriam Avatar" 
                className="w-12 h-12 rounded-full border-2 border-[#C5A059] shadow-lg object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-