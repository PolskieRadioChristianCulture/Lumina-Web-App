/**
 * ══════════════════════════════════════════════════════════════════════════
 * PROOF TEST: UNTRACKED NEWS TO .PAGES-RELEASE SYNC VERIFICATION
 * Standard: ZERO-QA JOMA-D005 / CC Publication Recovery P0 (Etap 3, Pkt 2)
 *
 * Udowadnia:
 * 1. Plik wygenerowany w news/<slug>.html i news/<slug>/index.html
 * 2. Nawet gdy plik NIE jest jeszcze dodany do git (untracked),
 * 3. WwwDistributionAdapter natychmiast zapisuje go do .pages-release/news/,
 * 4. A mechanizm build-pages-release.mjs uwzględnia nowe pliki z news/
 *    poprzez selektor 'git ls-files -o --exclude-standard -z news'.
 * ══════════════════════════════════════════════════════════════════════════
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { WwwDistributionAdapter } from '../lib/cc-content-core/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function testProof() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   🛡️ DOWÓD P0 (ETAP 3): SYNCHRONIZACJA UNTRACKED -> .PAGES-RELEASE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const testSlug = `proof-untracked-${Date.now()}`;
    const testMarker = `MARKER-UNTRACKED-PROOF-${Date.now()}`;

    const adapter = new WwwDistributionAdapter({
        isLiveMode: true,
        rootDir: ROOT,
        newsDir: path.join(ROOT, 'news'),
        strictLiveVerification: true
    });

    const job = { contentId: 'CC-PROOF-01', variantId: 'v1', testMarker };
    const manifest = {
        slug: testSlug,
        contentId: 'CC-PROOF-01',
        variantId: 'v1',
        title: 'Dowód Synchronizacji Nowych Plików do .pages-release',
        description: 'Weryfikacja automatycznego transferu do katalogu wyjściowego Cloudflare Pages.',
        testMarker
    };

    try {
        // 1. Publikacja przez adapter
        const prep = await adapter.prepare(job, manifest);
        const pub = await adapter.publish(job, prep.preparedPayload);
        assert.strictEqual(pub.success, true);

        // 2. Weryfikacja obecności w news/
        const rootFile = path.join(ROOT, 'news', `${testSlug}.html`);
        const rootClean = path.join(ROOT, 'news', testSlug, 'index.html');
        assert.ok(fs.existsSync(rootFile), 'Plik w news/ musi istnieć');
        assert.ok(fs.existsSync(rootClean), 'Clean URL w news/ musi istnieć');

        // 3. Sprawdzenie, że plik jest w .pages-release dzięki bezpośredniej synchronizacji adaptera
        const releaseFile = path.join(ROOT, '.pages-release', 'news', `${testSlug}.html`);
        const releaseClean = path.join(ROOT, '.pages-release', 'news', testSlug, 'index.html');
        assert.ok(fs.existsSync(releaseFile), 'Plik w .pages-release/news/ musi istnieć!');
        assert.ok(fs.existsSync(releaseClean), 'Plik w .pages-release/news/<slug>/index.html musi istnieć!');

        // 4. Weryfikacja, że mechanizm build-pages-release.mjs widzi ten plik w news/ pomimo braku w git tracked
        const untrackedNews = execFileSync('git', ['ls-files', '-o', '--exclude-standard', '-z', 'news'], {
            cwd: ROOT,
            encoding: 'utf8'
        }).split('\0').filter(Boolean);

        const foundInUntracked = untrackedNews.some(f => f.includes(testSlug));
        assert.ok(foundInUntracked, 'Plik musi być widoczny dla skanera untracked news w build-pages-release.mjs!');

        console.log('✅ DOWÓD ZALICZONY (Pkt 2): Nowy plik trafia do .pages-release bezpośrednio i jest natychmiast widoczny dla buildera Cloudflare.');
    } finally {
        // Cleanup
        const rootFile = path.join(ROOT, 'news', `${testSlug}.html`);
        const rootClean = path.join(ROOT, 'news', testSlug, 'index.html');
        const rootDir = path.join(ROOT, 'news', testSlug);
        const releaseFile = path.join(ROOT, '.pages-release', 'news', `${testSlug}.html`);
        const releaseClean = path.join(ROOT, '.pages-release', 'news', testSlug, 'index.html');
        const releaseDir = path.join(ROOT, '.pages-release', 'news', testSlug);

        if (fs.existsSync(rootFile)) fs.unlinkSync(rootFile);
        if (fs.existsSync(rootClean)) fs.unlinkSync(rootClean);
        if (fs.existsSync(rootDir)) fs.rmdirSync(rootDir);
        if (fs.existsSync(releaseFile)) fs.unlinkSync(releaseFile);
        if (fs.existsSync(releaseClean)) fs.unlinkSync(releaseClean);
        if (fs.existsSync(releaseDir)) fs.rmdirSync(releaseDir);
    }
}

testProof().catch(err => {
    console.error('❌ BŁĄD DOWODU:', err);
    process.exit(1);
});
