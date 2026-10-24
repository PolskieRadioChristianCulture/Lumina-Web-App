import assert from 'node:assert/strict';

const host = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const projectId = 'cc-mission-control';
const baseUrl = `http://${host}/v1/projects/${projectId}/databases/(default)/documents`;

console.log(`[Firestore Rules Emulator Test] Testowanie reguł na host: ${host}, projekt: ${projectId}`);

function makeMockJwt(payload) {
    const header = { alg: 'none', typ: 'JWT' };
    const encHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${encHeader}.${encPayload}.`;
}

async function firestoreRequest(method, path, body = null, tokenPayload = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (tokenPayload) {
        headers['Authorization'] = `Bearer ${makeMockJwt(tokenPayload)}`;
    }
    const res = await fetch(`${baseUrl}/${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    const status = res.status;
    let data = null;
    try { data = await res.json(); } catch (_) {}
    return { status, data };
}

async function run() {
    console.log('--- TEST 1: lumina_user_badges & lumina_stats (P0-2 & P0-3) ---');

    const memberAuth = {
        sub: 'user_regular_123',
        uid: 'user_regular_123',
        email: 'member@christianculture.pl',
        firebase: { sign_in_provider: 'password' }
    };

    const adminAuth = {
        sub: 'nazir_uid',
        uid: 'nazir_uid',
        email: 'nazirczarkes@gmail.com',
        email_verified: true,
        admin: true,
        firebase: { sign_in_provider: 'google.com' }
    };

    // 1.1 Master Admin zapisuje odznakę
    const adminWrite = await firestoreRequest('PATCH', 'lumina_user_badges/badge_test_1', {
        fields: { uid: { stringValue: 'user_regular_123' }, badgeId: { stringValue: 'worship_warrior' } }
    }, adminAuth);
    assert.equal(adminWrite.status, 200, 'Master Admin MOŻE zapisywać odznaki');
    console.log('✔ Master Admin write odznaka -> 200 OK (PASS)');

    // 1.2 Gość niezalogowany czyta publiczną odznakę z profilu
    const unauthRead = await firestoreRequest('GET', 'lumina_user_badges/badge_test_1');
    assert.equal(unauthRead.status, 200, 'Niezalogowany użytkownik MOŻE czytać publiczne odznaki w profilu (200 OK)');
    assert.equal(unauthRead.data?.fields?.badgeId?.stringValue, 'worship_warrior');
    console.log('✔ Niezalogowany gość read odznaka -> 200 OK (PASS - publiczne trofeum profilu)');

    // 1.3 Inny zalogowany użytkownik czyta odznakę profilu
    const memberRead = await firestoreRequest('GET', 'lumina_user_badges/badge_test_1', null, memberAuth);
    assert.equal(memberRead.status, 200, 'Zalogowany użytkownik MOŻE czytać cudze odznaki');
    console.log('✔ Zalogowany użytkownik read cudza odznaka -> 200 OK (PASS)');

    // 1.4 Gość niezalogowany próbuje zapisać odznakę
    const unauthWrite = await firestoreRequest('PATCH', 'lumina_user_badges/badge_unauth_attack', {
        fields: { uid: { stringValue: 'attacker' }, badgeId: { stringValue: 'gold' } }
    });
    assert.equal(unauthWrite.status, 403, 'Niezalogowany użytkownik NIE może zapisywać lumina_user_badges');
    console.log('✔ Niezalogowany write -> 403 PERMISSION_DENIED (PASS)');

    // 1.5 Zwykły uwierzytelniony użytkownik (nie-admin) próbuje nadać sobie lub komuś odznakę
    const memberWrite = await firestoreRequest('PATCH', 'lumina_user_badges/badge_fake_1', {
        fields: { uid: { stringValue: 'user_regular_123' }, badgeId: { stringValue: 'founder' } }
    }, memberAuth);
    assert.equal(memberWrite.status, 403, 'Zwykły użytkownik NIE może nadawać/zapisywać odznak');
    console.log('✔ Zwykły użytkownik write -> 403 PERMISSION_DENIED (PASS)');

    // 1.6 lumina_stats: Master Admin zapisuje zagregowaną telemetrię
    const statsAdminWrite = await firestoreRequest('PATCH', 'lumina_stats/community_telemetry', {
        fields: { totalMembers: { integerValue: '42' }, todayCount: { integerValue: '3' } }
    }, adminAuth);
    assert.equal(statsAdminWrite.status, 200, 'Master Admin MOŻE zapisywać zagregowane statystyki');
    console.log('✔ Master Admin write lumina_stats -> 200 OK (PASS)');

    // 1.7 lumina_stats: Zwykły użytkownik próbuje sfałszować statystyki
    const statsMemberWrite = await firestoreRequest('PATCH', 'lumina_stats/community_telemetry', {
        fields: { totalMembers: { integerValue: '999999' } }
    }, memberAuth);
    assert.equal(statsMemberWrite.status, 403, 'Zwykły użytkownik NIE może zapisywać lumina_stats');
    console.log('✔ Zwykły użytkownik write lumina_stats -> 403 PERMISSION_DENIED (PASS)');

    // 1.8 lumina_stats: Gość niezalogowany próbuje sfałszować statystyki
    const statsUnauthWrite = await firestoreRequest('PATCH', 'lumina_stats/community_telemetry', {
        fields: { totalMembers: { integerValue: '666' } }
    });
    assert.equal(statsUnauthWrite.status, 403, 'Niezalogowany gość NIE może zapisywać lumina_stats');
    console.log('✔ Niezalogowany gość write lumina_stats -> 403 PERMISSION_DENIED (PASS)');

    // 1.9 lumina_stats: Odczyt telemetrii przez klienta (publiczny lub zalogowany)
    const statsRead = await firestoreRequest('GET', 'lumina_stats/community_telemetry');
    assert.equal(statsRead.status, 200, 'Odczyt zagregowanych statystyk jest dozwolony');
    assert.equal(statsRead.data?.fields?.totalMembers?.integerValue, '42');
    console.log('✔ Publiczny odczyt lumina_stats -> 200 OK (PASS)');

    console.log('\n--- TEST 2: lumina_direct_messages (izolacja uczestników czatu) ---');

    const userA = {
        sub: 'user_alpha',
        uid: 'user_alpha',
        email: 'alpha@cc.pl',
        firebase: { sign_in_provider: 'password' }
    };
    const userB = {
        sub: 'user_bravo',
        uid: 'user_bravo',
        email: 'bravo@cc.pl',
        firebase: { sign_in_provider: 'password' }
    };
    const userC_intruder = {
        sub: 'user_intruder',
        uid: 'user_intruder',
        email: 'intruder@cc.pl',
        firebase: { sign_in_provider: 'password' }
    };

    const chatId = 'user_alpha_user_bravo';
    const msgId = 'dm_alpha_bravo_001';

    // 2.0 Inicjalizacja zaakceptowanej rozmowy przez Master Admina
    const chatSetup = await firestoreRequest('PATCH', `lumina_chats/${chatId}`, {
        fields: {
            conversationState: { stringValue: 'accepted' },
            participants: { arrayValue: { values: [{ stringValue: 'user_alpha' }, { stringValue: 'user_bravo' }] } }
        }
    }, adminAuth);
    assert.equal(chatSetup.status, 200, 'Zainicjowanie pokoju rozmowy');

    // 2.1 Zapis wiadomości przez Użytkownika A do Użytkownika B
    const writeMsg = await firestoreRequest('PATCH', `lumina_direct_messages/${msgId}`, {
        fields: {
            chatId: { stringValue: chatId },
            senderAuthUid: { stringValue: 'user_alpha' },
            receiverAuthUid: { stringValue: 'user_bravo' },
            participants: { arrayValue: { values: [{ stringValue: 'user_alpha' }, { stringValue: 'user_bravo' }] } },
            text: { stringValue: 'Pokój Tobie!' }
        }
    }, userA);
    assert.equal(writeMsg.status, 200, 'Uczestnik A może wysłać wiadomość w zaakceptowanym czacie');
    console.log('✔ Uczestnik A wysyła wiadomość -> 200 OK (PASS)');

    // 2.2 Użytkownik B (adresat) może odczytać wiadomość
    const readMsgB = await firestoreRequest('GET', `lumina_direct_messages/${msgId}`, null, userB);
    assert.equal(readMsgB.status, 200, 'Uczestnik B może odczytać wiadomość');
    assert.equal(readMsgB.data?.fields?.text?.stringValue, 'Pokój Tobie!');
    console.log('✔ Uczestnik B (adresat) czyta wiadomość -> 200 OK (PASS)');

    // 2.3 Obcy Użytkownik C (intruz) NIE MOŻE odczytać wiadomości
    const readMsgC = await firestoreRequest('GET', `lumina_direct_messages/${msgId}`, null, userC_intruder);
    assert.equal(readMsgC.status, 403, 'Osoba trzecia NIE MOŻE czytać prywatnej wiadomości');
    console.log('✔ Osoba trzecia read -> 403 PERMISSION_DENIED (PASS)');

    // 2.4 Niezalogowany gość NIE MOŻE odczytać wiadomości
    const unauthMsgRead = await firestoreRequest('GET', `lumina_direct_messages/${msgId}`);
    assert.equal(unauthMsgRead.status, 403, 'Niezalogowany gość NIE MOŻE czytać prywatnych wiadomości');
    console.log('✔ Niezalogowany gość read -> 403 PERMISSION_DENIED (PASS)');

    console.log('\n--- TEST 3: lumina_profiles (ochrona edycji profili) ---');

    // 3.1 Niezalogowany zapis profilu -> 403
    const unauthProfWrite = await firestoreRequest('PATCH', 'lumina_profiles/prof_alpha', {
        fields: { uid: { stringValue: 'user_alpha' }, name: { stringValue: 'Haker' } }
    });
    assert.equal(unauthProfWrite.status, 403, 'Niezalogowany nie może edytować profilu');
    console.log('✔ Niezalogowany zapis profilu -> 403 PERMISSION_DENIED (PASS)');

    // 3.2 Użytkownik B próbuje edytować profil Użytkownika A -> 403
    const foreignProfWrite = await firestoreRequest('PATCH', 'lumina_profiles/prof_alpha', {
        fields: { uid: { stringValue: 'user_alpha' }, name: { stringValue: 'Podszywacz' } }
    }, userB);
    assert.equal(foreignProfWrite.status, 403, 'Użytkownik nie może edytować cudzego profilu');
    console.log('✔ Zapis cudzego profilu -> 403 PERMISSION_DENIED (PASS)');

    console.log('\n======================================================');
    console.log('✅ WSZYSTKIE TESTY REGUŁ FIRESTORE W EMULATORZE ZALICZONE!');
    console.log('======================================================');
}

run().catch(err => {
    console.error('❌ Błąd testu reguł w emulatorze:', err);
    process.exit(1);
});
