/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL OBSERVER — NORMALIZATION LAYER (FAZA 4)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 4)
 * Dyrektywy 6, 8, 10, 69: Konwersja platform-specific raw → CC Analytics Model.
 * Pkt 8: Zero Fake Metrics — Brak danych to NOT_AVAILABLE / UNKNOWN, nie 0!
 * ══════════════════════════════════════════════════════════════════════════
 */

import { createAnalyticsEvent, createAnalyticsSnapshot } from '../analytics-core.js';

export class NormalizationLayer {
    /**
     * Weryfikuje i mapuje metryki platformowe, wyodrębniając brakujące pola jako notAvailableMetrics
     */
    static normalizePlatformMetrics(platform, rawData = {}, context = {}) {
        const metrics = {};
        const notAvailableMetrics = [];

        if (rawData) {
            for (const [k, v] of Object.entries(rawData)) {
                if (v !== null && v !== undefined) {
                    metrics[k] = v;
                } else {
                    notAvailableMetrics.push(k);
                }
            }
        }

        const standardKeys = ['views', 'watchTimeSeconds', 'shares', 'likes', 'comments'];
        for (const sk of standardKeys) {
            if (!rawData || rawData[sk] === undefined || rawData[sk] === null) {
                if (!notAvailableMetrics.includes(sk)) {
                    notAvailableMetrics.push(sk);
                }
            }
        }

        return {
            platform,
            metrics,
            notAvailableMetrics,
            normalizedAt: new Date().toISOString()
        };
    }

    /**
     * Normalizuje surowe dane platformy do kanonicznych obiektów analitycznych
     * @param {import('../types.js').PlatformType} platform
     * @param {any} rawData
     * @param {Object} context
     * @returns {{
     *   events: Array<import('../types.js').CCAnalyticsEvent>,
     *   snapshots: Array<import('../types.js').CCAnalyticsSnapshot>,
     *   notAvailableMetrics: string[]
     * }}
     */
    static normalize(platform, rawData, context = {}) {
        const events = [];
        const snapshots = [];
        const notAvailableMetrics = [];

        const contentId = context.contentId || rawData?.contentId || 'UNKNOWN';
        const publicationId = context.publicationId || rawData?.publicationId || null;
        const variantId = context.variantId || rawData?.variantId || null;
        const language = context.language || rawData?.language || 'pl';
        const channelId = context.channelId || rawData?.channelId || 'default';

        switch (platform) {
            case 'YOUTUBE': {
                // YouTube Data API v3 statistics
                const stats = rawData?.statistics || rawData;
                
                if (stats?.viewCount !== undefined && stats.viewCount !== null) {
                    snapshots.push(createAnalyticsSnapshot({
                        contentId,
                        variantId,
                        publicationId,
                        platform: 'YOUTUBE',
                        channelId,
                        language,
                        metricType: 'VIEW',
                        cumulativeValue: Number(stats.viewCount),
                        source: 'YOUTUBE_API',
                        verificationLevel: 'PLATFORM_API'
                    }));
                } else {
                    notAvailableMetrics.push('VIEW');
                }

                if (stats?.likeCount !== undefined && stats.likeCount !== null) {
                    snapshots.push(createAnalyticsSnapshot({
                        contentId,
                        variantId,
                        publicationId,
                        platform: 'YOUTUBE',
                        channelId,
                        language,
                        metricType: 'REACTION',
                        cumulativeValue: Number(stats.likeCount),
                        source: 'YOUTUBE_API',
                        verificationLevel: 'PLATFORM_API'
                    }));
                } else {
                    notAvailableMetrics.push('REACTION');
                }

                if (stats?.commentCount !== undefined && stats.commentCount !== null) {
                    snapshots.push(createAnalyticsSnapshot({
                        contentId,
                        variantId,
                        publicationId,
                        platform: 'YOUTUBE',
                        channelId,
                        language,
                        metricType: 'COMMENT',
                        cumulativeValue: Number(stats.commentCount),
                        source: 'YOUTUBE_API',
                        verificationLevel: 'PLATFORM_API'
                    }));
                } else {
                    notAvailableMetrics.push('COMMENT');
                }

                // YouTube API nie zwraca watch time w ogólnym endpointzie videos.list
                notAvailableMetrics.push('WATCH_TIME');
                break;
            }

            case 'LUMINA': {
                // Obserwacja z kolekcji lumina_posts
                const post = rawData?.postData || rawData;

                if (post?.commentsCount !== undefined || post?.comments !== undefined) {
                    const commentsVal = post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0);
                    snapshots.push(createAnalyticsSnapshot({
                        contentId,
                        variantId,
                        publicationId,
                        platform: 'LUMINA',
                        channelId: 'tablica',
                        language,
                        metricType: 'COMMENT',
                        cumulativeValue: Number(commentsVal),
                        source: 'FIRESTORE',
                        verificationLevel: 'FIRST_PARTY'
                    }));
                }

                if (post?.reactions !== undefined || post?.likesCount !== undefined) {
                    const reactVal = post.likesCount ?? (typeof post.reactions === 'object' ? Object.keys(post.reactions).length : 0);
                    snapshots.push(createAnalyticsSnapshot({
                        contentId,
                        variantId,
                        publicationId,
                        platform: 'LUMINA',
                        channelId: 'tablica',
                        language,
                        metricType: 'REACTION',
                        cumulativeValue: Number(reactVal),
                        source: 'FIRESTORE',
                        verificationLevel: 'FIRST_PARTY'
                    }));
                }

                // Dyrektywa 24: Jeżeli LUMINA faktycznie nie rejestruje wyświetleń posta, nie dodajemy fałszywych zer
                if (post?.viewsCount === undefined) {
                    notAvailableMetrics.push('VIEW');
                }
                break;
            }

            case 'WWW': {
                // First-party zdarzenia na polskieradio.cc
                const visits = rawData?.visits || [];
                for (const v of visits) {
                    events.push(createAnalyticsEvent({
                        contentId,
                        variantId,
                        publicationId,
                        platform: 'WWW',
                        channelId: 'portal',
                        language,
                        metricType: v.type === 'AUDIO_PLAY' ? 'PLAY' : 'DEVOTIONAL_OPEN',
                        metricValue: v.count || 1,
                        source: 'CLOUDFLARE',
                        verificationLevel: 'FIRST_PARTY',
                        sourceTimestamp: v.timestamp || new Date().toISOString()
                    }));
                }
                break;
            }

            case 'RADIO': {
                // Streaming status (Icecast / serwer audio)
                const stream = rawData?.streamStatus || rawData;
                if (stream?.currentListeners !== undefined) {
                    snapshots.push(createAnalyticsSnapshot({
                        contentId,
                        variantId,
                        publicationId,
                        platform: 'RADIO',
                        channelId: 'live_stream',
                        language: 'pl',
                        metricType: 'LISTEN',
                        cumulativeValue: Number(stream.currentListeners),
                        source: 'INTERNAL_EVENT',
                        verificationLevel: 'FIRST_PARTY'
                    }));
                }

                if (stream?.sessionStarts !== undefined) {
                    snapshots.push(createAnalyticsSnapshot({
                        contentId,
                        variantId,
                        publicationId,
                        platform: 'RADIO',
                        channelId: 'live_stream',
                        language: 'pl',
                        metricType: 'RADIO_LISTEN',
                        cumulativeValue: Number(stream.sessionStarts),
                        source: 'INTERNAL_EVENT',
                        verificationLevel: 'FIRST_PARTY'
                    }));
                }
                break;
            }

            case 'WHATSAPP': {
                // Dyrektywa 27: Tylko SENT z Dispatch ACK. Zero wymyślonego read rate!
                if (rawData?.ackReceived || rawData?.status === 'SENT') {
                    events.push(createAnalyticsEvent({
                        contentId,
                        variantId,
                        publicationId,
                        platform: 'WHATSAPP',
                        channelId: rawData.channelId || 'rotacja-glowna',
                        language,
                        metricType: 'IMPRESSION',
                        metricValue: 1,
                        source: 'INTERNAL_EVENT',
                        verificationLevel: 'INTERNAL_CONFIRMED'
                    }));
                }
                notAvailableMetrics.push('VIEW');
                notAvailableMetrics.push('READ_RATE');
                break;
            }

            case 'BITCHUTE': {
                // Dyrektywa 28: BitChute manual = OPERATOR_CONFIRMED (nie PLATFORM_API)
                if (rawData?.operatorConfirmedUrl) {
                    events.push(createAnalyticsEvent({
                        contentId,
                        variantId,
                        publicationId,
                        platform: 'BITCHUTE',
                        channelId: 'christian_culture',
                        language,
                        metricType: 'VIEW',
                        metricValue: rawData.estimatedViews || 1,
                        source: 'MANUAL',
                        verificationLevel: 'OPERATOR_CONFIRMED'
                    }));
                } else {
                    notAvailableMetrics.push('VIEW');
                }
                break;
            }

            case 'FACEBOOK': {
                // Dyrektywa 29: Adapter wyłączony -> brak danych
                notAvailableMetrics.push('ALL_METRICS');
                break;
            }

            default:
                break;
        }

        return {
            events,
            snapshots,
            notAvailableMetrics
        };
    }
}
