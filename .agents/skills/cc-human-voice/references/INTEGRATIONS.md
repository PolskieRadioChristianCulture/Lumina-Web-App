# Integracje i odpowiedzialności

## Architektura
CMS/RSS/API EkoCC + kalendarz @004 + potwierdzone logi emisji => adapter read-only => normalizacja `events.json` => silnik selekcji => Antigravity (redakcja) => kolejka zatwierdzeń @005 / operator => oficjalne adaptery publikujące => potwierdzenie + historia.

Agent @077: strategia tonu, priorytety i przegląd jakości. @005: rejestr zgłoszeń, approval routing, audyt. @004: aktualny kalendarz i strefy czasowe. @777: standard nadrzędny, nie działający agent wykonawczy. Współpraca musi być sprawdzona w realnym środowisku, nie zakładaj aktywnej integracji.

## Minimalny schemat wydarzenia
`event_id` (unikalny), `title`, `summary`, `category`, `status` (`scheduled|live|published|cancelled`), `starts_at` ISO8601 ze strefą, `verified_at` ISO8601 ze strefą, `source_url`, `audience`, `priority` (0..5), `channels` (lista), `significance` (krótki, sprawdzalny powód). Link źródłowy musi rzeczywiście potwierdzać informację. `source_url` nie oznacza automatycznie linku do publikacji.

## Kanały
WhatsApp: sprawdzić dostępność *oficjalnego i zgodnego z zasadami* sposobu publikowania do Channels; interfejs biznesowych wiadomości nie oznacza automatycznie API kanałów. Jeśli brak, eksport do ręcznego wklejenia. Facebook: wyłącznie oficjalne API uprawnionej strony/konta z właściwymi tokenami. X: tylko dostępny, zatwierdzony oficjalny interfejs z uwzględnieniem aktualnych limitów i ewentualnych kosztów. ZERO COST oznacza brak zależności od odpłatnej usługi — jeśli publikacja bez API jest niewykonalna, wyprodukuj ręczną kolejkę zamiast obchodzić zabezpieczenia platformy.

## Adaptacja EkoCC
Adresy strumieni, kanałów oraz domen weryfikować przed użyciem. Nigdy nie zakładać, że repozytorium ma dostęp do konkretnego CMS, kont społecznościowych czy kalendarza.

## Dane i bezpieczeństwo
Tokeny w sekretnym magazynie runtime, nie w Git ani w promptach. Dla webhooków podpisy, whitelisty domen, timeout, idempotency key i backoff. Respektuj robots/ToS. Dane osobowe minimalizować. Loguj ID, kanał, timestamp, status i operatora, bez zbędnych danych osobowych.

## Rozwój
1. Adaptery read-only + testy kontraktowe. 2. Panel zatwierdzania. 3. Eksport do ręcznego publikowania. 4. Opcjonalne oficjalne API po audycie kosztów, uprawnień i zgodności.
