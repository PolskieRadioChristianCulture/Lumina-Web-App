# System Odznak LUMINA — wdrożenie

## Filozofia (dlaczego tak, nie inaczej)
Każda odznaka jest przyznawana **wyłącznie przez Cloud Function**, na
podstawie prawdziwego zdarzenia w Firestore. Front-end nigdy nie decyduje
"zasłużyłeś" — tylko wyświetla to, co faktycznie zostało przyznane. To
bezpośrednia odpowiedź na wcześniej znalezione w portalu wzorce fałszywych
danych (matchScore, liczniki) — odznaki mają być ich przeciwieństwem.

## Pliki
| Plik | Rola |
|---|---|
| `lumina-badges-engine.js` | Front-end: katalog, renderowanie 3D CSS, galeria, check-iny passów |
| `functions/lumina-badges-functions.js` | Backend: jedyne miejsce przyznające odznaki |
| `lumina-sharing-suite.js` (zmieniony) | Teraz realnie zapisuje zdarzenie udostępnienia |

## Katalog (9 odznak, 3 kategorie)

**Doceniamy:** Fundator LUMINA (pierwsze 100 kont) · Rok w Rodzinie (365 dni) · Wierny Głos (30-dniowa passa logowań)
**Inspirujemy:** Poranny Wojownik Modlitwy (7 dni rozważania) · Uczeń Słowa (30 dni) · Czytelnik Cudów (14 dni CKD)
**Aktywizujemy:** Pierwszy Krok (pierwszy post) · Budowniczy Mostów (10 obserwujących) · Ambasador (5 udostępnień)

## Wdrożenie backendu

```bash
firebase deploy --only functions:onProfileCreatedCheckFounderBadge,functions:onPostCreatedCheckFirstStepBadge,functions:onFollowCreatedCheckBridgeBuilderBadge,functions:onShareCreatedCheckAmbassadorBadge,functions:scheduledDailyBadgeCheck
```

## Wdrożenie front-endu — 3 kroki na każdej stronie profilu

1. **Dołącz silnik** (po `lumina-db.js`):
   ```html
   <script type="module" src="lumina-badges-engine.js?v=1"></script>
   ```

2. **Pokaż galerię odznak** — dodaj kontener i wywołaj po załadowaniu profilu:
   ```html
   <div id="profileBadgesGallery"></div>
   <script type="module">
     import { renderBadgeGallery } from './lumina-badges-engine.js';
     renderBadgeGallery('slug_ogladanego_profilu', 'profileBadgesGallery');
   </script>
   ```

3. **Podłącz check-iny** (żeby passy w ogóle miały dane):
   - Przy starcie aplikacji: `window.LuminaBadges.checkInDailyActivity()`
   - Gdy użytkownik otwiera poranne rozważanie: `window.LuminaBadges.checkInMorningDevotion()`
   - Gdy użytkownik otwiera wpis "Cuda Każdego Dnia": `window.LuminaBadges.checkInCkdRead()`
   - Modal "Nowa odznaka!" na własnym profilu: `window.LuminaBadges.listenForNewBadges()` (wywołaj raz, po zalogowaniu)

## Test
1. Zaloguj się testowym kontem, wykonaj pierwszy post na tablicy.
2. W ciągu kilku sekund powinien powstać dokument `lumina_user_badges/{uid}_first_step`.
3. Jeśli `listenForNewBadges()` jest aktywny na stronie, pojawi się modal
   z animacją 3D odznaki.
4. Galeria na profilu powinna pokazać tę odznakę w kolorze, resztę katalogu
   jako zablokowaną (wyszarzoną).

## Świadomie zostawione na później
- Odznaki nie mają jeszcze własnej strony "wszystkie osiągnięcia" — na razie
  tylko galeria na profilu.
- Próg "10 obserwujących" dla Budowniczego Mostów jest na sztywno w kodzie —
  do wyciągnięcia jako konfigurowalny próg, jeśli zechcesz go zmieniać bez
  wdrażania nowego kodu.
