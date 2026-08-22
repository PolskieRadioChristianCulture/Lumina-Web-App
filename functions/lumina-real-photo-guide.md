# Wymóg prawdziwego zdjęcia profilowego — wdrożenie

## Jak to działa
1. Ktoś ustawia/zmienia zdjęcie profilowe (`avatar` w `lumina_profiles/{uid}`).
2. Cloud Function automatycznie pyta Google Cloud Vision: "czy na tym zdjęciu
   jest ludzka twarz?".
3. **Jest twarz** → zdjęcie zostaje, `photoVerified: true`.
4. **Nie ma twarzy** → oryginalne zdjęcie trafia do `avatarPendingReview`
   (nic nie ginie), a pole `avatar` — to samo pole, które czyta czat, tablica,
   karuzela i profil — zostaje nadpisane logiem LUMINA. **Jedna zmiana w
   danych, efekt widoczny wszędzie**, bez dotykania kodu HTML w kilku plikach.
5. Właściciel profilu, wchodząc na SWÓJ profil, widzi pomarańczowy baner
   u góry strony z przyciskiem "Zmień zdjęcie teraz". Odwiedzający inni
   ludzie tego banera nie widzą — tylko logo zamiast zdjęcia.

## Dlaczego tak, a nie inaczej
Wykrywanie "czy to prawdziwe zdjęcie profilowe" nie da się zrobić regułą
w kodzie — to zadanie dla rozpoznawania obrazu. Detekcja twarzy przez Vision
API to sprawdzony, tani (1000 sprawdzeń/miesiąc gratis, potem ok. 1,50 USD za
1000) sposób na odróżnienie zdjęcia człowieka od grafiki, logo, memu czy
zdjęcia kwiatka. **Nie jest to jednak nieomylne** — zdjęcie z boku, w mocnym
cieniu, czy zwierzę zamiast człowieka też może zostać źle ocenione w obie
strony. Dlatego endpoint `adminOverridePhotoVerification` daje Ci ostatnie
słowo z panelu admina, niezależnie od werdyktu Vision API.

## Kroki wdrożenia

1. **Włącz Vision API** w konsoli Google Cloud (ten sam projekt co Firebase):
   https://console.cloud.google.com/apis/library/vision.googleapis.com
   — wymaga aktywnego billingu na projekcie (darmowy limit i tak pokryje
   normalny ruch).

2. **Backend**
   - Dodaj `lumina-photo-verification-functions.js` do `functions/`.
   - `npm install @google-cloud/vision` w katalogu `functions/`.
   - `firebase deploy --only functions:onProfileAvatarChanged,functions:backfillPhotoVerificationOnce,functions:adminOverridePhotoVerification`

3. **Jednorazowy przegląd wszystkich istniejących profili** (realizuje
   "wdróż na wszystkich profilach, które mają inną grafikę"):
   ```
   curl -X POST https://europe-west1-<project>.cloudfunctions.net/backfillPhotoVerificationOnce \
     -H "Authorization: Bearer $ICC_SHARED_SECRET"
   ```
   Zwraca podsumowanie: ile profili sprawdzono, ile zatwierdzono, ile
   oznaczono logiem. Od tego momentu funkcja z kroku 2 pilnuje już na bieżąco
   każdej nowej zmiany zdjęcia.

4. **Frontend** — `lumina-real-photo-frontend.patch` (albo cały plik
   `lumina-profile.PATCHED.html`) dodaje baner i wymusza logo nawet jeśli
   w przeglądarce jest stary, zapamiętany avatar w `localStorage`.

   To pokrywa dynamiczny podgląd profilu (`lumina-profile.html?u=...`) —
   czyli dokładnie ten sam plik i tę samą funkcję, w której wcześniej
   naprawialiśmy telemetrię i przyciski. Karuzela, czat i tablica w
   pozostałych plikach nie wymagają żadnej zmiany — czytają to samo pole
   `avatar`, więc podmiana widoczna jest automatycznie wszędzie tam też.

5. **Panel admina** — jeśli chcesz przycisk "Zatwierdź/Odrzuć zdjęcie"
   bezpośrednio w `lumina-admin-profile-suite.js` (obok istniejącego już
   ostrzeżenia "⚠️ Brak zdjęcia!"), daj znać — to prosty dodatek wywołujący
   `adminOverridePhotoVerification` z dwoma przyciskami.

## Test
- Ustaw sobie na koncie testowym zdjęcie logo/grafikę bez twarzy → po chwili
  (trigger działa asynchronicznie, zwykle 1–3 sekundy) `avatar` w Firestore
  powinien zmienić się na `lumina_logo.jpg`, a na profilu pojawi się baner.
- Ustaw prawdziwe zdjęcie z twarzą → `photoVerified: true`, avatar zostaje.
- Zaloguj się jako ktoś inny i wejdź na oznaczony profil → logo widoczne,
  baner NIE widoczny (bo to nie Twój profil).
