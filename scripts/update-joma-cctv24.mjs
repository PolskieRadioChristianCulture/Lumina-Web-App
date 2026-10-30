import fs from 'fs';

const entry = `## 2026-10-25 11:40 — Kanały Nadawcze TV LIVE: Aktualizacja Rozważania Dnia 25 (2026-10-25) na CCTV24 | PROD LIVE ✅
Antigravity (@A001): Usunięto brak rozważania na kanale nadawczym cctv24 (https://polskieradio.cc/cctv24):
1. **Przyczyna:** W pliku rozwazania_baza.json brakowało wpisu dla dzisiejszej daty (2026-10-25). Kanał cctv24 pobiera bazę i dopasowuje datę dzisiejszą (foundIdx); przy braku wpisu cofał się do dnia poprzedniego.
2. **Rozwiązanie:** Dodano pełne rozważanie Dnia 25 („Józef w domu Potifara i w więzieniu — A Pan był z nim”, Rdz 38:1–39:23) do rozwazania_baza.json we wszystkich 6 instancjach ekosystemu oraz do bazy tekstowej rozwazania_baza.md (Dni 23, 24, 25).
3. **Wdrożenie:** Zbudowano .pages-release, wykonano podwójny push Git (4dd16bff) i deploy na Cloudflare Pages. Live feed zweryfikowany: 2026-10-25 aktywny na produkcji.

`;

const p1 = 'C:\\Users\\czark\\Desktop\\Misja CC\\JOMA_SHARED_MEMORY\\JOMA_STATUS.md';
if (fs.existsSync(p1)) {
  let c1 = fs.readFileSync(p1, 'utf8');
  c1 = c1.replace('# JOMA STATUS — Protokół Wspólnej Pamięci\n\n', '# JOMA STATUS — Protokół Wspólnej Pamięci\n\n' + entry);
  fs.writeFileSync(p1, c1, 'utf8');
}

const p2 = 'C:\\Users\\czark\\Desktop\\Misja CC\\JOMA_SHARED_MEMORY\\JOMA_HANDOFFS.md';
if (fs.existsSync(p2)) {
  let c2 = fs.readFileSync(p2, 'utf8');
  c2 = c2.replace('# JOMA HANDOFFS — Raporty Przekazania Prac\n\n', '# JOMA HANDOFFS — Raporty Przekazania Prac\n\n' + entry);
  fs.writeFileSync(p2, c2, 'utf8');
}

console.log('✅ JOMA STATUS i HANDOFFS zaktualizowane.');
