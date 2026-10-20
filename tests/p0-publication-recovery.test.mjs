/**
 * ══════════════════════════════════════════════════════════════════════════
 * PRODUCTION RECOVERY TEST SUITE — P0 PUBLICATION VERIFICATION
 * Standard: ZERO-QA JOMA-D005 / CC Publication Recovery P0
 *
 * Sprawdza:
 * 1. WWW Adapter: Rzeczywisty zapis plików HTML (brak fikcyjnych Map w trybie LIVE)
 * 2. WWW Adapter: Niezależna weryfikacja HTTP 200 z kontrolą markera
 * 3. WWW Adapter: Odmowa zaliczenia weryfikacji produkcyjnej z pamięci preview
 * 4. Lumina Adapter: Zapis do Firestore vs bezpieczne odrzucenie mocka
 * 5. WhatsApp Adapter: Brak fałszywego VERIFIED (status SENT)
 * 6. Facebook Adapter: Trwała blokada DISABLED
 * ══════════════════════════════════════════════════════════════════════════
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

import {
    WwwDistributionAdapter,
    LuminaDistributionAdapter,
    WhatsAppDistributionAdapter,
    FacebookDistributionAdapter
} from '../lib/cc-content-core/index.js';

import { fetchUrlNoCrossRedirect } from '../scripts/verify_publication.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const LUMINA_KEY_PATH = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/luminaServiceAccountKey.json';
let luminaDb = null;
if (fs.existsSync(LUMINA_KEY_PATH)) {
    const luminaKey = JSON.parse(fs.readFileSync(LUMINA_KEY_PATH, 'utf8'));
    const existing = admin.apps.find(a => a.name === 'p0-test-app');
    const app = existing || admin.initializeApp({ credential: admin.credential.cert(luminaKey) }, 'p0-test-app');
    luminaDb = app.firestore();
}

let passed = 0;
let failed = 0;

async function runTest(name, fn) {
    process.stdout.write(`⏳ TEST: ${name}... `);
    try {
        await fn();
        console.log('✅ PASS');
        passed++;
    } catch (err) {
        console.log('❌ FAIL');
        console.error('   Szczegóły błędu:', err.message);
        failed++;
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   🛡️ P0 PUBLICATION RECOVERY: VERIFICATION SUITE');
    console.log('   Christian Culture Ecosystem — Zero Mock False Verification');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // ─────────────────────────────────────────────────────────────
    // 1. WWW ADAPTER — PREVIEW MODE VS LIVE MODE
    // ─────────────────────────────────────────────────────────────
    await runTest('WWW Adapter: Tryb Preview NIE zapisuje plików i w trybie strict odrzuca verified:true', async () => {
        const previewAdapter = new WwwDistributionAdapter({ strictLiveVerification: true });
        const job = { contentId: 'CC-TEST-001', variantId: 'v_preview' };
        const manifest = { contentId: 'CC-TEST-001', variantId: 'v_preview', title: 'Podgląd testowy', description: 'Opis podglądu' };
        const prep = await previewAdapter.prepare(job, manifest);
        const pub = await previewAdapter.publish(job, prep.preparedPayload);

        assert.strictEqual(pub.success, true);
        assert.strictEqual(pub.state, 'READY');
        assert.strictEqual(pub.source, 'PREVIEW_STORE');

        const ver = await previewAdapter.verify(pub.remoteId);
        assert.strictEqual(ver.verified, false, 'Mock preview w trybie strict NIE MOŻE dawać verified: true!');
        assert.strictEqual(ver.status, 'SIMULATED_PREVIEW_UNVERIFIED');
    });

    await runTest('WWW Adapter: Tryb LIVE fizycznie generuje pliki HTML na dysku z unikatowym markerem', async () => {
        const tempSlug = 'test-cc-p0-e2e-20261020-001';
        const expectedMarker = 'CC-P0-E2E-20261020-001';

        const liveAdapter = new WwwDistributionAdapter({
            isLiveMode: true,
            rootDir: ROOT,
            newsDir: path.join(ROOT, 'news'),
            strictLiveVerification: true
        });

        const job = { contentId: 'CC-TEST-E2E', variantId: 'p0', testMarker: expectedMarker };
        const manifest = {
            slug: tempSlug,
            contentId: 'CC-TEST-E2E',
            variantId: 'p0',
            title: 'Test Rzeczywistej Publikacji P0 E2E',
            description: 'Artykuł weryfikacyjny wygenerowany przez silnik dystrybucji Christian Culture z markerem.',
            testMarker: expectedMarker
        };

        const prep = await liveAdapter.prepare(job, manifest);
        const pub = await liveAdapter.publish(job, prep.preparedPayload);

        assert.strictEqual(pub.success, true);
        assert.strictEqual(pub.state, 'PUBLISHED');
        assert.strictEqual(pub.source, 'FILESYSTEM_LIVE');

        // Sprawdzenie fizycznej obecności plików na dysku
        const file1 = path.join(ROOT, 'news', `${tempSlug}.html`);
        const file2 = path.join(ROOT, 'news', tempSlug, 'index.html');

        assert.ok(fs.existsSync(file1), `Plik ${file1} musi istnieć na dysku!`);
        assert.ok(fs.existsSync(file2), `Plik ${file2} musi istnieć na dysku!`);

        const content = fs.readFileSync(file1, 'utf8');
        assert.ok(content.includes(expectedMarker), `Plik HTML musi zawierać marker ${expectedMarker}!`);
        assert.ok(content.includes('<main'), 'Plik HTML musi zawierać semantyczny tag <main>');
        assert.ok(content.includes('Christian Culture'), 'Plik HTML musi zawierać nagłówek Christian Culture');
    });

    // ─────────────────────────────────────────────────────────────
    // 2. WWW ADAPTER — INDEPENDENT HTTP VERIFICATION
    // ─────────────────────────────────────────────────────────────
    await runTest('WWW Adapter: Niezależna weryfikacja HTTP 200 z kontrolą markera na żywej domenie', async () => {
        const liveAdapter = new WwwDistributionAdapter({ strictLiveVerification: true });
        const liveUrl = 'https://polskieradio.cc/news/5800-rekopisow-nowego-testamentu-wiarygodnosc';
        const liveMarker = '5800 greckich rękopisów Nowego Testamentu';

        const result = await liveAdapter.verify('5800-rekopisow-nowego-testamentu-wiarygodnosc', liveUrl, liveMarker);
        assert.strictEqual(result.verified, true);
        assert.strictEqual(result.status, 'VERIFIED_HTTP_200');
        assert.strictEqual(result.httpStatus, 200);
    });

    await runTest('CLI Verifier: Odrzucenie nieprawidłowego markera i zewnętrznych przekierowań', async () => {
        const liveUrl = 'https://polskieradio.cc/news/5800-rekopisow-nowego-testamentu-wiarygodnosc';
        const res = await fetchUrlNoCrossRedirect(liveUrl, 'polskieradio.cc');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.includes('FAŁSZYWY_MARKER_999'), false);

        await assert.rejects(
            async () => await fetchUrlNoCrossRedirect('https://google.com', 'polskieradio.cc'),
            /Niedozwolony host docelowy/
        );
    });

    // ─────────────────────────────────────────────────────────────
    // 3. LUMINA ADAPTER — FIRESTORE WRITE VS MOCK REFUSAL
    // ─────────────────────────────────────────────────────────────
    await runTest('Lumina Adapter: Mock w trybie strict NIE zwraca verified: true', async () => {
        const mockAdapter = new LuminaDistributionAdapter({ strictLiveVerification: true });
        const job = { idempotencyKey: 'lum_mock_1', contentId: 'CC-MOCK', variantId: 'v1' };
        const manifest = { contentId: 'CC-MOCK', variantId: 'v1', title: 'Post testowy', description: 'Treść posta' };
        const prep = await mockAdapter.prepare(job, manifest);
        const pub = await mockAdapter.publish(job, prep.preparedPayload);

        assert.strictEqual(pub.success, true);
        assert.strictEqual(pub.source, 'MOCK_STORE');

        const ver = await mockAdapter.verify(pub.remoteId);
        assert.strictEqual(ver.verified, false, 'Mock w trybie strict nie może być zaliczony!');
        assert.strictEqual(ver.status, 'SIMULATED_MOCK_UNVERIFIED');
    });

    if (luminaDb) {
        await runTest('Lumina Adapter: Zapis do prawdziwej kolekcji Firestore lumina_posts i odczyt DOCUMENT EXISTS', async () => {
            const firestoreAdapter = new LuminaDistributionAdapter({ db: luminaDb, strictLiveVerification: true });
            const testId = `post_p0_test_${Date.now()}`;
            const payload = {
                postId: testId,
                title: 'Test P0 Firestore Verification',
                content: 'Weryfikacja rzeczywistego zapisu do bazy lumina-cc',
                status: 'published',
                publishedAt: new Date().toISOString()
            };

            const pub = await firestoreAdapter.publish({ idempotencyKey: testId }, payload);
            assert.strictEqual(pub.success, true);
            assert.strictEqual(pub.source, 'FIRESTORE_LIVE');

            // Odczyt z bazy
            const ver = await firestoreAdapter.verify(testId);
            assert.strictEqual(ver.verified, true);
            assert.strictEqual(ver.status, 'EXISTS');
            assert.strictEqual(ver.source, 'FIRESTORE_LIVE');

            // Cleanup testowego rekordu
            await firestoreAdapter.cancel(null, testId);
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. WHATSAPP & FACEBOOK ADAPTERS
    // ─────────────────────────────────────────────────────────────
    await runTest('WhatsApp Adapter: Status to SENT, a verify() nigdy nie zwraca fałszywego VERIFIED', async () => {
        const waAdapter = new WhatsAppDistributionAdapter();
        const job = { idempotencyKey: 'wa_p0_1', contentId: 'CC-WA', variantId: 'v1' };
        const pub = await waAdapter.publish(job, { text: 'Test WhatsApp' });
        assert.strictEqual(pub.success, true);
        assert.strictEqual(pub.state, 'PUBLISHED');

        const ver = await waAdapter.verify(pub.remoteId);
        assert.strictEqual(ver.verified, false, 'WhatsApp Bridge nie może dawać verified: true!');
        assert.strictEqual(ver.status, 'SENT');
    });

    await runTest('Facebook Adapter: Zabezpieczenie DISABLED trwale blokuje operacje', async () => {
        const fbAdapter = new FacebookDistributionAdapter();
        const val = await fbAdapter.validate({}, { title: 'Test', description: 'Test' });
        assert.strictEqual(val.valid, false);
        assert.ok(val.errors[0].includes('DISABLED'));

        const ver = await fbAdapter.verify('any_id');
        assert.strictEqual(ver.verified, false);
        assert.strictEqual(ver.status, 'DISABLED');
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`📊 WYNIK SUITE P0 PUBLICATION RECOVERY: ${passed} PASS / ${failed} FAIL`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (failed > 0) process.exit(1);
}

main().catch((err) => {
    console.error('BŁĄD KRYTYCZNY SUITE:', err);
    process.exit(1);
});
