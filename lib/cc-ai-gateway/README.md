# CC AI Zero Cost Gateway — Faza 1

Stan dostawy: implementacja lokalna; wszystkie flagi domyślnie OFF; brak produkcyjnego wdrożenia.

Odtworzenie 2026-10-07: źródła i oryginalne testy odzyskano z historii pracy
2026-09-30. Publiczny Pages `_worker.js` bezwarunkowo zwraca `GATEWAY_DISABLED`
dla `/api/ai` i `/api/ai/*`; nie importuje Gateway ani nie tworzy jego bindingów.
Poniższa architektura dotyczy wyłącznie osobnego, niewdrożonego koordynatora.
Testy runtime korzystają z lokalnego Miniflare i syntetycznych danych;
ich powodzenie nie jest potwierdzeniem działania produkcyjnego AI.

## Powierzchnia API

`POST /api/ai/complete`, `Content-Type: application/json`, Firebase ID token w `Authorization: Bearer …`
oraz App Check w `X-Firebase-AppCheck`. UID jest wyprowadzany z podpisanego tokenu;
obce `userId` jest odrzucane. Podpisy RS256, issuer, audience, czas i App ID są weryfikowane.
Gateway nie zmienia istniejących Firebase Auth, Custom Claims, Firestore Rules ani frontendów.
Weryfikacja unieważnienia tokenu nie jest realizowana; obowiązuje jego podpisany czas ważności.

Przykładowe ciało (bez danych prywatnych):

```json
{"prompt":"Hello","capability":"TRANSLATION","privacyClass":"PUBLIC","targetLanguage":"pl","glossary":""}
```

Obsługiwane zadania tekstowe: TEXT_GENERATION, TRANSLATION, CODING, CLASSIFICATION, ROUTING.
MCP, tools, działania zapisu, autopublikacja i klasy danych inne niż PUBLIC są odrzucane.
Nie należy przesyłać danych osobowych ani prywatnej korespondencji jako PUBLIC.
Brak komponentu doktrynalnego oznacza `theologyChecked=false`, `bibleQuotesVerified=false`;
wynik zawiera `generatedBy=AI`. Gateway nie udaje weryfikacji cytatów ani interpretacji.
Regułowy filtr prompt injection jest jedną z warstw ochrony, nie dowodem wykrywania każdego ataku.
Model nie otrzymuje sekretów ani dostępu do narzędzi; output DLP odrzuca znane sekrety i wzorce kluczy.
To zabezpieczenie dotyczy nowego `/api/ai/*`, nie wcześniejszych endpointów BYOK w `_worker.js`.

## Architektura i rejestr

Osobny `cloudflare/cc-ai-gateway/worker.js` odrzuca żądania przy wyłączonych flagach,
inaczej weryfikuje tożsamość i kieruje je do `CC_AI_SESSIONS.getByName(hash(uid, appId))`.
CcAiSession ponownie weryfikuje tokeny.
Sesja przechowuje wyłącznie licznik zapytań (30 na stałe okno minuty), nie tokeny ani treści.
Single-flight znajduje się w instancji sesji DO; nie używa globalnych obiektów Workerów.
Jest gwarantowany dla równoczesnych żądań obsługiwanych przez tę instancję, nie jako exactly-once
przez awarie procesu. Nieobecny/zepsuty binding kończy się bezpieczną odmową.

Konfiguracja: klucz `registry:v1` w `CC_AI_REGISTRY_KV`, alternatywnie JSON w `CC_AI_REGISTRY_JSON`.
KV ma pierwszeństwo; brak konfiguracji nie uruchamia żadnego domyślnego modelu.
Rejestr dostarczony z kodem jest pusty. Modele z raportów 0.5A nie są uznawane za aktualnie dostępne.
Zmiana konfiguracji wymaga zmiany `revision`, co unieważnia klucze cache. Zmiana KV jest eventual-consistent;
nie obiecujemy globalnej aktualizacji ani wyłączenia w mniej niż 2 sekundy.

Wymagane pola provider: `id`, `enabled`, `health`, `pricingClass`, `billingAllowed:false`,
`billingDisabled:true`, `verifiedUntil` (ważne ISO UTC). Identyfikatory dostawców są ograniczone do
google-ai-studio, groq-cloud, cloudflare-workers-ai, cc-local. Endpointy i nazwy sekretów są przypięte
w adapterach, aby zmienny rejestr ani klient nie mogły przekierować sekretów do obcego hosta.
`billingDisabled` jest deklaracją administratora po kontroli konta, nie odczytem dashboardu przez kod.
Sama etykieta FREE_QUOTA/ALREADY_COVERED nie stanowi dowodu bezpłatności.

Wymagane pola model: `id`, `providerId`, `capabilities`, `allowedPrivacyClasses`, `fallbackPriority`,
`maxOutputTokens` (1–4096), `timeoutMs` (1–15000), `estimatedAdditionalCost:0`,
`quota:{rpd,rpm,tpm,unitsPerDay,maxUnitsPerRequest}` — wszystkie limity muszą być dodatnimi liczbami całkowitymi.
Limity są dostarczane zewnętrznie i wymagają weryfikacji konta/modelu; DYNAMIC/UNKNOWN nie pozwala wykonać zapytania.
`maxUnitsPerRequest` musi być konserwatywną górną granicą faktycznego zużycia jednostek dostawcy
przy dozwolonym wejściu i maxOutputTokens, szczególnie dla Workers AI. Nieznany koszt jednostkowy blokuje aktywację.

`CC_AI_QUOTAS` używa jednego SQLite DO na konto dostawcy (w tej wersji jedno konto na provider ID).
Wspólny licznik uniemożliwia wielokrotne wydanie wspólnej puli przez różne modele. To konserwatywne rozwiązanie:
limity modelu porównuje z zagregowanym zużyciem konta, więc może odmówić wcześniej niż dostawca.
Nie wolno tworzyć nowych provider ID ani kopii koordynatora, aby rozdzielić ten sam upstream billing account.
Przed każdym upstream call rezerwuje atomowo request/day, request/minute, token/minute i units/day.
Rezerwacja obejmuje konserwatywną estymację wejścia i cały limit output. Nie zwraca jednostek po błędach/timeoutach.
Dobowe okna licznika resetują się o 00:00 UTC. Jeżeli quota dostawcy resetuje się inaczej lub jest krocząca,
administrator musi dobrać konserwatywny budżet albo pozostawić provider OFF; ta wersja nie odwzorowuje dowolnych okien.
429 otwiera obwód modelu na minutę; 5xx/timeout/auth/network/model failure na 5 minut.
Rezerwacje i obwody przeżywają restart DO. Nieznany koszt i płatna trasa zatrzymują całe żądanie HTTP 403.

## Cache i adaptery

KV cache jest opcjonalny i ma TTL 24h; klucz SHA-256 obejmuje UID, treść, glosariusz, język, capability,
klasę prywatności, jawnie wybrany model i revision. Cache nie jest dzielony między użytkownikami.
Cache zawiera wyłącznie wyjście dla PUBLIC oraz metadane, bez tokenów i źródłowego promptu.
Cold-read KV nie zapewnia latency <15ms; latency mierzymy, nie deklarujemy jako stałą.
Zmiana flagi providera/zdrowia lub wygaśnięcie danych finansowych blokuje również użycie jego cache.

Adaptery implementują wspólny kontrakt: Google REST, Groq chat completions, AI.run, Ollama chat.
Na Workerze lokalny węzeł wymaga prywatnego Service Binding `CC_LOCAL_AI`, realizującego Ollama `/api/chat`.
Nie otwieraj publicznego Ollama ani portu 11434. Loopback jest dozwolony tylko w procesie na stacji
z `CC_AI_RUNTIME=local`; chmurowy Worker nie może używać tej opcji jako połączenia do komputera właściciela.
Timeout HTTP abortuje fetch; `AI.run` nie zapewnia anulowania upstream, dlatego jego maksymalne
jednostki są rezerwowane przed wykonaniem. Brak lokalnej stacji oznacza SAFE_DEGRADED_MODE (503).

## Konfiguracja infrastruktury — wyłącznie po osobnym przeglądzie

`cloudflare/cc-ai-gateway/wrangler.jsonc` przygotowuje kod koordynatora z flagami OFF,
workers_dev=false i bez routes. W tej fazie niczego nie utworzono w chmurze.
Pages musi mieć zewnętrzny DO binding `CC_AI_SESSIONS`, class_name=CcAiSession,
script_name=cc-ai-zero-cost-coordinator. Koordynator ma lokalne bindings CC_AI_SESSIONS i CC_AI_QUOTAS.
W obu środowiskach należy osobno ustawić project ID/number/App ID, flagi i zgodny rejestr;
sekrety providerów oraz opcjonalne AI, KV i CC_LOCAL_AI bindings należą do koordynatora.
Weryfikacja kosztów obejmuje też Workers/DO/KV i hosting połączenia do stacji, nie tylko sam model AI.
Nie aktywuj na koncie z możliwym billable overage. Nie zmieniaj planu ani billingu w ramach Fazy 1.

## Testy i rollback

`npm run test:ai-gateway` uruchamia T01–T26 oraz dodatkowe testy finansowe i prywatności.
Suite jest dołączona do `npm run test:all`. Testy używają wyłącznie syntetycznych tokenów i atrap transportu.
Runtime: ustaw CC_AI_TEST_RUNTIME_ROOT na istniejące node_modules z miniflare i esbuild,
a następnie uruchom `npm run test:ai-gateway:runtime`. Brak runtime powoduje FAIL zamiast cichego SKIP.
Test runtime ma wyłącznie lokalne SQLite/KV oraz outboundService odcinający prawdziwą sieć.
Opcjonalny CC_AI_TEST_COMPATIBILITY_DATE pozwala jawnie badać starszy runtime; walidacja tej dostawy
odbyła się z docelową datą 2026-09-30. Żadne dependencies nie zostały dodane ani zaktualizowane.

Rollback: pozostaw/ustaw CC_AI_GATEWAY_ENABLED=false oraz CC_AI_ENABLED=false w Pages i koordynatorze.
Flagi nie są ładowane z KV. Trwających już upstream calls nie da się cofnąć.
Na poziomie źródeł wycofuj wyłącznie commit Fazy 1 po jego utworzeniu, nie cały katalog/repo ani stare SHA z planu.
Przed commitem można odwrócić pełny patch tej fazy po `git apply --reverse --check` i kontroli statusu,
ale tylko jeśli wskazane pliki nie otrzymały późniejszych zmian. Wycofanie kodu nie usuwa danych DO/KV.
T26 jest lokalną próbą odtworzenia poprzedniego Workera z aktualnego HEAD i porównania publicznych tras;
nie oznacza produkcyjnego rollbacku ani przywrócenia starego `4dffcea`.

HARD STOP: brak commita/pushu/deployu, brak aktywacji flag, brak live provider verification.
