# @ICC — Polecenie wdrożeniowe Antigravity

**Cel:** produkcyjne przygotowanie `https://polskieradio.cc/Global/` w oparciu o dostarczony projekt i aktualną stronę `/music`. Nie nadpisuj istniejących plików bez audytu. Zero kosztów i zero atrap.

## Etap 0 — bezwzględny audyt

1. Sprawdź `polskieradio.cc/music`, rzeczywiste repozytoria i mechanizm deploy; zidentyfikuj konflikt lustrzanych repozytoriów.
2. Odczytaj produkcyjne URL Global Radio i Global Bible z aktualnego rejestru strumieni; potwierdź status HTTP i audio.
3. Sprawdź projekt Firebase używany przez LUMINA: `projectId`, `authDomain`, Google provider, authorized domains, istniejące role, obsługę SSO.
4. Sprawdź prawa do wykorzystania grafik i plików audio, a także status obu premier JJ Beauvais.
5. Zweryfikuj osadzanie pięciu playlist Personality Plus.
6. Zapisz wyniki audytu w `Repozytoria-CC/skrzynka/`.

## Etap 1 — scalanie

- Zachowaj wspólne komponenty z `/music` tam, gdzie są zgodne z wymaganiami.
- Wdrażaj moduły niezależnie od starych stron, bez kopiowania niezabezpieczonych sekretów.
- Dopasuj build path `/Global/` do faktycznego hostingu; sprawdź assety i routing artykułów.
- Integruj wspólną tożsamość LUMINA; role tylko z backendu / Firebase custom claims.
- Zastąp robocze okładki zatwierdzonymi grafikami, jeśli wymagane.

## Etap 2 — rozwój platformy

- Użyj dostarczonego UI, stacji, playlist, premier i bazy artykułów jako fundamentu.
- Rozbuduj panel istniejącego CMS o redagowanie, review, publikację i wersjonowanie artykułów.
- Dodaj publikowane, redakcyjnie zatwierdzone tłumaczenia artykułów dla 10 języków, hreflang i odrębne URL.
- Dodaj rzeczywiste metadane „now playing” tylko gdy serwer stacji je udostępnia.
- Dodaj źródła i referencje do artykułów; wszystkie cytaty biblijne zgodne z licencją przekładu.
- Powiąż odtwarzacz z obecnym systemem audio w ekosystemie, jeśli zapewnia lepsze zachowanie na urządzeniach.

## Etap 3 — QA i publikacja

- Testuj: desktop 1920/1440, mobile 390/360, Safari i Chrome, sieć mobilna, dostępność klawiaturą, autoplay, audio error, popup-blocker.
- Sprawdź logowanie Google, tokeny, reguły Firestore, uprawnienia administratora, CSP, XSS, CORS, prawa autorskie.
- Sprawdź sitemap, canonical, Article JSON-LD, 404, linki, lazy iframe, wydajność i poprawność każdego języka.
- Wymagaj niezależnej recenzji Codex i Claude, wyników testów P0 i akceptacji właściciela.
- Nie wdrażaj automatycznie na produkcję.

## Raportowanie

W `skrzynka/TABLICA.md` i wiadomościach według `skrzynka/SZABLON_WIADOMOSCI.md`: etap, commit, pliki, testy, status PASS/FAIL/BLOCKED, ryzyka, następne kroki. Każdy błąd P0 blokuje deploy.
