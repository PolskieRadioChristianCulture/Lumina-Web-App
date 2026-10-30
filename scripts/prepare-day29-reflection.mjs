#!/usr/bin/env node
// Dzień 29 (29.10.2026): wpis do rozwazania_baza.json (kanały nadawcze + wszystkie mirrory) i plik danych dla zapisu Firestore.
// Teksty dosłownie z pakietu L0 (wersje 1, 2 i 4).
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

const day29 = {
  id: 'ref_day29_2026-10-29',
  day: 29,
  date: '2026-10-29',
  dayOfWeek: 'Czwartek',
  title: '☀️ Z Biblią za Pan Brat — Dzień 29: Bóg prowadzi swój lud do Egiptu',
  teaser: 'Dzień 29 — Bóg prowadzi swój lud do Egiptu: Teofania w Beer-Szebie, spotkanie w Goszen i mądrość w czasie głodu (Rdz 46:1–47:31)',
  contentWeb,
  fullText,
  tvScript,
  imageUrl: 'https://polskieradio.cc/images/academy/daily/kc_day_29_bog_prowadzi_swoj_lud_do_egiptu.jpg',
  authorName: 'Cezary Rogowski',
  authorUid: 'admin',
  authorSlug: 'cezaryrgowski',
};
if (!fullText.startsWith('☀️ Z Biblią za Pan Brat — Dzień Dwudziesty Dziewiąty') && !fullText.startsWith('Z Biblią za Pan Brat — Dzień Dwudziesty Dziewiąty')) {
  throw new Error('Nieoczekiwany początek wersji 1');
}
if (!contentWeb.startsWith('☀️ Z Biblią za Pan Brat — Dzień 29')) {
  throw new Error('Nieoczekiwany początek wersji 2');
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
const pIdx = primaryData.findIndex((x) => x.id === day29.id);
if (pIdx >= 0) primaryData[pIdx] = day29; else primaryData.unshift(day29);
const cleanJson = JSON.stringify(primaryData, null, 2) + '\n';

for (const bp of jsonPaths) {
  try {
    if (!fs.existsSync(bp)) continue;
    const data = JSON.parse(fs.readFileSync(bp, 'utf8'));
    if (!Array.isArray(data)) continue;
    const idx = data.findIndex((x) => x.id === day29.id);
    if (idx >= 0) data[idx] = day29; else data.unshift(day29);
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
  if (!curMd.includes('Dzień 29 (29 października 2026): Bóg prowadzi swój lud do Egiptu')) {
    const appendText = `\n\n---\n\nDzień 29 (29 października 2026): Bóg prowadzi swój lud do Egiptu (Rdz 46:1–47:31)\n\n` +
      `Wersja 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)\n\n${fullText}\n\n---\n\n` +
      `Wersja 2: ROZWAŻANIE NA CAŁY DZIEŃ (polskieradio.cc / cclite.pl)\n\n${contentWeb}\n\n---\n\n` +
      `Wersja 4: ROZWAŻANIE TELEWIZYJNE (Christian Culture TV — Noemi i Sara)\n\n${tvScript}\n`;
    fs.appendFileSync(mdBaza, appendText, 'utf8');
    console.log('Dopisano Dzień 29 do rozwazania_baza.md');
  }
}

fs.writeFileSync(outJson, JSON.stringify(day29, null, 2));
console.log('Gotowe: wersja 1:', fullText.length, 'znaków | wersja 2:', contentWeb.length, 'znaków | wersja 4:', tvScript.length, 'znaków');
