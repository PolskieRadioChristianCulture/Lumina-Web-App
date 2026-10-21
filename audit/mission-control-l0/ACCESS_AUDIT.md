# AUDYT BEZPIECZEŃSTWA I DOSTĘPÓW: MISSION CONTROL L0 (ACCESS_AUDIT.md)

**Standard:** Zero-QA & Zero-Distraction Security Policy  
**Data audytu:** 2026-10-21  
**Audytor:** Agent @409 (Inżynier Kodu Antigravity)  
**Zakres:** Autoryzacja Prezesa L0, tokeny, ochrona przed osobami nieuprawnionymi, integracja z Firebase i Cloudflare.

---

## 1. Źródła Tożsamości i Granice Uprawnień L0
- **Tożsamość Prezesa L0:**
  - Konto: `nazirczarkes@gmail.com`
  - Weryfikacja: Firebase Authentication (wymagany `emailVerified: true`, `isAnonymous: false`).
  - Specjalny claim: `missionClaim: true` w tokenie Custom Claims.
- **Zasada Poufności Mission Control:**
  - Zgodnie z nienaruszalną regułą ekosystemu: **Mission Control jest prywatnym, ukrytym panelem Dowódcy**.
  - Żadne linki, teksty, ani referencje do „Mission Control” nie mogą pojawiać się w publicznych kanałach WWW (`polskieradio.cc`), w belkach RDS, ani w aplikacjach mobilnych użytkowników.

---

## 2. Inwentaryzacja Endpointów i Usług Mission Control
| Usługa / Endpoint | Lokalizacja | Uwierzytelnienie | Ochrona | Status |
|---|---|---|---|---|
| **Mission Control Bridge** | `CCMC24-7/bridge/src/server.mjs` | Token Bearer / Localhost MCP | Izolacja portu lokalnego | 🟢 ZWERYFIKOWANY |
| **LUMI Agent Mailbox** | Cloudflare Workers (`lumi-agent-mailbox`) | HMAC-SHA256 / Owner Token | Rate limit, Cloudflare KV idempotencja | 🟢 ZWERYFIKOWANY |
| **Firestore CommandQueue** | Firebase `cc-mission-control` | Firestore Security Rules (`request.auth.token.email == 'nazirczarkes@gmail.com'`) | Blokada odczytu/zapisu dla osób trzecich | 🟢 ZWERYFIKOWANY |
| **Pokój Dowódcy LUMI** | `/mess` (`isPersonalOwner`) | Firebase Auth (`nazirczarkes@gmail.com`) | Niewidoczny dla innych członków społeczności | 🟢 ZWERYFIKOWANY |

---

## 3. Ryzyka Bezpieczeństwa i Zastosowane Zabezpieczenia
1. **Ryzyko:** Próba podszycia się pod L0 w wywołaniach API przycisków akcji.
   - **Mitygacja:** Serwer weryfikuje podpis kryptograficzny tokenu sesyjnego i odrzuca wszelkie żądania z kont anonimowych lub innych adresów e-mail (`throw Error('agent/owner-required')`).
2. **Ryzyko:** Wielokrotne kliknięcie przycisku `ZATWIERDŹ` powodujące zdublowaną publikację lub koszty.
   - **Mitygacja:** Deterministyczny klucz idempotencji SHA-256 (`task_id` + `revision` + `created_at`). Każda kolejna próba zwraca zarejestrowany wynik bez powtórnego wykonania.
3. **Ryzyko:** Ujawnienie sekretów w logach operacyjnych kart.
   - **Mitygacja:** Karty akcji zawierają wyłącznie opisy domenowe („5 sekund”). Wszelkie klucze API i tokeny są wykluczone ze schematu `action_card`.
