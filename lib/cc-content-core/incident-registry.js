/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL OBSERVER & MISSION INTELLIGENCE — INCIDENT REGISTRY & HEALTH (FAZA 4)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 4)
 * Dyrektywy 48-53, 57-58: Rejestr Incydentów, Monitoring Zdrowia, Świeżość Danych
 * ══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';

/**
 * Lista monitorowanych komponentów infrastruktury CC Global (Dyrektywa 48)
 */
export const MONITORED_COMPONENTS = [
    'Content Core',
    'Language Factory',
    'Distribution Queue',
    'YouTube Adapter',
    'LUMINA Adapter',
    'WWW',
    'WhatsApp Bridge',
    'Radio',
    'Cloudflare',
    'Firestore'
];

/**
 * Pamięć podręczna incydentów (w środowisku runtime / sync z Firestore cc_incidents)
 * @type {Map<string, import('./types.js').CCIncidentRecord>}
 */
const INCIDENT_STORE = new Map();

/**
 * Pamięć podręczna stanu zdrowia komponentów (cc_platform_health)
 * @type {Map<string, import('./types.js').PlatformHealthRecord>}
 */
const HEALTH_STORE = new Map();

// Inicjalizacja stanu początkowego dla wszystkich 10 komponentów
for (const comp of MONITORED_COMPONENTS) {
    HEALTH_STORE.set(comp, {
        component: comp,
        status: 'HEALTHY',
        uptimePercent: 100.0,
        latencyMs: 15,
        lastCheckedAt: new Date().toISOString(),
        freshness: '<15 MIN',
        lastError: null
    });
}

/**
 * Oblicza stan świeżości danych na podstawie znacznika czasu (Dyrektywa 57, 58)
 * @param {string|null} timestampIso
 * @returns {import('./types.js').DataFreshness}
 */
export function calculateFreshness(timestampIso) {
    if (!timestampIso) return 'UNKNOWN';
    const now = Date.now();
    const ts = new Date(timestampIso).getTime();
    if (isNaN(ts)) return 'UNKNOWN';

    const diffMinutes = (now - ts) / (1000 * 60);

    if (diffMinutes < 3) return 'LIVE';
    if (diffMinutes < 15) return '<15 MIN';
    if (diffMinutes < 60) return '<1 H';
    return 'STALE'; // Dyrektywa 58: Starsze niż godzina to jawnie STALE
}

/**
 * Zgłasza nowy incydent w rejestrze (Dyrektywa 50)
 * @param {Object} params
 * @param {string} params.component
 * @param {import('./types.js').IncidentSeverity} params.severity
 * @param {string} params.errorCode
 * @param {string} params.summary
 * @param {string[]} [params.relatedJobIds]
 * @param {string} [params.createdBy]
 * @returns {import('./types.js').CCIncidentRecord}
 */
export function reportIncident(params) {
    const incidentId = `inc_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    // Dynamiczna degradacja statusu zdrowia komponentu (wyszukiwanie elastyczne)
    let health = HEALTH_STORE.get(params.component);
    if (!health) {
        const norm = params.component.toLowerCase().replace(/[\s_-]+/g, '');
        for (const [k, v] of HEALTH_STORE.entries()) {
            if (k.toLowerCase().replace(/[\s_-]+/g, '') === norm) {
                health = v;
                break;
            }
        }
    }
    const targetComp = health ? health.component : params.component;

    /** @type {import('./types.js').CCIncidentRecord} */
    const incident = {
        incidentId,
        component: targetComp,
        severity: params.severity || 'WARNING',
        status: 'OPEN',
        startedAt: new Date().toISOString(),
        resolvedAt: null,
        errorCode: params.errorCode || 'UNKNOWN_ERROR',
        summary: params.summary || 'Incydent w komponencie',
        relatedJobIds: params.relatedJobIds || [],
        createdBy: params.createdBy || 'SYSTEM_OBSERVER'
    };

    INCIDENT_STORE.set(incidentId, incident);

    if (health) {
        if (params.severity === 'CRITICAL' || params.severity === 'HIGH') {
            health.status = 'ERROR';
        } else if (params.severity === 'WARNING' || params.severity === 'DEGRADED') {
            health.status = 'DEGRADED';
        }
        health.lastError = params.summary;
        health.lastCheckedAt = new Date().toISOString();
        health.freshness = 'LIVE';
    }

    return incident;
}

/**
 * Rozwiązuje incydent
 * @param {string} incidentId
 * @param {string} operator
 * @param {string} resolutionSummary
 */
export function resolveIncident(incidentId, operator, resolutionSummary = 'Incydent rozwiązany') {
    const inc = INCIDENT_STORE.get(incidentId);
    if (!inc) throw new Error(`Nie odnaleziono incydentu ${incidentId}`);

    inc.status = 'RESOLVED';
    inc.resolvedAt = new Date().toISOString();
    inc.summary = `${inc.summary} | Rozwiązanie: ${resolutionSummary} (${operator})`;

    // Przywrócenie zdrowia komponentu jeśli brak innych otwartych krytycznych incydentów
    const openForComponent = Array.from(INCIDENT_STORE.values())
        .filter(i => i.component === inc.component && i.status !== 'RESOLVED');

    let health = HEALTH_STORE.get(inc.component);
    if (!health) {
        const norm = inc.component.toLowerCase().replace(/[\s_-]+/g, '');
        for (const [k, v] of HEALTH_STORE.entries()) {
            if (k.toLowerCase().replace(/[\s_-]+/g, '') === norm) {
                health = v;
                break;
            }
        }
    }

    if (health) {
        if (openForComponent.length === 0) {
            health.status = 'HEALTHY';
            health.lastError = null;
        } else if (openForComponent.some(i => i.severity === 'HIGH' || i.severity === 'CRITICAL')) {
            health.status = 'ERROR';
        } else {
            health.status = 'DEGRADED';
        }
        health.lastCheckedAt = new Date().toISOString();
    }

    return inc;
}

/**
 * Pobiera listę aktywnych incydentów
 * @returns {Array<import('./types.js').CCIncidentRecord>}
 */
export function getActiveIncidents() {
    return Array.from(INCIDENT_STORE.values()).filter(i => i.status !== 'RESOLVED');
}

/**
 * Rejestruje odpytanie stanu komponentu (Heartbeat / Probe)
 * @param {string} component
 * @param {import('./types.js').HealthStatus} status
 * @param {number} latencyMs
 * @param {string|null} [error=null]
 */
export function recordComponentHeartbeat(component, status, latencyMs = 20, error = null) {
    const existing = HEALTH_STORE.get(component) || {
        component,
        uptimePercent: 100.0,
        latencyMs,
        lastCheckedAt: new Date().toISOString(),
        freshness: 'LIVE',
        lastError: null
    };

    existing.status = status;
    existing.latencyMs = latencyMs;
    existing.lastCheckedAt = new Date().toISOString();
    existing.freshness = 'LIVE';
    if (error) existing.lastError = error;

    HEALTH_STORE.set(component, existing);
    return existing;
}

/**
 * Zwraca stan zdrowia wszystkich komponentów
 * @returns {Record<string, import('./types.js').PlatformHealthRecord>}
 */
export function getAllComponentsHealth() {
    const result = {};
    for (const [comp, record] of HEALTH_STORE.entries()) {
        result[comp] = {
            ...record,
            freshness: calculateFreshness(record.lastCheckedAt)
        };
    }
    return result;
}

/**
 * Klasa fasadowa IncidentRegistry dla rejestru incydentów i monitoringu
 */
export class IncidentRegistry {
    constructor() {
        this.monitoredComponents = MONITORED_COMPONENTS;
    }

    calculateFreshness(ts) {
        return calculateFreshness(ts);
    }

    reportIncident(params) {
        return reportIncident({
            component: params.component,
            severity: params.severity,
            errorCode: params.errorCode,
            summary: params.title || params.summary,
            description: params.description,
            relatedJobIds: params.relatedJobIds,
            createdBy: params.createdBy
        });
    }

    resolveIncident(incidentId, summary = 'Rozwiązano', operator = 'OPERATOR') {
        return resolveIncident(incidentId, operator, summary);
    }

    getActiveIncidents() {
        return getActiveIncidents();
    }

    recordHeartbeat(comp, status, latencyMs, error) {
        return recordComponentHeartbeat(comp, status, latencyMs, error);
    }

    getAllComponentsHealth() {
        return getAllComponentsHealth();
    }

    getComponentHealth(comp) {
        const all = getAllComponentsHealth();
        if (all[comp]) return all[comp];
        const norm = comp.toLowerCase().replace(/[\s_-]+/g, '');
        for (const [k, v] of Object.entries(all)) {
            if (k.toLowerCase().replace(/[\s_-]+/g, '') === norm) return v;
        }
        return null;
    }
}

