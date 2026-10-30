# RODO, PKE ART. 398 I TREŚCI ZGÓD DO AKCEPTACJI WŁAŚCICIELA (`CCNL-004`)

**Data przygotowania:** 2026-10-30  
**Identyfikator:** `CCNL-004`  
**Status prawny:** Projekt wdrożeniowy zgodny z RODO (UE 2016/679), ustawą o świadczeniu usług drogą elektroniczną oraz Prawem komunikacji elektronicznej (PKE, art. 398).  
**Wymagana bramka L0:** Przed włączeniem realnej wysyłki produkcyjnej (`NEWSLETTER_DELIVERY_ENABLED=true`) Właściciel potwierdza pełne dane rejestrowe i adresowe Administratora wyświetlane w stopce wiadomości e-mail.

---

## 1. Zasady Nadrzędne Ochrony Prywatności i Danych Szczególnej Kategorii (Art. 9 RODO)

1. **Brak profilowania wyznaniowego i światopoglądowego:**
   - Newsletter EkoCC służy wyłącznie dostarczaniu zamówionych przez subskrybenta informacji redakcyjnych o nowościach, muzyce, kulturze, literaturze, studiach biblijnych i zasobach edukacyjnych ekosystemu Christian Culture.
   - System **nie wnioskuje, nie przypisuje ani nie przetwarza wyznania, przekonań religijnych ani stanu zdrowia** subskrybenta. Zapis na kategorię tematyczną (np. *Biblia, Rozważania i Akademia* lub *Rodzina, Zdrowie, Kuchnia i Rozwój*) jest wyłącznie wyborem tematyki otrzymywanych publikacji prasowych/edukacyjnych.
2. **Brak domyślnie zaznaczonych zgód:**
   - Checkbox zgody w formularzu jest **zawsze odznaczony domyślnie** (`checked = false`). Próba wysłania formularza bez aktywnego zaznaczenia zgody jest blokowana zarówno w UI, jak i po stronie serwera (`400 CONSENT_REQUIRED`).
3. **Minimalizacja danych i anonimizacja dowodów:**
   - Zbieramy wyłącznie: adres e-mail, opcjonalne imię, wybrany język (`pl`/`en`/`de`), wybrane kategorie tematyczne (`topics`), portal źródłowy (`source_portal`) oraz techniczny dowód zgody (znacznik czasu UTC, identyfikator wersji klauzuli `consent_version`, skrót SHA-256 adresu IP `ip_hash` z solą oraz skrót SHA-256 nagłówka przeglądarki `user_agent_hash`). Surowy adres IP nie jest trwale przechowywany w bazie subskrybentów.
4. **Ochrona dzieci (LUMI KIDS):**
   - Formularz newslettera nie jest wyświetlany w aplikacji dziecięcej `lumi-kids`. W klauzuli formularza zawarto informację, że subskrypcja przeznaczona jest dla osób, które ukończyły 16 lat (lub działają za zgodą opiekuna prawnego).

---

## 2. Wersjonowana Treść Zgody pod Formularzem (`consent_version = "2026-10-30-v1"`)

### Wersja Polska (`pl`)
> ☐ **Wyrażam zgodę na otrzymywanie drogą elektroniczną na podany adres e-mail newslettera ekosystemu Christian Culture (`polskieradio.cc`)** obejmującego wybrane przeze mnie kategorie tematyczne (nowości, audycje, artykuły, kursy i wydawnictwa), zgodnie z art. 398 Prawa komunikacji elektronicznej oraz art. 6 ust. 1 lit. a RODO. Wiem, że zapis wymaga potwierdzenia linku wysłanego na mój e-mail (Double Opt-In), a zgodę mogę wycofać w każdej chwili jednym kliknięciem w stopce każdej wiadomości lub na stronie `/newsletter/unsubscribe`. Oświadczam, że mam ukończone 16 lat. Szczegóły w [Polityce Prywatności](/privacy#newsletter).

### Wersja Angielska (`en`)
> ☐ **I consent to receive the Christian Culture ecosystem (`polskieradio.cc`) newsletter by email** covering my selected topic categories (news, broadcasts, articles, courses, and publications), in accordance with GDPR Art. 6(1)(a) and applicable electronic communications law. I understand that subscription requires confirming a link sent to my email (Double Opt-In), and that I can withdraw my consent at any time with one click in the footer of every email or at `/newsletter/unsubscribe`. I confirm that I am at least 16 years old. Details in the [Privacy Policy](/privacy#newsletter).

### Wersja Niemiecka (`de`)
> ☐ **Ich willige ein, den Newsletter des Christian Culture Ökosystems (`polskieradio.cc`) per E-Mail** zu den von mir gewählten Themenkategorien (Neuigkeiten, Sendungen, Artikel, Kurse und Publikationen) gemäß Art. 6 Abs. 1 lit. a DSGVO zu erhalten. Mir ist bekannt, dass die Anmeldung über einen Bestätigungslink (Double Opt-In) aktiviert wird und ich meine Einwilligung jederzeit mit einem Klick in jeder E-Mail oder unter `/newsletter/unsubscribe` widerrufen kann. Ich bestätige, dass ich mindestens 16 Jahre alt bin. Details in der [Datenschutzerklärung](/privacy#newsletter).

---

## 3. Skrócona Klauzula Informacyjna RODO pod Formularzem (Warstwa Pierwsza)

- **Administrator danych:** Christian Culture / Polskie Radio Christian Culture (niezależna chrześcijańska inicjatywa medialno-misyjna, `https://polskieradio.cc`, kontakt: `radiochristianculture@gmail.com`). *Dane rejestrowe do potwierdzenia przez Właściciela przed uruchomieniem wysyłki produkcyjnej: `[DO UZUPEŁNIENIA PRZEZ WŁAŚCICIELA — pełna nazwa podmiotu i adres siedziby]`.*
- **Cel i podstawa prawna:**
  1. Wysyłka zamówionego newslettera w wybranych kategoriach tematycznych — na podstawie Twojej dobrowolnej zgody (art. 6 ust. 1 lit. a RODO w zw. z art. 398 PKE).
  2. Udokumentowanie faktu wyrażenia lub wycofania zgody oraz obrona przed ewentualnymi roszczeniami i zapobieganie niechcianej wysyłce (lista supresji w postaci skrótu SHA-256) — prawnie uzasadniony interes Administratora (art. 6 ust. 1 lit. f RODO).
- **Okres przechowywania (Retencja):**
  - Zgłoszenia niepotwierdzone (`pending_confirmation`): usuwane automatycznie po **7 dniach** od wygaśnięcia 48-godzinnego tokenu potwierdzającego.
  - Subskrypcje aktywne (`active`): przez czas trwania subskrypcji do momentu wycofania zgody.
  - Po wycofaniu zgody (`unsubscribed`) lub zgłoszeniu usunięcia danych: wysyłka ustaje natychmiast; pełny adres e-mail zostaje usunięty z bazy operacyjnej, a w tabeli supresji (`newsletter_suppressions`) zachowywany jest wyłącznie nieodwracalny skrót kryptograficzny SHA-256 (`email_hash`) oraz dziennik zdarzeń zgody przez okres przedawnienia roszczeń (maksymalnie 3 lata), aby zagwarantować, że na ten adres nie zostanie ponownie wysłana niechciana wiadomość.
- **Odbiorcy danych (Procesorzy):** Dostawca infrastruktury krawędziowej i bazodanowej Cloudflare, Inc. (Cloudflare Pages / Workers / D1, z zastosowaniem Standardowych Klauzul Umownych UE) oraz — po zatwierdzeniu przez Właściciela — autoryzowany dostawca transportu pocztowego (`[DO UZUPEŁNIENIA PRZEZ WŁAŚCICIELA]`).
- **Twoje prawa:** Prawo dostępu do danych, sprostowania, usunięcia („prawo do bycia zapomnianym”), ograniczenia przetwarzania, przenoszenia danych, cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania przed jej cofnięciem) oraz prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO).

---

## 4. Obowiązkowa Stopka Każdej Wiadomości Newslettera (Compliance Gate)

System zawiera programową bramkę zgodności (`validateCampaignCompliance` w `services/cc-newsletter/newsletter-service.js`), która **blokuje wysyłkę kampanii**, jeśli szablon nie zawiera:
1. Wyraźnego oznaczenia nadawcy: **Ekosystem Christian Culture (`polskieradio.cc`)** wraz z adresem kontaktowym Administratora (`radiochristianculture@gmail.com`).
2. Informacji o przyczynie otrzymania wiadomości (*„Otrzymujesz tę wiadomość, ponieważ potwierdziłeś(-aś) zapis na Newsletter EkoCC na portalu `{{source_portal}}`”*).
3. Działającego linku do natychmiastowego wypisu 1 kliknięciem: `https://polskieradio.cc/newsletter/unsubscribe?token={{unsubscribe_token}}`.
4. Działającego linku do zarządzania wybranymi kategoriami tematycznymi: `https://polskieradio.cc/newsletter/manage?token={{manage_token}}`.
5. Nagłówków technicznych RFC 2369 i RFC 8058:
   - `List-Unsubscribe: <https://polskieradio.cc/api/newsletter/unsubscribe?token={{unsubscribe_token}}>, <mailto:radiochristianculture@gmail.com?subject=unsubscribe>`
   - `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
