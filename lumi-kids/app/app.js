/**
 * LUMI KIDS — zamknięty pilotaż rodzinny (Strażnik Claude, 2026-10-18)
 *
 * Bezpieczeństwo egzekwują reguły Firestore po stronie serwera (kids_* + bramka dziecka w DM LUMINA).
 * Rodzic i dziecko piszą w JEDNYM wątku lumina_direct_messages (rodzic: zwykły LUMI Messenger).
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
import { getMessaging, getToken, isSupported as messagingSupported } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js';
import { openFamilyPanel } from '/components/lumi-family-host.js?v=20261019_family2';

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
// Mama jest zatwierdzonym KONTAKTEM dziecka (rozmowa rodzinna), nie opiekunem z uprawnieniami administratora.
const MAMA_UID = 'lr7E9IsM6VaABLvMcrjAN5Lvn0j2';
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
let avatars = {};
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
function avatar(name, small, photoUrl) {
  if (photoUrl) {
    return h('img', {
      class: 'avatar' + (small ? ' sm' : ''),
      src: photoUrl,
      alt: name || 'Avatar',
      loading: 'lazy',
      style: 'object-fit:cover;object-position:center;padding:0;background:#fff;'
    });
  }
  return h('span', { class: 'avatar' + (small ? ' sm' : ''), 'aria-hidden': 'true', text: initial(name) });
}
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
function fmtTime(ts) {
  const d = ts && typeof ts.toDate === 'function' ? ts.toDate() : null;
  if (!d) return 'teraz';
  const today = new Date().toDateString() === d.toDateString();
  return (today ? '' : d.toLocaleDateString('pl-PL') + ' ') + d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

// Animacje można wyłączyć (WCAG 2.2 — 2.3.3).
(function motion() {
  let off = false;
  try { off = localStorage.getItem('lumikids.noMotion') === '1'; } catch (e) {}
  const apply = () => { document.body.classList.toggle('no-motion', off); motionBtn.setAttribute('aria-pressed', String(off)); motionBtn.textContent = off ? '⏸' : '✨'; motionBtn.title = off ? 'Włącz animacje' : 'Wyłącz animacje'; motionBtn.setAttribute('aria-label', motionBtn.title); };
  motionBtn.addEventListener('click', () => { off = !off; try { localStorage.setItem('lumikids.noMotion', off ? '1' : '0'); } catch (e) {} apply(); });
  apply();
})();
logoutBtn.addEventListener('click', async () => { clearSubs(); try { await caches.delete('lumi-kids-device'); } catch (e) {} await signOut(auth); });

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

// ── Wspólny wątek DM LUMINA (jedno źródło prawdy) ────────────────────────────
// Rodzic pisze w zwykłym LUMI Messenger, dziecko tutaj — oba widoki czytają i zapisują
// te same dokumenty `lumina_direct_messages` w jednej rozmowie `chatId`.
const PUSH_URL = 'https://lumina-push.nazirczarkes.workers.dev';
const KIDS_AVATAR = '/lumi-kids/assets/lumi-kids-logo.svg';
// Prywatność dziecka: zdjęcie tylko jako miniatura w kids_profiles (reguły), nigdy publiczny plik.
function privatePhoto(u) { return typeof u === 'string' && /^data:image\/(webp|jpeg|png);base64,/.test(u) ? u : ''; }

// Kopia normalizeChatUserId z lumina-db.js — identyfikator rozmowy musi być identyczny w obu aplikacjach.
function normId(idOrSlug) {
  if (!idOrSlug) return 'guest';
  const str = String(idOrSlug).trim().toLowerCase();
  if (['cezaryrgowski', 'cezary', 'nazirczarkes@gmail.com', 'studiodees7@gmail.com', 'nazirczarkes', '1zhaexihqzgz8nzebr0dyc7wlg93',
    'sectuwwrsv8pnkhsrxgyivjbajn1', 'u5seqt54fcnocfcxjirckowjhqc2', 'u_cezary_official', 'u_cezary'].includes(str)) return 'cezaryrgowski';
  if (['radiocc', 'christianculture', 'radiochristianculture@gmail.com', 'christian culture', 'lgibw6jrf0wbeln6zpqu2pfrlcx1'].includes(str)) return 'radiocc';
  if (['wiolettarogowska', 'wioletta', 'lr7e9ism6vaablvmcrjan5lvn0j2', 'j4aqs5wspawssjtj04jlqchpieg1'].includes(str) || str.split('@')[0] === 'wioletta1240') return 'wiolettarogowska';
  if (str === 'andrzejthiel' || str === 'andrzej') return 'andrzejthiel';
  if (['robertlukaszpio', 'robertukaszpio', 'u_robertukaszpio_5668', 'bratrobert', 'brat_robert', 'robert_lukasz_pio', 'robert-lukasz-pio', 'jidflt3g8ohgpcowmcljaz9i5d42'].includes(str)) return 'robertlukaszpio';
  return str;
}
function familyChatId(contactKey, childUid) { return [normId(contactKey), normId(childUid)].sort().join('_'); }
function msgMillis(m) { return (m.timestamp && m.timestamp.toMillis ? m.timestamp.toMillis() : 0) || Number(m.createdAt) || 0; }
function newId() { return (crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(36).slice(2))).replace(/[^A-Za-z0-9-]/g, ''); }

async function lookupLuminaProfile(uid) {
  try {
    const s = await getDocs(query(collection(db, 'lumina_profiles'), where('uid', '==', uid), limit(1)));
    if (!s.empty) { const d = s.docs[0].data(); return { slug: d.slug || s.docs[0].id, name: d.name || d.displayName || '' }; }
  } catch (e) {}
  return { slug: uid, name: '' };
}

async function pushNotify(messageId) {
  try {
    const t = await auth.currentUser.getIdToken();
    await fetch(PUSH_URL + '/v1/push/direct/' + encodeURIComponent(messageId), { method: 'POST', headers: { Authorization: 'Bearer ' + t } });
  } catch (e) { /* wiadomość jest już zapisana — brak push jej nie cofa */ }
}

function watchMessages(chatId, onList, onError) {
  const base = [where('participants', 'array-contains', me.uid), where('chatId', '==', chatId)];
  let stop = () => {};
  const handle = (snap) => {
    const list = [];
    snap.forEach(d => { if (!d.metadata.hasPendingWrites) list.push({ id: d.id, ref: d.ref, ...d.data() }); });
    list.sort((a, b) => msgMillis(a) - msgMillis(b));
    onList(list.slice(-300));
  };
  stop = onSnapshot(query(collection(db, 'lumina_direct_messages'), ...base, orderBy('timestamp', 'desc'), limit(300)), handle, (err) => {
    if (err && err.code === 'failed-precondition') {
      // Brak indeksu złożonego — ten sam wątek bez sortowania po stronie serwera.
      stop = onSnapshot(query(collection(db, 'lumina_direct_messages'), ...base, limit(300)), handle, onError);
    } else onError(err);
  });
  return () => stop();
}

// ── Start po zalogowaniu ─────────────────────────────────────────────────────
async function loadConfig() {
  try { const s = await getDoc(doc(db, 'kids_pilot/config')); return s.exists() ? s.data() : null; }
  catch (e) { return undefined; }
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

function noAccess(user, title, text) {
  render(h('section', { class: 'card center pop' },
    h('div', { style: 'font-size:3rem', 'aria-hidden': 'true', text: '🔒' }),
    h('h1', { text: title }),
    h('p', { class: 'muted', text }),
    h('p', { class: 'small', text: 'Jeśli rodzic chce dodać Cię jako zaufany kontakt, przekaż mu ten identyfikator:' }),
    h('p', {}, h('code', { text: user.uid }), ' ', h('button', { class: 'btn ghost', type: 'button', text: 'Kopiuj', onclick: async () => { try { await navigator.clipboard.writeText(user.uid); toast('Skopiowano'); } catch (e) { toast('Zaznacz i skopiuj ręcznie'); } } })),
    h('a', { class: 'btn ghost', href: '/lumi-kids/', text: 'O LUMI KIDS' })));
}

async function start(user) {
  clearSubs(); me = user; logoutBtn.hidden = false;
  if (!LUMI_KIDS_PILOT_ENABLED) { render(h('section', { class: 'card' }, note('Pilotaż jest wyłączony.', 'info'))); return; }
  if (isGuardian(user)) return screenParent();
  cfg = await loadConfig();
  if (cfg && cfg.childUid === user.uid) {
    if (cfg.enabled && !cfg.revoked) return screenChild();
    return noAccess(user, 'Dostęp jest wstrzymany', 'Rodzic wstrzymał teraz dostęp do LUMI KIDS. Porozmawiaj z rodzicem.');
  }
  if (user.uid === 'gm3maVXebCRQ8hLpze63HLRtAkn2') {
    render(h('section', { class: 'card center pop' },
      h('div', { style: 'font-size:3rem', 'aria-hidden': 'true', text: '⛵' }),
      h('h1', { text: 'Cześć Dawidku! 👋' }),
      h('p', { text: 'Twój profil jest gotowy. Tata musi tylko raz otworzyć panel rodzica, aby zatwierdzić rozpoczęcie rozmowy.' }),
      h('button', { class: 'btn primary', type: 'button', text: 'Sprawdź ponownie', onclick: () => start(user) })));
    return;
  }
  const isPwd = user.providerData.some(p => p.providerId === 'password');
  if (isPwd && !user.emailVerified) return screenVerify(user);
  if (cfg && cfg.enabled && !cfg.revoked && Array.isArray(cfg.contacts) && cfg.contacts.includes(user.uid)) return screenContact();
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
  noAccess(user, 'Brak dostępu do LUMI KIDS', 'LUMI KIDS to zamknięty pilotaż rodzinny. Dostęp daje wyłącznie rodzic.');
}

async function loadNames(uids) {
  await Promise.all(uids.filter(u => u && (!(u in names) || !(u in avatars))).map(async (u) => {
    try {
      const s = await getDoc(doc(db, 'kids_profiles', u));
      if (s.exists()) {
        const d = s.data();
        names[u] = d.displayName || '';
        avatars[u] = privatePhoto(d.photo) || privatePhoto(d.avatarUrl) || (typeof d.avatarUrl === 'string' && /^\/avatar_[a-z_]+\.jpg$/.test(d.avatarUrl) ? d.avatarUrl : '');
      } else {
        names[u] = '';
        avatars[u] = '';
      }
    } catch (e) {
      names[u] = '';
      avatars[u] = '';
    }
  }));
}
function nameOf(uid, fallback) { return names[uid] || fallback || 'Bliska osoba'; }
function avatarOf(uid, fallbackName, small) {
  let url = avatars[uid];
  if (!url) {
    if (normId(uid) === 'cezaryrgowski' || uid === '1zHaEXihQZgz8nzebR0DyC7wLG93' || (fallbackName && String(fallbackName).toLowerCase().includes('tata'))) {
      url = '/avatar_cezary.jpg';
    } else if (normId(uid) === 'wiolettarogowska' || uid === 'lr7E9IsM6VaABLvMcrjAN5Lvn0j2' || (fallbackName && String(fallbackName).toLowerCase().includes('mama'))) {
      url = '/avatar_wioletta_official.jpg';
    } else if (uid === me?.uid && me?.photoURL) {
      url = me.photoURL;
    }
  }
  return avatar(names[uid] || fallbackName, small, url);
}

let audioCtx = null;
function playChime() {
  try {
    const nowMs = Date.now();
    if (window._lastLuminaChimeTime && nowMs - window._lastLuminaChimeTime < 4000) return;
    window._lastLuminaChimeTime = nowMs;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.12);
    gain2.gain.setValueAtTime(0.001, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.25, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.72);
  } catch (e) {}
}

window.addEventListener('click', () => {
  try {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  } catch (e) {}
}, { passive: true });

function popupMessageToast(senderUid, senderName, text, onOpen) {
  playChime();
  const existing = document.getElementById('lumiKidsMsgPopup');
  if (existing) existing.remove();

  const preview = String(text || '').slice(0, 70);
  const toastEl = h('div', {
    id: 'lumiKidsMsgPopup',
    class: 'msg-popup-banner pop',
    role: 'alert',
    onclick: () => {
      toastEl.remove();
      if (typeof onOpen === 'function') onOpen();
    }
  },
    avatarOf(senderUid, senderName, false),
    h('div', { class: 'msg-popup-body' },
      h('div', { class: 'msg-popup-title' },
        h('strong', { text: senderName }),
        h('span', { class: 'badge', text: 'Nowa wiadomość' })
      ),
      h('p', { class: 'msg-popup-text', text: preview || 'Napisał do Ciebie wiadomość 👋' })
    ),
    h('button', {
      type: 'button',
      class: 'btn primary msg-popup-btn',
      text: 'Odpisz 💬',
      onclick: (e) => {
        e.stopPropagation();
        toastEl.remove();
        if (typeof onOpen === 'function') onOpen();
      }
    })
  );

  document.body.appendChild(toastEl);
  setTimeout(() => {
    if (toastEl.parentNode) {
      toastEl.classList.add('fade-out');
      setTimeout(() => toastEl.remove(), 400);
    }
  }, 7000);
}

// ── Widok dziecka ────────────────────────────────────────────────────────────
// ── Powiadomienia przy zamkniętej aplikacji (to samo FCM co LUMINA) ─────────
const VAPID_KEY = 'BD_YXGFbonkuMphLzVdYqADfcPX4TMnN4PowO2eu673JnZQR3RJRMM3F8nJN9Zpk8qQlSb4VEcFN39KXlZ85TPw';
const SW_URL = '/firebase-messaging-sw.js?v=4.1.6_20260914_fullsync';
function pushState() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
  return Notification.permission; // granted | denied | default
}
async function markKidsDevice() {
  // Na tym urządzeniu kliknięcie powiadomienia otwiera wyłącznie LUMI KIDS (obsługuje to service worker).
  try { const c = await caches.open('lumi-kids-device'); await c.put('/__lumi-kids-device', new Response('1')); } catch (e) {}
}
async function enablePush() {
  if (pushState() === 'unsupported' || !(await messagingSupported().catch(() => false))) return 'unsupported';
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return perm;
  await markKidsDevice();
  const reg = await navigator.serviceWorker.register(SW_URL, { scope: '/', updateViaCache: 'none' });
  await navigator.serviceWorker.ready;
  const token = await getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
  if (!token || !auth.currentUser || auth.currentUser.uid !== me.uid) return 'error';
  const key = token.replace(/[^a-zA-Z0-9_-]/g, '').slice(-32);
  const platform = /Android/i.test(navigator.userAgent) ? 'android' : (/iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : 'web');
  await setDoc(doc(db, 'LuminaDeviceTokens', key), {
    token, uid: me.uid, slug: await myKey(), userSlug: await myKey(), userName: nameOf(me.uid, ''),
    platform, userAgent: navigator.userAgent || 'unknown', enabled: true, lastSeenAt: serverTimestamp(), updatedAt: serverTimestamp()
  }, { merge: true });
  return 'granted';
}
function isHarmony() { return /HarmonyOS|OpenHarmony|ArkWeb|HuaweiBrowser|HMSCore/i.test(navigator.userAgent || ''); }
function pushCard() {
  const st = pushState();
  if (isHarmony()) {
    return h('section', { class: 'card' }, h('h2', { text: '🔔 Powiadomienia (telefon Huawei)' }),
      h('p', { class: 'small', text: 'Na telefonach Huawei z HarmonyOS powiadomienia przy zamkniętej aplikacji mogą nie docierać. Gdy LUMI KIDS jest otwarte, nowe wiadomości pojawiają się od razu z dźwiękiem. Dodaj LUMI KIDS do ekranu startowego, żeby otwierać je jednym dotknięciem.' }),
      st !== 'unsupported' ? h('button', { class: 'btn ghost block', type: 'button', text: '🔔 Spróbuj włączyć powiadomienia', onclick: async (ev) => { busy(ev.currentTarget, true); let r = 'error'; try { r = await enablePush(); } catch (e) {} busy(ev.currentTarget, false); toast(r === 'granted' ? 'Włączone — sprawdźmy, czy przychodzą.' : 'Na tym telefonie powiadomienia nie są dostępne.'); } }) : null);
  }
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  if (st === 'unsupported' && ios && !standalone) {
    return h('section', { class: 'card' }, h('h2', { text: '🔔 Powiadomienia' }),
      h('p', { class: 'small', text: 'Na iPhonie: w Safari stuknij „Udostępnij” → „Do ekranu początkowego”, otwórz LUMI KIDS z ikonki i wróć tutaj, aby włączyć powiadomienia.' }));
  }
  if (st === 'unsupported') return null;
  const out = h('div');
  const btn = h('button', { class: 'btn ghost block', type: 'button', text: st === 'granted' ? '🔔 Powiadomienia włączone — odśwież na tym urządzeniu' : '🔔 Włącz powiadomienia', onclick: async () => {
    busy(btn, true);
    let r = 'error';
    try { r = await enablePush(); } catch (e) { r = 'error'; }
    busy(btn, false);
    out.replaceChildren(r === 'granted' ? note('Gotowe! Wiadomości od rodzica pokażą się także przy zamkniętej aplikacji.', 'good')
      : r === 'denied' ? note('Powiadomienia są zablokowane w ustawieniach przeglądarki. Poproś rodzica o pomoc.', 'err')
      : note('Nie udało się włączyć powiadomień na tym urządzeniu.', 'err'));
  } });
  return h('section', { class: 'card' }, h('h2', { text: '🔔 Powiadomienia' }),
    h('p', { class: 'muted small', text: 'Dzięki nim zobaczysz wiadomość od rodzica, nawet gdy LUMI KIDS jest zamknięte.' }), btn, out);
}

async function screenChild() {
  const contacts = (cfg.contacts || []).filter(u => u !== me.uid && cfg.familyChats && cfg.familyChats[u]);
  await loadNames([me.uid, ...contacts]);
  const list = h('ul', { class: 'contacts', 'aria-label': 'Moje zatwierdzone kontakty' });
  for (const c of contacts) {
    const cnt = h('span', { class: 'count', hidden: true, 'aria-label': 'nowe wiadomości' });
    list.append(h('li', {}, h('button', { class: 'contact', type: 'button', onclick: () => openChat(cfg.familyChats[c], c, nameOf(c, 'Rodzic'), screenChild) },
      avatarOf(c, 'Rodzic', true), h('span', { class: 'name', text: nameOf(c, 'Rodzic') }), h('span', { class: 'badge', text: '✓ Zatwierdzony' }), cnt)));
    watchUnread(cfg.familyChats[c], cnt, c);
  }
  render(
    h('section', { class: 'card pop' },
      h('div', { class: 'who' }, avatarOf(me.uid, 'Ja', false),
        h('div', {}, h('h1', { text: 'Cześć, ' + nameOf(me.uid, 'Dawidek') + '! 👋' }), h('span', { class: 'badge', text: '🛡️ Za zgodą rodzica' })))),
    h('section', { class: 'card' }, h('h2', { text: 'Moje kontakty' }),
      contacts.length ? list : note('Rodzic jeszcze nie dodał rozmowy. Poproś rodzica o otwarcie rozmowy w panelu.', 'info')),
    h('button', { class: 'btn primary block', type: 'button', text: '⌂ Moja rodzina', onclick: () => {
      document.body.classList.add('lumi-kids-family'); openFamilyPanel({ nameForUid: uid => names[uid] || null });
    } }),
    contacts.length ? h('button', { class: 'btn help block', type: 'button', text: '🛟 Potrzebuję pomocy', onclick: () => helpScreen(contacts[0]) }) : null,
    contacts.length ? pushCard() : null
  );
  if (pushState() === 'granted') { markKidsDevice(); enablePush().catch(() => {}); }
  watchConfig();
}

function helpScreen(contactUid) {
  clearSubs();
  const out = h('div');
  const send = h('button', { class: 'btn primary block', type: 'button', text: '📨 Wyślij rodzicowi: „Potrzebuję pomocy”', onclick: async () => {
    busy(send, true);
    const ok = await sendDm(cfg.familyChats[contactUid], contactUid, 'Potrzebuję pomocy 🛟 Odezwij się, proszę.', null);
    busy(send, false);
    out.replaceChildren(ok ? note('Wysłano do: ' + nameOf(contactUid, 'rodzic') + '. Wiadomość jest zapisana i rodzic zobaczy ją w LUMI.', 'good')
      : note('Nie udało się wysłać. Sprawdź internet i spróbuj jeszcze raz — albo powiedz to dorosłemu obok.', 'err'));
  } });
  render(h('section', { class: 'card pop' },
    h('div', { class: 'center', style: 'font-size:3rem', 'aria-hidden': 'true', text: '💜' }),
    h('h1', { class: 'center', text: 'Potrzebujesz pomocy?' }),
    send, out,
    h('button', { class: 'btn ghost block', type: 'button', text: '💬 Otwórz rozmowę', onclick: () => openChat(cfg.familyChats[contactUid], contactUid, nameOf(contactUid, 'Rodzic'), screenChild) }),
    h('h2', { text: 'Jeśli rodzic nie odpowiada' }),
    h('p', { text: 'Ta wiadomość nie jest alarmem i nikt nie czuwa przy niej przez całą dobę. Jeśli rodzic nie odpisuje, a sprawa jest ważna — idź od razu do innej zaufanej osoby dorosłej (np. drugiego rodzica, babci, nauczyciela).' }),
    h('p', { text: 'Gdy dzieje się coś groźnego: zadzwoń pod 112. Telefon zaufania dla dzieci i młodzieży: 116 111 (bezpłatnie).' }),
    h('button', { class: 'btn ghost block', type: 'button', text: '← Wróć', onclick: () => screenChild() })));
}

function watchUnread(chatId, el, contactUid) {
  let first = true, prev = 0;
  unsubs.push(watchMessages(chatId, (list) => {
    const unreadMsgs = list.filter(m => m.receiverAuthUid === me.uid && !(m.isRead && m.status === 'read'));
    const n = unreadMsgs.length;
    if (el) { el.hidden = n === 0; el.textContent = n > 9 ? '9+' : String(n); }
    if (!first && n > prev && activeConv !== chatId) {
      const latest = unreadMsgs[unreadMsgs.length - 1];
      const senderUid = (latest && latest.senderAuthUid) || contactUid;
      const defaultName = (senderUid === 'lr7E9IsM6VaABLvMcrjAN5Lvn0j2' || normId(senderUid) === 'wiolettarogowska') ? 'Mama' : 'Tata';
      const senderName = nameOf(senderUid, defaultName);
      const text = latest ? latest.text : 'Nowa wiadomość';
      popupMessageToast(senderUid, senderName, text, () => {
        openChat(chatId, contactUid, senderName, screenChild);
      });
    }
    first = false; prev = n;
    document.title = (n > 0 ? '(' + n + ') ' : '') + 'LUMI KIDS';
  }, () => { if (el) el.hidden = true; }));
}

// Cofnięcie zgody zamyka widoki natychmiast (reguły i tak odrzucą odczyt i zapis).
function watchConfig() {
  unsubs.push(onSnapshot(doc(db, 'kids_pilot/config'), (s) => {
    const c = s.exists() ? s.data() : null;
    const ok = c && c.enabled && !c.revoked && (c.childUid === me.uid || (c.contacts || []).includes(me.uid));
    if (!ok) { clearSubs(); activeConv = null; start(me); }
  }, () => { clearSubs(); activeConv = null; start(me); }));
}

// ── Zatwierdzony kontakt (dorosły) — korzysta ze zwykłego LUMI Messenger ────
async function screenContact() {
  await loadNames([cfg.childUid]);
  const chatId = cfg.familyChats && cfg.familyChats[me.uid];
  render(h('section', { class: 'card pop' },
    h('h1', { text: 'Rozmowa rodzinna' }),
    h('p', { class: 'muted', text: 'Jesteś zatwierdzonym kontaktem. Rozmowa z ' + nameOf(cfg.childUid, 'dzieckiem') + ' jest w Twoim zwykłym LUMI Messenger (okienka prywatne) — możesz też pisać tutaj.' }),
    h('div', { class: 'row' },
      h('a', { class: 'btn primary', href: '/mess', text: 'Otwórz LUMI Messenger' }),
      chatId ? h('button', { class: 'btn ghost', type: 'button', text: '💬 Rozmowa tutaj', onclick: () => openChat(chatId, cfg.childUid, nameOf(cfg.childUid, 'Dziecko'), screenContact) }) : null)));
}

// ── Wysyłka (schemat zgodny z LUMINA) ────────────────────────────────────────
let myKeyCache = null;
async function myKey() {
  if (myKeyCache) return myKeyCache;
  if (cfg && cfg.childUid === me.uid) return (myKeyCache = normId(me.uid));
  const p = await lookupLuminaProfile(me.uid);
  return (myKeyCache = normId(p.slug || me.uid));
}
const sending = new Set();
async function sendDm(chatId, otherUid, text, replyTo) {
  const t = String(text || '').trim().slice(0, 1000);
  if (!t || !chatId) return false;
  const key = await myKey();
  const otherKey = chatId.split('_').length === 2 ? chatId.split('_').find(p => p !== key) || normId(otherUid) : normId(otherUid);
  const id = newId();
  if (sending.has(t + chatId)) return false; // podwójne kliknięcie
  sending.add(t + chatId);
  const myName = nameOf(me.uid, me.displayName || 'LUMI KIDS');
  const msg = {
    clientMessageId: id, chatId, senderAuthUid: me.uid, receiverAuthUid: otherUid, participants: [me.uid, otherUid],
    senderId: key, senderUid: me.uid, senderName: myName, senderAvatar: KIDS_AVATAR, senderBadge: '⭐ LUMI KIDS',
    receiverId: otherKey, users: Array.from(new Set([key, otherKey, me.uid])),
    text: t, type: 'text', status: 'sent', isRead: false, readAt: null, readBy: [], readByName: null,
    delivered: false, deliveredAt: null, createdAt: Date.now(), timestamp: serverTimestamp(),
    dateStr: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    ...(replyTo ? { replyToMessageId: replyTo.id, replyToSenderName: replyTo.name || '', replyToSenderId: replyTo.senderId || '', replyToText: String(replyTo.text || '').slice(0, 300) } : {})
  };
  try {
    const ref = doc(db, 'lumina_direct_messages', id);
    try { await setDoc(ref, msg); }
    catch (e) {
      // Retransmisja po zerwanym połączeniu: jeśli dokument już istnieje, to jest ta sama wiadomość.
      const s = await getDoc(ref).catch(() => null);
      if (!(s && s.exists())) throw e;
    }
    updateDoc(doc(db, 'lumina_chats', chatId), {
      lastMessageText: t, lastMessageTimestamp: serverTimestamp(), lastSenderId: key, lastSenderName: myName,
      lastSenderAvatar: KIDS_AVATAR, lastMessageType: 'text'
    }).catch(() => {});
    pushNotify(id);
    return true;
  } catch (e) { return false; }
  finally { sending.delete(t + chatId); }
}

// ── Czat 1:1 w tym samym wątku co LUMI Messenger ────────────────────────────
async function openChat(chatId, otherUid, title, back) {
  clearSubs();
  activeConv = chatId;
  let replyTo = null;
  const myK = await myKey();
  const listEl = h('div', { class: 'list', role: 'log', 'aria-label': 'Wiadomości', 'aria-live': 'polite' });
  const text = h('textarea', { id: 'msg', rows: '1', maxlength: '1000', placeholder: 'Napisz wiadomość…', 'aria-label': 'Treść wiadomości' });
  const replyBox = h('div', { class: 'replying', hidden: true });
  const sendBtn = h('button', { class: 'btn primary', type: 'submit', 'aria-label': 'Wyślij', text: '➤' });
  const err = h('div');
  const form = h('form', { class: 'composer', onsubmit: async (e) => {
    e.preventDefault();
    const t = text.value.trim(); if (!t || sendBtn.disabled) return;
    busy(sendBtn, true); err.replaceChildren();
    const ok = await sendDm(chatId, otherUid, t, replyTo);
    busy(sendBtn, false);
    if (ok) { text.value = ''; setReply(null); }
    else err.replaceChildren(note('Wiadomość NIE została wysłana. Sprawdź internet i spróbuj ponownie.', 'err'));
    text.focus();
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
      avatarOf(otherUid, title, true), h('span', { class: 'title', text: title })),
    listEl, form));

  let marking = false;
  unsubs.push(watchMessages(chatId, (list) => {
    const atBottom = listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight < 80;
    listEl.replaceChildren();
    for (const m of list) {
      const mine = m.senderAuthUid === me.uid;
      const reactions = m.reactions && typeof m.reactions === 'object' ? m.reactions : {};
      const mineR = (emoji) => Array.isArray(reactions[emoji]) && reactions[emoji].some(u => (typeof u === 'string' ? u : u && u.id) === myK);
      const shown = Object.entries(reactions).filter(([, v]) => Array.isArray(v) && v.length).map(([e, v]) => e + (v.length > 1 ? v.length : ''));
      const acts = h('div', { class: 'acts' },
        h('button', { type: 'button', 'aria-label': 'Odpowiedz z cytatem', title: 'Odpowiedz', text: '↩︎', onclick: () => { setReply({ id: m.id, text: String(m.text || '').slice(0, 300), name: m.senderName || '', senderId: m.senderId || '' }); text.focus(); } }),
        ...EMOJI.slice(0, 5).map(e => h('button', { type: 'button', 'aria-pressed': String(mineR(e)), 'aria-label': 'Reakcja ' + e, text: e, onclick: async () => {
          const next = {};
          for (const [k, v] of Object.entries(reactions)) next[k] = (Array.isArray(v) ? v : []).filter(u => (typeof u === 'string' ? u : u && u.id) !== myK || k !== e);
          if (!mineR(e)) next[e] = [...(next[e] || []), { id: myK, name: nameOf(me.uid, 'Ja') }];
          for (const k of Object.keys(next)) if (!next[k].length) delete next[k];
          try { await updateDoc(m.ref, { reactions: next }); } catch (e3) { toast(friendly(e3)); }
        } })));
      const status = mine ? (m.isRead || m.status === 'read' ? ' · ✓✓ przeczytane' : ' · ✓ wysłane') : '';
      listEl.append(h('div', { class: 'b' + (mine ? ' me' : '') },
        m.replyToText ? h('div', { class: 'quote', text: (m.replyToSenderName ? m.replyToSenderName + ': ' : '') + m.replyToText }) : null,
        h('div', { text: m.text || '' }),
        h('div', { class: 'meta' }, h('span', { text: (mine ? 'Ja' : (m.senderName || title)) + ' · ' + fmtTime(m.timestamp) + status }), shown.length ? h('span', { class: 'reacts', 'aria-label': 'Reakcje', text: shown.join(' ') }) : null),
        acts));
    }
    if (!list.length) listEl.append(h('p', { class: 'muted center', text: 'Napisz pierwszą wiadomość 👋' }));
    if (atBottom || list.length) listEl.scrollTop = listEl.scrollHeight;
    // Potwierdzenie przeczytania wiadomości, które naprawdę są na ekranie.
    const unread = list.filter(m => m.receiverAuthUid === me.uid && !(m.isRead && m.status === 'read'));
    if (unread.length) playChime();
    if (unread.length && !marking && document.visibilityState === 'visible') {
      marking = true;
      Promise.all(unread.map(m => updateDoc(m.ref, { isRead: true, status: 'read', readAt: Date.now(), readByName: nameOf(me.uid, ''), readBy: Array.from(new Set([...(Array.isArray(m.readBy) ? m.readBy : []), myK])) }).catch(() => {})))
        .finally(() => { marking = false; });
    }
  }, () => {
    clearSubs(); activeConv = null;
    render(h('section', { class: 'card center' }, h('div', { style: 'font-size:3rem', 'aria-hidden': 'true', text: '🔒' }),
      h('h1', { text: 'Rozmowa jest niedostępna' }), h('p', { class: 'muted', text: 'Rodzic zmienił ustawienia dostępu albo nie ma połączenia.' }),
      h('button', { class: 'btn primary', type: 'button', text: 'Odśwież', onclick: () => start(me) })));
  }));
  if (!isGuardian(me)) watchConfig();
  text.focus();
}

// ── Panel rodzica ────────────────────────────────────────────────────────────
// Tworzy (lub naprawia) rodzinny wątek DM w LUMINA: zaakceptowana prośba + pokój z nazwą dziecka.
async function createFamilyDM(childUid, contactUid) {
  const prof = await lookupLuminaProfile(contactUid);
  const contactKey = normId(prof.slug || contactUid);
  const childKey = normId(childUid);
  const chatId = familyChatId(contactKey, childUid);
  await loadNames([childUid, contactUid]);
  const childNameStr = names[childUid] || 'Dziecko';
  const childLabel = childNameStr + ' · LUMI KIDS';
  const childAvatar = privatePhoto(avatars[childUid]) || KIDS_AVATAR;
  const contactName = prof.name || nameOf(contactUid, 'Rodzic');
  await setDoc(doc(db, 'lumina_message_requests', chatId), {
    chatId, senderAuthUid: contactUid, receiverAuthUid: childUid, participants: [contactUid, childUid],
    senderId: contactKey, receiverId: childKey, senderName: contactName, previewText: 'Rozmowa rodzinna LUMI KIDS',
    status: 'accepted', acceptedAt: serverTimestamp(), acceptedBy: me.uid, createdAt: Date.now(), kidsFamily: true
  }, { merge: true });
  await setDoc(doc(db, 'lumina_chats', chatId), {
    chatId, participants: [contactUid, childUid], users: [contactKey, contactUid, childUid],
    conversationState: 'accepted', kidsFamily: true,
    ['name_' + childUid]: childLabel, ['avatar_' + childUid]: childAvatar,
    ['name_' + contactKey]: contactName, ['name_' + contactUid]: contactName,
    otherName: childLabel, otherAvatar: childAvatar
  }, { merge: true });
  return chatId;
}

// Zdjęcie dziecka: tylko prywatnie (kids_profiles + rodzinne rozmowy), małe (256 px), bez publicznego adresu URL.
async function fileToSmallDataUrl(file) {
  if (!file || !/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type || '')) throw new Error('type');
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
  cv.getContext('2d').drawImage(bmp, (bmp.width - side) / 2, Math.max(0, (bmp.height - side) / 2 - side * 0.08), side, side, 0, 0, 256, 256);
  let url = cv.toDataURL('image/webp', 0.82);
  if (!url.startsWith('data:image/webp')) url = cv.toDataURL('image/jpeg', 0.82);
  if (url.length > 180000) throw new Error('size');
  return url;
}
async function setChildPhoto(childUid, dataUrl) {
  await setDoc(doc(db, 'kids_profiles', childUid), { photo: dataUrl || '', avatarUrl: '', updatedAt: serverTimestamp() }, { merge: true });
  avatars[childUid] = dataUrl || '';
  const fc = (cfg && cfg.familyChats) || {};
  await Promise.all(Object.values(fc).map(chatId => setDoc(doc(db, 'lumina_chats', chatId), {
    ['avatar_' + childUid]: dataUrl || KIDS_AVATAR, otherAvatar: dataUrl || KIDS_AVATAR }, { merge: true }).catch(() => {})));
}

async function screenParent() {
  clearSubs();
  const ref = doc(db, 'kids_pilot/config');
  let c = null;
  try { const s = await getDoc(ref); c = s.exists() ? s.data() : null; } catch (e) { render(h('section', { class: 'card' }, note('Brak uprawnień opiekuna (konto nie jest potwierdzone lub reguły nie są wdrożone).', 'err'))); return; }
  if (!c) c = { enabled: false, revoked: false, childUid: '', contacts: [me.uid], familyChats: {} };
  if (!Array.isArray(c.contacts)) c.contacts = [];
  if (!c.familyChats || typeof c.familyChats !== 'object') c.familyChats = {};
  cfg = c;
  const save = async (patch, msg) => {
    try { await setDoc(ref, { ...cfg, ...patch, updatedAt: serverTimestamp(), updatedBy: me.uid }); cfg = { ...cfg, ...patch }; if (msg) toast(msg); }
    catch (e) { toast(friendly(e)); throw e; }
  };
  const ensureChats = async (childUid, contacts) => {
    const fc = { ...(cfg.familyChats || {}) };
    for (const u of contacts) fc[u] = await createFamilyDM(childUid, u);
    await save({ familyChats: fc });
  };
  // Mama zawsze ma rozmowę rodzinną z dzieckiem — panel rodzica uzupełnia to sam, bez ręcznego dodawania.
  if (c.childUid && c.enabled && !c.revoked && (!c.contacts.includes(MAMA_UID) || !c.familyChats[MAMA_UID])) {
    try {
      await save({ contacts: Array.from(new Set([...c.contacts, MAMA_UID])) });
      c.contacts = cfg.contacts;
      await ensureChats(c.childUid, [MAMA_UID]);
      c.familyChats = cfg.familyChats;
    } catch (e) { /* komunikat pokazany przez save() */ }
  }
  await loadNames([me.uid, c.childUid, ...c.contacts].filter(Boolean));
  // Sprzątanie: wcześniejsza wersja wskazywała publiczny plik ze zdjęciem dziecka — usuwamy to odwołanie.
  if (c.childUid) {
    try {
      const kp = await getDoc(doc(db, 'kids_profiles', c.childUid));
      const old = kp.exists() ? kp.data().avatarUrl : '';
      if (typeof old === 'string' && old.indexOf('/lumi-kids/assets/') === 0) await setChildPhoto(c.childUid, privatePhoto(kp.data().photo));
    } catch (e) {}
  }

  const DAWID_UID = 'gm3maVXebCRQ8hLpze63HLRtAkn2';
  const DAWID_NAME = 'Dawidek';

  const myName = h('input', { type: 'text', id: 'myname', maxlength: '40', value: names[me.uid] || 'Tata' });
  const childName = h('input', { type: 'text', id: 'childname', maxlength: '40', value: names[c.childUid] || (c.childUid === DAWID_UID || !c.childUid ? DAWID_NAME : 'Dziecko') });
  const invEmail = h('input', { type: 'email', id: 'invemail', autocomplete: 'off' });
  const invTable = h('tbody');
  try {
    const inv = await getDocs(query(collection(db, 'kids_invites'), limit(20)));
    inv.forEach((d) => {
      const v = d.data();
      const approve = v.status === 'claimed' && v.claimedUid !== c.childUid
        ? h('button', { class: 'btn ok', type: 'button', text: 'Zatwierdź konto dziecka', onclick: async (ev) => {
            busy(ev.currentTarget, true);
            try {
              await setDoc(doc(db, 'kids_profiles', v.claimedUid), { displayName: childName.value.trim().slice(0, 40) || 'Dziecko', updatedAt: serverTimestamp() });
              const contacts = Array.from(new Set([...(c.contacts || []), me.uid]));
              await save({ childUid: v.claimedUid, enabled: true, revoked: false, contacts, familyChats: {} });
              await ensureChats(v.claimedUid, contacts);
              toast('Konto dziecka zatwierdzone — rozmowa rodzinna gotowa');
            } catch (e) { /* toast już pokazany */ }
            screenParent();
          } })
        : null;
      const cancel = v.status === 'pending' ? h('button', { class: 'btn ghost', type: 'button', text: 'Anuluj', onclick: async () => { await updateDoc(d.ref, { status: 'revoked' }); screenParent(); } }) : null;
      invTable.append(h('tr', {}, h('td', { text: v.email }), h('td', { text: { pending: 'czeka na pierwsze logowanie', claimed: 'przyjęte — czeka na Twoje zatwierdzenie', revoked: 'anulowane' }[v.status] || v.status }), h('td', {}, approve, cancel)));
    });
  } catch (e) { invTable.append(h('tr', {}, h('td', { colspan: '3', text: 'Nie udało się wczytać zaproszeń.' }))); }

  const activateDawid = async (btn) => {
    busy(btn, true);
    try {
      await setDoc(doc(db, 'kids_profiles', DAWID_UID), {
        displayName: DAWID_NAME,
        emoji: '⛵',
        updatedAt: serverTimestamp()
      }, { merge: true });
      const contacts = Array.from(new Set([...(c.contacts || []), me.uid, MAMA_UID]));
      await save({ childUid: DAWID_UID, enabled: true, revoked: false, contacts, familyChats: {} });
      await ensureChats(DAWID_UID, contacts);
      toast('✅ Profil Dawidka aktywowany! Rozmowa rodzinna jest gotowa.');
      screenParent();
    } catch (e) {
      toast(friendly(e));
      busy(btn, false);
    }
  };

  const isDawidActive = c.childUid === DAWID_UID && c.enabled && !c.revoked;
  const dawidCard = h('section', { class: 'card pop', style: isDawidActive ? 'border:2px solid #1f9d74;background:#f3fbf7;' : 'border:2px solid #2f7cf6;background:#f5f9ff;' },
    h('div', { class: 'who' },
      avatarOf(DAWID_UID, DAWID_NAME, false),
      h('div', {},
        h('h2', { style: 'margin:0;color:var(--ink);', text: '🧒 Profil Dawidka' }),
        h('p', { class: 'muted small', style: 'margin:3px 0 0;', text: 'Konto gotowe' }),
        h('span', { class: 'badge', style: isDawidActive ? 'background:#d1f4e0;color:#0d6938;margin-top:4px;' : 'background:#e0edff;color:#1852aa;margin-top:4px;', text: isDawidActive ? '✓ AKTYWNY W PILOTAŻU' : '⭐ GOTOWY DO JEDNOKLIKOWEJ AKTYWACJI' }))
    ),
    !isDawidActive ? h('p', { style: 'margin:12px 0 8px;font-size:0.95rem;line-height:1.4;', text: 'Konto w Firebase Auth, hasło i żeglarskie zdjęcie profilowe są już skonfigurowane. Kliknij poniżej, aby jednym kliknięciem przypisać Dawidka do pilotażu i natychmiast utworzyć rodzinną rozmowę 1:1 w LUMI Messenger.' }) : null,
    !isDawidActive ? h('button', { class: 'btn primary block', type: 'button', text: '🚀 Aktywuj profil Dawidka i utwórz rozmowę rodzinną', onclick: (e) => activateDawid(e.currentTarget) }) : null,
    isDawidActive ? h('div', { class: 'row', style: 'margin-top:12px;' },
      h('button', { class: 'btn primary', type: 'button', text: '💬 Otwórz czat z Dawidkiem', onclick: () => { const chat = c.familyChats && c.familyChats[me.uid]; if (chat) openChat(chat, DAWID_UID, DAWID_NAME, screenParent); else toast('Rozmowa jest tworzona...'); } }),
      h('a', { class: 'btn ghost', href: '/mess', text: 'Otwórz LUMI Messenger (/mess)' })) : null
  );

  const waitBody = h('tbody');
  try {
    const ws = await getDocs(query(collection(db, 'kids_waitlist'), limit(100)));
    const rows = ws.docs.map(d => ({ ref: d.ref, ...d.data() })).sort((a, b) => ((b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0)));
    for (const w of rows) {
      waitBody.append(h('tr', {},
        h('td', {}, h('strong', { text: w.parentName || '' }), h('br'), h('a', { href: 'mailto:' + String(w.email || ''), text: w.email || '' })),
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
    contactsList.append(h('li', { class: 'contact' }, avatarOf(u, u === me.uid ? 'Ja' : 'Kontakt', true),
      h('span', { class: 'name', text: nameOf(u, u === me.uid ? 'Ja (rodzic)' : 'Kontakt') + (u === me.uid ? ' — Ty' : '') }),
      u !== me.uid ? h('button', { class: 'btn ghost', type: 'button', text: 'Usuń', onclick: async () => { await save({ contacts: c.contacts.filter(x => x !== u) }, 'Kontakt usunięty — dziecko nie może już do niego pisać'); screenParent(); } }) : null));
  }

  const active = c.childUid && c.enabled && !c.revoked;
  const status = active ? note('Pilotaż AKTYWNY — dziecko rozmawia tylko z zatwierdzonymi kontaktami.', 'good')
    : note(c.childUid ? 'Dostęp dziecka WSTRZYMANY — nie może czytać ani wysyłać wiadomości.' : 'Brak zatwierdzonego konta dziecka. Wyślij zaproszenie lub aktywuj Dawidka poniżej.', 'info');
  const myChat = c.familyChats && c.familyChats[me.uid];

  render(
    h('section', { class: 'card pop' },
      h('div', { class: 'who' }, avatarOf(me.uid, 'Rodzic', false), h('div', {}, h('h1', { text: 'Panel rodzica' }), h('p', { class: 'muted', text: 'Masz pełną kontrolę. Każda zmiana działa od razu.' }))),
      status,
      c.childUid ? h('p', { class: 'small', text: 'Rozmowa z dzieckiem jest w Twoim zwykłym LUMI Messenger (okienka prywatne) jako „' + (names[c.childUid] || 'Dziecko') + ' · LUMI KIDS”. To ten sam wątek co tutaj.' }) : null,
      h('div', { class: 'row' },
        c.childUid && myChat ? h('button', { class: 'btn primary', type: 'button', text: '💬 Rozmowa z ' + (names[c.childUid] || 'dzieckiem'), onclick: () => openChat(myChat, c.childUid, (names[c.childUid] || 'Dziecko'), screenParent) }) : null,
        c.childUid && !myChat ? h('button', { class: 'btn primary', type: 'button', text: 'Utwórz rozmowę rodzinną', onclick: async (ev) => { busy(ev.currentTarget, true); try { await ensureChats(c.childUid, Array.from(new Set([...c.contacts, me.uid]))); await save({ contacts: Array.from(new Set([...c.contacts, me.uid])) }); } catch (e) {} screenParent(); } }) : null,
        c.childUid ? h('a', { class: 'btn ghost', href: '/mess', text: 'Otwórz LUMI Messenger' }) : null,
        active ? h('button', { class: 'btn danger', type: 'button', text: '🔒 Cofnij dostęp dziecka', onclick: async () => { if (confirm('Cofnąć dostęp? Dziecko natychmiast przestanie widzieć i wysyłać wiadomości. Historia zostanie zachowana.')) { await save({ enabled: false, revoked: true }, 'Dostęp cofnięty'); screenParent(); } } }) : null,
        c.childUid && !active ? h('button', { class: 'btn ok', type: 'button', text: '▶ Przywróć dostęp', onclick: async () => { await save({ enabled: true, revoked: false }, 'Dostęp przywrócony'); screenParent(); } }) : null)),
    dawidCard,
    c.childUid ? h('section', { class: 'card' },
      h('h2', { text: 'Zdjęcie dziecka (prywatne)' }),
      h('p', { class: 'muted small', text: 'Widzą je tylko: dziecko, Ty i zatwierdzone kontakty — w LUMI KIDS i w Waszej rozmowie w LUMI Messenger. Nie trafia na żadną publiczną stronę ani do wyszukiwarek. Zapisujemy małą miniaturę (256 px).' }),
      h('div', { class: 'row' }, avatarOf(c.childUid, names[c.childUid] || 'D', false),
        h('label', { class: 'btn ghost', for: 'kidphoto', text: avatars[c.childUid] ? 'Zmień zdjęcie' : 'Dodaj zdjęcie' }),
        h('input', { type: 'file', id: 'kidphoto', accept: 'image/jpeg,image/png,image/webp', class: 'sr', onchange: async (ev) => {
          const f = ev.target.files && ev.target.files[0]; if (!f) return;
          try { const url = await fileToSmallDataUrl(f); await setChildPhoto(c.childUid, url); toast('Zdjęcie zapisane prywatnie'); }
          catch (e) { toast(e && e.message === 'type' ? 'Wybierz zdjęcie JPG, PNG lub WEBP.' : 'Nie udało się zapisać zdjęcia.'); }
          screenParent();
        } }),
        avatars[c.childUid] ? h('button', { class: 'btn ghost', type: 'button', text: 'Usuń zdjęcie', onclick: async () => { try { await setChildPhoto(c.childUid, ''); toast('Zdjęcie usunięte'); } catch (e) { toast(friendly(e)); } screenParent(); } }) : null)) : null,
    h('section', { class: 'card grid2' },
      h('div', {}, h('label', { for: 'myname', text: 'Twoja nazwa widoczna dla dziecka' }), myName,
        h('button', { class: 'btn ghost block', type: 'button', text: 'Zapisz', onclick: async () => {
          try { await setDoc(doc(db, 'kids_profiles', me.uid), { displayName: myName.value.trim().slice(0, 40) || 'Rodzic', updatedAt: serverTimestamp() }); names[me.uid] = myName.value.trim(); toast('Zapisano'); } catch (e) { toast(friendly(e)); }
        } })),
      h('div', {}, h('label', { for: 'childname', text: 'Imię dziecka w aplikacji' }), childName,
        h('button', { class: 'btn ghost block', type: 'button', text: 'Zapisz', disabled: !c.childUid, onclick: async () => {
          try { await setDoc(doc(db, 'kids_profiles', c.childUid), { displayName: childName.value.trim().slice(0, 40) || 'Dziecko', updatedAt: serverTimestamp() }); names[c.childUid] = childName.value.trim(); if (c.contacts.length) await ensureChats(c.childUid, c.contacts); toast('Zapisano'); } catch (e) { toast(friendly(e)); }
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
      h('div', { style: 'overflow-x:auto' }, h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: 'E-mail' }), h('th', { text: 'Stan' }), h('th', { text: '' }))), invTable))),
    h('section', { class: 'card' },
      h('h2', { text: 'Zatwierdzone kontakty' }),
      h('p', { class: 'muted small', text: 'Dziecko rozmawia wyłącznie z tymi osobami — każda w swoim zwykłym LUMI Messenger. Bez wyszukiwarki, bez obcych.' }),
      contactsList,
      h('form', { class: 'row', novalidate: true, style: 'margin-top:12px', onsubmit: async (e) => {
        e.preventDefault();
        const u = contactUid.value.trim();
        if (!/^[A-Za-z0-9]{20,40}$/.test(u)) { toast('To nie wygląda na identyfikator konta.'); return; }
        if (u === c.childUid) { toast('To konto dziecka.'); return; }
        try { await save({ contacts: Array.from(new Set([...c.contacts, u])) }); if (c.childUid) await ensureChats(c.childUid, [u]); toast('Kontakt zatwierdzony — rozmowa utworzona'); } catch (e2) {}
        screenParent();
      } }, h('label', { for: 'cuid', class: 'sr', text: 'Identyfikator konta kontaktu' }), contactUid, h('button', { class: 'btn ghost', type: 'submit', text: 'Dodaj kontakt' })),
      h('p', { class: 'muted small', text: 'Np. mama: niech zaloguje się na tej stronie swoim kontem — zobaczy swój identyfikator, który tu wkleisz.' })),
    h('section', { class: 'card' },
      h('h2', { text: 'Zgłoszenia rodzin do pilotażu' }),
      h('p', { class: 'muted small', text: 'Z formularza na polskieradio.cc/kids. Bez danych dzieci — kontakt z rodzicem e-mailem.' }),
      h('div', { style: 'overflow-x:auto' }, h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: 'Rodzic' }), h('th', { text: 'Dzieci' }), h('th', { text: 'Wiadomość' }), h('th', { text: 'Data' }))), waitBody)))
  );
}

onAuthStateChanged(auth, (user) => {
  clearSubs(); names = {}; activeConv = null; myKeyCache = null;
  if (!user) { me = null; logoutBtn.hidden = true; screenLogin(); return; }
  start(user).catch(() => render(h('section', { class: 'card' }, note('Nie udało się wczytać LUMI KIDS. Odśwież stronę.', 'err'))));
});
