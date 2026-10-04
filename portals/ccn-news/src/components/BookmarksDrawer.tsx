import React from 'react';
import { Article } from '../types';
import { X, Bookmark, Trash2, ArrowRight } from 'lucide-react';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onRemoveBookmark: (articleId: string) => void;
  onClearAll: () => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarkedArticles,
  onSelectArticle,
  onRemoveBookmark,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-red-700 fill-current" />
            <h3 className="font-bold text-gray-900 text-base">Zapisane artykuły</h3>
            <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
              {bookmarkedArticles.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookmarkedArticles.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bookmark className="w-12 h-12 stroke-1 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-600 text-sm">Brak zapisanych artykułów</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Kliknij ikonę zakładki przy dowolnym artykule, aby przeczytać go później w wolnej chwili.
              </p>
            </div>
          ) : (
            bookmarkedArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white border border-gray-200 hover:border-red-600 rounded-xl p-3 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    onSelectArticle(article);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold text-red-700 uppercase mb-1">
                    <span>{article.categoryLabel}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-500 font-normal">{article.dateFormatted}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900 group-hover:text-red-700 transition leading-snug">
                    {article.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-xs">
                  <button
                    onClick={() => {
                      onSelectArticle(article);
                      onClose();
                    }}
                    className="text-red-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Czytaj</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveBookmark(article.id)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded transition cursor-pointer"
                    title="Usuń z listy"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {bookmarkedArticles.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs text-gray-500 hover:text-red-700 font-medium transition cursor-pointer"
            >
              Wyczyść wszystkie
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Zamknij
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
