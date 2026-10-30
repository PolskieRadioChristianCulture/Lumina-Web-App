import test from 'node:test';
import assert from 'node:assert/strict';
import { HOOKS_BY_CATEGORY, mapGroupToCategory, formatHookMessage } from './hooks_catalog.mjs';
import { isNightQuietHours } from './whatsapp-hooks-runner.mjs';

test('WhatsApp Hooks: Poprawne mapowanie kategorii pokoi', () => {
  assert.equal(mapGroupToCategory('Tata i Mama - Chrześcijańscy Rodzice'), 'rodzina');
  assert.equal(mapGroupToCategory('Chrześcijański Dom'), 'rodzina');
  assert.equal(mapGroupToCategory('Biblijne Zasady Zdrowia'), 'zdrowie');
  assert.equal(mapGroupToCategory('Chrześcijanin w Biznesie'), 'biznes');
  assert.equal(mapGroupToCategory('Kobieta w Bożym Stylu'), 'kobiety');
  assert.equal(mapGroupToCategory('Mężczyzna w Bożym Stylu'), 'mezczyzni');
  assert.equal(mapGroupToCategory('Chrześcijański Singiel'), 'single');
  assert.equal(mapGroupToCategory('Worship Christian Culture'), 'worship');
  assert.equal(mapGroupToCategory('Muzyka Miłości'), 'worship');
  assert.equal(mapGroupToCategory('Chwała Panu'), 'worship');
  assert.equal(mapGroupToCategory('Cuda Każdego Dnia'), 'modlitwa');
  assert.equal(mapGroupToCategory('Jeśli chcesz, pomodlę się o Ciebie'), 'modlitwa');
  assert.equal(mapGroupToCategory('Buduj Swoją Wiarę'), 'studium');
  assert.equal(mapGroupToCategory('Spotkania z Biblią'), 'studium');
  assert.equal(mapGroupToCategory('Werset Dnia - CC Network'), 'studium');
  assert.equal(mapGroupToCategory('Klub Christian Culture'), 'ogolne');
});

test('WhatsApp Hooks: Formatowanie zaczepki zawiera wszystkie obowiązkowe elementy', () => {
  const hook = HOOKS_BY_CATEGORY.rodzina[0];
  const msg = formatHookMessage(hook, 'Chrześcijański Dom');

  assert.ok(msg.includes('SŁOWO DO POKOJU: CHRZEŚCIJAŃSKI DOM'), 'musi zawierać nagłówek pokoju');
  assert.ok(msg.includes(hook.question), 'musi zawierać pytanie angażujące');
  assert.ok(msg.includes('UBG'), 'musi cytować dosłowny przekład UBG');
  assert.ok(msg.includes(hook.cta), 'musi zawierać CTA do ekosystemu');
  assert.ok(msg.includes('https://polskieradio.cc/wspieraj'), 'musi zawierać link do Wspieram To');
});

test('WhatsApp Hooks: Weryfikacja ciszy nocnej (22:00 - 06:30 czasu polskiego)', () => {
  // Stwórz daty w UTC odpowiadające różnym godzinom w Warszawie (CET = UTC+1 w zimie, CEST = UTC+2 w lecie)
  // 30 października 2026 to czas zimowy CET (UTC+1)
  
  // 23:15 w Warszawie -> 22:15 UTC -> cisza nocna aktywna
  const nightTime1 = new Date('2026-10-30T22:15:00Z');
  assert.equal(isNightQuietHours(nightTime1).active, true, '23:15 w Warszawie to cisza nocna');

  // 03:00 w Warszawie -> 02:00 UTC -> cisza nocna aktywna
  const nightTime2 = new Date('2026-10-30T02:00:00Z');
  assert.equal(isNightQuietHours(nightTime2).active, true, '03:00 w Warszawie to cisza nocna');

  // 06:15 w Warszawie -> 05:15 UTC -> cisza nocna aktywna
  const nightTime3 = new Date('2026-10-30T05:15:00Z');
  assert.equal(isNightQuietHours(nightTime3).active, true, '06:15 w Warszawie to cisza nocna');

  // 07:00 w Warszawie -> 06:00 UTC -> cisza nocna NIEAKTYWNA
  const dayTime1 = new Date('2026-10-30T06:00:00Z');
  assert.equal(isNightQuietHours(dayTime1).active, false, '07:00 w Warszawie to dzień');

  // 14:30 w Warszawie -> 13:30 UTC -> cisza nocna NIEAKTYWNA
  const dayTime2 = new Date('2026-10-30T13:30:00Z');
  assert.equal(isNightQuietHours(dayTime2).active, false, '14:30 w Warszawie to dzień');

  // 21:45 w Warszawie -> 20:45 UTC -> cisza nocna NIEAKTYWNA
  const dayTime3 = new Date('2026-10-30T20:45:00Z');
  assert.equal(isNightQuietHours(dayTime3).active, false, '21:45 w Warszawie to jeszcze dzień');
});
