// ══════════════════════════════════════════════════════════════════════════
// LUMINA — Silnik Odznak Społeczności (prawdziwe, zdobywane, 3D CSS)
// ══════════════════════════════════════════════════════════════════════════
// Jeden plik, dołączany raz do każdej strony, która ma pokazywać/przyznawać
// odznaki:
//   <script type="module" src="lumina-badges-engine.js"></script>
// (po lumina-db.js)
//
// Zasada: ŻADNA odznaka nie jest przyznawana lokalnie/na sztywno. Każda
// zapisywana jest jako prawdziwy dokument w Firestore (lumina_user_badges),
// tworzony wyłącznie przez Cloud Functions (functions/lumina-badges-functions.js)
// na podstawie realnych zdarzeń — nigdy przez sam front-end.
// ══════════════════════════════════════════════════════════════════════════

import {
    collection, doc, setDoc, onSnapshot, query, orderBy, serverTimestamp, increment
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

function db() { return window.luminaDb || (window.LuminaDB && window.LuminaDB.db); }
function myId() {
    const u = window.LuminaDB?.getCurrentUser?.();
    const p = window.LuminaDB?.getCurrentProfile?.();
    const raw = p?.slug || p?.uid || u?.slug || u?.uid || localStorage.getItem('lumina_current_user_slug') || 'guest';
    return window.LuminaDB?.normalizeChatUserId ? window.LuminaDB.normalizeChatUserId(raw) : raw.toLowerCase();
}

// ══════════════════════════════════════════════════════════════════════════
// KATALOG ODZNAK — jedyne źródło prawdy o wyglądzie i opisie. Rzeczywiste
// PRZYZNAWANIE dzieje się w Cloud Functions; tu tylko definiujemy, jak
// odznaka wygląda i co oznacza.
// ══════════════════════════════════════════════════════════════════════════
export const BADGE_CATALOG = {
    // ── DOCENIĆ ──
    founder: {
        name: 'Fundator LUMINA', category: 'doceniamy', tier: 'gold',
        icon: 'fa-solid fa-crown',
        description: 'Jeden z pierwszych 100 członków społeczności LUMINA.',
    },
    one_year: {
        name: 'Rok w Rodzinie', category: 'doceniamy', tier: 'silver',
        icon: 'fa-solid fa-seedling',
        description: 'Rok nieprzerwanej obecności w społeczności LUMINA.',
    },
    faithful_voice: {
        name: 'Wierny Głos', category: 'doceniamy', tier: 'bronze',
        icon: 'fa-solid fa-heart-circle-check',
        description: '30 dni z rzędu aktywności w LUMINA.',
    },
    // ── ZAINSPIROWAĆ ──
    morning_warrior: {
        name: 'Poranny Wojownik Modlitwy', category: 'inspirujemy', tier: 'bronze',
        icon: 'fa-solid fa-sun',
        description: '7 dni z rzędu porannego rozważania ze Słowem Bożym.',
    },
    word_disciple: {
        name: 'Uczeń Słowa', category: 'inspirujemy', tier: 'silver',
        icon: 'fa-solid fa-book-bible',
        description: '30 dni z rzędu porannego rozważania ze Słowem Bożym.',
    },
    ckd_reader: {
        name: 'Czytelnik Cudów', category: 'inspirujemy', tier: 'bronze',
        icon: 'fa-solid fa-dove',
        description: '14 dni z rzędu czytania "Cuda Każdego Dnia".',
    },
    // ── AKTYWIZOWAĆ ──
    first_step: {
        name: 'Pierwszy Krok', category: 'aktywizujemy', tier: 'bronze',
        icon: 'fa-solid fa-shoe-prints',
        description: 'Pierwszy wpis na Tablicy Społeczności.',
    },
    bridge_builder: {
        name: 'Budowniczy Mostów', category: 'aktywizujemy', tier: 'silver',
        icon: 'fa-solid fa-people-arrows',
        description: '10 osób obserwuje ten profil.',
    },
    ambassador: {
        name: 'Ambasador', category: 'aktywizujemy', tier: 'gold',
        icon: 'fa-solid fa-bullhorn',
        description: 'Udostępnił(a) treści LUMINA 5 razy, niosąc dobrą nowinę dalej.',
    },
};

const TIER_COLORS = {
    bronze: { base: '#a9633a', shine: '#e0a575', ring: '#c47a4e' },
    silver: { base: '#8a94a3', shine: '#e7ecf2', ring: '#aab4c2' },
    gold:   { base: '#c99a2e', shine: '#ffe9a8', ring: '#e3b94a' },
};

let stylesInjected = false;
function injectBadgeStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    const style = document.createElement('style');
    style.textContent = `
        .lumina-badge-3d {
            position: relative; width: 64px; height: 64px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; flex-shrink: 0;
            transform-style: preserve-3d; perspective: 300px;
            transition: transform 0.35s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.35s ease;
        }
        .lumina-badge-3d:hover, .lumina-badge-3d:focus-visible {
            transform: rotateY(18deg) rotateX(-8deg) translateY(-3px);
        }
        .lumina-badge-3d .lumina-badge-icon { font-size: 1.4rem; color: #fff8e6; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.4)); z-index: 2; }
        .lumina-badge-3d.locked { filter: grayscale(1) brightness(0.55); cursor: default; }
        .lumina-badge-3d.locked:hover { transform: none; }
        .lumina-badge-gallery { display: flex; flex-wrap: wrap; gap: 14px; padding: 4px 0; }
        .lumina-badge-tooltip {
            position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
            background: rgba(10,14,26,0.97); border: 1px solid rgba(255,255,255,0.15);
            padding: 8px 12px; border-radius: 10px; font-size: 0.74rem; color: #e2e8f0;
            white-space: nowrap; max-width: 220px; white-space: normal; text-align: center;
            opacity: 0; pointer-events: none; transition: opacity 0.15s ease; z-index: 50;
        }
        .lumina-badge-3d:hover .lumina-badge-tooltip { opacity: 1; }
        .lumina-badge-tooltip b { color: #fef08a; display: block; margin-bottom: 2px; }

        @keyframes luminaBadgeUnlockPop {
            0% { transform: scale(0.3) rotateY(0deg); opacity: 0; }
            60% { transform: scale(1.15) rotateY(360deg); opacity: 1; }
            100% { transform: scale(1) rotateY(360deg); opacity: 1; }
        }
        .lumina-badge-unlock-modal-badge { animation: luminaBadgeUnlockPop 0.9s cubic-bezier(0.2,0.8,0.2,1); }
    `;
    document.head.appendChild(style);
}

function badgeGradient(tier) {
    const c = TIER_COLORS[tier] || TIER_COLORS.bronze;
    return `radial-gradient(circle at 32% 28%, ${c.shine}, ${c.base} 55%, ${c.base} 100%)`;
}

/**
 * Renderuje jedną odznakę 3D. locked=true pokazuje wyszarzoną, zablokowaną wersję.
 */
export function renderBadge3D(badgeId, { locked = false } = {}) {
    const b = BADGE_CATALOG[badgeId];
    if (!b) return '';
    injectBadgeStyles();
    const colors = TIER_COLORS[b.tier] || TIER_COLORS.bronze;
    return `
        <div class="lumina-badge-3d ${locked ? 'locked' : ''}" tabindex="0"
             style="background:${badgeGradient(b.tier)}; box-shadow: 0 4px 12px rgba(0,0,0,0.4), inset 0 2px 3px rgba(255,255,255,0.35), inset 0 -3px 4px rgba(0,0,0,0.35), 0 0 0 2px ${colors.ring};">
            <i class="${b.icon} lumina-badge-icon"></i>
            <div class="lumina-badge-tooltip"><b>${locked ? '🔒 ' : ''}${b.name}</b>${b.description}</div>
        </div>`;
}

/**
 * Subskrybuje i renderuje galerię odznak danego użytkownika w czasie
 * rzeczywistym — zdobyte w kolorze, pozostałe z katalogu jako zablokowane.
 */
export function renderBadgeGallery(targetUid, containerId) {
    if (!db() || !targetUid) return () => {};
    const container = document.getElementById(containerId);
    if (!container) return () => {};

    return onSnapshot(collection(db(), 'lumina_user_badges'), (snap) => {
        const earned = new Set();
        snap.forEach(d => { if (d.data().uid === targetUid) earned.add(d.data().badgeId); });

        container.innerHTML = `<div class="lumina-badge-gallery">` +
            Object.keys(BADGE_CATALOG).map(id => renderBadge3D(id, { locked: !earned.has(id) })).join('') +
            `</div>`;
    }, (err) => console.warn('[Badges] galeria:', err.message));
}

// ══════════════════════════════════════════════════════════════════════════
// ODSŁUCH NOWO ZDOBYTYCH ODZNAK — modal celebracyjny, gdy Cloud Function
// przyzna coś nowego bieżącemu użytkownikowi.
// ══════════════════════════════════════════════════════════════════════════
let knownBadgeIds = null;
export function listenForNewBadges() {
    if (!db()) return () => {};
    const uid = myId();
    return onSnapshot(collection(db(), 'lumina_user_badges'), (snap) => {
        const mine = new Set();
        snap.forEach(d => { if (d.data().uid === uid) mine.add(d.data().badgeId); });

        if (knownBadgeIds === null) { knownBadgeIds = mine; return; } // pierwsze wczytanie — nie pokazuj wszystkiego na raz

        for (const badgeId of mine) {
            if (!knownBadgeIds.has(badgeId)) showBadgeUnlockedModal(badgeId);
        }
        knownBadgeIds = mine;
    }, (err) => console.warn('[Badges] nasłuch nowych odznak:', err.message));
}

function showBadgeUnlockedModal(badgeId) {
    const b = BADGE_CATALOG[badgeId];
    if (!b) return;
    injectBadgeStyles();

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(4,5,10,0.82); z-index:100050; display:flex; align-items:center; justify-content:center; padding:20px;';
    overlay.innerHTML = `
        <div style="background:#0b1020; border:1px solid rgba(255,255,255,0.15); border-radius:22px; padding:32px 24px; max-width:320px; width:100%; text-align:center; box-shadow:0 30px 80px rgba(0,0,0,0.6);">
            <div style="display:flex; justify-content:center; margin-bottom:18px;">
                <div class="lumina-badge-unlock-modal-badge">${renderBadge3D(badgeId).replace('width:64px; height:64px', 'width:100px; height:100px')}</div>
            </div>
            <div style="font-size:0.72rem; letter-spacing:.12em; text-transform:uppercase; color:#94a3b8; margin-bottom:6px;">Nowa odznaka!</div>
            <div style="font-size:1.2rem; font-weight:800; color:#fef08a; margin-bottom:8px;">${b.name}</div>
            <div style="font-size:0.86rem; color:#cbd5e1; margin-bottom:22px; line-height:1.4;">${b.description}</div>
            <button id="luminaBadgeUnlockClose" style="padding:10px 28px; border-radius:20px; border:none; background:linear-gradient(90deg,#ec4899,#8b5cf6); color:#fff; font-weight:800; cursor:pointer; font-family:inherit;">Wspaniale! 🙏</button>
        </div>`;
    document.body.appendChild(overlay);
    document.getElementById('luminaBadgeUnlockClose').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

// ══════════════════════════════════════════════════════════════════════════
// CHECK-INY AKTYWNOŚCI — zasilają dane, na podstawie których Cloud Functions
// realnie przyznają odznaki oparte o passy (streaki). Bez tych zapisów
// odznaki duchowe/lojalnościowe nie miałyby żadnych danych do sprawdzenia.
// ══════════════════════════════════════════════════════════════════════════
function todayKey() { return new Date().toISOString().slice(0, 10); }

async function checkInStreak(streakField, dateField) {
    if (!db()) return;
    const uid = myId();
    const ref = doc(db(), 'lumina_activity_streaks', uid);
    try {
        const { getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : {};
        const today = todayKey();
        const lastDate = data[dateField];

        if (lastDate === today) return; // już zaliczone dzisiaj

        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const continued = lastDate === yesterday;
        const newStreak = continued ? (data[streakField] || 0) + 1 : 1;

        await setDoc(ref, { uid, [streakField]: newStreak, [dateField]: today }, { merge: true });
    } catch (e) {
        console.warn(`[Badges] check-in ${streakField}:`, e.message);
    }
}

/** Wywołaj raz dziennie przy wejściu do aplikacji. */
export function checkInDailyActivity() { checkInStreak('loginStreak', 'lastLoginDate'); }
/** Wywołaj, gdy użytkownik faktycznie otworzy/przeczyta poranne rozważanie. */
export function checkInMorningDevotion() { checkInStreak('devotionStreak', 'lastDevotionDate'); }
/** Wywołaj, gdy użytkownik otworzy wpis "Cuda Każdego Dnia". */
export function checkInCkdRead() { checkInStreak('ckdStreak', 'lastCkdDate'); }

window.recordShareEvent = async function ({ platform, url, title }) {
    if (!db()) return;
    try {
        const uid = myId();
        await setDoc(doc(collection(db(), 'lumina_share_events')), {
            uid, platform, url, title: title || '', timestamp: serverTimestamp(),
        });
    } catch (e) {
        console.warn('[Badges] recordShareEvent:', e.message);
    }
};

window.LuminaBadges = {
    BADGE_CATALOG, renderBadge3D, renderBadgeGallery, listenForNewBadges,
    checkInDailyActivity, checkInMorningDevotion, checkInCkdRead,
};

if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                try {
                    checkInDailyActivity();
                    listenForNewBadges();
                } catch(e) {}
            }, 1200);
        });
    } else {
        setTimeout(() => {
            try {
                checkInDailyActivity();
                listenForNewBadges();
            } catch(e) {}
        }, 1200);
    }
}

