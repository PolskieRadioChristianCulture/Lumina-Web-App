/**
 * Kanały CC — połączenie z Mission Control i blok informacyjny WIADOMOŚCI CCN
 * Strażnik Standardów Christian Culture • 2026-10-17
 *
 * Mission Control zapisuje komunikat RDS, stan „na żywo” i ustawienia do projektu Firebase
 * cc-mission-control (mission_control_live/global_config).
 *
 * Ten moduł:
 *   • eksportuje mcDb — bazę projektu cc-mission-control (tylko odczyt, jak w manifeście @ICC),
 *   • publikuje nowy zintegrowany blok WIADOMOŚCI CCN z najciekawszymi informacjami z ekosystemu Christian Culture,
 *   • dynamicznie wczytuje /data/ccn-news-ticker.json i aktualizuje paski dolne na wszystkich kanałach TV,
 *   • gdy dołączony jako <script type="module" src=...> — sam nasłuchuje global_config i:
 *     ustawia window.mcSpecialRdsMessage (RDS + WIADOMOŚCI CCN), pokazuje/ukrywa plakietki LIVE, odświeża pasek,
 *     wysyła zdarzenie 'cc:mission-config' z danymi.
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import { getFirestore, doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

const MC_CONFIG = {
    apiKey: 'AIzaSyDou1gYyuJnuF2WocXEqglfRPqqwMm0Ge4',
    authDomain: 'cc-mission-control.firebaseapp.com',
    projectId: 'cc-mission-control',
    storageBucket: 'cc-mission-control.firebasestorage.app',
    messagingSenderId: '519207260358',
    appId: '1:519207260358:web:d875a610f438ecad2c47c7'
};

const mcApp = getApps().find((a) => a.name === 'cc-mission-control') || initializeApp(MC_CONFIG, 'cc-mission-control');
export const mcDb = getFirestore(mcApp);

export const DEFAULT_CCN_NEWS_ITEMS = [
    { topic: "DZIŚ W EKOSYSTEMIE", text: "Nowe rozważania „Dobrze, że jesteś” (Cezary Rogowski) oraz „Cuda Każdego Dnia” (Andrzej Thiel)" },
    { topic: "BIBLIA ŚPIEWANA LIVE 24/7", text: "Śpiewane Przypowieści Salomona z dynamicznym karaoke TV na żywo (polskieradio.cc/biblia-spiewana-live)" },
    { topic: "CELUJEMY W PIERWSZY MILION", text: "Licznik aktywności ekosystemu na żywo na polskieradio.cc/milion" },
    { topic: "PORTAL LUMINA", text: "Społeczność wiary, profile autorów i dyskusje na polskieradio.cc/lumina" },
    { topic: "AKADEMIA BIBLIJNA", text: "Kurs Codzienny „Z Biblią za Pan Brat” na polskieradio.cc/akademia" },
    { topic: "INTERLINEARNA MOJA BIBLIA", text: "Kody Stronga, hebrajski i greka na polskieradio.cc/mojabiblia" },
    { topic: "BEZPŁATNA BIBLIA PAPIEROWA", text: "Wyślij bezpłatny SMS: BIBLIA pod numer 507 821 789" },
    { topic: "INFOLINIA NADZIEJA CC", text: "Darmowa linia wsparcia duchowego i modlitwy: +48 730 958 583" }
];

export function rdsHtml(message) {
    return `<span style="background: #FF0033; color: #FFFFFF; padding: 2px 10px; border-radius: 4px; font-weight: 900; font-family: 'Montserrat', sans-serif; margin-right: 15px; display: inline-block; box-shadow: 0 0 10px rgba(255,0,51,0.6);"><i class="fa-solid fa-bullhorn"></i> WIADOMOŚĆ SPECJALNA RDS</span> <span style="color: #FFD700; font-weight: 800; margin-right: 25px;">${message}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
}

export function ccnNewsHtml(items) {
    const list = Array.isArray(items) && items.length > 0 ? items : DEFAULT_CCN_NEWS_ITEMS;
    const body = list.map((item, idx) => {
        const prefix = idx > 0 ? `<span style="color: #C4A35A; margin-right: 12px;">✦</span>` : '';
        return `${prefix}<span style="color: #f3d993; font-weight: 800; font-family: 'Montserrat', sans-serif;">${item.topic}:</span> <span style="color: #FFFFFF; font-weight: 600;">${item.text}</span>`;
    }).join(' &nbsp;&nbsp;&nbsp;&nbsp; ');

    return `<span style="background: linear-gradient(135deg, #FFD700 0%, #C4A35A 50%, #8A6E35 100%); color: #000000; padding: 2px 10px; border-radius: 4px; font-weight: 900; font-family: 'Montserrat', sans-serif; margin-right: 15px; display: inline-block; box-shadow: 0 0 12px rgba(196,163,90,0.4);"><i class="fa-solid fa-newspaper"></i> WIADOMOŚCI CCN</span> ${body} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
}

let currentRdsMsg = '';
let currentCcnItems = DEFAULT_CCN_NEWS_ITEMS;

function updateTickerMessage() {
    const rds = currentRdsMsg ? rdsHtml(currentRdsMsg) : '';
    const ccn = ccnNewsHtml(currentCcnItems);
    const combined = rds + ccn;
    window.ccnNewsTickerHtml = ccn;
    if (combined !== window.mcSpecialRdsMessage) {
        window.mcSpecialRdsMessage = combined;
        refreshMarquee();
    }
}

// Pasek kanału bywa budowany równolegle (pierwsze wczytanie wiadomości trwa chwilę i potrafi
// nadpisać świeży komunikat). Dlatego odświeżamy go od razu i jeszcze dwa razy po chwili.
export function refreshMarquee() {
    const run = () => { if (typeof window.loadNewsMarquee === 'function') window.loadNewsMarquee(); };
    run();
    setTimeout(run, 4000);
    setTimeout(run, 15000);
}

async function loadCcnNewsData() {
    try {
        const res = await fetch('/data/ccn-news-ticker.json?t=' + Date.now());
        if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.items) && data.items.length > 0) {
                currentCcnItems = data.items;
                updateTickerMessage();
            }
        }
    } catch (e) {
        // Fallback to built-in items
    }
}

// Inicjalizacja natychmiastowa przy wczytaniu modułu
updateTickerMessage();
loadCcnNewsData();

export function startMissionFeed() {
    if (window.__ccMissionFeedStarted) return;
    window.__ccMissionFeedStarted = true;
    onSnapshot(doc(mcDb, 'mission_control_live', 'global_config'), (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() || {};
        window.ccMissionConfig = data;
        document.querySelectorAll('.live-badge').forEach((badge) => {
            badge.style.display = data.isLive ? 'flex' : 'none';
        });
        currentRdsMsg = typeof data.tickerMessage === 'string' ? data.tickerMessage.trim() : '';
        updateTickerMessage();
        try { window.dispatchEvent(new CustomEvent('cc:mission-config', { detail: data })); } catch (e) {}
    }, (err) => console.warn('[CC] Mission Control — brak połączenia:', err && err.code));
}

// Dołączony bezpośrednio jako skrypt strony → startuje sam (import { mcDb } go nie uruchamia).
if (import.meta.url.includes('autostart=1')) startMissionFeed();
