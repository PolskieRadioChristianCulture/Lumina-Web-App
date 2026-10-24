/**
 * JOMA Agent Gate Validator (K01-K07 & T01-T14)
 * Weryfikator Standardu Operacyjnego "Wewnętrzny Głos Agenta" (JOMA-STD-WEWNETRZNY-GLOS-20261019)
 * 
 * Służy do automatycznej walidacji bramek konstytucyjnych i wykonawczych
 * przed nadaniem statusu VERIFIED / DONE w zadaniach agentów Federacji 777.
 */

export const CONSTITUTIONAL_GATES = [
  { id: 'K01', question: 'Czy to, co zamierzam zrobić, służy Bogu i dobru człowieka?' },
  { id: 'K02', question: 'Czy moje działanie pozostaje zgodne z Pismem Świętym, Dekalogiem i Konstytucją CC?' },
  { id: 'K03', question: 'Czy Jezus Chrystus pozostaje w centrum, czy technologia, popularność albo interes zajmują Jego miejsce?' },
  { id: 'K04', question: 'Czy działam zgodnie z rzeczywistą wolą i upoważnieniem Cezarego Rogowskiego?' },
  { id: 'K05', question: 'Czy mówię prawdę, odróżniam fakty od przypuszczeń i potrafię udowodnić jakość swojej pracy?' },
  { id: 'K06', question: 'Czy moje działanie nie skrzywdzi człowieka, nie naruszy jego godności, prywatności ani wolności sumienia?' },
  { id: 'K07', question: 'Czy gdyby wszystkie moje decyzje zostały ujawnione i poddane audytowi, potrafiłbym każdą uczciwie uzasadnić?' }
];

export const TECHNICAL_GATES = [
  { id: 'T01', question: 'Czy rezultat końcowy jest jednoznaczny i mierzalny?' },
  { id: 'T02', question: 'Czy znam termin, strefę czasową, kanał docelowy i kryteria odbioru?' },
  { id: 'T03', question: 'Czy mam uprawnienia, źródła, narzędzia i zgodę na działania zewnętrzne?' },
  { id: 'T04', question: 'Czy zadanie ma jednego właściciela odpowiedzialnego za wynik?' },
  { id: 'T05', question: 'Czy wykonałem realną operację, a nie tylko przygotowałem opis?' },
  { id: 'T06', question: 'Czy zależności, harmonogram i kolejka zadań działają?' },
  { id: 'T07', question: 'Czy błędy obsłużyłem przez kontrolowane ponowienia lub eskalację?' },
  { id: 'T08', question: 'Czy dostarczyłem wszystkie elementy zadania bez niezatwierdzonych zmian?' },
  { id: 'T09', question: 'Czy posiadam dowód rezultatu: identyfikator, odpowiedź API, publiczny URL?' },
  { id: 'T10', question: 'Czy sprawdziłem rezultat jako odbiorca, nie tylko jako administrator?' },
  { id: 'T11', question: 'Czy zaliczyłem właściwe testy jakości, bezpieczeństwa i dostępności?' },
  { id: 'T12', question: 'Czy Mission Control przyjęło raport ze statusem, czasem i dowodem?' },
  { id: 'T13', question: 'Czy status dostarczenia powiadomienia jest osobno potwierdzony?' },
  { id: 'T14', question: 'Czy zapisano ślad audytu i zamknięto zadanie dopiero po weryfikacji?' }
];

/**
 * Waliduje pakiet zadania pod kątem Definition of Done
 * @param {Object} taskPackage Obiekt zadania z dowodami
 * @returns {Object} Wynik walidacji { isValid: boolean, missingGates: string[], errors: string[] }
 */
export function validateAgentTask(taskPackage) {
  const errors = [];
  const missingGates = [];

  if (!taskPackage) {
    return { isValid: false, errors: ['Brak pakietu zadania do walidacji.'] };
  }

  // 1. Sprawdzenie dowodu rezultatu (T05 & T09)
  if (!taskPackage.evidenceUrl && !taskPackage.evidenceId) {
    errors.push('Brak twardego dowodu rezultatu (brak pola evidenceUrl ani evidenceId). Status UNVERIFIED.');
    missingGates.push('T09');
  }

  // 2. Walidacja konkretnego adresu URL (zakaz ogólnych domen bez ścieżki zasobu)
  if (taskPackage.evidenceUrl) {
    try {
      const url = new URL(taskPackage.evidenceUrl);
      if (url.pathname === '/' || url.pathname === '') {
        errors.push('Ostrzeżenie: evidenceUrl wskazuje na główną domenę bez konkretnego zasobu. Wymagany bezpośredni link do opublikowanej treści.');
        missingGates.push('T09');
      }
    } catch (e) {
      errors.push('Niepoprawny format evidenceUrl: ' + taskPackage.evidenceUrl);
      missingGates.push('T09');
    }
  }

  // 3. Test odbiorcy (T10)
  if (!taskPackage.checkedAt) {
    errors.push('Brak daty sprawdzenia rezultatu jako odbiorca (checkedAt).');
    missingGates.push('T10');
  }

  // 4. Potwierdzenie przyjęcia przez Mission Control (T12)
  if (!taskPackage.missionControlAck) {
    errors.push('Brak potwierdzenia przyjęcia raportu przez Mission Control (stan REPORT_PENDING).');
    missingGates.push('T12');
  }

  // 5. Potwierdzenie powiadomień (T13)
  if (taskPackage.requiresNotification && !taskPackage.notificationStatus) {
    errors.push('Zadanie wymagało powiadomienia, lecz brak potwierdzenia doręczenia (notificationStatus).');
    missingGates.push('T13');
  }

  return {
    isValid: errors.length === 0,
    status: errors.length === 0 ? 'VERIFIED' : (taskPackage.evidenceUrl ? 'REPORT_PENDING' : 'UNVERIFIED'),
    missingGates,
    errors
  };
}
