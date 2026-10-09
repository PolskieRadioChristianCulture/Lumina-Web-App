
import React, { useState } from 'react';

interface GlobalSearchProps {
  dimmed: boolean;
  appLanguage: 'pl' | 'en';
  onOpenNotifications?: () => void;
  onBibleSearch: (query: string) => void;
  unreadCount?: number;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ dimmed, appLanguage, onOpenNotifications, onBibleSearch, unreadCount = 0 }) => {
  const [query, setQuery] = useState('');
  const [isBibleMode, setIsBibleMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    if (!query.trim()) {
      e.preventDefault();
      return;
    }
    if (isBibleMode) {
      e.preventDefault();
      onBibleSearch(query);
      setQuery('');
    }
  };

  const placeholder = isBibleMode 
    ? (appLanguage === 'pl' ? "Szukaj w Słowie..." : "Search Word...")
    : (appLanguage === 'pl' ? "Szukaj w Google..." : "Search Google...");

  return (
    <div 
      id="search-wrapper"
      className={`w-[95%] max-w-[420px] mx-auto my-3 transition-all duration-700 ease-in-out relative z-[100] ${dimmed ? 'opacity-25 scale-95 pointer-events-none' : 'opacity-100'}`}
    >
      <form 
        action="https://www.google.com/search" 
        method="GET" 
        target="_blank" 
        onSubmit={handleSubmit}
        className={`relative group transition-all duration-500 rounded-[20px] border-2 ${isBibleMode ? 'border-[#C5A059] shadow-[0_0_20px_rgba(197,160,89,0.3)] bg-black/60' : 'border-[#C5A059]/40 bg-black/30 shadow-[0_4px_15px_rgba(0,0,0,0.4)]'}`}
      >
        {/* Przycisk trybu - zmniejszony o ok. 30% */}
        <button
          type="button"
          onClick={() => setIsBibleMode(!isBibleMode)}
          className={`absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-500 z-[110] border 
            ${isBibleMode 
              ? 'bg-[#C5A059] border-[#C5A059] text-black scale-105 shadow-[0_0_15px_#C5A059]' 
              : 'bg-zinc-900 border-[#C5A059]/30 text-[#C5A059] hover:bg-black hover:border-[#C5A059] shadow-lg'}`}
          title={appLanguage === 'pl' ? "Zmień tryb wyszukiwania" : "Change search mode"}
        >
          {isBibleMode ? (
            <span className="text-base">📖</span>
          ) : (
            <svg className="w-4 h-4 transition-transform duration-500 rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>

        <input
          type="text"
          name={isBibleMode ? "" : "q"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent pl-11 pr-16 py-2 text-white text-sm font-medium focus:outline-none placeholder-[#C5A059]/30 rounded-[20px]"
          autoComplete="off"
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onOpenNotifications?.(); }}
            className="p-1.5 text-[#C5A059] hover:text-[#E2B859] transition-all hover:scale-110 relative"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-red-600 text-[7px] font-black text-white border border-zinc-950">
                {unreadCount > 9 ? '!' : unreadCount}
              </span>
            )}
          </button>

          <button type="submit" className={`p-1.5 rounded-full transition-all ${isBibleMode ? 'bg-[#C5A059] text-black' : 'text-[#C5A059] hover:bg-white/5'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};
