#!/usr/bin/env node
/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC PUBLICATION INDEPENDENT VERIFIER — VERIFY_PUBLICATION.MJS
 * Odpowiednik CLI dla verify_publication.py (Node.js v20+)
 * Standard: ZERO-QA JOMA-D005 / CC Publication Recovery P0
 *
 * Użycie:
 *   node scripts/verify_publication.mjs --url "https://polskieradio.cc/news/slug" --marker "MARKER" [--host "polskieradio.cc"]
 * ══════════════════════════════════════════════════════════════════════════
 */

import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';

function parseArgs(args) {
    const result = { host: 'polskieradio.cc' };
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--url' && args[i + 1]) {
            result.url = args[++i];
        } else if (args[i] === '--marker' && args[i + 1]) {
            result.marker = args[++i];
        } else if (args[i] === '--host' && args[i + 1]) {
            result.host = args[++i];
        }
    }
    return result;
}

export function fetchUrlNoCrossRedirect(targetUrl, allowedHost, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        const u = new URL(targetUrl);
        if (u.protocol !== 'https:') {
            return reject(new Error('Wymagany adres HTTPS na dozwolonej domenie'));
        }
        if (u.hostname !== allowedHost && u.hostname !== 'www.' + allowedHost) {
            return reject(new Error(`Niedozwolony host docelowy: ${u.hostname} (dozwolony: ${allowedHost})`));
        }

        const req = https.get(targetUrl, {
            headers: {
                'User-Agent': 'CC-Publication-Verify/1.0',
                'Cache-Control': 'no-cache'
            },
            timeout: 15000
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                if (maxRedirects <= 0) {
                    return reject(new Error('Zbyt wiele przekierowań HTTP'));
                }
                const redirectUrl = new URL(res.headers.location, targetUrl);
                if (redirectUrl.hostname !== u.hostname) {
                    return reject(new Error(`Odmowa przekierowania na inną domenę (${redirectUrl.hostname})`));
                }
                return fetchUrlNoCrossRedirect(redirectUrl.toString(), allowedHost, maxRedirects - 1)
                    .then(resolve)
                    .catch(reject);
            }

            let raw = '';
            res.on('data', chunk => raw += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: raw,
                    finalUrl: targetUrl
                });
            });
        });

        req.on('error', (err) => reject(new Error(`Błąd sieciowy: ${err.message}`)));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout 15s podczas oczekiwania na odpowiedź'));
        });
    });
}

export async function main() {
    const args = parseArgs(process.argv.slice(2));

    if (!args.url || !args.marker) {
        console.error('BŁĄD: Wymagane argumenty --url oraz --marker');
        console.error('Użycie: node scripts/verify_publication.mjs --url "https://polskieradio.cc/..." --marker "..."');
        process.exit(1);
    }

    try {
        const response = await fetchUrlNoCrossRedirect(args.url, args.host);
        const markerFound = response.body.includes(args.marker);

        if (response.status === 200 && markerFound) {
            console.log(`PASS: HTTP 200, marker znaleziony, url=${response.finalUrl}`);
            process.exit(0);
        } else {
            console.log(`FAIL: HTTP ${response.status}, marker_obecny=${markerFound}, url=${response.finalUrl}`);
            process.exit(1);
        }
    } catch (err) {
        console.log(`FAIL: ${err.message}`);
        process.exit(1);
    }
}

if (process.argv[1] && process.argv[1].endsWith('verify_publication.mjs')) {
    main();
}
