/**
 * Agent Notes Manager for LUMINA & Christian Culture
 * Used by Antigravity Agent when the Commander calls '@N' or '@Noty'
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/lumina_agent_notes';
const RESOLVED_FILE = path.join(__dirname, 'agent_notes_resolved.json');

function getResolvedIds() {
    try {
        if (fs.existsSync(RESOLVED_FILE)) {
            return JSON.parse(fs.readFileSync(RESOLVED_FILE, 'utf8'));
        }
    } catch (e) {}
    return [];
}

function saveResolvedId(id) {
    const list = getResolvedIds();
    if (!list.includes(id)) {
        list.push(id);
        fs.writeFileSync(RESOLVED_FILE, JSON.stringify(list, null, 2), 'utf8');
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

async function fetchNotes() {
    try {
        const res = await fetch(FIRESTORE_URL);
        const data = await res.json();
        if (!data || !data.documents) {
            console.log('✨ Brak oczekujących notatek od Dowódcy w chmurze (0 zadań).');
            return [];
        }
        const notes = data.documents.map(parseFirestoreDoc);
        return notes;
    } catch (err) {
        console.error('Błąd pobierania notatek:', err.message);
        return [];
    }
}

async function main() {
    const args = process.argv.slice(2);
    if (args[0] === '--resolve' && args[1]) {
        saveResolvedId(args[1]);
        console.log(`✅ Nota [${args[1]}] została oznaczona jako wykonana (status: done)!`);
        return;
    }

    console.log('\n🎯 ══════════ DZIENNIK ROZKAZÓW / NOT DLA AGENTA (@N) ══════════\n');
    const notes = await fetchNotes();
    if (notes.length === 0) return;

    const resolvedIds = getResolvedIds();
    const pending = notes.filter(n => (n.status || 'pending') === 'pending' && !resolvedIds.includes(n._docId || n.id));
    const resolved = notes.filter(n => n.status === 'done' || resolvedIds.includes(n._docId || n.id));

    console.log(`📌 Oczekujące zadania od Dowódcy (${pending.length}):\n`);
    pending.forEach((n, idx) => {
        console.log(`[${idx + 1}] ID: ${n._docId || n.id}`);
        console.log(`    📁 Strona: ${n.page || 'lumina.html'}`);
        console.log(`    🎯 Selektor: ${n.selector || '-'}`);
        console.log(`    🏷️ Tag: ${n.tag || '-'}`);
        if (n.snippet) console.log(`    🔍 Fragment: ${n.snippet}`);
        console.log(`    📝 ROZKAZ DOWÓDCY: "${n.note}"`);
        console.log(`    ⚡ Priorytet: ${n.priority || 'normal'} | Kategoria: ${n.category || 'Wygląd'}`);
        console.log(`    ⏱️ Data: ${n.createdAt || '-'}\n`);
    });

    if (resolved.length > 0) {
        console.log(`✔️ Wcześniej wykonane (${resolved.length}):`);
        resolved.forEach(n => console.log(`  - [${n._docId || n.id}] ${n.page}: "${n.note}" (Wykonano ✅)`));
    }
    console.log('\n═══════════════════════════════════════════════════════════════\n');
}

main();
