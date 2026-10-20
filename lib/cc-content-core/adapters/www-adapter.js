/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — WWW ECOSYSTEM ADAPTER (FAZA 3A/3.5/P0)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3) / ZERO-QA JOMA-D005
 * Dyrektywy:
 * 1. Rzeczywisty zapis plików HTML do katalogu news/<slug>.html i news/<slug>/index.html
 * 2. Niezależna weryfikacja HTTP 200 z kontrolą unikatowego markera (bez fałszywych mocków)
 * 3. Wyraźne rozróżnienie stanów: PREVIEW_READY / PUBLISHED_UNVERIFIED / VERIFIED_HTTP_200
 * ══════════════════════════════════════════════════════════════════════════
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';
import { DistributionAdapter } from './base-adapter.js';

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export class WwwDistributionAdapter extends DistributionAdapter {
    /**
     * @param {Object} [options]
     * @param {Map<string, any>} [options.previewStore] - Magazyn podglądu w pamięci
     * @param {boolean} [options.isLiveMode=false] - Czy publikacja ma generować fizyczne pliki HTML
     * @param {string} [options.rootDir] - Katalog główny repozytorium
     * @param {string} [options.newsDir] - Katalog docelowy artykułów news/
     * @param {string} [options.publicBaseUrl='https://polskieradio.cc'] - Publiczny URL bazowy serwisu
     * @param {boolean} [options.strictLiveVerification=false] - Wymóg realnego HTTP bez zaliczania mocków
     */
    constructor(options = {}) {
        super('WWW', '2026.3-web-real');
        this.previewStore = options.previewStore || new Map();
        this.isLiveMode = options.isLiveMode || false;
        this.rootDir = options.rootDir || path.resolve(process.cwd());
        this.newsDir = options.newsDir || path.resolve(this.rootDir, 'news');
        this.publicBaseUrl = options.publicBaseUrl || 'https://polskieradio.cc';
        this.strictLiveVerification = options.strictLiveVerification || false;
    }

    async validate(job, manifest) {
        const errors = [];
        if (!manifest.title) errors.push('WWW_TITLE_REQUIRED: Tytuł artykułu/rozważania jest wymagany');
        if (!manifest.description) errors.push('WWW_CONTENT_REQUIRED: Treść jest wymagana');
        return { valid: errors.length === 0, errors };
    }

    async prepare(job, manifest) {
        const rawSlug = manifest.slug || `${manifest.contentId.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${manifest.variantId}`;
        const slug = rawSlug.replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-');
        const marker = manifest.testMarker || job.testMarker || manifest.marker || null;

        const payload = {
            slug,
            contentId: manifest.contentId,
            variantId: manifest.variantId,
            title: manifest.title,
            content: manifest.description,
            marker,
            mode: this.isLiveMode ? 'LIVE' : 'PREVIEW',
            preparedAt: new Date().toISOString()
        };
        return { ready: true, preparedPayload: payload };
    }

    async publish(job, preparedPayload) {
        const slug = preparedPayload.slug;
        this.previewStore.set(slug, preparedPayload);

        if (!this.isLiveMode) {
            // Faza Preview — bezpieczny podgląd w pamięci roboczej bez ingerencji w produkcję
            const url = `https://polskieradio.cc/preview?contentId=${job.contentId}&variantId=${job.variantId}`;
            return {
                success: true,
                remoteId: slug,
                publicUrl: url,
                state: 'READY',
                source: 'PREVIEW_STORE',
                note: 'Faza 3A: Przygotowano podgląd PREVIEW (brak fizycznego zapisu na dysku)'
            };
        }

        // TRYB LIVE — FIZYCZNY ZAPIS PLIKÓW HTML DO news/<slug>.html ORAZ news/<slug>/index.html
        try {
            const htmlContent = this.renderArticleHtml(preparedPayload);
            if (!fs.existsSync(this.newsDir)) {
                fs.mkdirSync(this.newsDir, { recursive: true });
            }

            // 1. Zapis pliku news/<slug>.html
            const singleFilePath = path.join(this.newsDir, `${slug}.html`);
            fs.writeFileSync(singleFilePath, htmlContent, 'utf8');

            // 2. Zapis pliku news/<slug>/index.html (Clean URL)
            const cleanDir = path.join(this.newsDir, slug);
            if (!fs.existsSync(cleanDir)) {
                fs.mkdirSync(cleanDir, { recursive: true });
            }
            const cleanFilePath = path.join(cleanDir, 'index.html');
            fs.writeFileSync(cleanFilePath, htmlContent, 'utf8');

            // 3. Bezpośrednia synchronizacja do .pages-release (katalog wyjściowy Cloudflare Pages)
            const releaseDir = path.join(this.rootDir, '.pages-release');
            if (fs.existsSync(releaseDir)) {
                const releaseNewsDir = path.join(releaseDir, 'news');
                if (!fs.existsSync(releaseNewsDir)) {
                    fs.mkdirSync(releaseNewsDir, { recursive: true });
                }
                fs.writeFileSync(path.join(releaseNewsDir, `${slug}.html`), htmlContent, 'utf8');
                const cleanReleaseDir = path.join(releaseNewsDir, slug);
                if (!fs.existsSync(cleanReleaseDir)) {
                    fs.mkdirSync(cleanReleaseDir, { recursive: true });
                }
                fs.writeFileSync(path.join(cleanReleaseDir, 'index.html'), htmlContent, 'utf8');
            }

            const publicUrl = `${this.publicBaseUrl}/news/${slug}`;

            return {
                success: true,
                remoteId: slug,
                publicUrl,
                localFiles: [singleFilePath, cleanFilePath],
                state: 'PUBLISHED',
                source: 'FILESYSTEM_LIVE',
                note: `Fizycznie wygenerowano pliki artykułu w news/${slug}.html oraz news/${slug}/index.html`
            };
        } catch (err) {
            return {
                success: false,
                remoteId: slug,
                state: 'FAILED',
                error: `Błąd fizycznego zapisu artykułu WWW: ${err.message}`
            };
        }
    }

    renderArticleHtml(payload) {
        const title = escapeHtml(payload.title || 'Artykuł Christian Culture');
        const content = escapeHtml(payload.content || '');
        const slug = payload.slug;
        const marker = payload.marker ? String(payload.marker) : '';
        const publishedDate = (payload.preparedAt ? payload.preparedAt.slice(0, 10) : new Date().toISOString().slice(0, 10));

        return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — Christian Culture</title>
    <meta name="description" content="${content.slice(0, 160)}">
    <link rel="canonical" href="${this.publicBaseUrl}/news/${slug}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${content.slice(0, 160)}">
    <meta property="og:url" content="${this.publicBaseUrl}/news/${slug}">
    <meta property="og:type" content="article">
    <link rel="stylesheet" href="/assets/style.css">
</head>
<body style="background:#f8fafc;color:#0f172a;font-family:system-ui,-apple-system,sans-serif;margin:0;padding:24px 16px;">
    <main style="max-width:800px;margin:0 auto;background:#fff;padding:32px;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="margin-bottom:24px;border-bottom:2px solid #bb142e;padding-bottom:16px;">
            <a href="/news" style="color:#bb142e;text-decoration:none;font-weight:700;font-size:0.95rem;display:inline-block;min-height:44px;line-height:44px;">&larr; Wróć do Wiadomości CCN</a>
            <h1 style="font-size:2rem;line-height:1.25;margin:16px 0 8px 0;color:#0f172a;">${title}</h1>
            <div style="font-size:0.875rem;color:#64748b;">
                <span>Data: <time datetime="${publishedDate}">${publishedDate}</time></span> &bull; 
                <span>Wydawca: <strong>Christian Culture</strong></span>
            </div>
        </header>
        <article class="prose" style="font-size:1.1rem;line-height:1.75;color:#334155;">
            <p>${content}</p>
        </article>
        ${marker ? `\n        <!-- CC_PUBLICATION_VERIFICATION_MARKER: ${escapeHtml(marker)} -->\n        <div data-cc-marker="${escapeHtml(marker)}" style="margin-top:32px;padding:12px 16px;background:#f1f5f9;border-radius:8px;font-family:monospace;font-size:0.85rem;color:#475569;">Marker weryfikacyjny: ${escapeHtml(marker)}</div>` : ''}
    </main>
</body>
</html>`;
    }

    /**
     * Niezależna weryfikacja (Pkt 11/25-26):
     * 1. Jeśli przekazano publiczny URL HTTPS: sprawdza odpowiedź HTTP 200 i obecność markera
     * 2. Jeśli sprawdzana jest obecność lokalna na dysku: sprawdza istnienie pliku HTML
     * 3. Wpis w pamięci previewStore w trybie strict NIE daje statusu VERIFIED
     */
    async verify(remoteId, publicUrl, expectedMarker) {
        const targetUrl = publicUrl || (this.isLiveMode ? `${this.publicBaseUrl}/news/${remoteId}` : null);

        // 1. Sprawdzenie sieciowe HTTP/HTTPS, jeśli URL jest dostępny
        if (targetUrl && (targetUrl.startsWith('https://') || targetUrl.startsWith('http://'))) {
            try {
                const httpResult = await this.verifyHttpEndpoint(targetUrl, expectedMarker);
                if (httpResult.pass) {
                    return {
                        verified: true,
                        status: 'VERIFIED_HTTP_200',
                        source: 'LIVE_HTTP',
                        httpStatus: httpResult.status,
                        remoteMetadata: {
                            url: targetUrl,
                            markerFound: httpResult.markerFound,
                            checkedAt: new Date().toISOString()
                        }
                    };
                }
                return {
                    verified: false,
                    status: 'HTTP_VERIFICATION_FAILED',
                    source: 'LIVE_HTTP',
                    httpStatus: httpResult.status,
                    error: httpResult.error || `HTTP ${httpResult.status}: Weryfikacja zdalna nie powiodła się`
                };
            } catch (err) {
                if (this.strictLiveVerification) {
                    return {
                        verified: false,
                        status: 'NETWORK_ERROR',
                        error: `Błąd połączenia HTTP: ${err.message}`
                    };
                }
            }
        }

        // 2. Sprawdzenie fizycznego pliku na dysku (przed sync/deploy)
        if (this.isLiveMode) {
            const singleFilePath = path.join(this.newsDir, `${remoteId}.html`);
            const cleanFilePath = path.join(this.newsDir, remoteId, 'index.html');
            if (fs.existsSync(singleFilePath) || fs.existsSync(cleanFilePath)) {
                return {
                    verified: this.strictLiveVerification ? false : true,
                    status: this.strictLiveVerification ? 'FILE_GENERATED_PENDING_DEPLOY' : 'LIVE',
                    source: 'FILESYSTEM_LOCAL',
                    remoteMetadata: {
                        slug: remoteId,
                        file: fs.existsSync(singleFilePath) ? singleFilePath : cleanFilePath
                    }
                };
            }
        }

        // 3. Sprawdzenie pamięci podręcznej previewStore
        const item = this.previewStore.get(remoteId);
        if (!item) {
            return { verified: false, status: 'NOT_FOUND', error: `Wpis WWW ${remoteId} nie istnieje` };
        }

        if (this.strictLiveVerification) {
            return {
                verified: false,
                status: 'SIMULATED_PREVIEW_UNVERIFIED',
                source: 'IN_MEMORY_PREVIEW',
                error: 'Wpis obecny wyłącznie w pamięci previewStore. Brak pliku fizycznego ani odpowiedzi HTTP 200.'
            };
        }

        return {
            verified: true,
            status: item.mode,
            source: 'IN_MEMORY_PREVIEW',
            remoteMetadata: { slug: item.slug, title: item.title, mode: item.mode }
        };
    }

    async verifyHttpEndpoint(targetUrl, expectedMarker) {
        const u = new URL(targetUrl);
        if (u.protocol !== 'https:' && u.protocol !== 'http:') {
            throw new Error('Wymagany protokół HTTP/HTTPS');
        }

        return new Promise((resolve) => {
            const client = u.protocol === 'https:' ? https : http;
            const req = client.get(targetUrl, {
                headers: {
                    'User-Agent': 'CC-Publication-Verify/1.0',
                    'Cache-Control': 'no-cache'
                },
                timeout: 15000
            }, (res) => {
                // Obsługa przekierowania (tylko w obrębie tego samego hosta)
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    const redirectUrl = new URL(res.headers.location, targetUrl);
                    if (redirectUrl.hostname !== u.hostname) {
                        return resolve({ pass: false, status: res.statusCode, error: 'Odmowa przekierowania na inną domenę' });
                    }
                    return this.verifyHttpEndpoint(redirectUrl.toString(), expectedMarker).then(resolve);
                }

                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    const status = res.statusCode;
                    const markerFound = expectedMarker ? body.includes(expectedMarker) : true;
                    if (status === 200 && markerFound) {
                        resolve({ pass: true, status, markerFound });
                    } else {
                        resolve({
                            pass: false,
                            status,
                            markerFound,
                            error: status !== 200 ? `Otrzymano kod HTTP ${status}` : 'Marker nie został odnaleziony w treści strony'
                        });
                    }
                });
            });

            req.on('error', (err) => resolve({ pass: false, status: 0, error: err.message }));
            req.on('timeout', () => {
                req.destroy();
                resolve({ pass: false, status: 0, error: 'Timeout 15s podczas łączenia z ' + targetUrl });
            });
        });
    }

    async getStatus(remoteId) {
        const item = this.previewStore.get(remoteId);
        return { processingStatus: item ? 'succeeded' : 'failed' };
    }

    async retry(job, manifest) {
        const { preparedPayload } = await this.prepare(job, manifest);
        return this.publish(job, preparedPayload);
    }

    async cancel(jobId, remoteId) {
        if (remoteId && this.previewStore.has(remoteId)) {
            this.previewStore.delete(remoteId);
            return { cancelled: true, reason: `Wpis ${remoteId} usunięty z WWW preview` };
        }
        return { cancelled: true };
    }
}
