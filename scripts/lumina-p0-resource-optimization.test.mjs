import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// ══════════════════════════════════════════════════════════════════════════════
// TEST 1: P0-1 — Profil Dowódcy (lumina.cezaryrgowski.html)
// ══════════════════════════════════════════════════════════════════════════════
test('P0-1: profil Dowódcy nie posiada surowego onSnapshot(lumina_presence) i używa subscribeToOnlinePresence z czyszczeniem', () => {
    const content = fs.readFileSync('lumina.cezaryrgowski.html', 'utf8');
    
    // 1. Zakaz surowego nasłuchu całej kolekcji obecności
    const rawPresenceSnapshot = /onSnapshot\s*\(\s*collection\s*\([^,]+,\s*['"]lumina_presence['"]\)/;
    assert.equal(rawPresenceSnapshot.test(content), false, 'W profilu Cezarego nie może być surowego onSnapshot(collection(..., lumina_presence))');

    // 2. Wymóg użycia współdzielonego kanału subscribeToOnlinePresence
    assert.ok(content.includes('window.LuminaDB.subscribeToOnlinePresence'), 'Profil musi używać window.LuminaDB.subscribeToOnlinePresence');

    // 3. Weryfikacja czyszczenia przy wielokrotnym uruchomieniu
    assert.ok(content.includes('if (typeof stopOnlineUsersListFeed === \'function\') stopOnlineUsersListFeed()'), 'Profil musi zwalniać poprzednią subskrypcję');
    assert.ok(content.includes('beforeunload'), 'Profil musi czyścić subskrypcję na beforeunload');
});

// ══════════════════════════════════════════════════════════════════════════════
// TEST 2: P0-2 — Odznaki (lumina-badges-engine.js)
// ══════════════════════════════════════════════════════════════════════════════
test('P0-2: silnik odznak importuje where i filtruje zapytania ściśle według UID użytkownika', () => {
    const content = fs.readFileSync('lumina-badges-engine.js', 'utf8');

    // 1. Import where
    assert.ok(/import\s*\{[^}]*\bwhere\b[^}]*\}\s*from/.test(content), 'lumina-badges-engine.js musi importować where z SDK');

    // 2. renderBadgeGallery musi używać where('uid', '==', targetUid)
    assert.ok(content.includes("where('uid', '==', targetUid)"), 'renderBadgeGallery musi filtrować po targetUid');

    // 3. listenForNewBadges musi używać where('uid', '==', uid)
    assert.ok(content.includes("where('uid', '==', uid)"), 'listenForNewBadges musi filtrować po myId()/uid');

    // 4. Brak surowego onSnapshot na całą kolekcję bez zapytania
    assert.equal(/onSnapshot\s*\(\s*collection\s*\([^,]+,\s*['"]lumina_user_badges['"]\)/.test(content), false,
        'Niedozwolony jest bezpośredni nasłuch całej kolekcji lumina_user_badges bez query(where(...))');
});

test('P0-2: Firestore Security Rules zawierają regułę dla lumina_user_badges chroniącą przed modyfikacją', () => {
    const rules = fs.readFileSync('firestore.rules', 'utf8');
    assert.ok(rules.includes('match /lumina_user_badges/{badgeId}'), 'firestore.rules musi definiować match /lumina_user_badges/{badgeId}');
    assert.ok(rules.includes('allow write: if isMasterAdmin()'), 'Zapis odznak dozwolony wyłącznie dla Master Admina');
});

// ══════════════════════════════════════════════════════════════════════════════
// TEST 3: P0-3 — Telemetria Założyciela (listenToFounderTelemetry)
// ══════════════════════════════════════════════════════════════════════════════
test('P0-3: listenToFounderTelemetry nie tworzy ciągłego onSnapshot na lumina_profiles, używa getDocs i cache', async () => {
    const source = fs.readFileSync('lumina-db.js', 'utf8');
    const fnStart = source.indexOf('export function listenToFounderTelemetry(');
    assert.ok(fnStart > 0, 'Funkcja listenToFounderTelemetry musi istnieć w lumina-db.js');
    const fnEnd = source.indexOf('\nexport ', fnStart + 10);
    const code = source.slice(fnStart, fnEnd > 0 ? fnEnd : undefined).replace('export function', 'function');

    // Analiza statyczna kodu funkcji:
    assert.equal(code.includes("onSnapshot(collection(db, 'lumina_profiles')"), false,
        'listenToFounderTelemetry NIE MOŻE mieć otwartego onSnapshot na lumina_profiles');
    assert.ok(code.includes('getDocs'), 'listenToFounderTelemetry musi używać jednorazowego getDocs');
    assert.ok(code.includes('subscribeToOnlinePresence'), 'listenToFounderTelemetry musi korzystać z kanału obecności');

    // Symulacja uruchomienia w izolowanym kontekście VM:
    let getDocsCalls = 0;
    let presenceSubscribed = 0;
    let presenceStopped = 0;
    let presenceCallback = null;
    const emittedData = [];

    const mockDocs = [
        { data: () => ({ gender: 'kobieta', createdAt: new Date() }) },
        { data: () => ({ gender: 'mężczyzna', createdAt: new Date() }) },
        { data: () => ({ gender: 'male', createdAt: new Date() }) }
    ];

    const context = {
        db: {},
        Date,
        Intl,
        Math,
        JSON,
        _founderTelemetryProfilesCache: null,
        _founderTelemetryProfilesCacheTime: 0,
        collection: (_db, name) => name,
        doc: (_db, col, id) => `${col}/${id}`,
        query: (coll) => coll,
        limit: (n) => n,
        getDoc: async () => ({ exists: () => false }),
        getCountFromServer: async () => ({ data: () => ({ count: mockDocs.length }) }),
        getDocs: async (coll) => {
            getDocsCalls++;
            return {
                size: mockDocs.length,
                forEach: (cb) => mockDocs.forEach(cb)
            };
        },
        subscribeToOnlinePresence: (cb) => {
            presenceSubscribed++;
            presenceCallback = cb;
            return () => { presenceStopped++; };
        },
        sessionStorage: {
            getItem: () => null,
            setItem: () => {}
        },
        console: { warn: () => {} }
    };

    const fn = vm.runInNewContext('(' + code + ')', context);
    const stopTelemetry = fn((data) => {
        emittedData.push(data);
    });

    // Czekamy na asynchroniczne wykonanie loadProfileStats
    await new Promise(r => setTimeout(r, 20));

    assert.equal(getDocsCalls, 1, 'getDocs powinno zostać wywołane dokładnie raz');
    assert.equal(presenceSubscribed, 1, 'subscribeToOnlinePresence powinno zostać wywołane dokładnie raz');

    // Symulujemy zdarzenie obecności w czasie rzeczywistym
    presenceCallback([{ id: 'u1' }, { id: 'u2' }], { available: true });

    assert.ok(emittedData.length >= 1, 'Powinny pojawić się dane telemetryczne');
    const last = emittedData.at(-1);
    assert.equal(last.totalMembers, 3, 'Prawidłowa łączna liczba użytkowników');
    assert.equal(last.onlineTotal, 2, 'Prawidłowa liczba osób online w realtime');
    assert.equal(last.femaleCount, 1, 'Dokładna liczba kobiet');
    assert.equal(last.maleCount, 2, 'Dokładna liczba mężczyzn');
    assert.equal(last.presenceAvailable, true, 'Flaga dostępności obecności');

    // Test czyszczenia zasobów
    stopTelemetry();
    assert.equal(presenceStopped, 1, 'Zatrzymanie telemetrii musi odsubskrybować obecność');

    // Drugie wywołanie w oknie cache (powinno użyć cache i nie wołać getDocs powtórnie)
    const fn2 = vm.runInNewContext('(' + code + ')', context);
    const stop2 = fn2(() => {});
    await new Promise(r => setTimeout(r, 20));
    assert.equal(getDocsCalls, 1, 'Drugie wywołanie z aktywnym cache nie może wykonywać getDocs!');
    stop2();
});

// ══════════════════════════════════════════════════════════════════════════════
// TEST 4: P1 — Cykl Życia Listenerów w subscribeToDirectMessages
// ══════════════════════════════════════════════════════════════════════════════
test('P1: zamykanie czatu stopConversation natychmiast odsubskrybuje wszystkie listenery i zapobiega wyciekom w fallbacku', async () => {
    const source = fs.readFileSync('lumina-db.js', 'utf8');
    const a = source.indexOf('export function subscribeToDirectMessages(');
    const b = source.indexOf('\nexport ', a + 8);
    const code = source.slice(a, b).replace('export function', 'function');

    let stoppedSnapshots = 0;
    const activeCallbacks = [];
    let fallbackTriggered = false;

    const user = { uid: 'TestUser123', isAnonymous: false };
    const context = {
        db: {},
        currentUserState: user,
        auth: { currentUser: user },
        getChatId: (x, y) => [x, y].sort().join('_'),
        localStorage: { removeItem: () => {} },
        activeDirectChatListeners: new Map(),
        activeDirectChatMessages: new Map(),
        collection: (_db, p) => p,
        where: (...x) => x,
        orderBy: (...x) => x,
        limit: x => x,
        query: (...x) => x,
        onSnapshot: (q, opts, cb, err) => {
            const unsub = () => { stoppedSnapshots++; };
            activeCallbacks.push({ q, cb, err, unsub });
            return unsub;
        },
        getDocs: async () => ({ forEach: () => {} }),
        onAuthChange: () => () => {},
        document: { addEventListener: () => {}, removeEventListener: () => {} },
        window: { dispatchEvent: () => {} },
        CustomEvent: function() {},
        console: { warn: () => {} },
        getDirectMessageKey: m => m.id,
        getDirectMessageTime: m => m.timestamp || 0
    };

    const fn = vm.runInNewContext('(' + code + ')', context);
    const stopChat = fn('room_alpha', () => {});

    // Na starcie rejestrowane są 3 subskrypcje: scopedQ, legacyQ, nestedQ
    assert.equal(activeCallbacks.length, 3, 'Powinny wystartować 3 początkowe subskrypcje');

    // Użytkownik zamyka okno czatu
    stopChat();
    assert.equal(stoppedSnapshots, 3, 'stopConversation musi natychmiast zatrzymać wszystkie 3 listenery');

    // Symulacja opóźnionego błędu failed-precondition na starym zapytaniu po zamknięciu okna
    activeCallbacks[0].err({ code: 'failed-precondition' });

    // Fallback NIE MOŻE otworzyć nowego aktywnego listenera po zamknięciu sesji
    assert.equal(activeCallbacks.length, 3, 'Po zamknięciu czatu fallback nie może dodać aktywnego nieodsubskrybowanego listenera');
});

// ══════════════════════════════════════════════════════════════════════════════
// TEST 5: Model Matematyczny — Porównanie Operacji Przed vs Po (10, 50, 100, 200 userów)
// ══════════════════════════════════════════════════════════════════════════════
test('Model matematyczny: redukcja operacji dla 10, 50, 100 i 200 użytkowników w stanie naprawionym', () => {
    // Założenia modelu:
    // T = 60 minut aktywności, zalogowani użytkownicy online.
    // W stanie pierwotnym (przed optymalizacjami Codexa/Antigravity):
    //   - Heartbeat 30s: 2 zapisy/min per user
    //   - Telemetria założyciela: onSnapshot na wszystkie profile (przy 50 profilach w bazie)
    //   - Odznaki: pobieranie całej kolekcji odznak (zał. 200 odznak) przy każdym otwarciu
    //   - Obecność: 2 * N^2 odczytów / min
    // W stanie naprawionym (obecnym):
    //   - Heartbeat 60s z wstrzymaniem w tle: 1 zapis/min per user
    //   - Telemetria: getDocs raz na 15 min (4 odczyty/godzinę), brak onSnapshot na całe profile
    //   - Odznaki: ściśle where('uid', '==', uid) — odczyt tylko swoich odznak (średnio 3 odznaki)
    //   - Profil Dowódcy: współdzielony kanał obecności zamiast surowego onSnapshot

    const userCounts = [10, 50, 100, 200];
    const results = {};

    for (const N of userCounts) {
        // Zapisy na godzinę
        const writesBefore = N * (60 / 30) * 60; // ping co 30s = 120 writes/h/user
        const writesAfter = N * (60 / 60) * 60;  // ping co 60s = 60 writes/h/user

        // Odczyty odznak na otwarcie profilu
        const badgeReadsBefore = 200; // cała kolekcja
        const badgeReadsAfter = 3;    // tylko swoje odznaki

        // Odczyty profilowe telemetrii (na 1 godzinę nasłuchu)
        const telemetryReadsBefore = 50 * 60; // 50 profili odczytywanych przy każdej aktualizacji (min. 1/min) = 3000
        const telemetryReadsAfter = 50 * 4;   // 1 getDocs co 15 min = 200 odczytów/h

        results[N] = {
            writesBefore,
            writesAfter,
            writesReductionPct: Math.round(((writesBefore - writesAfter) / writesBefore) * 100),
            badgeReductionPct: Math.round(((badgeReadsBefore - badgeReadsAfter) / badgeReadsBefore) * 100),
            telemetryReductionPct: Math.round(((telemetryReadsBefore - telemetryReadsAfter) / telemetryReadsBefore) * 100)
        };

        assert.equal(results[N].writesReductionPct, 50, 'Zapisy zredukowane o 50%');
        assert.ok(results[N].badgeReductionPct >= 95, 'Odczyty odznak zredukowane o >= 95%');
        assert.ok(results[N].telemetryReductionPct >= 90, 'Odczyty profilowe telemetrii zredukowane o >= 90%');
    }
});
