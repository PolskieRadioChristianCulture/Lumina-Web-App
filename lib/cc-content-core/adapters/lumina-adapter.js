/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — LUMINA OFFICIAL ADAPTER (FAZA 3A/3.5/P0)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3) / ZERO-QA JOMA-D005
 * Dyrektywy 23-24:
 * 1. Rzeczywisty zapis do kolekcji lumina_posts w Firestore (gdy db jest aktywne)
 * 2. Weryfikacja DOCUMENT EXISTS CHECK bezpośrednio w Firestore
 * 3. Zakaz zaliczania weryfikacji produkcyjnej z samego mocka w pamięci
 * ══════════════════════════════════════════════════════════════════════════
 */

import { DistributionAdapter } from './base-adapter.js';

export class LuminaDistributionAdapter extends DistributionAdapter {
    /**
     * @param {Object} [options]
     * @param {any} [options.db] - Instancja Firestore
     * @param {Map<string, any>} [options.mockPosts] - Fallback/Mock kolekcji lumina_posts
     * @param {boolean} [options.strictLiveVerification=false] - Wymóg realnego Firestore bez zaliczania mocków
     */
    constructor(options = {}) {
        super('LUMINA', '2026.3-lumina-official');
        this.db = options.db || null;
        this.mockPosts = options.mockPosts || new Map();
        this.strictLiveVerification = options.strictLiveVerification || false;
    }

    async validate(job, manifest) {
        const errors = [];
        if (!manifest.title || manifest.title.trim().length === 0) {
            errors.push('LUMINA_TITLE_REQUIRED: Tytuł posta na tablicę LUMINA jest wymagany');
        }
        if (!manifest.description || manifest.description.trim().length === 0) {
            errors.push('LUMINA_CONTENT_REQUIRED: Treść posta na tablicę LUMINA jest wymagana');
        }
        return { valid: errors.length === 0, errors };
    }

    async prepare(job, manifest) {
        // Generowanie deterministycznego ID posta (Pkt 24: powiązanie contentId + variantId)
        const postId = `post_${manifest.contentId.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${manifest.variantId}`;
        
        const payload = {
            postId,
            title: manifest.title,
            content: manifest.description,
            authorName: 'Christian Culture',
            authorHandle: '@christianculture',
            channel: 'tablica',
            contentId: manifest.contentId,
            variantId: manifest.variantId,
            idempotencyKey: job.idempotencyKey,
            manifestId: manifest.manifestId,
            publishedAt: new Date().toISOString(),
            status: 'published'
        };

        return { ready: true, preparedPayload: payload };
    }

    async publish(job, preparedPayload) {
        const postId = preparedPayload.postId;

        // 1. RZECZYWISTY ZAPIS DO FIRESTORE (jeśli instancja db jest przekazana)
        if (this.db) {
            try {
                const docRef = this.db.collection('lumina_posts').doc(postId);
                const docSnap = await docRef.get();
                if (docSnap.exists) {
                    return {
                        success: true,
                        remoteId: postId,
                        publicUrl: `https://polskieradio.cc/lumina-tablica.html?post=${postId}`,
                        state: 'PUBLISHED',
                        source: 'FIRESTORE_LIVE',
                        note: 'Idempotency hit: Dokument w Firestore lumina_posts już istnieje'
                    };
                }
                await docRef.set(preparedPayload);
                return {
                    success: true,
                    remoteId: postId,
                    publicUrl: `https://polskieradio.cc/lumina-tablica.html?post=${postId}`,
                    state: 'PUBLISHED',
                    source: 'FIRESTORE_LIVE',
                    note: 'Zapisano pomyślnie w kolekcji Firestore lumina_posts'
                };
            } catch (err) {
                return {
                    success: false,
                    remoteId: postId,
                    state: 'FAILED',
                    error: `Błąd zapisu w kolekcji Firestore lumina_posts: ${err.message}`
                };
            }
        }

        // 2. Obsługa mockPosts w pamięci (tryb testowy / offline)
        const existing = this.mockPosts.get(postId);
        if (existing) {
            return {
                success: true,
                remoteId: postId,
                publicUrl: `https://polskieradio.cc/lumina-tablica.html?post=${postId}`,
                state: 'PUBLISHED',
                source: 'MOCK_STORE',
                note: 'Idempotency hit: Post już istniał w pamięci roboczej, brak powielenia'
            };
        }

        this.mockPosts.set(postId, preparedPayload);

        return {
            success: true,
            remoteId: postId,
            publicUrl: `https://polskieradio.cc/lumina-tablica.html?post=${postId}`,
            state: 'PUBLISHED',
            source: 'MOCK_STORE',
            note: 'Zapisano w pamięci roboczej mockPosts (brak aktywnego połączenia db)'
        };
    }

    /**
     * Zdalna niezależna weryfikacja (Pkt 23: DOCUMENT EXISTS CHECK)
     */
    async verify(remoteId, publicUrl) {
        // 1. Weryfikacja w prawdziwej bazie Firestore
        if (this.db) {
            try {
                const snap = await this.db.collection('lumina_posts').doc(remoteId).get();
                if (snap.exists) {
                    const post = snap.data();
                    return {
                        verified: true,
                        status: 'EXISTS',
                        source: 'FIRESTORE_LIVE',
                        remoteMetadata: {
                            postId: snap.id,
                            title: post?.title || 'Untitled',
                            publishedAt: post?.publishedAt || post?.createdAt || new Date().toISOString()
                        }
                    };
                }
                return {
                    verified: false,
                    status: 'NOT_FOUND',
                    source: 'FIRESTORE_LIVE',
                    error: `Dokument ${remoteId} nie istnieje w kolekcji Firestore lumina_posts`
                };
            } catch (err) {
                if (this.strictLiveVerification) {
                    return {
                        verified: false,
                        status: 'FIRESTORE_ERROR',
                        error: `Błąd odczytu z bazy Firestore: ${err.message}`
                    };
                }
            }
        }

        // 2. Sprawdzenie mockPosts
        const post = this.mockPosts.get(remoteId);
        if (!post) {
            return {
                verified: false,
                status: 'NOT_FOUND',
                error: `Dokument ${remoteId} nie istnieje w kolekcji lumina_posts`
            };
        }

        // Jeśli wywołano w trybie ścisłej weryfikacji produkcyjnej, odrzuć mock!
        if (this.strictLiveVerification) {
            return {
                verified: false,
                status: 'SIMULATED_MOCK_UNVERIFIED',
                source: 'IN_MEMORY_MOCK',
                error: 'Brak aktywnego połączenia z bazą Firestore (luminaDb). Pamięć mockPosts nie uprawnia do zaliczenia weryfikacji produkcyjnej.'
            };
        }

        return {
            verified: true,
            status: 'EXISTS',
            source: 'IN_MEMORY_MOCK',
            remoteMetadata: {
                postId: post.postId,
                title: post.title,
                publishedAt: post.publishedAt
            }
        };
    }

    async getStatus(remoteId) {
        if (this.db) {
            try {
                const snap = await this.db.collection('lumina_posts').doc(remoteId).get();
                return {
                    processingStatus: snap.exists ? 'succeeded' : 'failed',
                    details: snap.exists ? snap.data() : null
                };
            } catch {
                return { processingStatus: 'failed' };
            }
        }
        const post = this.mockPosts.get(remoteId);
        return {
            processingStatus: post ? 'succeeded' : 'failed',
            details: post || null
        };
    }

    async retry(job, manifest) {
        const { preparedPayload } = await this.prepare(job, manifest);
        return this.publish(job, preparedPayload);
    }

    async cancel(jobId, remoteId) {
        if (this.db && remoteId) {
            try {
                await this.db.collection('lumina_posts').doc(remoteId).delete();
                return { cancelled: true, reason: `Dokument ${remoteId} usunięty z kolekcji Firestore lumina_posts` };
            } catch (err) {
                return { cancelled: false, reason: `Błąd usuwania z Firestore: ${err.message}` };
            }
        }
        if (remoteId && this.mockPosts.has(remoteId)) {
            this.mockPosts.delete(remoteId);
            return { cancelled: true, reason: `Post ${remoteId} został usunięty z LUMINA mock` };
        }
        return { cancelled: true, reason: 'Zadanie anulowane' };
    }
}
