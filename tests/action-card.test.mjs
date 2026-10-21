// ══════════════════════════════════════════════════════════════════════════
// TESTY MODUŁU M6: ACTION CARD ENGINE (EkoCC v2 Premium MC L0)
// ══════════════════════════════════════════════════════════════════════════

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    createActionCard,
    formatCardTo5SecText,
    processCardAction,
    CARD_KINDS,
    VERDICTS,
    OWNER_EMAIL
} from '../scripts/action-card.mjs';

test('M6: createActionCard - poprawna struktura karty Decyzji i domyślne przyciski', () => {
    const card = createActionCard({
        taskId: 'TASK-20261021-001',
        kind: CARD_KINDS.DECISION,
        agentId: '@409',
        officeId: 'CC-A12-02-agent-409',
        lines: {
            line1: 'Wdrożenie ujednoliconej palety Champagne Gold w nawigacji portalu',
            line2: 'TAK',
            line3: 'Spójny luksusowy odbiór wizualny CC; brak ryzyka dla bazy danych',
            line4: 'WDROŻYĆ — TAK (Zgodne z Design System v2)'
        },
        requiresL0: true
    });

    assert.equal(card.schema_version, '1.0');
    assert.equal(card.kind, 'decision');
    assert.equal(card.agent_id, '@409');
    assert.equal(card.requires_l0, true);
    assert.equal(card.actions.length, 4);
    assert.equal(card.actions[0].id, 'approve');
    assert.equal(card.actions[1].id, 'reject');
    assert.match(card.idempotency_key, /^[0-9a-f]{64}$/);
});

test('M6: formatCardTo5SecText - generowanie zwięzłego formatu 5 sekund dla L0', () => {
    // 1. Karta Decyzji (4 wiersze)
    const decCard = createActionCard({
        taskId: 'TASK-001',
        kind: CARD_KINDS.DECISION,
        lines: {
            line1: 'Nowy kanał radiowy CC Worship',
            line2: 'TAK',
            line3: 'Zwiększenie zasięgu ewangelizacyjnego; bez kosztów',
            line4: 'WDROŻYĆ — TAK'
        }
    });
    const textDec = formatCardTo5SecText(decCard);
    assert.match(textDec, /^SPRAWA: Nowy kanał radiowy/m);
    assert.match(textDec, /^MISJA CC: TAK/m);
    assert.match(textDec, /^KORZYŚĆ I RYZYKO: Zwiększenie zasięgu/m);
    assert.match(textDec, /^REKOMENDACJA: WDROŻYĆ — TAK/m);

    // 2. Karta Wykonania (3 wiersze)
    const execCard = createActionCard({
        taskId: 'TASK-002',
        kind: CARD_KINDS.EXECUTION,
        lines: {
            line1: 'Naprawiono wyciek pamięci klienta agenta',
            line2: 'https://polskieradio.cc (commit 436e0ec7)'
        },
        verdict: VERDICTS.PREMIUM
    });
    const textExec = formatCardTo5SecText(execCard);
    assert.match(textExec, /^ZROBIONE: Naprawiono wyciek/m);
    assert.match(textExec, /^DOWÓD: https:\/\/polskieradio\.cc/m);
    assert.match(textExec, /^WERDYKT: MAMY WYŻSZY STANDARD PREMIUM/m);
});

test('M6: processCardAction - ochrona serwerowa tożsamości L0 (odrzucenie nieuprawnionych)', () => {
    const card = createActionCard({
        taskId: 'TASK-001',
        kind: CARD_KINDS.DECISION,
        requiresL0: true
    });

    // Próba zatwierdzenia przez obcy e-mail
    const resAttacker = processCardAction({
        card,
        actionId: 'approve',
        actorEmail: 'attacker@example.com',
        isVerifiedOwner: false
    });
    assert.equal(resAttacker.success, false);
    assert.equal(resAttacker.error, 'FORBIDDEN_L0_REQUIRED');

    // Próba zatwierdzenia przez poprawnego L0 ale bez zweryfikowanej flagi
    const resUnverified = processCardAction({
        card,
        actionId: 'approve',
        actorEmail: OWNER_EMAIL,
        isVerifiedOwner: false
    });
    assert.equal(resUnverified.success, false);

    // Prawidłowa autoryzacja L0
    const store = new Set();
    const resOwner = processCardAction({
        card,
        actionId: 'approve',
        actorEmail: OWNER_EMAIL,
        isVerifiedOwner: true,
        processedKeysStore: store
    });
    assert.equal(resOwner.success, true);
    assert.equal(resOwner.status, 'SUCCESS');
    assert.equal(resOwner.newState, 'approved');
});

test('M6: processCardAction - idempotencja chroni przed podwójnym kliknięciem', () => {
    const card = createActionCard({
        taskId: 'TASK-001',
        kind: CARD_KINDS.DECISION,
        requiresL0: true
    });

    const store = new Set();
    const firstCall = processCardAction({
        card,
        actionId: 'approve',
        actorEmail: OWNER_EMAIL,
        isVerifiedOwner: true,
        processedKeysStore: store
    });
    assert.equal(firstCall.status, 'SUCCESS');

    // Drugie kliknięcie (identyczny card_id i actionId)
    const secondCall = processCardAction({
        card,
        actionId: 'approve',
        actorEmail: OWNER_EMAIL,
        isVerifiedOwner: true,
        processedKeysStore: store
    });
    assert.equal(secondCall.status, 'ALREADY_PROCESSED');
    assert.match(secondCall.message, /została już zarejestrowana/);
});
