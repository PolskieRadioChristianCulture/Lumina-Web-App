# Współpraca przy LUMINA

Ten dokument dotyczy ludzi i agentów AI pracujących równolegle przy portalu.
Jego celem jest bezpieczne rozwijanie LUMINA bez przypadkowego nadpisywania
czyjejś pracy lub regresji na produkcji.

## Zanim rozpoczniesz

1. Pobierz aktualny stan gałęzi `main` i sprawdź `git status`.
2. Przeczytaj `AGENTS.md` oraz określ jeden, wąski zakres swojej pracy.
3. Nie edytuj plików, nad którymi aktywnie pracuje inny agent. Jeśli zakresy
   muszą się spotkać, najpierw uzgodnij kolejność zmian.
4. Nigdy nie dodawaj do Git poświadczeń, plików sesji, kluczy ani danych
   użytkowników.

## Zasady zmian

- Zachowuj UTF-8, polskie znaki i emoji.
- Nie zmieniaj zamrożonych transmisji ani publicznych treści Mission Control.
- Zmieniaj najmniejszą możliwą liczbę plików; nie formatuj masowo plików poza
  własnym zakresem.
- Nie używaj `git add .` w repozytorium współdzielonym. Dodawaj wyłącznie
  konkretne pliki należące do zadania.
- Nie wykonuj `push --force`, `reset --hard` ani nie usuwaj cudzych zmian.

## Kontrola przed przekazaniem

Uruchom z katalogu głównego:

```powershell
npm test
```

Polecenie sprawdza znane regresje, składnię lokalnych modułów wymaganych przez
trzy główne widoki LUMINA, funkcje chmurowe oraz skrypty osadzone.

Przed commitem sprawdź także:

```powershell
git status --short
git diff --check
```

## Commit i przekazanie

Commit ma zawierać wyłącznie ukończony, zweryfikowany zakres. Przykład:

```powershell
git add -- lumina-tablica.js lumina-tablica.html
git commit -m "fix(feed): opis zmiany"
```

W przekazaniu pracy podaj zawsze:

- zakres i cel;
- listę istotnych plików;
- wynik `npm test`;
- elementy świadomie pozostawione bez zmian;
- znane ryzyka albo następny krok.

Po zatwierdzeniu przez właściciela zadania zmiany muszą trafić na oba zdalne
repozytoria: `origin` oraz `lumina-repo`.
