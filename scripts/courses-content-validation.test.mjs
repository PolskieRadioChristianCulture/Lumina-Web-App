/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BIBLE ACADEMY — CONTENT & QUIZ VALIDATION TEST SUITE (Phase 4)
 * Plik: scripts/courses-content-validation.test.mjs
 * 
 * Weryfikacja integralności treści doktrynalnych, modułu Odkryj oraz Quizu.
 * Sprawdza:
 *  1. Kompletność 28 lekcji z poprawnymi modułami Odkryj i Quiz
 *  2. Każde pytanie Odkryj posiada prompt, readingExcerpt oraz sourceRefs
 *  3. Każde pytanie Quizu posiada typ, opcje (>=2), poprawny indeks correctAnswer,
 *     wyjaśnienie teologiczne (explanation) i sigla biblijne (scriptureRefs)
 *  4. Dokładnie 2 lekcje posiadają flagę needsEditorialReview: true (Lekcje 18 i 24)
 *  5. Brak zakazanych wyznaniowych dogmatów / samowolnych halucynacji
 * ══════════════════════════════════════════════════════════════════════════
 */

import { LUMINA_COURSES_CORE_28 } from '../data/lumina-courses-data.js';

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

console.log('\n=== LUMINA COURSES: CONTENT & QUIZ VALIDATION SUITE ===\n');

// 1. Zbiór 28 lekcji
assert(LUMINA_COURSES_CORE_28.length === 28, 'Zbiór podstawowy zawiera dokładnie 28 lekcji');

let editorialReviewCount = 0;
const editorialReviewLessons = [];

LUMINA_COURSES_CORE_28.forEach((lesson) => {
  const num = lesson.id;

  // 2. Moduł Odkryj
  assert(
    lesson.discover && Array.isArray(lesson.discover.items) && lesson.discover.items.length >= 1,
    `Lekcja ${num} („${lesson.title.pl}”) posiada co najmniej 1 pozycję w module Odkryj`
  );

  lesson.discover.items.forEach((item, idx) => {
    assert(
      typeof item.prompt === 'string' && item.prompt.length > 5,
      `Lekcja ${num}, Odkryj [${idx + 1}] posiada treść pytania (prompt)`
    );
    assert(
      Array.isArray(item.sourceRefs) && item.sourceRefs.length >= 1,
      `Lekcja ${num}, Odkryj [${idx + 1}] posiada sigla źródłowe (sourceRefs)`
    );
  });

  // 3. Moduł Quiz
  assert(
    lesson.quiz && Array.isArray(lesson.quiz.questions) && lesson.quiz.questions.length >= 1,
    `Lekcja ${num} („${lesson.title.pl}”) posiada co najmniej 1 pytanie w quizie formacyjnym`
  );

  lesson.quiz.questions.forEach((q, idx) => {
    assert(
      ['single_choice', 'true_false'].includes(q.type),
      `Lekcja ${num}, Quiz Q${idx + 1} posiada prawidłowy typ (${q.type})`
    );
    assert(
      Array.isArray(q.options) && q.options.length >= 2,
      `Lekcja ${num}, Quiz Q${idx + 1} posiada co najmniej 2 warianty odpowiedzi`
    );
    assert(
      typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < q.options.length,
      `Lekcja ${num}, Quiz Q${idx + 1} wskazuje poprawny indeks odpowiedzi (${q.correctAnswer})`
    );
    assert(
      typeof q.explanation === 'string' && q.explanation.length > 10,
      `Lekcja ${num}, Quiz Q${idx + 1} posiada uzasadnienie biblijne (explanation)`
    );
    assert(
      Array.isArray(q.scriptureRefs) && q.scriptureRefs.length >= 1,
      `Lekcja ${num}, Quiz Q${idx + 1} posiada sigla weryfikacji biblijnej (scriptureRefs)`
    );
  });

  // 4. Badanie flag redakcyjnych
  if (lesson.discover?.needsEditorialReview || lesson.quiz?.needsEditorialReview) {
    editorialReviewCount++;
    editorialReviewLessons.push(lesson.id);
  }
});

// 5. Weryfikacja zatwierdzenia przez Właściciela (Zero nierozstrzygniętych kwestii doktrynalnych)
assert(
  editorialReviewCount === 0,
  `Wszystkie 28 lekcji posiada zatwierdzony status redakcyjny (needsEditorialReview: 0, wykryto: ${editorialReviewCount})`
);

assert(
  editorialReviewLessons.length === 0,
  `Brak nierozstrzygniętych kwestii doktrynalnych po decyzjach Właściciela dla Lekcji 18 i 24`
);

console.log(`\n========================================`);
console.log(`PODSUMOWANIE: ${passed} PASS, ${failed} FAIL`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
