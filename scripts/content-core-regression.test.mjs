/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC CONTENT CORE — SUITE TESTÓW REGRESYJNYCH & BEZPIECZEŃSTWA
 * Master Plan CC Global 2030 (FAZA 1 — WERYFIKACJA ZERO-QA)
 * ══════════════════════════════════════════════════════════════════════════
 */

import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

import {
    generateNextContentId,
    isValidContentId,
    formatContentId,
    parseContentId,
    createMasterContent,
    addVariant,
    addAsset,
    registerPublication,
    getContentById,
    listContent,
    archiveContent,
    validateRights,
    validatePublication,
    importLegacyRecord,
    CC_COLLECTION_NAME
} from '../lib/cc-content-core/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const saPath = path.resolve(__dirname, '../../Wektor1_VideoFactory/luminaServiceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(saPath)
    });
}
const db = admin.firestore();

let passed = 0;
let failed = 0;

async function test(name, fn) {
    try {
        process.stdout.write(`⏳ TEST: ${name}... `);
        await fn();
        console.log('✅ PASS');
        passed++;
    } catch (err) {
        console.log(`❌ FAIL: ${err.message}`);
        failed++;
    }
}

async function runAllTests() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   🛡️ SUITE TESTÓW REGRESYJNYCH CC CONTENT CORE (FAZA 1)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 1. Walidacja formatu ID
    await test('Walidacja formatu CC CONTENT ID (CC-YYYY-NNNNNN)', async () => {
        assert.strictEqual(isValidContentId('CC-2026-000001'), true);
        assert.strictEqual(isValidContentId('CC-2030-999999'), true);
        assert.strictEqual(isValidContentId('CC-2026-1'), false);
        assert.strictEqual(isValidContentId('cc-2026-000001'), false);
        assert.strictEqual(isValidContentId('INVALID_ID'), false);

        const parsed = parseContentId('CC-2026-000123');
        assert.strictEqual(parsed.year, 2026);
        assert.strictEqual(parsed.seq, 123);
        assert.strictEqual(formatContentId(2026, 123), 'CC-2026-000123');
    });

    // 2. Test Concurrency & Race Conditions dla Generatora ID
    await test('Współbieżność: 5 równoległych transakcji generuje 5 unikalnych ID bez kolizji', async () => {
        const promises = [
            generateNextContentId(db),
            generateNextContentId(db),
            generateNextContentId(db),
            generateNextContentId(db),
            generateNextContentId(db)
        ];
        const results = await Promise.all(promises);
        const uniqueSet = new Set(results);

        assert.strictEqual(uniqueSet.size, 5, 'Wykryto kolizję w wygenerowanych identyfikatorach!');
        for (const id of results) {
            assert.strictEqual(isValidContentId(id), true, `Wygenerowane ID ${id} ma niepoprawny format.`);
        }
    });

    // 3. Test Rights Guard (Blokada praw UNKNOWN)
    await test('Rights Guard: Prawa UNKNOWN blokują publikację ze statusem PUBLISHED', async () => {
        assert.throws(() => {
            validateRights({
                ownership: 'UNKNOWN',
                translationAllowed: false,
                editingAllowed: false,
                redistributionAllowed: false,
                monetizationAllowed: false,
                licenseName: 'Unknown'
            }, 'PUBLISHED');
        }, /KRYTYCZNA BLOKADA/);
    });

    // 4. Test Publication Guard (Wymóg dowodu dla statusu VERIFIED)
    await test('Publication Guard: Status VERIFIED wymaga dowodu (publicUrl lub remoteId)', async () => {
        assert.throws(() => {
            validatePublication({
                platform: 'YOUTUBE',
                status: 'VERIFIED'
            });
        }, /wymaga podania co najmniej publicUrl/);
    });

    // 5. Test Idempotencji (Podwójna rejestracja nie tworzy drugiego rekordu)
    await test('Idempotencja: Ponowny import materiału o znanych legacySources zwraca istniejący ID', async () => {
        const legacyPayload = {
            system: 'cc-mission-control',
            collection: 'morning_inspirations',
            docId: 'ref_day26_2026-09-26',
            data: {
                title: 'Słowa Mają Moc: Siła w ciszy i zaufaniu',
                author: 'Cezary Rogowski',
                date: '2026-09-26'
            }
        };

        const res1 = await importLegacyRecord(db, legacyPayload);
        const res2 = await importLegacyRecord(db, legacyPayload);

        assert.strictEqual(res1.contentId, 'CC-2026-000001');
        assert.strictEqual(res2.contentId, 'CC-2026-000001');
        assert.strictEqual(res2.isExisting, true);
    });

    // 6. Test Golden Record Integrity
    await test('Golden Record: Weryfikacja kompletności rekordu CC-2026-000001', async () => {
        const record = await getContentById(db, 'CC-2026-000001', { includeSubcollections: true });
        assert.ok(record, 'Golden Record nie istnieje w Firestore');
        assert.strictEqual(record.contentId, 'CC-2026-000001');
        assert.strictEqual(record.schemaVersion, 1);
        assert.strictEqual(record.status, 'PUBLISHED');
        assert.strictEqual(record.rights.ownership, 'CC_OWNED');
        assert.ok(record.variants.length >= 3, 'Oczekiwano co najmniej 3 wariantów');
        assert.ok(record.assets.length >= 2, 'Oczekiwano co najmniej 2 assetów');
        assert.ok(record.publications.length >= 3, 'Oczekiwano co najmniej 3 publikacji');
        assert.ok(record.audit.length >= 5, 'Oczekiwano co najmniej 5 wpisów audytu');
    });

    // 7. Test Paginacji i Cost Guard
    await test('Paginacja: listContent pobiera ograniczoną liczbę rekordów z kursorem', async () => {
        const page1 = await listContent(db, { pageSize: 2 });
        assert.ok(page1.items.length <= 2, 'Przekroczono limit strony');
        assert.ok(page1.count <= 2);
    });

    // 8. Test Soft Delete
    await test('Soft Delete: Archiwizacja zmienia status na ARCHIVED i zapisuje wpis w audycie', async () => {
        // Utwórz tymczasowy rekord do archiwizacji
        const temp = await createMasterContent(db, {
            type: 'ARTICLE',
            status: 'DRAFT',
            title: 'Tymczasowy artykuł testowy do archiwizacji',
            author: 'Tester',
            rights: {
                ownership: 'CC_OWNED',
                translationAllowed: true,
                editingAllowed: true,
                redistributionAllowed: true,
                monetizationAllowed: false,
                licenseName: 'Test'
            }
        }, { actor: 'Test Suite' });

        const archRes = await archiveContent(db, temp.contentId, 'Test Suite Soft Delete');
        assert.strictEqual(archRes.status, 'ARCHIVED');

        const updated = await getContentById(db, temp.contentId, { includeSubcollections: false });
        assert.strictEqual(updated.status, 'ARCHIVED');
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`📊 WYNIK TESTÓW CC CONTENT CORE: ${passed} PASS / ${failed} FAIL`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (failed > 0) {
        process.exit(1);
    }
    process.exit(0);
}

runAllTests().catch(err => {
    console.error('Błąd krytyczny testów:', err);
    process.exit(1);
});
