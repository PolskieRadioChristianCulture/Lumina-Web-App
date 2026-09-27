// ══════════════════════════════════════════════════════════════════════════
// PRODUCTION SMOKE TEST & IDEMPOTENCY CHECK (FAZA 1.5)
// Master Plan CC Global 2030
// ══════════════════════════════════════════════════════════════════════════

import path from 'path';
import fs from 'fs';
import https from 'https';
import assert from 'assert';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

import {
    getContentById,
    listContent,
    importLegacyRecord,
    findExistingByLegacySource
} from '../lib/cc-content-core/index.js';

const LUMINA_KEY_PATH = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/luminaServiceAccountKey.json';
const CUDA_KEY_PATH = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/cudaServiceAccountKey.json';
const MC_KEY_PATH = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/serviceAccountKey.json';

async function fetchHttps(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
        }).on('error', reject);
    });
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   🚀 PRODUCTION SMOKE TEST & IDEMPOTENCY CHECK');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const luminaKey = JSON.parse(fs.readFileSync(LUMINA_KEY_PATH, 'utf8'));
    const app = admin.initializeApp({ credential: admin.credential.cert(luminaKey) }, 'prod-smoke-' + Date.now());
    const db = app.firestore();

    let passed = 0;
    let failed = 0;

    async function check(name, fn) {
        process.stdout.write(`⏳ ${name}... `);
        try {
            await fn();
            console.log('✅ PASS');
            passed++;
        } catch (err) {
            console.log(`❌ FAIL\n   Błąd: ${err.message}`);
            failed++;
        }
    }

    // 1. READ GOLDEN RECORD
    let goldenRecord = null;
    await check('1. Odczyt Golden Record CC-2026-000001 z produkcji', async () => {
        goldenRecord = await getContentById(db, 'CC-2026-000001', { includeSubcollections: true });
        assert.ok(goldenRecord, 'Golden Record CC-2026-000001 nie istnieje!');
        assert.strictEqual(goldenRecord.contentId, 'CC-2026-000001');
        assert.strictEqual(goldenRecord.status, 'PUBLISHED');
        assert.strictEqual(goldenRecord.rights.ownership, 'CC_OWNED');
    });

    // 2. CHECK SUBCOLLECTIONS (Variants, Assets, Publications, Audit)
    await check('2. Weryfikacja subkolekcji Golden Record (Variants x3, Assets x2, Pubs x3, Audit)', async () => {
        assert.strictEqual(goldenRecord.variants.length, 3, 'Wymagane dokładnie 3 warianty');
        assert.strictEqual(goldenRecord.assets.length, 2, 'Wymagane dokładnie 2 assety');
        assert.strictEqual(goldenRecord.publications.length, 3, 'Wymagane dokładnie 3 publikacje');
        assert.ok(goldenRecord.audit.length >= 10, 'Wymagany kompletny ślad audytowy');

        // Sprawdzenie szczegółowe publikacji
        const luminaPub = goldenRecord.publications.find(p => p.platform === 'LUMINA');
        const dzjPub = goldenRecord.publications.find(p => p.platform === 'CC_LITE');
        const waPub = goldenRecord.publications.find(p => p.platform === 'WHATSAPP');

        assert.strictEqual(luminaPub.status, 'VERIFIED');
        assert.strictEqual(luminaPub.remoteId, 'post_smm_day26_2026-09-26');
        assert.strictEqual(dzjPub.status, 'VERIFIED');
        assert.strictEqual(dzjPub.remoteId, 'ref_day26_2026-09-26');
        assert.strictEqual(waPub.status, 'SENT');
        assert.strictEqual(waPub.verificationMethod, 'DISPATCH_ACK');
    });

    // 3. IDEMPOTENCY PRODUCTION CHECK (Pkt 20)
    await check('3. Idempotency Check: Ponowny import pilota nie tworzy drugiego rekordu', async () => {
        const initialCountSnap = await db.collection('cc_content').get();
        const initialCount = initialCountSnap.size;

        const legacyPayload = {
            system: 'cuda-398c0',
            collection: 'reflections',
            docId: 'ref_day26_2026-09-26',
            data: {
                title: '☀️ Słowa Mają Moc — Dzień 26: Siła w ciszy i zaufaniu',
                date: '2026-09-26'
            }
        };

        const importResult = await importLegacyRecord(db, legacyPayload, { actor: 'idempotency-check' });
        assert.strictEqual(importResult.contentId, 'CC-2026-000001', 'Powinien zwrócić istniejący CC-2026-000001');
        assert.strictEqual(importResult.isExisting, true, 'Powinien oznaczyć isExisting=true');

        const afterCountSnap = await db.collection('cc_content').get();
        assert.strictEqual(afterCountSnap.size, initialCount, 'Liczba rekordów w cc_content nie mogła wzrosnąć (ZERO DUPLICATE)');
    });

    // 4. SEARCH, FILTER, PAGINATION
    await check('4. Paginacja, filtry i wyszukiwanie w cc_content', async () => {
        const res = await listContent(db, { pageSize: 5, status: 'PUBLISHED' });
        assert.ok(res.items.length >= 1, 'Powinien znaleźć co najmniej 1 opublikowany rekord');
        assert.strictEqual(res.items[0].contentId, 'CC-2026-000001');
    });

    // 5. PRODUCTION HOSTING CHECK (Cloudflare Pages)
    await check('5. Dostępność produkcyjna URL Cloudflare Pages', async () => {
        const pageRes = await fetchHttps('https://polskieradio.cc/content-registry');
        assert.strictEqual(pageRes.statusCode, 200, 'Strona /content-registry musi zwracać HTTP 200');
        assert.ok(pageRes.body.includes('Rejestr Treści'), 'Brak nagłówka Rejestr Treści w HTML');
        assert.ok(pageRes.body.includes('CC Content Core'), 'Brak stopki CC Content Core w HTML');

        const jsRes = await fetchHttps('https://polskieradio.cc/js/content-registry.js');
        assert.strictEqual(jsRes.statusCode, 200, 'Skrypt /js/content-registry.js musi zwracać HTTP 200');
        assert.ok(jsRes.body.toUpperCase().includes('CC CONTENT REGISTRY'), 'Brak zawartości kontrolera JS');
    });

    // 6. LEGACY SYSTEMS READ-FIRST INTEGRITY
    await check('6. Integralność starszych systemów produkcyjnych (cuda-398c0, cc-mission-control)', async () => {
        const cudaKey = JSON.parse(fs.readFileSync(CUDA_KEY_PATH, 'utf8'));
        const cudaApp = admin.initializeApp({ credential: admin.credential.cert(cudaKey) }, 'cuda-check-' + Date.now());
        const cudaDb = cudaApp.firestore();
        const cudaSnap = await cudaDb.collection('reflections').doc('ref_day26_2026-09-26').get();
        assert.ok(cudaSnap.exists, 'Kolekcja reflections w cuda-398c0 musi pozostać nienaruszona');

        const mcKey = JSON.parse(fs.readFileSync(MC_KEY_PATH, 'utf8'));
        const mcApp = admin.initializeApp({ credential: admin.credential.cert(mcKey) }, 'mc-check-' + Date.now());
        const mcDb = mcApp.firestore();
        const mcSnap = await mcDb.collection('morning_inspirations').doc('ref_day26_2026-09-26').get();
        assert.ok(mcSnap.exists, 'Kolekcja morning_inspirations w cc-mission-control musi pozostać nienaruszona');
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`📊 WYNIK PRODUCTION SMOKE: ${passed} PASS / ${failed} FAIL`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (failed > 0) process.exit(1);
    process.exit(0);
}

main().catch(err => {
    console.error('Błąd krytyczny testu smoke:', err);
    process.exit(1);
});
