import React from 'react';
import { UserPersona, JOZUE_AVATAR_URL, MIRIAM_AVATAR_URL, JESZUA_AVATAR_URL, fixOrphans, AppLanguage } from '../types';
import { Sparkles, Radio, Film, Users, BookOpen, Briefcase, Newspaper, GraduationCap, ArrowRight, CheckCircle2, Heart } from 'lucide-react';

interface CentrumDashboardProps {
  user: UserPersona;
  onOpenManagement: () => void;
  appLanguage: AppLanguage;
}

export const CentrumDashboard: React.FC<CentrumDashboardProps> = ({
  user,
  onOpenManagement,
  appLanguage,
}) => {
  const isMale = user.gender === 'male';
  const mentorName = isMale ? 'Miriam CC' : 'Jeszua';
  const mentorAvatar = isMale ? MIRIAM_AVATAR_URL : JESZUA_AVATAR_URL;

  const translations = {
    pl: {
      welcome: "Centrum Kultury Chrześcijańskiej",
      badge: "Pulpit Ekosystemu Christian Culture",
      doormanMsg: "Jestem Jozue. Pilnuję porządku w Twoim Cyfrowym Centrum Uświęcenia. Tutaj masz bezpośredni dostęp do wszystkich filarów Christian Culture Global: radia, telewizji, kina, akademii i społeczności.",
      activeEcosystems: "Filary Kultury & Wiary",
      yourMentor: "Twój Przewodnik Uświęcenia",
      guide: "Przewodnik Uświęcenia",
      studentPanel: "Mój Panel Pielgrzyma",
      futureVersions: "Rozwój Misji Kultury",
      statusActive: "Dostępne",
      statusPrep: "W przygotowaniu",
      mentorQuoteMale: "\"Niechaj cię nie opuszczają miłość i wierność; przywiąż je do swojej szyi, wypisz je na tablicy swego serca.\" — Przypowieści 3:3",
      mentorQuoteFemale: "\"Słowo Twoje jest pochodnią dla moich nóg i światłem na mojej ścieżce.\" — Psalm 119:105",
      btnRadio: "Słuchaj Radia Live",
      btnVod: "Kino VOD",
      btnAcademy: "Akademia Biblijna",
      cards: {
        portal: { title: "Polskie Radio CC", desc: "Transmisje radiowe na żywo, słuchowiska biblijne i muzyka chrześcijańska w studyjnej jakości." },
        multimedia: { title: "Kino Chrześcijańskie VOD", desc: "Biblioteka pełnometrażowych filmów fabularnych, dokumentów i seriali budujących wiarę." },
        randka: { title: "LUMINA Społeczność", desc: "Chrześcijański portal społecznościowy – wartościowe relacje, grupy modlitewne i czyste dyskusje." },
        ccnews: { title: "CCN News – Wiadomości", desc: "Niezależny portal informacyjny – wiara, kultura, publicystyka i leksykon wiary z nadzieją." },
        biblia: { title: "MojaBiblia Interlinearna", desc: "Pismo Święte online z kodami Stronga, hebrajskim i greckim oryginałem oraz komentarzami." },
        akademia: { title: "Akademia Biblijna CC", desc: "Systematyczny Kurs Codzienny 'Z Biblią za Pan Brat' (2026-2032) – 2009 lekcji uświęcenia." },
        uslugi: { title: "Business Hub CC", desc: "Katalog zweryfikowanych chrześcijańskich firm i usługi oparte na zasadach uczciwości." },
        live: { title: "CCTV24 Live Worship", desc: "Wizualne pasmo modlitewne i całodobowa transmisja telewizyjna Christian Culture TV." }
      }
    },
    en: {
      welcome: "Christian Culture Center",
      badge: "Christian Culture Global Dashboard",
      doormanMsg: "I am Joshua. I oversee your Digital Sanctification Center. Here you have direct access to all pillars of Christian Culture Global.",
      activeEcosystems: "Pillars of Culture & Faith",
      yourMentor: "Sanctification Mentor",
      guide: "Sanctification Guide",
      studentPanel: "Pilgrim Panel",
      futureVersions: "Cultural Mission Growth",
      statusActive: "Available",
      statusPrep: "In preparation",
      mentorQuoteMale: "\"Let love and faithfulness never leave you; bind them around your neck, write them on the tablet of your heart.\" — Proverbs 3:3",
      mentorQuoteFemale: "\"Your word is a lamp for my feet, a light on my path.\" — Psalm 119:105",
      btnRadio: "Listen to Live Radio",
      btnVod: "Cinema VOD",
      btnAcademy: "Bible Academy",
      cards: {
        portal: { title: "Polskie Radio CC", desc: "Live radio stream, audio Bible dramatizations, and Christian music in studio fidelity." },
        multimedia: { title: "Christian Cinema VOD", desc: "Library of Christian feature movies, faith-building documentaries and series." },
        randka: { title: "LUMINA Community", desc: "Christian social network – meaningful fellowship, prayer groups, and clean discussions." },
        ccnews: { title: "CCN News", desc: "Independent Christian news network – faith, worldview, and scripture lexicon." },
        biblia: { title: "MojaBiblia Interlinear", desc: "Online scripture reader with Strong's concordances, original Greek & Hebrew texts." },
        akademia: { title: "CC Bible Academy", desc: "Comprehensive Daily Course 'With Bible Side by Side' (2026-2032) – 2009 study lessons." },
        uslugi: { title: "Business Hub CC", desc: "Directory of vetted Christian enterprises and services based on integrity." },
        live: { title: "CCTV24 Live Worship", desc: "24/7 visual prayer channel and streaming Christian Culture TV." }
      }
    }
  };

  const t = (translations as any)[appLanguage] || translations.pl;

  const cards = [
    {
      id: 'portal',
      icon: Radio,
      badge: 'Radio 24/7',
      url: '/player',
      imageUrl: '/images/kultura/card-radio.jpg',
    },
    {
      id: 'multimedia',
      icon: Film,
      badge: 'Kino VOD',
      url: '/vod',
      imageUrl: '/images/kultura/card-vod.jpg',
    },
    {
      id: 'randka',
      icon: Users,
      badge: 'Społeczność',
      url: '/lumina',
      imageUrl: '/images/kultura/card-lumina.jpg',
    },
    {
      id: 'ccnews',
      icon: Newspaper,
      badge: 'CCN News',
      url: '/news',
      imageUrl: '/images/kultura/card-news.jpg',
    },
    {
      id: 'akademia',
      icon: GraduationCap,
      badge: '2009 Lekcji',
      url: '/akademia',
      imageUrl: '/images/kultura/card-akademia.jpg',
    },
    {
      id: 'biblia',
      icon: BookOpen,
      badge: 'Pismo Święte',
      url: '/mojabiblia',
      imageUrl: '/images/kultura/card-biblia.jpg',
    },
    {
      id: 'uslugi',
      icon: Briefcase,
      badge: 'Gospodarka',
      url: '/biznes',
      imageUrl: '/images/kultura/card-biznes.jpg',
    },
    {
      id: 'live',
      icon: Sparkles,
      badge: 'CCTV24 LIVE',
      url: '/live',
      imageUrl: '/images/kultura/card-live.webp',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Editorial Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white p-8 sm:p-12 border border-zinc-800 shadow-2xl">
        {/* Thematic Grand Culture Hall Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-30 mix-blend-screen scale-105" 
          style={{ backgroundImage: "url('/images/kultura/kultura-hero-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#bb142e]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 opacity-5 select-none pointer-events-none">
          <Sparkles className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#bb142e] text-white text-xs font-bold uppercase tracking-wider shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              {t.badge}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight leading-tight">
              {t.welcome}
            </h1>

            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed font-sans">
              {fixOrphans(t.doormanMsg)}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="/player"
                className="min-h-[44px] px-5 py-3 rounded-xl bg-[#bb142e] hover:bg-[#981025] text-white font-bold text-sm shadow-md transition flex items-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>{t.btnRadio}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="/vod"
                className="min-h-[44px] px-5 py-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-100 font-semibold text-sm border border-zinc-700 transition flex items-center gap-2"
              >
                <Film className="w-4 h-4 text-zinc-400" />
                <span>{t.btnVod}</span>
              </a>

              <a
                href="/akademia"
                className="min-h-[44px] px-5 py-3 rounded-xl bg-transparent hover:bg-zinc-800/50 text-zinc-300 hover:text-white font-medium text-sm transition flex items-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4 text-zinc-400" />
                <span>{t.btnAcademy}</span>
              </a>
            </div>
          </div>

          {/* Jozue Avatar Card */}
          <div className="shrink-0 flex items-center gap-4 bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl backdrop-blur-md shadow-xl">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#bb142e] shadow-md bg-zinc-800">
                <img 
                  src="/avatar_cc_men.jpg" 
                  alt="Jozue" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.target as HTMLImageElement).src = JOZUE_AVATAR_URL; }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-[#f9282b] uppercase tracking-wider">Opiekun Ekosystemu</div>
              <div className="text-base font-bold text-white">Jozue</div>
              <div className="text-xs text-zinc-400">Pulpit Uświęcenia CC</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid: Cards + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cards Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#bb142e]"></span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900">
                {t.activeEcosystems}
              </h2>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              8 modułów Christian Culture
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {cards.map((card) => {
              const cardData = t.cards[card.id] || { title: card.id, desc: '' };
              const Icon = card.icon;

              return (
                <a
                  key={card.id}
                  href={card.url}
                  className="group relative bg-white border border-gray-200 hover:border-[#bb142e]/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Thematic Cinematic 16:9 Cover */}
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-zinc-900">
                      <img
                        src={card.imageUrl}
                        alt={cardData.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                      {/* Floating Badge & Icon pill */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-sm">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-sm">
                          {card.badge}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 pb-2">
                      <h3 className="text-lg font-bold font-serif text-zinc-900 group-hover:text-[#bb142e] transition-colors mb-2">
                        {cardData.title}
                      </h3>

                      <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                        {fixOrphans(cardData.desc)}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2">
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-zinc-700 group-hover:text-[#bb142e] min-h-[36px]">
                      <span>Przejdź do serwisu</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Mentor + Misja Kultury */}
        <aside className="space-y-6">
          {/* Mentor Advice Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 shrink-0 bg-zinc-100">
                <img 
                  src={isMale ? '/avatar_ccwomen_official.webp' : '/avatar_cezary_official.webp'} 
                  alt={mentorName} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.target as HTMLImageElement).src = mentorAvatar; }}
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#bb142e]">
                  {t.yourMentor}
                </span>
                <h4 className="text-base font-bold text-zinc-900">{mentorName}</h4>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-700 text-xs italic leading-relaxed mb-4">
              {isMale ? t.mentorQuoteMale : t.mentorQuoteFemale}
            </div>

            <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
              Kultura chrześcijańska buduje serce i umysł. Dbaj o to, czym karmisz swoją duszę każdego dnia.
            </p>

            <a
              href="/akademia"
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#bb142e] hover:bg-[#981025] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Rozpocznij Kurs Codzienny</span>
            </a>
          </div>

          {/* Szybka Pomoc & Transmisja TV */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white rounded-2xl p-6 shadow-md border border-zinc-800">
            <h4 className="text-base font-bold font-serif mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f9282b]" />
              Transmisja Telewizyjna CC
            </h4>

            {/* Live TV Video Preview Thumbnail */}
            <a 
              href="/live" 
              className="block relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-zinc-950 border border-zinc-700/60 group shadow-md"
            >
              <img
                src="/images/kultura/card-live.webp"
                alt="CCTV24 Live Worship"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors pointer-events-none" />
              <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#bb142e] text-white text-[10px] font-bold uppercase tracking-wider shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                NA ŻYWO 24/7
              </div>
            </a>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Oglądaj 24 godziny na dobę programy, pieśni uwielbienia i wykłady biblijne w paśmie CCTV24 LIVE.
            </p>
            <a
              href="/live"
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              Oglądaj CCTV24 Live
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
};
