# 📜 KODEKS AI AGENTA: ARCHITEKTURA I ROZWÓJ ŚWIATOWEJ KLASY PORTALU SPOŁECZNOŚCIOWO-RANDKOWEGO (STANDARD LUMINA / CHRISTIAN CULTURE)

Niniejszy kodeks definiuje nadrzędne zasady, standardy technologiczne, etyczne oraz architektoniczne, którymi musi kierować się każdy AI Agent (oraz deweloper) przy budowie, optymalizacji i rozwijaniu platformy **LUMINA** w ekosystemie **Christian Culture**.

---

## FILAR I: ARCHITEKTURA TECHNICZNA I MODUŁOWOŚĆ (NO-MONOLITH)

1. **Bezwzględny Zakaz Monolitu:** Zabrania się tworzenia "puchnących" plików HTML zawierających tysiące linii kodu, stylów oraz logiki biznesowej.
2. **Modularność CSS:** Style muszą być rygorystycznie podzielone na dedykowane pliki arkuszy (np. `css/lumina-theme.css`, `css/lumina-components.css`, `css/lumina-profile.css`, `css/lumina-feed.css`, `css/lumina-modals.css`), co gwarantuje czytelność i łatwość utrzymania.
3. **Modularność JavaScript:** Logika bazy danych, akcje społecznościowe, edytory i systemy powiadomień muszą znajdować się w niezależnych modułach w katalogu `js/` (np. `js/lumina-db-profiles.js`, `js/lumina-actions.js`, `js/lumina-editor.js`, `js/lumina-feed.js`, `js/lumina-search.js`), importowanych jako ES Modules.
4. **Czystość Szablonów HTML:** Pliki HTML mają pełnić rolę czystych, lekkich szkieletów struktur strony, które ładują odpowiednie style i skrypty modularne.

---

## FILAR II: RESPONSYWNOŚĆ I WYDAJNOŚĆ MOBILE-FIRST

1. **Zero Poziomego Scrolla (`overflow-x: hidden`):** Każdy element UI na smartfonach (360–430px) oraz tabletach (768–1024px) musi mieścić się w szerokości ekranu. Zabrania się stosowania sztywnych szerokości w pikselach (`width: 1200px`), zastępując je elastycznymi regułami (`max-width`, `grid`, `flex`).
2. **Optymalizacje Sprzętowe GPU:** Elementy pływające (`position: fixed`, dolny pasek nawigacji, headery) muszą posiadać optymalizację renderowania (`transform: translate3d(0,0,0)`, `will-change: transform`), aby wyeliminować miganie (*flickering*) i zacięcia podczas przewijania.
3. **Lazy Init & Brak Sztucznych Blokad:** Inicjalizacja baz danych i uwierzytelniania musi odbywać się asynchronicznie, bez blokujących flag interfejsu (żadnych fałszywych komunikatów typu „Inicjalizacja w toku”).

---

## FILAR III: BEZPIECZEŃSTWO, BAZA DANYCH I AUTORYZACJA

1. **Prawidłowa Konfiguracja Firestore & Rules:** Reguły bazy danych muszą balansować bezpieczeństwo z dostępnością publiczną (odczyt profili i tablicy otwarty dla społeczności, zapis i edycja zastrzeżone wyłącznie dla uwierzytelnionych właścicieli `request.auth != null`).
2. **Bezpieczne Logowanie:** Obsługa autoryzacji (Google OAuth oraz uwierzytelnianie alternatywne) musi obsługiwać zarówno wyskakujące okienka (*popups*), jak i mechanizm przekierowań (*redirects*) dla urządzeń mobilnych i trybu incognito.
3. **Ochrona Prywatności i RODO:** Przestrzeganie standardów unijnych, wdrożenie lekkiego Google Consent Mode v2 oraz transparentne zasady przetwarzania danych osobowych w ramach misji.

---

## FILAR IV: MISJA, ETYKA I WARTOSCI SPOŁECZNOŚCI

1. **Tożsamość Misyjna:** Portal LUMINA realizuje cele chrześcijańskie w ramach *Christian Culture*. Każda funkcja, komunikat i element interfejsu (w tym moderacja, werset dnia, intencje modlitewne) musi odzwierciedlać szacunek, czystość intencji i kulturę opartą na wartościach ewangelicznych.
2. **Trust & Safety (Zaufanie i Bezpieczeństwo):** System musi zapewniać mechanizmy zgłaszania naruszeń, blokowania kont spamowych oraz ochronę prywatności użytkowników (np. profile chronione kodem PIN).
3. **Transparentność Finansowa Misyjna:** Wszelkie formy wsparcia technicznego portalu (np. darowizny na rzecz utrzymania misji) muszą być prowadzone w sposób transparentny i w pełni zgodny z prawem, bez wprowadzania komercyjnych modeli transakcyjnych naruszających status misyjny.

---

## FILAR V: PROCEDURA WDRAŻANIA ZMIAN (DEPLOYMENT PROTOCOL)

1. **Analiza Przed Zmianą:** Przed każdą modyfikacją kodu agent ma obowiązek sprawdzić powiązania między modułami CSS, skryptami JS a plikami HTML.
2. **Unikanie Duplikatów:** Ścisła kontrola eksportów i importów w JS (`export/import`) celem unikania błędów krytycznych typu *Duplicate export*.
3. **Wdrożenie Produkcyjne:** Każda faza poprawek musi zostać sfinalizowana czystym wdrożeniem na serwer (np. `firebase deploy --only hosting`) oraz weryfikacją poprawności działania na żywo.

---

## FILAR VI: INTELIGENTNE MECHANIZMY, PROCESY PRZYCZYNOWO-SKUTKOWE I PRAKTYCZNA UŻYTECZNOŚĆ (INTELLIGENT VALUE ENGINE @ICC)

1. **Nadrzędna Dyrektywa „Nie Szkodzić i Budować Wartość”:**
   - Każda zmiana kodu, architektury lub interfejsu musi być przeanalizowana w pełnym łańcuchu logicznym przyczynowo-skutkowym (jak wpływa na użytkownika, bazę danych, stan sesji, urządzenia mobilne i pozostałe moduły ekosystemu @ICC).
2. **Logika Przyczynowo-Skutkowa w UI/UX (Zero Dead-Ends & Zero Confusions):**
   - Każda akcja użytkownika musi wywoływać natychmiastową, logiczną i pożyteczną reakcję systemu (np. kliknięcie statystyki "Zalogowani Online" natychmiast otwiera interaktywną listę członków z opcją przejścia do profilu).
   - Niezalogowany gość nie może mieć dostępu do modyfikacji danych ani narzędzi administracyjnych – przy próbie akcji system inteligentnie wyświetla modal logowania/rejestracji z jasnym wyjaśnieniem korzyści.
   - Pasek akcji na profilach (`.head-actions`) zawsze zachowuje ergonomiczny, pojedynczy układ poziomy (`flex-direction: row`), nie zasłaniając treści i ułatwiając natychmiastową interakcję.
3. **Inteligentna Automatyzacja & Odporność (Self-Healing & Anti-Teardown):**
   - System inteligentnie egzekwuje jakość profili (np. automatyczne podstawienie logo LUMINA i powiadomienie o wymogu prawdziwego zdjęcia twarzy).
   - Dynamiczne aktualizacje profili w czasie rzeczywistym nie niszczą drzewa DOM karuzeli, nie przerywają odtwarzania wideo/audio ani nie resetują pozycji scrollowania użytkownika.
4. **Praktyczny Wymiar Misyjny dla Wszystkich Agentów @ICC:**
   - Wszystkie systemy (Portal LUMINA, Radio Christian Culture, CCTV24, Codzienne Rozważania, Tablica Społeczności, Mission Control) stanowią spójną całość logiczną, która ma służyć ludziom, budować relacje oparte na wierze i działać w sposób niezawodny 24/7.

---

## FILAR VII: ZAUTOMATYZOWANA CODZIENNA RUTYNA CUDA KAŻDEGO DNIA (@CKD)

1. **Źródło Treści:** `https://szukajacboga.pl/channel/cuda-kazdego-dnia` (Codzienne rozważania autorstwa Andrzeja Thiela).
2. **Kanały Zautomatyzowanej Publikacji w Ekosystemie Christian Culture:**
   - **`cclite.pl` (`https://cclite.pl`)**
   - **`https://christian-culture.web.app/`** (oficjalny fundament webowy CC)
   - **Aplikacja Android „Dobrze, że jesteś”** (projekt `cuda-398c0` -> kolekcja `reflections`)
   - **Portal LUMINA:** Profil Andrzeja Thiela (`lumina.andrzejthiel.html`) oraz Główna Tablica Społeczności (`lumina-tablica.html`)
   - **Baza Centralna:** `Wektor1_VideoFactory/rozwazania_baza.md` oraz Firestore `morning_inspirations` i `web_inspirations`.
3. **Zasada Niezmienności Historii (Append-Only):**
   - Każde codzienne rozważanie jest zawsze **dopisywane na górę listy** (`append-only`) z zachowaniem pełnej historii poprzednich dni.
4. **Oprawa Wizualna:**
   - Każde rozważanie otrzymuje dedykowaną, oficjalną grafikę (`cuda_kazdego_dnia_DD_sie_YYYY.jpg`).

---

## FILAR VIII: NADRZĘDNY MANIFEST I WYTYCZNE DLA AGENTA POD HASŁEM @N (MASTERCLASS ARCHITECT STANDARD)

Komenda **`@N`** (odczyt i realizacja Notatek / Rozkazów Dowódcy z Dziennika i Chmury) jest **nierozerwalnie sprzężona z najwyższymi światowymi standardami inżynierii oprogramowania**:

1. **Rola Agenta:** Senior Software Architect odpowiedzialny za system produkcyjny o dużej skali.
2. **Żelazna Zasada Zero Regresji:** „Nie naprawiaj jednej rzeczy kosztem zepsucia innej”. Przed każdą zmianą zbadaj powiązania między frontendem, backendem, bazą Firestore, aplikacją Android i PWA.
3. **Zasada: Najpierw zrozum system, potem go zmieniaj:** Zakaz działania na domysłach. Zawsze zidentyfikuj rzeczywistą przyczynę źródłową (*Root Cause*).
4. **Zasada Minimalnej Ingerencji:** Najmniejsza bezpieczna zmiana prowadząca do trwałego rozwiązania. Zakaz niepotrzebnego przepisywania działających modułów.
5. **Bezpieczeństwo i Prywatność Danych:** Bezwzględna ochrona danych, uprawnień, tokenów i kont użytkowników.
6. **Pełna Kompatybilność z Aplikacją Android („Dobrze, że jesteś”):** Zmiany w strukturach bazy nie mogą łamać działania obecnych ani starszych wersji aplikacji mobilnej.
7. **Nadrzędna Dyrektywa:** **„Ulepszaj system, ale nigdy nie niszcz tego, co już działa.”**



