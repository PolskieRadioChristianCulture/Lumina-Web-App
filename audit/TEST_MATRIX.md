# EkoCC v2 PREMIUM — MATRYCA TESTÓW I KONTROLI JAKOŚCI (TEST_MATRIX.md)

Matryca urządzeń, rozdzielczości, scenariuszy testowych i kryteriów akceptacji.

---

## 1. Punkty Kontrolne Urządzeń i Ekranów (Mobile-First)
| Profil Urządzenia | Szerokość (px) | Typ Ekranu | Kluczowe Aspekty do Weryfikacji |
|---|---|---|---|
| **Kompaktowy Smartfon** | 360 px | Mobile Portrait | Dotyk min. 44px, brak poziomego paska przewijania, czytelność fontów |
| **Standardowy Smartfon** | 390 px | Mobile Portrait (iPhone / Galaxy) | Responsywność menu nawigacji, odtwarzacz pływający |
| **Tablet Pion / Poziom** | 768 px / 1024 px | Tablet Portrait/Landscape | Siatki kafelków, układ 2-kolumnowy, dotyk vs kursor |
| **Desktop / Laptop** | 1440 px / 1920 px | Desktop HD / Full HD | Global Shell, odtwarzacz pełnoekranowy, typografia |

---

## 2. Baterie Testowe i Komendy Uruchomieniowe
| Pakiet Testów | Komenda | Zakres Kontroli | Wymóg |
|---|---|---|---|
| **Strażnik Kodu (SMCC)** | `npm.cmd run test:guardian` | 11 pancernych reguł, encoding UTF-8, brak fikcyjnych deklaracji | 0 naruszeń |
| **Testy Mobilne Premium** | `npm.cmd run test:mobile-premium` | Elementy dotykowe min. 44px, brak overflow, kontrast | 100% PASS |
| **Testy Regresji CC** | `npm.cmd run test:cc-regression` | Regresja CCN, zachowanie motywu, routing, linki | 100% PASS |
| **Testy Dyspozytora Rejestru** | `node --test rejestr-agentow/narzedzia/test/*.test.mjs` | Moduły M1–M5, routing gabinetów, ACK | 100% PASS |

---

## 3. Scenariusze Akceptacyjne Ścieżek Krytycznych
1. **Ścieżka Audio:**
   - Rozpoczęcie odtwarzania w `/player` lub pływającym pasku.
   - Płynne przełączenie stacji bez zacięcia dźwięku.
   - Działanie w tle przy wygaszonym ekranie telefonu (obsługa MediaSession).
2. **Ścieżka Słowa Bożego i Akademii:**
   - Otwarcie dzisiejszej lekcji Kursu Codziennego z `/akademia#kurscodzienny`.
   - Przycisk skoku ze strzałką w dół `#kcJumpShareBtn` płynnie przewija do sekcji udostępniania.
   - Prawidłowe cytowania z przekładu UBG.
3. **Ścieżka Społeczności i Komunikatora:**
   - Dostęp do `/mess` dla zalogowanego użytkownika.
   - Widoczność Pokoju Rodzinnego dla rodziny Rogowskich.
   - Izolacja danych i brak dostępu dla osób nieuprawnionych.
4. **Wyszukiwarka Ekosystemu @w:**
   - Skrót klawiszowy `Ctrl + K` lub kliknięcie lupy otwiera modal wyszukiwarki.
   - Wyniki pojawiają się od 1. wpisanej litery (<5ms).
