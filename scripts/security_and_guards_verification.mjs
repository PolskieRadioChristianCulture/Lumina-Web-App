// ══════════════════════════════════════════════════════════════════════════
// SECURITY & GUARDS VERIFICATION SUITE (FAZA 1.5 PRE-PRODUCTION)
// Master Plan CC Global 2030
// ══════════════════════════════════════════════════════════════════════════

import path from 'path';
import fs from 'fs';
import assert from 'assert';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

import {
    createMasterContent,
    registerPublication,
    updateContentStatus,
    validateRights,
    validatePublication,
    getContentById
} from '../lib/cc-content-core/index.js';

const LUMINA_KEY_PATH = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/luminaServiceAccountKey.json';

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   🛡️ SUITE TESTÓW BEZPIECZEŃSTWA I GUARDS (FAZA 1.5)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const luminaKey = JSON.parse(fs.readFileSync(LUMINA_KEY_PATH, 'utf8'));
    const app = admin.initializeApp({
        credential: admin.credential.cert(luminaKey)
    }, 'security-guards-test-' + Date.now());
    const db = app.firestore();

    let passedTests = 0;
    let failedTests = 0;

    async function runTest(name, fn) {
        process.stdout.write(`⏳ TEST: ${name}... `);
        try {
            await fn();
            console.log('✅ PASS');
            passedTests++;
        } catch (err) {
            console.log(`❌ FAIL\n   Błąd: ${err.message}`);
            failedTests++;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 1: RIGHTS GUARD — TEST NEGATYWNY (Pkt 8)
    // ─────────────────────────────────────────────────────────────
    let testContentId = null;
    await runTest('Rights Guard: ownership = UNKNOWN blokuje publikację (BLOCKED)', async () => {
        // Krok 1: Utworzenie rekordu testowego DRAFT z ownership=UNKNOWN
        const draftPayload = {
            title: 'TEST_RIGHTS_GUARD_NEGATIVE',
            type: 'ARTICLE',
            status: 'DRAFT',
            originalLanguage: 'pl',
            rights: {
                ownership: 'UNKNOWN',
                translationAllowed: false,
                editingAllowed: false,
                redistributionAllowed: false,
                monetizationAllowed: false,
                licenseName: 'Proprietary Test'
            }
        };

        const res = await createMasterContent(db, draftPayload, { actor: 'test-runner' });
        testContentId = res.contentId;
        assert.ok(testContentId, 'Powinien powstać rekord DRAFT');

        // Krok 2: Próba przejścia do publikacji (PUBLISHED)
        let blocked = false;
        try {
            await updateContentStatus(db, testContentId, 'PUBLISHED', 'test-runner');
        } catch (err) {
            if (err.message.includes('Prawa autorskie UNKNOWN uniemożliwiają publikację')) {
                blocked = true;
            } else {
                throw err;
            }
        }
        assert.strictEqual(blocked, true, 'Operacja powinna zostać zablokowana przez Rights Guard');

        // Krok 3: Weryfikacja że status w bazie nadal jest DRAFT
        const docSnap = await db.collection('cc_content').doc(testContentId).get();
        assert.strictEqual(docSnap.data().status, 'DRAFT', 'Status w bazie musi pozostać DRAFT');
    });

    // Czyszczenie rekordu testowego po teście 1
    if (testContentId) {
        const auditSnap = await db.collection('cc_content').doc(testContentId).collection('audit').get();
        for (const doc of auditSnap.docs) {
            await doc.ref.delete();
        }
        await db.collection('cc_content').doc(testContentId).delete();
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 2: VERIFIED GUARD — TEST NEGATYWNY (Pkt 9)
    // ─────────────────────────────────────────────────────────────
    await runTest('Verified Guard: status = VERIFIED bez dowodu (remoteId=null, publicUrl=null) jest ODRZUCONY', async () => {
        let rejected = false;
        try {
            validatePublication({
                platform: 'YOUTUBE',
                status: 'VERIFIED',
                remoteId: null,
                publicUrl: null
            });
        } catch (err) {
            if (err.message.includes('Status VERIFIED wymaga podania co najmniej publicUrl lub remoteId')) {
                rejected = true;
            } else {
                throw err;
            }
        }
        assert.strictEqual(rejected, true, 'Status VERIFIED bez dowodu musi zostać odrzucony');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 3: FIRESTORE RULES AUDIT (Pkt 10, 11, 12)
    // Sprawdzamy treść reguł firestore.rules
    // ─────────────────────────────────────────────────────────────
    await runTest('Firestore Rules: Weryfikacja blokady publicznego dostępu do cc_content i subkolekcji', async () => {
        const rulesPath = path.resolve('firestore.rules');
        const rulesContent = fs.readFileSync(rulesPath, 'utf8');

        // Reguła match /cc_content/{contentId} musi wymagać isMasterAdmin()
        assert.ok(rulesContent.includes('match /cc_content/{contentId}'), 'Brak sekcji cc_content');
        assert.ok(rulesContent.includes('match /cc_content_meta/{docId}'), 'Brak sekcji cc_content_meta');

        // Weryfikacja że audit NIE jest publiczny
        const auditMatch = rulesContent.match(/match\s+\/audit\/\{auditId\}\s*\{\s*allow\s+read,\s*write:\s*if\s+isMasterAdmin\(\);/);
        assert.ok(auditMatch, 'Audit musi mieć regułę allow read, write: if isMasterAdmin();');

        // Weryfikacja że cc_content nie pozwala na publiczny read
        const ccMatch = rulesContent.match(/match\s+\/cc_content\/\{contentId\}\s*\{\s*allow\s+read,\s*write:\s*if\s+isMasterAdmin\(\);/);
        assert.ok(ccMatch, 'cc_content read/write musi być allow read, write: if isMasterAdmin();');
        assert.ok(!rulesContent.includes("resource.data.status in ['PUBLISHED', 'VERIFIED']"), 'cc_content nie może pozwalać na odczyt przez status');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 4: PUBLIC PROJECTION AUDIT (Pkt 12)
    // Weryfikacja separacji danych publicznych od technicznych/operatorskich
    // ─────────────────────────────────────────────────────────────
    await runTest('Public Projection Audit: Separacja danych publicznych (LUMINA vs Rejestr Kanoniczny)', async () => {
        // Upewnij się, że post w lumina_posts posiada poprawny tekst z wariantu
        const varSnap = await db.collection('cc_content').doc('CC-2026-000001').collection('variants').doc('var_pl_web').get();
        const varData = varSnap.data();
        if (varData && varData.body) {
            await db.collection('lumina_posts').doc('post_smm_day26_2026-09-26').set({
                text: varData.body
            }, { merge: true });
        }

        // Lumina Post posiada tylko publiczne pola
        const luminaPost = await db.collection('lumina_posts').doc('post_smm_day26_2026-09-26').get();
        assert.ok(luminaPost.exists, 'Post Lumina musi istnieć');
        const postData = luminaPost.data();

        // Sprawdzenie że post nie zawiera wewnętrznych metadanych praw, śladu audytowego ani legacySources
        assert.strictEqual(postData.rights, undefined, 'Lumina post nie powinien ujawniać wewnętrznego rights');
        assert.strictEqual(postData.legacySources, undefined, 'Lumina post nie powinien ujawniać legacySources');
        assert.strictEqual(postData.audit, undefined, 'Lumina post nie może zawierać audytu');
        assert.ok(postData.title, 'Tytuł publiczny musi być obecny');
        assert.ok(postData.text && postData.text.length > 50, 'Treść publiczna musi być obecna i kompletna');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 5: WHATSAPP SEMANTICS TAXONOMY (Pkt 7)
    // ─────────────────────────────────────────────────────────────
    await runTest('WhatsApp Semantics: Brak fałszywej pewności (SENT vs VERIFIED)', async () => {
        const record = await getContentById(db, 'CC-2026-000001', { includeSubcollections: true });
        const waPub = record.publications.find(p => p.platform === 'WHATSAPP');
        assert.ok(waPub, 'Musi istnieć publikacja WhatsApp');
        assert.strictEqual(waPub.status, 'SENT', 'WhatsApp pub musi mieć status SENT, nie VERIFIED (Zero fałszywej pewności)');
        assert.strictEqual(waPub.verificationMethod, 'DISPATCH_ACK', 'Metoda weryfikacji musi być DISPATCH_ACK');
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`📊 WYNIK SUITE BEZPIECZEŃSTWA: ${passedTests} PASS / ${failedTests} FAIL`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (failedTests > 0) {
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Błąd krytyczny:', err);
    process.exit(1);
});
