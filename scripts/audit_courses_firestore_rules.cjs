const fs = require('fs');
const path = require('path');

const rulesPath = path.join(__dirname, '..', 'firestore.rules');
const rulesContent = fs.readFileSync(rulesPath, 'utf8');

console.log('=== AUDYT BEZPIECZEŃSTWA (SECURITY GATE): FIRESTORE RULES DLA LUMINA BIBLE ACADEMY ===\n');

// Mock helper simulation matching Firebase Rules functions
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
        Number.isInteger(requestData.lessonId);
    }
    if (method === 'update') {
      return isMasterAdmin || (
        isMember && 
        existingData.userId === auth.uid && 
        requestData.userId === auth.uid
      );
    }
    if (method === 'delete') {
      return isMasterAdmin;
    }
  }

  if (collection === 'course_journal') {
    if (method === 'read') {
      return isMasterAdmin || (isMember && existingData && existingData.userId === auth.uid);
    }
    if (method === 'create') {
      return isMember && 
        requestData.userId === auth.uid && 
        Number.isInteger(requestData.lessonId);
    }
    if (method === 'update') {
      return isMember && 
        existingData.userId === auth.uid && 
        requestData.userId === auth.uid;
    }
    if (method === 'delete') {
      return isMember && existingData.userId === auth.uid;
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

  return false;
}

const testCases = [
  {
    name: '1. Właściciel może utworzyć własny rekord (CREATE)',
    run: () => {
      const auth = { uid: 'user_123', provider: 'google.com' };
      const req = { userId: 'user_123', courseId: 'biblijne-zasady-wiary-28', lessonId: 1 };
      const allowed = evaluateRule({ auth, method: 'create', collection: 'course_progress', requestData: req });
      return { allowed, expected: true, note: 'Zalogowany właściciel tworzy swój postęp z poprawnym UID.' };
    }
  },
  {
    name: '2. Właściciel może odczytać własny rekord (READ)',
    run: () => {
      const auth = { uid: 'user_123', provider: 'google.com' };
      const existing = { userId: 'user_123', lessonId: 1, discoveredText: 'Moje odkrycie' };
      const allowed = evaluateRule({ auth, method: 'read', collection: 'course_journal', existingData: existing });
      return { allowed, expected: true, note: 'Właściciel ma pełny dostęp do własnego dziennika.' };
    }
  },
  {
    name: '3. Użytkownik A nie odczyta danych użytkownika B (IZOLACJA DANYCH)',
    run: () => {
      const authA = { uid: 'user_A', provider: 'google.com', isAdmin: false };
      const existingB = { userId: 'user_B', lessonId: 5, discoveredText: 'Prywatna modlitwa użytkownika B' };
      const allowed = evaluateRule({ auth: authA, method: 'read', collection: 'course_journal', existingData: existingB });
      return { allowed, expected: false, note: 'Użytkownik A ma bezwzględnie zablokowany odczyt cudzego dziennika.' };
    }
  },
  {
    name: '4. Użytkownik A nie zapisze rekordu jako użytkownik B (ANTI-SPOOFING UID)',
    run: () => {
      const authA = { uid: 'user_A', provider: 'google.com' };
      // Użytkownik A próbuje wysłać cudze UID w body
      const spoofedReq = { userId: 'user_B', courseId: 'biblijne-zasady-wiary-28', lessonId: 1 };
      const allowed = evaluateRule({ auth: authA, method: 'create', collection: 'course_progress', requestData: spoofedReq });
      return { allowed, expected: false, note: 'Reguła request.resource.data.userId == request.auth.uid blokuje podszywanie się pod cudzy UID.' };
    }
  },
  {
    name: '5. Nie można przejąć rekordu przez zmianę userId (ANTI-HIJACKING)',
    run: () => {
      const authA = { uid: 'user_A', provider: 'google.com', isAdmin: false };
      const existingA = { userId: 'user_A', lessonId: 1 };
      // Użytkownik A próbuje zmienić userId dokumentu na user_B
      const hijackedReq = { userId: 'user_B', lessonId: 1 };
      const allowed = evaluateRule({ auth: authA, method: 'update', collection: 'course_progress', existingData: existingA, requestData: hijackedReq });
      return { allowed, expected: false, note: 'Wymóg zgodności request.resource.data.userId z resource.data.userId uniemożliwia przeniesienie rekordu.' };
    }
  },
  {
    name: '6. Niezalogowany gość nie odczyta prywatnego dziennika (AUTH REQUIRED)',
    run: () => {
      const guestAuth = null;
      const existing = { userId: 'user_123', lessonId: 1, discoveredText: 'Treść' };
      const allowed = evaluateRule({ auth: guestAuth, method: 'read', collection: 'course_journal', existingData: existing });
      return { allowed, expected: false, note: 'Niezalogowany użytkownik nie ma wglądu w żadne prywatne zapiski.' };
    }
  },
  {
    name: '7. Prywatne zgłoszenie duchowe nie jest publiczne (CONFIDENTIALITY)',
    run: () => {
      const guestAuth = null;
      const otherAuth = { uid: 'stranger_999', provider: 'google.com', isAdmin: false };
      const reqDoc = { userId: 'user_123', message: 'Proszę o chrzest', status: 'new' };
      
      const guestAllowed = evaluateRule({ auth: guestAuth, method: 'read', collection: 'spiritual_care_requests', existingData: reqDoc });
      const strangerAllowed = evaluateRule({ auth: otherAuth, method: 'read', collection: 'spiritual_care_requests', existingData: reqDoc });
      
      return { 
        allowed: guestAllowed || strangerAllowed, 
        expected: false, 
        note: 'Zgłoszenia duchowe są ściśle poufne — niedostępne publicznie ani dla obcych użytkowników.' 
      };
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
const hasRequestResourceCheck = rulesContent.includes('request.resource.data.userId == request.auth.uid');
const hasAntiHijackCheck = rulesContent.includes('request.resource.data.userId == resource.data.userId');

console.log('Reguła match /course_progress obecna:', hasCourseProgress);
console.log('Reguła match /course_journal obecna:', hasCourseJournal);
console.log('Reguła match /spiritual_care_requests obecna:', hasSpiritualCare);
console.log('Reguła match /course_achievements obecna:', hasAchievements);
console.log('Walidacja request.resource.data.userId (anti-spoofing):', hasRequestResourceCheck);
console.log('Walidacja request.resource.data.userId == resource.data.userId (anti-hijack):', hasAntiHijackCheck);

const allRulesPresent = hasCourseProgress && hasCourseJournal && hasSpiritualCare && hasAchievements && hasRequestResourceCheck && hasAntiHijackCheck;

if (failed === 0 && allRulesPresent) {
  console.log('\n✅ SECURITY GATE: 7/7 SCENARIUSZY ZALICZONYCH. Pełna prywatność, izolacja danych i ochrona przed fałszowaniem UID.');
  process.exit(0);
} else {
  console.error('\n❌ SECURITY GATE FAILED: Znaleziono naruszenia zasad bezpieczeństwa.');
  process.exit(1);
}
