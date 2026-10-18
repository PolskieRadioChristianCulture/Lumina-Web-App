/**
 * LUMI KIDS — zamknięty pilotaż rodzinny (Strażnik Claude, 2026-10-18)
 *
 * Bezpieczeństwo egzekwują reguły Firestore po stronie serwera (kolekcje kids_*).
 * Ten plik tylko wyświetla to, na co reguły pozwolą. Nie zawiera żadnych adresów
 * dzieci ani haseł. Hasło ustawia użytkownik w Firebase Auth (bezpieczne haszowanie
 * po stronie Google). Treści wiadomości nie są nigdzie logowane.
 */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendEmailVerification, sendPasswordResetEmail, signOut, GoogleAuthProvider, signInWithPopup, reload
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, orderBy, limit, getDocs,
  onSnapshot, addDoc, serverTimestamp, deleteField
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Flaga funkcjonalna po stronie klienta. Właściwa flaga to kids_pilot/config.enabled (serwer).
const LUMI_KIDS_PILOT_ENABLED = true;

const CONFIG = {
  apiKey: 'AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M',
  authDomain: 'lumina-cc.firebaseapp.com',
  projectId: 'lumina-cc',
  storageBucket: 'lumina-cc.firebasestorage.app',
  messagingSenderId: '413985877183',
  appId: '1:413985877183:web:b0c99a686a4fb1b875aa0a'
};
// Opiekunowie = konta Master Admin (ta sama lista co w regułach). Reguły i tak sprawdzają to po stronie serwera.
const GUARDIAN_EMAILS = ['nazirczarkes@gmail.com', 'radiochristianculture@gmail.com', 'czarekrogowski3@gmail.com',
  'polskieradiocc@gmail.com', 'studiodees7@gmail.com', 'polskiercctv@gmail.com'];
const EMOJI = ['❤️', '👍', '😊', '😂', '🙏', '👏', '😮', '😢'];
const APP_URL = location.origin + '/lumi-kids/app/';

const app = getApps().length ? getApp() : initializeApp(CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
const main = document.getElementById('app');
const logoutBtn = document.getElementById('logoutBtn');
const motionBtn = document.getElementById('motionBtn');

let unsubs = [];
let me = null;
let cfg = null;
let names = {};
let activeConv = null;

// ── Pomocnicze ───────────────────────────────────────────────────────────────
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return el;
}
function clearSubs() { unsubs.forEach(u => { try { u(); } catch (e) {} }); unsubs = []; }
function render(...nodes) { main.replaceChildren(...nodes); main.focus({ preventScroll: true }); }
function note(text, kind = 'info') { return h('p', { class: 'msg ' + kind, role: kind === 'err' ? 'alert' : 'status', text }); }
function toast(text) {
  const t = h('div', { class: 'toast', role: 'status', text });
  document.body.append(t); setTimeout(() => t.remove(), 3500);
}
function initial(name) { return (String(name || '?').trim()[0] || '?').toUpperCase(); }
function avatar(name, small) { return h('span', { class: 'avatar' + (small ? ' sm' : ''), 'aria-hidden': 'true', text: initial(name) }); }
function isGuardian(u) { return !!(u && u.emailVerified && GUARDIAN_EMAILS.includes(String(u.email || '').toLowerCase())); }
function friendly(err) {
  const c = (err && err.code) || '';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found')) return 'Nieprawidłowy e-mail lub hasło.';
  if (c.includes('email-already-in-use')) return 'To konto już istnieje. Zaloguj się albo użyj „Nie pamiętam hasła”.';
  if (c.includes('weak-password')) return 'Hasło jest za słabe — użyj co najmniej 10 znaków.';
  if (c.includes('too-many-requests')) return 'Zbyt wiele prób. Odczekaj chwilę.';
  if (c.includes('permission-denied')) return 'Brak dostępu.';
  if (c.includes('network')) return 'Brak połączenia z internetem.';
  if (c.includes('popup')) return 'Okno logowania zostało zamknięte.';
  return 'Coś poszło nie tak. Spróbuj ponownie.';
}
function busy(btn, on) { if (btn) { btn.disabled = on; btn.setAttribute('aria-busy', on ? 'true' : 'false'); } }
function convId(childUid, contactUid) { return childUid + '_' + contactUid; }
function fmtTime(ts) {
  const d = ts && typeof ts.toDate === 'function' ? ts.toDate() : null;
  if (!d) return 'teraz';
  const today = new Date().toDateString() === d.toDateString();
  return (today ? '' : d.toLocaleDateString('pl-PL') + ' ') + d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}
function lastSeenKey(cid) { return 'lumikids.seen.' + (me ? me.uid : '') + '.' + cid; }
function getSeen(cid) { try { return Number(localStorage.getItem(lastSeenKey(cid)) || 0); } catch (e) { return 0; } }
function setSeen(cid, ms) { try { localStorage.setItem(lastSeenKey(cid), String(ms)); } catch (e) {} }

// Animacje można wyłączyć (WCAG 2.2 — 2.3.3).
(function motion() {
  let off = false;
  try { off = localStorage.getItem('lumikids.noMotion') === '1'; } catch (e) {}
  const apply = () => { document.body.classList.toggle('no-motion', off); motionBtn.setAttribute('aria-pressed', String(off)); motionBtn.textContent = off ? '⏸' : '✨'; motionBtn.title = off ? 'Włącz animacje' : 'Wyłącz animacje'; motionBtn.setAttribute('aria-label', motionBtn.title); };
  motionBtn.addEventListener('click', () => { off = !off; try { localStorage.setItem('lumikids.noMotion', off ? '1' : '0'); } catch (e) {} apply(); });
  apply();
})();
logoutBtn.addEventListener('click', async () => { clearSubs(); await signOut(auth); });

// ── Ekrany logowania ─────────────────────────────────────────────────────────
function screenLogin(msg) {
  const email = h('input', { type: 'email', id: 'em', autocomplete: 'username', required: true, inputmode: 'email' });
  const pass = h('input', { type: 'password', id: 'pw', autocomplete: 'current-password', required: true });
  const btn = h('button', { class: 'btn primary block', type: 'submit', text: 'Zaloguj się' });
  const out = h('div');
  const form = h('form', { novalidate: true, onsubmit: async (e) => {
    e.preventDefault(); out.replaceChildren(); busy(btn, true);
    try { await signInWithEmailAndPassword(auth, email.value.trim(), pass.value); }
    catch (err) { out.replaceChildren(note(friendly(err), 'err')); }
    finally { busy(btn, false); pass.value = ''; }
  } }, h('label', { for: 'em', text: 'E-mail' }), email, h('label', { for: 'pw', text: 'Hasło' }), pass, btn, out);
  render(h('section', { class: 'card pop' },
    h('h1', { text: 'Witaj w LUMI KIDS 👋' }),
    h('p', { class: 'muted', text: 'Bezpieczne rozmowy tylko z bliskimi, których zatwierdził rodzic.' }),
    msg ? note(msg, 'info') : null,
    form,
    h('div', { class: 'links' },
      h('button', { class: 'link', type: 'button', text: 'Mam zaproszenie — pierwsze logowanie', onclick: () => screenRegister() }),
      h('button', { class: 'link', type: 'button', text: 'Nie pamiętam hasła / chcę ustawić nowe', onclick: () => screenReset(email.value) }),
      h('button', { class: 'link', type: 'button', text: 'Jestem rodzicem — logowanie Google', onclick: async () => {
        try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (err) { out.replaceChildren(note(friendly(err), 'err')); }
      } })
    )
  ));
}

function screenRegister() {
  const email = h('input', { type: 'email', id: 'rem', autocomplete: 'username', required: true, inputmode: 'email' });
  const p1 = h('input', { type: 'password', id: 'rp1', autocomplete: 'new-password', required: true, minlength: '10', 'aria-describedby': 'rhint' });
  const p2 = h('input', { type: 'password', id: 'rp2', autocomplete: 'new-password', required: true, minlength: '10' });
  const btn = h('button', { class: 'btn primary block', type: 'submit', text: 'Utwórz hasło i wyślij link potwierdzający' });
  const out = h('div');
  const form = h('form', { novalidate: true, onsubmit: async (e) => {
    e.preventDefault(); out.replaceChildren();
    if (p1.value.length < 10) { out.replaceChildren(note('Hasło musi mieć co najmniej 10 znaków.', 'err')); return; }
    if (p1.value !== p2.value) { out.replaceChildren(note('Hasła nie są takie same.', 'err')); return; }
    busy(btn, true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.value.trim(), p1.value);
      await sendEmailVerification(cred.user, { url: APP_URL });
    } catch (err) { out.replaceChildren(note(friendly(err), 'err')); }
    finally { busy(btn, false); p1.value = ''; p2.value = ''; }
  } },
    h('label', { for: 'rem', text: 'Adres e-mail z zaproszenia' }), email,
    h('label', { for: 'rp1', text: 'Nowe hasło' }), p1,
    h('p', { id: 'rhint', class: 'muted small', text: 'Co najmniej 10 znaków. Hasła nie widzi nikt — ani rodzic, ani administrator.' }),
    h('label', { for: 'rp2', text: 'Powtórz hasło' }), p2, btn, out);
  render(h('section', { class: 'card pop' },
    h('h1', { text: 'Pierwsze logowanie' }),
    h('p', { class: 'muted', text: 'Działa tylko dla adresu, który rodzic zaprosił w panelu. Potem potwierdź adres linkiem z poczty.' }),
    form,
    h('div', { class: 'links' },
      h('button', { class: 'link', type: 'button', text: '← Wróć do logowania', onclick: () => screenLogin() }),
      h('button', { class: 'link', type: 'button', text: 'Konto już istnieje — ustaw nowe hasło', onclick: () => screenReset(email.value) }))
  ));
}

function screenReset(prefill) {
  const email = h('input', { type: 'email', id: 'xem', autocomplete: 'username', required: true, value: prefill || '' });
  const btn = h('button', { class: 'btn primary block', type: 'submit', text: 'Wyślij link do ustawienia hasła' });
  const out = h('div');
  render(h('section', { class: 'card pop' },
    h('h1', { text: 'Ustaw nowe hasło' }),
    h('p', { class: 'muted', text: 'Wyślemy bezpieczny link. Nowe hasło wpiszesz na stronie Firebase (Google) — nie trafia ono do nas.' }),
    h('form', { novalidate: true, onsubmit: async (e) => {
      e.preventDefault(); busy(btn, true);
      try { await sendPasswordResetEmail(auth, email.value.trim(), { url: APP_URL }); } catch (err) { /* ta sama odpowiedź — bez ujawniania, czy konto istnieje */ }
      busy(btn, false);
      out.replaceChildren(note('Jeśli to konto istnieje, link jest już w skrzynce pocztowej (sprawdź też SPAM).', 'good'));
    } }, h('label', { for: 'xem', text: 'E-mail' }), email, btn, out),
    h('div', { class: 'links' }, h('button', { class: 'link', type: 'button', text: '← Wróć do logowania', onclick: () => screenLogin() }))
  ));
}

function screenVerify(user) {
  const out = h('div');
  const again = h('button', { class: 'btn ghost', type: 'button', text: 'Wyślij link ponownie', onclick: async () => {
    try { await sendEmailVerification(user, { url: APP_URL }); out.replaceChildren(note('Wysłano ponownie.', 'good')); } catch (err) { out.replaceChildren(note(friendly(err), 'err')); }
  } });
  const done = h('button', { class: 'btn primary', type: 'button', text: 'Potwierdziłem — dalej', onclick: async () => {
    await reload(user); await user.getIdToken(true);
    if (user.emailVerified) start(user); else out.replaceChildren(note('Adres nie jest jeszcze potwierdzony. Kliknij link w wiadomości e-mail.', 'info'));
  } });
  render(h('section', { class: 'card center pop' },
    h('div', { style: 'font-size:3rem', 'aria-hidden': 'true', text: '📬' }),
    h('h1', { text: 'Sprawdź pocztę' }),
    h('p', { text: 'Wysłaliśmy link potwierdzający adres. Kliknij go, a potem wróć tutaj.' }),
    h('div', { class: 'row', style: 'justify-content:center' }, done, again), out));
}

// ── Start po zalogowaniu ─────────────────────────────────────────────────────
async function loadConfig() {
  try { const s = await getDoc(doc(db, 'kids_pilot/config')); return s.exists() ? s.data() : null; }
  catch (e) { return undefined; } // brak uprawnień
}

async function tryClaimInvite(user) {
  const email = String(user.email || '').toLowerCase();
  const snap = await getDocs(query(collection(db, 'kids_invites'), where('email', '==', email), limit(5)));
  for (const d of snap.docs) {
    if (d.data().status === 'pending') {
      await updateDoc(d.ref, { status: 'claimed', claimedUid: user.uid, claimedAt: serverTimestamp() });
      return 'claimed';
    }
    if (d.data().status === 'claimed' && d.data().claimedUid === user.uid) return 'waiting';
  }
  return 'none';
}

async function start(user) {
  clearSubs(); me = user; logoutBtn.hidden = false;
  if (!LUMI_KIDS_PILOT_ENABLED) { render(h('section', { class: 'card', }, note('Pilotaż jest wyłączony.', 'info'))); return; }
  if (isGuardian(user)) return screenParent();
  const isPwd = user.providerData.some(p => p.providerId === 'password');
  if (isPwd && !user.emailVerified) return screenVerify(user);
  cfg = await loadConfig();
  if (cfg && cfg.enabled && cfg.childUid === user.uid) return screenChild();
  if (cfg && cfg.enabled && Array.isArray(cfg.contacts) && cfg.contacts.includes(user.uid)) return screenContact();
  // Może to dziecko z zaproszeniem, jeszcze niezatwierdzone przez rodzica:
  let state = 'none';
  if (isPwd && user.emailVerified) { try { state = await tryClaimInvite(user); } catch (e) { state = 'none'; } }
  if (state === 'claimed' || state === 'waiting') {
    render(h('section', { class: 'card center pop' },
      h('div', { style: 'font-size:3rem', 'aria-hidden': 'true', text: '⏳' }),
      h('h1', { text: 'Prawie gotowe!' }),
      h('p', { text: 'Zaproszenie przyjęte. Teraz rodzic musi zatwierdzić Twoje konto w panelu rodzica.' }),
      h('button', { class: 'btn primary', type: 'button', text: 'Sprawdź ponownie', onclick: () => start(user) })));
    return;
  }
  render(h('section', { class: 'card center pop' },
    h('div', { style: 'font-size:3rem', 'aria-hidden': 'true', text: '🔒' }),
    h('h1', { text: 'Brak dostępu do LUMI KIDS' }),
    h('p', { class: 'muted', text: 'LUMI KIDS to zamknięty pilotaż rodzinny. Dostęp daje wyłącznie rodzic.' }),
    h('p', { class: 'small', text: 'Jeśli rodzic chce dodać Cię jako zaufany kontakt, przekaż mu ten identyfikator:' }),
    h('p', {}, h('code', { text: user.uid }), ' ', h('button', { class: 'btn ghost', type: 'button', text: 'Kopiuj', onclick: async () => { try { await navigator.clipboard.writeText(user.uid); toast('Skopiowano'); } catch (e) { toast('Zaznacz i skopiuj ręcznie'); } } })),
    h('a', { class: 'btn ghost', href: '/lumi-kids/', text: 'O LUMI KIDS' })));
}

// ── Nazwy w obrębie pilotażu ─────────────────────────────────────────────────
async function loadNames(uids) {
  await Promise.all(uids.filter(u => !(u in names)).map(async (u) => {
    try { const s = await getDoc(doc(db, 'kids_profiles', u)); names[u] = s.exists() ? (s.data().displayName || '') : ''; }
    catch (e) { names[u] = ''; }
  }));
}
function nameOf(uid, fallback) { return names[uid] || fallback || 'Bliska osoba'; }

// ── Widok dziecka ────────────────────────────────────────────────────────────
async function screenChild() {
  const contacts = (cfg.contacts || []).filter(u => u !== me.uid);
  await loadNames([me.uid, ...contacts]);
  const list = h('ul', { class: 'contacts', 'aria-label': 'Moje zatwierdzone kontakty' });
  const counters = {};
  for (const c of contacts) {
    const cnt = h('span', { class: 'count', hidden: true, 'aria-label': 'nowe wiadomości' });
    counters[c] = cnt;
    list.append(h('li', {}, h('button', { class: 'contact', type: 'button', onclick: () => openChat(me.uid, c, nameOf(c, 'Rodzic'), screenChild) },
      avatar(nameOf(c, 'Rodzic'), true), h('span', { class: 'name', text: nameOf(c, 'Rodzic') }), h('span', { class: 'badge', text: '✓ Zatwierdzony' }), cnt)));
  }
  render(
    h('section', { class: 'card pop' },
      h('div', { class: 'who' }, avatar(nameOf(me.uid, 'Ja')),
        h('div', {}, h('h1', { text: 'Cześć, ' + nameOf(me.uid, 'kolego') + '!' }), h('span', { class: 'badge', text: '🛡️ Za zgodą rodzica' })))),
    h('section', { class: 'card' }, h('h2', { text: 'Moje kontakty' }),
      contacts.length ? list : note('Rodzic jeszcze nie dodał kontaktów.', 'info')),
    h('button', { class: 'btn help block', type: 'button', text: '🛟 Potrzebuję pomocy', onclick: () => helpDialog(contacts[0]) })
  );
  for (const c of contacts) watchUnread(convId(me.uid, c), counters[c]);
}

function helpDialog(firstContact) {
  render(h('section', { class: 'card center pop' },
    h('div', { style: 'font-size:3rem', 'aria-hidden': 'true', text: '💜' }),
    h('h1', { text: 'Potrzebujesz pomocy?' }),
    h('p', { text: 'Jeśli coś Cię niepokoi albo ktoś sprawił, że czujesz się źle — powiedz rodzicowi lub innej zaufanej osobie dorosłej. Zawsze możesz napisać do rodzica.' }),
    h('p', { class: 'muted small', text: 'W nagłej sytuacji zadzwoń pod 112. Telefon zaufania dla dzieci i młodzieży: 116 111 (bezpłatny).' }),
    firstContact ? h('button', { class: 'btn primary block', type: 'button', text: 'Napisz do rodzica', onclick: () => openChat(me.uid, firstContact, nameOf(firstContact, 'Rodzic'), screenChild) }) : null,
    h('button', { class: 'btn ghost block', type: 'button', text: '← Wróć', onclick: () => screenChild() })));
}

// Powiadomienia w aplikacji: licznik nieprzeczytanych (dla tego urządzenia).
function watchUnread(cid, el) {
  const q = query(collection(db, 'kids_conversations', cid, 'messages'), orderBy('createdAt', 'desc'), limit(30));
  let first = true;
  unsubs.push(onSnapshot(q, (snap) => {
    const seen = getSeen(cid);
    let n = 0;
    snap.forEach(d => { const m = d.data(); const ms = m.createdAt && m.createdAt.toMillis ? m.createdAt.toMillis() : 0; if (m.senderUid !== me.uid && ms > seen) n++; });
    if (el) { el.hidden = n === 0; el.textContent = n > 9 ? '9+' : String(n); }
    if (!first && n > 0 && activeConv !== cid) toast('💬 Nowa wiadomość');
    first = false;
    document.title = (n > 0 ? '(' + n + ') ' : '') + 'LUMI KIDS';
  }, () => { if (el) el.hidden = true; }));
}

// ── Widok zatwierdzonego kontaktu (np. mama) ─────────────────────────────────
async function screenContact() {
  await loadNames([cfg.childUid, me.uid]);
  const childName = nameOf(cfg.childUid, 'Dziecko');
  render(h('section', { class: 'card pop' },
    h('h1', { text: 'LUMI KIDS' }),
    h('p', { class: 'muted', text: 'Jesteś zatwierdzonym kontaktem.' }),
    h('button', { class: 'contact', type: 'button', onclick: () => openChat(cfg.childUid, me.uid, childName, screenContact) },
      avatar(childName, true), h('span', { class: 'name', text: childName }), h('span', { class: 'badge', text: 'Rozmowa' }))));
}

// ── Czat 1:1 ─────────────────────────────────────────────────────────────────
async function ensureConv(childUid, contactUid) {
  const cid = convId(childUid, contactUid);
  const ref = doc(db, 'kids_conversations', cid);
  try { const s = await getDoc(ref); if (s.exists()) return cid; } catch (e) { /* może nie istnieć */ }
  await setDoc(ref, { participants: [childUid, contactUid], createdAt: serverTimestamp() });
  return cid;
}

async function openChat(childUid, contactUid, title, back) {
  clearSubs();
  let cid;
  try { cid = await ensureConv(childUid, contactUid); }
  catch (e) { render(h('section', { class: 'card' }, note(friendly(e), 'err'), h('button', { class: 'btn ghost', type: 'button', text: '← Wróć', onclick: () => back() }))); return; }
  activeConv = cid;
  let replyTo = null;
  const listEl = h('div', { class: 'list', role: 'log', 'aria-label': 'Wiadomości', 'aria-live': 'polite' });
  const text = h('textarea', { id: 'msg', rows: '1', maxlength: '1000', placeholder: 'Napisz wiadomość…', 'aria-label': 'Treść wiadomości' });
  const replyBox = h('div', { class: 'replying', hidden: true });
  const sendBtn = h('button', { class: 'btn primary', type: 'submit', 'aria-label': 'Wyślij', text: '➤' });
  const err = h('div');
  const form = h('form', { class: 'composer', onsubmit: async (e) => {
    e.preventDefault();
    const t = text.value.trim(); if (!t) return;
    busy(sendBtn, true); err.replaceChildren();
    const data = { senderUid: me.uid, text: t.slice(0, 1000), createdAt: serverTimestamp(), reactions: {} };
    if (replyTo) data.replyTo = replyTo;
    try { await addDoc(collection(db, 'kids_conversations', cid, 'messages'), data); text.value = ''; setReply(null); }
    catch (e2) { err.replaceChildren(note(friendly(e2), 'err')); }
    finally { busy(sendBtn, false); text.focus(); }
  } }, replyBox, h('div', { class: 'row' }, text, sendBtn), err);
  text.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });

  function setReply(r) {
    replyTo = r;
    replyBox.hidden = !r;
    replyBox.replaceChildren();
    if (r) replyBox.append(h('strong', { text: '↩︎' }), h('span', { text: r.text }), h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Anuluj odpowiedź', text: '✕', onclick: () => setReply(null) }));
  }

  render(h('section', { class: 'card chat pop' },
    h('div', { class: 'chat-head' },
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Wróć', text: '←', onclick: () => { activeConv = null; clearSubs(); back(); } }),
      avatar(title, true), h('span', { class: 'title', text: title })),
    listEl, form));

  const q = query(collection(db, 'kids_conversations', cid, 'messages'), orderBy('createdAt', 'asc'), limit(300));
  unsubs.push(onSnapshot(q, (snap) => {
    const atBottom = listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight < 80;
    listEl.replaceChildren();
    let newest = 0;
    snap.forEach((d) => {
      const m = d.data();
      const mine = m.senderUid === me.uid;
      const ms = m.createdAt && m.createdAt.toMillis ? m.createdAt.toMillis() : Date.now();
      newest = Math.max(newest, ms);
      const reacts = Object.values(m.reactions || {});
      const myR = (m.reactions || {})[me.uid];
      const acts = h('div', { class: 'acts' },
        h('button', { type: 'button', 'aria-label': 'Odpowiedz z cytatem', title: 'Odpowiedz', text: '↩︎', onclick: () => { setReply({ id: d.id, text: String(m.text || '').slice(0, 200), senderUid: m.senderUid }); text.focus(); } }),
        ...EMOJI.slice(0, 5).map(e => h('button', { type: 'button', 'aria-pressed': String(myR === e), 'aria-label': 'Reakcja ' + e, text: e, onclick: async () => {
          try { await updateDoc(d.ref, { ['reactions.' + me.uid]: myR === e ? deleteField() : e }); } catch (e3) { toast(friendly(e3)); }
        } })));
      listEl.append(h('div', { class: 'b' + (mine ? ' me' : '') },
        m.replyTo ? h('div', { class: 'quote', text: m.replyTo.text }) : null,
        h('div', { text: m.text }),
        h('div', { class: 'meta' }, h('span', { text: (mine ? 'Ja' : title) + ' · ' + fmtTime(m.createdAt) }), reacts.length ? h('span', { class: 'reacts', 'aria-label': 'Reakcje', text: reacts.join(' ') }) : null),
        acts));
    });
    if (!snap.size) listEl.append(h('p', { class: 'muted center', text: 'Napisz pierwszą wiadomość 👋' }));
    setSeen(cid, newest || Date.now());
    if (atBottom || snap.docChanges().some(c => c.type === 'added')) listEl.scrollTop = listEl.scrollHeight;
  }, (e) => {
    // Odebranie dostępu (reguły) zamyka rozmowę natychmiast.
    clearSubs(); activeConv = null;
    render(h('section', { class: 'card center' }, h('div', { style: 'font-size:3rem', 'aria-hidden': 'true', text: '🔒' }),
      h('h1', { text: 'Rozmowa jest niedostępna' }), h('p', { class: 'muted', text: 'Rodzic zmienił ustawienia dostępu.' }),
      h('button', { class: 'btn primary', type: 'button', text: 'Odśwież', onclick: () => start(me) })));
  }));
  // Na bieżąco obserwuj konfigurację: cofnięcie dostępu zamyka widok także bez nowych wiadomości.
  if (!isGuardian(me)) {
    unsubs.push(onSnapshot(doc(db, 'kids_pilot/config'), (s) => {
      const c = s.exists() ? s.data() : null;
      const ok = c && c.enabled && c.childUid && (c.childUid === me.uid || (c.contacts || []).includes(me.uid));
      if (!ok) { clearSubs(); activeConv = null; start(me); }
    }, () => { clearSubs(); activeConv = null; start(me); }));
  }
  text.focus();
}

// ── Panel rodzica ────────────────────────────────────────────────────────────
async function screenParent() {
  clearSubs();
  const ref = doc(db, 'kids_pilot/config');
  let c = null;
  try { const s = await getDoc(ref); c = s.exists() ? s.data() : null; } catch (e) { render(h('section', { class: 'card' }, note('Brak uprawnień opiekuna (reguły LUMI KIDS nie są jeszcze wdrożone albo konto nie jest potwierdzone).', 'err'))); return; }
  if (!c) c = { enabled: false, childUid: '', contacts: [me.uid] };
  if (!Array.isArray(c.contacts)) c.contacts = [];
  cfg = c;
  const save = async (patch, msg) => {
    try { await setDoc(ref, { ...cfg, ...patch, updatedAt: serverTimestamp(), updatedBy: me.uid }); toast(msg || 'Zapisano'); screenParent(); }
    catch (e) { toast(friendly(e)); }
  };
  await loadNames([me.uid, c.childUid, ...c.contacts].filter(Boolean));

  // Moja nazwa widoczna dla dziecka
  const myName = h('input', { type: 'text', id: 'myname', maxlength: '40', value: names[me.uid] || 'Tata' });
  const childName = h('input', { type: 'text', id: 'childname', maxlength: '40', value: names[c.childUid] || 'Dawidek' });

  // Zaproszenia
  const invEmail = h('input', { type: 'email', id: 'invemail', autocomplete: 'off' });
  const invTable = h('tbody');
  try {
    const inv = await getDocs(query(collection(db, 'kids_invites'), limit(20)));
    inv.forEach((d) => {
      const v = d.data();
      const approve = v.status === 'claimed' && v.claimedUid !== c.childUid
        ? h('button', { class: 'btn ok', type: 'button', text: 'Zatwierdź konto dziecka', onclick: async () => {
            await save({ childUid: v.claimedUid, enabled: true, contacts: Array.from(new Set([...(c.contacts || []), me.uid])) }, 'Konto dziecka zatwierdzone');
            try { await setDoc(doc(db, 'kids_profiles', v.claimedUid), { displayName: childName.value.trim() || 'Dziecko', updatedAt: serverTimestamp() }); } catch (e) {}
          } })
        : null;
      const cancel = v.status === 'pending' ? h('button', { class: 'btn ghost', type: 'button', text: 'Anuluj', onclick: async () => { await updateDoc(d.ref, { status: 'revoked' }); screenParent(); } }) : null;
      invTable.append(h('tr', {}, h('td', { text: v.email }), h('td', { text: { pending: 'czeka na pierwsze logowanie', claimed: 'przyjęte — czeka na Twoje zatwierdzenie', revoked: 'anulowane' }[v.status] || v.status }), h('td', {}, approve, cancel)));
    });
  } catch (e) { invTable.append(h('tr', {}, h('td', { colspan: '3', text: 'Nie udało się wczytać zaproszeń.' }))); }

  // Zgłoszenia rodzin do pilotażu
  const waitBody = h('tbody');
  try {
    const ws = await getDocs(query(collection(db, 'kids_waitlist'), limit(100)));
    const rows = ws.docs.map(d => ({ ref: d.ref, ...d.data() })).sort((a, b) => ((b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0)));
    for (const w of rows) {
      waitBody.append(h('tr', {},
        h('td', {}, h('strong', { text: w.parentName || '' }), h('br'), h('a', { href: 'mailto:' + encodeURIComponent(w.email || '').replace('%40', '@'), text: w.email || '' })),
        h('td', { text: String(w.childrenCount || '') }),
        h('td', { text: w.message || '—' }),
        h('td', { text: (w.createdAt && w.createdAt.toDate ? w.createdAt.toDate().toLocaleDateString('pl-PL') : '') + (w.status === 'seen' ? ' · przejrzane' : '') },
          w.status !== 'seen' ? h('button', { class: 'btn ghost', type: 'button', text: 'Przejrzane', onclick: async () => { try { await updateDoc(w.ref, { status: 'seen' }); screenParent(); } catch (e) { toast(friendly(e)); } } }) : null)));
    }
    if (!rows.length) waitBody.append(h('tr', {}, h('td', { colspan: '4', text: 'Brak zgłoszeń.' })));
  } catch (e) { waitBody.append(h('tr', {}, h('td', { colspan: '4', text: 'Nie udało się wczytać zgłoszeń.' }))); }

  const contactUid = h('input', { type: 'text', id: 'cuid', autocomplete: 'off', placeholder: 'identyfikator konta (UID)' });
  const contactsList = h('ul', { class: 'contacts' });
  for (const u of c.contacts) {
    contactsList.append(h('li', { class: 'contact' }, avatar(nameOf(u, u === me.uid ? 'Ja' : 'Kontakt'), true),
      h('span', { class: 'name', text: nameOf(u, u === me.uid ? 'Ja (rodzic)' : 'Kontakt') + (u === me.uid ? ' — Ty' : '') }),
      u !== me.uid ? h('button', { class: 'btn ghost', type: 'button', text: 'Usuń', onclick: () => save({ contacts: c.contacts.filter(x => x !== u) }, 'Kontakt usunięty — dostęp cofnięty natychmiast') }) : null));
  }

  const status = c.enabled && c.childUid ? note('Pilotaż AKTYWNY — dziecko ma dostęp do rozmów z zatwierdzonymi kontaktami.', 'good')
    : note(c.childUid ? 'Pilotaż WSTRZYMANY — dziecko nie ma teraz dostępu.' : 'Brak zatwierdzonego konta dziecka. Wyślij zaproszenie poniżej.', 'info');

  render(
    h('section', { class: 'card pop' },
      h('div', { class: 'who' }, h('span', { class: 'avatar', 'aria-hidden': 'true', text: '👪' }), h('div', {}, h('h1', { text: 'Panel rodzica' }), h('p', { class: 'muted', text: 'Masz pełną kontrolę. Każda zmiana działa od razu.' }))),
      status,
      h('div', { class: 'row' },
        c.childUid ? h('button', { class: 'btn primary', type: 'button', text: '💬 Rozmowa z ' + (names[c.childUid] || 'dzieckiem'), disabled: !c.enabled || !c.contacts.includes(me.uid), onclick: () => openChat(c.childUid, me.uid, names[c.childUid] || 'Dziecko', screenParent) }) : null,
        c.childUid && c.enabled ? h('button', { class: 'btn ghost', type: 'button', text: '⏸ Wstrzymaj dostęp', onclick: () => save({ enabled: false }, 'Dostęp wstrzymany') }) : null,
        c.childUid && !c.enabled ? h('button', { class: 'btn ok', type: 'button', text: '▶ Wznów dostęp', onclick: () => save({ enabled: true }, 'Dostęp wznowiony') }) : null,
        c.childUid ? h('button', { class: 'btn danger', type: 'button', text: '🔒 Cofnij dostęp dziecka', onclick: () => { if (confirm('Cofnąć dostęp konta dziecka? Rozmowy zostaną zachowane, ale dziecko nic nie zobaczy, dopóki ponownie nie zatwierdzisz konta.')) save({ childUid: '', enabled: false }, 'Dostęp cofnięty'); } }) : null)),
    h('section', { class: 'card grid2' },
      h('div', {}, h('label', { for: 'myname', text: 'Twoja nazwa widoczna dla dziecka' }), myName,
        h('button', { class: 'btn ghost block', type: 'button', text: 'Zapisz', onclick: async () => {
          if (!c.contacts.includes(me.uid)) await save({ contacts: [...c.contacts, me.uid] });
          try { await setDoc(doc(db, 'kids_profiles', me.uid), { displayName: myName.value.trim().slice(0, 40) || 'Rodzic', updatedAt: serverTimestamp() }); toast('Zapisano'); } catch (e) { toast(friendly(e)); }
        } })),
      h('div', {}, h('label', { for: 'childname', text: 'Imię dziecka w aplikacji' }), childName,
        h('button', { class: 'btn ghost block', type: 'button', text: 'Zapisz', disabled: !c.childUid, onclick: async () => {
          try { await setDoc(doc(db, 'kids_profiles', c.childUid), { displayName: childName.value.trim().slice(0, 40) || 'Dziecko', updatedAt: serverTimestamp() }); toast('Zapisano'); } catch (e) { toast(friendly(e)); }
        } }))),
    h('section', { class: 'card' },
      h('h2', { text: 'Zaproszenie konta dziecka' }),
      h('p', { class: 'muted small', text: 'Adres e-mail jest tylko identyfikatorem zaproszenia. Dziecko samo ustawia hasło i potwierdza adres linkiem z poczty. Potem Ty zatwierdzasz konto tutaj.' }),
      h('form', { class: 'row', novalidate: true, onsubmit: async (e) => {
        e.preventDefault();
        const em = invEmail.value.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { toast('Wpisz poprawny adres e-mail.'); return; }
        try { await addDoc(collection(db, 'kids_invites'), { email: em, status: 'pending', createdBy: me.uid, createdAt: serverTimestamp() }); invEmail.value = ''; toast('Zaproszenie utworzone'); screenParent(); }
        catch (e2) { toast(friendly(e2)); }
      } }, h('label', { for: 'invemail', class: 'sr', text: 'E-mail dziecka' }), invEmail, h('button', { class: 'btn primary', type: 'submit', text: 'Zaproś' })),
      h('p', { class: 'muted small', text: 'Link dla dziecka: ' + APP_URL + ' → „Mam zaproszenie — pierwsze logowanie”.' }),
      h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: 'E-mail' }), h('th', { text: 'Stan' }), h('th', { text: '' }))), invTable)),
    h('section', { class: 'card' },
      h('h2', { text: 'Zatwierdzone kontakty' }),
      h('p', { class: 'muted small', text: 'Dziecko rozmawia wyłącznie z tymi osobami. Bez wyszukiwarki, bez obcych.' }),
      contactsList,
      h('form', { class: 'row', novalidate: true, style: 'margin-top:12px', onsubmit: (e) => {
        e.preventDefault();
        const u = contactUid.value.trim();
        if (!/^[A-Za-z0-9]{20,40}$/.test(u)) { toast('To nie wygląda na identyfikator konta.'); return; }
        if (u === c.childUid) { toast('To konto dziecka.'); return; }
        save({ contacts: Array.from(new Set([...c.contacts, u])) }, 'Kontakt zatwierdzony');
      } }, h('label', { for: 'cuid', class: 'sr', text: 'Identyfikator konta kontaktu' }), contactUid, h('button', { class: 'btn ghost', type: 'submit', text: 'Dodaj kontakt' })),
      h('p', { class: 'muted small', text: 'Np. mama: niech zaloguje się na tej stronie swoim kontem — zobaczy swój identyfikator, który tu wkleisz.' })),
    h('section', { class: 'card' },
      h('h2', { text: 'Zgłoszenia rodzin do pilotażu' }),
      h('p', { class: 'muted small', text: 'Z formularza na polskieradio.cc/kids. Bez danych dzieci — kontakt z rodzicem e-mailem.' }),
      h('div', { style: 'overflow-x:auto' }, h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: 'Rodzic' }), h('th', { text: 'Dzieci' }), h('th', { text: 'Wiadomość' }), h('th', { text: 'Data' }))), waitBody)))
  );
}

onAuthStateChanged(auth, (user) => {
  clearSubs(); names = {}; activeConv = null;
  if (!user) { me = null; logoutBtn.hidden = true; screenLogin(); return; }
  start(user).catch(() => render(h('section', { class: 'card' }, note('Nie udało się wczytać LUMI KIDS. Odśwież stronę.', 'err'))));
});
