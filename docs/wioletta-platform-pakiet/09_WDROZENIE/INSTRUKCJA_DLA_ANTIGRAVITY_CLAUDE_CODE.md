# Polecenie wdrożeniowe — Antigravity / Claude Code

Projekt: https://polskieradio.cc/Wioletta. Najpierw audyt aktywnego repozytorium i infrastruktury, bez zmian produkcyjnych. Wykonaj backup i porównaj obecny UI z referencjami w `07_MATERIALY_ORIGINALNE`. Nie zmieniaj wyglądu (DESIGN FREEZE). Powieloną wersję hero na mobile popraw bez redesignu, zgodnie z akceptacją właściciela.

Użyj Taste Skill tylko jako pomocy do audytu jakości, nie jako upoważnienia do generowania nowej strony. Magic UI / Motion Primitives WYŁĄCZNIE jeśli mikrointerakcje pasują do istniejącej estetyki, bez degradacji Core Web Vitals; bez płatnych usług.

Kolejność: 0) audyt, 1) zatwierdzenie routingów i modelu danych, 2) P0 CMS + SSR/SSG rozdziałów + czytnik, 3) audio i modal wsparcia, 4) zabezpieczenia/SEO/GA4/CMP, 5) staging QA i akceptacja, 6) P1 SSO/komentarze/klub, 7) P2.

Każda integracja: realny URL/API, klucze w sekretnym magazynie, walidacja webhooków, test idempotencji i rollback. Wstrzymaj wdrożenie danego modułu, jeśli brak bezpiecznych danych. Raportuj DONE/TESTED/BLOCKED, listę zmian, commit hash, screenshot before/after, status 200 i wynik testu. Wymagane potwierdzenie autorki dla dat premier, treści i praw.

Nie publikuj fikcyjnych rozdziałów ani opinii. Nie twórz fikcyjnych płatności, komentarzy i nagrań. Chroń dane i prawa autorskie. Zasada ZERO COST: brak nowych abonamentów bez akceptacji.
