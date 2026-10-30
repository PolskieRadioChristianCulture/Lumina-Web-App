# Analityka EkoCC: GA4 + GSC + GTM + opcjonalny PostHog
WAŻNE: podłączyć do już istniejącej konfiguracji CC po sprawdzeniu czy GA4 jest już na stronie (unikać podwójnego page_view). Nie tworzyć osobnego konta bez zgody właściciela.

## Strumień danych
Identyfikator GA4: `G-REPLACE_AFTER_VERIFICATION` (placeholder), GTM: `GTM-REPLACE` (placeholder). Search Console właściwość istniejącej domeny. Raport Looker Studio z filtrem ścieżek `/Wioletta` i ewentualnymi slugami; ścieżki trzeba rzeczywiście potwierdzić.

## Zdarzenia
`chapter_start {book_id,chapter_id}`
`chapter_complete {book_id,chapter_id,completion_method}`
`chapter_progress {chapter_id,progress_bucket}` 25/50/75/100, bez każdego scrolla
`audio_play`, `audio_pause`, `audio_complete` bez danych prywatnych
`favorite_add`, `bookmark_add`, `share` {method,chapter_id}
`newsletter_signup` wyłącznie agregacja po potwierdzeniu zapisu
`support_click` {amount_bucket}; `support_complete` wyłącznie po potwierdzeniu transakcji, bez PII ani szczegółów płatności.
`login` {method} bez adresów e-mail i identyfikatorów Google.

## Prywatność
Gating przed uruchomieniem narzędzi niewymaganych; Google Consent Mode v2 dopasowany do CMP i faktycznej jurysdykcji, szanuj odmowę. Nie rejestrować treści rozdziałów, komentarzy, wiadomości, danych płatności ani pełnych adresów e-mail jako parametrów. PostHog session replay tylko w ramach legalnej zgody i w pełni zamaskowanymi polami; nie włączyć domyślnie.

## Walidacja
Tag Assistant/GA4 DebugView, Network, brak duplikatów, test akceptuj/odmów/cofnij zgodę; GSC sprawdzenie własności, sitemap i indeksacji. Wymagane identyfikatory dostarcza operator.
