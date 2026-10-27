#!/usr/bin/env node
// Dzień 27 (27.10.2026): wpis do rozwazania_baza.json (kanały nadawcze + wszystkie mirrory) i plik danych dla zapisu Firestore.
// Teksty dosłownie z pakietu L0 (wersje 1, 2 i 4).
import fs from 'node:fs';
import path from 'node:path';

const [src, outJson] = process.argv.slice(2);
const md = fs.readFileSync(src, 'utf8').split('\r\n').join('\n');
const section = (startMarker, endMarker) => {
  const i = md.indexOf(startMarker); const j = md.indexOf(endMarker, i);
  if (i < 0 || j < 0) throw new Error('Brak sekcji ' + startMarker);
  return md.slice(md.indexOf('\n', md.indexOf('\n', i) + 1) + 1, j).replace(/^#?\s*=+\n/m, '').replace(/\n#?\s*=+\s*$/, '').trim();
};
const fullText = section('WERSJA 1: ROZWAŻANIE PORANNE', '# ====================================================================\nWERSJA 2');
const contentWeb = section('WERSJA 2: ROZWAŻANIE NA CAŁY DZIEŃ', '# ====================================================================\nWERSJA 3');
const tvScript = section('WERSJA 4: ROZWAŻANIE TELEWIZYJNE', '# ====================================================================\nWERSJA 5').replace(/\\\[/g, '[').replace(/\\\]/g, ']');

const day27 = {
  id: 'ref_day27_2026-10-27',
  day: 27,
  date: '2026-10-27',
  dayOfWeek: 'Wtorek',
  title: '☀️ Z Biblią za Pan Brat — Dzień 27: Gdy przeszłość wraca — Bracia Józefa',
  teaser: 'Dzień 27 — Gdy przeszłość wraca — Bracia Józefa: Przebudzenie sumienia i odpowiedzialność Judy (Rdz 42:1–43:34)',
  contentWeb,
  fullText,
  tvScript,
  imageUrl: 'https://polskieradio.cc/images/academy/daily/kc_day_27_gdy_przeszlosc_wraca_bracia_jozefa.jpg',
  authorName: 'Cezary Rogowski',
  authorUid: 'admin',
  authorSlug: 'cezaryrgowski',
};
if (!fullText.startsWith('☀️ Z Biblią za Pan Brat — Dzień Dwudziesty Siódmy') || !contentWeb.startsWith('☀️ Z Biblią za Pan Brat — Dzień 27')) {
  throw new Error('Nieoczekiwany początek wersji 1/2');
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
const pIdx = primaryData.findIndex((x) => x.id === day27.id);
if (pIdx >= 0) primaryData[pIdx] = day27; else primaryData.unshift(day27);
const cleanJson = JSON.stringify(primaryData, null, 2) + '\n';

for (const bp of jsonPaths) {
  try {
    if (!fs.existsSync(bp)) continue;
    const data = JSON.parse(fs.readFileSync(bp, 'utf8'));
    if (!Array.isArray(data)) continue;
    const idx = data.findIndex((x) => x.id === day27.id);
    if (idx >= 0) data[idx] = day27; else data.unshift(day27);
    fs.writeFileSync(bp, JSON.stringify(data, null, 2) + '\n');
    console.log('Zaktualizowano:', bp);
  } catch (e) {
    fs.writeFileSync(bp, cleanJson);
    console.log('Naprawiono i zaktualizowano z głównej bazy:', bp);
  }
}

// Dopisanie do rozwazania_baza.md w Wektor1_VideoFactory
const mdBaza = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/rozwazania_baza.md';
if (fs.existsSync(mdBaza)) {
  const curMd = fs.readFileSync(mdBaza, 'utf8');
  if (!curMd.includes('Dzień 27: Gdy przeszłość wraca — Bracia Józefa')) {
    const appendText = `\n\n---\n\nDzień 27 (27 października 2026): Gdy przeszłość wraca — Bracia Józefa (Rdz 42:1–43:34)\n\n` +
      `Wersja 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)\n\n${fullText}\n\n---\n\n` +
      `Wersja 2: ROZWAŻANIE NA CAŁY DZIEŃ (polskieradio.cc / cclite.pl)\n\n${contentWeb}\n\n---\n\n` +
      `Wersja 4: ROZWAŻANIE TELEWIZYJNE (Christian Culture TV — Noemi i Sara)\n\n${tvScript}\n`;
    fs.appendFileSync(mdBaza, appendText, 'utf8');
    console.log('Dopisano Dzień 27 do rozwazania_baza.md');
  }
}

fs.writeFileSync(outJson, JSON.stringify(day27, null, 2));
console.log('Gotowe: wersja 1:', fullText.length, 'znaków | wersja 2:', contentWeb.length, 'znaków | wersja 4:', tvScript.length, 'znaków');
