import { readFileSync } from 'node:fs';

const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const failures = [];

function expect(pattern, message) {
  if (!pattern.test(rules)) failures.push(message);
}

function reject(pattern, message) {
  if (pattern.test(rules)) failures.push(message);
}

reject(/allow\s+(?:read\s*,\s*)?write\s*:\s*if\s+true\s*;/, 'Publiczne allow write: if true jest zabronione.');
reject(/\|\|\s*true\s*;/, 'Warunek || true otwiera regułę dla każdego.');
expect(/function isMember\(\)/, 'Brakuje rozróżnienia konta członka od gościa anonimowego.');
expect(/sign_in_provider\s*!=\s*'anonymous'/, 'Reguły nie odrzucają anonimowych zapisów społecznościowych.');
expect(/senderAuthUid\s*==\s*request\.auth\.uid/, 'Wiadomości nie są wiązane z UID nadawcy.');
expect(/reporterAuthUid\s*==\s*request\.auth\.uid/, 'Zgłoszenia nie są wiązane z UID zgłaszającego.');
expect(/fromAuthUid\s*==\s*request\.auth\.uid/, 'Relacje nie są wiązane z UID właściciela.');
expect(/request\.resource\.data\.uid\s*==\s*request\.auth\.uid/, 'Profile lub tokeny urządzeń nie są wiązane z UID właściciela.');

if (failures.length) {
  console.error('❌ Firestore Rules Smoke Check — wykryto problemy:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('✅ Firestore Rules Smoke Check — brak publicznych zapisów i znanych obejść właściciela.');
