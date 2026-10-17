import React, { useState } from 'react';
import { LexiconEntry } from '../types';
import { LEXICON_ENTRIES } from '../data/lexicon';
import { BookOpen, Search, Sparkles, ExternalLink, Bookmark, Tag } from 'lucide-react';

interface LexiconSectionProps {
  onSelectEntry?: (entry: LexiconEntry) => void;
}

export const LexiconSection: React.FC<LexiconSectionProps> = ({ onSelectEntry }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Wszystkie hasła' },
    { id: 'teologia', label: 'Doktryna & Teologia' },
    { id: 'proroctwa', label: 'Eschatologia & Proroctwa' },
    { id: 'oryginal', label: 'Języki Biblijne (Grek/Hebr)' },
    { id: 'spoleczenstwo', label: 'Etyka & Społeczeństwo' },
  ];

  const filteredEntries = LEXICON_ENTRIES.filter((entry) => {
    const matchesSearch =
      entry.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.transliteration && entry.transliteration.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.strongCode && entry.strongCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      entry.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedEntryId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden my-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#010101] via-[#1a0508] to-[#010101] text-white p-6 sm:p-8 border-b border-[#2d080e]">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#bb142e]/20 border border-[#bb142e]/40 text-[#f9282b] text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Leksykon Biblijny & Chrześcijańska Encyklopedia
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Chrześcijańska Wikipedia Wiary
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base mt-2 leading-relaxed">
            Rzetelne definicje teologiczne, kody Stronga, etymologia grecka i hebrajska oraz odnośniki wersetowe powiązane z kursami Akademii Biblijnej Christian Culture.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj hasła, kodu Stronga (np. G3952), terminu greckiego/hebrajskiego..."
              className="w-full pl-11 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-zinc-400 text-sm focus:outline-hidden focus:border-[#f9282b] focus:ring-1 focus:ring-[#f9282b] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Wyczyść
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#bb142e] text-white'
                    : 'bg-white/10 text-zinc-300 hover:bg-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Entries */}
      <div className="p-6 sm:p-8 bg-zinc-50/50">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Znaleziono: {filteredEntries.length} {filteredEntries.length === 1 ? 'hasło' : 'haseł'}
          </span>
          <span className="text-xs text-gray-400">
            Kliknij hasło, aby rozwinąć egzegezę i wersety
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedEntryId === entry.id;

            return (
              <div
                key={entry.id}
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-[#bb142e] shadow-md ring-1 ring-[#bb142e]/20'
                    : 'border-gray-200 hover:border-gray-300 shadow-xs'
                }`}
              >
                {/* Entry Header */}
                <div
                  onClick={() => toggleExpand(entry.id)}
                  className="p-5 cursor-pointer flex items-start justify-between gap-4 select-none hover:bg-gray-50/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-lg font-bold text-gray-900 font-serif">
                        {entry.term}
                      </h3>
                      {entry.originalScript && (
                        <span className="font-serif text-sm px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {entry.originalScript} ({entry.transliteration})
                        </span>
                      )}
                      {entry.strongCode && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-50 text-[#bb142e] border border-red-200">
                          Strong {entry.strongCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-1">
                      {entry.definition}
                    </p>
                  </div>
                  <button
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg transition shrink-0 ${
                      isExpanded
                        ? 'bg-[#bb142e] text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {isExpanded ? 'Zwiń' : 'Rozwiń'}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-gray-100 bg-gray-50/50 space-y-4 animate-in fade-in duration-150">
                    {/* Full Definition */}
                    <div className="mt-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                        Definicja Teologiczna
                      </h4>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {entry.definition}
                      </p>
                    </div>

                    {/* Context */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                        Kontekst Biblijny & Historyczny
                      </h4>
                      <p className="text-xs text-gray-700 leading-relaxed italic bg-white p-3 rounded-lg border border-gray-200">
                        {entry.biblicalContext}
                      </p>
                    </div>

                    {/* Key Verses */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center justify-between">
                        <span>Kluczowe Wersety w Piśmie Świętym</span>
                        <a
                          href="https://polskieradio.cc/mojabiblia"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#bb142e] hover:underline flex items-center gap-1 font-semibold"
                        >
                          Otwórz w Moja Biblia <ExternalLink className="w-3 h-3" />
                        </a>
                      </h4>
                      <div className="space-y-2">
                        {entry.keyVerses.map((verse, vIdx) => (
                          <div
                            key={vIdx}
                            className="bg-white p-2.5 rounded-lg border border-gray-200 text-xs"
                          >
                            <span className="font-bold text-[#bb142e] block mb-0.5">
                              {verse.ref}
                            </span>
                            <span className="text-gray-700 italic">„{verse.text}”</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Connected Course */}
                    {entry.relatedCourseLesson && (
                      <div className="bg-red-50/60 p-3 rounded-xl border border-red-200 flex items-center justify-between gap-3">
                        <div className="text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                            Powiązany Wykład w Akademii Biblijnej CC
                          </span>
                          <span className="font-semibold text-gray-900">
                            {entry.relatedCourseLesson.title}
                          </span>
                        </div>
                        <a
                          href={entry.relatedCourseLesson.url}
                          className="shrink-0 bg-[#bb142e] hover:bg-[#981025] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1"
                        >
                          Przejdź do Lekcji <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {entry.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-medium px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700">Nie znaleziono haseł odpowiadających kryteriom.</p>
            <p className="text-xs text-gray-500 mt-1">Spróbuj wpisać inny termin lub wybrać inną kategorię.</p>
          </div>
        )}
      </div>
    </section>
  );
};
