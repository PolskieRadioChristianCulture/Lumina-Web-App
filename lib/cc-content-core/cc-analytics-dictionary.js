/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL OBSERVER — CC ANALYTICS DICTIONARY (FAZA 4 / BRAMKA 4.5)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (PRODUCTION GATE 4.5)
 * Dyrektywa 40: Jednoznaczne definicje metryk, jednostek, źródeł i ograniczeń.
 * ══════════════════════════════════════════════════════════════════════════
 */

/**
 * @typedef {Object} MetricDefinition
 * @property {string} metricName - Nazwa metryki w standardzie CC
 * @property {string} definition - Ścisła definicja operacyjna
 * @property {string} source - Oficjalne źródło telemetrii
 * @property {string} unit - Jednostka miary (COUNT, SECONDS, PERCENT, RATIO)
 * @property {'SUM' | 'LAST_SNAPSHOT' | 'MAX' | 'AVERAGE'} aggregationMethod - Metoda agregacji
 * @property {string} limitations - Prawda o ograniczeniach (czego metryka NIE oznacza)
 * @property {import('./types.js').VerificationLevel} verificationLevel - Domyślny poziom wiarygodności
 */

/**
 * Wersja Kanonicznego Słownika Analityki CC
 * Każda późniejsza zmiana definicji metryki wymaga nowego wpisu w rejestrze wersji.
 */
export const CC_ANALYTICS_DICTIONARY_VERSION = 'v1';

/**
 * Słownik Metryk Telemetrycznych Christian Culture Global
 * @type {Record<string, MetricDefinition>}
 */
export const CC_ANALYTICS_DICTIONARY = Object.freeze({
    VIEW: {
        metricName: 'VIEW',
        definition: 'Zdarzenie załadowania i rozpoczęcia wyświetlania treści (wideo, artykuł, strona WWW).',
        source: 'Oficjalne API platform (np. YouTube Data API v3) lub telemetria brzegowa Cloudflare.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Nie oznacza ukończenia zapoznania się z treścią ani głębokiego zaangażowania odbiorcy.',
        verificationLevel: 'PLATFORM_API'
    },
    IMPRESSION: {
        metricName: 'IMPRESSION',
        definition: 'Wyświetlenie miniatury, nagłówka lub linku do treści na ekranie użytkownika.',
        source: 'Logi serwerowe, platformy dystrybucyjne lub tablica społecznościowa LUMINA.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Oznacza jedynie obecność w viewport; nie gwarantuje kliknięcia ani przeczytania.',
        verificationLevel: 'FIRST_PARTY'
    },
    PLAY: {
        metricName: 'PLAY',
        definition: 'Rozpoczęcie odtwarzania strumienia audio lub wideo w odtwarzaczu CC Player lub LUMINA.',
        source: 'Zdarzenia odtwarzacza frontendowego HTML5 Audio/Video.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Mierzy zainicjowanie odtwarzania, nie całkowity czas odsłuchu.',
        verificationLevel: 'FIRST_PARTY'
    },
    LISTEN: {
        metricName: 'LISTEN',
        definition: 'Ciągły odsłuch audycji radiowej lub podcastu trwający minimum 30 sekund.',
        source: 'Telemetria sesyjna odtwarzacza radia PolskieRadio.cc.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Mierzy pojedyncze sesje odtwarzania; wymaga agregacji w oknie czasowym.',
        verificationLevel: 'FIRST_PARTY'
    },
    CURRENT_LISTENERS: {
        metricName: 'CURRENT_LISTENERS',
        definition: 'Chwilowa liczba aktywnych połączeń TCP ze strumieniem serwera Icecast/HLS (/live.mp3, /worship.aac).',
        source: 'Statystyki status.xsl / XML serwera Icecast radia CC.',
        unit: 'COUNT',
        aggregationMethod: 'MAX',
        limitations: 'UWAGA KRYTYCZNA: currentListeners ZAWSZE odróżnia się od uniqueListeners! Jedno połączenie nie równa się jednemu unikalnemu słuchaczowi (jeden punkt odsłuchu może być współdzielony lub zerwane połączenie może reconnectować). Zakaz przeliczania bez dedykowanych logów unikalnych.',
        verificationLevel: 'SERVER_METRICS'
    },
    WATCH_TIME: {
        metricName: 'WATCH_TIME',
        definition: 'Łączny czas odtwarzania materiału wideo lub audio wyrażony w sekundach.',
        source: 'YouTube Analytics API lub zdarzenia timeupdate w odtwarzaczu CC.',
        unit: 'SECONDS',
        aggregationMethod: 'SUM',
        limitations: 'Zależy od długości materiału; porównywalny wyłącznie w ramach tego samego formatu.',
        verificationLevel: 'PLATFORM_API'
    },
    REACTION: {
        metricName: 'REACTION',
        definition: 'Świadoma interakcja użytkownika (polubienie, amen, serce, reakcja na wpis).',
        source: 'Baza Firestore lumina_posts lub oficjalne API platform.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Odzwierciedla natychmiastową aprobatę, nie oznacza dogłębnej lektury.',
        verificationLevel: 'PLATFORM_API'
    },
    COMMENT: {
        metricName: 'COMMENT',
        definition: 'Opublikowanie komentarza lub świadectwa pod materiałem w społeczności LUMINA.',
        source: 'Kolekcja lumina_posts / subkolekcje komentarzy.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Liczba komentarzy, nie sentyment teologiczny.',
        verificationLevel: 'PLATFORM_API'
    },
    SHARE: {
        metricName: 'SHARE',
        definition: 'Udostępnienie materiału na zewnątrz (kliknięcie przycisku Share, skopiowanie linku).',
        source: 'Zdarzenia frontendowe Share API portalu PolskieRadio.cc / LUMINA.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Mierzy intencję polecenia treści, nie weryfikuje faktycznego otwarcia przez odbiorcę trzeciego.',
        verificationLevel: 'FIRST_PARTY'
    },
    BIBLE_OPEN: {
        metricName: 'BIBLE_OPEN',
        definition: 'Otwarcie podstrony MojaBiblia lub rozwinięcie wersetu w rozważaniu.',
        source: 'Zdarzenia nawigacji polskieradio.cc/mojabiblia lub modal biblijny.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Mierzy obiektywne otwarcie tekstu Słowa Bożego w interfejsie użytkownika.',
        verificationLevel: 'FIRST_PARTY'
    },
    DEVOTIONAL_OPEN: {
        metricName: 'DEVOTIONAL_OPEN',
        definition: 'Otwarcie pełnego tekstu rozważania w portalu lub aplikacji mobilnej DZJ.',
        source: 'Aplikacja Dobrze, że jesteś / web portal rozważań.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Otwarcie widoku rozważania, nie stan duchowy czytelnika.',
        verificationLevel: 'FIRST_PARTY'
    },
    CC_ID_REGISTRATION: {
        metricName: 'CC_ID_REGISTRATION',
        definition: 'Pomyślne utworzenie tożsamości użytkownika w projekcie lumina-cc (Firebase Auth).',
        source: 'Firebase Auth trigger w bezpiecznym backendzie.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Krok tożsamościowy; nie inferowany z samej wizyty anonimowej.',
        verificationLevel: 'FIRST_PARTY'
    },
    LUMINA_JOIN: {
        metricName: 'LUMINA_JOIN',
        definition: 'Uzupełnienie profilu w społeczności LUMINA i pierwsze dołączenie do tablicy.',
        source: 'Zapis profilu w lumina_profiles.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Aktywacja konta społecznościowego chrześcijanina.',
        verificationLevel: 'FIRST_PARTY'
    },
    ONGOING_RELATIONSHIP: {
        metricName: 'ONGOING_RELATIONSHIP',
        definition: 'Operacyjnie: obserwowalny powrót użytkownika i interakcja z ekosystemem CC (aplikacja DZJ, LUMINA, radio, portal) w oknie 30 dni.',
        source: 'Zdarzenia powrotu i powtarzalnej aktywności użytkownika w magazynie analitycznym.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'UWAGA DOKTRYNALNA: Definicja wyłącznie operacyjna. Zero subiektywnych deklaracji teologicznych o stanie zbawienia czy trwałym nawróceniu. Duch Święty działa suwerennie.',
        verificationLevel: 'FIRST_PARTY'
    },
    PAGE_VIEWS: {
        metricName: 'PAGE_VIEWS',
        definition: 'Odsłona strony internetowej zarejestrowana na poziomie brzegu sieci Cloudflare.',
        source: 'Cloudflare Web Analytics / Edge Logs.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Zagregowane odsłony HTTP/HTTPS; mogą zawierać ruch crawlerów indeksujących.',
        verificationLevel: 'EDGE_TELEMETRY'
    },
    SCROLL_DEPTH_AVG: {
        metricName: 'SCROLL_DEPTH_AVG',
        definition: 'Średni procent przewinięcia strony przez czytelnika artykułu lub rozważania.',
        source: 'FIRST_PARTY EVENT — telemetria frontendowa portalu polskieradio.cc (Scroll Depth API).',
        unit: 'PERCENT',
        aggregationMethod: 'AVERAGE',
        limitations: 'Pochodzi z kodu JavaScript strony, NIE jest metryką Cloudflare CDN.',
        verificationLevel: 'FIRST_PARTY'
    },
    DISPATCH_STATUS: {
        metricName: 'DISPATCH_STATUS',
        definition: 'Status wysyłki rozważania na bramkę komunikacyjną WhatsApp.',
        source: 'Dziennik wysyłek cc_whatsapp_dispatches (potwierdzenie ACK brokera).',
        unit: 'STATUS',
        aggregationMethod: 'LAST_SNAPSHOT',
        limitations: 'Wartość SENT oznacza potwierdzenie przekazania do sieci brokera. Zakaz zmyślania odczytów (readCount) czy kliknięć (clickCount) bez dedykowanej telemetrii.',
        verificationLevel: 'INTERNAL_CONFIRMED'
    }
});

/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC ANALYTICS DICTIONARY v2 (FAZA 5: CC GEO & LANGUAGE ROUTER)
 * Dyrektywa 60, 61: Dodanie 5 nowych metryk routingu bez modyfikacji v1
 * ══════════════════════════════════════════════════════════════════════════
 */
export const CC_ANALYTICS_DICTIONARY_VERSION_V2 = 'v2';

export const CC_ANALYTICS_DICTIONARY_V2 = Object.freeze({
    ...CC_ANALYTICS_DICTIONARY,
    ROUTING_DECISION: {
        metricName: 'ROUTING_DECISION',
        definition: 'Wykonanie decyzji deterministycznego routingu językowego w oparciu o hierarchię sygnałów.',
        source: 'CC Global Router Core (Edge / Frontend).',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Mierzy fakt podjęcia decyzji routingu; nie określa subiektywnego zadowolenia użytkownika z wybranego języka.',
        verificationLevel: 'FIRST_PARTY'
    },
    LANGUAGE_OVERRIDE: {
        metricName: 'LANGUAGE_OVERRIDE',
        definition: 'Ręczna zmiana języka przez użytkownika za pomocą Language Switchera nadpisująca sygnały automatyczne.',
        source: 'CC Global Language Switcher Frontend Event.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Wskazuje na świadomą preferencję człowieka w opozycji do sygnałów automatycznych (np. GEO lub Browser).',
        verificationLevel: 'FIRST_PARTY'
    },
    FALLBACK_USED: {
        metricName: 'FALLBACK_USED',
        definition: 'Użycie wariantu zastępczego z łańcucha fallback z powodu braku zatwierdzonego wariantu w żądanym locale.',
        source: 'CC Global Router Fallback Engine.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Wskazuje lukę w zasobach językowych dla danego materiału; nie oznacza błędu technicznego routera.',
        verificationLevel: 'FIRST_PARTY'
    },
    CONTENT_LOCALE_UNAVAILABLE: {
        metricName: 'CONTENT_LOCALE_UNAVAILABLE',
        definition: 'Zdarzenie braku wariantu w żądanym locale lub status wariantu inny niż APPROVED.',
        source: 'CC Content Availability Guard.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Mierzy zapotrzebowanie odbiorców na wersje językowe, które nie zostały jeszcze zatwierdzone lub przetłumaczone.',
        verificationLevel: 'FIRST_PARTY'
    },
    GEO_HINT_USED: {
        metricName: 'GEO_HINT_USED',
        definition: 'Użycie podpowiedzi z coarse geo w sytuacji braku jawnego wyboru, profilu CC ID, cookie lub języka przeglądarki.',
        source: 'CC Global Router Signal Resolver.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'GEO stanowi wyłącznie sygnał pomocniczy (HINT), nigdy tożsamość użytkownika.',
        verificationLevel: 'EDGE_TELEMETRY'
    }
});

/**
 * ══════════════════════════════════════════════════════════════════════════
 * SŁOWNIK ANALITYCZNY v3 (GATE 5.6: CONTROLLED ACTIVATION & SUGGESTIONS)
 * Master Plan CC Global 2030 (Gate 5.6)
 * Rozszerzenie o metryki nieinwazyjnych sugestii językowych
 * ══════════════════════════════════════════════════════════════════════════
 */
export const CC_ANALYTICS_DICTIONARY_VERSION_V3 = 'v3';

export const CC_ANALYTICS_DICTIONARY_V3 = Object.freeze({
    ...CC_ANALYTICS_DICTIONARY_V2,
    LANGUAGE_SUGGESTION_SHOWN: {
        metricName: 'LANGUAGE_SUGGESTION_SHOWN',
        definition: 'Wyświetlenie użytkownikowi nieinwazyjnej sugestii zmiany języka (np. "View in English?").',
        source: 'CC Global Language Switcher Frontend Event.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Mierzy fakt prezentacji propozycji; nie wymusza zmiany języka i nie wykonuje auto-redirectu.',
        verificationLevel: 'FIRST_PARTY'
    },
    LANGUAGE_SUGGESTION_ACCEPTED: {
        metricName: 'LANGUAGE_SUGGESTION_ACCEPTED',
        definition: 'Świadome kliknięcie i zaakceptowanie przez użytkownika wyświetlonej sugestii językowej.',
        source: 'CC Global Language Switcher Frontend Event.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Potwierdza intencję człowieka zgodnie z zasadą USER INTENT FIRST.',
        verificationLevel: 'FIRST_PARTY'
    },
    LANGUAGE_SUGGESTION_DISMISSED: {
        metricName: 'LANGUAGE_SUGGESTION_DISMISSED',
        definition: 'Odrzucenie lub zamknięcie sugestii językowej przez użytkownika (np. kliknięcie krzyżyka/Nie teraz).',
        source: 'CC Global Language Switcher Frontend Event.',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Odrzucenie jest zapamiętywane w celu ochrony użytkownika przed powtarzalnym spamem modalnym.',
        verificationLevel: 'FIRST_PARTY'
    }
});

/**
 * Pobiera definicję metryki ze słownika (domyślnie v3, z fallbackiem do v2/v1)
 * @param {string} metricName
 * @param {'v1' | 'v2' | 'v3'} [version='v3']
 * @returns {MetricDefinition}
 */
export function getMetricDefinition(metricName, version = 'v3') {
    const norm = (metricName || '').toUpperCase();
    let dict;
    if (version === 'v1') dict = CC_ANALYTICS_DICTIONARY;
    else if (version === 'v2') dict = CC_ANALYTICS_DICTIONARY_V2;
    else dict = CC_ANALYTICS_DICTIONARY_V3;

    return dict[norm] || {
        metricName: norm,
        definition: 'Niestandardowa lub rozszerzona metryka ekosystemu Christian Culture.',
        source: 'UNKNOWN',
        unit: 'COUNT',
        aggregationMethod: 'SUM',
        limitations: 'Brak wpisu w słowniku kanonicznym.',
        verificationLevel: 'UNKNOWN'
    };
}


