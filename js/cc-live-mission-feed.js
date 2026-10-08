/**
 * Kanały CC — połączenie z Mission Control (prawdziwe dane na antenie)
 * Strażnik Standardów Christian Culture • 2026-10-07
 *
 * Mission Control zapisuje komunikat RDS, stan „na żywo” i ustawienia do projektu Firebase
 * cc-mission-control (mission_control_live/global_config). Kanały czytały ten dokument z innego
 * projektu (lumina-cc), gdzie go nie ma i gdzie dostęp jest zablokowany — dlatego komunikaty
 * z Mission Control nigdy nie docierały na antenę.
 *
 * Ten moduł:
 *   • eksportuje mcDb — bazę projektu cc-mission-control (tylko odczyt, jak w manifeście @ICC),
 *   • gdy dołączony jako <script type="module" src=...> — sam nasłuchuje global_config i:
 *     ustawia window.mcSpecialRdsMessage, pokazuje/ukrywa plakietki LIVE, odświeża pasek,
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

function rdsHtml(message) {
    return `<span style="background: #FF0033; color: #FFFFFF; padding: 2px 10px; border-radius: 4px; font-weight: 900; font-family: 'Montserrat', sans-serif; margin-right: 15px; display: inline-block; box-shadow: 0 0 10px rgba(255,0,51,0.6);"><i class="fa-solid fa-bullhorn"></i> WIADOMOŚĆ SPECJALNA RDS</span> <span style="color: #FFD700; font-weight: 800; margin-right: 25px;">${message}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
}

// Pasek kanału bywa budowany równolegle (pierwsze wczytanie wiadomości trwa chwilę i potrafi
// nadpisać świeży komunikat). Dlatego odświeżamy go od razu i jeszcze dwa razy po chwili.
function refreshMarquee() {
    const run = () => { if (typeof window.loadNewsMarquee === 'function') window.loadNewsMarquee(); };
    run();
    setTimeout(run, 4000);
    setTimeout(run, 15000);
}

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
        const msg = typeof data.tickerMessage === 'string' ? data.tickerMessage.trim() : '';
        const next = msg ? rdsHtml(msg) : '';
        if (next !== window.mcSpecialRdsMessage) {
            window.mcSpecialRdsMessage = next;
            refreshMarquee();
        }
        try { window.dispatchEvent(new CustomEvent('cc:mission-config', { detail: data })); } catch (e) {}
    }, (err) => console.warn('[CC] Mission Control — brak połączenia:', err && err.code));
}

// Dołączony bezpośrednio jako skrypt strony → startuje sam (import { mcDb } go nie uruchamia).
if (import.meta.url.includes('autostart=1')) startMissionFeed();
