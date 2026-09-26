import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Import the canonical courses data
const coursesDataPath = path.join(rootDir, 'data', 'lumina-courses-data.js');
const coursesModule = await import(`file://${coursesDataPath}?t=${Date.now()}`);

const { LUMINA_STAGES, LUMINA_COURSES_CORE_28, LUMINA_POST_28_CATALOG } = coursesModule;

test('1. Dokładnie 28 podstawowych lekcji biblijnych w programie bazowym', () => {
  assert.strictEqual(Array.isArray(LUMINA_COURSES_CORE_28), true, 'LUMINA_COURSES_CORE_28 musi być tablicą');
  assert.strictEqual(LUMINA_COURSES_CORE_28.length, 28, 'Musi być dokładnie 28 lekcji bazowych');
});

test('2. Unikalność ID i prawidłowa sekwencja kolejności 1..28', () => {
  const ids = LUMINA_COURSES_CORE_28.map(l => l.id);
  const uniqueIds = new Set(ids);
  assert.strictEqual(uniqueIds.size, 28, 'Wszystkie ID muszą być unikalne');

  LUMINA_COURSES_CORE_28.forEach((lesson, index) => {
    const expectedId = index + 1;
    assert.strictEqual(lesson.id, expectedId, `Lekcja na pozycji ${index} musi mieć id ${expectedId}`);
    assert.strictEqual(lesson.order, expectedId, `Lekcja ${lesson.id} musi mieć order ${expectedId}`);
  });
});

test('3. Unikalność i poprawność slugów', () => {
  const slugs = LUMINA_COURSES_CORE_28.map(l => l.slug);
  const uniqueSlugs = new Set(slugs);
  assert.strictEqual(uniqueSlugs.size, 28, 'Wszystkie slugi muszą być unikalne');

  LUMINA_COURSES_CORE_28.forEach(lesson => {
    assert.match(lesson.slug, /^[0-9]{2}-[a-z0-9-]+$/, `Slug ${lesson.slug} musi być zgodny z formatem np. 01-pismo-swiete`);
  });
});

test('4. Prawidłowe przypisanie do 5 etapów drogi', () => {
  assert.strictEqual(LUMINA_STAGES.length, 5, 'Musi być dokładnie 5 etapów');

  const expectedStageCounts = {
    'etap-1': 7, // Lekcje 1-7
    'etap-2': 4, // Lekcje 8-11
    'etap-3': 7, // Lekcje 12-18
    'etap-4': 5, // Lekcje 19-23
    'etap-5': 5  // Lekcje 24-28
  };

  const actualCounts = {};
  LUMINA_COURSES_CORE_28.forEach(lesson => {
    actualCounts[lesson.stageId] = (actualCounts[lesson.stageId] || 0) + 1;
  });

  assert.deepStrictEqual(actualCounts, expectedStageCounts, 'Liczba lekcji w poszczególnych etapach musi zgadzać się ze specyfikacją');

  // Weryfikacja że etap 3 zawiera Kościół Boży (lekcja 12)
  const l12 = LUMINA_COURSES_CORE_28.find(l => l.id === 12);
  assert.strictEqual(l12.stageId, 'etap-3');
  assert.strictEqual(l12.title.pl, 'Kościół Boży');
});

test('5. Kompletność wszystkich wymaganych pól modelu danych', () => {
  const requiredFields = [
    'id', 'courseId', 'stageId', 'order', 'slug', 'image', 'version',
    'title', 'subtitle', 'introduction', 'content', 'scripture',
    'discover', 'understand', 'quiz', 'application', 'prayer',
    'reflectionPrompts', 'decisionPrompt', 'seo'
  ];

  LUMINA_COURSES_CORE_28.forEach(lesson => {
    requiredFields.forEach(field => {
      assert.notStrictEqual(lesson[field], undefined, `Pole ${field} nie może być undefined w lekcji ${lesson.id}`);
      assert.notStrictEqual(lesson[field], null, `Pole ${field} nie może być null w lekcji ${lesson.id}`);
    });

    // Weryfikacja treści
    assert.ok(lesson.content.pl && lesson.content.pl.length > 200, `Treść PL lekcji ${lesson.id} musi mieć > 200 znaków`);
    assert.ok(lesson.content.en && lesson.content.en.length > 200, `Treść EN lekcji ${lesson.id} musi mieć > 200 znaków`);
    assert.ok(lesson.scripture.primaryQuotes_pl.length > 0, `Lekcja ${lesson.id} musi zawierać co najmniej jeden cytat biblijny`);
    assert.strictEqual(lesson.courseId, 'biblijne-zasady-wiary-28');
  });
});

test('6. Poprawność fizyczna referencji do grafik lekcji (images/lessons/*.svg)', () => {
  LUMINA_COURSES_CORE_28.forEach(lesson => {
    const expectedRelPath = lesson.image.replace(/^\//, ''); // 'images/lessons/1.svg'
    const fullDiskPath = path.join(rootDir, expectedRelPath);
    assert.strictEqual(fs.existsSync(fullDiskPath), true, `Fizyczny plik grafiki ${fullDiskPath} musi istnieć na dysku`);
    const stat = fs.statSync(fullDiskPath);
    assert.ok(stat.size > 100, `Plik grafiki ${lesson.image} nie może być pusty (rozmiar: ${stat.size} B)`);
  });
});

test('7. Brak przypadkowych nazw partykularnych denominacji w publicznych polach', () => {
  // Publiczne pola: title, subtitle, introduction, content, application, prayer
  const forbiddenPatterns = [
    /adwentyst/i,
    /adventist/i,
    /świadkowie jehowy/i,
    /baptyst/i,
    /zielonoświątk/i,
    /katolic/i,
    /luterań/i
  ];

  LUMINA_COURSES_CORE_28.forEach(lesson => {
    const serializedPublic = JSON.stringify({
      title: lesson.title,
      subtitle: lesson.subtitle,
      intro: lesson.introduction,
      app: lesson.application,
      prayer: lesson.prayer,
      decision: lesson.decisionPrompt
    });

    forbiddenPatterns.forEach(pattern => {
      assert.doesNotMatch(serializedPublic, pattern, `Lekcja ${lesson.id} (${lesson.title.pl}) nie może zawierać nazwy denominacji w polach publicznych!`);
    });
  });
});

test('8. Rozdzielenie lekcji 29–38 od podstawowego programu 28/28', () => {
  assert.strictEqual(Array.isArray(LUMINA_POST_28_CATALOG), true);
  assert.strictEqual(LUMINA_POST_28_CATALOG.length, 10, 'Katalog post-28 musi zawierać dokładnie 10 lekcji');

  LUMINA_POST_28_CATALOG.forEach((item, idx) => {
    const expectedId = 29 + idx;
    assert.strictEqual(item.id, expectedId);
    assert.strictEqual(item.isCore28, false, 'Lekcje post-28 muszą mieć znacznik isCore28: false');
    assert.strictEqual(item.status, 'future_expansion');
    assert.strictEqual(item.courseId, 'rozwoj-duchowy-post28');
  });

  // Upewnij się że żadna lekcja post-28 nie znajduje się w tablicy CORE_28
  const coreIds = new Set(LUMINA_COURSES_CORE_28.map(l => l.id));
  LUMINA_POST_28_CATALOG.forEach(item => {
    assert.strictEqual(coreIds.has(item.id), false, `Lekcja ${item.id} nie może być obecna w programie bazowym 28`);
  });
});

test('9. Flaga needsEditorialReview dla quizów i pytań odkrywczych', () => {
  // W Phase 1 quizy i pytania odkrywcze są celowo oznaczone do zatwierdzenia redakcyjnego (nie-halucynowanie)
  LUMINA_COURSES_CORE_28.forEach(lesson => {
    assert.strictEqual(lesson.quiz.needsEditorialReview, true, `Quiz w lekcji ${lesson.id} musi mieć flagę needsEditorialReview: true`);
    assert.strictEqual(lesson.discover.needsEditorialReview, true, `Pytania Odkryj w lekcji ${lesson.id} muszą mieć flagę needsEditorialReview: true`);
  });
});
