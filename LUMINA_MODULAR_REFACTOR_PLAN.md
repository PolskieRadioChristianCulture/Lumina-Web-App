# 📋 PLAN REFAKTORYZACJI I STABILIZACJI PORTALU LUMINA
**Data zapisu:** 16 sierpnia 2026 r.  
**Cel:** Przejście z ciężkich monolitycznych plików HTML (4000 linii) na czystą, stabilną i bezawaryjną **architekturę modułową** z jednym źródłem prawdy.

---

## 🎯 Główne Problemy do Wyeliminowania
1. **Monolityczność i powielanie kodu:** Każdy plik HTML zawierał tysiące linii inline CSS i inline JS – poprawka w jednym pliku psuła inny lub tworzyła konflikty kaskady stylów.
2. **Niestabilność funkcji edycyjnych:** Edycja danych, dodawanie zdjęć, kadrowanie tła i kreator postów były rozproszone i podatne na blokady.
3. **Brak jednego rejestru profili:** Rozbieżności danych między karuzelą a widokami profili.

---

## 🏗️ Nowa Struktura Modułowa

```
polskieradio.cc/
├── lumina/
│   ├── css/
│   │   ├── lumina-theme.css          # Zmienne kolorów, fonty, reset, efekty szklane (glassmorphism)
│   │   ├── lumina-components.css     # Przyciski (pigułki, serce z licznikiem, follow), wyszukiwarka, nawigacja
│   │   ├── lumina-profile.css        # Układ profilu, tło (kadrowanie 380px/500px), awatary, bio, galeria
│   │   ├── lumina-feed.css           # Karta posta, kreator wpisów, aktywne linki w rozważaniach, reakcje
│   │   └── lumina-modals.css         # Okna: Wiadomość, Kawa, Edycja profilu, PIN, Podgląd zdjęć
│   │
│   ├── js/
│   │   ├── lumina-db-profiles.js     # Jedyne, centralne źródło danych profili (Cezary, Wioletta, Magdalena, SDS, itd.)
│   │   ├── lumina-actions.js         # Obsługa polubień (serce z licznikiem), obserwowania, kawy, wiadomości, linków
│   │   ├── lumina-editor.js          # Narzędzia właściciela (edycja profilu, zmiana awatara/tła, kadr, galeria)
│   │   ├── lumina-feed.js            # Silnik tablicy, publikacja, parser aktywnych linków WWW w rozważaniach
│   │   └── lumina-search.js          # Szklana wyszukiwarka globalna z podpowiedziami i skrótami
│   │
│   └── html/ (czyste, lekkie szablony < 250 linii):
│       ├── lumina.html               # Strona główna z karuzelą i szklaną wyszukiwarką
│       ├── lumina-tablica.html       # Główna tablica społeczności
│       └── lumina-profile.html       # Uniwersalny, dynamiczny profil
```

---

## 🛠️ Lista Funkcji do Rygorystycznej Weryfikacji (Checklist na Powrót)

### 1. Wyszukiwarka Strony Głównej (`lumina.html`)
- [ ] 100% krystalicznie przezroczysta tafla szkła (`glassmorphism`) bez ciemnych plam,
- [ ] Odsłonięta, jasna grafika pary i logo LUMINA w tle,
- [ ] Działające dynamiczne podpowiedzi `@skrótów` i profili.

### 2. Profile i Dane Społeczności
- [ ] 100% spójności danych: Karuzela -> Tablica -> Profil (Pani Magdalena, Studio Dobrego Słowa, Założyciele),
- [ ] Poprawne kadrowanie i brak zniekształceń awatarów 1:1,
- [ ] Wymiary tła: 1200 x 380 px (desktop), 220 px (mobile), plik źródłowy 1300 x 500 px.

### 3. Przyciski Akcji na Profilu
- [ ] Przycisk Obserwuj/Obserwujesz z działającym licznikiem,
- [ ] Przycisk Serca z licznikiem polubień (nowy układ pigułki),
- [ ] Przycisk Zębatki `[ ⚙️ ]` otwierający pełną edycję,
- [ ] Wysyłanie wiadomości i zaproszenie na kawę.

### 4. Narzędzia Edycyjne Właściciela
- [ ] Bezwarunkowy dostęp dla Założyciela bez zbędnych blokad,
- [ ] Edycja wszystkich pól w oknie modalnym (imię, wiek, miasto, wyznanie, werset, bio, tagi, PIN, widoczność),
- [ ] Zmiana zdjęcia w tle + suwak ustawienia kadru (0–100%),
- [ ] Dodawanie i usuwanie zdjęć z galerii,
- [ ] Kreator postów, dołączanie grafiki, edycja i usuwanie wpisów na tablicy.

### 5. Tablica Społeczności (`lumina-tablica.html`)
- [ ] Automatyczne aktywne linki w rozważaniach i postach (klikane, złote odnośniki),
- [ ] Dodawanie reakcji (Polubienie, AMEN),
- [ ] Filtry kategorii wpisów.

---

## 🚀 Plan Działania na Start (Dzień 1 po przerwie)
1. Utworzenie katalogów `css/` oraz `js/` i wyekstrahowanie wspólnych modułów.
2. Zastąpienie monolitycznych plików HTML czystymi strukturami podpinającymi moduły.
3. Test manualny każdego punktu z powyższej checklisty.
4. Publikacja i weryfikacja na serwerze produkcyjnym.
