import React, { useState } from 'react';
import { Article } from '../types';
import { Mail, CheckCircle2, Radio, Sparkles, BookOpen, GraduationCap, ExternalLink, ArrowRight } from 'lucide-react';
import { LEXICON_ENTRIES } from '../data/lexicon';

interface SidebarProps {
  popularArticles: Article[];
  dailyDevotional: Article;
  onReadArticle: (article: Article) => void;
  isRadioPlaying: boolean;
  onToggleRadio: () => void;
  onNavigateToLexicon?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  popularArticles,
  dailyDevotional,
  onReadArticle,
  isRadioPlaying,
  onToggleRadio,
  onNavigateToLexicon,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  // Featured Word from the Lexicon (e.g., Paruzja or Szalom)
  const featuredLexicon = LEXICON_ENTRIES[0]; // Paruzja

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@') || !newsletterEmail.includes('.')) {
      setNewsletterError('Wprowadź prawidłowy adres e-mail');
      return;
    }
    setNewsletterError('');
    setNewsletterSubmitted(true);
  };

  return (
    <aside className="space-y-8">
      {/* Słowo Dnia ze Strongiem (Chrześcijańska Encyklopedia) */}
      <div className="bg-gradient-to-br from-[#010101] via-[#120507] to-[#010101] text-white rounded-xl shadow-md border border-[#bb142e]/30 p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#f9282b]" />
            <span className="text-[11px] uppercase tracking-widest font-extrabold text-[#f9282b]">
              Leksykon Biblijny • Słowo Dnia
            </span>
          </div>
          {featuredLexicon.strongCode && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#bb142e]/30 border border-[#bb142e]/50 text-white font-bold">
              Strong {featuredLexicon.strongCode}
            </span>
          )}
        </div>

        <div className="my-2">
          <h4 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <span>{featuredLexicon.term}</span>
            <span className="text-sm font-normal text-zinc-400">
              ({featuredLexicon.originalScript})
            </span>
          </h4>
          <p className="text-xs text-zinc-300 mt-1 leading-relaxed line-clamp-3">
            {featuredLexicon.definition}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] text-zinc-400 italic">
            {featuredLexicon.keyVerses[0]?.ref}
          </span>
          <button
            onClick={onNavigateToLexicon}
            className="text-xs font-bold text-[#f9282b] hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <span>Otwórz Leksykon</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Najpopularniejsze */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
          <span className="w-1.5 h-5 bg-[#bb142e] rounded"></span>
          Najpopularniejsze Wiadomości
        </h3>
        <ol className="space-y-4">
          {popularArticles.map((article, index) => (
            <li key={article.id} className="flex items-start gap-3 group">
              <span className="text-2xl font-bold text-zinc-300 group-hover:text-[#bb142e] transition leading-none select-none font-mono">
                {index + 1}
              </span>
              <div className="flex-1">
                <button
                  onClick={() => onReadArticle(article)}
                  className="text-left font-semibold text-sm hover:text-[#bb142e] text-gray-900 leading-snug transition cursor-pointer"
                >
                  {article.title}
                </button>
                <time className="block text-xs text-gray-500 mt-1">
                  {article.dateFormatted}
                </time>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Akademia Biblijna CC Banner */}
      <div className="bg-gradient-to-r from-[#bb142e] to-[#981025] text-white rounded-xl shadow-md p-5 border border-red-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-100 mb-2">
          <GraduationCap className="w-4 h-4" />
          Akademia Biblijna CC
        </div>
        <h4 className="font-serif font-bold text-base text-white leading-snug mb-1">
          Kurs Apokalipsy (24 Wykłady 4K)
        </h4>
        <p className="text-xs text-red-100/90 leading-relaxed mb-4">
          Odkryj tajemnice Księgi Objawienia bez lęku. Bezpłatne wykłady, quizy i oficjalny certyfikat.
        </p>
        <a
          href="/akademia"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-white text-gray-900 hover:bg-zinc-100 rounded-lg text-xs font-bold transition shadow-xs"
        >
          <span>Rozpocznij Bezpłatnie</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Codzienny program Z Biblią za Pan Brat */}
      <div className="bg-gradient-to-br from-[#010101] to-[#141414] text-white rounded-xl shadow-md border border-[#262626] p-5 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f9282b]" />
            <span className="text-xs uppercase tracking-widest font-extrabold text-[#f9282b]">
              Z Biblią za Pan Brat
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <img src={dailyDevotional.author.avatarUrl} alt={dailyDevotional.author.name} width="56" height="56" loading="lazy"
            className="w-14 h-14 shrink-0 rounded-full object-cover object-top border-2 border-[#bb142e]" />
          <div>
            <p className="font-bold text-sm">{dailyDevotional.author.name}</p>
            <p className="text-[11px] text-zinc-400">{dailyDevotional.author.role}</p>
            <time dateTime={dailyDevotional.publishedAt} className="text-[11px] text-zinc-400">{dailyDevotional.dateFormatted}</time>
          </div>
        </div>

        <h4 className="font-serif-headline text-lg font-bold text-white mb-2 leading-tight">
          {dailyDevotional.title}
        </h4>

        {dailyDevotional.scriptureReference && (
          <div className="bg-white/5 rounded-lg p-3 my-3 border-l-2 border-[#bb142e] text-xs italic text-zinc-200">
            <p className="font-bold text-[#f9282b] not-italic mb-1">
              {dailyDevotional.scriptureReference.verse}
            </p>
            „{dailyDevotional.scriptureReference.text}”
          </div>
        )}

        <div className="text-xs text-zinc-300 space-y-2 leading-relaxed my-3 max-h-48 overflow-y-auto pr-1">
          {dailyDevotional.content.slice(0, 2).map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={() => onReadArticle(dailyDevotional)}
            className="bg-[#bb142e] hover:bg-[#981025] text-white text-xs font-bold py-2.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer shadow-xs active:translate-y-0.5"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Czytaj artykuł</span>
          </button>
          <a
            href="/akademia/kurscodzienny/dzien-03"
            className="bg-[#D4A94A] hover:bg-[#b89038] text-black text-xs font-bold py-2.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer shadow-xs active:translate-y-0.5 text-center"
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span>Kurs w Akademii →</span>
          </a>
        </div>
      </div>

      {/* Radio Live Widget */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#bb142e]" />
            <span className="font-bold text-sm text-gray-900">Polskie Radio CC</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            LIVE
          </span>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          Stacja radiowa ekosystemu Christian Culture. Najlepsza muzyka chrześcijańska, uwielbienie i budujące Słowo.
        </p>
        <button
          onClick={onToggleRadio}
          className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
            isRadioPlaying
              ? 'bg-[#bb142e] text-white animate-pulse'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{isRadioPlaying ? 'Wyłącz Radio CC' : 'Włącz Radio CC (Live)'}</span>
        </button>
      </div>

      {/* Newsletter */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5">
        <h3 className="font-bold text-base mb-2 flex items-center gap-2 text-gray-900">
          <Mail className="w-4 h-4 text-[#bb142e]" />
          Bądź na bieżąco
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Zapisz się do naszego newslettera i otrzymuj najważniejsze wiadomości i analizy biblijne prosto na swoją skrzynkę.
        </p>

        {newsletterSubmitted ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dziękujemy! Twój adres e-mail został zapisany.</span>
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="space-y-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Twój adres e-mail"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#bb142e] focus:ring-1 focus:ring-[#bb142e]"
            />
            {newsletterError && (
              <span className="text-[11px] text-red-600 block">{newsletterError}</span>
            )}
            <button
              type="submit"
              className="w-full bg-[#bb142e] hover:bg-[#981025] text-white text-xs font-bold py-2 rounded-lg transition cursor-pointer"
            >
              Zapisz się
            </button>
            <p className="text-[10px] text-gray-400 text-center pt-1">
              Szanujemy Twoją prywatność. Zero spamu. Wypisanie 1 kliknięciem.
            </p>
          </form>
        )}
      </div>
    </aside>
  );
};
