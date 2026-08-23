# 🤖 CODEX AI ONBOARDING & ARCHITECTURE GUIDE (LUMINA & CHRISTIAN CULTURE)

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

1. **UTF-8 & Emoji Encoding Integrity:**
   - Always preserve UTF-8 encoding. Never corrupt Polish diacritics (`ą, ć, ę, ł, ń, ó, ś, ź, ż`) or emojis (`🕊️, 🙏, 👑, ✨, ☕, ❤️`).
2. **Protected Production Files (READ-ONLY):**
   - `cctv24-worship.html` and other active live TV streams are strictly frozen in production. Do not edit them unless explicitly ordered.
3. **Mission Control Privacy:**
   - Mission Control is the Commander's private panel. Never display or expose "Mission Control" text or references on public websites.
4. **Dual Git Remotes:**
   - Changes must be pushed to both remotes:
     - `origin`: `https://github.com/PolskieRadioChristianCulture/Strona-www-Christian-Culture`
     - `lumina-repo`: `https://github.com/PolskieRadioChristianCulture/Lumina-Web-App.git`
5. **No Regressions (Filar VIII):**
   - Never break working features when adding new enhancements. Validate JavaScript syntax across all scripts before pushing.

---

## 🚀 Common Commands & Scripts

### 1. Check JavaScript Syntax (Zero-Error Verification)
```powershell
node scratch/check_all_syntax.js
```

### 2. Commit and Push to Both Remotes
```powershell
git add .
git commit -m "feat/fix: descriptive message"
git push origin main
git push lumina-repo main
```

### 3. Deploy to Production
```powershell
firebase deploy --project lumina-cc --only hosting:lumina
```

---

## 👑 Authorized Commander Accounts
- `nazirczarkes@gmail.com` (Commander Nazir / Cezary Rogowski)
- `radiochristianculture@gmail.com` (Mission Christian Culture / AI Agent)
- `studiodees7@gmail.com` (Production & Media)
