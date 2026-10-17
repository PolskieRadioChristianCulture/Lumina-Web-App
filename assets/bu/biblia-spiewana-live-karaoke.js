// ═══════════════════════════════════════════════════════════════════════════
// CC KARAOKE LIVE SYNC 2.0 — BIBLIA ŚPIEWANA LIVE 24/7
// Niezależna warstwa zsynchronizowanego karaoke nad tapetą 16:9.
// Korzysta z oryginalnego algorytmu CC Karaoke Sync 2.0 (bez modyfikacji logiki
// synchronizacji) oraz istniejącego odtwarzacza <audio id="stream-audio">
// (ZERO podwójnego dźwięku, ZERO kosztów zewnętrznych API).
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  const KARAOKE_BASE = '/data/bu-karaoke/';
  const BIBLE_BASE = '/data/bible/ubg-2025/';

  const BOOK_NAMES = {
    GEN: 'Księga Rodzaju',
    PRO: 'Przypowieści Salomona',
    ECC: 'Księga Kaznodziei',
    SNG: 'Pieśń nad Pieśniami',
    PSA: 'Księga Psalmów'
  };

  // Stan wtyczki CC Karaoke Live Sync
  const state = {
    pluginMode: 'AUTO', // 'AUTO' | 'ON' | 'OFF'
    displayMode: 'words', // 'words' | 'lines'
    fontSize: 28,
    worshipDim: 75, // 60 | 75 | 90
    offsetMs: 0,
    autoScroll: true,
    userScrollTimeout: null,
    isFullscreen: false,
    adminOpen: false,
    chapterId: null,
    trackTitle: '',
    sync: null,
    lyrics: null,
    syncStatus: 'INIT', // 'SYNC_READY' | 'NO_SYNC' | 'LOADING' | 'ERROR'
    syncSourceFormat: 'JSON',
    syncNodes: [],
    lastActiveIdx: -1,
    activeLineState: 'idle', // 'singing' | 'primed' | 'holding' | 'interlude' | 'no-sync'
    tickInterval: null,
    loadVersion: 0,
    lastBufferRecoverAt: 0
  };

  const syncCache = new Map();
  const lyricsCache = new Map();

  // Bezpieczny odczyt/zapis ustawień w localStorage
  function lsGet(key, fallback) {
    try {
      const v = window.localStorage.getItem(key);
      return v !== null ? v : fallback;
    } catch {
      return fallback;
    }
  }

  function lsSet(key, value) {
    try {
      if (value === null || value === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, String(value));
      }
    } catch {
      // ignore storage errors in restricted iframes
    }
  }

  function loadPersistedSettings() {
    const savedMode = lsGet('cc_bs_live_karaoke_mode', 'AUTO');
    if (['AUTO', 'ON', 'OFF'].includes(savedMode)) {
      state.pluginMode = savedMode;
    }
    const savedDisplay = lsGet('cc_bu_display_mode', 'words');
    if (savedDisplay === 'lines' || savedDisplay === 'words') {
      state.displayMode = savedDisplay;
    }
    const savedDim = Number(lsGet('cc_worship_dimmer', '75'));
    if ([60, 75, 90].includes(savedDim)) {
      state.worshipDim = savedDim;
    }
    const savedFont = Number(lsGet('cc_bs_live_font_size', '28'));
    if (Number.isFinite(savedFont) && savedFont >= 18 && savedFont <= 44) {
      state.fontSize = savedFont;
    }
  }

  function getSavedOffset(chapterId) {
    if (!chapterId) return 0;
    const val = lsGet(`cc_karaoke_offset_${chapterId}`, '0');
    return parseInt(val, 10) || 0;
  }

  function saveOffset(chapterId, offsetMs) {
    if (!chapterId) return;
    if (offsetMs === 0) {
      lsSet(`cc_karaoke_offset_${chapterId}`, null);
    } else {
      lsSet(`cc_karaoke_offset_${chapterId}`, String(offsetMs));
    }
  }

  const fmtTime = (sec) => {
    const s = Math.max(0, Math.floor(Number(sec) || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  // ── 1. IDENTYFIKACJA AKTUALNEGO UTWORU I POZYCJI Z #stream-audio ──
  function getStreamAudio() {
    return document.getElementById('stream-audio');
  }

  function resolveChapterFromTrack(track, audioSrc) {
    if (track && track.chapterId && /^[A-Z0-9]{3}-\d{3}$/.test(track.chapterId)) {
      return track.chapterId;
    }
    const candidates = [
      track?.id || '',
      track?.title || '',
      track?.url || '',
      audioSrc || ''
    ].map((s) => {
      try {
        return decodeURIComponent(String(s));
      } catch {
        return String(s);
      }
    });

    for (const raw of candidates) {
      const mId = raw.match(/biblia_spiewana_(\d{1,2})\b/i);
      if (mId) {
        return `PRO-${String(parseInt(mId[1], 10)).padStart(3, '0')}`;
      }
      const mPro = raw.match(/Przypowie[śs]ci\s+Salomona[^0-9]*(\d{1,2})\b/i);
      if (mPro) {
        return `PRO-${String(parseInt(mPro[1], 10)).padStart(3, '0')}`;
      }
      const mCode = raw.match(/\b(GEN|PRO|ECC|SNG|PSA)-(\d{3})\b/i);
      if (mCode) {
        return `${mCode[1].toUpperCase()}-${mCode[2]}`;
      }
    }
    return null;
  }

  function getCurrentBroadcastTrack() {
    const audio = getStreamAudio();
    const playlist = Array.isArray(window.worshipPlaylist) ? window.worshipPlaylist : [];
    const currentTrack = window.currentWorshipTrack || null;

    if (currentTrack) {
      const chId = resolveChapterFromTrack(currentTrack, audio?.src);
      return {
        track: currentTrack,
        chapterId: chId,
        title: currentTrack.title || (chId ? formatChapterTitle(chId) : 'Biblia Śpiewana')
      };
    }

    if (audio && audio.src && playlist.length) {
      const matched = playlist.find((t) => t.url && audio.src.includes(t.url.slice(-26)));
      if (matched) {
        const chId = resolveChapterFromTrack(matched, audio.src);
        return {
          track: matched,
          chapterId: chId,
          title: matched.title || (chId ? formatChapterTitle(chId) : 'Biblia Śpiewana')
        };
      }
    }

    if (audio && audio.src) {
      const chId = resolveChapterFromTrack(null, audio.src);
      if (chId) {
        return {
          track: null,
          chapterId: chId,
          title: formatChapterTitle(chId)
        };
      }
    }

    if (playlist.length > 0) {
      const totalDur = playlist.reduce((acc, t) => acc + (t.duration || 240), 0) || 9294;
      let rem = Math.floor(Date.now() / 1000) % totalDur;
      let chosen = playlist[0];
      for (const item of playlist) {
        const d = item.duration || 240;
        if (rem < d) {
          chosen = item;
          break;
        }
        rem -= d;
      }
      if (chosen) {
        const chId = resolveChapterFromTrack(chosen, '');
        return {
          track: chosen,
          chapterId: chId,
          title: chosen.title || (chId ? formatChapterTitle(chId) : 'Biblia Śpiewana')
        };
      }
    }

    return { track: null, chapterId: 'PRO-001', title: formatChapterTitle('PRO-001') };
  }

  function formatChapterTitle(chapterId) {
    if (!chapterId) return 'Biblia Śpiewana 24/7';
    const [book, ch] = String(chapterId).split('-');
    const bookName = BOOK_NAMES[book] || book;
    const chNum = parseInt(ch, 10) || 1;
    return `${bookName} · Rozdział ${chNum}`;
  }

  // ── 2. PARSERY LRC / VTT ORAZ ŁADOWANIE DANYCH SYNCHRONIZACJI ──
  function parseTimeToken(str) {
    const parts = String(str).trim().split(':');
    if (parts.length === 3) {
      return Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2].replace(',', '.'));
    }
    if (parts.length === 2) {
      return Number(parts[0]) * 60 + Number(parts[1].replace(',', '.'));
    }
    return NaN;
  }

  function parseLrcToSync(lrcText, chapterId) {
    const rawLines = String(lrcText || '').split(/\r?\n/);
    const cues = [];
    for (const row of rawLines) {
      const m = row.match(/^\[(\d{2}:\d{2}(?:\.\d{1,3})?)\](.*)$/);
      if (!m) continue;
      const start = parseTimeToken(m[1]);
      const text = m[2].trim();
      if (Number.isFinite(start) && text) {
        cues.push({ start, text });
      }
    }
    if (!cues.length) return null;
    cues.sort((a, b) => a.start - b.start);
    const lines = cues.map((cue, idx) => ({
      id: `${chapterId}-L${String(idx + 1).padStart(3, '0')}`,
      verse: idx + 1,
      start: cue.start,
      end: idx + 1 < cues.length ? Math.max(cue.start + 0.8, cues[idx + 1].start) : cue.start + 5.0,
      text: cue.text,
      words: [],
      isInstrumental: false
    }));
    return {
      chapterId,
      status: 'SYNC_READY',
      syncMethod: 'lrc-fallback',
      sourceFormat: 'LRC',
      lines
    };
  }

  function parseVttToSync(vttText, chapterId) {
    const blocks = String(vttText || '').replace(/\r/g, '').split(/\n\n+/);
    const lines = [];
    for (const block of blocks) {
      const rows = block.split('\n').map((s) => s.trim()).filter(Boolean);
      const timeRowIdx = rows.findIndex((r) => r.includes('-->'));
      if (timeRowIdx === -1) continue;
      const [startRaw, endRaw] = rows[timeRowIdx].split('-->').map((s) => s.trim().split(/\s+/)[0]);
      const start = parseTimeToken(startRaw);
      const end = parseTimeToken(endRaw);
      const text = rows.slice(timeRowIdx + 1).join(' ').replace(/<[^>]+>/g, '').trim();
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start && text) {
        lines.push({
          id: `${chapterId}-L${String(lines.length + 1).padStart(3, '0')}`,
          verse: lines.length + 1,
          start,
          end,
          text,
          words: [],
          isInstrumental: false
        });
      }
    }
    if (!lines.length) return null;
    lines.sort((a, b) => a.start - b.start);
    return {
      chapterId,
      status: 'SYNC_READY',
      syncMethod: 'vtt-fallback',
      sourceFormat: 'VTT',
      lines
    };
  }

  async function loadChapterSync(chapterId) {
    if (!chapterId) return null;
    if (syncCache.has(chapterId)) return syncCache.get(chapterId);

    // 1. JSON (z dokładnymi granicami słów i wersów)
    try {
      const response = await fetch(`${KARAOKE_BASE}${encodeURIComponent(chapterId)}.json`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const isValidStatus = data.status === 'SYNC_READY' || data.status === 'approved' || data.status === 'SYNC_REVIEW';
        if (isValidStatus && Array.isArray(data.lines) && data.lines.length > 0) {
          const sorted = data.lines
            .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end) && s.end >= s.start && s.text?.trim())
            .sort((a, b) => a.start - b.start);
          if (sorted.length > 0) {
            const result = { ...data, sourceFormat: 'JSON (LRC/VTT)', lines: sorted };
            syncCache.set(chapterId, result);
            return result;
          }
        }
      }
    } catch {
      // Przejdź do fallbacku VTT/LRC
    }

    // 2. Fallback VTT
    try {
      const vttRes = await fetch(`${KARAOKE_BASE}${encodeURIComponent(chapterId)}.vtt`, { cache: 'no-store' });
      if (vttRes.ok) {
        const parsed = parseVttToSync(await vttRes.text(), chapterId);
        if (parsed) {
          syncCache.set(chapterId, parsed);
          return parsed;
        }
      }
    } catch {}

    // 3. Fallback LRC
    try {
      const lrcRes = await fetch(`${KARAOKE_BASE}${encodeURIComponent(chapterId)}.lrc`, { cache: 'no-store' });
      if (lrcRes.ok) {
        const parsed = parseLrcToSync(await lrcRes.text(), chapterId);
        if (parsed) {
          syncCache.set(chapterId, parsed);
          return parsed;
        }
      }
    } catch {}

    // Brak wiarygodnych danych synchronizacji — nigdy nie symulujemy fałszywego karaoke!
    syncCache.set(chapterId, null);
    return null;
  }

  async function loadChapterLyrics(chapterId) {
    if (!chapterId) return null;
    if (lyricsCache.has(chapterId)) return lyricsCache.get(chapterId);
    try {
      const response = await fetch(`${BIBLE_BASE}${encodeURIComponent(chapterId)}.json`, { cache: 'default' });
      if (!response.ok) return null;
      const data = await response.json();
      lyricsCache.set(chapterId, data);
      return data;
    } catch {
      return null;
    }
  }

  // ── 3. ORYGINALNY SILNIK SYNCHRONIZACJI SŁÓW I WERSÓW (Z KARAOKE-TOP100.JS) ──
  function prepareLineWords(segment) {
    const text = (segment.text || '').trim();
    if (!text) return [];

    if (Array.isArray(segment.words) && segment.words.length > 0) {
      return segment.words.map((w) => ({
        text: w.text || w.word || '',
        start: typeof w.start === 'number' && Number.isFinite(w.start) ? w.start : NaN,
        end: typeof w.end === 'number' && Number.isFinite(w.end) ? w.end : NaN,
        confidence: typeof w.confidence === 'number' ? w.confidence : undefined,
        reviewRequired: w.reviewRequired === true
      }));
    }

    return text.split(/\s+/).filter(Boolean).map((word) => ({
      text: word,
      start: NaN,
      end: NaN,
      reviewRequired: true
    }));
  }

  function updateActiveLineWords(lineBtn, segment, now, isHolding = false, isPrimed = false) {
    if (!lineBtn || !segment) return;
    const wordNodes = lineBtn._wordNodes;
    const wordsTiming = lineBtn._wordsTiming;
    if (!wordNodes || !wordsTiming || !wordNodes.length) return;

    if (state.displayMode === 'lines') {
      for (let i = 0; i < wordNodes.length; i++) {
        wordNodes[i].classList.remove('is-singing', 'is-sung');
      }
      return;
    }

    if (isHolding) {
      for (let i = 0; i < wordNodes.length; i++) {
        wordNodes[i].classList.add('is-sung');
        wordNodes[i].classList.remove('is-singing');
      }
      return;
    }

    if (isPrimed) {
      for (let i = 0; i < wordNodes.length; i++) {
        wordNodes[i].classList.remove('is-singing', 'is-sung');
      }
      return;
    }

    let activeWordIdx = -1;
    for (let i = 0; i < wordsTiming.length; i++) {
      const w = wordsTiming[i];
      if (now >= w.start && now < w.end) {
        activeWordIdx = i;
        break;
      }
    }

    for (let i = 0; i < wordNodes.length; i++) {
      const wNode = wordNodes[i];
      if (i === activeWordIdx) {
        if (!wNode.classList.contains('is-singing')) {
          wNode.classList.add('is-singing');
        }
        wNode.classList.remove('is-sung');
        const word = wordsTiming[i];
        const progress = Math.min(1, Math.max(0, (now - word.start) / Math.max(0.001, word.end - word.start)));
        wNode.style.setProperty('--bu-word-progress', (progress * 100).toFixed(1) + '%');
      } else if (now >= wordsTiming[i].end) {
        if (!wNode.classList.contains('is-sung')) {
          wNode.classList.add('is-sung');
        }
        wNode.classList.remove('is-singing');
      } else {
        wNode.classList.remove('is-singing', 'is-sung');
      }
    }
  }

  function getLineScrollTop(line, vp) {
    let top = 0;
    let curr = line;
    while (curr && curr !== vp) {
      top += curr.offsetTop;
      curr = curr.offsetParent;
    }
    return top;
  }

  let activeScrollAnimation = null;

  function scrollToSmoothly(vp, targetY, instant = false) {
    if (!vp) return;
    if (activeScrollAnimation) {
      cancelAnimationFrame(activeScrollAnimation);
      activeScrollAnimation = null;
    }
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (instant || reducedMotion) {
      vp.scrollTop = targetY;
      return;
    }

    const startY = vp.scrollTop;
    const diff = targetY - startY;
    if (Math.abs(diff) < 2) return;

    const duration = Math.min(260, Math.max(120, Math.abs(diff) * 0.9));
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      vp.scrollTop = Math.round(startY + diff * ease);
      if (progress < 1) {
        activeScrollAnimation = requestAnimationFrame(step);
      } else {
        activeScrollAnimation = null;
      }
    }
    activeScrollAnimation = requestAnimationFrame(step);
  }

  function centerActiveLine(instant = false) {
    const vp = document.getElementById('bs-karaoke-viewport');
    if (!vp || state.lastActiveIdx < 0 || !state.autoScroll) return;
    const line = state.syncNodes[state.lastActiveIdx];
    if (!line) return;

    // Stały horyzont wokalny: 38% od góry okna karaoke (środkowo-dolna część ekranu TV)
    const lineTop = getLineScrollTop(line, vp);
    const focalAnchor = Math.round(vp.clientHeight * 0.38);
    const targetScroll = Math.max(0, Math.round(lineTop - focalAnchor));

    scrollToSmoothly(vp, targetScroll, instant);
  }

  // ── 4. BUDOWA INTERFEJSU WARSTWY KARAOKE I PANELU ADMINISTRACYJNEGO ──
  function injectStyles() {
    if (document.getElementById('bs-karaoke-live-styles')) return;
    const style = document.createElement('style');
    style.id = 'bs-karaoke-live-styles';
    style.textContent = `
      :root {
        --bs-karaoke-font-size: 28px;
        --bs-karaoke-dim: 0.78;
        --bs-gold: #C4A35A;
        --bs-gold-bright: #FFE2A5;
        --bs-white: #FFFFFF;
        --bs-navy: #070B16;
      }

      /* ── WARSTWA KARAOKE NAD TAPETĄ (ŚRODKOWO-DOLNA CZĘŚĆ EKRANU 16:9) ──
         Twarze 3 osób i rozświetlony krzyż znajdują się w górnej i środkowej
         części kadru (0% – 54% wysokości). Warstwa karaoke umieszczona jest
         w dolnych 42% ekranu (nad paskiem dolnym), na miękkim granatowym
         gradiencie, dzięki czemu NIGDY nie zasłania twarzy ani krzyża. */
      #bs-karaoke-stage {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 64px;
        height: 410px;
        z-index: 45;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        padding: 18px 90px 18px;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transform: translateY(14px);
        transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1),
                    transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
                    visibility 0.55s;
        background: linear-gradient(
          180deg,
          rgba(7, 11, 22, 0) 0%,
          rgba(7, 11, 22, calc(var(--bs-karaoke-dim, 0.78) * 0.58)) 26%,
          rgba(7, 11, 22, calc(var(--bs-karaoke-dim, 0.78) * 0.94)) 68%,
          rgba(7, 11, 22, calc(var(--bs-karaoke-dim, 0.78) * 0.98)) 100%
        );
      }

      #bs-karaoke-stage.is-visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      /* Dyskretna belka metadanych utworu poza obszarem głównych wersów */
      .bs-karaoke-meta-bar {
        width: 100%;
        max-width: 1460px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 8px;
        padding: 0 18px;
        pointer-events: auto;
      }

      .bs-karaoke-brand-pill {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 6px 16px;
        border-radius: 999px;
        background: rgba(7, 11, 22, 0.76);
        border: 1px solid rgba(196, 163, 90, 0.42);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      .bs-karaoke-brand-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--bs-gold);
        box-shadow: 0 0 10px var(--bs-gold);
      }

      .bs-karaoke-brand-label {
        font: 800 13px/1.2 'Outfit', Inter, sans-serif;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--bs-gold);
      }

      .bs-karaoke-track-name {
        font: 700 15px/1.2 'Outfit', Inter, sans-serif;
        color: #F7F4EF;
        letter-spacing: 0.03em;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
      }

      .bs-karaoke-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        border-radius: 999px;
        background: rgba(7, 11, 22, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.14);
        font: 700 12px/1.2 'Inter', sans-serif;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #4ade80;
      }

      /* Viewport z wersami Pisma Świętego */
      #bs-karaoke-viewport {
        position: relative;
        width: 100%;
        max-width: 1460px;
        height: 320px;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 10px 24px;
        border-radius: 22px;
        pointer-events: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        mask-image: linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%);
        -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%);
      }
      #bs-karaoke-viewport::-webkit-scrollbar {
        display: none;
      }

      #bs-karaoke-lines {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 110px 18px 135px;
        width: 100%;
      }

      /* Pojedyncza linia tekstu karaoke */
      #bs-karaoke-lines .bu-line {
        appearance: none;
        border: 1px solid transparent;
        background: transparent;
        width: 100%;
        max-width: 1360px;
        text-align: center;
        padding: 10px 22px;
        border-radius: 16px;
        cursor: pointer;
        font-family: 'Outfit', 'Segoe UI', Inter, sans-serif;
        font-size: var(--bs-karaoke-font-size, 28px);
        font-weight: 600;
        line-height: 1.48;
        letter-spacing: 0.01em;
        color: rgba(255, 255, 255, 0.42);
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.88);
        transition: color 0.28s ease, opacity 0.28s ease, background 0.28s ease, border-color 0.28s ease;
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
        min-height: 48px;
      }

      #bs-karaoke-lines .bu-line.prev,
      #bs-karaoke-lines .bu-line.next {
        color: rgba(255, 255, 255, 0.72);
      }

      /* Aktywny wers — czysta biel i złoto champagne #C4A35A */
      #bs-karaoke-lines .bu-line.active {
        color: #FFFFFF;
        font-weight: 800;
        background: linear-gradient(90deg, rgba(7, 11, 22, 0.15) 0%, rgba(196, 163, 90, 0.20) 50%, rgba(7, 11, 22, 0.15) 100%);
        border-color: rgba(196, 163, 90, 0.45);
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.55), 0 0 26px rgba(196, 163, 90, 0.18);
        text-shadow: 0 2px 14px rgba(0, 0, 0, 0.95), 0 0 18px rgba(196, 163, 90, 0.35);
      }

      #bs-karaoke-lines .bu-line.active.is-primed {
        border-color: rgba(196, 163, 90, 0.32);
        background: linear-gradient(90deg, transparent, rgba(196, 163, 90, 0.12), transparent);
      }

      #bs-karaoke-lines .bu-verse-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 3px 9px;
        border-radius: 999px;
        font: 800 12px/1.2 'Inter', sans-serif;
        letter-spacing: 0.06em;
        color: var(--bs-gold);
        background: rgba(196, 163, 90, 0.16);
        border: 1px solid rgba(196, 163, 90, 0.42);
        flex-shrink: 0;
        transform: translateY(-2px);
      }

      #bs-karaoke-lines .bu-line-text {
        display: inline;
      }

      #bs-karaoke-lines .bu-word {
        display: inline;
        padding: 1px 2px;
        border-radius: 5px;
        transition: color 0.12s ease, text-shadow 0.12s ease, background-color 0.12s ease;
      }

      /* Podświetlanie słów ciepłym złotem champagne #C4A35A */
      #bs-karaoke-lines .bu-line.active .bu-word.is-sung {
        color: var(--bs-gold);
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.95), 0 0 14px rgba(196, 163, 90, 0.45);
      }

      #bs-karaoke-lines .bu-line.active .bu-word.is-singing {
        color: #FFE2A5;
        background: linear-gradient(
          90deg,
          rgba(196, 163, 90, 0.42) var(--bu-word-progress, 50%),
          rgba(196, 163, 90, 0.12) var(--bu-word-progress, 50%)
        );
        box-shadow: 0 0 16px rgba(196, 163, 90, 0.32);
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.95), 0 0 18px rgba(255, 226, 165, 0.65);
      }

      /* Tryb prezentacji: całe linijki */
      #bs-karaoke-viewport[data-display-mode="lines"] .bu-line.active {
        color: var(--bs-gold-bright) !important;
        background: linear-gradient(90deg, rgba(7, 11, 22, 0.25), rgba(196, 163, 90, 0.28), rgba(7, 11, 22, 0.25)) !important;
      }
      #bs-karaoke-viewport[data-display-mode="lines"] .bu-line.active .bu-word {
        color: inherit !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      /* ── AUTOMATYCZNA MINIMALIZACJA ELEMENTÓW INFORMACYJNYCH PODCZAS ŚPIEWANIA ── */
      body.karaoke-singing-active #cinematicSpectrumContainer {
        opacity: 0.10 !important;
        height: 45px !important;
        transition: opacity 0.6s ease, height 0.6s ease;
      }

      body.karaoke-singing-active .biblia-qr-widget {
        opacity: 0 !important;
        transform: translateY(20px) scale(0.92) !important;
        pointer-events: none !important;
        transition: opacity 0.5s ease, transform 0.5s ease;
      }

      body.karaoke-singing-active .ticker-popup-tab {
        opacity: 0 !important;
        pointer-events: none !important;
      }

      body.karaoke-singing-active footer {
        height: 58px !important;
        opacity: 0.82 !important;
        transition: height 0.5s ease, opacity 0.5s ease;
      }

      body.karaoke-singing-active footer .large-ticker-logo {
        height: 96px !important;
        transform: translateY(-18px) translateZ(30px) !important;
        transition: height 0.5s ease, transform 0.5s ease;
      }

      body.karaoke-singing-active footer .ticker-marquee-text {
        font-size: 1.55rem !important;
      }

      body.karaoke-singing-active #rdsWrap {
        opacity: 0.45 !important;
        transition: opacity 0.5s ease;
      }

      body.karaoke-singing-active header {
        opacity: 0.72 !important;
        transition: opacity 0.5s ease;
      }

      /* ── OPCJONALNY TRYB PEŁNOEKRANOWY KARAOKE ── */
      body.bs-karaoke-fullscreen footer,
      body.bs-karaoke-fullscreen #rdsWrap,
      body.bs-karaoke-fullscreen .biblia-qr-widget,
      body.bs-karaoke-fullscreen #cinematicSpectrumContainer,
      body.bs-karaoke-fullscreen .ticker-popup-tab {
        opacity: 0 !important;
        pointer-events: none !important;
      }

      body.bs-karaoke-fullscreen #bs-karaoke-stage {
        bottom: 0 !important;
        height: 480px !important;
        padding-bottom: 34px !important;
      }

      body.bs-karaoke-fullscreen #bs-karaoke-viewport {
        height: 385px !important;
      }

      /* ── PŁYWAJĄCY DOK KONTROLNY (POZA #app-container DLA RESPONSYWNOŚCI ≥44x44px NA MOBILE I DESKTOP) ── */
      #bs-karaoke-floating-dock {
        position: fixed;
        top: 14px;
        right: 16px;
        z-index: 9500;
        display: flex;
        align-items: center;
        gap: 8px;
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.35s ease, transform 0.35s ease;
      }

      /* Automatyczne ukrywanie dwóch przycisków w prawym górnym rogu podczas nadawania OBS LIVE / pełnego ekranu / bezczynności */
      #bs-karaoke-floating-dock.is-obs-hidden,
      body.bs-karaoke-fullscreen #bs-karaoke-floating-dock:not(.is-wake-hover):not(.is-admin-open) {
        opacity: 0 !important;
        transform: translateY(-10px);
      }

      #bs-karaoke-floating-dock:hover,
      #bs-karaoke-floating-dock:focus-within,
      #bs-karaoke-floating-dock.is-admin-open {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }

      .bs-dock-btn {
        min-width: 44px;
        min-height: 44px;
        padding: 8px 14px;
        border-radius: 999px;
        border: 1px solid rgba(196, 163, 90, 0.48);
        background: rgba(7, 11, 22, 0.82);
        color: #F7F4EF;
        font: 700 13px/1.2 'Outfit', Inter, sans-serif;
        letter-spacing: 0.04em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
      }

      .bs-dock-btn:hover {
        background: rgba(19, 28, 48, 0.94);
        border-color: var(--bs-gold);
        color: var(--bs-gold-bright);
      }

      .bs-dock-btn.is-active {
        background: rgba(196, 163, 90, 0.22);
        border-color: var(--bs-gold);
        color: var(--bs-gold-bright);
      }

      .bs-dock-btn .bs-mode-badge {
        padding: 2px 7px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 800;
        background: rgba(196, 163, 90, 0.25);
        color: var(--bs-gold-bright);
      }

      /* ── PANEL ADMINISTRACYJNY / REŻYSERKI KARAOKE TV (AUTO / ON / OFF + TELEMETRIA + USTAWIENIA) ── */
      #bs-karaoke-admin-panel {
        position: fixed;
        top: 68px;
        right: 16px;
        width: min(420px, calc(100vw - 32px));
        max-height: calc(100vh - 86px);
        overflow-y: auto;
        z-index: 9501;
        background: rgba(7, 11, 22, 0.96);
        border: 1.5px solid rgba(196, 163, 90, 0.65);
        border-radius: 20px;
        padding: 18px;
        color: #F7F4EF;
        font-family: 'Outfit', Inter, system-ui, sans-serif;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        display: none;
      }

      #bs-karaoke-admin-panel.is-open {
        display: block;
      }

      .bs-admin-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 12px;
        margin-bottom: 14px;
        border-bottom: 1px solid rgba(196, 163, 90, 0.25);
      }

      .bs-admin-title {
        font: 800 15px/1.25 'Cinzel', serif;
        color: var(--bs-gold);
        letter-spacing: 0.08em;
      }

      .bs-admin-close {
        min-width: 44px;
        min-height: 44px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(255, 255, 255, 0.06);
        color: #fff;
        font-size: 16px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .bs-admin-section {
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(196, 163, 90, 0.20);
        border-radius: 14px;
        padding: 12px 14px;
        margin-bottom: 12px;
      }

      .bs-admin-label {
        display: block;
        font: 800 11px/1.3 'Inter', sans-serif;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--bs-gold);
        margin-bottom: 8px;
      }

      .bs-admin-mode-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      .bs-admin-btn {
        min-height: 44px;
        min-width: 44px;
        padding: 8px 12px;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.25);
        background: rgba(15, 23, 42, 0.9);
        color: #E2E8F0;
        font: 700 13px/1.2 'Inter', sans-serif;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.18s ease;
      }

      .bs-admin-btn:hover {
        border-color: var(--bs-gold);
        color: #fff;
      }

      .bs-admin-btn.is-active {
        background: var(--bs-gold);
        color: #060911;
        border-color: var(--bs-gold-bright);
        font-weight: 800;
      }

      .bs-admin-kill-btn {
        width: 100%;
        min-height: 46px;
        margin-top: 8px;
        border-radius: 10px;
        border: 1px solid rgba(239, 68, 68, 0.65);
        background: linear-gradient(135deg, rgba(185, 28, 28, 0.9), rgba(127, 29, 29, 0.95));
        color: #fff;
        font: 800 12px/1.2 'Inter', sans-serif;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .bs-admin-kill-btn:hover {
        background: linear-gradient(135deg, #dc2626, #991b1b);
      }

      /* Podgląd emisji na żywo */
      .bs-telemetry-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12.5px;
        padding: 4px 0;
        border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
      }
      .bs-telemetry-row:last-child {
        border-bottom: none;
      }
      .bs-telemetry-key {
        color: rgba(255, 255, 255, 0.62);
      }
      .bs-telemetry-val {
        font-weight: 700;
        color: #F7F4EF;
        font-variant-numeric: tabular-nums;
      }
      .bs-telemetry-preview {
        margin-top: 8px;
        padding: 8px 10px;
        border-radius: 8px;
        background: rgba(4, 7, 15, 0.78);
        border-left: 3px solid var(--bs-gold);
        font-size: 12.5px;
        color: var(--bs-gold-bright);
        line-height: 1.4;
        min-height: 38px;
      }

      .bs-admin-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .bs-admin-offset-grid {
        display: grid;
        grid-template-columns: 1fr 78px 1fr auto;
        gap: 6px;
        align-items: stretch;
      }

      .bs-admin-offset-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: rgba(196, 163, 90, 0.14);
        border: 1px solid rgba(196, 163, 90, 0.38);
        color: var(--bs-gold-bright);
        font: 800 12px/1 'Inter', sans-serif;
        font-variant-numeric: tabular-nums;
      }

      @media (max-width: 640px) {
        #bs-karaoke-floating-dock {
          top: 10px;
          right: 10px;
          gap: 6px;
        }
        .bs-dock-btn span.bs-dock-text {
          display: none;
        }
        #bs-karaoke-admin-panel {
          top: 60px;
          right: 10px;
          width: calc(100vw - 20px);
          padding: 14px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function buildKaraokeDOM() {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;

    // 1. Scena karaoke wewnątrz #app-container (1920x1080) w środkowo-dolnej strefie
    if (!document.getElementById('bs-karaoke-stage')) {
      const stage = document.createElement('section');
      stage.id = 'bs-karaoke-stage';
      stage.setAttribute('aria-label', 'Biblia Śpiewana — Zsynchronizowane Karaoke na Żywo');
      stage.innerHTML = `
        <div class="bs-karaoke-meta-bar">
          <div class="bs-karaoke-brand-pill">
            <span class="bs-karaoke-brand-dot" aria-hidden="true"></span>
            <span class="bs-karaoke-brand-label">KARAOKE LIVE</span>
            <span class="bs-karaoke-track-name" id="bs-karaoke-track-label">Przypowieści Salomona</span>
          </div>
          <div class="bs-karaoke-status-pill" id="bs-karaoke-status-pill" role="status">
            <span id="bs-karaoke-status-text">● Śpiewaj z tekstem</span>
          </div>
        </div>
        <div id="bs-karaoke-viewport" data-display-mode="${state.displayMode}" tabindex="0" aria-label="Wersy Pisma Świętego zsynchronizowane z emisją">
          <div id="bs-karaoke-lines" data-mode="synchronized"></div>
        </div>
      `;
      const footer = appContainer.querySelector('footer');
      if (footer) {
        appContainer.insertBefore(stage, footer);
      } else {
        appContainer.appendChild(stage);
      }

      // Pauzuj autoscroll na 4.5s przy ręcznym przewijaniu
      const vp = stage.querySelector('#bs-karaoke-viewport');
      const pauseAutoScrollBriefly = () => {
        state.autoScroll = false;
        if (state.userScrollTimeout) clearTimeout(state.userScrollTimeout);
        state.userScrollTimeout = setTimeout(() => {
          state.autoScroll = true;
          centerActiveLine();
        }, 4500);
      };
      vp.addEventListener('wheel', pauseAutoScrollBriefly, { passive: true });
      vp.addEventListener('touchmove', pauseAutoScrollBriefly, { passive: true });
    }

    // 2. Pływający pasek kontrolny oraz Panel Reżyserki Karaoke (poza #app-container dla 100% ergonomii ≥44x44px na telefonach i desktopie)
    if (!document.getElementById('bs-karaoke-floating-dock')) {
      const dock = document.createElement('div');
      dock.id = 'bs-karaoke-floating-dock';
      dock.setAttribute('role', 'toolbar');
      dock.setAttribute('aria-label', 'Sterowanie Karaoke TV');
      dock.innerHTML = `
        <button type="button" class="bs-dock-btn" id="bs-btn-fullscreen-karaoke" title="Tryb pełnoekranowy karaoke" aria-label="Przełącz tryb pełnoekranowy karaoke">
          <i class="fa-solid fa-expand" aria-hidden="true"></i>
          <span class="bs-dock-text">Pełny ekran</span>
        </button>
        <button type="button" class="bs-dock-btn" id="bs-btn-admin-toggle" title="Panel sterowania Karaoke TV (AUTO / ON / OFF)" aria-label="Otwórz panel sterowania Karaoke TV" aria-expanded="false">
          <i class="fa-solid fa-sliders" aria-hidden="true"></i>
          <span class="bs-dock-text">Karaoke TV</span>
          <span class="bs-mode-badge" id="bs-dock-mode-badge">${state.pluginMode}</span>
        </button>
      `;
      document.body.appendChild(dock);
    }

    if (!document.getElementById('bs-karaoke-admin-panel')) {
      const panel = document.createElement('aside');
      panel.id = 'bs-karaoke-admin-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Panel administracyjny Karaoke TV');
      panel.innerHTML = `
        <div class="bs-admin-header">
          <div class="bs-admin-title">CC KARAOKE LIVE • REŻYSERKA</div>
          <button type="button" class="bs-admin-close" id="bs-admin-close-btn" aria-label="Zamknij panel sterowania">&times;</button>
        </div>

        <div class="bs-admin-section">
          <span class="bs-admin-label">Tryb emisji wtyczki (AUTO / ON / OFF)</span>
          <div class="bs-admin-mode-grid" role="group" aria-label="Tryb wtyczki karaoke">
            <button type="button" class="bs-admin-btn" data-plugin-mode="AUTO" id="bs-mode-auto-btn">AUTO</button>
            <button type="button" class="bs-admin-btn" data-plugin-mode="ON" id="bs-mode-on-btn">ON</button>
            <button type="button" class="bs-admin-btn" data-plugin-mode="OFF" id="bs-mode-off-btn">OFF</button>
          </div>
          <button type="button" class="bs-admin-kill-btn" id="bs-emergency-off-btn" aria-label="Natychmiast wyłącz wtyczkę karaoke">
            <i class="fa-solid fa-power-off" aria-hidden="true"></i> WYŁĄCZ NATYCHMIAST (OFF)
          </button>
        </div>

        <div class="bs-admin-section">
          <span class="bs-admin-label">Podgląd emisji na żywo</span>
          <div class="bs-telemetry-row">
            <span class="bs-telemetry-key">Aktualny rozdział:</span>
            <span class="bs-telemetry-val" id="bs-tel-chapter">—</span>
          </div>
          <div class="bs-telemetry-row">
            <span class="bs-telemetry-key">Status synchronizacji:</span>
            <span class="bs-telemetry-val" id="bs-tel-status">—</span>
          </div>
          <div class="bs-telemetry-row">
            <span class="bs-telemetry-key">Zegar emisji utworu:</span>
            <span class="bs-telemetry-val" id="bs-tel-time">0:00 / 0:00</span>
          </div>
          <div class="bs-telemetry-preview" id="bs-tel-line-preview">Oczekiwanie na zsynchronizowany werset...</div>
        </div>

        <div class="bs-admin-section">
          <span class="bs-admin-label">Prezentacja i rozmiar tekstu</span>
          <div class="bs-admin-row-2" style="margin-bottom: 8px;">
            <button type="button" class="bs-admin-btn" id="bs-disp-words-btn" data-disp="words">Słowa (Złoto)</button>
            <button type="button" class="bs-admin-btn" id="bs-disp-lines-btn" data-disp="lines">Całe linijki</button>
          </div>
          <div class="bs-admin-row-2">
            <button type="button" class="bs-admin-btn" id="bs-font-minus-btn" aria-label="Pomniejsz tekst karaoke">A− Mniejszy</button>
            <button type="button" class="bs-admin-btn" id="bs-font-plus-btn" aria-label="Powiększ tekst karaoke">A+ Większy</button>
          </div>
        </div>

        <div class="bs-admin-section">
          <span class="bs-admin-label">Przyciemnienie gradientu pod tekstem</span>
          <div class="bs-admin-mode-grid">
            <button type="button" class="bs-admin-btn bs-dim-btn" data-dim="60">60%</button>
            <button type="button" class="bs-admin-btn bs-dim-btn" data-dim="75">75%</button>
            <button type="button" class="bs-admin-btn bs-dim-btn" data-dim="90">90%</button>
          </div>
        </div>

        <div class="bs-admin-section" style="margin-bottom: 0;">
          <span class="bs-admin-label">Korekta synchronizacji (krok 100 ms)</span>
          <div class="bs-admin-offset-grid">
            <button type="button" class="bs-admin-btn" id="bs-offset-earlier-btn" title="Tekst wcześniej o 100 ms">Wcześniej</button>
            <span class="bs-admin-offset-badge" id="bs-offset-badge">0 ms</span>
            <button type="button" class="bs-admin-btn" id="bs-offset-later-btn" title="Tekst później o 100 ms">Później</button>
            <button type="button" class="bs-admin-btn" id="bs-offset-reset-btn" title="Wyzeruj korektę">0 ms</button>
          </div>
        </div>
      `;
      document.body.appendChild(panel);
    }

    bindUIControls();
    applyVisualSettings();
  }

  function bindUIControls() {
    const fsBtn = document.getElementById('bs-btn-fullscreen-karaoke');
    const adminToggleBtn = document.getElementById('bs-btn-admin-toggle');
    const adminCloseBtn = document.getElementById('bs-admin-close-btn');
    const emergencyOffBtn = document.getElementById('bs-emergency-off-btn');

    if (fsBtn && !fsBtn._bound) {
      fsBtn._bound = true;
      fsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFullscreenKaraoke();
      });
    }

    if (adminToggleBtn && !adminToggleBtn._bound) {
      adminToggleBtn._bound = true;
      adminToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAdminPanel();
      });
    }

    if (adminCloseBtn && !adminCloseBtn._bound) {
      adminCloseBtn._bound = true;
      adminCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAdminPanel(false);
      });
    }

    if (emergencyOffBtn && !emergencyOffBtn._bound) {
      emergencyOffBtn._bound = true;
      emergencyOffBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setPluginMode('OFF');
      });
    }

    document.querySelectorAll('[data-plugin-mode]').forEach((btn) => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setPluginMode(btn.getAttribute('data-plugin-mode'));
      });
    });

    document.querySelectorAll('[data-disp]').forEach((btn) => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setDisplayMode(btn.getAttribute('data-disp'));
      });
    });

    document.querySelectorAll('.bs-dim-btn').forEach((btn) => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setWorshipDimmer(Number(btn.getAttribute('data-dim')));
      });
    });

    const fontMinus = document.getElementById('bs-font-minus-btn');
    const fontPlus = document.getElementById('bs-font-plus-btn');
    if (fontMinus && !fontMinus._bound) {
      fontMinus._bound = true;
      fontMinus.addEventListener('click', (e) => {
        e.stopPropagation();
        adjustFontSize(-2);
      });
    }
    if (fontPlus && !fontPlus._bound) {
      fontPlus._bound = true;
      fontPlus.addEventListener('click', (e) => {
        e.stopPropagation();
        adjustFontSize(2);
      });
    }

    const earlierBtn = document.getElementById('bs-offset-earlier-btn');
    const laterBtn = document.getElementById('bs-offset-later-btn');
    const resetBtn = document.getElementById('bs-offset-reset-btn');
    if (earlierBtn && !earlierBtn._bound) {
      earlierBtn._bound = true;
      earlierBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        adjustOffset(100);
      });
    }
    if (laterBtn && !laterBtn._bound) {
      laterBtn._bound = true;
      laterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        adjustOffset(-100);
      });
    }
    if (resetBtn && !resetBtn._bound) {
      resetBtn._bound = true;
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetOffset();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.adminOpen) toggleAdminPanel(false);
        else if (state.isFullscreen) toggleFullscreenKaraoke(false);
      }
    });

    // Automatyczne ukrywanie dwóch przycisków w prawym górnym rogu podczas nadawania OBS LIVE / pełnego ekranu / bezczynności
    const dock = document.getElementById('bs-karaoke-floating-dock');
    if (dock && !dock._autoHideBound) {
      dock._autoHideBound = true;
      let dockHideTimer = null;

      const hideDockNow = () => {
        if (state.adminOpen) return;
        dock.classList.add('is-obs-hidden');
        dock.classList.remove('is-wake-hover');
      };

      const scheduleDockHide = (delayMs = 1800) => {
        if (dockHideTimer) clearTimeout(dockHideTimer);
        dockHideTimer = setTimeout(hideDockNow, delayMs);
      };

      const wakeDock = () => {
        dock.classList.remove('is-obs-hidden');
        dock.classList.add('is-wake-hover');
        scheduleDockHide(1800);
      };

      // W OBS Browser Source lub z parametrami emisji ukryj natychmiast, w przeglądarce po 1.6s
      const isObsEnv = Boolean(
        window.obsstudio ||
        window.location.search.includes('obs=1') ||
        window.location.search.includes('clean=1') ||
        window.location.search.includes('broadcast=1')
      );
      if (isObsEnv) {
        hideDockNow();
      } else {
        scheduleDockHide(1600);
      }

      document.addEventListener('mousemove', (e) => {
        if (state.isFullscreen) {
          // W trybie pełnoekranowym / OBS pokaż przyciski tylko po najechaniu kursorem w okolice prawego górnego rogu
          if (e.clientY <= 120 && e.clientX >= window.innerWidth - 420) {
            wakeDock();
          } else if (!state.adminOpen) {
            hideDockNow();
          }
        } else {
          wakeDock();
        }
      }, { passive: true });

      document.addEventListener('touchstart', () => {
        wakeDock();
      }, { passive: true });

      document.addEventListener('mouseleave', () => {
        hideDockNow();
      });
    }
  }

  function toggleAdminPanel(force) {
    const panel = document.getElementById('bs-karaoke-admin-panel');
    const btn = document.getElementById('bs-btn-admin-toggle');
    const dock = document.getElementById('bs-karaoke-floating-dock');
    if (!panel) return;
    state.adminOpen = typeof force === 'boolean' ? force : !state.adminOpen;
    panel.classList.toggle('is-open', state.adminOpen);
    if (dock) {
      dock.classList.toggle('is-admin-open', state.adminOpen);
      if (state.adminOpen) {
        dock.classList.remove('is-obs-hidden');
      }
    }
    if (btn) {
      btn.setAttribute('aria-expanded', String(state.adminOpen));
      btn.classList.toggle('is-active', state.adminOpen);
    }
    updateTelemetryUI();
  }

  function setPluginMode(mode) {
    if (!['AUTO', 'ON', 'OFF'].includes(mode)) return;
    state.pluginMode = mode;
    lsSet('cc_bs_live_karaoke_mode', mode);
    applyVisualSettings();
    evaluateVisibilityAndMinimize();
    tickSync();
  }

  function setDisplayMode(mode) {
    if (mode !== 'words' && mode !== 'lines') return;
    state.displayMode = mode;
    lsSet('cc_bu_display_mode', mode);
    applyVisualSettings();
    tickSync();
  }

  function adjustFontSize(delta) {
    state.fontSize = Math.min(44, Math.max(18, state.fontSize + delta));
    lsSet('cc_bs_live_font_size', state.fontSize);
    applyVisualSettings();
    setTimeout(() => centerActiveLine(true), 40);
  }

  function setWorshipDimmer(percent) {
    const p = [60, 75, 90].includes(Number(percent)) ? Number(percent) : 75;
    state.worshipDim = p;
    lsSet('cc_worship_dimmer', p);
    applyVisualSettings();
  }

  function adjustOffset(deltaMs) {
    state.offsetMs = Math.max(-2500, Math.min(2500, (state.offsetMs || 0) + deltaMs));
    saveOffset(state.chapterId, state.offsetMs);
    applyVisualSettings();
    tickSync();
  }

  function resetOffset() {
    state.offsetMs = 0;
    saveOffset(state.chapterId, 0);
    applyVisualSettings();
    tickSync();
  }

  async function toggleFullscreenKaraoke(force) {
    const nextState = typeof force === 'boolean' ? force : !state.isFullscreen;
    state.isFullscreen = nextState;
    document.body.classList.toggle('bs-karaoke-fullscreen', state.isFullscreen);

    const fsBtn = document.getElementById('bs-btn-fullscreen-karaoke');
    if (fsBtn) {
      fsBtn.classList.toggle('is-active', state.isFullscreen);
      fsBtn.innerHTML = state.isFullscreen
        ? '<i class="fa-solid fa-compress" aria-hidden="true"></i><span class="bs-dock-text">Zwiń ekran</span>'
        : '<i class="fa-solid fa-expand" aria-hidden="true"></i><span class="bs-dock-text">Pełny ekran</span>';
    }

    // Po włączeniu pełnego ekranu (np. do emisji OBS LIVE) natychmiast ukryj oba przyciski w prawym górnym rogu
    const dock = document.getElementById('bs-karaoke-floating-dock');
    if (dock && state.isFullscreen && !state.adminOpen) {
      dock.classList.add('is-obs-hidden');
      dock.classList.remove('is-wake-hover');
      if (document.activeElement && dock.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    }

    if (state.isFullscreen && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // W środowisku bez gestu lub iframe pozostaje pełnoekranowy tryb CSS
      }
    } else if (!state.isFullscreen && document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch {}
    }

    setTimeout(() => centerActiveLine(true), 80);
  }

  function applyVisualSettings() {
    document.documentElement.style.setProperty('--bs-karaoke-font-size', `${state.fontSize}px`);
    const dimAlpha = state.worshipDim === 60 ? '0.62' : (state.worshipDim === 90 ? '0.92' : '0.78');
    document.documentElement.style.setProperty('--bs-karaoke-dim', dimAlpha);

    const vp = document.getElementById('bs-karaoke-viewport');
    if (vp) vp.dataset.displayMode = state.displayMode;

    const badge = document.getElementById('bs-dock-mode-badge');
    if (badge) badge.textContent = state.pluginMode;

    document.querySelectorAll('[data-plugin-mode]').forEach((btn) => {
      const active = btn.getAttribute('data-plugin-mode') === state.pluginMode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    document.querySelectorAll('[data-disp]').forEach((btn) => {
      const active = btn.getAttribute('data-disp') === state.displayMode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    document.querySelectorAll('.bs-dim-btn').forEach((btn) => {
      const active = Number(btn.getAttribute('data-dim')) === state.worshipDim;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    const offsetBadge = document.getElementById('bs-offset-badge');
    if (offsetBadge) {
      const ms = state.offsetMs || 0;
      offsetBadge.textContent = ms > 0 ? `+${ms} ms` : `${ms} ms`;
    }
  }

  // ── 5. RENDEROWANIE WERSÓW I PĘTLA SYNCHRONIZACJI Z #stream-audio ──
  function renderSynchronizedLines(syncData) {
    const container = document.getElementById('bs-karaoke-lines');
    if (!container) return;
    container.replaceChildren();
    state.syncNodes = [];
    state.lastActiveIdx = -1;

    if (!syncData || !Array.isArray(syncData.lines) || !syncData.lines.length) {
      return;
    }

    for (const [idx, segment] of syncData.lines.entries()) {
      const lineBtn = document.createElement('button');
      lineBtn.type = 'button';
      lineBtn.className = 'bu-line' + (segment.isInstrumental ? ' is-instrumental' : '');
      lineBtn.dataset.index = idx;
      lineBtn.dataset.start = segment.start;
      lineBtn.dataset.end = segment.end;

      if (segment.verse) {
        const pill = document.createElement('span');
        pill.className = 'bu-verse-pill';
        pill.textContent = `W.${segment.verse}`;
        lineBtn.appendChild(pill);
      }

      const textSpan = document.createElement('span');
      textSpan.className = 'bu-line-text';

      const wordsTiming = prepareLineWords(segment);
      lineBtn._wordsTiming = wordsTiming;
      lineBtn._wordNodes = [];

      wordsTiming.forEach((w, wIdx) => {
        const wSpan = document.createElement('span');
        wSpan.className = 'bu-word';
        wSpan.dataset.wordIdx = wIdx;
        wSpan.textContent = w.text;
        textSpan.appendChild(wSpan);
        lineBtn._wordNodes.push(wSpan);
        if (wIdx < wordsTiming.length - 1) {
          textSpan.appendChild(document.createTextNode(' '));
        }
      });

      lineBtn.appendChild(textSpan);

      // Kliknięcie wersu pozwala operatorowi/widzowi zsynchronizować czas w obrębie utworu
      lineBtn.addEventListener('click', () => {
        const audio = getStreamAudio();
        if (!audio) return;
        const seekTime = Math.max(0, segment.start - state.offsetMs / 1000);
        try {
          audio.currentTime = seekTime;
          tickSync();
        } catch {}
      });

      container.appendChild(lineBtn);
      state.syncNodes.push(lineBtn);
    }
  }

  function evaluateVisibilityAndMinimize() {
    const stage = document.getElementById('bs-karaoke-stage');
    if (!stage) return false;

    const hasValidSync = Boolean(
      state.sync &&
      state.syncStatus === 'SYNC_READY' &&
      Array.isArray(state.sync.lines) &&
      state.sync.lines.length > 0
    );

    // Zasada bezwzględna:
    // - w trybie OFF: wtyczka natychmiast ukryta
    // - gdy brak wiarygodnych danych synchronizacji: automatycznie ukryj tekst bez przerywania programu
    let shouldShowStage = false;
    if (state.pluginMode === 'OFF') {
      shouldShowStage = false;
    } else if (!hasValidSync) {
      shouldShowStage = false;
    } else if (state.pluginMode === 'ON') {
      shouldShowStage = true;
    } else {
      // AUTO: pokazuj warstwę, gdy utwór posiada wiarygodną synchronizację
      shouldShowStage = true;
    }

    stage.classList.toggle('is-visible', shouldShowStage);

    // Automatyczna minimalizacja pasków informacyjnych podczas aktywnego śpiewania
    const isActivelySinging = shouldShowStage && state.activeLineState !== 'interlude';
    document.body.classList.toggle('karaoke-singing-active', isActivelySinging);

    return shouldShowStage;
  }

  function tickSync() {
    // Sprawdź, czy zmienił się rozdział na playliście (o ile operator/test nie wymusił konkretnego rozdziału podglądu)
    if (!state.manualChapterOverride) {
      const currentInfo = getCurrentBroadcastTrack();
      if (currentInfo.chapterId && currentInfo.chapterId !== state.chapterId) {
        loadChapterForBroadcast(currentInfo.chapterId, currentInfo.title, false);
        return;
      }
    }

    const hasValidSync = Boolean(state.sync && state.syncStatus === 'SYNC_READY' && state.syncNodes.length > 0);
    if (state.pluginMode === 'OFF' || !hasValidSync) {
      state.activeLineState = 'no-sync';
      evaluateVisibilityAndMinimize();
      updateTelemetryUI();
      return;
    }

    const audio = getStreamAudio();
    let rawTime = audio ? Number(audio.currentTime || 0) : 0;
    // Jeżeli odtwarzacz oczekuje jeszcze na gest użytkownika lub ładowanie metadanych,
    // synchronizuj bezpośrednio z 24/7 zegarem emisji kanału LIVE
    if (rawTime < 0.2 && (!audio || audio.paused) && !state.manualChapterOverride) {
      if (Number.isFinite(window.currentWorshipTrackOffset)) {
        const elapsedSinceSync = window.currentWorshipTrackSyncedAtMs
          ? Math.max(0, (Date.now() - window.currentWorshipTrackSyncedAtMs) / 1000)
          : 0;
        const trackDur = window.currentWorshipTrack?.duration || 300;
        rawTime = Math.min(trackDur - 0.5, window.currentWorshipTrackOffset + elapsedSinceSync);
      }
    }

    const now = rawTime + (state.offsetMs || 0) / 1000;
    const segments = state.sync.lines;

    let active = -1;
    let isPrimed = false;
    let isHolding = false;

    // 1. Bezpośrednie trafienie w segment wokalny
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (now >= seg.start && now < seg.end) {
        active = i;
        break;
      }
    }

    // 2. Ciągłość między segmentami oraz lookahead priming — zawsze utrzymuj podświetlony werset na ekranie TV
    if (active === -1) {
      if (now < segments[0].start) {
        active = 0;
        isPrimed = true;
      } else {
        let prevIdx = -1;
        for (let i = segments.length - 1; i >= 0; i--) {
          if (now >= segments[i].end) {
            prevIdx = i;
            break;
          }
        }
        if (prevIdx >= 0) {
          const nextIdx = prevIdx + 1;
          if (nextIdx < segments.length) {
            const nextStart = segments[nextIdx].start;
            const gap = nextStart - segments[prevIdx].end;
            if (now >= nextStart - 0.55) {
              active = nextIdx;
              isPrimed = true;
            } else if (gap < 3.2 || now < segments[prevIdx].end + 2.0) {
              active = prevIdx;
              isHolding = true;
            } else {
              active = nextIdx;
              isPrimed = true;
            }
          } else {
            active = prevIdx;
            isHolding = true;
          }
        }
      }
    }

    if (active === -1) {
      state.activeLineState = 'interlude';
    } else if (isPrimed) {
      state.activeLineState = 'primed';
    } else if (isHolding) {
      state.activeLineState = 'holding';
    } else {
      state.activeLineState = 'singing';
    }

    const statusTextEl = document.getElementById('bs-karaoke-status-text');
    if (statusTextEl) {
      if (active === -1) {
        statusTextEl.textContent = '♫ Przerwa instrumentalna ···';
        statusTextEl.style.color = '#FFE2A5';
      } else if (isPrimed) {
        statusTextEl.textContent = '● Przygotuj się do śpiewu';
        statusTextEl.style.color = '#FFE2A5';
      } else if (isHolding) {
        statusTextEl.textContent = '● Chwila oddechu';
        statusTextEl.style.color = '#C4A35A';
      } else {
        statusTextEl.textContent = '● Śpiewaj z tekstem';
        statusTextEl.style.color = '#4ade80';
      }
    }

    if (active !== state.lastActiveIdx) {
      state.syncNodes.forEach((node, index) => {
        const isActive = index === active;
        node.classList.toggle('active', isActive);
        node.classList.toggle('is-holding', isActive && isHolding);
        node.classList.toggle('is-primed', isActive && isPrimed);
        node.classList.toggle('prev', active >= 0 && index === active - 1);
        node.classList.toggle('next', active >= 0 && index === active + 1);
        if (isActive) node.setAttribute('aria-current', 'true');
        else node.removeAttribute('aria-current');
        if (!isActive) {
          node._wordNodes?.forEach((w) => w.classList.remove('is-singing', 'is-sung'));
        }
      });
      state.lastActiveIdx = active;
      centerActiveLine();
    }

    if (active >= 0 && state.syncNodes[active]) {
      state.syncNodes[active].classList.toggle('is-holding', isHolding);
      state.syncNodes[active].classList.toggle('is-primed', isPrimed);
      updateActiveLineWords(state.syncNodes[active], segments[active], now, isHolding, isPrimed);
    }

    evaluateVisibilityAndMinimize();
    updateTelemetryUI();
  }

  function updateTelemetryUI() {
    if (!state.adminOpen) return;
    const chEl = document.getElementById('bs-tel-chapter');
    const stEl = document.getElementById('bs-tel-status');
    const tmEl = document.getElementById('bs-tel-time');
    const prEl = document.getElementById('bs-tel-line-preview');

    const audio = getStreamAudio();
    const cur = audio ? Number(audio.currentTime || 0) : 0;
    const dur = audio && Number.isFinite(audio.duration) ? audio.duration : (window.currentWorshipTrack?.duration || 0);

    if (chEl) chEl.textContent = state.chapterId ? `${state.chapterId} (${formatChapterTitle(state.chapterId)})` : 'Brak';
    if (stEl) {
      if (state.pluginMode === 'OFF') {
        stEl.textContent = 'WYŁĄCZONE (OFF)';
        stEl.style.color = '#f87171';
      } else if (state.syncStatus === 'SYNC_READY') {
        stEl.textContent = `SYNC_READY · ${state.sync?.lines?.length || 0} linii`;
        stEl.style.color = '#4ade80';
      } else if (state.syncStatus === 'NO_SYNC') {
        stEl.textContent = 'BRAK DANYCH SYNC (Ukryto warstwę)';
        stEl.style.color = '#fbbf24';
      } else {
        stEl.textContent = state.syncStatus;
        stEl.style.color = '#94a3b8';
      }
    }
    if (tmEl) {
      tmEl.textContent = `${fmtTime(cur)} / ${fmtTime(dur)}`;
    }
    if (prEl) {
      if (state.pluginMode === 'OFF') {
        prEl.textContent = 'Wtyczka karaoke wyłączona przez operatora (tryb OFF).';
      } else if (state.syncStatus !== 'SYNC_READY') {
        prEl.textContent = 'Ten utwór nie posiada znaczników czasowych — wyświetlana jest czysta tapeta i transmisja TV.';
      } else if (state.lastActiveIdx >= 0 && state.sync?.lines?.[state.lastActiveIdx]) {
        const line = state.sync.lines[state.lastActiveIdx];
        prEl.textContent = `[W.${line.verse || state.lastActiveIdx + 1}] ${line.text}`;
      } else {
        prEl.textContent = '♫ Przerwa instrumentalna pomiędzy wersetami...';
      }
    }
  }

  async function loadChapterForBroadcast(chapterId, trackTitle = '', isManualOverride = false) {
    if (!chapterId) return;
    state.manualChapterOverride = Boolean(isManualOverride);
    const loadVersion = ++state.loadVersion;
    state.chapterId = chapterId;
    state.trackTitle = trackTitle || formatChapterTitle(chapterId);
    state.offsetMs = getSavedOffset(chapterId);
    state.syncStatus = 'LOADING';
    state.sync = null;
    state.syncNodes = [];
    state.lastActiveIdx = -1;

    applyVisualSettings();

    const trackLabelEl = document.getElementById('bs-karaoke-track-label');
    if (trackLabelEl) {
      trackLabelEl.textContent = formatChapterTitle(chapterId);
    }

    const [syncData, lyricsData] = await Promise.all([
      loadChapterSync(chapterId),
      loadChapterLyrics(chapterId)
    ]);

    if (loadVersion !== state.loadVersion) return;

    state.lyrics = lyricsData;
    state.sync = syncData;

    if (syncData && Array.isArray(syncData.lines) && syncData.lines.length > 0) {
      state.syncStatus = 'SYNC_READY';
      state.syncSourceFormat = syncData.sourceFormat || 'JSON';
      renderSynchronizedLines(syncData);
      evaluateVisibilityAndMinimize();
      tickSync();
      setTimeout(() => centerActiveLine(true), 60);
    } else {
      // Brak wiarygodnej synchronizacji -> automatycznie ukryj tekst bez przerywania programu
      state.syncStatus = 'NO_SYNC';
      const container = document.getElementById('bs-karaoke-lines');
      if (container) container.replaceChildren();
      evaluateVisibilityAndMinimize();
      updateTelemetryUI();
    }
  }

  // ── 6. OCHRONA 24/7 PRZED UTRATĄ SYNCHRONIZACJI PO BUFOROWANIU / WZNOWIENIU ──
  function bindStreamResilience() {
    const audio = getStreamAudio();
    if (!audio || audio._bsKaraokeBound) return;
    audio._bsKaraokeBound = true;

    const immediateResync = () => {
      if (!state.manualChapterOverride) {
        const info = getCurrentBroadcastTrack();
        if (info.chapterId && info.chapterId !== state.chapterId) {
          loadChapterForBroadcast(info.chapterId, info.title, false);
          return;
        }
      }
      tickSync();
      centerActiveLine(true);
    };

    audio.addEventListener('loadedmetadata', immediateResync);
    audio.addEventListener('play', immediateResync);
    audio.addEventListener('playing', () => {
      // Po wyjściu z buforowania natychmiast przelicz aktywny wers względem realnego audio.currentTime
      immediateResync();
    });
    audio.addEventListener('seeked', immediateResync);
    audio.addEventListener('timeupdate', () => {
      tickSync();
    });

    // Zdarzenie zmiany utworu emitowane przez biblia-spiewana-live.html
    window.addEventListener('worshipTrackChanged', (e) => {
      state.manualChapterOverride = false;
      const detail = e?.detail || {};
      const chId = resolveChapterFromTrack(detail.track, audio.src);
      if (chId) {
        loadChapterForBroadcast(chId, detail.track?.title || '', false);
      }
    });

    // Po powrocie karty z tła — natychmiast odśwież pozycję
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        immediateResync();
      }
    });
  }

  function startKaraokeEngine() {
    loadPersistedSettings();
    injectStyles();
    buildKaraokeDOM();
    bindStreamResilience();

    const initial = getCurrentBroadcastTrack();
    if (initial.chapterId) {
      loadChapterForBroadcast(initial.chapterId, initial.title);
    }

    if (state.tickInterval) clearInterval(state.tickInterval);
    state.tickInterval = setInterval(tickSync, 40);
  }

  // Publiczne API dla testów, konsoli reżyserskiej i integracji
  window.CC_BS_LIVE_KARAOKE = {
    getState: () => ({
      pluginMode: state.pluginMode,
      displayMode: state.displayMode,
      fontSize: state.fontSize,
      worshipDim: state.worshipDim,
      offsetMs: state.offsetMs,
      chapterId: state.chapterId,
      trackTitle: state.trackTitle,
      syncStatus: state.syncStatus,
      activeLineIndex: state.lastActiveIdx,
      activeLineState: state.activeLineState,
      isFullscreen: state.isFullscreen,
      totalLines: state.sync?.lines?.length || 0
    }),
    setPluginMode,
    setDisplayMode,
    setWorshipDimmer,
    adjustFontSize,
    adjustOffset,
    resetOffset,
    toggleFullscreenKaraoke,
    toggleAdminPanel,
    loadChapterForBroadcast,
    tickSync
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startKaraokeEngine, { once: true });
  } else {
    startKaraokeEngine();
  }
})();
