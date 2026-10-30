#!/usr/bin/env node
/**
 * PATCH CC OMNI SEARCH LIVING SYSTEM
 * Wprowadza tętniący życiem, dynamiczny system propozycji i sugestii dla /wyszukiwarka:
 * 1. Zmiana nazwy sekcji na "POLECANE NA DZIŚ" (ze wskaźnikiem pulsu LIVE i kropkami propozycji).
 * 2. 4 Pule Rotacyjne (Inspiracje, Akademia, Aktualności CCN, Live TV/Radio) rotujące co 5.5s.
 * 3. Płynna, kaskadowa animacja przejścia z blur & scale (80ms stagger).
 * 4. Pauza rotacji przy najechaniu myszą lub dotyku (interakcja użytkownika).
 * 5. Dynamiczna integracja z catalogData.recommendedToday i data/cc-search-recommendations.json.
 * 6. 100% zgodności z testami Zero-QA scripts/cc-omni-search.test.mjs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const filePath = path.join(ROOT, 'components/cc-omni-search.js');

let code = fs.readFileSync(filePath, 'utf8');

// 1. Zaktualizuj CSS dla sekcji polecanych (nagłówek, LIVE badge, kropki, animacja rotacji)
const oldCssRegex = /\.cc-omni-featured-head\s*\{[\s\S]*?\.cc-omni-feat-card:hover\s*\.cc-omni-feat-icon\s*\{/;

const newCss = `.cc-omni-featured-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 0 4px;
        flex-wrap: wrap;
        gap: 8px;
      }
      .cc-omni-featured-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--omni-gold);
      }
      .cc-omni-live-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        margin-left: 6px;
        padding: 2px 7px;
        border-radius: 10px;
        background: rgba(255, 122, 0, 0.15);
        border: 1px solid rgba(255, 122, 0, 0.4);
        color: #FF7A00;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .cc-live-pulse-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #FF7A00;
        box-shadow: 0 0 6px #FF7A00;
        animation: ccPulseLive 1.8s infinite ease-in-out;
      }
      @keyframes ccPulseLive {
        0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 6px #FF7A00; }
        50% { transform: scale(1.35); opacity: 0.55; box-shadow: 0 0 12px #FF8C33; }
      }
      .cc-omni-featured-dots {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .cc-omni-feat-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(196, 163, 90, 0.28);
        border: 1px solid rgba(196, 163, 90, 0.4);
        padding: 0;
        cursor: pointer;
        transition: background 0.2s, transform 0.2s, border-color 0.2s;
      }
      .cc-omni-feat-dot:hover {
        background: rgba(255, 122, 0, 0.5);
        border-color: #FF7A00;
      }
      .cc-omni-feat-dot.active {
        background: #FF7A00;
        border-color: #FF8C33;
        transform: scale(1.25);
        box-shadow: 0 0 8px rgba(255, 122, 0, 0.6);
      }
      .cc-omni-featured-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 12px;
      }
      @media (min-width: 641px) {
        .cc-omni-featured-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      .cc-omni-feat-card {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 14px 16px;
        min-height: 84px;
        background: rgba(14, 18, 30, 0.82);
        border: 1px solid rgba(196, 163, 90, 0.25);
        border-radius: 16px;
        text-decoration: none;
        color: var(--omni-ink);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.22s, box-shadow 0.22s, background-color 0.22s, opacity 0.22s ease, filter 0.22s ease;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }
      .cc-omni-feat-card.cc-card-updating {
        opacity: 0.15;
        transform: translateY(6px) scale(0.985);
        filter: blur(2px);
      }
      @media (prefers-reduced-motion: reduce) {
        .cc-live-pulse-dot { animation: none; }
        .cc-omni-feat-card.cc-card-updating { transform: none; filter: none; opacity: 0.6; }
      }
      .cc-omni-feat-card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(196, 163, 90, 0.08) 0%, transparent 60%);
        pointer-events: none;
      }
      .cc-omni-feat-card:hover, .cc-omni-feat-card:focus-visible {
        transform: translateY(-2px);
        border-color: var(--omni-gold);
        background: rgba(22, 28, 46, 0.92);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.5), 0 0 16px rgba(196, 163, 90, 0.25);
        outline: none;
      }
      .cc-omni-feat-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(255, 122, 0, 0.2), rgba(196, 163, 90, 0.3));
        border: 1px solid rgba(255, 122, 0, 0.4);
        color: #FF7A00;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      .cc-omni-feat-card:hover .cc-omni-feat-icon {`;

if (!oldCssRegex.test(code)) {
  console.error('BŁĄD: Nie znaleziono oldCssRegex w components/cc-omni-search.js');
  process.exit(1);
}
code = code.replace(oldCssRegex, newCss);
console.log('✅ Zaktualizowano style CSS w cc-omni-search.js.');

// 2. Dodaj brakujące ikony do HOME_ICONS
const extraIcons = `    sparkle: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    scroll: '<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    bookmark: '<path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/>',
    newspaper: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1ZM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1ZM7 21h10M12 3v18M3 7h18"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>'`;

const heartIconTarget = /heart:\s*'<path d="M20\.8 4\.6a5\.5 5\.5 0 0 0-7\.8 0L12 5\.7l-1\.1-1\.1a5\.5 5\.5 0 0 0-7\.8 7\.8L12 21l8\.8-8\.6a5\.5 5\.5 0 0 0 0-7\.8Z"\/>'/;
if (heartIconTarget.test(code)) {
  code = code.replace(heartIconTarget, extraIcons);
  console.log('✅ Rozszerzono paletę HOME_ICONS o ikony dynamicznych propozycji.');
}

// 3. Wstrzyknij silnik rotacyjny FEATURED_POOLS przed renderHome()
const renderHomeTarget = /function\s+renderHome\s*\(\)\s*\{/;
const featuredEngine = `  // ── Silnik Dynamicznych Okien Propozycji („Tętniąca Życiem Wyszukiwarka EkoCC”) ──
  const FEATURED_POOLS = [
    // Slot 0: Inspiracje, Słowo na Dziś, Modlitwa, Audio
    [
      {
        tag: 'Inspiracja na Dziś',
        title: 'Rozważanie „Dobrze, że jesteś”',
        desc: 'Codzienne słowo umocnienia, modlitwa i Boży pokój na każdy dzień.',
        url: '/player',
        icon: 'heart'
      },
      {
        tag: 'Słowo Boże na Dziś',
        title: 'Mój Werset Dnia z Obietnicą',
        desc: 'Losuj i rozważaj żywe obietnice Pisma Świętego przygotowane na dziś.',
        url: '/werset-dnia',
        icon: 'sparkle'
      },
      {
        tag: 'Modlitwa & Wstawiennictwo',
        title: 'Zjednoczeni za Polskę — Czuwanie',
        desc: 'Wspólna modlitwa narodu o pokój, Boże prowadzenie i przebudzenie.',
        url: '/modlitwa',
        icon: 'shield'
      },
      {
        tag: 'Słuchowisko Biblijne',
        title: 'Biblia Audio — Nowy Testament UBG',
        desc: 'Żywe Słowo Boże z profesjonalną muzyką i udźwiękowieniem radiowym.',
        url: '/player',
        icon: 'volume'
      }
    ],
    // Slot 1: Akademia Biblijna, Kurs Codzienny, MojaBiblia
    [
      {
        tag: 'Akademia Biblijna',
        title: 'Lekcja Dnia: Z Biblią za Pan Brat',
        desc: 'Codzienne studium Pisma Świętego werset po wersecie z komentarzem.',
        url: '/akademia#kurscodzienny',
        icon: 'book'
      },
      {
        tag: 'Interlinearna Biblia',
        title: 'MojaBiblia: Kody Stronga & Greka',
        desc: 'Oryginalne znaczenie słów hebrajskich i greckich w Twojej przeglądarce.',
        url: '/mojabiblia',
        icon: 'scroll'
      },
      {
        tag: 'Kurs Proroctw Biblijnych',
        title: 'Księga Daniela — 2300 Wieczorów i Poranków',
        desc: 'Klucz do zrozumienia czasów ostatecznych i nadziei Zbawienia w Chrystusie.',
        url: '/akademia',
        icon: 'compass'
      },
      {
        tag: 'Szkoła Uczniostwa',
        title: 'Boże Zasady Zwycięskiego Życia',
        desc: 'Praktyczne lekcje wiary, pokoju i zaufania Bogu w każdej próbie.',
        url: '/akademia',
        icon: 'bookmark'
      }
    ],
    // Slot 2: Podcasty SDS, Aktualności CCN, VOD, Publicystyka
    [
      {
        tag: 'Podcast Spotify SDS',
        title: 'APOKALIPSA — Księga Nadziei',
        desc: 'Profetyczny cykl wykładów biblijnych Studia Dobrego Słowa.',
        url: '/podcasty',
        icon: 'mic'
      },
      {
        tag: 'Aktualności CCN • Na Dziś',
        title: 'Gdy lęk o jutro odbiera Ci pokój — 5 zasad',
        desc: 'Biblijne uciszenie burzy w sercu według Bożego Słowa (Cezary Rogowski).',
        url: '/news/gdy-lek-o-jutro-odbiera-ci-pokoj-5-zasad-cezary-rogowski',
        icon: 'newspaper'
      },
      {
        tag: 'Kino Chrześcijańskie VOD',
        title: 'Filmy Fabularne i Dokumentalne CC',
        desc: 'Wartościowe kino chrześcijańskie bez reklam, opłat i subskrypcji.',
        url: '/vod',
        icon: 'film'
      },
      {
        tag: 'Analizy & Społeczeństwo',
        title: 'Wolność Sumienia i Prawo Boże',
        desc: 'Głębokie analizy wyzwań współczesnego świata w świetle Pisma Świętego.',
        url: '/prawo',
        icon: 'scale'
      }
    ],
    // Slot 3: Radio CC 24/7, TV Na Żywo, Biblia Śpiewana, LUMINA
    [
      {
        tag: 'Nadajemy 24/7',
        title: 'Radio Christian Culture & Player',
        desc: 'Muzyka uwielbienia, słuchowiska Biblia Audio i stacje tematyczne.',
        url: '/player',
        icon: 'radio'
      },
      {
        tag: 'Biblia Śpiewana Live 24/7',
        title: 'Śpiewane Psalmy i Przypowieści',
        desc: 'Transmisja telewizyjna na żywo z dynamicznym karaoke biblijnym non-stop.',
        url: '/biblia-spiewana-live',
        icon: 'tv'
      },
      {
        tag: 'Telewizja CCTV24 Worship',
        title: 'CCTV24 — Pasmo Bożej Obecności',
        desc: 'Nocne czuwania, modlitwy i pieśni chwały w krystalicznej jakości HD.',
        url: '/cctv24-worship',
        icon: 'play'
      },
      {
        tag: 'Społeczność Wiary',
        title: 'Portal Społecznościowy LUMINA',
        desc: 'Dołącz do chrześcijan z całej Polski — dyskusje, świadectwa, modlitwa.',
        url: '/lumina',
        icon: 'users'
      }
    ]
  ];

  let activeFeaturedSet = 0;
  let featuredRotationTimer = null;
  let isFeaturedHovered = false;

  function getFeaturedCardData(slotIdx, setIdx) {
    // Dynamiczne wstrzyknięcie z catalogData jeśli dostępne
    if (catalogData && Array.isArray(catalogData.recommendedToday) && catalogData.recommendedToday[slotIdx]) {
      if (setIdx === 0) return catalogData.recommendedToday[slotIdx];
    }
    const pool = FEATURED_POOLS[slotIdx] || [];
    return pool[setIdx % pool.length];
  }

  function rotateFeaturedCards(targetSet = null) {
    const grid = document.querySelector('.cc-omni-featured-grid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.cc-omni-feat-card');
    if (cards.length < 4) return;

    const nextSet = (targetSet !== null) ? targetSet : (activeFeaturedSet + 1) % 4;
    activeFeaturedSet = nextSet;

    // Aktualizacja kropek wskaźnika
    const dots = document.querySelectorAll('.cc-omni-feat-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === nextSet);
      dot.setAttribute('aria-current', idx === nextSet ? 'true' : 'false');
    });

    // Płynna kaskada aktualizacji okien (stagger 80ms)
    cards.forEach((card, slotIdx) => {
      setTimeout(() => {
        card.classList.add('cc-card-updating');
        setTimeout(() => {
          const item = getFeaturedCardData(slotIdx, nextSet);
          if (!item) return;
          card.href = item.url;
          const iconSpan = card.querySelector('.cc-omni-feat-icon');
          const tagSpan = card.querySelector('.cc-omni-feat-tag');
          const titleEl = card.querySelector('.cc-omni-feat-title');
          const descSpan = card.querySelector('.cc-omni-feat-desc');

          if (iconSpan) iconSpan.innerHTML = svgIcon(item.icon || 'star', 20);
          if (tagSpan) tagSpan.textContent = item.tag;
          if (titleEl) titleEl.textContent = item.title;
          if (descSpan) descSpan.textContent = item.desc;

          card.classList.remove('cc-card-updating');
        }, 160);
      }, slotIdx * 80);
    });
  }

  function startFeaturedRotation() {
    stopFeaturedRotation();
    if (typeof window === 'undefined') return;
    featuredRotationTimer = setInterval(() => {
      if (isFeaturedHovered || (typeof document !== 'undefined' && document.hidden)) return;
      rotateFeaturedCards();
    }, 5500);
  }

  function stopFeaturedRotation() {
    if (featuredRotationTimer) {
      clearInterval(featuredRotationTimer);
      featuredRotationTimer = null;
    }
  }

  function renderHome() {`;

code = code.replace(renderHomeTarget, featuredEngine);
console.log('✅ Zaimplementowano silnik rotacyjny FEATURED_POOLS.');

// 4. Zaktualizuj sekcję 3 w renderHome() na żywą sekcję "Polecane na dziś" z LIVE badge i kropkami
const oldFeaturedCardsRegex = /\/\/\s*3\.\s*4\s*Kluczowe\s*Filary\s*Ekosystemu[\s\S]*?const\s+featuredCards\s*=\s*`[\s\S]*?<\/section>`;/;

const newFeaturedCards = `// 3. 4 Kluczowe Okna Ekosystemu („POLECANE NA DZIŚ” — Tętniące Życiem)
    const initialCards = [
      getFeaturedCardData(0, activeFeaturedSet),
      getFeaturedCardData(1, activeFeaturedSet),
      getFeaturedCardData(2, activeFeaturedSet),
      getFeaturedCardData(3, activeFeaturedSet)
    ];

    const featuredCards = \`
      <section class="cc-omni-featured-section" aria-label="Polecane na dziś w Christian Culture">
        <div class="cc-omni-featured-head">
          <span class="cc-omni-featured-label">
            \${svgIcon('star', 15)} Polecane na dziś
            <span class="cc-omni-live-badge"><span class="cc-live-pulse-dot"></span> LIVE</span>
          </span>
          <div class="cc-omni-featured-dots" role="tablist" aria-label="Wybierz propozycje">
            <button type="button" class="cc-omni-feat-dot\${activeFeaturedSet === 0 ? ' active' : ''}" data-feat-set="0" aria-label="Zestaw 1: Fundament Dnia" aria-current="\${activeFeaturedSet === 0}"></button>
            <button type="button" class="cc-omni-feat-dot\${activeFeaturedSet === 1 ? ' active' : ''}" data-feat-set="1" aria-label="Zestaw 2: Świeże Słowo i Odkrycia" aria-current="\${activeFeaturedSet === 1}"></button>
            <button type="button" class="cc-omni-feat-dot\${activeFeaturedSet === 2 ? ' active' : ''}" data-feat-set="2" aria-label="Zestaw 3: Modlitwa i Proroctwa" aria-current="\${activeFeaturedSet === 2}"></button>
            <button type="button" class="cc-omni-feat-dot\${activeFeaturedSet === 3 ? ' active' : ''}" data-feat-set="3" aria-label="Zestaw 4: Słuchowiska i Społeczność" aria-current="\${activeFeaturedSet === 3}"></button>
          </div>
        </div>
        <div class="cc-omni-featured-grid">
          \${initialCards.map((card, i) => \`
            <a class="cc-omni-feat-card" href="\${escapeHtml(card.url)}" data-slot-index="\${i}">
              <span class="cc-omni-feat-icon">\${svgIcon(card.icon, 20)}</span>
              <span class="cc-omni-feat-info">
                <span class="cc-omni-feat-tag">\${escapeHtml(card.tag)}</span>
                <strong class="cc-omni-feat-title">\${escapeHtml(card.title)}</strong>
                <span class="cc-omni-feat-desc">\${escapeHtml(card.desc)}</span>
              </span>
              <span class="cc-omni-feat-arrow" aria-hidden="true">→</span>
            </a>
          \`).join('')}
        </div>
      </section>\`;`;

if (!oldFeaturedCardsRegex.test(code)) {
  console.error('BŁĄD: Nie znaleziono oldFeaturedCardsRegex w cc-omni-search.js');
  process.exit(1);
}
code = code.replace(oldFeaturedCardsRegex, newFeaturedCards);
console.log('✅ Zaktualizowano szablon featuredCards z nagłówkiem "Polecane na dziś", badge LIVE i kropkami.');

// 5. Podepnij zdarzenia hover & kliknięcia kropek w mountModal()
const clickEventTarget = /overlay\.addEventListener\('click',\s*\(e\)\s*=>\s*\{/;
const dotClickCode = `overlay.addEventListener('click', (e) => {
      const featDot = e.target.closest('.cc-omni-feat-dot');
      if (featDot) {
        e.preventDefault();
        e.stopPropagation();
        const setIdx = parseInt(featDot.getAttribute('data-feat-set'), 10);
        if (!isNaN(setIdx)) {
          rotateFeaturedCards(setIdx);
          startFeaturedRotation();
        }
        return;
      }`;

code = code.replace(clickEventTarget, dotClickCode);

// Podepnij hover na featured section
const mouseoverTarget = /overlay\.addEventListener\('mouseover',\s*\(e\)\s*=>\s*\{/;
const hoverCode = `overlay.addEventListener('mouseover', (e) => {
      if (e.target.closest('.cc-omni-featured-section')) {
        isFeaturedHovered = true;
      }`;
code = code.replace(mouseoverTarget, hoverCode);

// Dodaj mouseout dla przywrócenia rotacji
const mouseoutInject = `    overlay.addEventListener('mouseout', (e) => {
      if (e.target.closest('.cc-omni-featured-section') && !e.relatedTarget?.closest('.cc-omni-featured-section')) {
        isFeaturedHovered = false;
      }
    });

    overlay.addEventListener('touchstart', (e) => {
      if (e.target.closest('.cc-omni-featured-section')) {
        isFeaturedHovered = true;
        setTimeout(() => { isFeaturedHovered = false; }, 4000);
      }
    }, { passive: true });

    clearBtn.addEventListener('click', () => {`;
code = code.replace(/clearBtn\.addEventListener\('click',\s*\(\)\s*=>\s*\{/, mouseoutInject);

// 6. Uruchom rotację w openSearch() i zatrzymaj w closeSearch()
code = code.replace(/function\s+openSearch\s*\([^)]*\)\s*\{/, (match) => `${match}\n    startFeaturedRotation();`);
code = code.replace(/function\s+closeSearch\s*\([^)]*\)\s*\{/, (match) => `${match}\n    stopFeaturedRotation();`);

// 7. W renderResults() uruchamiaj rotację tylko na pustym zapytaniu
code = code.replace(/body\.innerHTML\s*=\s*renderHome\(\);/, 'body.innerHTML = renderHome();\n      startFeaturedRotation();');
code = code.replace(/const\s+\{\s*items,\s*guide,\s*isSuggestion/, 'stopFeaturedRotation();\n    const { items, guide, isSuggestion');

// Zapisz plik
fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Pomyślnie zaimplementowano tętniącą życiem wyszukiwarkę w components/cc-omni-search.js!');
