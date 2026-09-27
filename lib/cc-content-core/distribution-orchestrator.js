/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — ORCHESTRATOR & PIPELINE (FAZA 3A)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3)
 * ══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { validateDistributionRights } from './rights-gate.js';
import { createPublicationManifest } from './publication-manifest.js';
import { DistributionQueue } from './distribution-queue.js';
import { PLATFORM_CAPABILITIES, getPlatformCapability } from './distribution-registry.js';

export class DistributionOrchestrator {
    constructor(options = {}) {
        this.queue = options.queue || new DistributionQueue(options);
        this.plans = new Map(); // planId -> DistributionPlan
        this.canonicalPublications = options.canonicalPublications || new Map(); // contentId -> Publication[]
    }

    /**
     * Tworzy Plan Dystrybucji Treści (Pkt 6, 53, 54)
     * Pkt 53: Rozróżnia CONTENT APPROVED od DISTRIBUTION APPROVED.
     * @param {import('./types.js').ContentMasterRecord} content
     * @param {import('./types.js').ContentVariant} variant
     * @param {Object} planConfig
     * @param {string} operator
     * @returns {import('./types.js').DistributionPlan}
     */
    createPlan(content, variant, planConfig, operator) {
        if (!content || !variant) {
            throw new Error('Content oraz Variant są wymagane do utworzenia planu dystrybucji');
        }

        // Pkt 2: Weryfikacja statusu APPROVED
        if (variant.status !== 'APPROVED') {
            throw new Error(`Dystrybucja dopuszcza WYŁĄCZNIE warianty w stanie APPROVED. Status: ${variant.status}`);
        }

        // Pkt 53/54: Wymóg autoryzacji dystrybucji (Distribution Approval)
        if (!planConfig.approvedForDistribution) {
            throw new Error('DISTRIBUTION_NOT_APPROVED: Utworzenie planu wymaga jawnej zgody na dystrybucję (approvedForDistribution: true)');
        }

        const planId = `plan_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${crypto.randomBytes(4).toString('hex')}`;
        const platforms = planConfig.platforms || ['LUMINA', 'WWW', 'WHATSAPP'];
        const channels = planConfig.channels || ['default'];
        const jobIds = [];

        // Walidacja praw (Rights Gate) dla każdej platformy
        for (const platform of platforms) {
            const rightsCheck = validateDistributionRights(content, variant, platform, {
                requireVideo: platform === 'YOUTUBE' || platform === 'BITCHUTE',
                requireAudio: platform === 'RADIO'
            });

            if (!rightsCheck.allowed) {
                throw new Error(`Brak praw do dystrybucji dla platformy ${platform}: ${rightsCheck.reason}`);
            }

            // Pkt 37: Utworzenie niezmiennego manifestu publikacji
            const capability = getPlatformCapability(platform);
            const manifest = createPublicationManifest(
                content,
                variant,
                platform,
                channels[0] || 'default',
                capability?.adapterVersion || '1.0.0',
                operator
            );

            // Kolejkowanie zadania
            const job = this.queue.enqueueJob({
                planId,
                contentId: content.contentId,
                variantId: variant.variantId,
                platform,
                channelId: channels[0] || 'default',
                manifestId: manifest.manifestId,
                scheduledAt: planConfig.scheduledAt,
                publicationIntent: planConfig.visibility || 'PRIVATE'
            });

            jobIds.push(job.jobId);
        }

        /** @type {import('./types.js').DistributionPlan} */
        const plan = {
            planId,
            contentId: content.contentId,
            variantId: variant.variantId,
            platforms,
            channels,
            schedule: {
                publishNow: planConfig.publishNow ?? true,
                scheduledAt: planConfig.scheduledAt,
                timezone: planConfig.timezone || 'UTC'
            },
            visibility: planConfig.visibility || 'PRIVATE',
            notificationPolicy: planConfig.notificationPolicy || { notifySubscribers: false, pushToLumina: false, whatsappDispatch: false },
            status: 'APPROVED_FOR_DISTRIBUTION',
            createdAt: new Date().toISOString(),
            createdBy: operator,
            approvedForDistributionBy: operator,
            approvedForDistributionAt: new Date().toISOString(),
            jobIds
        };

        this.plans.set(planId, plan);
        return plan;
    }

    /**
     * Wykonuje zadania zawarte w Planie Dystrybucji
     * Pkt 73: Partial Failure — jeśli 2 joby przeszły, a 1 zawiódł, status planu to PARTIAL_SUCCESS!
     * @param {string} planId
     * @param {Object} [options]
     */
    async executePlan(planId, options = {}) {
        const plan = this.plans.get(planId);
        if (!plan) throw new Error(`Nie odnaleziono planu ${planId}`);

        plan.status = 'EXECUTING';
        let successes = 0;
        let failures = 0;

        for (const jobId of plan.jobIds) {
            const job = await this.queue.processJob(jobId, options);
            if (job.status === 'VERIFIED' || job.status === 'PUBLISHED' || job.status === 'READY' || job.status === 'UPLOADED') {
                successes += 1;
                // Pkt 10: Zapis do kanonicznego rejestru publikacji cc_content/{contentId}/publications
                this.recordCanonicalPublication(job);
            } else {
                failures += 1;
            }
        }

        // Pkt 73: Precyzyjna klasyfikacja stanu planu
        if (failures === 0) {
            plan.status = 'COMPLETED';
        } else if (successes > 0 && failures > 0) {
            plan.status = 'PARTIAL_SUCCESS';
        } else {
            plan.status = 'FAILED';
        }

        return { plan, successes, failures };
    }

    /**
     * Zapisuje publikację w kanonicznym rejestrze (Pkt 10)
     */
    recordCanonicalPublication(job) {
        if (!this.canonicalPublications.has(job.contentId)) {
            this.canonicalPublications.set(job.contentId, []);
        }
        const pubs = this.canonicalPublications.get(job.contentId);
        
        // Zastąp lub dodaj
        const existingIdx = pubs.findIndex(p => p.platform === job.platform && p.variantId === job.variantId);
        const pubRecord = {
            publicationId: `pub_${job.platform.toLowerCase()}_${job.variantId}`,
            platform: job.platform,
            variantId: job.variantId,
            remoteId: job.remoteId,
            publicUrl: job.publicUrl,
            status: job.status,
            publishedAt: new Date().toISOString(),
            jobId: job.jobId
        };

        if (existingIdx >= 0) {
            pubs[existingIdx] = pubRecord;
        } else {
            pubs.push(pubRecord);
        }
    }

    /**
     * Zwraca globalną macierz dystrybucji na podstawie rzeczywistych danych (Pkt 50, 51)
     * @param {string} contentId
     */
    getGlobalDistributionMatrix(contentId) {
        const pubs = this.canonicalPublications.get(contentId) || [];
        const languages = ['pl', 'en', 'es', 'pt-BR'];
        const platforms = ['WWW', 'LUMINA', 'YOUTUBE', 'WHATSAPP', 'BITCHUTE', 'RADIO'];

        const matrix = {};

        for (const lang of languages) {
            matrix[lang] = {};
            for (const plat of platforms) {
                // Szukamy publikacji dla danego języka i platformy
                const pub = pubs.find(p => p.platform === plat && (p.variantId?.includes(lang.toLowerCase().replace('-', '_')) || (lang === 'pl' && p.variantId?.includes('pl'))));
                if (pub) {
                    matrix[lang][plat] = pub.status;
                } else {
                    matrix[lang][plat] = 'NOT_CONFIGURED';
                }
            }
        }

        return matrix;
    }

    getPlan(planId) {
        return this.plans.get(planId) || null;
    }

    getPublicationsForContent(contentId) {
        return this.canonicalPublications.get(contentId) || [];
    }
}
