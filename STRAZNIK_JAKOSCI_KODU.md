# 🛡️ PROTOKÓŁ STRAŻNIKA KODU (CODE SENTINEL @ICC / LUMINA)

## Cel Nadrzędny
Eliminacja powracających usterek, powierzchownych łatek i zapewnienie 100% stabilności platformy poprzez rygorystyczny audyt przyczynowo-skutkowy przed każdym wdrożeniem produkcyjnym.

---

## 1. 🔍 ŻELAZNA LISTA KONTROLNA PRZED COMMIT / DEPLOY

Przed zatwierdzeniem jakichkolwiek zmian agent oraz **Strażnik Kodu** weryfikują 5 kluczowych obszarów:

### A. Kaskada i Konflikty CSS (CSS Cascading Audit)
- [ ] Czy żadna reguła w arkuszach nadrzędnych (np. lumina-responsive-reset.css) nie nadpisuje szerokości kontenerów (width: max-content), uniemożliwiając ich przewijanie?
- [ ] Czy elementy elastyczne posiadają jednoznaczny kierunek (flex-direction: row !important vs column) i nie są rozbijane przez reguły gridowe w widokach mobilnych?
- [ ] Czy elementy z overflow-x: auto mają rodziców o zdefiniowanej szerokości, a nie max-content?

### B. Cykl Życia i Logika JavaScript (JS Lifecycle & State Audit)
- [ ] **Brak wiecznych flag blokujących:** Czy żadna zmienna blokująca (isInteracting, isVideoFinished) nie może utknąć w stanie blokującym (np. brak zdarzenia ended przy zapętlonym wideo)?
- [ ] **Bezpieczeństwo Timerów:** Każdy setTimeout / setInterval ma czyszczony poprzedni identyfikator (clearTimeout) przed zarejestrowaniem nowego.
- [ ] **Spójność Modali:** Funkcja otwierająca modal (openAuth) bezwzględnie czyści liniowy styl ukrywający (style.display = 'flex') i dodaje klasę .open.

### C. Integralność Danych i Fallbacków (Data Fallback Guard)
- [ ] Funkcje pobierające profile (getLiveProfile(slug)) nigdy nie podstawiają fałszywego profilu domyślnego dla niepowiązanych kart (brak podstawiania Cezarego pod karty innych osób).
- [ ] Każdy zasób graficzny posiada bezpieczny onerror wskazujący na poprawny, istniejący plik lokalny.

### D. Ochrona Działających Komponentów (Anti-Teardown)
- [ ] Dynamiczna aktualizacja danych nie niszczy elementów DOM będących w trakcie interakcji, odtwarzania wideo lub przewijania.
- [ ] Autoodtwarzanie nie resetuje pozycji scrolla wbrew woli użytkownika.

### E. Zakaz Psujących Deployów (Zero Regression)
- [ ] Zmiana w jednym pliku nie cofa poprawek wprowadzonych w innych częściach systemu.
- [ ] Wersja aplikacji jest podnoszona w sposób kontrolowany.

---

## 2. 🤖 ROLA AGENTA straznik_kodu
- Działa jako niezależny recenzent kodu i architektury.
- Ma prawo odrzucić łatkę, jeśli jest ona powierzchowna (leczy objaw zamiast przyczyny źródłowej).
- Monitoruje i archiwizuje historię usterek, aby te same błędy nigdy więcej nie pojawiły się w repozytorium.
