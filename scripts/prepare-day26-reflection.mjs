#!/usr/bin/env node
// Dzień 26 (26.10.2026): wpis do rozwazania_baza.json (kanały nadawcze) i plik danych dla zapisu Firestore.
// Teksty dosłownie z pakietu L0 z_bibli_za_pan_brat_dzie_26_26_10_2026_pakiet_5_wersji.md (wersje 1, 2 i 4).
// Użycie: node scripts/prepare-day26-reflection.mjs <ścieżka do pakietu .md> <plik wyjściowy JSON dla Firestore>
import fs from 'node:fs';

const [src, outJson] = process.argv.slice(2);
const md = fs.readFileSync(src, 'utf8').split('\r\n').join('\n');
const section = (startMarker, endMarker) => {
  const i = md.indexOf(startMarker); const j = md.indexOf(endMarker, i);
  if (i < 0 || j < 0) throw new Error('Brak sekcji ' + startMarker);
  return md.slice(md.indexOf('\n', md.indexOf('\n', i) + 1) + 1, j).replace(/^=+\n/m, '').replace(/\n=+\s*$/, '').trim();
};
const fullText = section('WERSJA 1: ROZWAŻANIE PORANNE', '====================================================================\nWERSJA 2');
const contentWeb = section('WERSJA 2: ROZWAŻANIE NA CAŁY DZIEŃ', '====================================================================\nWERSJA 3');
// Wersja 4 (Noemi i Sara) — czytana przez czat kanałów nadawczych (cc-tv-dialogue.js, lumi-live-rooms.js) z pola tvScript.
const tvScript = section('WERSJA 4: ROZWAŻANIE TELEWIZYJNE', '====================================================================\nWERSJA 5');

const day26 = {
  id: 'ref_day26_2026-10-26',
  day: 26,
  date: '2026-10-26',
  dayOfWeek: 'Poniedziałek',
  title: '☀️ Z Biblią za Pan Brat — Dzień 26: Od więzienia do pałacu',
  teaser: 'Dzień 26 — Od więzienia do pałacu: Józef zapomniany w więzieniu, sny faraona i Boża opatrzność (Rdz 40:1–41:57)',
  contentWeb,
  fullText,
  tvScript,
  imageUrl: 'https://polskieradio.cc/images/academy/daily/kc_day_26_jozef_od_wiezienia_do_palacu.jpg',
  authorName: 'Cezary Rogowski',
  authorUid: 'admin',
  authorSlug: 'cezaryrgowski',
};
if (!fullText.startsWith('☀️ Z Biblią za Pan Brat — Dzień Dwudziesty Szósty') || !contentWeb.startsWith('☀️ Z Biblią za Pan Brat — Dzień 26')) throw new Error('Nieoczekiwany początek wersji 1/2');

const basePath = 'rozwazania_baza.json';
const data = JSON.parse(fs.readFileSync(basePath, 'utf8'));
const idx = data.findIndex((x) => x.id === day26.id);
if (idx >= 0) data[idx] = day26; else data.unshift(day26);
fs.writeFileSync(basePath, JSON.stringify(data, null, 2) + '\n');
fs.writeFileSync(outJson, JSON.stringify(day26, null, 2));
console.log('rozwazania_baza.json: Dzień 26 na pozycji', data.findIndex((x) => x.id === day26.id), '| wersja 1:', fullText.length, 'znaków | wersja 2:', contentWeb.length, 'znaków | wersja 4:', tvScript.length, 'znaków');
