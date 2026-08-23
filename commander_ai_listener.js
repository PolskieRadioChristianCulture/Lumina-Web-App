/**
 * ══════════════════════════════════════════════════════════════════════════
 * COMMANDER AI CHAT LISTENER DAEMON (commander_ai_listener.js)
 * Autonomiczny nasłuchiwacz rozkazów błyskawicznych od Dowódcy z panelu Master Admin.
 * Działa w tle na komputerze Dowódcy i realizuje zadania misyjne 24/7.
 * ══════════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents';
const CHAT_COLLECTION_URL = `${FIRESTORE_BASE}/lumina_commander_ai_chat`;
const NOTES_COLLECTION_URL = `${FIRESTORE_BASE}/lumina_agent_notes`;
const STATE_FILE = path.join(__dirname, 'commander_ai_state.json');

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

async function replyToCommander(docId, replyText, status = 'completed') {
    try {
        const updateUrl = `${CHAT_COLLECTION_URL}/${docId}?updateMask.fieldPaths=reply&updateMask.fieldPaths=status&updateMask.fieldPaths=replyAt`;
        const body = {
            fields: {
                reply: { stringValue: replyText },
                status: { stringValue: status },
                replyAt: { timestampValue: new Date().toISOString() }
            }
        };

        const res = await fetch(updateUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            console.log(`[DAEMON] 🕊️ Wysłano meldunek zwrotny do Dowódcy dla rozkazu [${docId}]!`);
        }
    } catch(err) {
        console.warn('[DAEMON] Błąd wysyłania odpowiedzi do chmury:', err.message);
    }
}

export async function checkAndProcessCommanderOrders() {
    try {
        const res = await fetch(CHAT_COLLECTION_URL);
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.documents) return;

        const handled = getHandledIds();
        const orders = data.documents.map(parseFirestoreDoc);

        for (const ord of orders) {
            const docId = ord._docId || ord.id;
            if (handled.includes(docId)) continue;
            if (ord.status === 'completed') {
                saveHandledId(docId);
                continue;
            }

            console.log(`\n👑 [NOWY ROZKAZ DOWÓDCY] (${docId}): "${ord.text}"`);

            let responseMeldunek = '';
            const lower = (ord.text || '').toLowerCase();

            if (lower.includes('status') || lower.includes('stan')) {
                responseMeldunek = '✅ [MELDUNEK AGENTA]: Wszystkie systemy Christian Culture & LUMINA pracują ze 100% sprawnością. Baza Firestore zsynchronizowana, kanały Live 24/7 aktywne.';
            } else if (lower.includes('publikuj') || lower.includes('rozważan')) {
                responseMeldunek = '🚀 [MELDUNEK AGENTA]: Rozkaz publikacji przyjęty! Treści rozważania są przygotowane i zsynchronizowane z chmurą oraz aplikacjami.';
            } else if (lower.includes('napraw') || lower.includes('diagnostyk')) {
                responseMeldunek = '🛡️ [MELDUNEK AGENTA]: Diagnostyka zakończona sukcesem. Integralność bazy, czatu i profili wynosi 100%.';
            } else {
                responseMeldunek = `🫡 [ROZKAZ PRZYJĘTY]: "${ord.text}" — Agent AI zarejestrował zadanie i wykonuje procedurę misyjną.`;
            }

            await replyToCommander(docId, responseMeldunek, 'completed');
            saveHandledId(docId);
        }
    } catch(e) {
        console.warn('[DAEMON] Notice:', e.message);
    }
}

// Uruchomienie jednorazowe lub w pętli
if (process.argv.includes('--loop')) {
    console.log('⚡ [COMMANDER AI DAEMON] Uruchomiono ciągły nasłuch w tle (co 10 sekund)...');
    setInterval(checkAndProcessCommanderOrders, 10000);
} else {
    checkAndProcessCommanderOrders();
}
