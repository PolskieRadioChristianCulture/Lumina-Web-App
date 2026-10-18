// LUMI KIDS — testy reguł Firestore na emulatorze (konta i dane fikcyjne).
// Uruchomienie (wymaga Javy): npx firebase emulators:exec --only firestore --project demo-lumi-kids "node --test tests/lumi-kids-rules.test.mjs"
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, addDoc, collection, getDocs, query, where, serverTimestamp, deleteField } from 'firebase/firestore';

const RULES = process.env.RULES_FILE || 'firestore.rules';
let env;
const CHILD = 'kidUid1', PARENT = 'parentUid1', MOM = 'momUid1', STRANGER = 'strangerUid1';
const ADMIN_TOKEN = { email: 'nazirczarkes@gmail.com', email_verified: true, firebase: { sign_in_provider: 'google.com' } };
const KID_EMAIL = 'dziecko.testowe@example.com';
const pwd = (email, verified = true) => ({ email, email_verified: verified, firebase: { sign_in_provider: 'password' } });
const goog = (email) => ({ email, email_verified: true, firebase: { sign_in_provider: 'google.com' } });

const db = (uid, token) => env.authenticatedContext(uid, token).firestore();
const admin = () => db(PARENT, ADMIN_TOKEN);
const child = () => db(CHILD, pwd(KID_EMAIL));
const mom = () => db(MOM, goog('mama.testowa@example.com'));
const stranger = () => db(STRANGER, goog('obcy@example.com'));
const CONV = `${CHILD}_${PARENT}`;

async function seed(cfg = {}) {
  await env.withSecurityRulesDisabled(async (c) => {
    const f = c.firestore();
    await setDoc(doc(f, 'kids_pilot/config'), { enabled: true, childUid: CHILD, contacts: [PARENT, MOM], ...cfg });
    await setDoc(doc(f, `kids_conversations/${CONV}`), { participants: [CHILD, PARENT], createdAt: new Date() });
    await setDoc(doc(f, `kids_conversations/${CONV}/messages/m1`), { senderUid: PARENT, text: 'Cześć!', createdAt: new Date(), reactions: {} });
  });
}

before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-lumi-kids', firestore: { rules: readFileSync(RULES, 'utf8'), host: '127.0.0.1', port: 8080 } });
});
after(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

test('1. Dziecko loguje się i czyta własną rozmowę z rodzicem', async () => {
  await seed();
  await assertSucceeds(getDoc(doc(child(), 'kids_pilot/config')));
  await assertSucceeds(getDocs(collection(child(), `kids_conversations/${CONV}/messages`)));
});

test('2. Niezatwierdzony użytkownik nie ma dostępu do LUMI KIDS', async () => {
  await seed();
  await assertFails(getDoc(doc(stranger(), 'kids_pilot/config')));
  await assertFails(getDoc(doc(stranger(), `kids_conversations/${CONV}`)));
  await assertFails(getDocs(collection(stranger(), `kids_conversations/${CONV}/messages`)));
});

test('3. Rodzic wysyła wiadomość do dziecka', async () => {
  await seed();
  await assertSucceeds(addDoc(collection(admin(), `kids_conversations/${CONV}/messages`), { senderUid: PARENT, text: 'Jak w szkole?', createdAt: serverTimestamp(), reactions: {} }));
});

test('4. Dziecko odpowiada rodzicowi (z cytatem)', async () => {
  await seed();
  await assertSucceeds(addDoc(collection(child(), `kids_conversations/${CONV}/messages`), {
    senderUid: CHILD, text: 'Dobrze!', createdAt: serverTimestamp(), reactions: {},
    replyTo: { id: 'm1', text: 'Cześć!', senderUid: PARENT },
  }));
});

test('5. Walidacja zapisu: podszywanie, pusta/za długa treść, stary czas', async () => {
  await seed();
  const c = collection(child(), `kids_conversations/${CONV}/messages`);
  await assertFails(addDoc(c, { senderUid: PARENT, text: 'udaję tatę', createdAt: serverTimestamp(), reactions: {} }));
  await assertFails(addDoc(c, { senderUid: CHILD, text: '', createdAt: serverTimestamp(), reactions: {} }));
  await assertFails(addDoc(c, { senderUid: CHILD, text: 'x'.repeat(1001), createdAt: serverTimestamp(), reactions: {} }));
  await assertFails(addDoc(c, { senderUid: CHILD, text: 'hej', createdAt: new Date(0), reactions: {} }));
  await assertFails(addDoc(c, { senderUid: CHILD, text: 'hej', createdAt: serverTimestamp(), reactions: {}, imageUrl: 'https://x' }));
});

test('6. Cofnięcie dostępu natychmiast blokuje odczyt i zapis', async () => {
  await seed({ enabled: false });
  await assertFails(getDocs(collection(child(), `kids_conversations/${CONV}/messages`)));
  await assertFails(addDoc(collection(child(), `kids_conversations/${CONV}/messages`), { senderUid: CHILD, text: 'hej', createdAt: serverTimestamp(), reactions: {} }));
  await env.clearFirestore();
  await seed({ childUid: '' });
  await assertFails(getDocs(collection(child(), `kids_conversations/${CONV}/messages`)));
});

test('7. Obcy nie odczyta ani nie wyśle, nie założy rozmowy z dzieckiem', async () => {
  await seed();
  await assertFails(addDoc(collection(stranger(), `kids_conversations/${CONV}/messages`), { senderUid: STRANGER, text: 'hej', createdAt: serverTimestamp(), reactions: {} }));
  await assertFails(setDoc(doc(stranger(), `kids_conversations/${CHILD}_${STRANGER}`), { participants: [CHILD, STRANGER], createdAt: serverTimestamp() }));
  await assertFails(getDoc(doc(stranger(), `kids_profiles/${CHILD}`)));
});

test('7b. Zatwierdzony kontakt (mama) zakłada własną rozmowę; dziecko nie zmieni listy kontaktów', async () => {
  await seed();
  await assertSucceeds(setDoc(doc(mom(), `kids_conversations/${CHILD}_${MOM}`), { participants: [CHILD, MOM], createdAt: serverTimestamp() }));
  await assertFails(getDocs(collection(mom(), `kids_conversations/${CONV}/messages`)));
  await assertFails(updateDoc(doc(child(), 'kids_pilot/config'), { contacts: [PARENT, MOM, STRANGER] }));
  await assertFails(updateDoc(doc(child(), 'kids_pilot/config'), { enabled: true }));
});

test('8. Konto dziecka nie może tworzyć publicznego profilu, wpisów ani pisać na czacie ogólnym', async () => {
  await seed();
  await assertFails(setDoc(doc(child(), `lumina_profiles/${CHILD}`), { uid: CHILD, name: 'Dziecko' }));
  await assertFails(addDoc(collection(child(), 'lumina_public_chat_messages'), { senderAuthUid: CHILD, text: 'hej' }));
  await assertFails(addDoc(collection(child(), 'user_posts'), { authorUid: CHILD, title: 'x' }));
  // Zwykły użytkownik LUMINA nadal może (brak regresji):
  await assertSucceeds(addDoc(collection(stranger(), 'lumina_public_chat_messages'), { senderAuthUid: STRANGER, text: 'hej' }));
  await assertSucceeds(setDoc(doc(stranger(), `lumina_profiles/${STRANGER}`), { uid: STRANGER, name: 'Ktoś' }));
});

test('8b. Bez dokumentu konfiguracji zwykły LUMINA działa, a LUMI KIDS jest zamknięte', async () => {
  await assertSucceeds(addDoc(collection(stranger(), 'lumina_public_chat_messages'), { senderAuthUid: STRANGER, text: 'hej' }));
  await assertFails(getDoc(doc(child(), 'kids_pilot/config')));
  await assertFails(setDoc(doc(child(), `kids_conversations/${CONV}`), { participants: [CHILD, PARENT], createdAt: serverTimestamp() }));
});

test('9. Bezpośrednie zapytanie (API) o całą kolekcję nie omija autoryzacji', async () => {
  await seed();
  await assertFails(getDocs(collection(stranger(), 'kids_conversations')));
  await assertFails(getDocs(collection(child(), 'kids_invites')));
  await assertFails(getDocs(collection(stranger(), 'kids_profiles')));
});

test('10. Zaproszenie: tylko zweryfikowany właściciel adresu (hasło) przyjmuje je dla siebie', async () => {
  await env.withSecurityRulesDisabled(async (c) => {
    await setDoc(doc(c.firestore(), 'kids_invites/inv1'), { email: KID_EMAIL, status: 'pending', createdBy: PARENT });
  });
  const claim = (f, uid) => updateDoc(doc(f, 'kids_invites/inv1'), { status: 'claimed', claimedUid: uid, claimedAt: serverTimestamp() });
  await assertFails(getDoc(doc(stranger(), 'kids_invites/inv1')));
  await assertFails(claim(stranger(), STRANGER));
  await assertFails(claim(db(CHILD, pwd(KID_EMAIL, false)), CHILD)); // adres niezweryfikowany
  await assertFails(claim(db(CHILD, goog(KID_EMAIL)), CHILD));       // inny dostawca niż hasło
  await assertFails(claim(child(), STRANGER));                         // przypisanie komuś innemu
  await assertSucceeds(getDocs(query(collection(child(), 'kids_invites'), where('email', '==', KID_EMAIL))));
  await assertSucceeds(claim(child(), CHILD));
  await assertFails(claim(child(), CHILD));                            // drugi raz
  // Dziecko nie nadaje sobie roli — dopiero opiekun zapisuje childUid w konfiguracji:
  await assertFails(setDoc(doc(child(), 'kids_pilot/config'), { enabled: true, childUid: CHILD, contacts: [PARENT] }));
  await assertSucceeds(setDoc(doc(admin(), 'kids_pilot/config'), { enabled: true, childUid: CHILD, contacts: [PARENT] }));
});

test('11. Reakcje: tylko własna, z listy emoji, bez zmiany treści', async () => {
  await seed();
  const m = doc(child(), `kids_conversations/${CONV}/messages/m1`);
  await assertSucceeds(updateDoc(m, { [`reactions.${CHILD}`]: '❤️' }));
  await assertFails(updateDoc(m, { [`reactions.${PARENT}`]: '❤️' }));
  await assertFails(updateDoc(m, { [`reactions.${CHILD}`]: '💣' }));
  await assertFails(updateDoc(m, { text: 'zmienione' }));
  await assertSucceeds(updateDoc(m, { [`reactions.${CHILD}`]: deleteField() }));
});

test('12. Zgłoszenie do pilotażu: tylko własne, zweryfikowane konto, poprawne pola; czyta autor i administrator', async () => {
  const ok = (uid, email) => ({ uid, email, parentName: 'Rodzic Testowy', childrenCount: 2, message: '', consent: true, status: 'new', createdAt: serverTimestamp() });
  const p = db('parentX', goog('rodzic.x@example.com'));
  await assertFails(setDoc(doc(p, 'kids_waitlist/innyUid'), ok('innyUid', 'rodzic.x@example.com')));
  await assertFails(setDoc(doc(p, 'kids_waitlist/parentX'), ok('parentX', 'ktos.inny@example.com')));
  await assertFails(setDoc(doc(p, 'kids_waitlist/parentX'), { ...ok('parentX', 'rodzic.x@example.com'), consent: false }));
  await assertFails(setDoc(doc(p, 'kids_waitlist/parentX'), { ...ok('parentX', 'rodzic.x@example.com'), childName: 'Jaś' }));
  await assertFails(setDoc(doc(db('anonX', { firebase: { sign_in_provider: 'anonymous' } }), 'kids_waitlist/anonX'), ok('anonX', 'a@example.com')));
  await assertFails(setDoc(doc(db('parentY', pwd('rodzic.y@example.com', false)), 'kids_waitlist/parentY'), ok('parentY', 'rodzic.y@example.com')));
  await assertSucceeds(setDoc(doc(p, 'kids_waitlist/parentX'), ok('parentX', 'rodzic.x@example.com')));
  await assertFails(updateDoc(doc(p, 'kids_waitlist/parentX'), { status: 'approved' }));
  await assertSucceeds(getDoc(doc(p, 'kids_waitlist/parentX')));
  await assertFails(getDoc(doc(stranger(), 'kids_waitlist/parentX')));
  await assertFails(getDocs(collection(stranger(), 'kids_waitlist')));
  await assertSucceeds(getDocs(collection(admin(), 'kids_waitlist')));
  await seed();
  await assertFails(setDoc(doc(child(), `kids_waitlist/${CHILD}`), ok(CHILD, KID_EMAIL)));
});
