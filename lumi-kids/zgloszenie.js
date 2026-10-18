/**
 * LUMI KIDS — zgłoszenie rodziny do pilotażu (Strażnik Claude, 2026-10-18)
 * Zgłasza się wyłącznie rodzic/opiekun zalogowany kontem Google. Nie zbieramy danych dziecka.
 * Zapis: Firestore kids_waitlist/{uid} — jedno zgłoszenie na konto; odczyt tylko autor i administrator.
 */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const CONFIG = {
  apiKey: 'AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M',
  authDomain: 'lumina-cc.firebaseapp.com',
  projectId: 'lumina-cc',
  storageBucket: 'lumina-cc.firebasestorage.app',
  messagingSenderId: '413985877183',
  appId: '1:413985877183:web:b0c99a686a4fb1b875aa0a'
};
const app = getApps().length ? getApp() : initializeApp(CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
const box = document.getElementById('zgl-app');

function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
const note = (text, kind) => h('p', { class: 'msg ' + kind, role: kind === 'err' ? 'alert' : 'status', text });

function loginView(msg) {
  box.replaceChildren(
    msg ? note(msg, 'err') : '',
    h('button', { class: 'btn primary', type: 'button', text: 'Zaloguj się kontem Google, aby się zgłosić', onclick: async () => {
      try { await signInWithPopup(auth, new GoogleAuthProvider()); }
      catch (e) { loginView('Logowanie nie powiodło się albo okno zostało zamknięte.'); }
    } }),
    h('p', { class: 'small', text: 'Używamy tego samego konta co w LUMINA. Adres e-mail do kontaktu pobierzemy z konta Google.' }));
}

function doneView(d) {
  box.replaceChildren(note('Dziękujemy! Zgłoszenie rodziny jest zapisane' + (d && d.createdAt && d.createdAt.toDate ? ' (' + d.createdAt.toDate().toLocaleDateString('pl-PL') + ')' : '') + '. Odezwiemy się na adres ' + (d && d.email ? d.email : 'z konta Google') + '.', 'good'));
}

function formView(user) {
  const name = h('input', { type: 'text', id: 'zgl-name', maxlength: '80', autocomplete: 'name', required: true, value: user.displayName || '' });
  const count = h('select', { id: 'zgl-count' }, ...[1, 2, 3, 4, 5, 6].map(n => h('option', { value: String(n), text: n === 6 ? '6 lub więcej' : String(n) })));
  const msg = h('textarea', { id: 'zgl-msg', maxlength: '500', placeholder: 'Np. skąd jesteście, czego oczekujecie od LUMI KIDS (bez danych dziecka).' });
  const consent = h('input', { type: 'checkbox', id: 'zgl-ok', required: true });
  const out = h('div');
  const btn = h('button', { class: 'btn primary', type: 'submit', text: 'Wyślij zgłoszenie' });
  box.replaceChildren(h('form', { novalidate: true, onsubmit: async (e) => {
    e.preventDefault(); out.replaceChildren();
    const n = name.value.trim();
    if (!n) { out.replaceChildren(note('Wpisz swoje imię.', 'err')); name.focus(); return; }
    if (!consent.checked) { out.replaceChildren(note('Zaznacz oświadczenie i zgodę na kontakt.', 'err')); consent.focus(); return; }
    btn.disabled = true;
    try {
      const data = { uid: user.uid, email: user.email, parentName: n.slice(0, 80), childrenCount: Number(count.value),
        message: msg.value.trim().slice(0, 500), consent: true, status: 'new', createdAt: serverTimestamp() };
      await setDoc(doc(db, 'kids_waitlist', user.uid), data);
      doneView({ email: user.email });
    } catch (err) {
      out.replaceChildren(note('Nie udało się wysłać zgłoszenia. Jeśli już się zgłaszałeś, zgłoszenie jest zapisane. Spróbuj ponownie później.', 'err'));
    } finally { btn.disabled = false; }
  } },
    h('p', { class: 'small', text: 'Zalogowano jako ' + (user.email || '') }),
    h('label', { for: 'zgl-name', text: 'Imię rodzica / opiekuna' }), name,
    h('label', { for: 'zgl-count', text: 'Ile dzieci chciałoby korzystać z LUMI KIDS?' }), count,
    h('label', { for: 'zgl-msg', text: 'Wiadomość (opcjonalnie)' }), msg,
    h('label', { class: 'check', for: 'zgl-ok' }, consent, h('span', { text: 'Jestem rodzicem lub opiekunem prawnym. Zgadzam się, aby Christian Culture skontaktowało się ze mną w sprawie pilotażu LUMI KIDS. Zgłoszenie mogę w każdej chwili wycofać, pisząc na polskiercctv@gmail.com.' })),
    btn, out));
}

onAuthStateChanged(auth, async (user) => {
  if (!box) return;
  if (!user || user.isAnonymous) { loginView(); return; }
  if (!user.email || !user.emailVerified) { loginView('To konto nie ma potwierdzonego adresu e-mail. Zaloguj się kontem Google.'); return; }
  try {
    const s = await getDoc(doc(db, 'kids_waitlist', user.uid));
    if (s.exists()) { doneView(s.data()); return; }
  } catch (e) { /* brak zgłoszenia lub brak uprawnień — pokaż formularz */ }
  formView(user);
});
