
import React, { useState, useCallback } from 'react';
import { AISuggestion, AISuggestionType, BibleVerse, UserGender, MIRIAM_AVATAR_URL, fixOrphans } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (type: AISuggestionType, dailyVerseContext: BibleVerse | null, userName: string, userGender: UserGender) => void | Promise<void>;
  suggestions: AISuggestion[];
  loading: boolean;
  dailyVerseContext: BibleVerse | null;
  userName: string; 
  userGender: UserGender; 
  appLanguage: 'pl' | 'en';
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ 
  isOpen, 
  onClose, 
  onGenerate, 
  suggestions, 
  loading,
  dailyVerseContext,
  userName,
  userGender,
  appLanguage,
}) => {
  if (!isOpen) return null;

  const [selectedType, setSelectedType] = useState<AISuggestionType>('sanctification');

  const handleGenerate = useCallback((type: AISuggestionType) => {
    setSelectedType(type);
    onGenerate(type, dailyVerseContext, userName, userGender);
  }, [onGenerate, dailyVerseContext, userName, userGender]);

  return (
    <div className="fixed inset-0 z-[1001] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-12 animate-fade-in-scale-up">
      <div className="relative w-full max-w-4xl h-full sm:h-[90vh] bg-zinc-950 border border-zinc-800 rounded-[3rem] p-8 sm:p-12 shadow-2xl flex flex-col">
        
        <div className="flex justify-between items-center mb-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <img src={MIRIAM_AVATAR_URL} alt="Miriam" className="w-12 h-12 rounded-full border-2 border-[#C5A059] object-cover shadow-lg" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              {appLanguage === 'pl' ? 'Asystent' : 'Assistant'} <span className="text-[#C5A059]">Miriam CC</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-3 bg-zinc-900 rounded-full text-zinc-500 hover:text-red-500 transition-colors border border-zinc-800">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 flex-shrink-0">
          <button
            onClick={() => handleGenerate('sanctification')}
            disabled={loading}
            className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              selectedType === 'sanctification' 
                ? 'bg-[#C5A059] text-black shadow-md' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-[#C5A059]/50'
            }`}
          >
            {loading && selectedType === 'sanctification' ? (
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              appLanguage === 'pl' ? 'Generuj Wskazówki Uświęcenia' : 'Generate Sanctification Tips'
            )}
          </button>
          <button
            onClick={() => handleGenerate('evangelism')}
            disabled={loading}
            className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              selectedType === 'evangelism' 
                ? 'bg-[#C5A059] text-black shadow-md' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-[#C5A059]/50'
            }`}
          >
            {loading && selectedType === 'evangelism' ? (
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              appLanguage === 'pl' ? 'Generuj Pomysły na Ewangelizację' : 'Generate Evangelism Ideas'
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
          {suggestions.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-50 space-y-4">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <p className="text-sm">
                {appLanguage === 'pl' ? 'Wybierz typ wskazówek, aby Miriam mogła je wygenerować.' : 'Select a type of suggestions for Miriam to generate.'}
              </p>
            </div>
          )}

          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-zinc-900/60 rounded-2xl p-6 border border-zinc-800 hover:border-[#C5A059]/30 transition-colors">
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2">{fixOrphans(suggestion.title)}</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">{fixOrphans(suggestion.content)}</p>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-zinc-800 flex-shrink-0 relative z-10 bg-zinc-950 mt-auto">
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#C5A059] text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            {appLanguage === 'pl' ? 'Wróć do Centrum' : 'Return to Center'}
          </button>
        </div>
      </div>
    </div>
  );
};