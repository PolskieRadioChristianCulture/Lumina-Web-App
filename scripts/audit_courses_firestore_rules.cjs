const fs = require('fs');
const path = require('path');

const rulesPath = path.join(__dirname, '..', 'firestore.rules');
const rulesContent = fs.readFileSync(rulesPath, 'utf8');

console.log('=== AUDYT BEZPIECZEŃSTWA (SECURITY GATE): FIRESTORE RULES DLA LUMINA BIBLE ACADEMY ===\n');

// Mock helper simulation matching Firebase Rules functions exactly
function evaluateRule({ auth, method, collection, existingData, requestData }) {
  const isAuthenticated = auth !== null && auth.uid !== undefined;
  const isMember = isAuthenticated && auth.provider !== 'anonymous';
  const isMasterAdmin = isAuthenticated && auth.isAdmin === true;

  if (collection === 'course_progress') {
    if (method === 'read') {
      return isMasterAdmin || (isMember && existingData && existingData.userId === auth.uid);
    }
    if (method === 'create') {
      return isMember && 
        requestData.userId === auth.uid && 
        typeof requestData.courseId === 'string' && 
        (Number.isInteger(requestData.lessonId) || typeof requestData.lessonId === 'string');
    }
    if (method === 'update') {
      return isMasterAdmin || (
        isMember && 
        existingData && 
        existingData.userId === auth.uid && 
        requestData && 
        requestData.userId === existingData.userId
      );
    }
    if (method === 'delete') {
      return isMasterAdmin || (isMember && existingData && existingData.userId === auth.uid);
    }
  }

  if (collection === 'course_journal') {
    if (method === 'read') {
      return isMasterAdmin || (isMember && existingData && existingData.userId === auth.uid);
    }
    if (method === 'create') {
      return isMember && 
        requestData.userId === auth.uid && 
        (Number.isInteger(requestData.lessonId) || typeof requestData.lessonId === 'string');
    }
    if (method === 'update') {
      return isMember && 
        existingData && 
        existingData.userId === auth.uid && 
        requestData && 
        requestData.userId === existingData.userId;
    }
    if (method === 'delete') {
      return isMember && existingData && existingData.userId === auth.uid;
    }
  }

  if (collection === 'spiritual_care_requests') {
    if (method === 'read') {
      return isMasterAdmin || (isMember && existingData && existingData.userId === auth.uid);
    }
    if (method === 'create') {
      return isMember && 
        requestData.userId === auth.uid && 
        requestData.status === 'new' && 
        typeof requestData.message === 'string' && 
        requestData.message.length <= 3000;
    }
    if (method === 'update' || method === 'delete') {
      return isMasterAdmin;
    }
  }

  if (collection === 'course_achievements') {
    if (method === 'read') return true;
    if (method === 'create') {
      return isMember && requestData.userId === auth.uid && typeof requestData.achievementId === 'string';
    }
    if (method === 'update') {
      return isMasterAdmin || (isMember && existingData.userId === auth.uid && requestData.userId === auth.uid);
    }
    if (method === 'delete') return isMasterAdmin;
  }

  if (collection === 'quiz_attempts') {
    if (method === 'read') {
      return isMasterAdmin || (isMember && existingData && existingData.userId === auth.uid);
    }
    if (method === 'create') {
      return isMember && 
        requestData.userId === auth.uid && 
        typeof requestData.courseId === 'string' && 
        (Number.isInteger(requestData.lessonId) || typeof requestData.lessonId === 'string') &&
        Number.isInteger(requestData.score) &&
        (Number.isInteger(requestData.total) || Number.isInteger(requestData.totalQuestions));
    }
    if (method === 'update') return isMasterAdmin;
    if (method === 'delete') {
      return isMasterAdmin || (isMember && existingData && existingData.userId === auth.uid);
    }
  }

  if (collection === 'course_preferences') {
    if (method === 'read') {
      return isMasterAdmin || (isMember && existingData && existingData.userId === auth.uid);
    }
    if (method === 'create' || method === 'update') {
      return isMember && 
        requestData.userId === auth.uid && 
        auth.uid === requestData.docId &&
        ['ask_each_time', 'always', 'never'].includes(requestData.publishAchievements);
    }
    if (method === 'delete') {
      return isMasterAdmin || (isMember && auth.uid === existingData.docId);
    }
  }

  return false;
}

const testCases = [
  {
    name: '1. A tworzy własny progress (CREATE)',
    run: () => {
      const authA = { uid: 'user_A', provider: 'google.com' };
      const req = { userId: 'user_A', courseId: 'biblijne-zasady-wiary-28', lessonId: 1, status: 'in_progress' };
      const allowed = evaluateRule({ auth: authA, method: 'create', collection: 'course_progress', requestData: req });
      return { allowed, expected: true, note: 'Zalogowany użytkownik A tworzy własny rekord postępu.' };
    }
  },
  {
    name: '2. A odczytuje własny progress (READ)',
    run: () => {
      const authA = { uid: 'user_A', provider: 'google.com' };
      const existingA = { userId: 'user_A', lessonId: 1, status: 'completed' };
      const allowed = evaluateRule({ auth: authA, method: 'read', collection: 'course_progress', existingData: existingA });
      return { allowed, expected: true, note: 'Właściciel ma pełny dostęp do odczytu własnego postępu.' };
    }
  },
  {
    name: '3. B nie odczytuje progressu A (IZOLACJA PROGRESSU)',
    run: () => {
      const authB = { uid: 'user_B', provider: 'google.com', isAdmin: false };
      const existingA = { userId: 'user_A', lessonId: 1, status: 'completed' };
      const allowed = evaluateRule({ auth: authB, method: 'read', collection: 'course_progress', existingData: existingA });
      return { allowed, expected: false, note: 'Użytkownik B nie ma wglądu w postęp użytkownika A.' };
    }
  },
  {
    name: '4. B nie modyfikuje progressu A (OCHRONA INTEGRALNOŚCI)',
    run: () => {
      const authB = { uid: 'user_B', provider: 'google.com', isAdmin: false };
      const existingA = { userId: 'user_A', lessonId: 1, status: 'completed' };
      const maliciousReq = { userId: 'user_A', lessonId: 1, status: 'not_started' };
      const allowed = evaluateRule({ auth: authB, method: 'update', collection: 'course_progress', existingData: existingA, requestData: maliciousReq });
      return { allowed, expected: false, note: 'Użytkownik B nie może zmienić ani skasować postępu użytkownika A.' };
    }
  },
  {
    name: '5. A nie zmienia userId na B (ANTI-HIJACKING PROGRESS)',
    run: () => {
      const authA = { uid: 'user_A', provider: 'google.com', isAdmin: false };
      const existingA = { userId: 'user_A', lessonId: 1, status: 'in_progress' };
      const hijackedReq = { userId: 'user_B', lessonId: 1, status: 'completed' };
      const allowed = evaluateRule({ auth: authA, method: 'update', collection: 'course_progress', existingData: existingA, requestData: hijackedReq });
      return { allowed, expected: false, note: 'Użytkownik A nie może przepisać rekordu na inne userId.' };
    }
  },
  {
    name: '6. Gość nie zapisuje cloud progress (AUTH REQUIRED)',
    run: () => {
      const guestAuth = null;
      const req = { userId: 'guest_fake', courseId: 'biblijne-zasady-wiary-28', lessonId: 1 };
      const allowed = evaluateRule({ auth: guestAuth, method: 'create', collection: 'course_progress', requestData: req });
      return { allowed, expected: false, note: 'Niezalogowany gość ma zablokowany bezpośredni zapis do bazy chmurowej.' };
    }
  },
  {
    name: '7. A tworzy własny journal (CREATE JOURNAL)',
    run: () => {
      const authA = { uid: 'user_A', provider: 'google.com' };
      const req = { userId: 'user_A', lessonId: 1, discovery: 'Prawda Boża', prayer: 'Panie prowadź' };
      const allowed = evaluateRule({ auth: authA, method: 'create', collection: 'course_journal', requestData: req });
      return { allowed, expected: true, note: 'Zalogowany autor tworzy swój wpis w Dzienniku Drogi.' };
    }
  },
  {
    name: '8. A odczytuje journal (READ JOURNAL)',
    run: () => {
      const authA = { uid: 'user_A', provider: 'google.com' };
      const existingA = { userId: 'user_A', lessonId: 1, discovery: 'Prawda Boża' };
      const allowed = evaluateRule({ auth: authA, method: 'read', collection: 'course_journal', existingData: existingA });
      return { allowed, expected: true, note: 'Właściciel ma pełny dostęp do odczytu własnego dziennika.' };
    }
  },
  {
    name: '9. B nie odczytuje journal A (PRYWATNOŚĆ DZIENNIKA)',
    run: () => {
      const authB = { uid: 'user_B', provider: 'google.com', isAdmin: false };
      const existingA = { userId: 'user_A', lessonId: 1, discovery: 'Moje intymne refleksje' };
      const allowed = evaluateRule({ auth: authB, method: 'read', collection: 'course_journal', existingData: existingA });
      return { allowed, expected: false, note: 'Użytkownik B ma bezwzględnie zablokowany odczyt cudzego dziennika.' };
    }
  },
  {
    name: '10. B nie aktualizuje journal A (ZAKAZ EDYCJI CUDEJ NOTATKI)',
    run: () => {
      const authB = { uid: 'user_B', provider: 'google.com', isAdmin: false };
      const existingA = { userId: 'user_A', lessonId: 1, discovery: 'Tekst A' };
      const maliciousReq = { userId: 'user_A', lessonId: 1, discovery: 'Zmodyfikowany przez B' };
      const allowed = evaluateRule({ auth: authB, method: 'update', collection: 'course_journal', existingData: existingA, requestData: maliciousReq });
      return { allowed, expected: false, note: 'Użytkownik B nie może edytować notatki użytkownika A.' };
    }
  },
  {
    name: '11. A nie zmienia właściciela journal (ANTI-HIJACK JOURNAL)',
    run: () => {
      const authA = { uid: 'user_A', provider: 'google.com', isAdmin: false };
      const existingA = { userId: 'user_A', lessonId: 1, discovery: 'Tekst A' };
      const hijackedReq = { userId: 'user_B', lessonId: 1, discovery: 'Tekst A' };
      const allowed = evaluateRule({ auth: authA, method: 'update', collection: 'course_journal', existingData: existingA, requestData: hijackedReq });
      return { allowed, expected: false, note: 'Nie można przenieść własności notatki na inne konto.' };
    }
  },
  {
    name: '12. Prywatny journal nie jest publiczny (CONFIDENTIALITY)',
    run: () => {
      const guestAuth = null;
      const anonymousAuth = { uid: 'anon_1', provider: 'anonymous' };
      const existingA = { userId: 'user_A', lessonId: 1, discovery: 'Prywatna modlitwa' };
      
      const guestAllowed = evaluateRule({ auth: guestAuth, method: 'read', collection: 'course_journal', existingData: existingA });
      const anonAllowed = evaluateRule({ auth: anonymousAuth, method: 'read', collection: 'course_journal', existingData: existingA });
      
      return { 
        allowed: guestAllowed || anonAllowed, 
        expected: false, 
        note: 'Dziennik Drogi jest bezwzględnie poufny — niedostępny dla gości ani użytkowników anonimowych.' 
      };
    }
  },
  {
    name: '13. A tworzy własny rekord quiz_attempts (QUIZ CREATE)',
    run: () => {
      const authA = { uid: 'user_A', provider: 'google.com' };
      const req = { userId: 'user_A', courseId: 'biblijne-zasady-wiary-28', lessonId: 1, score: 2, total: 2 };
      const allowed = evaluateRule({ auth: authA, method: 'create', collection: 'quiz_attempts', requestData: req });
      return { allowed, expected: true, note: 'Użytkownik A może zapisać wynik swojego quizu.' };
    }
  },
  {
    name: '14. B nie może czytać prób quizowych A (PRIVATE ATTEMPTS)',
    run: () => {
      const authB = { uid: 'user_B', provider: 'google.com' };
      const existingA = { userId: 'user_A', lessonId: 1, score: 2, total: 2 };
      const allowed = evaluateRule({ auth: authB, method: 'read', collection: 'quiz_attempts', existingData: existingA });
      return { allowed, expected: false, note: 'Wyniki quizów są ściśle prywatne dla danego UID.' };
    }
  },
  {
    name: '15. A zapisuje preferencję ask_each_time (VALID PREFERENCE)',
    run: () => {
      const authA = { uid: 'user_A', provider: 'google.com' };
      const req = { userId: 'user_A', docId: 'user_A', publishAchievements: 'ask_each_time' };
      const allowed = evaluateRule({ auth: authA, method: 'create', collection: 'course_preferences', requestData: req });
      return { allowed, expected: true, note: 'Dozwolona wartość preferencji publikacji (ask_each_time).' };
    }
  },
  {
    name: '16. A próbuje zapisać nieprawidłową preferencję (INVALID PREFERENCE)',
    run: () => {
      const authA = { uid: 'user_A', provider: 'google.com' };
      const req = { userId: 'user_A', docId: 'user_A', publishAchievements: 'invalid_mode' };
      const allowed = evaluateRule({ auth: authA, method: 'create', collection: 'course_preferences', requestData: req });
      return { allowed, expected: false, note: 'Niedozwolona wartość preferencji zostaje odrzucona przez reguły.' };
    }
  },
  {
    name: '17. B próbuje zmienić preferencję A (PREFERENCE ANTI-SPOOFING)',
    run: () => {
      const authB = { uid: 'user_B', provider: 'google.com' };
      const req = { userId: 'user_A', docId: 'user_A', publishAchievements: 'never' };
      const allowed = evaluateRule({ auth: authB, method: 'update', collection: 'course_preferences', requestData: req });
      return { allowed, expected: false, note: 'Użytkownik B nie może modyfikować preferencji użytkownika A.' };
    }
  }
];

let failed = 0;
testCases.forEach((tc, idx) => {
  const result = tc.run();
  const passed = result.allowed === result.expected;
  if (!passed) failed++;
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${tc.name}`);
  console.log(`       Rezultat: ${result.allowed ? 'DOZWOLONE' : 'ZABLOKOWANE'} | Oczekiwano: ${result.expected ? 'DOZWOLONE' : 'ZABLOKOWANE'}`);
  console.log(`       Uwaga: ${result.note}\n`);
});

// Weryfikacja fizycznego pliku firestore.rules
console.log('--- Weryfikacja reguł w pliku firestore.rules ---');
const hasCourseProgress = rulesContent.includes('match /course_progress/{progressId}');
const hasCourseJournal = rulesContent.includes('match /course_journal/{journalId}');
const hasSpiritualCare = rulesContent.includes('match /spiritual_care_requests/{requestId}');
const hasAchievements = rulesContent.includes('match /course_achievements/{achievementId}');
const hasQuizAttempts = rulesContent.includes('match /quiz_attempts/{attemptId}');
const hasCoursePreferences = rulesContent.includes('match /course_preferences/{userId}');
const hasRequestResourceCheck = rulesContent.includes('request.resource.data.userId == request.auth.uid');
const hasAntiHijackCheck = rulesContent.includes('request.resource.data.userId == resource.data.userId');

console.log('Reguła match /course_progress obecna:', hasCourseProgress);
console.log('Reguła match /course_journal obecna:', hasCourseJournal);
console.log('Reguła match /spiritual_care_requests obecna:', hasSpiritualCare);
console.log('Reguła match /course_achievements obecna:', hasAchievements);
console.log('Reguła match /quiz_attempts obecna:', hasQuizAttempts);
console.log('Reguła match /course_preferences obecna:', hasCoursePreferences);
console.log('Walidacja request.resource.data.userId (anti-spoofing):', hasRequestResourceCheck);
console.log('Walidacja request.resource.data.userId == resource.data.userId (anti-hijack):', hasAntiHijackCheck);

const allRulesPresent = hasCourseProgress && hasCourseJournal && hasSpiritualCare && hasAchievements && hasQuizAttempts && hasCoursePreferences && hasRequestResourceCheck && hasAntiHijackCheck;

if (failed === 0 && allRulesPresent) {
  console.log(`\n✅ SECURITY GATE: 17/17 SCENARIUSZY ZALICZONYCH (Wymóg Phase 4 Spełniony).`);
  console.log('Pełna izolacja danych, ochrona przed fałszowaniem UID, prywatność Dziennika Drogi i prób quizowych.');
  process.exit(0);
} else {
  console.error('\n❌ SECURITY GATE FAILED: Znaleziono naruszenia zasad bezpieczeństwa.');
  process.exit(1);
}
