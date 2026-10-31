import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoomProfile } from './zaczepki_catalog.mjs';
import { isQuietHours } from './zaczepki_dispatcher.mjs';
import { generateZaczepka, getPolishGreeting } from './zaczepki_generator.mjs';

test('Zaczepki Generator: precyzyjne powitania wg zachodu słońca w Polsce', () => {
  // 31 października o 17:00 (po zachodzie słońca w Polsce) -> Wieczór!
  const autumnEvening = new Date(2026, 9, 31, 17, 0);
  const greeting1 = getPolishGreeting(autumnEvening);
  assert.match(greeting1, /wieczór|wieczoru/i, 'O 17:00 po zachodzie słońca w październiku musi być wieczór');
  assert.doesNotMatch(greeting1, /popołudnia/i, 'Nigdy nie może być "popołudnia" po zmroku');

  // 15 listopada o 16:30 (po zachodzie słońca w Polsce) -> Wieczór!
  const winterEvening = new Date(2026, 10, 15, 16, 30);
  const greeting2 = getPolishGreeting(winterEvening);
  assert.match(greeting2, /wieczór|wieczoru/i, 'W listopadzie o 16:30 musi być wieczór');

  // 15 lipca o 17:00 (w lecie jest jeszcze jasno przed zachodem) -> Popołudnie
  const summerAfternoon = new Date(2026, 6, 15, 17, 0);
  const greeting3 = getPolishGreeting(summerAfternoon);
  assert.match(greeting3, /popołudnia/i, 'W lipcu o 17:00 jest jeszcze popołudnie');

  // Rano o 08:30 -> Dzień dobry
  const morning = new Date(2026, 9, 31, 8, 30);
  assert.match(getPolishGreeting(morning), /Dzień dobry/i);
});

test('Zaczepki Catalog: poprawnie mapuje tematykę pokojów', () => {
  const biznes = resolveRoomProfile('Chrześcijanin w Biznesie');
  assert.equal(biznes.category, 'biznes_i_finanse');
  assert.match(biznes.recommendedUrl, /news/);

  const rodzina = resolveRoomProfile('Tata i Mama - Chrześcijańscy Rodzice');
  assert.equal(rodzina.category, 'rodzina_i_dom');
  assert.match(rodzina.recommendedUrl, /cyfrowy-detoks/);

  const zdrowie = resolveRoomProfile('Biblijne Zasady Zdrowia');
  assert.equal(zdrowie.category, 'zdrowie_i_cialo');

  const modlitwa = resolveRoomProfile('Jeśli chcesz, pomodlę się o Ciebie');
  assert.equal(modlitwa.category, 'modlitwa_i_wstawiennictwo');

  const uwielbienie = resolveRoomProfile('Worship Christian Culture');
  assert.equal(uwielbienie.category, 'uwielbienie_i_muzyka');
});

test('Zaczepki Dispatcher: precyzyjna kontrola ciszy nocnej (22:00 - 07:30)', () => {
  // Noc: 23:15
  const night1 = new Date(2026, 9, 30, 23, 15);
  assert.equal(isQuietHours(night1), true, '23:15 to cisza nocna');

  // Noc: 03:00
  const night2 = new Date(2026, 9, 30, 3, 0);
  assert.equal(isQuietHours(night2), true, '03:00 to cisza nocna');

  // Noc: 07:15
  const night3 = new Date(2026, 9, 30, 7, 15);
  assert.equal(isQuietHours(night3), true, '07:15 to cisza nocna');

  // Dzień: 08:00
  const day1 = new Date(2026, 9, 30, 8, 0);
  assert.equal(isQuietHours(day1), false, '08:00 to okno aktywne');

  // Dzień: 14:30
  const day2 = new Date(2026, 9, 30, 14, 30);
  assert.equal(isQuietHours(day2), false, '14:30 to okno aktywne');

  // Dzień: 21:00
  const day3 = new Date(2026, 9, 30, 21, 0);
  assert.equal(isQuietHours(day3), false, '21:00 to okno aktywne');
});

test('Zaczepki Generator: generuje poprawny format z linkiem wsparcia/patronatu i dedykowaną grafiką', async () => {
  const result = await generateZaczepka('Buduj Swoją Wiarę', 11);
  assert.ok(result.text, 'Treść zaczepki nie może być pusta');
  assert.match(result.text, /polskieradio\.cc/i, 'Musi zawierać link do ekosystemu');
  assert.match(result.text, /wspieraj|biblia-audio/i, 'Musi promować akcję Wspieram To lub patronat Biblii Audio');
  assert.ok(result.text.length > 50, 'Zaczepka musi być pełnym wpisem');
  assert.ok(result.mediaPath, 'Zaczepka musi posiadać przypisaną dedykowaną ścieżkę do grafiki');
});
