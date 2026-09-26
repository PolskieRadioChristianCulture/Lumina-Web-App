/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BIBLE ACADEMY — QUIZ & ACHIEVEMENTS TEST SUITE (Phase 4)
 * Plik: scripts/courses-quiz-achievements.test.mjs
 * 
 * Weryfikacja:
 *  1. Silnik Osiągnięć (LuminaAchievementsEngine) — 5 odznak formacyjnych
 *  2. Pełna Idempotencja osiągnięć (brak duplikatów przy powtórnych wywołaniach)
 *  3. Model preferencji publikacji (ask_each_time, always, never)
 *  4. Prywatność osiągnięć (brak notatek z Dziennika i brak surowych odpowiedzi quizowych w karcie)
 *  5. Feed Adapter Silence (autoPublishToFeedEnabled === false — rygiel bezpieczeństwa)
 *  6. Silnik Quizu — formative assessment, nieblokujący charakter, struktura quiz_attempts
 * ══════════════════════════════════════════════════════════════════════════
 */

import {
  LuminaAchievementsEngine,
  LUMINA_ACHIEVEMENT_DEFINITIONS
} from '../js/lumina-achievements-engine.js';
import { LuminaCoursesEngine } from '../js/lumina-courses-engine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('\n=== TEST SUITE: QUIZ & ACHIEVEMENTS ENGINE (Phase 4) ===\n');

// ── TEST 1: DEFINICJE OSIĄGNIĘĆ ──
assert(LUMINA_ACHIEVEMENT_DEFINITIONS.length === 5, 'Zdefiniowano dokładnie 5 formacyjnych odznak LUMINA Academy');

const expectedIds = ['first_step', 'truth_seeker', 'bible_explorer', 'word_guardian', 'disciple_of_christ'];
const actualIds = LUMINA_ACHIEVEMENT_DEFINITIONS.map(d => d.id);
assert(
  expectedIds.every(id => actualIds.includes(id)),
  'Wszystkie wymagane identyfikatory odznak są obecne: ' + expectedIds.join(', ')
);

// ── TEST 2: SILNIK OSIĄGNIĘĆ — LOGIKA EWALUACJI ──
const engine = new LuminaAchievementsEngine();
engine.currentUser = { uid: 'test_user_777' };

// 2a. Lekcja 1 ukończona -> odblokowanie 'first_step'
let unlocked = await engine.evaluateOnLessonCompleted(new Set([1]));
assert(
  unlocked.length === 1 && unlocked[0].id === 'first_step',
  'Ukończenie 1 lekcji odblokowuje wyłącznie osiągnięcie "first_step"'
);

// 2b. Idempotencja: powtórne wywołanie dla lekcji 1 nie przyznaje ponownie
let reUnlocked = await engine.evaluateOnLessonCompleted(new Set([1]));
assert(
  reUnlocked.length === 0,
  'Idempotencja: ponowna ewaluacja tej samej lekcji zwraca 0 nowych osiągnięć'
);

// 2c. Etap I (Lekcje 1..7) -> odblokowanie 'truth_seeker'
const stage1Set = new Set([1, 2, 3, 4, 5, 6, 7]);
unlocked = await engine.evaluateOnLessonCompleted(stage1Set);
assert(
  unlocked.length === 1 && unlocked[0].id === 'truth_seeker',
  'Ukończenie całego Etapu I (1-7) odblokowuje osiągnięcie "truth_seeker"'
);

// 2d. 14 Lekcji (50% kursu) -> odblokowanie 'bible_explorer'
const halfSet = new Set([1,2,3,4,5,6,7,8,9,10,11,12,13,14]);
unlocked = await engine.evaluateOnLessonCompleted(halfSet);
assert(
  unlocked.length === 1 && unlocked[0].id === 'bible_explorer',
  'Ukończenie 14 lekcji (50%) odblokowuje osiągnięcie "bible_explorer"'
);

// 2e. 23 Lekcje (Etap IV) -> odblokowanie 'word_guardian'
const stage4Set = new Set(Array.from({ length: 23 }, (_, i) => i + 1));
unlocked = await engine.evaluateOnLessonCompleted(stage4Set);
assert(
  unlocked.length === 1 && unlocked[0].id === 'word_guardian',
  'Ukończenie 23 lekcji odblokowuje osiągnięcie "word_guardian"'
);

// 2f. 28 Lekcji (Pełny kurs) -> odblokowanie 'disciple_of_christ'
const fullSet = new Set(Array.from({ length: 28 }, (_, i) => i + 1));
unlocked = await engine.evaluateOnLessonCompleted(fullSet);
assert(
  unlocked.length === 1 && unlocked[0].id === 'disciple_of_christ',
  'Ukończenie 28/28 lekcji odblokowuje najwyższe osiągnięcie "disciple_of_christ"'
);

// ── TEST 3: RYGIEL BEZPIECZEŃSTWA FEEDU I PRYWATNOŚĆ ──
assert(
  engine.autoPublishToFeedEnabled === false,
  'Rygiel bezpieczeństwa Phase 4: autoPublishToFeedEnabled jest bezwzględnie równe FALSE'
);

const cardData = engine.prepareFeedCard(LUMINA_ACHIEVEMENT_DEFINITIONS[0], 1);
assert(
  cardData.title && cardData.description && cardData.ctaUrl,
  'Feed Card posiada tytuł, opis i link CTA do /kursy'
);
assert(
  cardData.journalNotes === undefined && cardData.quizAnswers === undefined,
  'Prywatność: Karta osiągnięcia NIE zawiera notatek z Dziennika ani odpowiedzi quizowych'
);

// ── TEST 4: PREFERENCJE PUBLIKACJI ──
assert(
  engine.publishPreference === 'ask_each_time',
  'Domyślna preferencja użytkownika to "ask_each_time" (świadoma kontrola)'
);

await engine.setPublishPreference('never');
assert(
  engine.publishPreference === 'never',
  'Pomyślna zmiana preferencji na "never"'
);

await engine.setPublishPreference('always');
assert(
  engine.publishPreference === 'always',
  'Pomyślna zmiana preferencji na "always"'
);

// ── TEST 5: SILNIK QUIZU (FORMACJA, NIEBLOKUJĄCY CHARAKTER) ──
const courseEngine = new LuminaCoursesEngine();

// Test symulacji próby quizowej
const attempt = await courseEngine.recordQuizAttempt(1, 2, 2, {
  q1_1: { chosen: 1, correct: true },
  q1_2: { chosen: 0, correct: true }
});

assert(
  attempt.lessonId === 1 && attempt.score === 2 && attempt.totalQuestions === 2 && attempt.passed === true,
  'recordQuizAttempt generuje poprawny rekord próby dla wyniku 2/2 (passed: true)'
);

const failAttempt = await courseEngine.recordQuizAttempt(1, 0, 2, {
  q1_1: { chosen: 0, correct: false },
  q1_2: { chosen: 1, correct: false }
});

assert(
  failAttempt.lessonId === 1 && failAttempt.score === 0 && failAttempt.passed === false,
  'recordQuizAttempt generuje poprawny rekord próby dla wyniku 0/2 (passed: false)'
);

// Weryfikacja że nieudana próba quizu nie blokuje zapisu ukończenia lekcji
courseEngine.currentUser = null; // Tryb gościa
const compRes = await courseEngine.recordLessonProgress(1, 'completed');
assert(
  compRes.success === true,
  'Zasada formacyjna: niski wynik quizu NIE blokuje postępu ani oznaczenia lekcji jako ukończonej'
);

console.log(`\n========================================`);
console.log(`PODSUMOWANIE: ${passed} PASS, ${failed} FAIL`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
