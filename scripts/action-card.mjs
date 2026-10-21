// ══════════════════════════════════════════════════════════════════════════
// MODUŁ M6: ACTION CARD ENGINE — MISSION CONTROL L0 „5 SEKUND” (EkoCC @777)
// Odpowiedzialny za generowanie, walidację i serwerowe przetwarzanie kart akcji
// dla Prezesa L0 zgodnie z Protokołem Wdrożeniowym EkoCC v2 Premium (2026-10-21).
// ══════════════════════════════════════════════════════════════════════════

import crypto from 'node:crypto';

export const OWNER_EMAIL = 'nazirczarkes@gmail.com';

export const CARD_KINDS = {
    DECISION: 'decision',
    EXECUTION: 'execution',
    PROBLEM: 'problem',
    SHIFT_END: 'shift_end'
};

export const VERDICTS = {
    BETTER: 'JEST LEPIEJ',
    PREMIUM: 'MAMY WYŻSZY STANDARD PREMIUM',
    NO_IMPROVEMENT: 'BEZ POPRAWY',
    UNVERIFIED: 'NIEZWERYFIKOWANE'
};

/**
 * Generuje deterministyczny klucz idempotencji dla karty i operacji.
 */
export function computeIdempotencyKey(taskId, revision, timestamp) {
    return crypto.createHash('sha256')
        .update(`${taskId}:${revision}:${timestamp}`)
        .digest('hex');
}

/**
 * Tworzy ustrukturyzowaną kartę akcji zgodną ze schematem v1.0.
 */
export function createActionCard({
    taskId,
    kind,
    agentId,
    officeId,
    lines = {},
    verdict = null,
    requiresL0 = true,
    evidenceRef = null,
    revision = 1
}) {
    if (!taskId) throw new Error('Wymagany parametr taskId');
    if (!Object.values(CARD_KINDS).includes(kind)) {
        throw new Error(`Nieprawidłowy typ karty: ${kind}`);
    }

    const timestamp = new Date().toISOString();
    const cardId = `CARD-${timestamp.slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex')}`;
    const idempotencyKey = computeIdempotencyKey(taskId, revision, timestamp);

    // Domyślne przyciski dla danego typu karty
    let actions = [];
    if (kind === CARD_KINDS.DECISION) {
        actions = [
            { id: 'approve', label: '✅ ZATWIERDŹ', style: 'gold-primary' },
            { id: 'reject', label: '❌ ODRZUĆ', style: 'red-danger' },
            { id: 'explain', label: '❓ WYJAŚNIJ', style: 'neutral-secondary' },
            { id: 'change_plan', label: '✏️ ZMIEŃ PLAN', style: 'neutral-secondary' }
        ];
    } else if (kind === CARD_KINDS.EXECUTION) {
        actions = [
            { id: 'verify', label: '🔎 SPRAWDŹ', style: 'gold-primary' },
            { id: 'next_task', label: '➡️ NASTĘPNE ZADANIE', style: 'neutral-secondary' },
            { id: 'details', label: '📄 SZCZEGÓŁY', style: 'neutral-secondary' }
        ];
    } else if (kind === CARD_KINDS.PROBLEM) {
        actions = [
            { id: 'fix', label: '🔧 NAPRAW', style: 'red-danger' },
            { id: 'pause', label: '⏸️ WSTRZYMAJ', style: 'neutral-secondary' },
            { id: 'escalate', label: '⬆️ ESKALUJ', style: 'gold-primary' }
        ];
    } else if (kind === CARD_KINDS.SHIFT_END) {
        actions = [
            { id: 'handoff', label: '🔁 PRZEKAŻ ZMIANĘ', style: 'gold-primary' },
            { id: 'continue', label: '▶️ KONTYNUUJ', style: 'neutral-secondary' },
            { id: 'evidence', label: '📄 DOWODY', style: 'neutral-secondary' }
        ];
    }

    return {
        schema_version: '1.0',
        task_id: taskId,
        card_id: cardId,
        revision,
        kind,
        agent_id: agentId || '@unknown',
        office_id: officeId || 'unknown-office',
        created_at: timestamp,
        lines: {
            line1: lines.line1 ? String(lines.line1).slice(0, 120) : '',
            line2: lines.line2 ? String(lines.line2).slice(0, 120) : '',
            line3: lines.line3 ? String(lines.line3).slice(0, 120) : '',
            line4: lines.line4 ? String(lines.line4).slice(0, 120) : undefined
        },
        verdict,
        requires_l0: Boolean(requiresL0),
        actions,
        idempotency_key: idempotencyKey,
        evidence_ref: evidenceRef || null,
        state: kind === CARD_KINDS.DECISION ? 'awaiting_decision' : 'ready'
    };
}

/**
 * Formatuje kartę akcji do zwięzłego widoku tekstowego „5 sekund”.
 */
export function formatCardTo5SecText(card) {
    if (!card || !card.lines) return '';

    if (card.kind === CARD_KINDS.DECISION) {
        return [
            `SPRAWA: ${card.lines.line1}`,
            `MISJA CC: ${card.lines.line2}`,
            `KORZYŚĆ I RYZYKO: ${card.lines.line3}`,
            `REKOMENDACJA: ${card.lines.line4 || 'WDROŻYĆ — TAK'}`
        ].join('\n');
    } else if (card.kind === CARD_KINDS.EXECUTION) {
        return [
            `ZROBIONE: ${card.lines.line1}`,
            `DOWÓD: ${card.lines.line2}`,
            `WERDYKT: ${card.verdict || 'NIEZWERYFIKOWANE'}`
        ].join('\n');
    } else if (card.kind === CARD_KINDS.PROBLEM) {
        return [
            `PROBLEM: ${card.lines.line1}`,
            `WPŁYW: ${card.lines.line2}`,
            `REKOMENDACJA: ${card.lines.line3}`
        ].join('\n');
    } else if (card.kind === CARD_KINDS.SHIFT_END) {
        return [
            `UKOŃCZONO: ${card.lines.line1}`,
            `POZOSTAŁO: ${card.lines.line2}`,
            `STATUS: ${card.lines.line3}`
        ].join('\n');
    }

    return '';
}

/**
 * Przetwarza kliknięcie przycisku akcji po stronie serwera z rygorystyczną kontrolą dostępu L0.
 */
export function processCardAction({
    card,
    actionId,
    actorEmail,
    isVerifiedOwner = false,
    processedKeysStore = new Set()
}) {
    if (!card) throw new Error('Brak karty akcji');
    if (!actionId) throw new Error('Brak identyfikatora akcji');

    // 1. Sprawdzenie uprawnień L0 dla działań decyzyjnych
    if (card.requires_l0 || card.kind === CARD_KINDS.DECISION) {
        const isOwner = isVerifiedOwner && actorEmail && actorEmail.toLowerCase() === OWNER_EMAIL;
        if (!isOwner) {
            return {
                success: false,
                error: 'FORBIDDEN_L0_REQUIRED',
                message: 'Wyłącznie Prezes L0 (nazirczarkes@gmail.com) posiada uprawnienia do zatwierdzania tej decyzji.'
            };
        }
    }

    // 2. Kontrola idempotencji (ochrona przed wielokrotnym kliknięciem)
    const idempotencyId = `${card.card_id}:${actionId}`;
    if (processedKeysStore.has(idempotencyId)) {
        return {
            success: true,
            status: 'ALREADY_PROCESSED',
            message: `Akcja ${actionId} została już zarejestrowana (ochrona idempotencji).`,
            cardId: card.card_id,
            actionId
        };
    }

    processedKeysStore.add(idempotencyId);

    // 3. Zmiana stanu karty
    let newState = card.state;
    let resolution = 'OK';

    if (actionId === 'approve') {
        newState = 'approved';
        resolution = 'ZATWIERDZONO PRZEZ PREZESA L0';
    } else if (actionId === 'reject') {
        newState = 'rejected';
        resolution = 'ODRZUCONO PRZEZ PREZESA L0';
    } else if (actionId === 'explain') {
        newState = 'explanation_requested';
        resolution = 'ZAŻĄDANO WYJAŚNIEŃ OD AGENTA';
    } else if (actionId === 'fix') {
        newState = 'fix_enqueued';
        resolution = 'SKIEROWANO DO NATYCHMIASTOWEJ NAPRAWY P0';
    } else if (actionId === 'handoff') {
        newState = 'handed_off';
        resolution = 'PRZEKAZANO PROTOKÓŁ HANDOFF DO NASTĘPNEJ ZMIANY';
    }

    return {
        success: true,
        status: 'SUCCESS',
        cardId: card.card_id,
        taskId: card.task_id,
        actionId,
        actor: actorEmail,
        timestamp: new Date().toISOString(),
        newState,
        resolution
    };
}
