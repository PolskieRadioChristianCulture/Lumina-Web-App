import React, { useRef, useEffect, useState } from 'react';
import {
  Newspaper,
  Atom,
  BookOpen,
  Dna,
  Scale,
  Heart,
  Shield,
  GraduationCap,
  HeartPulse,
  Coins,
  Cpu,
  Globe,
  Palette,
  Briefcase,
  UtensilsCrossed,
  Tag,
  Handshake,
  Network,
  Radio,
  Users,
  Tv,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Pause,
  Play
} from 'lucide-react';

interface EcosystemItem {
  id: string;
  name: string;
  tagline: string;
  category: string;
  href: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
  bgGradient: string;
  badge?: string;
}

const ECOSYSTEM_PAGES: EcosystemItem[] = [
  // 1. CCN News
  {
    id: 'news',
    name: 'CCN News',
    tagline: 'Główny portal informacyjny, śledztwa, przegląd prasy i analizy biblijne',
    category: 'Główny Portal',
    href: '/news',
    icon: Newspaper,
    accentColor: 'text-[#f9282b]',
    bgGradient: 'from-red-950/40 via-zinc-900 to-black',
    badge: 'NEWS 24/7'
  },
  // 2. CCN Nauka
  {
    id: 'nauka',
    name: 'CCN Nauka',
    tagline: 'Kosmologia, Fine-Tuning, socjopatologie i etyka chrześcijańska',
    category: 'Kosmologia & Nauka',
    href: '/nauka',
    icon: Atom,
    accentColor: 'text-sky-400',
    bgGradient: 'from-sky-950/40 via-zinc-900 to-black',
    badge: 'KOSMOLOGIA'
  },
  // 3. CCN Historia
  {
    id: 'historia',
    name: 'CCN Historia',
    tagline: 'Archeologia biblijna, Zwoje z Qumran, stela z Tel Dan i manuskrypty',
    category: 'Historia & Archeologia',
    href: '/historia',
    icon: BookOpen,
    accentColor: 'text-amber-400',
    bgGradient: 'from-amber-950/40 via-zinc-900 to-black',
    badge: 'ARCHEOLOGIA'
  },
  // 4. CCN Biologia
  {
    id: 'biologia',
    name: 'CCN Biologia',
    tagline: 'Kod DNA, maszyny molekularne, syntaza ATP i cud poczęcia',
    category: 'Biologia & Życie',
    href: '/biologia',
    icon: Dna,
    accentColor: 'text-emerald-400',
    bgGradient: 'from-emerald-950/40 via-zinc-900 to-black',
    badge: 'KOD DNA'
  },
  // 5. CCN Prawo
  {
    id: 'prawo',
    name: 'CCN Prawo',
    tagline: 'Dekalog fundamentem praworządności, prawa naturalne i wolność sumienia',
    category: 'Prawo & Etyka',
    href: '/prawo',
    icon: Scale,
    accentColor: 'text-indigo-400',
    bgGradient: 'from-indigo-950/40 via-zinc-900 to-black',
    badge: 'DEKALOG'
  },
  // 6. CCN Małżeństwo
  {
    id: 'seks',
    name: 'CCN Małżeństwo',
    tagline: 'Boży zamysł dla intymności, narzeczeństwo i czystość przedmałżeńska',
    category: 'Małżeństwo & Czystość',
    href: '/seks',
    icon: Heart,
    accentColor: 'text-rose-400',
    bgGradient: 'from-rose-950/40 via-zinc-900 to-black',
    badge: 'CZYSTOŚĆ'
  },
  // 7. CCN Apologetyka
  {
    id: 'apologetyka',
    name: 'CCN Apologetyka',
    tagline: 'Obrona wiary, racjonalne dowody, zmartwychwstanie i prawda Ewangelii',
    category: 'Obrona Wiary',
    href: '/apologetyka',
    icon: Shield,
    accentColor: 'text-red-400',
    bgGradient: 'from-red-950/40 via-zinc-900 to-black',
    badge: 'OBRONA WIARY'
  },
  // 8. CCN Edukacja
  {
    id: 'edukacja',
    name: 'CCN Edukacja',
    tagline: 'Chrześcijańskie wychowanie, edukacja domowa i formacja charakteru',
    category: 'Wychowanie & Szkoła',
    href: '/edukacja',
    icon: GraduationCap,
    accentColor: 'text-emerald-400',
    bgGradient: 'from-emerald-950/40 via-zinc-900 to-black',
    badge: 'EDUKACJA'
  },
  // 9. CCN Psychologia
  {
    id: 'psychologia',
    name: 'CCN Psychologia',
    tagline: 'Zdrowie psychiczne, metanoia (Rz 12:2), emocje i pokój Boży',
    category: 'Zdrowie Psychiczne',
    href: '/psychologia',
    icon: HeartPulse,
    accentColor: 'text-violet-400',
    bgGradient: 'from-violet-950/40 via-zinc-900 to-black',
    badge: 'PSYCHOLOGIA'
  },
  // 10. CCN Finanse
  {
    id: 'finanse',
    name: 'CCN Finanse',
    tagline: 'Biblijne szafarstwo, wolność od długów, oszczędzanie i etyczna ekonomia',
    category: 'Szafarstwo & Finanse',
    href: '/finanse',
    icon: Coins,
    accentColor: 'text-amber-400',
    bgGradient: 'from-amber-950/40 via-zinc-900 to-black',
    badge: 'SZAFARSTWO'
  },
  // 11. CCN Technologie
  {
    id: 'technologie',
    name: 'CCN Technologie',
    tagline: 'Sztuczna inteligencja, cyberetyka, media cyfrowe i przyszłość',
    category: 'Technologie & AI',
    href: '/technologie',
    icon: Cpu,
    accentColor: 'text-cyan-400',
    bgGradient: 'from-cyan-950/40 via-zinc-900 to-black',
    badge: 'TECH & AI'
  },
  // 12. CCN Misje & Świadectwa
  {
    id: 'misje',
    name: 'CCN Misje & Świadectwa',
    tagline: 'Kościół prześladowany, front ewangelizacji i świadectwa mocy Bożej',
    category: 'Misje & Świadectwa',
    href: '/misje',
    icon: Globe,
    accentColor: 'text-orange-400',
    bgGradient: 'from-orange-950/40 via-zinc-900 to-black',
    badge: 'MISJE'
  },
  // 13. CCN Kultura
  {
    id: 'kultura',
    name: 'CCN Kultura',
    tagline: 'Centrum sztuki, literatury, muzyki i chrześcijańskiego dziedzictwa',
    category: 'Sztuka & Muzyka',
    href: '/kultura',
    icon: Palette,
    accentColor: 'text-pink-400',
    bgGradient: 'from-pink-950/40 via-zinc-900 to-black',
    badge: 'SZTUKA'
  },
  // 14. CCN Biznes
  {
    id: 'biznes',
    name: 'CCN Biznes',
    tagline: 'Katalog rzetelnych chrześcijańskich firm, usług i etyki pracy',
    category: 'Gospodarka & Praca',
    href: '/biznes',
    icon: Briefcase,
    accentColor: 'text-sky-400',
    bgGradient: 'from-sky-950/40 via-zinc-900 to-black',
    badge: 'KATALOG FIRM'
  },
  // 15. CCN Kuchnia
  {
    id: 'kuchnia',
    name: 'CCN Kuchnia',
    tagline: 'Chrześcijański stół, chleb Ezechiela, ryba galilejska i gościnność',
    category: 'Stół Biblijny',
    href: '/kuchnia',
    icon: UtensilsCrossed,
    accentColor: 'text-amber-400',
    bgGradient: 'from-amber-950/40 via-zinc-900 to-black',
    badge: 'PRZEPISY'
  },
  // 16. CCN ZIU (Zdrowie i Uroda)
  {
    id: 'ziu',
    name: 'CCN ZIU (Zdrowie)',
    tagline: 'Zdrowie i uroda w świetle Biblii, zioła biblijne i dieta Stwórcy',
    category: 'Zdrowie & Ciało',
    href: '/ziu',
    icon: HeartPulse,
    accentColor: 'text-teal-400',
    bgGradient: 'from-teal-950/40 via-zinc-900 to-black',
    badge: 'ZDROWIE'
  },
  // 17. CCN Ogłoszenia
  {
    id: 'ogloszenia',
    name: 'CCN Ogłoszenia',
    tagline: 'Chrześcijańscy fachowcy, praca, mieszkania, pomoc i zlecenia',
    category: 'Ogłoszenia',
    href: '/ogloszenia',
    icon: Tag,
    accentColor: 'text-orange-400',
    bgGradient: 'from-orange-950/40 via-zinc-900 to-black',
    badge: 'FACHOWCY'
  },
  // 18. CCN Biblioteka
  {
    id: 'biblioteka',
    name: 'CCN Biblioteka',
    tagline: 'Cyfrowa biblioteka chrześcijańska: książki, audiobooki, e-booki i lektury',
    category: 'Książki & E-booki',
    href: '/biblioteka',
    icon: BookOpen,
    accentColor: 'text-yellow-400',
    bgGradient: 'from-yellow-950/40 via-zinc-900 to-black',
    badge: 'BIBLIOTEKA'
  },
  // 19. CCN Współpraca Misyjna
  {
    id: 'wspolpraca',
    name: 'CCN Współpraca Misyjna',
    tagline: 'Centralny hub partnerstwa: zbory, twórcy, media i wolontariat',
    category: 'Partnerstwo Misyjne',
    href: '/wspolpraca',
    icon: Handshake,
    accentColor: 'text-[#f9282b]',
    bgGradient: 'from-red-950/40 via-zinc-900 to-black',
    badge: 'MISJA CC'
  },
  // 20. CC Network
  {
    id: 'network',
    name: 'CC Network',
    tagline: 'Cyfrowy węzeł ekosystemu Christian Culture i infrastruktura mediów',
    category: 'Węzeł Cyfrowy',
    href: '/network',
    icon: Network,
    accentColor: 'text-blue-400',
    bgGradient: 'from-blue-950/40 via-zinc-900 to-black',
    badge: 'NETWORK'
  },
  // FLAGSHIP PLATFORMS
  {
    id: 'player',
    name: 'Radio CC',
    tagline: '6 stacji radiowych 24/7, uwielbienie, nauczanie i słuchowiska',
    category: 'Media & Dźwięk',
    href: '/player',
    icon: Radio,
    accentColor: 'text-amber-500',
    bgGradient: 'from-amber-950/40 via-zinc-900 to-black',
    badge: 'LIVE 24/7'
  },
  {
    id: 'lumina',
    name: 'LUMINA',
    tagline: 'Globalny chrześcijański portal społecznościowy i profile wiary',
    category: 'Społeczność',
    href: '/lumina',
    icon: Users,
    accentColor: 'text-blue-400',
    bgGradient: 'from-blue-950/40 via-zinc-900 to-black',
    badge: 'SPOŁECZNOŚĆ'
  },
  {
    id: 'akademia',
    name: 'Akademia Biblijna',
    tagline: 'Bezpłatne certyfikowane kursy, 24 wykłady 4K o Apokalipsie',
    category: 'Edukacja & Studia',
    href: '/akademia',
    icon: GraduationCap,
    accentColor: 'text-emerald-400',
    bgGradient: 'from-emerald-950/40 via-zinc-900 to-black',
    badge: 'CERTYFIKAT'
  },
  {
    id: 'vod',
    name: 'Kino VOD',
    tagline: 'Filmy fabularne, dokumentalne i reportaże o wierze bez reklam',
    category: 'Film & Telewizja',
    href: '/vod',
    icon: Tv,
    accentColor: 'text-purple-400',
    bgGradient: 'from-purple-950/40 via-zinc-900 to-black',
    badge: 'VOD HD'
  },
  {
    id: 'mojabiblia',
    name: 'Moja Biblia',
    tagline: 'Interlinearna Biblia z kodami Stronga, hebrajskim i greką',
    category: 'Słowo Boże',
    href: '/mojabiblia',
    icon: BookOpen,
    accentColor: 'text-yellow-400',
    bgGradient: 'from-yellow-950/40 via-zinc-900 to-black',
    badge: 'INTERLINEARNA'
  }
];

export const EcosystemCarouselSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animId: number;
    const speed = 0.75;

    const step = () => {
      if (!isPausedRef.current && !isDragging.current && container) {
        const halfWidth = container.scrollWidth / 2;
        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth;
        } else {
          container.scrollLeft += speed;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -340 : 340;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const loopItems = [...ECOSYSTEM_PAGES, ...ECOSYSTEM_PAGES];

  return (
    <section className="my-8 sm:my-10 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#bb142e] mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#bb142e] animate-pulse"></span>
            <span>Poznaj Ekosystem Christian Culture</span>
            <Sparkles className="w-3.5 h-3.5 ml-0.5 text-amber-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 leading-tight">
            Portale Christian Culture (20 Działów)
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Otwarte przestrzenie wiedzy, nauki, edukacji, społeczeństwa, zdrowia i misji
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="h-8 px-2.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer mr-1"
            title={isPaused ? "Wznów automatyczne przewijanie" : "Zatrzymaj automatyczne przewijanie"}
            aria-label={isPaused ? "Wznów przewijanie" : "Zatrzymaj przewijanie"}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span className="hidden sm:inline text-gray-600">Autoplay</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                <span className="hidden sm:inline text-gray-600">Pauza</span>
              </>
            )}
          </button>

          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Przewiń w lewo"
            title="Wstecz"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Przewiń w prawo"
            title="Dalej"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsPaused(true)}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none pb-2 pt-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loopItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <a
              key={`${item.id}-${index}`}
              href={item.href}
              className="flex-none w-[270px] sm:w-[290px] rounded-xl bg-gradient-to-br from-zinc-900 to-[#121214] border border-zinc-800 p-4 sm:p-5 flex flex-col justify-between text-left group hover:border-[#bb142e] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#bb142e]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50 ${item.accentColor} group-hover:scale-105 transition-transform duration-300`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 group-hover:border-[#bb142e]/40 transition-colors">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  {item.category}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                  {item.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                  {item.tagline}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/70 flex items-center justify-between text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
                <span>Otwórz portal</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};
