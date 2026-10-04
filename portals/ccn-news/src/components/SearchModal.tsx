import React, { useState, useEffect, useRef } from 'react';
import { Article } from '../types';
import { Search, X, Calendar, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredArticles = query.trim()
    ? articles.filter((a) => {
        const q = query.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.author.name.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-200 gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj artykułów, tematów, autorów (np. wiara, Biblia, nadzieja)..."
            className="w-full text-base focus:outline-hidden text-gray-900 placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-2 py-1 bg-gray-100 rounded cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 divide-y divide-gray-100">
          {!query.trim() && (
            <div className="py-8 text-center text-gray-400 text-sm">
              <p>Wpisz słowo kluczowe, aby przeszukać bazę CCN News.</p>
              <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                <span className="text-xs text-gray-500">Popularne:</span>
                {['Wiara', 'Biblia', 'Kościół', 'Świadectwa', 'Z Biblią za Pan Brat'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full cursor-pointer transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && filteredArticles.length === 0 && (
            <div className="py-8 text-center text-gray-500 text-sm">
              Brak artykułów dla zapytania: <span className="font-semibold text-gray-800">„{query}”</span>
            </div>
          )}

          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => {
                onSelectArticle(article);
                onClose();
              }}
              className="py-3 flex items-start justify-between gap-4 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition group"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span className="font-bold text-red-700 uppercase">{article.categoryLabel}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{article.dateFormatted}</span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-1 mt-1">{article.excerpt}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-700 shrink-0 self-center transition transform group-hover:translate-x-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
