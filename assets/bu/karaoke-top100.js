/* Christian Culture — Biblijne Uwielbienie: Pełna Biblia UBG 2025, Karaoke & TOP 100.
   Obsługa 1189 rozdziałów: Tryb A (Czytaj i śpiewaj) oraz Tryb B (Karaoke zsynchronizowane).
   Głosowanie TOP 100 oparte o bazę Cloudflare D1 z autoryzacją LUMINA.
*/
(() => {
  'use strict';

  const API = '/api/bu/v1';
  const BIBLE_BASE = '/data/bible/ubg-2025/';
  const KARAOKE_BASE = '/data/bu-karaoke/';
  const UBG_LICENSE = 'Uwspółcześniona Biblia Gdańska (UBG) © Fundacja Wrota Nadziei / Logos Media. Wykorzystanie ewangelizacyjne na licencji CC BY-ND 4.0.';

  // 1. STYLE CSS
  const style = document.createElement('style');
  style.id = 'bu-karaoke-top100-styles';
  style.textContent = `
    :root {
      --bu-font-size: 20px;
    }

    /* Modal Backdrop (dla TOP 100 oraz Fullscreen Dialog) */
    #bu-dialog-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 99999;
      padding: 12px;
      background: rgba(3, 7, 18, 0.92);
      backdrop-filter: blur(8px);
      align-items: center;
      justify-content: center;
    }
    #bu-dialog-backdrop.open {
      display: flex;
    }
    .bu-dialog {
      background: #0f172a;
      color: #f7f4ef;
      border: 1px solid rgba(196, 163, 90, 0.45);
      border-radius: 20px;
      width: min(980px, 100%);
      max-height: 94dvh;
      overflow: auto;
      padding: clamp(16px, 3vw, 32px);
      font: 15px/1.55 Inter, system-ui, sans-serif;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(226, 204, 154, 0.2);
    }
    .bu-dialog h2 {
      font: 600 clamp(22px, 3.5vw, 32px) 'Cinzel', Georgia, serif;
      color: #e2cc9a;
      margin: 0;
    }
    .bu-dialog-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    .bu-action {
      background: #19263b;
      color: #f7f4ef;
      border: 1px solid rgba(196, 163, 90, 0.4);
      border-radius: 10px;
      padding: 10px 16px;
      min-height: 44px;
      min-width: 44px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .bu-action:hover {
      background: #233552;
      border-color: #e2cc9a;
    }
    .bu-action:focus-visible {
      outline: 3px solid #e2cc9a;
      outline-offset: 2px;
    }
    .bu-action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .bu-action.primary {
      background: #c4a35a;
      color: #060a12;
      font-weight: 700;
      border-color: #e2cc9a;
    }
    .bu-action.primary:hover {
      background: #d4b46c;
    }
    .bu-muted {
      color: #b8c1d0;
      font-size: 13px;
      line-height: 1.5;
    }

    /* TOP 100 RANKING */
    .bu-ranking {
      display: grid;
      gap: 10px;
      margin-top: 15px;
    }
    .bu-rank {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 12px;
      align-items: center;
      padding: 12px 14px;
      border: 1px solid rgba(55, 66, 88, 0.6);
      background: rgba(11, 18, 34, 0.6);
      border-radius: 12px;
    }
    .bu-rank strong {
      color: #e2cc9a;
      font-variant-numeric: tabular-nums;
      font-size: 14px;
    }
    @media (max-width: 560px) {
      .bu-rank {
        grid-template-columns: 1fr auto;
      }
      .bu-rank button {
        grid-column: 1 / -1;
      }
    }

    /* ========================================================================
       HERO KARAOKE & CZYTAJ I ŚPIEWAJ STAGE
       ======================================================================== */
    .hero-karaoke-stage-wrapper {
      margin-top: 24px;
      margin-bottom: 24px;
      width: 100%;
      transition: all 0.3s ease;
    }
    .hero-karaoke-stage-wrapper.is-fullscreen {
      position: fixed;
      inset: 0;
      z-index: 100000;
      margin: 0;
      max-width: 100vw;
      max-height: 100vh;
      padding: clamp(12px, 3vw, 28px);
      background: #050811;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .hero-karaoke-inner {
      background: rgba(11, 18, 34, 0.95);
      border: 1px solid rgba(196, 163, 90, 0.4);
      border-radius: 20px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(226, 204, 154, 0.2);
      backdrop-filter: blur(16px);
      padding: clamp(14px, 2.5vw, 24px);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .hero-karaoke-stage-wrapper.is-fullscreen .hero-karaoke-inner {
      height: 100%;
      border-radius: 16px;
    }
    .hero-karaoke-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .hero-karaoke-heading {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .hero-karaoke-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 4px 8px;
      border-radius: 6px;
      background: rgba(196, 163, 90, 0.2);
      color: #e2cc9a;
      border: 1px solid rgba(196, 163, 90, 0.3);
    }
    .hero-karaoke-title {
      font-size: clamp(18px, 2.4vw, 26px);
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 600;
      color: #f7f4ef;
      margin: 0;
    }
    .hero-karaoke-mode-tabs {
      display: flex;
      gap: 8px;
      background: rgba(7, 12, 24, 0.8);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid rgba(55, 66, 88, 0.6);
    }
    .hero-mode-tab {
      min-height: 44px;
      padding: 8px 16px;
      border-radius: 8px;
      background: transparent;
      color: #cdd4e0;
      border: 0;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .hero-mode-tab:hover:not(:disabled) {
      color: #ffe2a5;
    }
    .hero-mode-tab.is-active {
      background: #c4a35a;
      color: #060a12;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    .hero-mode-tab:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .hero-karaoke-controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .hero-karaoke-ctrl-btn {
      min-width: 44px;
      min-height: 44px;
      border-radius: 10px;
      background: #19263b;
      color: #f7f4ef;
      border: 1px solid rgba(196, 163, 90, 0.3);
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .hero-karaoke-ctrl-btn:hover {
      background: #233552;
      border-color: #e2cc9a;
    }
    .hero-karaoke-ctrl-btn.close {
      color: #ff9d9d;
    }
    .bu-verse-pill {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 6px;
      background: rgba(196, 163, 90, 0.22);
      border: 1px solid rgba(196, 163, 90, 0.45);
      color: #e2cc9a;
      font-size: 11px;
      font-weight: 700;
      margin-right: 8px;
      vertical-align: middle;
      letter-spacing: 0.5px;
    }
    .bu-line.is-instrumental {
      font-style: italic;
      color: #94a3b8;
      border-left-color: #64748b;
      background: rgba(30, 41, 59, 0.35);
    }

    /* Pasek wyboru księgi i rozdziału */
    .hero-karaoke-selector-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      padding: 8px 12px;
      background: rgba(7, 12, 24, 0.6);
      border-radius: 12px;
      border: 1px solid rgba(55, 66, 88, 0.5);
    }
    .hero-select-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .hero-select-label {
      font-size: 13px;
      color: #c4a35a;
      font-weight: 600;
    }
    .hero-select {
      min-height: 44px;
      background: #101827;
      color: #f7f4ef;
      border: 1px solid rgba(196, 163, 90, 0.35);
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 14px;
      cursor: pointer;
    }
    .hero-select:focus-visible {
      outline: 2px solid #e2cc9a;
    }
    .hero-karaoke-sync-status {
      font-size: 13px;
      color: #e2cc9a;
      margin-left: auto;
      font-weight: 500;
    }

    /* Viewport tekstów */
    .hero-karaoke-viewport {
      max-height: clamp(340px, 50vh, 640px);
      overflow-y: auto;
      overflow-x: hidden;
      scroll-behavior: smooth;
      border-radius: 14px;
      background: rgba(5, 10, 20, 0.7);
      padding: clamp(14px, 2vw, 24px);
      border: 1px solid rgba(55, 66, 88, 0.4);
    }
    .hero-karaoke-stage-wrapper.is-fullscreen .hero-karaoke-viewport {
      max-height: none;
      flex: 1;
    }

    /* TRYB A: CZYTAJ I ŚPIEWAJ (Tekst Biblii) */
    .hero-karaoke-lines[data-mode="reading"] {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .hero-karaoke-intro {
      font-style: italic;
      color: #e2cc9a;
      margin-bottom: 16px;
      padding: 10px 14px;
      border-left: 3px solid #c4a35a;
      background: rgba(196, 163, 90, 0.1);
      border-radius: 0 8px 8px 0;
      font-size: calc(var(--bu-font-size) * 0.85);
      line-height: 1.5;
    }
    .hero-karaoke-verse {
      display: flex;
      gap: 12px;
      line-height: 1.65;
      color: #e0e6ed;
      font-size: var(--bu-font-size);
      text-align: left;
    }
    .hero-karaoke-verse .verse-num {
      color: #c4a35a;
      font-weight: 700;
      min-width: 38px;
      font-variant-numeric: tabular-nums;
      user-select: none;
      flex-shrink: 0;
    }
    .hero-karaoke-verse .verse-text {
      flex: 1;
    }

    /* TRYB B: KARAOKE ZSYNCHRONIZOWANE */
    .hero-karaoke-lines[data-mode="synchronized"] {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .bu-line {
      display: block;
      width: 100%;
      background: transparent;
      color: #8b99ad;
      text-align: center;
      border: 0;
      border-radius: 12px;
      font-size: var(--bu-font-size);
      line-height: 1.55;
      padding: 12px 16px;
      cursor: pointer;
      transition: all 0.25s ease;
      font-family: inherit;
    }
    .bu-line:hover {
      background: rgba(196, 163, 90, 0.1);
      color: #f7f4ef;
    }
    .bu-line.active {
      color: #ffe2a5;
      background: rgba(196, 163, 90, 0.24);
      font-weight: 700;
      transform: scale(1.02);
      text-shadow: 0 0 16px rgba(226, 204, 154, 0.6);
      box-shadow: inset 0 0 0 1px #c4a35a, 0 4px 16px rgba(0,0,0,0.4);
    }
    .bu-line.prev,
    .bu-line.next {
      color: #cdd4e0;
      font-weight: 500;
    }

    .hero-karaoke-license {
      font-size: 12px;
      color: #8c97a8;
      text-align: center;
      padding-top: 8px;
      border-top: 1px solid rgba(55, 66, 88, 0.4);
      line-height: 1.4;
    }

    /* Trigger Button w Drilldown & Player */
    .chapter-lyrics-trigger-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      min-height: 44px;
      background: rgba(25, 38, 59, 0.85);
      color: #e2cc9a;
      border: 1px solid rgba(196, 163, 90, 0.35);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .chapter-lyrics-trigger-btn:hover {
      background: #233552;
      border-color: #e2cc9a;
      color: #fff;
    }

    @media (max-width: 680px) {
      .hero-karaoke-topbar {
        flex-direction: column;
        align-items: flex-start;
      }
      .hero-karaoke-mode-tabs {
        width: 100%;
      }
      .hero-mode-tab {
        flex: 1;
        justify-content: center;
      }
      .hero-karaoke-controls {
        width: 100%;
        justify-content: flex-end;
      }
      .hero-karaoke-selector-row {
        flex-direction: column;
        align-items: stretch;
      }
      .hero-select-wrap {
        width: 100%;
      }
      .hero-select {
        flex: 1;
      }
      .hero-karaoke-sync-status {
        margin-left: 0;
        text-align: center;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .hero-karaoke-viewport,
      .bu-lines * {
        scroll-behavior: auto !important;
      }
    }
  `;
  if (!document.getElementById('bu-karaoke-top100-styles')) {
    document.head.append(style);
  }

  // 2. MODAL BACKDROP (TOP 100)
  const backdrop = document.createElement('div');
  backdrop.id = 'bu-dialog-backdrop';
  backdrop.innerHTML = `
    <section class="bu-dialog" role="dialog" aria-modal="true" aria-labelledby="bu-dialog-title" tabindex="-1">
      <div class="bu-dialog-head">
        <h2 id="bu-dialog-title"></h2>
        <button id="bu-dialog-close" class="bu-action" type="button" aria-label="Zamknij okno">Zamknij ✕</button>
      </div>
      <div id="bu-dialog-content"></div>
    </section>
  `;

  function attachDialog() {
    if (!document.getElementById('bu-dialog-backdrop') && !backdrop.isConnected) {
      document.body.append(backdrop);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachDialog, { once: true });
  } else {
    attachDialog();
  }

  // 3. POMOCNICZE
  const make = (name, value, cls) => {
    const e = document.createElement(name);
    if (value !== undefined && value !== null) e.textContent = value;
    if (cls) e.className = cls;
    return e;
  };
  const button = (value, handler, primary = false) => {
    const e = make('button', value, 'bu-action' + (primary ? ' primary' : ''));
    e.type = 'button';
    e.addEventListener('click', handler);
    return e;
  };

  let previousFocus = null;
  const content = () => document.getElementById('bu-dialog-content');

  function closeDialog() {
    backdrop.classList.remove('open');
    content().replaceChildren();
    previousFocus?.focus?.();
  }
  function openDialog(title) {
    attachDialog();
    previousFocus = document.activeElement;
    document.getElementById('bu-dialog-title').textContent = title;
    backdrop.classList.add('open');
    document.getElementById('bu-dialog-close').focus();
  }
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop || e.target?.id === 'bu-dialog-close') closeDialog();
  });
  document.addEventListener('keydown', (e) => {
    if (!backdrop.classList.contains('open')) return;
    if (e.key === 'Escape') closeDialog();
  });

  // 4. PLAYER INTEGRATION
  function getTracks() {
    try {
      if (typeof window !== 'undefined' && Array.isArray(window.PLAYLIST_DATA) && window.PLAYLIST_DATA.length) {
        return window.PLAYLIST_DATA;
      }
      return (typeof PLAYLIST_DATA !== 'undefined' && Array.isArray(PLAYLIST_DATA)) ? PLAYLIST_DATA : [];
    } catch {
      return [];
    }
  }
  function currentTrack() {
    try {
      const tracks = getTracks();
      let idx = 0;
      if (typeof window !== 'undefined' && typeof window.CURRENT_TRACK_INDEX === 'number') {
        idx = window.CURRENT_TRACK_INDEX;
      } else if (typeof CURRENT_TRACK_INDEX === 'number') {
        idx = CURRENT_TRACK_INDEX;
      }
      return tracks[idx] || null;
    } catch {
      return null;
    }
  }
  function player() {
    try {
      return (typeof ytPlayer !== 'undefined') ? ytPlayer : null;
    } catch {
      return null;
    }
  }
  function currentTime() {
    try {
      return Number(player()?.getCurrentTime?.() || 0);
    } catch {
      return 0;
    }
  }
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // 5. CACHE I POBIERANIE TEKSTÓW BIBLII (UBG-2025) ORAZ SYNCHRONIZACJI
  const lyricsCache = new Map();
  const syncCache = new Map();

  async function loadChapterLyrics(chapterId) {
    if (!chapterId) throw new Error('Nie określono identyfikatora rozdziału.');
    if (lyricsCache.has(chapterId)) return lyricsCache.get(chapterId);

    const response = await fetch(`${BIBLE_BASE}${encodeURIComponent(chapterId)}.json`, { cache: 'default' });
    if (!response.ok) {
      throw new Error(`Tekst rozdziału ${chapterId} jest niedostępny (${response.status}).`);
    }
    const chapter = await response.json();
    if (!Array.isArray(chapter.verses) || !chapter.verses.length) {
      throw new Error(`Brak wersetów dla rozdziału ${chapterId}.`);
    }
    lyricsCache.set(chapterId, chapter);
    return chapter;
  }

  async function loadChapterSync(chapterId) {
    if (!chapterId) return null;
    if (syncCache.has(chapterId)) return syncCache.get(chapterId);

    try {
      const response = await fetch(`${KARAOKE_BASE}${encodeURIComponent(chapterId)}.json`, { cache: 'no-store' });
      if (!response.ok) {
        syncCache.set(chapterId, null);
        return null;
      }
      const data = await response.json();
      const isValidStatus = data.status === 'SYNC_READY' || data.status === 'approved' || data.status === 'SYNC_REVIEW';
      if (isValidStatus && Array.isArray(data.lines) && data.lines.length > 0) {
        const sorted = data.lines
          .filter(s => Number.isFinite(s.start) && Number.isFinite(s.end) && s.end >= s.start && s.text?.trim())
          .sort((a, b) => a.start - b.start);
        const result = { ...data, lines: sorted };
        syncCache.set(chapterId, result);
        return result;
      }
    } catch {
      // Brak pliku synchronizacji lub błąd sieci
    }
    syncCache.set(chapterId, null);
    return null;
  }

  // 6. STAN HERO KARAOKE
  let state = {
    chapterId: 'GEN-001',
    mode: 'reading', // 'reading' (Tryb A) lub 'sync' (Tryb B)
    fontSize: 20,
    autoScroll: true,
    lyrics: null,
    sync: null,
    syncNodes: [],
    lastActiveIdx: -1,
    tickInterval: null,
    isFullscreen: false
  };

  const BIBLE_BOOKS_CANON = [
    { code: "GEN", name: "Księga Rodzaju", chapters: 50 },
    { code: "EXO", name: "Księga Wyjścia", chapters: 40 },
    { code: "LEV", name: "Księga Kapłańska", chapters: 27 },
    { code: "NUM", name: "Księga Liczb", chapters: 36 },
    { code: "DEU", name: "Księga Powtórzonego Prawa", chapters: 34 },
    { code: "JOS", name: "Księga Jozuego", chapters: 24 },
    { code: "JDG", name: "Księga Sędziów", chapters: 21 },
    { code: "RUT", name: "Księga Rut", chapters: 4 },
    { code: "1SA", name: "1 Księga Samuela", chapters: 31 },
    { code: "2SA", name: "2 Księga Samuela", chapters: 24 },
    { code: "1KI", name: "1 Księga Królewska", chapters: 22 },
    { code: "2KI", name: "2 Księga Królewska", chapters: 25 },
    { code: "1CH", name: "1 Księga Kronik", chapters: 29 },
    { code: "2CH", name: "2 Księga Kronik", chapters: 36 },
    { code: "EZR", name: "Księga Ezdrasza", chapters: 10 },
    { code: "NEH", name: "Księga Nehemiasza", chapters: 13 },
    { code: "EST", name: "Księga Estery", chapters: 10 },
    { code: "JOB", name: "Księga Hioba", chapters: 42 },
    { code: "PSA", name: "Księga Psalmów", chapters: 150 },
    { code: "PRO", name: "Przypowieści Salomona", chapters: 31 },
    { code: "ECC", name: "Księga Kaznodziei", chapters: 12 },
    { code: "SNG", name: "Pieśń nad Pieśniami", chapters: 8 },
    { code: "ISA", name: "Księga Izajasza", chapters: 66 },
    { code: "JER", name: "Księga Jeremiasza", chapters: 52 },
    { code: "LAM", name: "Lamentacje Jeremiasza", chapters: 5 },
    { code: "EZK", name: "Księga Ezechiela", chapters: 48 },
    { code: "DAN", name: "Księga Daniela", chapters: 12 },
    { code: "HOS", name: "Księga Ozeasza", chapters: 14 },
    { code: "JOL", name: "Księga Joela", chapters: 3 },
    { code: "AMO", name: "Księga Amosa", chapters: 9 },
    { code: "OBA", name: "Księga Abdiasza", chapters: 1 },
    { code: "JON", name: "Księga Jonasza", chapters: 4 },
    { code: "MIC", name: "Księga Micheasza", chapters: 7 },
    { code: "NAH", name: "Księga Nahuma", chapters: 3 },
    { code: "HAB", name: "Księga Habakuka", chapters: 3 },
    { code: "ZEP", name: "Księga Sofoniasza", chapters: 3 },
    { code: "HAG", name: "Księga Aggeusza", chapters: 2 },
    { code: "ZEC", name: "Księga Zachariasza", chapters: 14 },
    { code: "MAL", name: "Księga Malachiasza", chapters: 4 },
    { code: "MAT", name: "Ewangelia Mateusza", chapters: 28 },
    { code: "MRK", name: "Ewangelia Marka", chapters: 16 },
    { code: "LUK", name: "Ewangelia Łukasza", chapters: 24 },
    { code: "JHN", name: "Ewangelia Jana", chapters: 21 },
    { code: "ACT", name: "Dzieje Apostolskie", chapters: 28 },
    { code: "ROM", name: "List do Rzymian", chapters: 16 },
    { code: "1CO", name: "1 List do Koryntian", chapters: 16 },
    { code: "2CO", name: "2 List do Koryntian", chapters: 13 },
    { code: "GAL", name: "List do Galacjan", chapters: 6 },
    { code: "EPH", name: "List do Efezjan", chapters: 6 },
    { code: "PHP", name: "List do Filipian", chapters: 4 },
    { code: "COL", name: "List do Kolosan", chapters: 4 },
    { code: "1TH", name: "1 List do Tesaloniczan", chapters: 5 },
    { code: "2TH", name: "2 List do Tesaloniczan", chapters: 3 },
    { code: "1TI", name: "1 List do Tymoteusza", chapters: 6 },
    { code: "2TI", name: "2 List do Tymoteusza", chapters: 4 },
    { code: "TIT", name: "List do Tytusa", chapters: 3 },
    { code: "PHM", name: "List do Filemona", chapters: 1 },
    { code: "HEB", name: "List do Hebrajczyków", chapters: 13 },
    { code: "JAS", name: "List Jakuba", chapters: 5 },
    { code: "1PE", name: "1 List Piotra", chapters: 5 },
    { code: "2PE", name: "2 List Piotra", chapters: 3 },
    { code: "1JN", name: "1 List Jana", chapters: 5 },
    { code: "2JN", name: "2 List Jana", chapters: 1 },
    { code: "3JN", name: "3 List Jana", chapters: 1 },
    { code: "JUD", name: "List Judy", chapters: 1 },
    { code: "REV", name: "Apokalipsa św. Jana", chapters: 22 }
  ];

  function getBooksList() {
    if (typeof window !== 'undefined' && Array.isArray(window.BIBLE_BOOKS) && window.BIBLE_BOOKS.length) {
      return window.BIBLE_BOOKS;
    }
    if (typeof BIBLE_BOOKS !== 'undefined' && Array.isArray(BIBLE_BOOKS) && BIBLE_BOOKS.length) {
      return BIBLE_BOOKS;
    }
    return BIBLE_BOOKS_CANON;
  }

  function initChapterSelectors() {
    const bookSelect = document.getElementById('hero-book-select');
    const chSelect = document.getElementById('hero-chapter-select');
    if (!bookSelect || !chSelect) return;

    if (!bookSelect.options.length) {
      bookSelect.innerHTML = '';
      const books = getBooksList();
      books.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.code;
        opt.textContent = `${b.name} (${b.code})`;
        bookSelect.appendChild(opt);
      });
    }

    // Ustawienie księgi
    const [bCode, chStr] = state.chapterId.split('-');
    const chNum = parseInt(chStr, 10) || 1;
    bookSelect.value = bCode;

    // Aktualizacja rozdziałów dla danej księgi
    const curBook = getBooksList().find(b => b.code === bCode) || { chapters: 50 };
    chSelect.innerHTML = '';
    for (let c = 1; c <= curBook.chapters; c++) {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = `Rozdział ${c}`;
      if (c === chNum) opt.selected = true;
      chSelect.appendChild(opt);
    }
  }

  function renderReadingMode(container, lyrics) {
    container.dataset.mode = 'reading';
    container.replaceChildren();

    if (lyrics.intro) {
      const intro = document.createElement('div');
      intro.className = 'hero-karaoke-intro';
      intro.textContent = lyrics.intro;
      container.appendChild(intro);
    }

    for (const verse of lyrics.verses) {
      const row = document.createElement('div');
      row.className = 'hero-karaoke-verse';
      row.dataset.verse = verse.number;

      const num = document.createElement('span');
      num.className = 'verse-num';
      num.textContent = `${verse.number}.`;

      const txt = document.createElement('span');
      txt.className = 'verse-text';
      txt.textContent = verse.text;

      row.appendChild(num);
      row.appendChild(txt);
      container.appendChild(row);
    }
  }

  function renderSyncMode(container, syncData) {
    container.dataset.mode = 'synchronized';
    container.replaceChildren();
    state.syncNodes = [];
    state.lastActiveIdx = -1;

    for (const [idx, segment] of syncData.lines.entries()) {
      const lineBtn = document.createElement('button');
      lineBtn.type = 'button';
      lineBtn.className = 'bu-line' + (segment.isInstrumental ? ' is-instrumental' : '');
      lineBtn.dataset.index = idx;
      lineBtn.dataset.start = segment.start;
      lineBtn.dataset.end = segment.end;
      lineBtn.title = `Przejdź do ${fmt(segment.start)}`;

      if (segment.verse) {
        const pill = document.createElement('span');
        pill.className = 'bu-verse-pill';
        pill.textContent = `W.${segment.verse}`;
        lineBtn.appendChild(pill);
      }
      const textSpan = document.createElement('span');
      textSpan.className = 'bu-line-text';
      textSpan.textContent = segment.text;
      lineBtn.appendChild(textSpan);

      lineBtn.addEventListener('click', () => {
        player()?.seekTo?.(segment.start, true);
      });

      container.appendChild(lineBtn);
      state.syncNodes.push(lineBtn);
    }
  }

  function tickSync() {
    if (state.mode !== 'sync' || !state.sync || !state.syncNodes.length) return;
    const now = currentTime();
    const segments = state.sync.lines;
    const active = segments.findIndex(x => now >= x.start && now < x.end);

    if (active !== state.lastActiveIdx) {
      // Usuń poprzednie klasy
      if (state.lastActiveIdx >= 0) {
        state.syncNodes[state.lastActiveIdx]?.classList.remove('active', 'prev', 'next');
        state.syncNodes[state.lastActiveIdx - 1]?.classList.remove('prev');
        state.syncNodes[state.lastActiveIdx + 1]?.classList.remove('next');
      }

      if (active >= 0) {
        const curEl = state.syncNodes[active];
        curEl?.classList.add('active');
        state.syncNodes[active - 1]?.classList.add('prev');
        state.syncNodes[active + 1]?.classList.add('next');

        if (state.autoScroll && curEl) {
          curEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }
      state.lastActiveIdx = active;
    }
  }

  async function startChapterKaraoke(chapterId, requestedMode = null) {
    const stage = document.getElementById('hero-karaoke-stage');
    const container = document.getElementById('hero-karaoke-lines');
    if (!stage || !container) return;

    state.chapterId = chapterId || state.chapterId || 'GEN-001';
    stage.style.display = 'block';

    const titleEl = document.getElementById('hero-karaoke-title');
    const badgeEl = document.getElementById('hero-karaoke-badge');
    const statusEl = document.getElementById('hero-sync-status-indicator');
    const tabReading = document.getElementById('tab-mode-reading');
    const tabSync = document.getElementById('tab-mode-sync');

    container.replaceChildren();
    const loadingMsg = make('div', 'Wczytywanie tekstu Pisma Świętego...', 'bu-muted');
    loadingMsg.style.padding = '24px';
    loadingMsg.style.textAlign = 'center';
    container.appendChild(loadingMsg);

    try {
      // 1. Zawsze ładujemy pełny tekst biblijny UBG 2025
      const lyrics = await loadChapterLyrics(state.chapterId);
      state.lyrics = lyrics;

      if (titleEl) titleEl.textContent = `${lyrics.book} · Rozdział ${lyrics.chapter}`;
      if (badgeEl) badgeEl.textContent = lyrics.translation || 'UBG 2025';

      // 2. Sprawdzamy dostępność synchronizacji karaoke
      const syncData = await loadChapterSync(state.chapterId);
      state.sync = syncData;

      initChapterSelectors();

      // Ustalenie trybu
      const hasSync = !!syncData;
      if (tabSync) {
        tabSync.disabled = !hasSync;
        tabSync.title = hasSync ? 'Włącz podświetlanie linijek utworu' : 'Synchronizacja dla tego rozdziału jest w trakcie tworzenia';
        tabSync.textContent = hasSync ? '🎤 Karaoke zsynchronizowane' : '🎤 Karaoke (w produkcji)';
      }

      let activeMode = 'reading';
      if (requestedMode === 'sync' && hasSync) {
        activeMode = 'sync';
      } else if (requestedMode === 'reading') {
        activeMode = 'reading';
      } else if (hasSync) {
        // Domyślnie włącz tryb synchronizacji, jeśli dostępny
        activeMode = 'sync';
      }

      state.mode = activeMode;

      if (tabReading) {
        tabReading.classList.toggle('is-active', activeMode === 'reading');
        tabReading.setAttribute('aria-selected', activeMode === 'reading' ? 'true' : 'false');
      }
      if (tabSync) {
        tabSync.classList.toggle('is-active', activeMode === 'sync');
        tabSync.setAttribute('aria-selected', activeMode === 'sync' ? 'true' : 'false');
      }

      if (statusEl) {
        if (hasSync) {
          const isReview = syncData.status === 'SYNC_REVIEW';
          const score = syncData.qualityScore ? ` (${Math.round(syncData.qualityScore * 100)}%)` : '';
          statusEl.textContent = isReview ? `● Do weryfikacji${score}` : `● Zsynchronizowane AI${score}`;
          statusEl.style.color = isReview ? '#fbbf24' : '#4ade80';
        } else {
          statusEl.textContent = '○ Pełny tekst UBG (bez znaczników czasu)';
          statusEl.style.color = '#e2cc9a';
        }
      }

      if (activeMode === 'sync' && syncData) {
        renderSyncMode(container, syncData);
        if (!state.tickInterval) {
          state.tickInterval = setInterval(tickSync, 200);
        }
      } else {
        renderReadingMode(container, lyrics);
        if (state.tickInterval) {
          clearInterval(state.tickInterval);
          state.tickInterval = null;
        }
      }

      // Przewiń płynnie do panelu HERO
      stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (err) {
      container.textContent = err.message || 'Nie udało się wczytać tekstu rozdziału.';
      container.dataset.mode = 'unavailable';
      if (statusEl) statusEl.textContent = 'Błąd wczytywania tekstu';
    }
  }

  function setMode(mode) {
    if (mode === 'sync' && !state.sync) {
      alert('Dla tego rozdziału nie ma jeszcze przygotowanej synchronizacji czasowej. Dostępny jest pełny tekst w trybie „Czytaj i śpiewaj”.');
      return;
    }
    const container = document.getElementById('hero-karaoke-lines');
    if (!container || !state.lyrics) return;

    state.mode = mode;
    const tabReading = document.getElementById('tab-mode-reading');
    const tabSync = document.getElementById('tab-mode-sync');
    const statusEl = document.getElementById('hero-sync-status-indicator');

    if (tabReading) {
      tabReading.classList.toggle('is-active', mode === 'reading');
      tabReading.setAttribute('aria-selected', mode === 'reading' ? 'true' : 'false');
    }
    if (tabSync) {
      tabSync.classList.toggle('is-active', mode === 'sync');
      tabSync.setAttribute('aria-selected', mode === 'sync' ? 'true' : 'false');
    }

    if (mode === 'sync' && state.sync) {
      renderSyncMode(container, state.sync);
      if (statusEl) statusEl.textContent = '● Synchronizacja aktywna';
      if (!state.tickInterval) state.tickInterval = setInterval(tickSync, 200);
    } else {
      renderReadingMode(container, state.lyrics);
      if (statusEl) statusEl.textContent = state.sync ? '○ Pełny tekst UBG' : '○ Pełny tekst UBG (bez znaczników czasu)';
      if (state.tickInterval) {
        clearInterval(state.tickInterval);
        state.tickInterval = null;
      }
    }
  }

  function adjustFontSize(delta) {
    state.fontSize = Math.min(36, Math.max(15, state.fontSize + delta * 2));
    document.documentElement.style.setProperty('--bu-font-size', `${state.fontSize}px`);
  }

  function toggleFullscreen() {
    const stage = document.getElementById('hero-karaoke-stage');
    if (!stage) return;
    state.isFullscreen = !state.isFullscreen;
    stage.classList.toggle('is-fullscreen', state.isFullscreen);

    const btn = document.getElementById('btn-hero-fullscreen');
    if (btn) btn.textContent = state.isFullscreen ? '✕ Wyjdź' : '⛶';

    if (state.isFullscreen && stage.requestFullscreen) {
      stage.requestFullscreen().catch(() => {});
    } else if (!state.isFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  function closeHeroKaraoke() {
    const stage = document.getElementById('hero-karaoke-stage');
    if (stage) {
      stage.style.display = 'none';
      stage.classList.remove('is-fullscreen');
      state.isFullscreen = false;
    }
    const btn = document.getElementById('btn-player-karaoke');
    if (btn) btn.classList.remove('is-karaoke-active');
    if (state.tickInterval) {
      clearInterval(state.tickInterval);
      state.tickInterval = null;
    }
  }

  function onBookSelect(bookCode) {
    const chSelect = document.getElementById('hero-chapter-select');
    const book = getBooksList().find(b => b.code === bookCode) || { chapters: 50 };
    if (chSelect) {
      chSelect.innerHTML = '';
      for (let c = 1; c <= book.chapters; c++) {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = `Rozdział ${c}`;
        chSelect.appendChild(opt);
      }
      chSelect.value = '1';
    }
    startChapterKaraoke(`${bookCode}-001`);
  }

  function onChapterSelect(chNum) {
    const bookSelect = document.getElementById('hero-book-select');
    const bCode = bookSelect?.value || state.chapterId.split('-')[0] || 'GEN';
    const padded = String(chNum).padStart(3, '0');
    startChapterKaraoke(`${bCode}-${padded}`);
  }

  function openKaraoke(chapterId, requestedMode = null) {
    let targetId = chapterId;
    if (!targetId) {
      const cur = currentTrack();
      targetId = cur?.chapterId || state.chapterId || 'GEN-001';
    }
    const btn = document.getElementById('btn-player-karaoke');
    if (btn) btn.classList.add('is-karaoke-active');
    startChapterKaraoke(targetId, requestedMode);
  }

  function togglePlayerKaraoke(chapterId = null) {
    const stage = document.getElementById('hero-karaoke-stage');
    const playerKaraokeBtn = document.getElementById('btn-player-karaoke');
    const cur = currentTrack();
    const targetId = chapterId || cur?.chapterId || state.chapterId || 'GEN-001';

    const isVisible = stage && stage.style.display !== 'none' && stage.offsetParent !== null;

    if (isVisible && state.chapterId === targetId) {
      closeHeroKaraoke();
      if (typeof window.showToast === 'function') {
        window.showToast('Ukryto tekst Pisma Świętego');
      }
    } else {
      if (playerKaraokeBtn) playerKaraokeBtn.classList.add('is-karaoke-active');
      openKaraoke(targetId);
      const heroSection = document.getElementById('hero') || stage;
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function downloadFormat(ext) {
    if (!state.chapterId) return;
    const url = `${KARAOKE_BASE}${encodeURIComponent(state.chapterId)}.${ext}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.chapterId}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // 7. GŁOSOWANIE TOP 100 & AUTHENTICATION
  async function getToken() {
    if (typeof window.CC_BU_GET_ID_TOKEN === 'function') {
      try {
        const t = await window.CC_BU_GET_ID_TOKEN();
        if (t) return t;
      } catch (e) {}
    }
    if (window.LuminaDB?.auth?.currentUser) {
      try {
        return await window.LuminaDB.auth.currentUser.getIdToken();
      } catch (e) {}
    }
    if (window.firebase?.auth) {
      try {
        return await window.firebase.auth().currentUser?.getIdToken();
      } catch (e) {}
    }
    return null;
  }

  async function api(path, opts = {}) {
    const headers = { 'Accept': 'application/json' };
    if (opts.body) headers['Content-Type'] = 'application/json';
    if (opts.token) headers.Authorization = 'Bearer ' + opts.token;
    const response = await fetch(API + path, {
      method: opts.method || 'GET',
      headers,
      credentials: 'same-origin',
      body: opts.body
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Błąd API');
    return data;
  }

  async function ranking() {
    openDialog('TOP 100 — oficjalne głosowanie');
    const area = content();
    area.replaceChildren();

    const lead = make('p', 'Głosowanie wymaga bezpłatnego konta LUMINA. Każdy zalogowany członek może oddać jeden głos na wybrany utwór z możliwością jego cofnięcia lub zmiany.', 'bu-muted');
    area.appendChild(lead);

    let data;
    try {
      data = await api('/ranking?limit=100');
    } catch (e) {
      area.appendChild(make('p', 'Nie można pobrać wyników rankingu: ' + e.message, 'bu-muted'));
      return;
    }

    const token = await getToken().catch(() => null);
    const mine = new Set();
    if (token) {
      try {
        const m = await api('/my-votes', { token });
        (m.chapterIds || []).forEach(x => mine.add(x));
      } catch (e) {
        area.appendChild(make('p', 'Nie udało się pobrać Twoich aktywnych głosów: ' + e.message, 'bu-muted'));
      }
    } else {
      const loginBox = make('div', '', 'bu-toolbar');
      const loginLink = document.createElement('a');
      loginLink.href = '/lumina';
      loginLink.textContent = 'Zaloguj się przez LUMINA, aby zagłosować na utwór →';
      loginLink.style.color = '#e2cc9a';
      loginLink.style.fontWeight = '700';
      loginBox.appendChild(loginLink);
      area.appendChild(loginBox);
    }

    const scores = new Map((data.items || []).map(x => [x.chapterId, Number(x.votes)]));
    const tracks = getTracks().filter(t => t.chapterId && t.videoId);
    const seen = new Set();
    const unique = tracks.filter(x => {
      if (seen.has(x.chapterId)) return false;
      seen.add(x.chapterId);
      return true;
    });

    unique.sort((a, b) => (scores.get(b.chapterId) || 0) - (scores.get(a.chapterId) || 0) || a.chapterId.localeCompare(b.chapterId));

    const rows = make('div', '', 'bu-ranking');
    area.appendChild(rows);

    for (const [index, t] of unique.slice(0, 100).entries()) {
      const row = make('div', '', 'bu-rank');
      row.appendChild(make('span', `${index + 1}. ${t.title}`));
      const votes = make('strong', `${scores.get(t.chapterId) || 0} głosów`);
      row.appendChild(votes);

      const vote = button(mine.has(t.chapterId) ? 'Cofnij głos' : 'Głosuj', async () => {
        vote.disabled = true;
        try {
          const remove = mine.has(t.chapterId);
          const result = await api('/votes/' + encodeURIComponent(t.chapterId), {
            method: remove ? 'DELETE' : 'PUT',
            token
          });
          if (result.voted) mine.add(t.chapterId);
          else mine.delete(t.chapterId);
          votes.textContent = `${result.votes} głosów`;
          vote.textContent = result.voted ? 'Cofnij głos' : 'Głosuj';
        } catch (e) {
          alert(e.message);
        } finally {
          vote.disabled = !token;
        }
      }, true);

      vote.disabled = !token;
      row.appendChild(vote);
      rows.appendChild(row);
    }

    if (!unique.length) {
      area.appendChild(make('p', 'Brak opublikowanych utworów do głosowania.', 'bu-muted'));
    }
  }

  // 7b. ZARZĄDZANIE BEZPOŚREDNIM GŁOSOWANIEM (BEZ OTWIERANIA OKNA)
  let myVotedChapters = new Set();
  try {
    const cached = localStorage.getItem('bu_voted_chapters');
    if (cached) myVotedChapters = new Set(JSON.parse(cached));
  } catch {}

  function saveVotedChapters() {
    try {
      localStorage.setItem('bu_voted_chapters', JSON.stringify([...myVotedChapters]));
    } catch {}
  }

  function updateVotingButtonState(chapterId) {
    const btn = document.getElementById('btn-player-top100');
    if (!btn) return;
    const curId = chapterId || currentTrack()?.chapterId || state.chapterId || 'GEN-001';
    const isVoted = myVotedChapters.has(curId);
    if (isVoted) {
      btn.classList.add('is-voted');
      btn.title = 'Głos oddany w TOP 100 (kliknij, aby cofnąć)';
      btn.setAttribute('aria-label', 'Głos oddany w TOP 100 — kliknij, aby cofnąć');
    } else {
      btn.classList.remove('is-voted');
      btn.title = 'Oddaj głos w TOP 100';
      btn.setAttribute('aria-label', 'Oddaj głos na utwór w TOP 100');
    }
  }

  async function syncMyVotes() {
    const token = await getToken().catch(() => null);
    if (!token) return;
    try {
      const res = await api('/my-votes', { token });
      if (Array.isArray(res.chapterIds)) {
        myVotedChapters = new Set(res.chapterIds);
        saveVotedChapters();
        updateVotingButtonState();
      }
    } catch {}
  }

  async function voteCurrentTrack() {
    const btn = document.getElementById('btn-player-top100');
    const track = currentTrack();
    const chapterId = track?.chapterId || state.chapterId || 'GEN-001';
    const title = track?.title || ('Rozdział ' + chapterId);

    const token = await getToken().catch(() => null);
    if (!token) {
      if (typeof window.showToast === 'function') {
        window.showToast('Zaloguj się w portalu LUMINA, aby oddać głos w TOP 100 🏆');
      } else {
        alert('Zaloguj się w portalu LUMINA, aby oddać głos w TOP 100 🏆');
      }
      return;
    }

    const isCurrentlyVoted = myVotedChapters.has(chapterId);
    const method = isCurrentlyVoted ? 'DELETE' : 'PUT';

    if (btn) btn.disabled = true;
    try {
      const result = await api('/votes/' + encodeURIComponent(chapterId), {
        method,
        token
      });

      if (result.voted) {
        myVotedChapters.add(chapterId);
        saveVotedChapters();
        updateVotingButtonState(chapterId);
        if (typeof window.showToast === 'function') {
          window.showToast(`🏆 Oddano głos na: ${title}! (Razem: ${result.votes})`);
        }
      } else {
        myVotedChapters.delete(chapterId);
        saveVotedChapters();
        updateVotingButtonState(chapterId);
        if (typeof window.showToast === 'function') {
          window.showToast(`Cofnięto głos na: ${title}.`);
        }
      }
    } catch (e) {
      if (typeof window.showToast === 'function') {
        window.showToast(e.message || 'Nie udało się zapisać głosu.');
      } else {
        alert(e.message || 'Nie udało się zapisać głosu.');
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // Obsługa powrotu na kartę przeglądarki
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.mode === 'sync') {
      tickSync();
    }
  });

  // 8. GLOBALNE INTERFEJSY I PODPIĘCIE
  const originalZeroAtrap = window.openZeroAtrapModal;
  window.openZeroAtrapModal = function (which) {
    if (which === 'karaoke') return togglePlayerKaraoke();
    if (which === 'top100') return voteCurrentTrack();
    if (typeof originalZeroAtrap === 'function') return originalZeroAtrap(which);
  };

  window.openChapterLyrics = function (chapterId, evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    openKaraoke(chapterId, 'reading');
    const heroSection = document.getElementById('hero') || document.getElementById('hero-karaoke-stage');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  window.loadChapterLyrics = loadChapterLyrics;
  window.startChapterKaraoke = startChapterKaraoke;
  window.voteCurrentTrack = voteCurrentTrack;
  window.togglePlayerKaraoke = togglePlayerKaraoke;

  window.CC_BU_FEATURES = {
    openKaraoke,
    togglePlayerKaraoke,
    voteCurrentTrack,
    updateVotingButtonState,
    openRanking: ranking,
    setMode,
    adjustFontSize,
    toggleFullscreen,
    closeHeroKaraoke,
    onBookSelect,
    onChapterSelect,
    loadChapterLyrics,
    startChapterKaraoke,
    downloadFormat
  };

  // Inicjalizacja stanu selektorów i przycisków
  function initOnReady() {
    initChapterSelectors();
    updateVotingButtonState();
    syncMyVotes();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnReady);
  } else {
    initOnReady();
  }

})();
