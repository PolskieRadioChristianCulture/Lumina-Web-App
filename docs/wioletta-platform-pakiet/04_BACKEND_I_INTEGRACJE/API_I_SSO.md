# Integracje i API — wymagania
Publiczne `GET /api/books`, `GET /api/books/:slug/chapters`, `GET /api/chapters/:id` plus HTML SSR/SSG; bez ujawniania draftów.
Autoryzowane `GET/PUT /api/me/reading-position`, `POST/DELETE /api/me/favorites`, `POST /api/comments`, `POST /api/comments/:id/report`.
Autorskie `POST /api/admin/chapters`, `PATCH /api/admin/chapters/:id`, `POST /api/admin/chapters/:id/approve`, `POST /api/admin/chapters/:id/schedule` wymagają RBAC/CSRF.
OAuth Google: OAuth 2/OIDC, `state`+PKCE, walidacja ID token audience/issuer/expiry/nonce, sesje HttpOnly Secure SameSite, redirect allowlist; nie przyjmować samych e-maili jako dowodu tożsamości.
LUMINA: SSO tylko gdy jest sprawdzony issuer/token introspection/JWKS lub serwerowy most. Bez tworzenia „fikcyjnego” przycisku logowania. Konta łączyć wyłącznie z potwierdzoną zgodą, nie tylko po e-mailu.
LUMINA Messenger: dedykowany klub/kanał po weryfikacji istniejącego API, moderacja, opt-in, nie ujawniać prywatnych treści w publicznych komentarzach.
Komentarze: sanitizacja, rate limit, anti-spam, zgłoszenia, oznaczanie spoilerów, uprawnienia moderatorów; obowiązkowa polityka treści.
Newsletter: double opt-in tam gdzie właściwe, link rezygnacji, oddzielne zgody, rekord pochodzenia zgody; nie implementować przed wyborem dostawcy.
