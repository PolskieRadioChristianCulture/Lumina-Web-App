import test from 'node:test';
import assert from 'node:assert/strict';
import '../js/cc-ramowka.js';

const ramowka = globalThis.CC_RAMOWKA;

test('cc-ramowka: NOAA sunset calculation within expected ranges', () => {
    // 21 czerwca 2026 (letnie przesilenie)
    const june21 = new Date(Date.UTC(2026, 5, 21));
    const sunsetJune = new Date(ramowka.getSunsetMs(june21));
    const juneHourUtc = sunsetJune.getUTCHours();
    // W UTC w czerwcu zachód słońca w Warszawie to ok. 19:01 UTC (21:01 CEST)
    assert.ok(juneHourUtc === 19 || juneHourUtc === 20, `June sunset UTC hour ${juneHourUtc} expected ~19:01 UTC`);

    // 21 grudnia 2026 (zimowe przesilenie)
    const dec21 = new Date(Date.UTC(2026, 11, 21));
    const sunsetDec = new Date(ramowka.getSunsetMs(dec21));
    const decHourUtc = sunsetDec.getUTCHours();
    // W UTC w grudniu zachód słońca to ok. 14:25 UTC (15:25 CET)
    assert.ok(decHourUtc === 14 || decHourUtc === 15, `Dec sunset UTC hour ${decHourUtc} expected ~14:25 UTC`);
});

test('cc-ramowka: rest window logic from Friday sunset to Saturday sunset', () => {
    // Piątek 30 października 2026
    const friDate = new Date(2026, 9, 30, 12, 0); // 12:00 w południe
    const friSunset = new Date(ramowka.getSunsetMs(friDate));

    // Przed zachodem słońca w piątek
    const friBeforeSunset = new Date(friSunset.getTime() - 3600000);
    assert.equal(ramowka.isRestWindow(friBeforeSunset), false, 'Friday before sunset should NOT be rest window');

    // Po zachodzie słońca w piątek
    const friAfterSunset = new Date(friSunset.getTime() + 3600000);
    assert.equal(ramowka.isRestWindow(friAfterSunset), true, 'Friday after sunset MUST be rest window');

    // Sobota 31 października 2026 przed zachodem
    const satDate = new Date(2026, 9, 31, 12, 0);
    const satSunset = new Date(ramowka.getSunsetMs(satDate));
    const satBeforeSunset = new Date(satSunset.getTime() - 3600000);
    assert.equal(ramowka.isRestWindow(satBeforeSunset), true, 'Saturday before sunset MUST be rest window');

    // Sobota po zachodzie
    const satAfterSunset = new Date(satSunset.getTime() + 3600000);
    assert.equal(ramowka.isRestWindow(satAfterSunset), false, 'Saturday after sunset should NOT be rest window');

    // Niedziela
    const sunDate = new Date(2026, 10, 1, 12, 0);
    assert.equal(ramowka.isRestWindow(sunDate), false, 'Sunday should NOT be rest window');
});

test('cc-ramowka: swaps in rest window (no zapolske, no randki, no totalny atak)', () => {
    // Piątek po zachodzie słońca, godz. 19:00
    const friNight = new Date(2026, 9, 30, 19, 0);
    const stateFri = ramowka.getScheduleState(friNight);
    assert.equal(stateFri.isRestWindow, true);
    assert.ok(stateFri.channel.includes('spiewajmy-panu'), 'Friday evening must play worship');

    // Piątek godz. 22:15 po zachodzie słońca (zamiast randek -> biblia spiewana)
    const friLate = new Date(2026, 9, 30, 22, 15);
    const stateLate = ramowka.getScheduleState(friLate);
    assert.equal(stateLate.channel, 'biblia-spiewana-live.html', 'Friday night during rest window must be Biblia Spiewana');

    // Sobota rano 07:00 (zamiast zapolske -> spiewajmy panu)
    const satMorning = new Date(2026, 9, 31, 7, 0);
    const stateSat = ramowka.getScheduleState(satMorning);
    assert.equal(stateSat.isRestWindow, true);
    assert.ok(stateSat.channel.includes('spiewajmy-panu'), 'Saturday morning during rest window must be worship');
});

test('cc-ramowka: confidentiality rule — word "szabat" must NEVER appear in public output', () => {
    // Sprawdź cały tydzień godzina po godzinie
    const startDate = new Date(2026, 9, 26, 0, 0); // Poniedziałek
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const probe = new Date(startDate.getTime() + (day * 24 + hour) * 3600000);
            const state = ramowka.getScheduleState(probe);
            
            const lowerTitle = (state.title || '').toLowerCase();
            const lowerDesc = (state.desc || '').toLowerCase();
            const lowerNext = (state.next?.title || '').toLowerCase();
            const lowerThird = (state.third?.title || '').toLowerCase();

            assert.equal(lowerTitle.includes('szabat'), false, `Title at ${probe.toISOString()} contains forbidden word`);
            assert.equal(lowerDesc.includes('szabat'), false, `Desc at ${probe.toISOString()} contains forbidden word`);
            assert.equal(lowerNext.includes('szabat'), false, `Next title at ${probe.toISOString()} contains forbidden word`);
            assert.equal(lowerThird.includes('szabat'), false, `Third title at ${probe.toISOString()} contains forbidden word`);
        }
    }
});

test('cc-ramowka: cinema exclusion rule — kino-live.html must NEVER appear in schedule', () => {
    const startDate = new Date(2026, 9, 26, 0, 0);
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const probe = new Date(startDate.getTime() + (day * 24 + hour) * 3600000);
            const state = ramowka.getScheduleState(probe);
            assert.equal(state.channel.includes('kino-live'), false, `Channel at ${probe.toISOString()} must not be kino-live`);
        }
    }
});

test('cc-ramowka: getDaySchedule returns full contiguous slots for day', () => {
    const today = new Date(2026, 9, 27);
    const daySched = ramowka.getDaySchedule(today);
    assert.ok(Array.isArray(daySched), 'Should return array');
    assert.ok(daySched.length >= 10, 'Should have at least 10 schedule items');
    assert.ok(daySched[0].timeStart && daySched[0].title, 'Items must have timeStart and title');
});
