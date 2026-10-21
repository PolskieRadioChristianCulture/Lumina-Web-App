# EkoCC v2 PREMIUM — MAPA USŁUG I INFRASTRUKTURY (INVENTORY.md)

**Ekosystem Christian Culture** — Pełna inwentaryzacja zasobów cyfrowych (stan na 21.10.2026).

---

## 1. Repozytoria Kodu Źródłowego
| Repozytorium GitHub | Ścieżka Lokalna | Rola / Opis | Status CI/CD |
|---|---|---|---|
| `PolskieRadioChristianCulture/Strona-www-Christian-Culture` | `C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc` | Główny portal www, radio, CCN News, Akademia, VOD, Player | Cloudflare Pages (Auto Deploy z `main`) |
| `PolskieRadioChristianCulture/Lumina-Web-App` | `C:\Users\czark\Desktop\@ICC\LUMINA` / mirror remote w `polskieradio.cc` | Portal społecznościowy LUMINA, LUMI Messenger, profile | Mirror produkcyjny Cloudflare Pages |
| `PolskieRadioChristianCulture/CCMC24-7` | `C:\Users\czark\Christian_Culture_Projekty\CCMC24-7` | Mission Control Bridge, Mobile Memory, Event Bus | Node.js / Local & Worker Bridge |
| `PolskieRadioChristianCulture/Repozytoria-CC` | `C:\Users\czark\Christian_Culture_Projekty\Repozytoria-CC-clone` | Centralny Rejestr 777, Skrzynka Misji, dyspozytor @005, dokumentacja | GitHub Actions (`agent-dispatcher.yml`) |
| Aplikacja Android „Dobrze, że jesteś” | `C:\Users\czark\Desktop\Aplikacje na Android\Cuda Kadego Dnia` | Aplikacja mobilna rozważań codziennych (dawniej CKD) | Firebase `cuda-398c0` |
| Mission Control Android | `C:\Users\czark\Desktop\Aplikacje na Android\Mission Control\mission-control` | Prywatna aplikacja mobilna Dowódcy Nazira | Firebase `cc-mission-control` |

---

## 2. Platformy Hostingowe i Chmurowe (ZERO COST)
| Usługa | Zastosowanie | Projekt / Domena | Limit / Koszt |
|---|---|---|---|
| **Cloudflare Pages** | Hosting statyczny frontendu, SSR/Edge functions | `polskieradio.cc`, `polskieradio.pages.dev` | Plan Free (0.00 PLN) |
| **Cloudflare Workers & KV** | Idempotencja zleceń, proxy wiadomości | `notion-slack-bridge`, `lumi-agent-mailbox` | Plan Free (100k req/day) |
| **Firebase Firestore** | Dane rozważań codziennych i telemetria | `cuda-398c0` (public), `cc-mission-control` (private) | Spark Plan Free (0.00 PLN) |
| **GitHub Actions** | CI/CD, testy regresji, dyspozytor @005 | Wszystkie repozytoria organizacji | Free tier (2000 min/mc prywatne, nielimitowane publiczne) |

---

## 3. Moduły i Serwisy Użytkownika Końcowego
1. **Radio Christian Culture & Scena LIVE:**
   - Odtwarzacz Spotify-style (`/player`), Radio 24/7 (`stream-scene.html`, `cctv24-worship.html` — stan zamrożony).
2. **CCN News (Christian Culture Network):**
   - Portale tematyczne: `/news`, `/nauka`, `/historia`, `/biologia`, `/prawo`, `/seks`.
3. **LUMINA Społeczność:**
   - Tablica społeczności (`/lumina-tablica`), profile użytkowników (`lumina.mariusz.html`, `lumina.cezaryrgowski.html`, etc.).
4. **LUMI Messenger & LUMI KIDS:**
   - Bezpieczny komunikator (`/mess`), dedykowany Pokój Rodzinny Rogowskich.
5. **Akademia Biblijna & Kurs Codzienny:**
   - Lekcje dzienne z Clean Routing (`/akademia/kurscodzienny/dzien-XX`).
6. **MojaBiblia:**
   - Biblia interlinearna, kody Stronga, przekłady UBG/BW/BT/BG (`/mojabiblia`).
7. **Kino VOD:**
   - Baza filmów chrześcijańskich, zwiastuny, integracje (`/vod`).
