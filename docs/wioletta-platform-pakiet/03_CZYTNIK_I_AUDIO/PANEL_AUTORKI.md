# Gabinet autorki
Role: author/editor/moderator/admin. Zawartość: tomy; rozdziały (draft/in_review/approved/scheduled/published/archived), historia wersji, diff, tytuły i opisy SEO, audio + transkrypt, data publikacji strefa Europe/Warsaw, podgląd mobile/desktop, embargo, lista błędów publikacji, kalendarz, moderacja.

Workflow: draft -> review -> approved -> scheduled -> publish job -> production verification (HTTP 200, canonical, sitemap, media response) -> published. Retry idempotentny; nie generować duplikatów. Jeśli awaria: stan failed i powiadomienie operatora. Daty publiczne dopiero po zatwierdzeniu autorki. Publikacja ręczna również musi trafić do rejestru.

Bezpieczne R2/S3 lub istniejący magazyn plików dla audio, podpisane uploady, limity wielkości, walidacja MIME, skanowanie/odrzucanie niedozwolonych rozszerzeń. Wersjonowanie, backup i regularny test przywracania.
