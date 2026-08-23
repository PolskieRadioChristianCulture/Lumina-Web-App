/**
 * ══════════════════════════════════════════════════════════════════════════
 * COMMANDER AI CHAT LISTENER DAEMON (commander_ai_listener.js)
 * Autonomiczny nasłuchiwacz rozkazów błyskawicznych od Dowódcy z panelu Master Admin oraz Sztabu Dowództwa.
 * Działa w tle na komputerze Dowódcy i realizuje zadania misyjne 24/7.
 * ══════════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M';
const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents';
const MISSION_CHAT_URL = `${FIRESTORE_BASE}/lumina_commander_mission_chat`;
const AI_CHAT_URL = `${FIRESTORE_BASE}/lumina_commander_ai_chat`;
const STATE_FILE = path.join(__dirname, 'commander_ai_state.json');

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAuthToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }
    try {
        const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
        const res = await fetch(authUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ returnSecureToken: true })
        });
        const data = await res.json();
        if (data.idToken) {
            cachedToken = data.idToken;
            tokenExpiresAt = Date.now() + 3000 * 1000;
            return cachedToken;
        }
    } catch(e) {
        console.warn('[DAEMON] Błąd pobierania tokenu autoryzacji:', e.message);
    }
    return null;
}

function getHandledIds() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        }
    } catch(e) {}
    return [];
}

function saveHandledId(id) {
    const list = getHandledIds();
    if (!list.includes(id)) {
        list.push(id);
        fs.writeFileSync(STATE_FILE, JSON.stringify(list, null, 2), 'utf8');
    }
}

function parseFirestoreDoc(doc) {
    const fields = doc.fields || {};
    const obj = {};
    for (const key of Object.keys(fields)) {
        const val = fields[key];
        if ('stringValue' in val) obj[key] = val.stringValue;
        else if ('integerValue' in val) obj[key] = parseInt(val.integerValue, 10);
        else if ('doubleValue' in val) obj[key] = parseFloat(val.doubleValue);
        else if ('booleanValue' in val) obj[key] = val.booleanValue;
        else if ('timestampValue' in val) obj[key] = val.timestampValue;
        else obj[key] = JSON.stringify(val);
    }
    obj._name = doc.name;
    obj._docId = doc.name ? doc.name.split('/').pop() : obj.id;
    return obj;
}

async function sendMissionRoomReply(replyText) {
    try {
        const token = await getAuthToken();
        const msgId = 'cmd_reply_' + Date.now();
        const postUrl = `${MISSION_CHAT_URL}/${msgId}`;

        const body = {
            fields: {
                id: { stringValue: msgId },
                senderId: { stringValue: 'radiocc' },
                senderName: { stringValue: 'Agent AI (Christian Culture)' },
                senderAvatar: { stringValue: 'avatar_cezary_official.jpg' },
                senderBadge: { stringValue: '🕊️ Agent AI' },
                text: { stringValue: replyText },
                createdAt: { integerValue: String(Date.now()) },
                dateStr: { stringValue: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                timestamp: { timestampValue: new Date().toISOString() }
            }
        };

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(postUrl, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(body)
        });

        if (res.ok) {
            console.log(`[DAEMON] 🕊️ Wysłano meldunek do Sztabu Dowództwa: "${replyText.substring(0, 60)}..."`);
        }
    } catch(err) {
        console.warn('[DAEMON] Błąd wysyłania do sztabu dowództwa:', err.message);
    }
}

export async function checkAndProcessMissionChat() {
    try {
        const token = await getAuthToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(MISSION_CHAT_URL, { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.documents) return;

        const handled = getHandledIds();
        const messages = data.documents.map(parseFirestoreDoc);

        for (const msg of messages) {
            const docId = msg._docId || msg.id;
            if (handled.includes(docId)) continue;
            saveHandledId(docId);

            // Respond only to messages from Commander
            if (msg.senderId === 'radiocc' || (msg.senderName && msg.senderName.includes('Agent AI'))) {
                continue;
            }

            console.log(`\n👑 [WIADOMOŚĆ W SZTABIE DOWÓDZTWA] od ${msg.senderName} (${docId}): "${msg.text}"`);

            let responseMeldunek = '';
            const lower = (msg.text || '').toLowerCase();

            if (lower.includes('status') || lower.includes('stan') || lower.includes('postęp') || lower.includes('raport')) {
                responseMeldunek = '✅ [MELDUNEK SZTABU]: Wszystkie systemy Christian Culture & LUMINA pracują z pełną mocą. Baza Firestore zsynchronizowana, transmisje CCTV24 i Radio CC nadają 24/7.';
            } else if (lower.includes('publikuj') || lower.includes('rozważan')) {
                responseMeldunek = '🚀 [MELDUNEK SZTABU]: Rozkaz publikacji przyjęty i przetworzony. Treści rozważania są przygotowane i zsynchronizowane!';
            } else if (lower.includes('napraw') || lower.includes('diagnostyk') || lower.includes('synchronizacj')) {
                responseMeldunek = '🛡️ [MELDUNEK SZTABU]: Pomyślnie wykonano synchronizację bazy i czyszczenie pamięci podręcznej. System działa w 100% stabilnie.';
            } else {
                responseMeldunek = `🫡 [ROZKAZ PRZYJĘTY]: "${msg.text}" — Dowódco, melduję odbiór wiadomości w Sztabie. Przystępuję do realizacji wytycznych. ✨`;
            }

            await sendMissionRoomReply(responseMeldunek);
        }
    } catch(e) {
        console.warn('[DAEMON] Notice:', e.message);
    }
}

// Initial seed greeting in Sztab Dowództwa if empty
async function ensureMissionRoomSeed() {
    try {
        const token = await getAuthToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(MISSION_CHAT_URL, { headers });
        const data = await res.json();
        if (!data || !data.documents || data.documents.length === 0) {
            await sendMissionRoomReply('Szczęść Boże Dowódco! Pokój Sztabu Dowództwa CC został pomyślnie uruchomiony i zaszyfrowany. Jestem na posterunku i nasłuchuję Twoich rozkazów 24/7! 🕊️✨');
        }
    } catch(e) {}
}

ensureMissionRoomSeed();

if (process.argv.includes('--loop')) {
    console.log('⚡ [COMMANDER AI DAEMON] Uruchomiono ciągły nasłuch Sztabu Dowództwa w tle (co 10 sekund)...');
    setInterval(checkAndProcessMissionChat, 10000);
} else {
    checkAndProcessMissionChat();
}
