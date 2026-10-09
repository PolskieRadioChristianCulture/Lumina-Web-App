

import React from 'react';

interface ChapterReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  appLanguage: 'pl' | 'en';
}

export const ChapterReadingModal: React.FC<ChapterReadingModalProps> = ({ isOpen, onClose, title, content, appLanguage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-zinc-950 flex flex-col animate-fade-in-scale-up text-zinc-200">
      <div className="flex-shrink-0 px-6 py-6 sm:px-12 flex justify-between items-center border-b border-zinc-800 bg-zinc-950">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">
            {title}
          </h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
            {appLanguage === 'pl' ? "Czytanie Biblii" : "Bible Reading"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-zinc-900 rounded-full text-zinc-500 hover:text-[#C5A059] border border-zinc-800 transition-colors"
          title={appLanguage === 'pl' ? "Zamknij" : "Close"}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-12 lg:px-24 scrollbar-thin">
        <div className="max-w-3xl mx-auto prose prose-invert prose-p:font-serif prose-p:text-zinc-300 prose-p:leading-loose text-lg">
          {/* Placeholder for chapter content */}
          <p>{content || (appLanguage === 'pl' ? 'Ładowanie rozdziału...' : 'Loading chapter...')}</p>
        </div>
      </div>
    </div>
  );
};