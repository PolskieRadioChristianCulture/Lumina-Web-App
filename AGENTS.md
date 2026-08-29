# 🤖 MULTI-AGENT INSTRUCTIONS (AGENTS.md) — CHRISTIAN CULTURE & LUMINA

## 🚨 NACZELNE HASŁO OPERACYJNE DOWÓDCY: `@ICC` (lub `@monit`)
Gdy Dowódca (Użytkownik) wpisze w czacie **`@ICC`** lub **`@monit`**, masz **bezwzględny obowiązek** natychmiast wygenerować pełny, ustrukturyzowany **Raport Gotowości Bojowej**:

```markdown
📡 PEŁNY MONIT OPERACYJNY [@ICC]:
* 🤖 **Aktywny Agent:** [Twoja Nazwa Agenta, np. Agent GPT / Antigravity / Gemini]
* 🎯 **Bieżące Zadanie:** [Nad czym dokładnie w tej sekundzie pracujesz]
* 📦 **Ostatni Commit:** [ID commita z git log -1] | Gałąź: main
* 🛡️ **Strażnik Kodu:** [Wynik: node scripts/straznik-kodu-check.js]
* 🌐 **Status Produkcji:** [Firebase Hosting: live / zsynchronizowano]
* 📋 **Następny Krok:** [Co robisz dalej / na co czekasz]
```

---

## 📡 MONIT PRZY KAŻDEJ AKCJI („Aktualnie pracuję nad...”)
Zawsze przed i w trakcie wykonywania kroków zadeklaruj:
`📡 MONIT OPERACYJNY: [Nazwa Agenta] ➔ Aktualnie pracuję nad: [opis zadania/pliku]...`

---

## 🔄 ROTACJA I ZASTĘPOWALNOŚĆ (Token-Limit Resilience)
Dowódca korzysta z bezpłatnych pakietów narzędzi AI. W dowolnym momencie danemu agentowi mogą skończyć się tokeny (Quota). Gdy zostajesz wywołany słowem *"kontynuuj"*, *"dokończ"* lub `@ICC`, sprawdź `git status` i natychmiast podejmij zadanie w punkcie przerwania.

---

## 📌 Project Overview
**LUMINA** is a premier Christian dating and community web platform and PWA part of the **Christian Culture** mission ecosystem.

- **Production Live URL:** `https://lumina-cc-b90b0.web.app` (Firebase project: `lumina-cc`)
- **Primary Domain:** `https://polskieradio.cc`
- **Tech Stack:**
  - Frontend: Vanilla JavaScript (ES6+), HTML5, CSS3, FontAwesome 6, Google Fonts (Outfit, Inter, Cinzel)
  - Backend / Database: Firebase Firestore (REST API & Client SDK), Firebase Auth (Google OAuth, Anonymous, Custom Tokens)
  - PWA: Service Worker (`sw-lumina.js`), Web Manifest (`manifest-lumina.json`)
  - Tooling: Node.js (v20+ / v24), Firebase CLI (`firebase-tools`), Git

---

## 📁 Key Project Files

| File | Purpose |
|---|---|
| `lumina.html` | Homepage, profile carousel, interactive discovery feed & community intro |
| `lumina-profile.html` | Dynamic profile viewer & creator (gallery, testimony, faith values, quick actions) |
| `lumina-tablica.html` | Community timeline, post creator, scripture verses & Christian engagement |
| `lumina.cezaryrgowski.html` | Founder Cezary Rogowski's official mission profile |
| `lumina.wiolettarogowska.html` | Community leader Wioletta Rogowska's official profile |
| `lumina-db.js` | Core database layer, real-time Firestore sync, local cache, chat normalization |
| `lumina-admin-profile-suite.js` | Master Admin HUD, profile editor, Commander AI Instant Chat modal, Agent Inspector (`@N`) |
| `lumina-bottom-nav.js` | Mobile navigation bar, drawer menu, notifications badge counters |
| `sw-lumina.js` | PWA Service Worker for offline caching and push notifications |
| `commander_ai_listener.js` | 24/7 background AI daemon processing Commander orders in real-time |

---

## 🛡️ Critical Architecture Rules & Constraints (Non-Negotiable)

1. **Egzekucja Strażnika Kodu przed commitem:**
   - Zawsze uruchom: `node scripts/straznik-kodu-check.js` (wymagane 0 naruszeń).
2. **UTF-8 & Emoji Encoding Integrity:**
   - Always preserve UTF-8 encoding. Never corrupt Polish diacritics (`ą, ć, ę, ł, ń, ó, ś, ź, ż`) or emojis (`🕊️, 🙏, 👑, ✨, ☕, ❤️`).
3. **Protected Production Files (READ-ONLY):**
   - `cctv24-worship.html` and other active live TV streams are strictly frozen in production. Do not edit them unless explicitly ordered.
4. **Mission Control Privacy:**
   - Mission Control is the Commander's private panel. Never display or expose "Mission Control" text or references on public websites.
5. **Dual Git Remotes:**
   - Changes must be pushed to both remotes:
     - `origin`: `https://github.com/PolskieRadioChristianCulture/Strona-www-Christian-Culture`
     - `lumina-repo`: `https://github.com/PolskieRadioChristianCulture/Lumina-Web-App.git`
