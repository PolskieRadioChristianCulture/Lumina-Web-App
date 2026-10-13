/**
 * CCN Ogłoszenia — wspólne ogłoszenia społeczności (Strażnik, 2026-10-13)
 *
 * Wcześniej formularz „Dodaj ogłoszenie” zapisywał ogłoszenie tylko w przeglądarce autora
 * (localStorage) — nikt inny go nie widział. Teraz ogłoszenie trafia do Firestore (projekt lumina-cc)
 * i widzą je wszyscy odwiedzający.
 *
 * - Kolekcja `user_posts`, pole `kind: 'cc_ogloszenie'` — istniejące reguły: odczyt publiczny,
 *   zapis tylko zalogowany członek (nie anonimowy) z `authorUid == auth.uid`,
 *   usuwanie: autor lub Master Admin. Nie zmienia reguł bezpieczeństwa.
 * - Logowanie wspólne z LUMINA (ta sama aplikacja Firebase na tej samej domenie).
 * - Linki i obrazy tylko https:// lub ścieżki z tej domeny.
 */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, collection, query, where, limit, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const CONFIG = {
    apiKey: 'AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M',
    authDomain: 'lumina-cc.firebaseapp.com',
    projectId: 'lumina-cc',
    storageBucket: 'lumina-cc.firebasestorage.app',
    messagingSenderId: '413985877183',
    appId: '1:413985877183:web:b0c99a686a4fb1b875aa0a'
};
const KIND = 'cc_ogloszenie';
const COLLECTION = 'user_posts';
const ADMINS = ['nazirczarkes@gmail.com', 'radiochristianculture@gmail.com', 'czarekrogowski3@gmail.com',
    'polskieradiocc@gmail.com', 'studiodees7@gmail.com', 'polskiercctv@gmail.com'];
const TYPES = ['oddam', 'pomoge', 'potrzebuje', 'szukam_fachowca', 'polecam_fachowca', 'sprzedam', 'kupie', 'zamienie'];
const CATEGORIES = ['fachowcy', 'inne', 'podroze', 'nocleg', 'rodzina_dzieci', 'ubrania', 'nieruchomosci', 'motoryzacja',
    'zywnosc', 'praca', 'opieka', 'uslugi', 'sprzet', 'duchowe'];

const app = getApps().length ? getApp() : initializeApp(CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
let remoteAds = [];

function text(v, max) { return typeof v === 'string' ? v.trim().slice(0, max) : ''; }
function safeUrl(v) {
    const s = text(v, 2000);
    if (!s) return '';
    if (/^\/(?!\/)/.test(s)) return s;
    try { const u = new URL(s); return u.protocol === 'https:' ? u.href : ''; } catch (e) { return ''; }
}
function isMember(u) { return !!(u && !u.isAnonymous); }
function isAdmin(u) { return !!(u && u.emailVerified && ADMINS.includes(String(u.email || '').toLowerCase())); }
function fmtDate(ts) {
    const ms = ts && typeof ts.toMillis === 'function' ? ts.toMillis() : 0;
    return ms ? 'Dodano ' + new Date(ms).toLocaleDateString('pl-PL') : 'Dodano niedawno';
}

function toAd(id, d) {
    const media = Array.isArray(d.mediaUrls) ? d.mediaUrls.map(safeUrl).filter(Boolean).slice(0, 6) : [];
    return {
        id: 'fs-' + id,
        _docId: id,
        _authorUid: d.authorUid,
        _ms: d.createdAt && typeof d.createdAt.toMillis === 'function' ? d.createdAt.toMillis() : 0,
        title: text(d.title, 140),
        type: TYPES.includes(d.type) ? d.type : 'pomoge',
        category: CATEGORIES.includes(d.category) ? d.category : 'inne',
        priceText: text(d.priceText, 80) || 'Do uzgodnienia',
        description: text(d.description, 4000),
        location: text(d.location, 120) || 'Polska',
        contactName: text(d.contactName, 120),
        contactEmail: text(d.contactEmail, 160) || undefined,
        contactPhone: text(d.contactPhone, 40) || undefined,
        luminaProfileUrl: safeUrl(d.luminaProfileUrl) || undefined,
        imageUrl: safeUrl(d.imageUrl) || undefined,
        mediaUrls: media.length ? media : undefined,
        youtubeUrl: safeUrl(d.youtubeUrl) || undefined,
        date: fmtDate(d.createdAt),
        urgent: false,
        isCommunityVerified: false,
        canDelete: false
    };
}

function withPermissions(list) {
    return list.map(a => ({ ...a, canDelete: !!(currentUser && (a._authorUid === currentUser.uid || isAdmin(currentUser))) }));
}

function push() {
    const set = window.__ccOglSetAds;
    if (typeof set !== 'function') return;
    const fresh = withPermissions(remoteAds);
    set(prev => {
        const others = (prev || []).filter(a => !(a && typeof a.id === 'string' && a.id.startsWith('fs-')));
        // Ogłoszenia społeczności przed stałymi ogłoszeniami Christian Culture (pierwsze zostaje list „Szukamy domu”).
        const pinned = others.filter(a => a && a.urgent);
        const rest = others.filter(a => !(a && a.urgent));
        return [...pinned, ...fresh, ...rest];
    });
}

async function load() {
    try {
        const snap = await getDocs(query(collection(db, COLLECTION), where('kind', '==', KIND), limit(300)));
        const list = [];
        snap.forEach(s => {
            const d = s.data() || {};
            if (d.status === 'hidden' || !d.title || !d.description) return;
            list.push(toAd(s.id, d));
        });
        list.sort((a, b) => b._ms - a._ms);
        remoteAds = list;
        push();
    } catch (e) {
        console.warn('[CCN Ogłoszenia] Nie udało się wczytać ogłoszeń społeczności.');
    }
}

async function ensureMember() {
    if (isMember(auth.currentUser)) return auth.currentUser;
    try {
        const res = await signInWithPopup(auth, new GoogleAuthProvider());
        if (isMember(res.user)) return res.user;
    } catch (e) { /* anulowane lub zablokowane okno */ }
    throw new Error('Aby opublikować ogłoszenie, zaloguj się kontem Google (to samo konto co w LUMINA).');
}

async function publish(ad) {
    // Logowanie startuje od razu (ten sam gest kliknięcia), żeby przeglądarka nie zablokowała okna.
    const user = await ensureMember();
    const data = {
        kind: KIND,
        status: 'published',
        authorUid: user.uid,
        authorName: text(user.displayName, 120),
        title: text(ad && ad.title, 140),
        type: TYPES.includes(ad && ad.type) ? ad.type : 'pomoge',
        category: CATEGORIES.includes(ad && ad.category) ? ad.category : 'inne',
        priceText: text(ad && ad.priceText, 80),
        description: text(ad && ad.description, 4000),
        location: text(ad && ad.location, 120),
        contactName: text(ad && ad.contactName, 120),
        contactEmail: text(ad && ad.contactEmail, 160),
        contactPhone: text(ad && ad.contactPhone, 40),
        luminaProfileUrl: safeUrl(ad && ad.luminaProfileUrl),
        imageUrl: safeUrl(ad && ad.imageUrl),
        mediaUrls: Array.isArray(ad && ad.mediaUrls) ? ad.mediaUrls.map(safeUrl).filter(Boolean).slice(0, 6) : [],
        youtubeUrl: safeUrl(ad && ad.youtubeUrl),
        createdAt: serverTimestamp()
    };
    if (!data.title || !data.description || !data.contactName) throw new Error('Wypełnij tytuł, opis oraz imię/dane kontaktowe.');
    let ref;
    try {
        ref = await addDoc(collection(db, COLLECTION), data);
    } catch (e) {
        throw new Error('Nie udało się zapisać ogłoszenia. Spróbuj ponownie za chwilę.');
    }
    const ad2 = toAd(ref.id, { ...data, createdAt: { toMillis: () => Date.now() } });
    remoteAds = [ad2, ...remoteAds.filter(a => a.id !== ad2.id)];
    push();
    return withPermissions([ad2])[0];
}

async function remove(id) {
    const ad = remoteAds.find(a => a.id === id);
    if (!ad) return;
    if (!window.confirm('Usunąć to ogłoszenie? Tej operacji nie można cofnąć.')) return;
    try {
        await deleteDoc(doc(db, COLLECTION, ad._docId));
        remoteAds = remoteAds.filter(a => a.id !== id);
        location.reload();
    } catch (e) {
        window.alert('Nie udało się usunąć ogłoszenia. Usunąć może tylko autor lub administrator.');
    }
}

window.CCOgloszeniaStore = { publish, remove, reload: load };
window.addEventListener('cc-ogloszenia-ready', push);
onAuthStateChanged(auth, u => { currentUser = u; push(); });
load();
