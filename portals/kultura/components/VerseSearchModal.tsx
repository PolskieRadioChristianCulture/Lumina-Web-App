
import React, { useState, useCallback, useEffect } from 'react';
import { FoundVerse, ToastMessage, fixOrphans } from '../types';
import { searchBibleVerses } from '../services/geminiService';

interface VerseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTranslation: string;
  addToast: (message: string, type?: ToastMessage['type']) => void;
  appLanguage: 'pl' | 'en';
  initialQuery?: string;
}

export const VerseSearchModal: React.FC<VerseSearchModalProps> = ({ isOpen, onClose, selectedTranslation, addToast, appLanguage, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<FoundVerse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setResults([]);
    try {
      const data = await searchBibleVerses(searchQuery, selectedTranslation, appLanguage);
      if (data.length > 0) {
        setResults(data);
        addToast(appLanguage === 'pl' ? `Znaleziono ${data.length} wersety.` : `Found ${data.length} verses.`, 'success');
      } else {
        addToast(appLanguage === 'pl' ? "Nie znaleziono wersetów dla podanej frazy." : "No verses found for the given phrase.", "info");
      }
    } catch (error) {
      addToast(appLanguage === 'pl' ? "Błąd wyszukiwania. Spróbuj ponownie." : "Search error. Try again.", "info");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTranslation, addToast, appLanguage]);

  useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    } else if (!isOpen) {
      setResults([]);
      setQuery('');
    }
  }, [isOpen, initialQuery, handleSearch]);

  const copyResults = useCallback(() => {
    if (results.length === 0) return;
    const text = results.map((v: FoundVerse) => `${v.reference}: "${v.text}"\n(Kontekst: ${v.connection})`).join('\n\n');
    navigator.clipboard.writeText(text);
    addToast(appLanguage === 'pl' ? "Wyniki wyszukiwania skopiowane!" : "Search results copied!", "success");
  }, [results, addToast, appLanguage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fade-in-scale-up" onClick={onClose}>
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-3xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center p-8 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
              {appLanguage === 'pl' ? 'Wyszukiwarka' : 'Search'} <span className="text-[#C5A059]">{appLanguage === 'pl' ? 'Słowa' : 'Word'}</span>
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
              Scriptura scripturam interpretatur
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-[#C5A059] transition-colors rounded-full bg-zinc-900" title={appLanguage === 'pl' ? "Zamknij" : "Close"}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-8 pb-4 flex-shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={appLanguage === 'pl' ? "Wpisz słowo, temat lub problem (np. lęk, nadzieja, przebaczenie)..." : "Enter a word, topic or problem (e.g. fear, hope, forgiveness)..."}
              className="w-full py-4 pl-6 pr-14 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none text-white placeholder-zinc-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-[#C5A059] disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              )}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6 scrollbar-thin">
          {results.length > 0 ? (
            <div className="space-y-6 animate-slide-down">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{appLanguage === 'pl' ? 'Wyniki wyszukiwania' : 'Search results'}</span>
                <button onClick={copyResults} className="text-[10px] font-bold text-[#C5A059] hover:text-[#E2B859] uppercase tracking-widest flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  {appLanguage === 'pl' ? 'Kopiuj' : 'Copy'}
                </button>
              </div>
              
              {results.map((verse, idx) => (
                <div key={idx} className="bg-zinc-900/60 rounded-2xl p-6 border border-zinc-800 hover:border-[#C5A059]/30 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-6 h-6 rounded-full bg-[#C5A059]/20 text-[#C5A059] flex items-center justify-center text-xs font-black">{idx + 1}</span>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{verse.reference}</h4>
                  </div>
                  <p className="text-lg font-serif italic text-zinc-200 mb-4 leading-relaxed">
                    "{verse.text}"
                  </p>
                  <div className="bg-[#C5A059]/5 p-3 rounded-xl border border-[#C5A059]/10">
                    <p className="text-xs text-zinc-400 font-medium">
                      <span className="text-[#C5A059] font-bold uppercase text-[9px] tracking-widest mr-2">{appLanguage === 'pl' ? 'Kontekst:' : 'Context:'}</span>
                      {verse.connection}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             !isLoading && (
               <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-50 space-y-4">
                 <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                 <p className="text-sm">{appLanguage === 'pl' ? 'Wpisz frazę, aby odkryć biblijne połączenia.' : 'Enter a phrase to discover biblical connections.'}</p>
               </div>
             )
          )}
        </div>
      </div>
    </div>
  );
};
