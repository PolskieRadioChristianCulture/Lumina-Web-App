// ══════════════════════════════════════════════════════════════════════════
// LUMINA CHAT PREMIUM — wskaźnik "X pisze…"
// ══════════════════════════════════════════════════════════════════════════
// Jeden plik, dołączany raz do każdej strony z czatem:
//   <script type="module" src="lumina-chat-typing.js"></script>
// (po lumina-db.js — korzysta z window.luminaDb / window.LuminaDB)
// ══════════════════════════════════════════════════════════════════════════

import {
    doc, setDoc, onSnapshot, deleteField
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

function db() { return window.luminaDb; }

function myId() {
    const u = window.LuminaDB?.getCurrentUser?.();
    const p = window.LuminaDB?.getCurrentProfile?.();
    return (p?.slug || p?.uid || u?.slug || u?.uid || localStorage.getItem('lumina_current_user_slug') || 'guest').toLowerCase();
}

// Dokument lumina_typing/{chatId} = { [userId]: timestampOstatniejAktywności }
// Ktoś jest uznawany za piszącego, jeśli jego znacznik ma mniej niż 5 sekund —
// dzięki temu, jeśli przeglądarka się zawiesi/zamknie w trakcie pisania,
// wskaźnik sam zniknie, zamiast zostać "zablokowany" na zawsze.

let clearTimer = null;

async function setTypingStatus(chatId, isTyping) {
    if (!db() || !chatId) return;
    clearTimeout(clearTimer);
    try {
        await setDoc(doc(db(), 'lumina_typing', chatId), { [myId()]: isTyping ? Date.now() : deleteField() }, { merge: true });
    } catch (e) { /* wskaźnik pisania nie jest krytyczny — ciche niepowodzenie */ }
    if (isTyping) {
        clearTimer = setTimeout(() => setTypingStatus(chatId, false), 4000);
    }
}

// Debounce: jedno zapytanie do bazy na "sesję pisania", nie na każdy znak.
let debounceTimer = null;
function notifyTyping(chatId) {
    if (debounceTimer) return;
    setTypingStatus(chatId, true);
    debounceTimer = setTimeout(() => { debounceTimer = null; }, 2000);
}

function listenToTypingStatus(chatId, onUpdate) {
    if (!db() || !chatId) return () => {};
    return onSnapshot(doc(db(), 'lumina_typing', chatId), (snap) => {
        if (!snap.exists()) return onUpdate([]);
        const data = snap.data();
        const now = Date.now();
        const typingUserIds = Object.entries(data)
            .filter(([uid, ts]) => uid !== myId() && typeof ts === 'number' && (now - ts) < 5000)
            .map(([uid]) => uid);
        onUpdate(typingUserIds);
    }, (err) => console.warn('[Typing] listener:', err.message));
}

/**
 * Podpina wskaźnik pisania pod istniejące pole tekstowe + kontener czatu,
 * bez wymagania zmiany HTML poza jedną linią (element wskaźnika).
 *
 * @param {string} inputElId - id pola <input>/<textarea>
 * @param {string} chatId - identyfikator rozmowy ('public' dla czatu ogólnego, albo chatId DM)
 * @param {string} indicatorElId - id elementu, w którym wyświetlić "X pisze…"
 * @param {(ids:string[]) => string} nameResolver - zamienia listę ID piszących na czytelny tekst
 */
function attachTypingIndicator(inputElId, chatId, indicatorElId, nameResolver) {
    const input = document.getElementById(inputElId);
    if (input && !input._luminaTypingBound) {
        input.addEventListener('input', () => notifyTyping(chatId));
        input._luminaTypingBound = true;
    }

    listenToTypingStatus(chatId, (typingIds) => {
        const el = document.getElementById(indicatorElId);
        if (!el) return;
        if (!typingIds.length) {
            el.classList.remove('lumina-typing-visible');
            return;
        }
        const label = nameResolver ? nameResolver(typingIds) : `${typingIds.length} osoba/y pisze…`;
        el.innerHTML = `<span class="lumina-typing-dots"><span></span><span></span><span></span></span> ${label}`;
        el.classList.add('lumina-typing-visible');
    });
}

window.LuminaDB = window.LuminaDB || {};
Object.assign(window.LuminaDB, { notifyTyping, setTypingStatus, listenToTypingStatus, attachTypingIndicator });
