const fs = require('fs');
const path = require('path');

const SCRATCH_ROOT = path.resolve('C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/scratch');
const LUMINA_ROOT = path.resolve('C:/Users/czark/Desktop/@ICC/LUMINA');

const HUBS_CONFIG = [
  {
    id: 'biznes',
    badge: 'BIZNES',
    appPath: path.join(SCRATCH_ROOT, 'biznes_src/App.tsx'),
    tickerPath: path.join(SCRATCH_ROOT, 'biznes_src/components/BroadcastTicker.tsx'),
    tickerImport: "import { BroadcastTicker } from './components/BroadcastTicker';",
    items: [
      'Chrześcijański Hub Biznesowy: Etyka biblijna i uczciwość fundamentem stabilnego przedsiębiorstwa (Przp 11:1)',
      'Przedsiębiorcy Królestwa: Łączenie rentowności biznesu z misją ewangelizacyjną i charytatywną',
      'Gospodarka z Wartościami: Rzetelność, przejrzystość i partnerstwo oparte na zaufaniu',
      'Inwestycje i Rozwój: Budowanie stabilnych miejsc pracy i etycznego kapitału w Polsce'
    ]
  },
  {
    id: 'kultura',
    badge: 'KULTURA',
    appPath: path.join(SCRATCH_ROOT, 'kultura_src/App.tsx'),
    tickerPath: path.join(SCRATCH_ROOT, 'kultura_src/components/BroadcastTicker.tsx'),
    tickerImport: "import { BroadcastTicker } from './components/BroadcastTicker';",
    items: [
      'Kultura Christian Culture: Piękno, prawda i dobro jako Boży wzorzec w sztuce i muzyce (Flp 4:8)',
      'Twórczość z Misją: Chrześcijańskie inspiracje w literaturze, teatrze i mediach cyfrowych',
      'Dziedzictwo Wiary: Odkrywanie chrześcijańskich korzeni tożsamości kulturowej',
      'Festiwale i Koncerty: Promocja artystów i projektów audiowizualnych na chwałę Stwórcy'
    ]
  },
  {
    id: 'kuchnia',
    badge: 'KUCHNIA & ZDROWIE',
    appPath: path.join(SCRATCH_ROOT, 'kuchnia_src/src/App.tsx'),
    tickerPath: path.join(SCRATCH_ROOT, 'kuchnia_src/src/components/BroadcastTicker.tsx'),
    tickerImport: "import { BroadcastTicker } from './components/BroadcastTicker';",
    items: [
      'Zdrowie według Stwórcy: Dieta biblijna i naturalne zasady witalności na co dzień',
      'Kuchnia z Wartościami: Tradycyjne, czyste i proste przepisy dla całej rodziny',
      'Naturalne Składniki: Harmonia ciała i ducha w oparciu o dary Bożej opatrzności',
      'Warsztaty Kulinarne CC: Praktyczne porady i zdrowe inspiracje kulinarne społeczności'
    ]
  },
  {
    id: 'ogloszenia',
    badge: 'OGŁOSZENIA',
    appPath: path.join(SCRATCH_ROOT, 'ogloszenia_src/src/App.tsx'),
    tickerPath: path.join(SCRATCH_ROOT, 'ogloszenia_src/src/components/BroadcastTicker.tsx'),
    tickerImport: "import { BroadcastTicker } from './components/BroadcastTicker';",
    items: [
      'Braterska Tablica CC: Bezpieczna i zaufana przestrzeń wymiany pracy, usług i pomocy',
      'Praca z Wartościami: Szukasz rzetelnych pracowników lub uczciwego pracodawcy? Dodaj ogłoszenie',
      'Wzajemne Wsparcie: Wolontariat, dary serca, mieszkania i transport w całej Polsce',
      'Solidarność w Chrystusie: Bezpłatna publikacja ogłoszeń dla chrześcijańskiej społeczności'
    ]
  },
  {
    id: 'wspolpraca',
    badge: 'WSPÓŁPRACA',
    appPath: path.join(SCRATCH_ROOT, 'wspolpraca_src/src/App.tsx'),
    tickerPath: path.join(SCRATCH_ROOT, 'wspolpraca_src/src/components/BroadcastTicker.tsx'),
    tickerImport: "import { BroadcastTicker } from './components/BroadcastTicker';",
    items: [
      'Partnerstwo Misyjne CC: Razem możemy dotrzeć z Dobrą Nowiną do setek tysięcy domów',
      'Kościoły i Zbory: Dołącz do ogólnopolskiej sieci dystrybucji treści ewangelizacyjnych',
      'Twórcy i Wolontariusze: Twoje talenty, głos, wideo lub kod mogą budować Królestwo Boże',
      'Mecenat i Darczyńcy: Budujmy razem niezależne chrześcijańskie media w Polsce'
    ]
  },
  {
    id: 'ziu',
    badge: 'ZDROWIE & URODA',
    appPath: path.join(SCRATCH_ROOT, 'ziu_src/src/App.tsx'),
    tickerPath: path.join(SCRATCH_ROOT, 'ziu_src/src/components/BroadcastTicker.tsx'),
    tickerImport: "import { BroadcastTicker } from './components/BroadcastTicker';",
    items: [
      'Świątynia Ducha Świętego: Biblijna troska o zdrowie, ciało i umysł (1 Kor 6:19-20)',
      'Ziołolecznictwo i Natura: Poznaj sprawdzone receptury i dobroczynne właściwości ziół',
      'Równowaga i Spokój: Odpoczynek, redukcja stresu i regeneracja w Bożym pokoju',
      'Czyste Piękno: Ekologiczna pielęgnacja i naturalna witalność każdego dnia'
    ]
  }
];

function generateTickerComponent(badge, items) {
  return `import React from 'react';

const TICKER_ITEMS = ${JSON.stringify(items, null, 2)};
const DUPLICATED_ITEMS = [...TICKER_ITEMS, ...TICKER_ITEMS];

export const BroadcastTicker: React.FC = () => {
  return (
    <div className="bg-[#0a0a0a] text-gray-200 border-b border-[#222222] select-none py-2 px-3 sm:px-4 relative overflow-hidden z-20">
      <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-4">
        {/* Badge */}
        <div className="flex items-center gap-1.5 shrink-0 bg-[#bb142e] text-white font-extrabold px-2.5 py-1 rounded text-[10px] sm:text-[11px] tracking-widest uppercase shadow-sm z-10 border border-red-700/40">
          <svg className="w-3.5 h-3.5 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>${badge}</span>
        </div>

        {/* Continuous Scrolling Track */}
        <div 
          className="flex-1 overflow-hidden relative"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)'
          }}
        >
          <div className="ccn-ticker-track">
            {DUPLICATED_ITEMS.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2.5 mx-5 sm:mx-7 text-xs sm:text-[13px] text-zinc-300 font-medium hover:text-[#f9282b] transition-colors cursor-pointer shrink-0"
                title={item}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f9282b] shrink-0 shadow-[0_0_6px_#f9282b]" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: \`
        @keyframes ccnBroadcastTicker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .ccn-ticker-track {
          display: inline-flex !important;
          white-space: nowrap !important;
          width: max-content !important;
          will-change: transform;
          animation: ccnBroadcastTicker 40s linear infinite !important;
        }
        .ccn-ticker-track:hover {
          animation-play-state: paused !important;
        }
      \`}} />
    </div>
  );
};
`;
}

console.log('=== KONFIGURACJA PŁYNNEGO TICKERA DLA 6 HUBÓW ===');

for (const hub of HUBS_CONFIG) {
  console.log(`\n>>> Hub: ${hub.id.toUpperCase()}`);
  
  // 1. Zapis komponentu BroadcastTicker.tsx
  const compDir = path.dirname(hub.tickerPath);
  if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });
  fs.writeFileSync(hub.tickerPath, generateTickerComponent(hub.badge, hub.items), 'utf8');
  console.log(`  ✓ Utworzono komponent ${path.relative(SCRATCH_ROOT, hub.tickerPath)}`);

  // 2. Wstrzyknięcie BroadcastTicker do App.tsx
  if (fs.existsSync(hub.appPath)) {
    let appContent = fs.readFileSync(hub.appPath, 'utf8');
    
    // Dodaj import jeśli brak
    if (!appContent.includes('BroadcastTicker')) {
      appContent = hub.tickerImport + '\n' + appContent;
    }

    // Dodaj komponent po </Header> lub <Header ... />
    if (!appContent.includes('<BroadcastTicker />') && !appContent.includes('<BroadcastTicker/>')) {
      // Szukamy <Header ... />
      // Uwzględniamy wieloliniowy tag Header
      const headerRegex = /(<Header[\s\S]*?\/>)/;
      if (headerRegex.test(appContent)) {
        appContent = appContent.replace(headerRegex, '$1\n      <BroadcastTicker />');
        console.log(`  ✓ Wstrzyknięto <BroadcastTicker /> za <Header /> w ${path.relative(SCRATCH_ROOT, hub.appPath)}`);
      } else {
        console.warn(`  ! Nie znaleziono wzorca <Header /> w ${hub.appPath}`);
      }
    } else {
      console.log(`  ✓ <BroadcastTicker /> już istnieje w App.tsx`);
    }

    fs.writeFileSync(hub.appPath, appContent, 'utf8');
  }

  // 3. Wstrzyknięcie stylów animacji do plików HTML w LUMINA_ROOT
  const htmlFiles = [
    path.join(LUMINA_ROOT, `${hub.id}.html`),
    path.join(LUMINA_ROOT, `${hub.id}/index.html`)
  ];

  const tickerCss = `
      /* PŁYNNY TICKER BROADCAST MARQUEE */
      @keyframes ccnBroadcastTicker {
        0% { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-50%, 0, 0); }
      }
      .ccn-ticker-track {
        display: inline-flex !important;
        white-space: nowrap !important;
        width: max-content !important;
        will-change: transform;
        animation: ccnBroadcastTicker 40s linear infinite !important;
      }
      .ccn-ticker-track:hover {
        animation-play-state: paused !important;
      }
`;

  for (const hf of htmlFiles) {
    if (fs.existsSync(hf)) {
      let hfc = fs.readFileSync(hf, 'utf8');
      if (!hfc.includes('ccnBroadcastTicker')) {
        hfc = hfc.replace('</style>', `${tickerCss}\n    </style>`);
        fs.writeFileSync(hf, hfc, 'utf8');
        console.log(`  ✓ Dodano style ccnBroadcastTicker do ${path.relative(LUMINA_ROOT, hf)}`);
      }
    }
  }
}

console.log('\n=== ZAKOŃCZONO KONFIGURACJĘ TICKERÓW DLA HUBÓW! ===');
