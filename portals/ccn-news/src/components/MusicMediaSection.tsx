import React from 'react';
import { Radio, Music2, Film, Headphones, ExternalLink, Sparkles } from 'lucide-react';

interface MusicMediaSectionProps {
  isRadioPlaying: boolean;
  onToggleRadio: () => void;
}

export const MusicMediaSection: React.FC<MusicMediaSectionProps> = ({
  isRadioPlaying,
  onToggleRadio,
}) => {
  const mediaItems = [
    {
      title: 'Polskie Radio CC: Pasmo Uwielbienia & Prawdy',
      desc: 'Całodobowy strumień najpiękniejszej muzyki chrześcijańskiej, pieśni uwielbienia, kazań i natchnionego Słowa Bożego.',
      actionLabel: isRadioPlaying ? 'Zatrzymaj Transmisję' : 'Włącz Radio Na Żywo',
      isRadio: true,
      badge: 'Transmisja 24/7',
      bgClass: 'from-[#1a0508] to-[#0a0203]',
      borderClass: 'border-[#bb142e]/30',
      icon: Radio,
    },
    {
      title: 'Słuchowiska Biblia Audio CC',
      desc: 'Wielogłosowe dramatyzowane adaptacje ksiąg Starego i Nowego Testamentu z muzyką orkiestrową i tłem dźwiękowym.',
      actionLabel: 'Słuchaj w Odtwarzaczu',
      href: '/player',
      badge: 'Biblia Audio',
      bgClass: 'from-[#0b1320] to-[#040810]',
      borderClass: 'border-blue-900/40',
      icon: Headphones,
    },
    {
      title: 'Kino VOD Christian Culture',
      desc: 'Pełnometrażowe filmy biblijne, dokumenty z Ziemi Świętej oraz wykłady historyczne w jakości kinowej 4K bez reklam.',
      actionLabel: 'Przejdź do Kina VOD',
      href: '/vod',
      badge: 'Kino VOD',
      bgClass: 'from-[#141005] to-[#0a0802]',
      borderClass: 'border-amber-700/40',
      icon: Film,
    },
    {
      title: 'Biblia Śpiewana & Psalmy Dawidowe',
      desc: 'Hymny oparte bezpośrednio na dosłownym tekście Pisma Świętego. Medytacja i modlitwa śpiewem każdego dnia.',
      actionLabel: 'Odkryj Kanał Live',
      href: '/live',
      badge: 'Psalmy',
      bgClass: 'from-[#0e1710] to-[#060d07]',
      borderClass: 'border-emerald-800/40',
      icon: Music2,
    },
  ];

  return (
    <section className="my-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#bb142e] mb-1">
            <Music2 className="w-3.5 h-3.5" />
            Media & Muzyka Christian Culture
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Dźwięk i Obraz Ku Chwale Bożej
          </h2>
        </div>
        <a
          href="/player"
          className="text-xs font-bold text-[#bb142e] hover:underline flex items-center gap-1"
        >
          Otwórz Główny Player <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {mediaItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`group bg-gradient-to-br ${item.bgClass} text-white rounded-2xl p-5 border ${item.borderClass} shadow-md flex flex-col justify-between hover:scale-[1.01] hover:border-white/25 transition-all`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-white/95 border border-white/15 whitespace-nowrap shadow-xs">
                    {item.badge}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-white/80 group-hover:text-white group-hover:bg-white/15 group-hover:border-white/25 transition-all">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-serif font-bold text-base text-white leading-snug mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10">
                {item.isRadio ? (
                  <button
                    onClick={onToggleRadio}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                      isRadioPlaying
                        ? 'bg-[#bb142e] text-white animate-pulse'
                        : 'bg-white text-gray-900 hover:bg-zinc-100'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{item.actionLabel}</span>
                  </button>
                ) : (
                  <a
                    href={item.href}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center gap-2 text-center"
                  >
                    <span>{item.actionLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <a
        href="https://youtube.com/@studiodees?si=aQ65vFbYnewd_cr5"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Studio Dobrego Słowa — otwórz kanał YouTube w nowej karcie"
        className="block mt-6 overflow-hidden rounded-2xl border border-red-200 shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-700"
      >
        <img
          src="/ccn-studio-dobrego-slowa.jpg"
          alt="Studio Dobrego Słowa — premiera w sobotę o 21:00. Baner kanału YouTube."
          width="1280"
          height="353"
          loading="lazy"
          decoding="async"
          className="block w-full h-auto"
        />
      </a>
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#bb142e] mb-1">Kultura · Playlista YouTube</p>
            <h3 className="font-serif text-xl font-bold text-gray-900">Mega Hit 2026</h3>
            <p className="text-sm text-gray-600 mt-2">Muzyka i materiały wideo z playlisty wskazanej przez redakcję CCN.</p>
          </div>
          <a href="https://youtube.com/playlist?list=PLQBdxcl9HBc_NZedkCUTlrUZhZAtqodU1&si=DqP9mfyDHwhNIxt-" target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-[#bb142e] rounded-lg border border-red-200 px-4 py-2 hover:bg-red-50">
            Otwórz playlistę w YouTube <ExternalLink className="w-4 h-4 shrink-0" />
          </a>
        </div>
          <iframe title="Mega Hit 2026 — playlista YouTube" src="https://www.youtube-nocookie.com/embed/videoseries?list=PLQBdxcl9HBc_NZedkCUTlrUZhZAtqodU1"
            className="w-full aspect-video min-h-[220px] rounded-xl border-0 bg-black" allow="encrypted-media; picture-in-picture; fullscreen" loading="eager" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />

      </div>
    </section>
  );
};
