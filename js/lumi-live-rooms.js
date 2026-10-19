/**
 * LUMI Messenger — pokoje LIVE TV (Strażnik Claude, 2026-10-19)
 *
 * • Zakładka „📺 LIVE TV” w LUMI Messenger: osobny pokój dla każdego kanału nadawczego.
 * • Codziennie o 09:00 (czas polski) Noemi i Sara prowadzą w pokojach rozważanie na żywo —
 *   ta sama oś czasu co na antenie (js/cc-tv-dialogue.js), więc każdy widzi te same słowa w tej samej chwili.
 *   Ich rozmowa pojawia się też na czacie ogólnym.
 * • Wiadomości widzów: Firestore lumina_live_rooms/{roomId}/messages (reguły: tylko zalogowani członkowie,
 *   bez kont dzieci, tylko tekst do 1000 znaków; usuwa autor albo administrator).
 * • Pokój „Zjednoczeni za Polskę”: modlitwy (kind: 'prayer') trafiają na antenę /zapolske-live po kilku sekundach.
 * Koszt: zero — bez serwera; wpisy prowadzących są liczone w przeglądarce z dzisiejszego scenariusza.
 */
import { getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, collection, query, orderBy, limit, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export const LIVE_ROOMS = [
  { id: 'tv_cctv24', name: 'CCTV24 · Telewizja Śniadaniowa', url: '/cctv24', icon: '📺', reflection: true, desc: 'Rozważanie „Z Biblią za Pan Brat” z Noemi i Sarą — na żywo.' },
  { id: 'tv_zapolske', name: 'Zjednoczeni za Polskę', url: '/zapolske-live', icon: '🇵🇱', reflection: true, prayers: true, desc: 'Módl się z nami — Twoja modlitwa pojawi się na antenie.' },
  { id: 'tv_master_live', name: 'Master Live · Główna antena', url: '/live', icon: '🎬', reflection: true, desc: 'Główna antena Christian Culture TV.' },
  { id: 'tv_cctv24_pl', name: 'CCTV24 PL', url: '/cctv24-pl', icon: '📡', reflection: true, desc: 'Kopia transmisyjna CCTV24.' },
  { id: 'tv_worship', name: 'CCTV24 Worship', url: '/cctv24-worship', icon: '🎶', desc: 'Uwielbienie na żywo przez całą dobę.' },
  { id: 'tv_biblia_spiewana', name: 'Biblia Śpiewana LIVE', url: '/biblia-spiewana-live', icon: '📖', desc: 'Śpiewamy Pismo Święte razem.' }
];
const ROOM = Object.fromEntries(LIVE_ROOMS.map((r) => [r.id, r]));
const PRESENTER = {
  noemi: { id: 'noemi', name: 'Noemi', avatar: '/avatar_noemi.jpg?v=20261019c' },
  sara: { id: 'sara', name: 'Sara', avatar: '/avatar_sara.jpg?v=20261019c' },
  both: { id: 'cctv24', name: 'Noemi i Sara', avatar: '/logo_cctv.webp' },
  scripture: { id: 'cctv24', name: 'Pismo Święte', avatar: '/logo_cctv.webp' }
};

// ── Pomocnicze ────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  kids.flat().forEach((c) => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c))); });
  return e;
}
const hhmm = (ms) => new Date(ms).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
const tsMs = (v) => (v && typeof v.toMillis === 'function') ? v.toMillis() : (v && v.seconds ? v.seconds * 1000 : (typeof v === 'number' ? v : 0));

function loadScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[data-src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.dataset.src = src; s.onload = resolve; s.onerror = resolve;
    document.head.appendChild(s);
  });
}

async function firebaseReady() {
  for (let i = 0; i < 100 && !getApps().length; i++) await new Promise((r) => setTimeout(r, 150));
  if (!getApps().length) return null;
  const app = getApp();
  return { db: getFirestore(app), auth: getAuth(app) };
}

// ── Dzisiejsza sesja Noemi i Sary (09:00 czasu polskiego) ────────────────────
const session = { day: '', title: '', items: [], liveStart: 0, total: 0, ready: false };
function warsawDay(ms = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
}
// Czas sesji dla czatu i pokoju: w trakcie emisji — sesja na żywo; między sesjami — ostatnia zakończona sesja dzisiaj (dzięki czemu treść nie znika).
function getChatLiveStart(D, now = Date.now()) {
  if (D && typeof D.chatSessionStart === 'function') return D.chatSessionStart(now);
  return D ? D.liveStartToday() : 0;
}
// Przesuwa oś czasu prowadzących na właściwą sesję (09:00 → 10:00 → 11:00 → między sesjami), bez ponownego pobierania scenariusza.
function shiftSession(D, now = Date.now()) {
  const start = getChatLiveStart(D, now);
  if (start === session.liveStart || !session.tl) return;
  session.liveStart = start;
  session.items = session.tl.map((e, i) => ({
    i, kind: e.m.kind, text: e.m.text, section: e.m.section,
    typingAt: start + e.typingAt, at: start + e.showAt
  }));
}
async function loadSession() {
  const day = warsawDay();
  if (session.ready && session.day === day) {
    if (window.CCTvDialogue) shiftSession(window.CCTvDialogue);
    return session;
  }
  await loadScript('/js/cc-tv-dialogue.js?v=20261019_tv6');
  const D = window.CCTvDialogue;
  if (!D) return session;
  try {
    const res = await fetch('/rozwazania_baza.json?d=' + day, { cache: 'no-cache' });
    const list = await res.json();
    const r = (Array.isArray(list) ? list : []).find((x) => x && x.date === day);
    // Wersja 4 (scenariusz TV z Noemi i Sarą) ma pierwszeństwo; zwykły tekst bez dialogu nie uruchamia sesji.
    const text = r ? (r.tvScript || r.scenariuszTV || r.wersjaTV || r.wersja4 || r.fullText || r.contentWeb || r.content || '') : '';
    const parsed = D.parse(text);
    const reduce = false;
    const tl = parsed.isDialogue ? D.timeline(parsed.messages, reduce) : [];
    session.day = day;
    session.title = r ? String(r.title || '') : '';
    session.tl = tl;
    session.liveStart = getChatLiveStart(D);
    session.items = tl.map((e, i) => ({
      i, kind: e.m.kind, text: e.m.text, section: e.m.section,
      typingAt: session.liveStart + e.typingAt, at: session.liveStart + e.showAt
    }));
    session.total = tl.length ? tl[tl.length - 1].endAt : 0;
    session.ready = true;
  } catch (_) { session.day = day; session.items = []; session.ready = true; }
  return session;
}
function presenterMessages(now = Date.now()) {
  return session.items.filter((m) => m.at <= now).map((m) => {
    const p = PRESENTER[m.kind] || PRESENTER.both;
    return { id: `cctv-${session.day}-${m.i}`, virtual: true, kind: m.kind, senderId: p.id, senderName: p.name, senderAvatar: p.avatar, text: m.text, at: m.at };
  });
}
function typingNow(now = Date.now()) {
  const m = session.items.find((x) => x.typingAt <= now && now < x.at);
  return m ? (PRESENTER[m.kind] || PRESENTER.both).name : '';
}
const sessionLive = (now = Date.now()) => session.total > 0 && now >= session.liveStart && now < session.liveStart + session.total;
// Object identity prevents UGC names/badges from impersonating a TV navigation target.
const publicPresenterMessages = new WeakSet();
const publicMessageRoom = (message) => publicPresenterMessages.has(message) ? 'tv_cctv24' : null;

// ── Czat ogólny: rozmowa prowadzących pojawia się także tutaj ────────────────
function hookPublicChat() {
  if (window._lumiLiveRoomsPublicHooked || typeof window.renderPublicChatMessages !== 'function') return;
  window._lumiLiveRoomsPublicHooked = true;
  const original = window.renderPublicChatMessages;
  window.renderPublicChatMessages = function (messages) {
    let merged = messages || [];
    try {
      const v = presenterMessages().map((m) => {
        const message = {
        id: m.id, senderId: m.senderId, senderName: m.senderName, senderAvatar: m.senderAvatar,
        senderBadge: (sessionLive() ? '🔴 NA ŻYWO · CCTV24' : '📺 Rozważanie · CCTV24'), text: m.text, type: 'text',
        timestamp: { seconds: Math.floor(m.at / 1000) }, createdAt: m.at, reactions: {}
        };
        publicPresenterMessages.add(message);
        return message;
      });
      if (v.length) {
        merged = merged.concat(v).sort((a, b) => (tsMs(a.timestamp) || a.createdAt || 0) - (tsMs(b.timestamp) || b.createdAt || 0));
      }
    } catch (_) {}
    return original.call(this, merged);
  };
  let shown = -1;
  setInterval(() => {
    if (window.CCTvDialogue) shiftSession(window.CCTvDialogue);
    const n = presenterMessages().length;
    if (n !== shown) {
      shown = n;
      try { window.renderPublicChatMessages(window._cachedPublicChatMessages || []); } catch (_) {}
    }
  }, 2000);
}

// ── Zakładka LIVE TV ─────────────────────────────────────────────────────────
const state = { fb: null, room: null, unsub: null, docs: [], tick: null, renderedSig: '' };

function styleTab(btn, active) {
  if (!btn) return;
  btn.style.background = active ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : 'transparent';
  btn.style.color = active ? '#fff' : '#94a3b8';
  btn.style.boxShadow = active ? '0 2px 8px rgba(239,68,68,0.35)' : 'none';
}

function injectUi() {
  const privBtn = $('tabBtnPrivateChat');
  const pubView = $('messengerPublicView');
  if (!privBtn || !pubView || $('tabBtnLiveTv')) return !!$('tabBtnLiveTv');
  const btn = el('button', {
    type: 'button', id: 'tabBtnLiveTv', 'aria-label': 'Pokoje LIVE TV',
    style: 'position:relative; flex:1; min-height:44px; min-width:44px; padding:0; border-radius:10px; border:none; background:transparent; color:#94a3b8; font-weight:800; font-family:inherit; font-size:0.8rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:0; transition:all 0.2s; touch-action:manipulation;',
    onclick: () => window.switchMessengerMainTab('livetv')
  }, el('span', { 'aria-hidden': 'true', text: '📺' }));
  privBtn.insertAdjacentElement('afterend', btn);

  const view = el('div', { id: 'messengerLiveView', style: 'display:none; flex-direction:column; flex:1; min-height:0;' });
  pubView.insertAdjacentElement('afterend', view);

  const css = el('style', { id: 'lumiLiveRoomsCss' });
  css.textContent = `
    #messengerLiveView .llr-list{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;background:rgba(0,0,0,.2)}
    #messengerLiveView .llr-card{display:flex;gap:12px;align-items:center;width:100%;text-align:left;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#fff;font:inherit;cursor:pointer;min-height:64px}
    #messengerLiveView .llr-card:hover,#messengerLiveView .llr-card:focus-visible{border-color:#f59e0b;outline:none}
    #messengerLiveView .llr-ico{font-size:1.6rem;width:44px;height:44px;display:grid;place-items:center;border-radius:12px;background:rgba(239,68,68,.15);flex-shrink:0}
    #messengerLiveView .llr-name{font-weight:800}#messengerLiveView .llr-desc{font-size:.75rem;color:#cbd5e1}
    #messengerLiveView .llr-live{display:inline-flex;align-items:center;gap:6px;font-size:.7rem;font-weight:800;color:#fecaca;background:rgba(239,68,68,.2);padding:2px 8px;border-radius:999px;margin-left:6px}
    #messengerLiveView .llr-live::before{content:'';width:7px;height:7px;border-radius:50%;background:#ef4444}
    #messengerLiveView .llr-head{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.08)}
    #messengerLiveView .llr-head button,#messengerLiveView .llr-head a{min-height:44px;min-width:44px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:transparent;color:#e2e8f0;font:inherit;font-size:.8rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0 10px;text-decoration:none}
    #messengerLiveView .llr-title{flex:1;font-weight:800;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #messengerLiveView .llr-box{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:8px;background:rgba(0,0,0,.2)}
    #messengerLiveView .llr-msg{display:flex;gap:8px;align-items:flex-end}
    #messengerLiveView .llr-msg.me{flex-direction:row-reverse}
    #messengerLiveView .llr-msg img{width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1.5px solid rgba(255,255,255,.25)}
    #messengerLiveView .llr-b{max-width:86%;padding:9px 13px;border-radius:16px 16px 16px 4px;background:rgba(255,255,255,.07);color:#fff;font-size:.86rem;line-height:1.45;white-space:pre-wrap;word-break:break-word;overflow:hidden}
    #messengerLiveView .llr-msg.me .llr-b{border-radius:16px 16px 4px 16px;background:linear-gradient(135deg,#a855f7,#06b6d4)}
    #messengerLiveView .llr-msg.host .llr-b{background:rgba(212,175,55,.16);border:1px solid rgba(212,175,55,.4)}
    #messengerLiveView .llr-msg.prayer .llr-b{border:1px solid rgba(252,211,77,.55)}
    #messengerLiveView .llr-meta{display:flex;justify-content:space-between;gap:8px;font-size:.66rem;color:rgba(255,255,255,.65);margin-top:4px}
    #messengerLiveView .llr-who{font-weight:800;font-size:.74rem;color:#f9a8d4;margin-bottom:2px}
    #messengerLiveView .llr-msg.host .llr-who{color:#fcd34d}
    #messengerLiveView .llr-del{background:none;border:none;color:#fca5a5;font:inherit;font-size:.66rem;cursor:pointer;min-height:32px}
    #messengerLiveView .llr-live-bar{margin:8px -13px -9px -13px;padding:6px 10px;background:linear-gradient(90deg,#dc2626,#991b1b);color:#ffffff;font-size:.72rem;font-weight:700;line-height:1.35;white-space:normal;word-break:normal;display:flex;align-items:center;gap:6px;border-top:1px solid rgba(255,255,255,.2);box-shadow:0 -1px 4px rgba(0,0,0,.15);letter-spacing:.1px;border-bottom-left-radius:inherit;border-bottom-right-radius:inherit}
    #messengerLiveView .llr-live-dot{width:7px;height:7px;border-radius:50%;background:#ffffff;box-shadow:0 0 6px rgba(255,255,255,.9);flex-shrink:0;display:inline-block;animation:llrPulse 1.8s infinite ease-in-out}
    @keyframes llrPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.85)}}
    #messengerLiveView .llr-note{align-self:center;text-align:center;font-size:.75rem;color:#cbd5e1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);padding:8px 14px;border-radius:12px;max-width:92%}
    #messengerLiveView .llr-sec{align-self:center;font-size:.7rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#fcd34d;background:rgba(212,175,55,.12);border:1px solid rgba(212,175,55,.35);padding:3px 12px;border-radius:999px}
    #messengerLiveView .llr-typing{font-size:.75rem;color:#fcd34d;padding:2px 16px 6px;min-height:18px}
    #messengerLiveView .llr-compose{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-top:1px solid rgba(255,255,255,.08)}
    #messengerLiveView .llr-row{display:flex;gap:8px;align-items:flex-end}
    #messengerLiveView textarea{flex:1;min-height:44px;max-height:120px;resize:none;border-radius:14px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;padding:10px 12px;font:inherit;font-size:16px}
    #messengerLiveView .llr-send{min-width:48px;min-height:44px;border-radius:12px;border:none;background:linear-gradient(135deg,#ef4444,#f59e0b);color:#fff;font-weight:800;cursor:pointer}
    #messengerLiveView .llr-check{display:flex;gap:8px;align-items:center;font-size:.75rem;color:#fde68a}
    #messengerLiveView .llr-err{font-size:.75rem;color:#fca5a5}
  `;
  document.head.appendChild(css);
  return true;
}

function hookTabs() {
  if (window._lumiLiveTabsHooked || typeof window.switchMessengerMainTab !== 'function') return false;
  window._lumiLiveTabsHooked = true;
  const original = window.switchMessengerMainTab;
  window.switchMessengerMainTab = function (tab, preserve) {
    const view = $('messengerLiveView');
    if (tab === 'livetv') {
      original.call(this, 'public', preserve);
      const pub = $('messengerPublicView');
      if (pub) pub.style.display = 'none';
      styleTab($('tabBtnPublicChat'), false);
      styleTab($('tabBtnLiveTv'), true);
      if (view) view.style.display = 'flex';
      openLive();
      return;
    }
    if (view) view.style.display = 'none';
    styleTab($('tabBtnLiveTv'), false);
    leaveRoom();
    return original.apply(this, arguments);
  };
  return true;
}

function currentUser() {
  const u = state.fb && state.fb.auth.currentUser;
  return u && !u.isAnonymous ? u : null;
}
function isAdmin() {
  try { return !!(window.LuminaDB && window.LuminaDB.isLuminaMasterAdmin && window.LuminaDB.isLuminaMasterAdmin()); } catch (_) { return false; }
}

async function openLive() {
  if (!state.fb) state.fb = await firebaseReady();
  await loadSession();
  if (state.room) renderRoom(); else renderList();
}

function renderList() {
  const view = $('messengerLiveView');
  if (!view) return;
  const live = sessionLive();
  const list = el('div', { class: 'llr-list', role: 'list' },
    el('div', { class: 'llr-note', text: '📺 Pokoje LIVE TV — rozmawiaj z innymi podczas transmisji. Rozważanie Noemi i Sary codziennie o 9:00; powtórka o 18:00 czasu polskiego.' }),
    LIVE_ROOMS.map((r) => el('button', { type: 'button', class: 'llr-card', role: 'listitem', onclick: () => enterRoom(r.id) },
      el('span', { class: 'llr-ico', 'aria-hidden': 'true', text: r.icon }),
      el('span', {},
        el('span', { class: 'llr-name', text: r.name }), (live && r.reflection) ? el('span', { class: 'llr-live', text: 'NA ŻYWO' }) : null,
        el('br'), el('span', { class: 'llr-desc', text: r.desc })))));
  view.replaceChildren(list);
}

function leaveRoom() {
  if (state.unsub) { try { state.unsub(); } catch (_) {} }
  if (state.tick) clearInterval(state.tick);
  state.unsub = null; state.tick = null; state.room = null; state.docs = []; state.renderedSig = '';
}

function enterRoom(roomId) {
  leaveRoom();
  const r = ROOM[roomId];
  if (!r) return;
  state.room = r;
  const view = $('messengerLiveView');
  const box = el('div', { class: 'llr-box', id: 'llrBox', role: 'log', 'aria-live': 'polite', 'aria-label': 'Wiadomości w pokoju ' + r.name });
  const typing = el('div', { class: 'llr-typing', id: 'llrTyping', 'aria-hidden': 'true' });
  const input = el('textarea', { id: 'llrInput', maxlength: '1000', rows: '1', placeholder: r.prayers ? 'Napisz modlitwę lub pozdrowienie…' : 'Napisz do widzów…', 'aria-label': 'Wiadomość w pokoju ' + r.name });
  const err = el('div', { class: 'llr-err', role: 'alert' });
  const prayer = r.prayers ? el('input', { type: 'checkbox', id: 'llrPrayer', checked: true }) : null;
  const send = async () => {
    err.textContent = '';
    const user = currentUser();
    const text = input.value.trim();
    if (!text) return;
    if (!user) { err.textContent = 'Zaloguj się, aby pisać w pokoju LIVE.'; return; }
    if (!state.fb) { err.textContent = 'Brak połączenia — spróbuj za chwilę.'; return; }
    const prof = (window.LuminaDB && window.LuminaDB.getCurrentProfile && window.LuminaDB.getCurrentProfile()) || {};
    try {
      await addDoc(collection(state.fb.db, 'lumina_live_rooms', r.id, 'messages'), {
        roomId: r.id, text: text.slice(0, 1000), senderAuthUid: user.uid,
        senderName: String(prof.name || user.displayName || 'Uczestnik LUMINA').slice(0, 80),
        senderAvatar: String(prof.avatar || user.photoURL || '/lumina_icon.jpg').slice(0, 500),
        kind: prayer && prayer.checked ? 'prayer' : 'text', createdAt: serverTimestamp()
      });
      input.value = '';
    } catch (e) { err.textContent = 'Nie udało się wysłać. Sprawdź, czy jesteś zalogowany.'; }
  };
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } });
  view.replaceChildren(
    el('div', { class: 'llr-head' },
      el('button', { type: 'button', 'aria-label': 'Wróć do listy pokoi', onclick: () => { leaveRoom(); renderList(); }, text: '←' }),
      el('span', { class: 'llr-title', text: r.icon + ' ' + r.name }),
      el('a', { href: r.url, target: '_blank', rel: 'noopener', text: 'Oglądaj ↗', 'aria-label': 'Otwórz transmisję ' + r.name })),
    box, typing,
    el('div', { class: 'llr-compose' },
      prayer ? el('label', { class: 'llr-check', for: 'llrPrayer' }, prayer, el('span', { text: '🙏 To modlitwa — pokaż ją na antenie „Zjednoczeni za Polskę”' })) : null,
      el('div', { class: 'llr-row' }, input, el('button', { type: 'button', class: 'llr-send', 'aria-label': 'Wyślij', onclick: send, text: '➤' })),
      err));

  if (state.fb) {
    const q = query(collection(state.fb.db, 'lumina_live_rooms', r.id, 'messages'), orderBy('createdAt', 'desc'), limit(80));
    state.unsub = onSnapshot(q, (snap) => {
      const docs = [];
      snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
      state.docs = docs;
      renderRoom(true);
    }, () => { renderRoom(true); });
  }
  state.tick = setInterval(() => renderRoom(false), 1000);
  renderRoom(true);
}

function renderRoom(force) {
  const r = state.room;
  const box = $('llrBox');
  if (!r || !box) return;
  if (window.CCTvDialogue) shiftSession(window.CCTvDialogue);
  const now = Date.now();
  const hosts = r.reflection ? presenterMessages(now) : [];
  const typingName = r.reflection ? typingNow(now) : '';
  const t = $('llrTyping');
  if (t) t.textContent = typingName ? `${typingName} pisze…` : '';
  const isLive = sessionLive(now);
  const sig = hosts.length + ':' + (isLive ? 'L' : 'R') + ':' + state.docs.map((d) => d.id + (d.createdAt ? 1 : 0)).join(',') + ':' + (now < session.liveStart ? Math.floor((session.liveStart - now) / 60000) : 'x');
  if (!force && sig === state.renderedSig) return;
  state.renderedSig = sig;
  const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 160;

  const me = currentUser();
  const admin = isAdmin();
  const userMsgs = state.docs.map((d) => ({ ...d, at: tsMs(d.createdAt) || now }));
  const all = hosts.concat(userMsgs).sort((a, b) => a.at - b.at);
  const nodes = [];
  if (r.reflection && session.items.length) {
    if (now < session.liveStart) {
      const mins = Math.ceil((session.liveStart - now) / 60000);
      nodes.push(el('div', { class: 'llr-note', text: `🔴 Dziś o 9:00 Noemi i Sara rozpoczną tu rozważanie na żywo${session.title ? ': „' + session.title + '”' : ''}. Start za ${mins >= 60 ? Math.floor(mins / 60) + ' h ' + (mins % 60) + ' min' : mins + ' min'}.` }));
    } else if (isLive) {
      nodes.push(el('div', { class: 'llr-note', text: `🔴 NA ŻYWO: rozważanie${session.title ? ' „' + session.title + '”' : ''}. Pisz śmiało — prowadzące i widzowie są z Tobą.` }));
    } else {
      const nextStart = window.CCTvDialogue && window.CCTvDialogue.todaySessionStarts ? window.CCTvDialogue.todaySessionStarts(now).find((s) => s > now) : null;
      const nextInfo = nextStart ? `Kolejna transmisja na żywo o ${hhmm(nextStart)}.` : 'Kolejne rozważanie na żywo jutro o 9:00.';
      nodes.push(el('div', { class: 'llr-note', text: `📺 Rozważanie Noemi i Sary${session.title ? ': „' + session.title + '”' : ''}. ${nextInfo} Pisz śmiało i dołącz z modlitwą!` }));
    }
  } else if (r.reflection) {
    nodes.push(el('div', { class: 'llr-note', text: 'Codziennie o 9:00 Noemi i Sara prowadzą tu rozważanie na żywo.' }));
  }
  if (r.prayers) nodes.push(el('div', { class: 'llr-note', text: '🙏 Modlitwy z tego pokoju pojawiają się na antenie /zapolske-live po kilku sekundach. Treści z linkami lub wulgaryzmami nie trafiają na antenę.' }));
  let lastSec = null;
  all.forEach((m) => {
    if (m.virtual) {
      const sec = session.items[Number(m.id.split('-').pop())]?.section;
      if (sec && sec !== lastSec) { lastSec = sec; nodes.push(el('div', { class: 'llr-sec', text: sec.replace(/\s*:\s*/, ' · ') })); }
    }
    const mine = !m.virtual && me && m.senderAuthUid === me.uid;
    const img = el('img', { src: m.senderAvatar || '/lumina_icon.jpg', alt: '', loading: 'lazy' });
    img.onerror = () => { img.onerror = null; img.src = '/lumina_icon.jpg'; };
    const del = (!m.virtual && (mine || admin)) ? el('button', { type: 'button', class: 'llr-del', text: 'Usuń', 'aria-label': 'Usuń wiadomość', onclick: async () => {
      try { await deleteDoc(doc(state.fb.db, 'lumina_live_rooms', r.id, 'messages', m.id)); } catch (_) {}
    } }) : null;
    const liveBar = !m.virtual ? el('div', { class: 'llr-live-bar', role: 'status', 'aria-label': 'Potwierdzenie nadania w programie na żywo' },
      el('span', { class: 'llr-live-dot', 'aria-hidden': 'true' }),
      el('span', { class: 'llr-live-text', text: 'Twoja wiadomość została opublikowana w programie na żywo CCTV LIVE 24.' })
    ) : null;
    nodes.push(el('div', { class: 'llr-msg' + (mine ? ' me' : '') + (m.virtual ? ' host' : '') + (m.kind === 'prayer' ? ' prayer' : '') },
      img,
      el('div', { class: 'llr-b' },
        el('div', { class: 'llr-who', text: (m.virtual ? '🎙️ ' : (m.kind === 'prayer' ? '🙏 ' : '')) + (mine ? 'Ty' : (m.senderName || 'Uczestnik')) }),
        el('div', { text: m.text || '' }),
        el('div', { class: 'llr-meta' }, el('span', { text: hhmm(m.at) }), del),
        liveBar)));
  });
  if (!all.length && !(r.reflection && session.items.length && now < session.liveStart)) nodes.push(el('div', { class: 'llr-note', text: 'Bądź pierwszy — przywitaj się z widzami! 👋' }));
  box.replaceChildren(...nodes);
  if (force || nearBottom) box.scrollTop = box.scrollHeight;
}

// ── Start ────────────────────────────────────────────────────────────────────
async function boot() {
  for (let i = 0; i < 80; i++) {
    const ok = injectUi() && hookTabs();
    if (ok) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  hookPublicChat();
  await loadSession();
  try { window.renderPublicChatMessages && window._cachedPublicChatMessages && window.renderPublicChatMessages(window._cachedPublicChatMessages); } catch (_) {}
  // Co 30 s: nowa doba → nowy scenariusz; kolejna sesja tego dnia (np. 11:00) → przesunięcie osi czasu.
  setInterval(() => { if (warsawDay() !== session.day) session.ready = false; loadSession(); }, 30000);
  // /mess?room=tv_zapolske otwiera od razu wskazany pokój.
  try {
    const want = new URLSearchParams(location.search).get('room');
    if (want && ROOM[want]) {
      const wait = setInterval(() => {
        if (typeof window.openDirectMessagesModal === 'function' && $('tabBtnLiveTv')) {
          clearInterval(wait);
          try { window.openDirectMessagesModal('public'); } catch (_) {}
          window.switchMessengerMainTab('livetv');
          setTimeout(() => enterRoom(want), 300);
        }
      }, 300);
      setTimeout(() => clearInterval(wait), 15000);
    }
  } catch (_) {}
}

window.LumiLiveRooms = { LIVE_ROOMS, publicMessageRoom, enterRoom: (id) => { window.switchMessengerMainTab('livetv'); setTimeout(() => enterRoom(id), 200); }, session: () => session };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
