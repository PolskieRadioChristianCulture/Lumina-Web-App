/**
 * CC TV DIALOGUE — rozważanie „Z Biblią za Pan Brat” jako żywy czat prowadzących (Noemi i Sara).
 * Strażnik Claude, 2026-10-19. Jeden parser i jeden odtwarzacz dla cctv24, cctv24-pl i zapolske-live.
 *
 *   CCTvDialogue.isDialogue(text)          → true, gdy tekst to scenariusz z kwestiami „Noemi:” / „Sara:”
 *   CCTvDialogue.parse(text)               → { isDialogue, messages:[{kind, sender, section, text}] }
 *   CCTvDialogue.play(container, messages, { adapt, onMessage, onMode, loopPauseMs, live:true }) → { stop() }
 *   CCTvDialogue.liveStartToday()          → dzisiejsza sesja na żywo: 09:00 czasu polskiego (Europe/Warsaw)
 *
 * Jedna sesja na dobę: o 09:00 (czas polski) rozmowa toczy się na żywo i jest zsynchronizowana z zegarem —
 * każdy widz widzi tę samą wiadomość w tym samym momencie (spóźnieni dostają to, co już padło).
 * Poza sesją ekran pokazuje powtórkę (onMode: 'live' | 'replay').
 *
 * Treść jest wstawiana wyłącznie jako tekst (textContent). Znaczniki sekcji
 * [INTRO: …], [ANALIZA PROBLEMOWA: …] itd. stają się separatorami rozdziałów, a wskazówki
 * reżyserskie ([OPRAWA GRAFICZNA & MUZYCZNA], „Styl:”) nie trafiają na antenę.
 */
(function (global) {
  'use strict';

  const SPEAKER_RE = /^\s*(?:\*\*)?\s*(Głos\s+Prowadzących|Glos\s+Prowadzacych|Noemi\s+i\s+Sara|Sara\s+i\s+Noemi|Noemi|Sara)\s*(?:\*\*)?\s*(\([^)]*\))?\s*(?:\*\*)?\s*:\s*(?:\*\*)?\s*(.*)$/i;
  const SECTION_RE = /^\s*(?:\*\*)?\s*\[([^\]]+)\]\s*(?:\*\*)?\s*(.*)$/;
  const PRODUCTION_SECTIONS = /^(OPRAWA|PRODUKCJA|REALIZACJA|REŻYSER|REZYSER|MUZYKA|GRAFIKA)/i;
  const META_LINE = /^\s*(🔴|WERSJA\s+CZWARTA|Styl\s*:|###|---+\s*$)/i;

  function stripMd(s) {
    return String(s || '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/__(.*?)__/g, '$1').replace(/(^|\s)\*(\S[^*]*?)\*(?=\s|$)/g, '$1$2').trim();
  }

  function kindOf(name) {
    const n = name.toLowerCase();
    if (/g[łl]os|razem|\si\s/.test(n)) return 'both';
    if (n.startsWith('noemi')) return 'noemi';
    if (n.startsWith('sara')) return 'sara';
    return 'both';
  }

  function isDialogue(text) {
    if (!text) return false;
    let speakers = 0;
    String(text).split('\n').forEach((l) => { if (SPEAKER_RE.test(l)) speakers++; });
    return speakers >= 2;
  }

  function parse(text) {
    const out = { isDialogue: false, messages: [] };
    if (!text) return out;
    out.isDialogue = isDialogue(text);
    if (!out.isDialogue) return out;

    let section = '';
    let production = false;
    let cur = null;
    const commit = () => {
      if (cur && cur.text.trim()) out.messages.push({ ...cur, text: cur.text.trim() });
      cur = null;
    };

    String(text).split('\n').forEach((raw) => {
      const line = raw.replace(/\s+$/, '');
      if (!line.trim()) { if (cur) cur.text += '\n'; return; }

      const sec = line.match(SECTION_RE);
      if (sec) {
        commit();
        section = stripMd(sec[1]).replace(/\s+/g, ' ');
        production = PRODUCTION_SECTIONS.test(section);
        return;
      }
      if (!cur && META_LINE.test(line)) return;

      const sp = line.match(SPEAKER_RE);
      if (sp) {
        commit();
        const name = sp[1].replace(/\s+/g, ' ');
        const kind = kindOf(name);
        cur = {
          kind,
          sender: kind === 'both' ? 'Noemi i Sara' : (kind === 'noemi' ? 'Noemi' : 'Sara'),
          section: production ? '' : section,
          text: stripMd(sp[3] || '')
        };
        return;
      }
      if (production && !cur) return;
      if (/^\s*>/.test(line)) {
        commit();
        out.messages.push({ kind: 'scripture', sender: 'Pismo Święte', section, text: stripMd(line.replace(/^\s*>\s*/, '')) });
        return;
      }
      if (cur) cur.text += (cur.text && !cur.text.endsWith('\n') ? '\n' : '') + stripMd(line);
    });
    commit();
    out.messages.forEach((m) => { m.text = m.text.replace(/\n{3,}/g, '\n\n'); });
    return out;
  }

  // ── Odtwarzacz: wiadomości pojawiają się kolejno, z „pisze…”, jak w komunikatorze ─────────
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  const AVATAR = { noemi: '/avatar_noemi.jpg?v=20261019c', sara: '/avatar_sara.jpg?v=20261019c' };
  const SECTION_ICON = [
    [/INTRO/i, '🎬'], [/ANALIZA/i, '💬'], [/SŁOWO|SLOWO|PERSPEKTYWA|BIBL/i, '📖'],
    [/ZADANIE/i, '🎯'], [/MANIFEST|MODLITW/i, '🙏'], [/OUTRO|BŁOGOS|BLOGOS/i, '✨']
  ];
  const iconFor = (s) => (SECTION_ICON.find(([re]) => re.test(s)) || [null, '•'])[1];

  function bubble(m, adapt) {
    const row = el('div', 'chat-bubble-row cctv-live-row ' + (m.kind === 'scripture' ? 'both scripture' : m.kind));
    if (AVATAR[m.kind]) {
      const img = el('img', 'chat-avatar');
      img.src = AVATAR[m.kind];
      img.alt = m.sender;
      img.onerror = () => { img.replaceWith(el('span', 'chat-avatar cctv-initial', m.sender.charAt(0))); };
      row.appendChild(img);
    }
    const b = el('div', 'chat-bubble');
    if (m.kind !== 'scripture') b.appendChild(el('div', 'chat-sender-name', m.kind === 'both' ? 'Noemi i Sara · razem' : m.sender));
    const body = el('div', 'chat-message-text');
    const text = typeof adapt === 'function' ? adapt(m.text) : m.text;
    text.split('\n').forEach((ln, i) => {
      const t = ln.trim();
      if (!t) { if (i) body.appendChild(el('div', 'cctv-gap')); return; }
      // Wersety: „…” (Rdz 28:15) albo linia w cudzysłowie z odnośnikiem — wyróżnione jak cytat z Pisma.
      const isVerse = /^[„"“].+[”"]\s*(\([^)]*\d+[:,]\d+[^)]*\))?\s*$/.test(t) && /\d+[:,]\d+/.test(t);
      body.appendChild(el('div', isVerse ? 'bible-citation cctv-verse' : 'cctv-line', t));
    });
    b.appendChild(body);
    row.appendChild(b);
    return row;
  }

  function typing(kind, sender) {
    const row = el('div', 'chat-bubble-row cctv-live-row cctv-typing ' + (kind === 'scripture' ? 'both' : kind));
    if (AVATAR[kind]) { const img = el('img', 'chat-avatar'); img.src = AVATAR[kind]; img.alt = ''; row.appendChild(img); }
    const b = el('div', 'chat-bubble');
    b.setAttribute('aria-hidden', 'true');
    b.appendChild(el('span', 'cctv-dots', ''));
    for (let i = 0; i < 3; i++) b.firstChild.appendChild(el('i'));
    b.appendChild(el('span', 'cctv-typing-label', (kind === 'both' ? 'Noemi i Sara' : sender) + ' pisze…'));
    row.appendChild(b);
    return row;
  }

  function injectStyles() {
    if (document.getElementById('cctvDialogueCss')) return;
    const s = document.createElement('style');
    s.id = 'cctvDialogueCss';
    s.textContent = `
      .cctv-live-row{animation:cctvIn .45s ease-out both}
      @keyframes cctvIn{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
      .cctv-section{align-self:center;display:flex;align-items:center;gap:10px;margin:10px 0 2px;padding:6px 16px;border-radius:999px;
        background:rgba(212,175,55,.14);border:1px solid rgba(212,175,55,.45);color:#f3dc8b;font-weight:800;letter-spacing:1.5px;
        text-transform:uppercase;font-size:1.05rem;animation:cctvIn .45s ease-out both}
      .cctv-typing .chat-bubble{display:flex;align-items:center;gap:12px;font-size:1.1rem!important;padding:10px 16px!important;opacity:.85}
      .cctv-dots{display:inline-flex;gap:5px}.cctv-dots i{width:9px;height:9px;border-radius:50%;background:currentColor;opacity:.35;animation:cctvDot 1.2s infinite}
      .cctv-dots i:nth-child(2){animation-delay:.2s}.cctv-dots i:nth-child(3){animation-delay:.4s}
      @keyframes cctvDot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}
      .cctv-typing-label{font-weight:700;letter-spacing:.5px}
      .cctv-line+.cctv-line{margin-top:.35em}.cctv-gap{height:.45em}
      .cctv-verse{margin:.45em 0;font-style:italic}
      .chat-bubble-row.scripture .chat-bubble{background:rgba(255,255,255,.06)!important;border:1px solid rgba(212,175,55,.5)!important}
      .cctv-initial{display:grid;place-items:center;background:#3b2f14;color:#f3dc8b;font-weight:900;font-size:1.6rem}
      .cctv-live-badge{display:inline-flex;align-items:center;gap:8px;font-weight:800;letter-spacing:1px}
      .cctv-live-badge::before{content:'';width:10px;height:10px;border-radius:50%;background:#ff3b3b;box-shadow:0 0 0 0 rgba(255,59,59,.7);animation:cctvPulse 1.6s infinite}
      .cctv-live-badge.is-replay::before{background:#d4af37;animation:none}
      @keyframes cctvPulse{0%{box-shadow:0 0 0 0 rgba(255,59,59,.6)}70%{box-shadow:0 0 0 10px rgba(255,59,59,0)}100%{box-shadow:0 0 0 0 rgba(255,59,59,0)}}
      @media (prefers-reduced-motion: reduce){.cctv-live-row,.cctv-section{animation:none}.cctv-dots i{animation:none;opacity:.6}}
    `;
    document.head.appendChild(s);
  }

  function readingMs(text) {
    // Tempo czytania na ekranie: ~16 znaków/s, od 4 do 16 sekund na wiadomość.
    return Math.max(4000, Math.min(16000, Math.round(String(text || '').length / 16 * 1000)));
  }

  // ── Sesje na żywo: 09:00, 10:00 i 11:00 (czas polski) ──
  const LIVE_TZ = 'Europe/Warsaw';
  const LIVE_HOUR = 9, LIVE_MINUTE = 0;
  function zonedToUtc(y, mo, d, h, mi, tz) {
    const guess = Date.UTC(y, mo - 1, d, h, mi);
    try {
      const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
      const p = {}; f.formatToParts(new Date(guess)).forEach((x) => { p[x.type] = +x.value; });
      const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute);
      return guess - (asUtc - guess);
    } catch (_) { return guess - 2 * 3600000; }
  }
  // Godziny sesji (czas polski) + dzisiejszy start ręczny („Start LIVE teraz” administratora w LUMI).
  // Wybór: najpóźniejszy start, który już nastąpił i jest w oknie 35 min; inaczej najbliższy przyszły;
  // po ostatnim — pierwsza sesja dnia (odtwarzacz liczy wtedy następną: jutro 09:00).
  const LIVE_SESSIONS = [[9, 0], [10, 0], [11, 0], [18, 0]];
  const LIVE_WINDOW_MS = 35 * 60 * 1000;
  const warsawDayOf = (ms) => new Intl.DateTimeFormat('en-CA', { timeZone: LIVE_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
  let manualStart = 0;
  function todaySessionStarts(now = Date.now()) {
    try {
      const [y, mo, d] = warsawDayOf(now).split('-').map(Number);
      const starts = LIVE_SESSIONS.map(([h, mi]) => zonedToUtc(y, mo, d, h, mi, LIVE_TZ));
      if (manualStart && warsawDayOf(manualStart) === warsawDayOf(now)) starts.push(manualStart);
      starts.sort((a, b) => a - b);
      return starts;
    } catch (_) { const t = new Date(now); t.setHours(LIVE_HOUR, LIVE_MINUTE, 0, 0); return [t.getTime()]; }
  }
  function liveStartToday(now = Date.now()) {
    try {
      const starts = todaySessionStarts(now);
      const running = starts.filter((s) => s <= now && now < s + LIVE_WINDOW_MS).pop();
      if (running !== undefined) return running;
      const next = starts.find((s) => s > now);
      return next !== undefined ? next : starts[0];
    } catch (_) { const t = new Date(now); t.setHours(LIVE_HOUR, LIVE_MINUTE, 0, 0); return t.getTime(); }
  }
  // W czacie i pokojach rozważanie nie znika między sesjami — po premierze (9:00) pokazuje treść ostatniej
  // ukończonej sesji, a w trakcie trwania sesji nadaje na żywo z progresywnym pojawianiem się wiadomości.
  function chatSessionStart(now = Date.now()) {
    try {
      const starts = todaySessionStarts(now);
      const running = starts.filter((s) => s <= now && now < s + LIVE_WINDOW_MS).pop();
      if (running !== undefined) return running;
      const past = starts.filter((s) => s <= now);
      if (past.length) return past[past.length - 1];
      const next = starts.find((s) => s > now);
      return next !== undefined ? next : starts[0];
    } catch (_) { return liveStartToday(now); }
  }

  // ── Start ręczny: dokument Firestore lumina_stats/live_session { startAt (ms) } ──
  // Zapis tylko administrator (reguły: isMasterAdmin); odczyt publiczny. Anteny czytają przez REST co 60 s
  // (1 odczyt/min na otwartą antenę), pokoje LUMI — przez onSnapshot i setManualStart().
  const LIVE_DOC_URL = 'https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/lumina_stats/live_session?key=AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M';
  const changeWaiters = [];
  function onScheduleChange() { return new Promise((r) => changeWaiters.push(r)); }
  function setManualStart(ms) {
    const v = Number(ms) > 0 && warsawDayOf(Number(ms)) === warsawDayOf(Date.now()) ? Number(ms) : 0;
    if (v === manualStart) return;
    manualStart = v;
    changeWaiters.splice(0).forEach((r) => { try { r(); } catch (_) {} });
  }
  async function pollManualStart() {
    try {
      const res = await fetch(LIVE_DOC_URL, { cache: 'no-store' });
      if (res.status === 404) { setManualStart(0); return; }
      if (!res.ok) return;
      const f = ((await res.json()).fields || {}).startAt || {};
      setManualStart(Number(f.integerValue || f.doubleValue || 0) || (f.timestampValue ? Date.parse(f.timestampValue) : 0));
    } catch (_) {}
  }
  let pollTimer = null;
  function startManualPolling() {
    if (pollTimer || typeof fetch !== 'function') return;
    pollManualStart();
    pollTimer = setInterval(pollManualStart, 60000);
  }

  // Oś czasu rozmowy (ms od startu): kiedy pojawia się rozdział, „pisze…” i sama wiadomość.
  function timeline(list, reduce) {
    let t = 0, lastSection = null;
    return list.map((m) => {
      const e = { m, sectionAt: null };
      if (m.section && m.section !== lastSection) { lastSection = m.section; e.sectionAt = t; t += reduce ? 300 : 1400; }
      e.typingAt = t;
      if (!reduce) t += Math.min(2600, 900 + m.text.length * 6);
      e.showAt = t;
      t += readingMs(m.text);
      e.endAt = t;
      return e;
    });
  }

  function play(container, messages, opts = {}) {
    injectStyles();
    let stopped = false;
    let timer = null;
    const reduce = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const list = Array.isArray(messages) ? messages.filter((m) => m && m.text) : [];
    const tl = timeline(list, reduce);
    const total = tl.length ? tl[tl.length - 1].endAt : 0;
    const scrollEnd = (smooth) => {
      try { container.scrollTo({ top: container.scrollHeight, behavior: smooth && !reduce ? 'smooth' : 'auto' }); }
      catch (_) { container.scrollTop = container.scrollHeight; }
    };
    const wait = (ms) => new Promise((r) => { timer = setTimeout(r, Math.max(0, ms)); });
    const mode = (m) => { try { if (typeof opts.onMode === 'function') opts.onMode(m); } catch (_) {} };
    const sectionEl = (s) => el('div', 'cctv-section', iconFor(s) + '  ' + s.replace(/\s*:\s*/, ' · '));

    let gen = 0;
    async function runFrom(start, g) {
      const dead = () => stopped || g !== gen;
      container.textContent = '';
      for (let i = 0; i < tl.length && !dead(); i++) {
        const e = tl[i];
        const elapsed = () => Date.now() - start;
        if (e.showAt <= elapsed()) {
          // Już padło (widz dołączył później) — pokaż od razu, bez animacji.
          if (e.sectionAt !== null) container.appendChild(sectionEl(e.m.section));
          container.appendChild(bubble(e.m, opts.adapt));
          continue;
        }
        if (e.sectionAt !== null) {
          await wait(e.sectionAt - elapsed()); if (dead()) return;
          container.appendChild(sectionEl(e.m.section)); scrollEnd(true);
        }
        await wait(e.typingAt - elapsed()); if (dead()) return;
        let t = null;
        if (!reduce) { t = typing(e.m.kind, e.m.sender); container.appendChild(t); scrollEnd(true); }
        await wait(e.showAt - elapsed());
        if (t) t.remove();
        if (dead()) return;
        container.appendChild(bubble(e.m, opts.adapt)); scrollEnd(true);
        try { if (typeof opts.onMessage === 'function') opts.onMessage(e.m, i); } catch (_) {}
      }
      scrollEnd(false);
      if (!dead()) await wait(total - (Date.now() - start));
    }

    const pause = () => opts.loopPauseMs || 20000;
    async function loop() {
      while (!stopped) {
        const liveStart = liveStartToday();
        const now = Date.now();
        const g = ++gen;
        if (opts.live !== false && total && now >= liveStart && now < liveStart + total) {
          mode('live');
          await runFrom(liveStart, g);
          if (stopped) return;
          await wait(pause());
          continue;
        }
        mode('replay');
        // Powtórka nie może zasłonić sesji na żywo: gdy wybije 09:00, przerywamy ją i przechodzimy na żywo.
        const nextLive = liveStart > now ? liveStart : liveStart + 86400000;
        const untilLive = nextLive - now;
        const interrupted = await Promise.race([
          runFrom(Date.now(), g).then(() => false),
          new Promise((r) => setTimeout(() => r(true), untilLive))
        ]);
        if (stopped) return;
        if (interrupted) { gen++; continue; }
        await Promise.race([wait(pause()), new Promise((r) => setTimeout(r, Math.max(0, nextLive - Date.now())))]);
      }
    }
    loop();
    return { stop() { stopped = true; if (timer) clearTimeout(timer); }, durationMs: total };
  }

  global.CCTvDialogue = {
    isDialogue, parse, play, timeline, liveStartToday, todaySessionStarts, chatSessionStart,
    setManualStart, startManualPolling, onScheduleChange,
    version: '20261019_tv3'
  };
})(typeof window !== 'undefined' ? window : globalThis);
