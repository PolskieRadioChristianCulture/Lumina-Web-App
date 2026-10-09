
import React, { useState } from 'react';
import { fixOrphans } from '../types';

interface LessonReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | null;
  content: string | null;
  loading: boolean;
  appLanguage: 'pl' | 'en';
  onSpeakLesson: (title: string, content: string) => void;
  isMiriamSpeaking: boolean;
}

const renderMarkdownContent = (markdown: string) => {
  if (!markdown) return null;

  let html = markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/__(.*?)__/gim, '<strong>$1</strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/_(.*?)_/gim, '<em>$1</em>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>');

  html = html.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />');
  html = `<p>${html}</p>`;

  html = html.replace(/<h1/g, '<h1 class="mt-8 mb-4 text-3xl font-black text-[#C5A059] uppercase tracking-tighter border-b border-[#C5A059]/20 pb-2"');
  html = html.replace(/<h2/g, '<h2 class="mt-8 mb-4 text-2xl font-black text-white uppercase tracking-tighter border-b border-zinc-800 pb-2"');
  html = html.replace(/<h3/g, '<h3 class="mt-6 mb-2 text-xl font-bold text-white"');
  html = html.replace(/<li>/g, '<li class="ml-4 list-disc text-zinc-300">');

  return <div dangerouslySetInnerHTML={{ __html: fixOrphans(html) }} />;
};


export const LessonReadingModal: React.FC<LessonReadingModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  loading,
  appLanguage,
  onSpeakLesson,
  isMiriamSpeaking,
}) => {
  const [fontSize, setFontSize] = useState<'text-base' | 'text-lg' | 'text-xl'>('text-lg');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-zinc-950 flex flex-col animate-fade-in-scale-up text-zinc-200">
      <div className="flex-shrink-0 px-6 py-6 sm:px-12 flex justify-between items-center border-b border-zinc-800 bg-zinc-950">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">
            {loading ? (appLanguage === 'pl' ? "Ładowanie lekcji..." : "Loading lesson...") : title}
          </h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
            {appLanguage === 'pl' ? "Szkoła Biblijna Christian Culture" : "Christian Culture Biblical School"}
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

      <div className="flex-shrink-0 px-6 py-4 sm:px-12 flex items-center justify-center gap-6 bg-zinc-900/50 border-b border-zinc-800">
        <button
          onClick={() => onSpeakLesson(title || '', content || '')}
          disabled={loading || !content}
          className={`w-10 h-10 bg-zinc-900 rounded-full text-[#C5A059] hover:text-[#E2B859] flex items-center justify-center transition-all border border-zinc-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${isMiriamSpeaking ? 'animate-pulse' : ''}`}
          title={appLanguage === 'pl' ? "Przeczytają lekcję przez Miriam" : "Read lesson aloud by Miriam"}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
        <div className="flex items-center gap-3 bg-zinc-900 rounded-full px-4 py-2 text-zinc-500 border border-zinc-800 shadow-md">
          <span className="text-[10px] font-black uppercase tracking-widest">{appLanguage === 'pl' ? 'Rozmiar czcionki:' : 'Font size:'}</span>
          <button onClick={() => setFontSize('text-base')} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${fontSize === 'text-base' ? 'bg-[#C5A059] text-black shadow-md' : 'hover:bg-zinc-800'}`}>A</button>
          <button onClick={() => setFontSize('text-lg')} className={`w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-all ${fontSize === 'text-lg' ? 'bg-[#C5A059] text-black shadow-md' : 'hover:bg-zinc-800'}`}>A</button>
          <button onClick={() => setFontSize('text-xl')} className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all ${fontSize === 'text-xl' ? 'bg-[#C5A059] text-black shadow-md' : 'hover:bg-zinc-800'}`}>A</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-12 lg:px-24 scrollbar-thin">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
            <svg className="animate-spin w-10 h-10 text-[#C5A059]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">{appLanguage === 'pl' ? 'Przygotowuję lekcję...' : 'Preparing lesson...'}</p>
          </div>
        ) : (
          <div className={`max-w-3xl mx-auto prose prose-invert prose-p:font-serif prose-p:text-zinc-300 prose-p:leading-loose ${fontSize}`}>
             {renderMarkdownContent(content || "")}
             
             <div className="mt-16 pt-8 border-t border-zinc-800 text-center space-y-8">
               <button 
                 onClick={onClose}
                 className="px-10 py-4 bg-[#C5A059] text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
               >
                 {appLanguage === 'pl' ? 'Wróć do Szkoły Biblijnej' : 'Back to Biblical School'}
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};