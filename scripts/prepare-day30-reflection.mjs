#!/usr/bin/env node
// Dzień 30 (30.10.2026): wpis do rozwazania_baza.json (kanały nadawcze + wszystkie mirrory) i plik danych dla zapisu Firestore.
import fs from 'node:fs';

const [src, outJson] = process.argv.slice(2);
const md = fs.readFileSync(src, 'utf8').split('\r\n').join('\n');
const section = (startMarker, endMarker) => {
  const i = md.indexOf(startMarker); const j = md.indexOf(endMarker, i);
  if (i < 0 || j < 0) throw new Error('Brak sekcji ' + startMarker);
  return md.slice(md.indexOf('\n', md.indexOf('\n', i) + 1) + 1, j).replace(/^#?\s*=+\n/m, '').replace(/\n#?\s*=+\s*$/, '').trim();
};
const fullText = section('WERSJA 1: ROZWAŻANIE PORANNE', '====================================================================\nWERSJA 2');
const contentWeb = section('WERSJA 2: ROZWAŻANIE NA CAŁY DZIEŃ', '====================================================================\nWERSJA 3');
const tvScript = section('WERSJA 4: ROZWAŻANIE TELEWIZYJNE', '====================================================================\nWERSJA 5').replace(/\\\[/g, '[').replace(/\\\]/g, ']');

const day30 = {
  id: 'ref_day30_2026-10-30',
  day: 30,
  date: '2026-10-30',
  dayOfWeek: 'Piątek',
  title: '☀️ Z Biblią za Pan Brat — Dzień 30: Błogosławieństwo, obietnica i Lew z Judy',
  teaser: 'Dzień 30 — Błogosławieństwo, obietnica i Lew z Judy: Ostatnie słowa Jakuba, skrzyżowane ręce nad Efraimem i Manassesem oraz proroctwo o berle Judy (Rdz 48:1–49:33)',
  contentWeb,
  fullText,
  tvScript,
  imageUrl: 'https://polskieradio.cc/images/academy/daily/kc_day_30_blogoslawienstwo_obietnica_i_lew_z_judy.jpg',
  authorName: 'Cezary Rogowski',
  authorUid: 'admin',
  authorSlug: 'cezaryrgowski',
};

if (!fullText.startsWith('Z Biblią za Pan Brat — Dzień Trzydziesty') && !fullText.startsWith('☀️ Z Biblią za Pan Brat — Dzień Trzydziesty')) {
  throw new Error('Nieoczekiwany początek wersji 1: ' + fullText.substring(0, 50));
}
if (!contentWeb.startsWith('☀️ Z Biblią za Pan Brat — Dzień 30') && !contentWeb.startsWith('Z Biblią za Pan Brat — Dzień 30')) {
  throw new Error('Nieoczekiwany początek wersji 2: ' + contentWeb.substring(0, 50));
}

const jsonPaths = [
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/rozwazania_baza.json',
  'C:/Users/czark/Desktop/@ICC/LUMINA/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/rozwazania_cuda_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/public/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/dist/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/Christian-Culture-Web-App/public/rozwazania_baza.json',
];

const primaryPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/rozwazania_baza.json';
const primaryData = JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
const pIdx = primaryData.findIndex((x) => x.id === day30.id);
if (pIdx >= 0) primaryData[pIdx] = day30; else primaryData.unshift(day30);
const cleanJson = JSON.stringify(primaryData, null, 2) + '\n';

for (const bp of jsonPaths) {
  try {
    if (!fs.existsSync(bp)) continue;
    const data = JSON.parse(fs.readFileSync(bp, 'utf8'));
    if (!Array.isArray(data)) continue;
    const idx = data.findIndex((x) => x.id === day30.id);
    if (idx >= 0) data[idx] = day30; else data.unshift(day30);
    fs.writeFileSync(bp, JSON.stringify(data, null, 2) + '\n');
    console.log('Zaktualizowano:', bp);
  } catch (e) {
    fs.writeFileSync(bp, cleanJson);
    console.log('Naprawiono i zaktualizowano z głównej bazy:', bp);
  }
}

const mdBaza = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/rozwazania_baza.md';
if (fs.existsSync(mdBaza)) {
  const curMd = fs.readFileSync(mdBaza, 'utf8');
  if (!curMd.includes('Dzień 30 (30 października 2026): Błogosławieństwo, obietnica i Lew z Judy')) {
    const appendText = `\n\n---\n\nDzień 30 (30 października 2026): Błogosławieństwo, obietnica i Lew z Judy (Rdz 48:1–49:33)\n\n` +
      `Wersja 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)\n\n${fullText}\n\n---\n\n` +
      `Wersja 2: ROZWAŻANIE NA CAŁY DZIEŃ (polskieradio.cc / cclite.pl)\n\n${contentWeb}\n\n---\n\n` +
      `Wersja 4: ROZWAŻANIE TELEWIZYJNE (Christian Culture TV — Noemi i Sara)\n\n${tvScript}\n`;
    fs.appendFileSync(mdBaza, appendText, 'utf8');
    console.log('Dopisano Dzień 30 do rozwazania_baza.md');
  }
}

fs.writeFileSync(outJson, JSON.stringify(day30, null, 2));
console.log('Gotowe: wersja 1:', fullText.length, 'znaków | wersja 2:', contentWeb.length, 'znaków | wersja 4:', tvScript.length, 'znaków');
