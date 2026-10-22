/**
 * CC LIVE VIEWER CHAT — wspólny czat widzów LUMI MESS na każdym kanale nadawczym (Claude @A007, 2026-10-19).
 *
 * Polecenie Dowódcy: każdy pokój LIVE TV w LUMI MESS pisze do wszystkich kanałów nadawczych — dziś OBS nadaje
 * z /zapolske-live, jutro np. z /master-live (który ładuje kanały w ramce). Dlatego każdy kanał pokazuje ten sam
 * strumień wiadomości ze wszystkich pokoi LIVE TV, we własnym oknie, które nie zasłania QR, zegara ani treści.
 *
 * Użycie (jedna linia na kanale; wymiary w pikselach kadru 1920×1080):
 *   <script src="/js/cc-live-viewer-chat.js?v=…" data-left="215" data-bottom="189" data-width="640" data-height="179"
 *           data-hide="#livePrayerOverlay"></script>
 *   data-right zamiast data-left — okno przy prawej krawędzi; data-container — kontener anteny (domyślnie #app-container);
 *   data-max — ile najnowszych wiadomości (domyślnie 2); data-hide — element chowany, gdy są wiadomości widzów.
 *
 * Koszt: nasłuch onSnapshot (6 pokoi × 5 ostatnich wiadomości) — odczyty tylko przy starcie i przy nowej wiadomości;
 * w ciszy zero odczytów (wcześniejsze odpytywanie co 12 s kosztowało ok. 29 tys. odczytów/dobę na antenę).
 * Treść tylko jako tekst (textContent); filtr linków, numerów telefonów i wulgaryzmów jak na antenie.
 */
(function () {
  'use strict';
  if (window.CCLiveViewerChat) return;

  const script = document.currentScript;
  const cfg = (k, d) => (script && script.dataset && script.dataset[k] !== undefined ? script.dataset[k] : d);
  const ROOMS = String(cfg('rooms', 'tv_zapolske,tv_cctv24,tv_master_live,tv_cctv24_pl,tv_worship,tv_biblia_spiewana')).split(',').map((s) => s.trim()).filter(Boolean);
  const MAX = Math.max(1, Math.min(6, Number(cfg('max', 2)) || 2));
  const WINDOW_MS = 72 * 3600000; // 72h - keeps chat visible across publication breaks
  const BLOCK = /(https?:|www\.|\.(pl|com|net|org|eu|io|info)\b|@|\d[\d\s-]{6,}\d|kurw|chuj|pierd|jeba|jebi|jebn|pizd|spierd|dziwk|cwel|fuck|shit)/i;
  const safe = (t) => typeof t === 'string' && t.trim().length >= 2 && t.length <= 500 && !BLOCK.test(t);
  const hhmm = (ms) => { try { return new Date(ms).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' }); } catch (_) { return ''; } };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  const byRoom = new Map();
  let dock = null;
  let lastSig = '';

  function injectStyles() {
    if (document.getElementById('ccvc-styles')) return;
    const s = document.createElement('style');
    s.id = 'ccvc-styles';
    s.textContent = `
      .ccvc-dock{position:absolute;z-index:60;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:10px 12px;overflow:hidden;
        border:1.5px solid rgba(212,175,55,.55);border-radius:18px;background:rgba(10,12,20,.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
        box-shadow:0 12px 30px rgba(0,0,0,.45);font-family:'Outfit','Inter',system-ui,sans-serif;color:#fff;pointer-events:none}
      .ccvc-dock[hidden]{display:none!important}
      .ccvc-dock.ccvc-fixed{position:fixed}
      .ccvc-head{align-self:center;display:inline-flex;align-items:center;gap:6px;padding:2px 11px;border-radius:999px;background:linear-gradient(90deg,rgba(220,38,38,.3),rgba(212,175,55,.22));
        border:1px solid rgba(252,211,77,.55);color:#fde68a;font-weight:800;font-size:.74rem;letter-spacing:1px;text-transform:uppercase;flex-shrink:0}
      .ccvc-row{display:flex;align-items:flex-start;gap:8px}
      .ccvc-av{width:32px;height:32px;border-radius:50%;object-fit:cover;border:1.5px solid #f59e0b;flex-shrink:0;background:#3b2f14}
      .ccvc-ini{display:grid;place-items:center;color:#f3dc8b;font-weight:900;font-size:.95rem}
      .ccvc-b{max-width:90%;padding:6px 12px;border-radius:14px 14px 14px 4px;background:linear-gradient(135deg,rgba(168,85,247,.24),rgba(6,182,212,.18));border:1px solid rgba(252,211,77,.48)}
      .ccvc-who{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:.85rem;font-weight:800;color:#fde68a;margin-bottom:1px}
      .ccvc-badge{font-size:.62rem;font-weight:800;color:#fecaca;background:rgba(220,38,38,.38);border:1px solid rgba(248,113,113,.55);padding:1px 6px;border-radius:999px;white-space:nowrap}
      .ccvc-text{font-size:1.05rem;line-height:1.28;color:#fff;word-wrap:break-word;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      body.ccvc-on .ccvc-hide-target{display:none!important}
    `;
    document.head.appendChild(s);
  }

  function ensureDock() {
    if (dock) return dock;
    injectStyles();
    const sel = cfg('container', '#app-container');
    const host = (sel && document.querySelector(sel)) || null;
    dock = el('div', 'ccvc-dock');
    dock.id = 'ccLiveViewerChat';
    dock.setAttribute('role', 'log');
    dock.setAttribute('aria-label', 'Czat widzów na żywo z LUMI Messenger');
    dock.hidden = true;
    const px = (v) => (v === undefined || v === '' ? '' : (Number(v) || 0) + 'px');
    const inMcr = window.self !== window.top || window.location.search.includes('in_mcr=1');
    if (inMcr) {
      dock.style.left = px(cfg('mcr-left', 96));
      dock.style.right = '';
      dock.style.bottom = px(cfg('mcr-bottom', 130));
      dock.style.top = '';
    } else {
      if (cfg('right') !== undefined) dock.style.right = px(cfg('right')); else dock.style.left = px(cfg('left', 96));
      if (cfg('top') !== undefined) dock.style.top = px(cfg('top')); else dock.style.bottom = px(cfg('bottom', 130));
    }
    dock.style.width = px(cfg('width', 640));
    dock.style.height = px(cfg('height', 179));
    if (host) host.appendChild(dock); else { dock.classList.add('ccvc-fixed'); document.body.appendChild(dock); }
    const hideSel = cfg('hide');
    if (hideSel) document.querySelectorAll(hideSel).forEach((e) => e.classList.add('ccvc-hide-target'));
    return dock;
  }

  function messages() {
    const cutoff = Date.now() - WINDOW_MS;
    const all = [];
    byRoom.forEach((list) => list.forEach((m) => { if (m.at >= cutoff && safe(m.text)) all.push(m); }));
    all.sort((a, b) => a.at - b.at);
    return all.slice(-MAX);
  }

  function row(m) {
    const r = el('div', 'ccvc-row');
    const raw = String(m.avatar || '').trim();
    const src = raw ? (/^(https?:|\/|data:)/.test(raw) ? raw : '/' + raw) : '/lumina_icon.jpg';
    const img = el('img', 'ccvc-av');
    img.src = src; img.alt = ''; img.loading = 'lazy';
    img.onerror = () => { img.replaceWith(el('span', 'ccvc-av ccvc-ini', (m.name || 'U').charAt(0))); };
    r.appendChild(img);
    const b = el('div', 'ccvc-b');
    const who = el('div', 'ccvc-who');
    who.appendChild(el('span', '', (m.kind === 'prayer' ? '🙏 ' : '💬 ') + m.name));
    const t = hhmm(m.at);
    who.appendChild(el('span', 'ccvc-badge', '🔴 NA ŻYWO' + (t ? ' · ' + t : '')));
    b.appendChild(who);
    b.appendChild(el('div', 'ccvc-text', m.text));
    r.appendChild(b);
    return r;
  }

  function render() {
    const list = messages();
    const sig = list.map((m) => m.id + ':' + m.text).join('|');
    if (sig === lastSig) return;
    lastSig = sig;
    const d = ensureDock();
    d.textContent = '';
    d.hidden = !list.length;
    document.body.classList.toggle('ccvc-on', list.length > 0);
    if (!list.length) return;
    d.appendChild(el('div', 'ccvc-head', '🔴 Czat na żywo · widzowie LUMI MESS'));
    list.forEach((m) => d.appendChild(row(m)));
    // Bez ucinania: zostaje tyle najnowszych wiadomości, ile mieści się w oknie w całości (długie — do 2 linii).
    let rows = d.querySelectorAll('.ccvc-row');
    while (rows.length > 1 && d.scrollHeight > d.clientHeight + 1) { rows[0].remove(); rows = d.querySelectorAll('.ccvc-row'); }
  }

  async function start() {
    try {
      const [{ initializeApp, getApps }, fs] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js')
      ]);
      // Domyślna aplikacja z tą samą konfiguracją co firebase-config.js. Nie rejestrujemy osobnej nazwanej aplikacji:
      // firebase-config.js robi „!getApps().length ? initializeApp : getApp()”, więc obca nazwana aplikacja
      // zarejestrowana wcześniej powodowałaby błąd getApp() i zatrzymanie skryptów kanału.
      const app = getApps().find((a) => a.name === '[DEFAULT]') || initializeApp({
        projectId: 'lumina-cc', appId: '1:413985877183:web:b0c99a686a4fb1b875aa0a', apiKey: 'AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M',
        authDomain: 'lumina-cc.firebaseapp.com', storageBucket: 'lumina-cc.firebasestorage.app', messagingSenderId: '413985877183', measurementId: ''
      });
      const db = fs.getFirestore(app);
      ROOMS.forEach((room) => {
        const q = fs.query(fs.collection(db, 'lumina_live_rooms', room, 'messages'), fs.orderBy('createdAt', 'desc'), fs.limit(5));
        fs.onSnapshot(q, (snap) => {
          byRoom.set(room, snap.docs.map((d) => {
            const x = d.data() || {};
            const at = x.createdAt && typeof x.createdAt.toMillis === 'function' ? x.createdAt.toMillis() : 0;
            return { id: d.id, room, text: String(x.text || '').trim(), name: String(x.senderName || 'Uczestnik LUMINA').slice(0, 60), avatar: x.senderAvatar || '', kind: x.kind === 'prayer' ? 'prayer' : 'text', at };
          }).filter((m) => m.at));
          render();
        }, () => {});
      });
      // Okno 24 h przesuwa się także bez nowych wiadomości.
      setInterval(render, 60000);
    } catch (_) {}
  }

  window.CCLiveViewerChat = { rooms: ROOMS, messages, render };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
