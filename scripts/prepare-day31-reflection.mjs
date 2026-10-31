#!/usr/bin/env node
// Dzień 31 (31.10.2026): wpis do rozwazania_baza.json (kanały nadawcze + wszystkie mirrory) i plik danych dla zapisu Firestore.
import fs from 'node:fs';

const src = 'scripts/content/pakiet-day31-5wersji.md';
const md = fs.readFileSync(src, 'utf8').split('\r\n').join('\n');
const section = (startMarker, endMarker) => {
  const i = md.indexOf(startMarker); const j = md.indexOf(endMarker, i);
  if (i < 0 || j < 0) throw new Error('Brak sekcji ' + startMarker);
  return md.slice(md.indexOf('\n', md.indexOf('\n', i) + 1) + 1, j).replace(/^#?\s*=+\n/m, '').replace(/\n#?\s*=+\s*$/, '').trim();
};
const fullText = section('WERSJA 1: ROZWAŻANIE PORANNE', '====================================================================\nWERSJA 2');
const contentWeb = section('WERSJA 2: ROZWAŻANIE NA CAŁY DZIEŃ', '====================================================================\nWERSJA 3');
const tvScript = section('WERSJA 4: ROZWAŻANIE TELEWIZYJNE', '====================================================================\nWERSJA 5').replace(/\\\[/g, '[').replace(/\\\]/g, ']');

const day31 = {
  id: 'ref_day31_2026-10-31',
  day: 31,
  date: '2026-10-31',
  dayOfWeek: 'Sobota',
  title: '☀️ Z Biblią za Pan Brat — Dzień 31: Bóg obrócił to w dobro — Ewangelia Opatrzności',
  teaser: 'Dzień 31 — Bóg obrócił to w dobro: Finał Księgi Rodzaju, pochówek Jakuba w Kanaanie, lęk braci przed zemstą, wyznanie Bożej Opatrzności i kości Józefa (Rdz 50:1–26)',
  contentWeb,
  fullText,
  tvScript,
  imageUrl: 'https://polskieradio.cc/images/academy/daily/kc_day_31_bog_obrocil_to_w_dobro.jpg',
  authorName: 'Cezary Rogowski',
  authorUid: 'admin',
  authorSlug: 'cezaryrgowski',
};

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
const pIdx = primaryData.findIndex((x) => x.id === day31.id);
if (pIdx >= 0) primaryData[pIdx] = day31; else primaryData.unshift(day31);
const cleanJson = JSON.stringify(primaryData, null, 2) + '\n';

for (const bp of jsonPaths) {
  try {
    if (!fs.existsSync(bp)) continue;
    const data = JSON.parse(fs.readFileSync(bp, 'utf8'));
    if (!Array.isArray(data)) continue;
    const idx = data.findIndex((x) => x.id === day31.id);
    if (idx >= 0) data[idx] = day31; else data.unshift(day31);
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
  if (!curMd.includes('Dzień 31 (31 października 2026): Bóg obrócił to w dobro')) {
    const appendText = `\n\n---\n\nDzień 31 (31 października 2026): Bóg obrócił to w dobro — Ewangelia Opatrzności (Rdz 50:1–26)\n\n` +
      `Wersja 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)\n\n${fullText}\n\n---\n\n` +
      `Wersja 2: ROZWAŻANIE NA CAŁY DZIEŃ (polskieradio.cc / cclite.pl)\n\n${contentWeb}\n\n---\n\n` +
      `Wersja 4: ROZWAŻANIE TELEWIZYJNE (Christian Culture TV — Noemi i Sara)\n\n${tvScript}\n`;
    fs.appendFileSync(mdBaza, appendText, 'utf8');
    console.log('Dopisano Dzień 31 do rozwazania_baza.md');
  }
}

console.log('Gotowe Dzień 31: wersja 1:', fullText.length, 'znaków | wersja 2:', contentWeb.length, 'znaków | wersja 4:', tvScript.length, 'znaków');
