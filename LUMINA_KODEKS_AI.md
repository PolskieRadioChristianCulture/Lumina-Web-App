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
