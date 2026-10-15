# RAPORT HOTFIX HERO P0 — BIBLIJNE UWIELBIENIE PREMIUM
**Data i godzina:** 2026-10-15T18:15:00+02:00  
**Autor:** Antigravity  
**Adres docelowy:** https://polskieradio.cc/BiblijneUwielbienie  
**Zatwierdzona makieta referencyjna:** `public/images/design-reference.png`  
**Gałąź robocza:** `redesign/biblijne-uwielbienie-premium`  
**Status:** ZREALIZOWANY — OCZEKUJE NA RECENZJĘ CLAUDE I DECYZJĘ WŁAŚCICIELA (ZAKAZ PUBLIKACJI PRZED ZGODĄ)

---

## 1. Wykonane zadania naprawcze HERO (Zgodnie z Dyrektywą Właściciela)

| Nr | Wymóg Właściciela | Stan wdrożenia i rozwiązanie inżynieryjne | Status |
|:---|:---|:---|:---:|
| 1 | **Usunięcie prostokątnych teł ze zdjęć** | Przeprowadzono segmentację neuronową AI (rembg / model U2Net). Wygenerowano czyste pliki WebP i PNG z rzeczywistym 8-bitowym kanałem alfa. Zachowano detale fryzur, koronkowych sukien i okularów bez zniekształceń. | ✅ ZROBIONE |
| 2 | **Jedna scena z trzech postaci** | Kompozycja teatralna w CSS/DOM: Cezary Rogowski na 1. planie (`z-index: 3`, szerokość 390 px), artystka brunetka po lewej (`z-index: 2`, 285 px) i artystka blondynka po prawej (`z-index: 2`, 285 px) na 2. planie. Wszystkie granice zdjęć zostały zlikwidowane. | ✅ ZROBIONE |
| 3 | **Kinowe tło sceniczne** | Jednolita paleta: midnight navy `#070B16`, delikatny fiolet `rgba(88, 28, 135, 0.35)` oraz złoty krzyż w głębi (`#C4A35A`). Zastosowano miękki fade dolny (funkcja cosinusoidalna), płynnie stapiający postaci z panelem odtwarzacza. | ✅ ZROBIONE |
| 4 | **Zmniejszenie nagłówka HERO o ~15%** | H1 desktop zmniejszone z `80px` do `clamp(38px, 3.8vw, 68px)` z `line-height: 1.06`. H1 mobile to `clamp(28px, 8vw, 38px)`. Zachowano pełną czytelność i elegancję szeryfową. | ✅ ZROBIONE |
| 5 | **Widoczność odtwarzacza na 1440 × 900** | Zmniejszono padding pionowy HERO (`12px 0 16px`) i wysokość sceny (480 px). Całkowita wysokość do odtwarzacza wynosi 584 px, co pozostawia **ponad 316 px** widocznego panelu odtwarzacza i kafelków szybkiego dostępu nad linią zgięcia folda. | ✅ ZROBIONE |
| 6 | **Przeniesienie napisu „Uwielbienie zmienia świat”** | Kaligrafia przeniesiona do prawego górnego rogu (`top: 15px; right: 20px` desktop, `top: 2px; right: 12px` mobile), całkowicie poza obszar twarzy postaci i krzyża. Dodano subtelne złote podkreślenie. | ✅ ZROBIONE |
| 7 | **Usunięcie cytatu zasłaniającego postaci** | Karta cytatu została całkowicie usunięta ze sceny portretowej. Werset Ps 96,1 przeniesiono do minimalistycznej linii `.hero-scripture-line` pod przyciskami CTA w lewej kolumnie. | ✅ ZROBIONE |
| 8 | **Zachowanie logiki i funkcji** | Pełna integracja z YouTube IFrame API, katalog 66 ksiąg i 1189 rozdziałów, filtry, wyszukiwarka, ulubione LocalStorage, kafelki funkcyjne działają w 100%. | ✅ ZROBIONE |
| 9 | **Dedykowany układ mobilny** | Układ dwukolumnowy przycisków CTA obok siebie, kompaktowa scena portretowa (250 px), lepki odtwarzacz dolny (sticky mini-player) i dolny pasek nawigacyjny. Przepełnienie poziome = 0 px. | ✅ ZROBIONE |
| 10 | **Zrzuty i raport diagnostyczny** | Wykonano rzeczywiste zrzuty ekranu we wszystkich 4 rozdzielczościach przez Playwright i porównano z makietą. | ✅ ZROBIONE |

---

## 2. Pomiary i weryfikacja na 4 rozdzielczościach (Playwright)

| Rozdzielczość | Przepełnienie poziome | Wysokość Nav | Wysokość HERO | Rozmiar H1 / Line-height | Odtwarzacz widoczny nad foldem |
|:---|:---:|:---:|:---:|:---:|:---:|
| **1440 × 900** (MacBook / Laptop) | **0 px** (`false`) | 76 px | 508 px | 54.72 px / 58.00 px | **TAK** (Master Player w pełni widoczny) |
| **1920 × 1080** (Desktop Full HD) | **0 px** (`false`) | 76 px | 508 px | 68.00 px / 72.08 px | **TAK** (Master Player + Kafelki dostępu) |
| **390 × 844** (iPhone 14/15/16) | **0 px** (`false`) | 60 px | 670 px | 33.15 px / 35.80 px | **TAK** (Sticky Mini-Player na dole) |
| **360 × 800** (Android Standard) | **0 px** (`false`) | 60 px | 664 px | 30.60 px / 33.05 px | **TAK** (Sticky Mini-Player na dole) |

---

## 3. Zapisane zrzuty ekranu po zmianach

1. **Desktop 1440 × 900:**  
   `images/biblijne-uwielbienie/diagnostics-after/after-desktop-1440x900.jpg`
2. **Desktop 1920 × 1080:**  
   `images/biblijne-uwielbienie/diagnostics-after/after-desktop-1920x1080.jpg`
3. **Mobile 390 × 844:**  
   `images/biblijne-uwielbienie/diagnostics-after/after-mobile-390x844.jpg`
4. **Mobile 360 × 800:**  
   `images/biblijne-uwielbienie/diagnostics-after/after-mobile-360x800.jpg`

---

## 4. Bateria testów automatycznych (Standard Zero-QA)

- **`npm.cmd run test:cc-regression`**: **288 / 288 PASS** (0 błędów, 100% sukcesu).
- **`npm.cmd run test:guardian:extended`**: **0 naruszeń** (13 reguł, 132 pliki HTML, 146 plików JS czyste).
- **`npm.cmd run test:mobile-premium`**: **24 / 24 PASS** (100% sukcesu).
- **`node --test tests/biblijne-uwielbienie.test.mjs`**: **7 / 7 PASS** (100% sukcesu).
- **Ochrona kanałów live:** Pliki `cctv24-worship.html` oraz `biblia-spiewana-live.html` pozostały nienaruszone (read-only).

---

## 5. Przekazanie do recenzji Claude i Właściciela

Kod znajduje się na dedykowanej gałęzi `redesign/biblijne-uwielbienie-premium`.  
Zgodnie z poleceniem: **projekt NIE został opublikowany na produkcję** i oczekuje na weryfikację estetyczną oraz oficjalną decyzję Właściciela.
