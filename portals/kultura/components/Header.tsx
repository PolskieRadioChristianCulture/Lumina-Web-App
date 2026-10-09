import React, { useState } from 'react';
import { CcnLogo } from './CcnLogo';
import { SharedAuthWidget } from './SharedAuthWidget';
import { Radio, Menu, X, Film, Users, BookOpen, Sparkles } from 'lucide-react';
import { AppLanguage, UserPersona } from '../types';

interface HeaderProps {
  onOpenUserPanel: () => void;
  onOpenLanguageModal: () => void;
  isRadioPlaying: boolean;
  onToggleRadio: () => void;
  appLanguage: AppLanguage;
  userPersona: UserPersona;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUserPanel,
  onOpenLanguageModal,
  isRadioPlaying,
  onToggleRadio,
  appLanguage,
  userPersona,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getFlag = (lang: AppLanguage) => {
    const flags: Record<AppLanguage, string> = {
      pl: '🇵🇱', en: '🇺🇸', es: '🇪🇸', pt: '🇵🇹', de: '🇩🇪', fr: '🇫🇷', it: '🇮🇹', uk: '🇺🇦'
    };
    return flags[lang] || '🌐';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* Top CC Ecosystem Navigation Bar */}
      <div className="bg-[#010101] text-zinc-300 text-[11px] font-bold tracking-wider uppercase border-b border-[#1f1f1f] px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="hidden md:inline-flex items-center gap-1.5 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f9282b]"></span>
              Ekosystem Christian Culture:
            </span>
            <nav 
              aria-label="Ekosystem Christian Culture" 
              tabIndex={0} 
              className="flex items-center gap-4 sm:gap-6 min-w-0 overflow-x-auto whitespace-nowrap py-0.5 no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <a href="/player" className="hover:text-[#f9282b] transition-colors">Radio</a>
              <a href="/lumina" className="hover:text-[#f9282b] transition-colors">LUMINA</a>
              <a href="/akademia" className="hover:text-[#f9282b] transition-colors">Akademia</a>
              <a href="/vod" className="hover:text-[#f9282b] transition-colors">Kino VOD</a>
              <a href="/mojabiblia" className="hover:text-[#f9282b] transition-colors">Biblia</a>
              <a href="/biznes" className="hover:text-[#f9282b] transition-colors">Biznes</a>
              <a href="/kultura" className="text-[#f9282b] font-black border-b border-[#f9282b] pb-0.5">KULTURA</a>
              <a href="/news" className="hover:text-[#f9282b] transition-colors">NEWS</a>
              <a href="/ogloszenia" className="hover:text-[#f9282b] transition-colors">OGŁOSZENIA</a>
              <a href="/ziu" className="hover:text-[#f9282b] transition-colors">ZIU</a>
              <a href="/live" className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE
              </a>
            </nav>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-zinc-400 font-serif">
            <span>Soli Deo Gloria</span>
          </div>
        </div>
      </div>

      {/* Main Brand & Nav Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-3 sm:py-4">
          {/* Logo & Subpage Badge */}
          <div className="flex items-center gap-3 shrink-0 mr-4">
            <div className="block">
              <CcnLogo layout="horizontal" theme="light" subLabel="KULTURA" subTitle="Centrum Kultury" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <a
              href="/kultura"
              className="text-[#bb142e] font-bold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#bb142e]" />
              <span>Główny Pulpit</span>
            </a>
            <a
              href="/vod"
              className="hover:text-[#bb142e] transition-colors flex items-center gap-1.5 text-zinc-700"
            >
              <Film className="w-4 h-4 text-zinc-400" />
              <span>Kino Chrześcijańskie VOD</span>
            </a>
            <a
              href="/lumina"
              className="hover:text-[#bb142e] transition-colors flex items-center gap-1.5 text-zinc-700"
            >
              <Users className="w-4 h-4 text-zinc-400" />
              <span>Społeczność LUMINA</span>
            </a>
            <a
              href="/akademia"
              className="hover:text-[#bb142e] transition-colors flex items-center gap-1.5 text-zinc-700"
            >
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <span>Akademia Biblijna</span>
            </a>
            <a
              href="/news"
              className="hover:text-[#bb142e] transition-colors flex items-center gap-1.5 text-zinc-700"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f9282b]"></span>
              <span>Wiadomości NEWS</span>
            </a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Radio Stream Button */}
            <button
              onClick={onToggleRadio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer border ${
                isRadioPlaying
                  ? 'bg-[#bb142e] border-[#bb142e] text-white animate-pulse'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-200'
              }`}
              title="Polskie Radio Christian Culture - Transmisja Na Żywo"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Radio Live</span>
              {isRadioPlaying && <span className="w-2 h-2 rounded-full bg-white"></span>}
            </button>

            {/* Language Selector */}
            <button
              onClick={onOpenLanguageModal}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              title="Zmień język"
            >
              <span className="text-base">{getFlag(appLanguage)}</span>
              <span className="hidden md:inline uppercase text-[10px] font-bold">{appLanguage}</span>
            </button>

            {/* Google Global Auth */}
            <SharedAuthWidget />

            {/* Share to X */}
            <button
              onClick={() => {
                const url = typeof window !== 'undefined' ? window.location.href : 'https://polskieradio.cc/kultura';
                const text = 'CCN Kultura – Centrum Kultury Chrześcijańskiej & Dashboard Uświęcenia | Christian Culture:';
                window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer,width=600,height=450');
              }}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-100 hover:bg-black hover:text-white text-zinc-700 transition cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px] border border-zinc-200"
              title="Udostępnij na platformie X"
              aria-label="Udostępnij na platformie X"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>

            {/* Share to LUMINA (L) */}
            <button
              onClick={() => {
                const url = typeof window !== 'undefined' ? window.location.href : 'https://polskieradio.cc/kultura';
                const title = document.title || 'CCN Kultura | Christian Culture';
                const luminaUrl = `https://polskieradio.cc/tablica?share_url=${encodeURIComponent(url)}&share_title=${encodeURIComponent(title)}&share_image=https%3A%2F%2Fpolskieradio.cc%2Fccn-logo-square.png&share_img=https%3A%2F%2Fpolskieradio.cc%2Fccn-logo-square.png`;
                window.open(luminaUrl, '_blank', 'noopener,noreferrer');
              }}
              className="lumina-share-btn-l w-10 h-10 sm:w-auto sm:px-3 sm:py-1.5 rounded-lg bg-gradient-to-br from-[#bb142e] to-[#800d1e] text-white flex items-center justify-center font-black text-xs hover:scale-105 transition cursor-pointer shadow-xs border border-amber-400/40 min-w-[44px] min-h-[44px]"
              data-lumina-share="true"
              title="Udostępnij na Tablicy Społeczności LUMINA"
              aria-label="Udostępnij na Tablicy LUMINA"
            >
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#facc15] to-[#d97706] text-[#07090e] font-serif font-black text-xs flex items-center justify-center shadow-xs">L</span>
              <span className="hidden md:inline ml-1.5 font-bold text-xs">Tablica</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-gray-800 hover:text-[#bb142e] hover:bg-gray-100 rounded-lg transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-gray-200 py-3 space-y-1">
            <a
              href="/kultura"
              className="block px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 text-[#bb142e]"
            >
              Pulpit Centrum Kultury CC
            </a>
            <a
              href="/vod"
              className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 hover:text-[#bb142e] transition"
            >
              Kino Chrześcijańskie VOD
            </a>
            <a
              href="/lumina"
              className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 hover:text-[#bb142e] transition"
            >
              Portal Społeczności LUMINA
            </a>
            <a
              href="/akademia"
              className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 hover:text-[#bb142e] transition"
            >
              Akademia Biblijna CC
            </a>
            <a
              href="/news"
              className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 hover:text-[#bb142e] transition"
            >
              CCN News – Wiadomości
            </a>
            <a
              href="/biznes"
              className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 hover:text-[#bb142e] transition"
            >
              Business Hub CC
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
