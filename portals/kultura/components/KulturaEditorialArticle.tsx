import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Share2, Check, ChevronDown, ChevronUp, ExternalLink, Heart } from 'lucide-react';

export const KulturaEditorialArticle: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const art = params.get('art');
      if (art === 'art-kultura-halloween-swiatlosc-vs-mrok' || art === 'kultura' || art === 'halloween') {
        setIsExpanded(true);
      }
    }
  }, []);

  const handleCopyLink = () => {
    const url = 'https://polskieradio.cc/kultura?art=art-kultura-halloween-swiatlosc-vs-mrok';
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareLumina = () => {
    const url = 'https://polskieradio.cc/kultura?art=art-kultura-halloween-swiatlosc-vs-mrok';
    const luminaUrl = `https://polskieradio.cc/tablica?share_url=${encodeURIComponent(url)}&share_title=${encodeURIComponent('Kultura życia i światłości kontra komercyjny kult mroku: Dlaczego chrześcijaństwo nie potrzebuje Halloween')}&share_image=${encodeURIComponent('/images/news/art-kultura-halloween-swiatlosc-vs-mrok.jpg')}`;
    window.open(luminaUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <article 
      id="art-kultura-halloween-swiatlosc-vs-mrok"
      className="relative overflow-hidden rounded-3xl bg-white border-2 border-[#C4A35A]/40 shadow-xl transition-all duration-300 hover:border-[#C4A35A]"
    >
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#bb142e] animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            CCN Kultura · Aksjologia & Estetyka Chrześcijańska
          </span>
        </div>
        <div className="text-xs text-zinc-400 font-medium">
          14 października 2026 · Czas czytania: 7 min
        </div>
      </div>

      <div className="p-6 sm:p-10 space-y-6">
        {/* Header & Meta */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Wiodąca Publicystyka Kultury
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif text-zinc-950 leading-tight">
            KULTURA ŻYCIA I ŚWIATŁOŚCI KONTRA KOMERCYJNY KULT MROKU: DLACZEGO CHRZEŚCIJAŃSTWO NIE POTRZEBUJE HALLOWEEN
          </h2>

          {/* Author Badge */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-1 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/40 shadow-xs bg-zinc-100">
                <img 
                  src="/avatar_wioletta_official.jpg" 
                  alt="Wioletta Rogowska" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/authors/wioletta-rogowska.jpg'; }}
                />
              </div>
              <div>
                <div className="font-bold text-zinc-900 text-sm sm:text-base">Wioletta Rogowska</div>
                <div className="text-xs text-zinc-500">Współzałożycielka Christian Culture</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareLumina}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition flex items-center gap-1.5 cursor-pointer"
                title="Podziel się na Tablicy LUMINA"
              >
                <span className="w-4 h-4 rounded-full bg-amber-400 text-black font-black text-[10px] flex items-center justify-center">L</span>
                <span>Tablica</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                title="Kopiuj link do artykułu"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-zinc-600" />}
                <span>{copied ? 'Skopiowano!' : 'Kopiuj link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cinematic 16:9 Image */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-md">
          <img 
            src="/images/news/art-kultura-halloween-swiatlosc-vs-mrok.jpg" 
            alt="Kultura życia i światłości kontra komercyjny kult mroku" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-4 right-4 text-xs text-white/90 drop-shadow">
            Szlachetna przestrzeń chrześcijańskiej kultury — otwarta Księga Prawdy i ciepłe, złote światło rozpraszające jesienny mrok
          </div>
        </div>

        {/* Scripture Box */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Fundament Pisma Świętego: List do Filipian 4:8</span>
          </div>
          <p className="italic text-base sm:text-lg font-serif leading-relaxed text-zinc-900">
            „Wreszcie, bracia, co tylko jest prawdziwe, co godne, co sprawiedliwe, co czyste, co miłe, co ma dobrą sławę, jeśli jest jakaś cnota i jeśli jakaś chwała — o tym myślcie.”
          </p>
          <div className="text-xs text-amber-800/80 font-mono">
            Klucz grecki: <strong>hagnos (G0053)</strong> — nieskazitelnie czysty, wolny od zepsucia, niosący święte piękno i moralną prawość w sztuce i kulturze.
          </div>
        </div>

        {/* Lead Excerpt */}
        <p className="text-lg sm:text-xl text-zinc-800 font-sans leading-relaxed font-medium">
          Gdy w ostatnich dniach października sklepowe witryny, reklamy i media zalewa fala sztucznej krwi, plastikowych szkieletów i demonicznych masek, warto zadać sobie fundamentalne pytanie kulturoznawcze: co ta wszechobecna estetyka mówi o kondycji współczesnego człowieka? Dlaczego kultura, która szczyci się technologicznym postępem, tak chętnie ucieka w prymitywne oswajanie makabry?
        </p>

        {/* Expandable / Full Content */}
        {isExpanded ? (
          <div className="space-y-6 pt-4 border-t border-gray-200 text-zinc-800 text-base sm:text-lg leading-relaxed animate-in fade-in duration-300">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900">
                1. Estetyka rozkładu a estetyka zmartwychwstania
              </h3>
              <p>
                Od zarania chrześcijaństwa sztuka i kultura sakralna dążyły do wyrażenia prawdy, dobra i piękna jako odbicia charakteru Boga. Renesansowa polifonia, architektura katedralna czy poezja biblijna miały wznosić duszę ludzką ku wieczności. Współczesna popkultura halloweenowa dokonuje zwrotu o 180 stopni: gloryfikuje zgniliznę, śmierć, rany i rozpad. To nie jest jedynie niewinna stylizacja graficzna — to oswajanie ludzkiej wrażliwości z brzydotą i beznadzieją grobu.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900">
                2. Komercjalizacja jako substytut metafizyki
              </h3>
              <p>
                Współczesny człowiek, odciąwszy się od biblijnej nadziei zmartwychwstania, panicznie boi się śmierci. Psychologia kulturowa zauważa, że Halloween działa jak rodzaj komercyjnego znieczulenia: zamieńmy to, co przerażające, w jaskrawy gadżet ze sztucznego tworzywa, zjedzmy słodycze w kształcie gałek ocznych i udawajmy, że panujemy nad mrokiem. Chrześcijaństwo nie potrzebuje takiego iluzorycznego znieczulenia, ponieważ w Chrystusie śmierć została rzeczywiście pokonana.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900">
                3. Chrześcijańska kultura nie jest jałowym negowaniem
              </h3>
              <p>
                Najgorszą odpowiedzią chrześcijan na Halloween byłoby zamknięcie się w lęku lub agresywne potępianie świata. Zadaniem Christian Culture jest tworzenie tętniącej życiem, pociągającej alternatywy: muzyki, która porusza najgłębsze struny serca, literatury niosącej sens, radia i kina budującego relacje. Zamiast ciemności oferujemy pełnię światła: „Wy jesteście światłością świata. Nie może się ukryć miasto położone na górze” (Mt 5:14). Wybieramy życie i piękno!
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between flex-wrap gap-4 border-t border-gray-100">
              <button
                onClick={() => setIsExpanded(false)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-sm transition flex items-center gap-2 cursor-pointer"
              >
                <ChevronUp className="w-4 h-4" />
                <span>Zwiń treść artykułu</span>
              </button>

              <a
                href="/news?art=art-kultura-halloween-swiatlosc-vs-mrok"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#bb142e] hover:bg-[#981025] text-white font-bold text-sm shadow-md transition flex items-center gap-2"
              >
                <span>Otwórz w pełnym czytniku CCN News</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(true)}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-[#bb142e] hover:bg-[#981025] text-white font-bold text-sm sm:text-base shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:shadow-xl"
            >
              <span>Czytaj cały artykuł na portalu Kultura</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
