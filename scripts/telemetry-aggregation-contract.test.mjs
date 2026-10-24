import test from 'node:test';
import assert from 'node:assert/strict';
import { updateTelemetryOnNewProfile, determineGender } from '../functions/lumina-telemetry-functions.js';

test('Cloud Functions Agregacja: poprawność liczników, płeć i przejście przez północ', async () => {
    // 1. Test heurystyki płci
    assert.equal(determineGender({ gender: 'kobieta' }), 'female');
    assert.equal(determineGender({ gender: 'mężczyzna' }), 'male');
    assert.equal(determineGender({ name: 'Anna Kowalska' }), 'female');
    assert.equal(determineGender({ name: 'Piotr Nowak' }), 'male');
    assert.equal(determineGender({ name: 'Kuba' }), 'male'); // wyjątek dla Kuby

    // 2. Symulacja bazy danych dla updateTelemetryOnNewProfile
    let storedStats = null;
    let mockDate = new Date('2026-10-18T10:00:00.000Z');

    const mockDb = {
        doc: (path) => ({ path }),
        runTransaction: async (updateFn) => {
            const transaction = {
                get: async (ref) => ({
                    exists: Boolean(storedStats),
                    data: () => storedStats || {}
                }),
                set: (ref, data, opts) => {
                    storedStats = Object.assign({}, storedStats || {}, data);
                }
            };
            return updateFn(transaction);
        }
    };

    const RealDate = global.Date;
    const withProcessingTime = async (iso, fn) => {
        global.Date = class extends RealDate {
            constructor(...args) {
                super(...(args.length ? args : [iso]));
            }
            static now() { return new RealDate(iso).getTime(); }
        };
        try {
            return await fn();
        } finally {
            global.Date = RealDate;
        }
    };

    // Rejestracja pierwszego profilu (Kobieta) 18 października
    await withProcessingTime('2026-10-18T10:00:00.000Z', () =>
        updateTelemetryOnNewProfile(mockDb, {
            name: 'Maria Magdalena',
            gender: 'kobieta',
            createdAt: new RealDate('2026-10-18T10:00:00.000Z')
        }, 'user_01')
    );

    assert.equal(storedStats.totalMembers, 1);
    assert.equal(storedStats.femaleCount, 1);
    assert.equal(storedStats.maleCount, 0);
    assert.equal(storedStats.todayCount, 1);
    assert.equal(storedStats.createdDates.length, 1);

    // Rejestracja drugiego profilu (Mężczyzna) tego samego dnia
    await withProcessingTime('2026-10-18T14:30:00.000Z', () =>
        updateTelemetryOnNewProfile(mockDb, {
            name: 'Jan Apostoł',
            gender: 'mężczyzna',
            createdAt: new RealDate('2026-10-18T14:30:00.000Z')
        }, 'user_02')
    );

    assert.equal(storedStats.totalMembers, 2);
    assert.equal(storedStats.femaleCount, 1);
    assert.equal(storedStats.maleCount, 1);
    assert.equal(storedStats.todayCount, 2, 'Dwóch użytkowników zarejestrowanych dzisiaj');

    // 3. Symulacja przejścia przez północ (19 października)
    // Kolejny użytkownik rejestruje się następnego dnia
    const nextDayDate = new RealDate('2026-10-19T08:00:00.000Z');
    await withProcessingTime('2026-10-19T08:00:00.000Z', () =>
        updateTelemetryOnNewProfile(mockDb, {
            name: 'Łukasz Ewangelista',
            gender: 'mężczyzna',
            createdAt: nextDayDate
        }, 'user_03')
    );

    assert.equal(storedStats.totalMembers, 3, 'Łączna liczba członków: 3');
    assert.equal(storedStats.maleCount, 2);
    assert.equal(storedStats.todayCount, 1, 'W nowym dniu licznik todayCount automatycznie wynosi 1 (reset północny)');

    console.log('✔ Cloud Functions Telemetry Aggregation Contract: PASS');
});
