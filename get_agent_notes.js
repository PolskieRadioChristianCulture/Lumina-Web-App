/**
 * Agent Notes Manager for LUMINA & Christian Culture
 * Used by Antigravity Agent when the Commander calls '@N' or '@Noty'
 */

const FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/lumina_agent_notes';

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

async function resolveNote(docId) {
    try {
        const docUrl = `${FIRESTORE_URL}/${docId}?updateMask.fieldPaths=status&updateMask.fieldPaths=resolvedAt`;
        const payload = {
            fields: {
                status: { stringValue: 'done' },
                resolvedAt: { stringValue: new Date().toISOString() }
            }
        };
        const res = await fetch(docUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        console.log(`✅ Nota [${docId}] została oznaczona jako wykonana (status: done)!`);
    } catch (err) {
        console.error(`Błąd aktualizacji noty ${docId}:`, err.message);
    }
}

async function main() {
    const args = process.argv.slice(2);
    if (args[0] === '--resolve' && args[1]) {
        await resolveNote(args[1]);
        return;
    }

    console.log('\n🎯 ══════════ DZIENNIK ROZKAZÓW / NOT DLA AGENTA (@N) ══════════\n');
    const notes = await fetchNotes();
    if (notes.length === 0) return;

    const pending = notes.filter(n => (n.status || 'pending') === 'pending');
    const resolved = notes.filter(n => n.status === 'done');

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
        console.log(`\n✔️ Wcześniej wykonane (${resolved.length}):`);
        resolved.forEach(n => console.log(`  - [${n._docId || n.id}] ${n.page}: "${n.note}" (Wykonano)`));
    }
    console.log('\n═══════════════════════════════════════════════════════════════\n');
}

main();
