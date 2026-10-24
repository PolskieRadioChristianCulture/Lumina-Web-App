import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();

test('Telemetria Założyciela: Agregacja 1-doc, bufor 15 min, dynamiczny todayCount i eliminacja fikcyjnych danych', async () => {
    const luminaDbSrc = fs.readFileSync(path.join(ROOT, 'lumina-db.js'), 'utf8');

    // Wyciągamy ciało listenToFounderTelemetry wraz z deklaracjami cache
    const match = luminaDbSrc.match(/let _founderTelemetryProfilesCache = null;[\s\S]*?export function listenToFounderTelemetry\([\s\S]*?\n\}/);
    assert.ok(match, 'Nie znaleziono listenToFounderTelemetry w lumina-db.js');
    const code = match[0].replace('export function listenToFounderTelemetry', 'function listenToFounderTelemetry');

    let getDocsCalls = 0;
    let getDocCalls = 0;
    let presenceSubscribed = false;
    let presenceUnsubscribed = false;
    let presenceCallback = null;

    // Start: 18 października 2026, godz. 23:55 (5 minut przed północą w strefie lokalnej)
    let currentTime = new Date(2026, 9, 18, 23, 55, 0).getTime();

    const mockProfiles = [
        { id: 'p1', data: () => ({ gender: 'kobieta', name: 'Maria', createdAt: new Date(2026, 9, 18, 10, 0, 0) }) },
        { id: 'p2', data: () => ({ gender: 'mężczyzna', name: 'Piotr', createdAt: new Date(2026, 9, 18, 12, 0, 0) }) },
        { id: 'p3', data: () => ({ gender: 'kobieta', name: 'Anna', createdAt: new Date(2026, 9, 17, 15, 0, 0) }) }
    ];

    const sessionStore = new Map();
    let aggregatedDocResult = null; // początkowo brak dokumentu zagregowanego -> fallback do getDocs

    const context = {
        db: {},
        Intl,
        Math,
        JSON,
        collection: (_db, name) => name,
        doc: (_db, col, id) => `${col}/${id}`,
        query: (coll) => coll,
        limit: (n) => n,
        getCountFromServer: async () => ({
            data: () => ({ count: aggregatedDocResult ? aggregatedDocResult.totalMembers : mockProfiles.length })
        }),
        getDoc: async (docRef) => {
            getDocCalls++;
            if (docRef === 'lumina_stats/community_telemetry' && aggregatedDocResult) {
                return {
                    exists: () => true,
                    data: () => aggregatedDocResult
                };
            }
            return { exists: () => false };
        },
        getDocs: async (coll) => {
            getDocsCalls++;
            return {
                size: mockProfiles.length,
                forEach: fn => mockProfiles.forEach(fn)
            };
        },
        Date: class extends Date {
            constructor(...args) {
                if (args.length) super(...args);
                else super(currentTime);
            }
            static now() { return currentTime; }
        },
        subscribeToOnlinePresence: (cb) => {
            presenceSubscribed = true;
            presenceCallback = cb;
            cb([{ uid: 'u1' }, { uid: 'u2' }], { available: true });
            return () => { presenceUnsubscribed = true; };
        },
        sessionStorage: {
            getItem: (k) => sessionStore.get(k) || null,
            setItem: (k, v) => sessionStore.set(k, v)
        },
        console: { warn: () => {} }
    };

    const fn = vm.runInNewContext(code + '; listenToFounderTelemetry;', context);

    // ── KROK 1: Pierwsze uruchomienie bez dokumentu zagregowanego (Fallback: getDocs) ──
    let lastData = null;
    const unsubTelemetry1 = fn(data => { lastData = data; });
    await new Promise(r => setTimeout(r, 20));

    assert.equal(getDocCalls, 1, 'Sprawdzenie czy istnieje zagregowany dokument stats');
    assert.equal(getDocsCalls, 1, 'Brak dokumentu stats -> fallback do getDocs profili');
    assert.equal(lastData.available, true);
    assert.equal(lastData.isStale, false);
    assert.equal(lastData.totalMembers, 3);
    assert.equal(lastData.femaleCount, 2);
    assert.equal(lastData.maleCount, 1);
    assert.equal(lastData.femalePercent, 67);
    assert.equal(lastData.malePercent, 33);
    assert.equal(lastData.todayCount, 2, '2 profile zarejestrowane 18 października');

    // ── KROK 2: Przejście przez północ w ramach TTL bufora (18 Października 23:55 -> 19 Października 00:02, 7 min < 15 min) ──
    currentTime += 7 * 60000;
    // Emisja zdarzenia obecności wyzwala przeliczenie telemetrii bez nowego zapytania getDocs
    presenceCallback([{ uid: 'u1' }, { uid: 'u2' }, { uid: 'u3' }], { available: true });

    assert.equal(getDocsCalls, 1, 'Brak nowego zapytania do bazy Firestore');
    assert.equal(lastData.onlineTotal, 3);
    assert.equal(lastData.todayCount, 0, 'Po północy licznik dzisiejszych rejestracji wynosi 0 (brak fikcyjnych danych)');

    // ── KROK 3: Drugie wywołanie w ramach 15 minut (minuta 10 od startu — odczyt z pamięci podręcznej) ──
    currentTime += 3 * 60000; // 10 min od startu (< 15 min)
    let lastData2 = null;
    const unsubTelemetry2 = fn(data => { lastData2 = data; });
    await new Promise(r => setTimeout(r, 20));
    assert.equal(getDocsCalls, 1, 'Cache w pamięci zapobiega nowemu getDocs');
    assert.equal(lastData2.todayCount, 0);

    // ── KROK 4: Dostępny dokument zagregowany lumina_stats/community_telemetry (P0-3) ──
    // Upływ 16 minut od startu (przekroczenie 15 minut TTL cache)
    currentTime += 6 * 60000; // 16 min od startu (> 15 min)
    aggregatedDocResult = {
        totalMembers: 1250,
        femaleCount: 750,
        maleCount: 500,
        todayCount: 14,
        statsDate: new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(currentTime)),
        dayCounts: { 1: 200, 2: 200, 3: 200, 4: 200, 5: 200, 6: 125, 0: 125 }
    };

    let lastData3 = null;
    const unsubTelemetry3 = fn(data => { lastData3 = data; });
    await new Promise(r => setTimeout(r, 20));

    assert.equal(getDocCalls, 2, 'Pobrano dokument zagregowany lumina_stats');
    assert.equal(getDocsCalls, 1, 'ZERO odczytów getDocs profili dzięki dokumentowi zagregowanemu! (1 doc read)');
    assert.equal(lastData3.totalMembers, 1250);
    assert.equal(lastData3.femalePercent, 60);
    assert.equal(lastData3.malePercent, 40);
    assert.equal(lastData3.todayCount, 14);

    // ── KROK 5: Test błędu przy braku cache (eliminacja fikcyjnych zer i 50/50) ──
    // Tworzymy czysty kontekst, który rzuca błąd przy pierwszym odczycie
    const errorContext = {
        db: {},
        Intl,
        Math,
        JSON,
        doc: () => 'err',
        query: (c) => c,
        limit: (n) => n,
        getCountFromServer: async () => { throw new Error('Firestore Network Down'); },
        getDoc: async () => { throw new Error('Firestore Network Down'); },
        collection: () => 'err',
        getDocs: async () => { throw new Error('Firestore Network Down'); },
        Date: context.Date,
        subscribeToOnlinePresence: (cb) => {
            cb([], { available: false });
            return () => {};
        },
        sessionStorage: { getItem: () => null, setItem: () => {} },
        console: { warn: () => {} }
    };

    const fnError = vm.runInNewContext(code + '; listenToFounderTelemetry;', errorContext);
    let errorData = null;
    fnError(data => { errorData = data; });
    await new Promise(r => setTimeout(r, 20));

    assert.equal(errorData.available, false, 'Stan jawnej niedostępności przy błędzie (available: false)');
    assert.equal(errorData.totalMembers, null, 'Brak fikcyjnego 0 w totalMembers');
    assert.equal(errorData.femalePercent, null, 'Brak fikcyjnego 50% w femalePercent');
    assert.equal(errorData.malePercent, null, 'Brak fikcyjnego 50% w malePercent');
    assert.equal(errorData.todayCount, null, 'Brak fikcyjnego 0 w todayCount');

    // ── KROK 6: Sprzątanie ──
    unsubTelemetry1();
    unsubTelemetry2();
    unsubTelemetry3();
    assert.equal(presenceUnsubscribed, true);
    console.log('✔ Wszystkie asercje P0-1, P0-2, P0-3 w teście telemetrii zaliczone pomyślnie!');
});
