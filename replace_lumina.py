import re

with open('lumina.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace CSS Root & Body
content = re.sub(
    r':root \{.*?\/\* ──────────────────── NAVBAR ──────────────────── \*/',
    r''':root {
            --navy: #0f1535;
            --navy-deep: #0b1838;
            --accent-purple: #9d4edd;
            --accent-cyan: #00d2ff;
            --accent-magenta: #e01a4f;
            --text-muted: #94a3b8;
            --radius-lg: 20px;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: var(--navy-deep);
            min-height: 100vh;
            color: #fff;
            overflow-x: hidden;
        }

        /* ──────────────────── NAVBAR ──────────────────── */''',
    content, flags=re.DOTALL
)

# Replace Navbar CSS
content = re.sub(
    r'\.lumina-nav \{.*?\/\* ──────────────────── HERO ──────────────────── \*/',
    r'''.lumina-nav {
            position: sticky;
            top: 0;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 48px;
            background: #ffffff;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .nav-logo-text {
            font-size: 1.4rem;
            font-weight: 800;
            letter-spacing: 1.5px;
            color: #1e293b;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .nav-logo-text i { color: #eab308; }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 32px;
        }

        .nav-link {
            background: none;
            border: none;
            color: #475569;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            transition: color 0.2s;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .nav-link:hover { color: #0f172a; }
        .nav-badge {
            color: #ef4444;
            font-size: 0.9rem;
            font-weight: 700;
        }

        .btn-nav-cta {
            background: #2563eb;
            color: #fff;
            border: none;
            padding: 10px 26px;
            border-radius: 30px;
            font-weight: 700;
            font-size: 0.88rem;
            cursor: pointer;
            font-family: inherit;
            box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
            white-space: nowrap;
        }
        .btn-nav-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 22px rgba(37, 99, 235, 0.4);
        }

        @media (max-width: 768px) {
            .nav-links { display: none; }
            .lumina-nav { padding: 14px 20px; }
        }

        /* ──────────────────── HERO ──────────────────── */''',
    content, flags=re.DOTALL
)

# Replace Hero Button to Cards Section CSS
content = re.sub(
    r'\.btn-hero-main \{.*?\/\* Card body \*/',
    r'''.btn-hero-main {
            display: inline-block;
            background: linear-gradient(90deg, #d946ef, #0ea5e9);
            color: #fff;
            border: none;
            padding: 15px 42px;
            border-radius: 40px;
            font-weight: 800;
            font-size: 0.9rem;
            letter-spacing: 0.8px;
            cursor: pointer;
            font-family: inherit;
            box-shadow: 0 0 32px rgba(217,70,239,0.5), 0 0 60px rgba(14,165,233,0.3);
            transition: transform 0.25s, box-shadow 0.25s;
        }
        .btn-hero-main:hover {
            transform: scale(1.05);
            box-shadow: 0 0 42px rgba(217,70,239,0.7), 0 0 70px rgba(14,165,233,0.5);
        }

        /* ──────────────────── WAVE ──────────────────── */
        .wave-wrap {
            position: relative;
            z-index: 10;
            line-height: 0;
            margin-top: -2px;
        }
        .wave-wrap svg { display: block; width: 100%; }

        /* ──────────────────── CARDS SECTION ──────────────────── */
        .cards-section {
            background: transparent;
            padding: 0 48px 60px;
        }

        .profiles-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            max-width: 900px;
            margin: 0 auto;
            margin-top: -100px;
            position: relative;
            z-index: 20;
        }

        @media (max-width: 900px) {
            .profiles-grid {
                grid-template-columns: repeat(2, 1fr);
                margin-top: -30px;
            }
            .cards-section { padding: 0 20px 40px; }
        }
        @media (max-width: 580px) {
            .profiles-grid { grid-template-columns: 1fr; }
        }

        .profile-card {
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 8px 28px rgba(0,0,0,0.18);
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
            position: relative;
        }
        .profile-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 18px 42px rgba(0,0,0,0.22);
        }
        .profile-card.featured {
            transform: translateY(-12px);
            box-shadow: 0 18px 48px rgba(0,0,0,0.28);
        }
        .profile-card.featured:hover {
            transform: translateY(-17px);
        }

        .card-photo {
            position: relative;
            height: 240px;
            background: #e2e8f0;
            border-radius: 16px 16px 0 0;
        }
        .card-photo img {
            width: 100%; height: 100%; object-fit: cover; display: block;
            border-radius: 16px 16px 0 0;
        }

        .card-heart {
            position: absolute;
            top: 10px; right: 10px;
            width: 30px; height: 30px;
            border-radius: 50%;
            background: rgba(255,255,255,0.7);
            backdrop-filter: blur(6px);
            border: none; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            color: #cbd5e1; font-size: 0.9rem;
            transition: color 0.2s, background 0.2s;
        }
        .card-heart:hover, .card-heart.liked {
            color: #ef4444;
            background: rgba(255,255,255,0.92);
        }

        /* Match % badge – bottom right */
        .card-match {
            position: absolute;
            bottom: -22px; right: 20px;
            width: 44px; height: 44px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.72rem; font-weight: 900; color: #fff;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            box-shadow: 0 4px 14px rgba(0,0,0,0.3);
            border: 3px solid #fff;
            z-index: 5;
        }
        .profile-card:nth-child(2) .card-match {
            background: linear-gradient(135deg, #6d28d9, #ec4899);
        }
        .profile-card:nth-child(3) .card-match {
            background: linear-gradient(135deg, #0369a1, #06b6d4);
        }

        /* Card body */''',
    content, flags=re.DOTALL
)

# Replace Why Section CSS and add bottom layout
content = re.sub(
    r'\.card-body \{.*?\/\* ──────────────────── FOOTER ──────────────────── \*/',
    r'''.card-body {
            padding: 24px 16px 18px; 
            border-radius: 0 0 16px 16px;
        }
        .card-name {
            font-size: 1rem; font-weight: 800; color: #0f172a;
            margin-bottom: 2px;
        }
        .card-city {
            font-size: 0.8rem; color: #64748b; font-weight: 500;
            margin-bottom: 5px;
        }
        .card-desc {
            font-size: 0.78rem; color: #475569; line-height: 1.4;
        }

        /* ──────────────────── BOTTOM LAYOUT ──────────────────── */
        .bottom-layout {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 40px;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px 48px 80px;
        }
        @media (max-width: 850px) {
            .bottom-layout { grid-template-columns: 1fr; }
        }

        /* ──────────────────── WHY LUMINA ──────────────────── */
        .why-section {
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .why-title-line {
            font-size: 1.1rem;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #fff;
            margin-bottom: 40px;
        }

        .why-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }

        .why-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            cursor: pointer;
        }
        .why-icon-wrap {
            font-size: 2rem;
            color: #eab308;
            transition: transform 0.2s, text-shadow 0.2s;
        }
        .why-item:hover .why-icon-wrap {
            transform: scale(1.1);
            text-shadow: 0 0 15px rgba(234,179,8,0.4);
        }
        .why-label {
            font-size: 0.9rem; font-weight: 600;
            color: #e2e8f0; line-height: 1.4;
        }

        /* ──────────────────── QUICK MESSAGES WIDGET ──────────────────── */
        .messages-widget {
            background: #f8fafc;
            border-radius: 16px;
            padding: 24px;
            color: #0f172a;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            text-align: left;
        }
        .widget-title {
            font-size: 1.1rem;
            font-weight: 800;
            margin-bottom: 16px;
        }
        .notif-item {
            display: flex;
            align-items: center;
            gap: 12px;
            background: #fff;
            padding: 10px 12px;
            border-radius: 12px;
            margin-bottom: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            font-size: 0.8rem;
            font-weight: 600;
        }
        .notif-icon {
            width: 32px; height: 32px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; color: #fff;
        }
        .notif-icon.blue { background: #3b82f6; }
        .notif-icon.orange { background: #f59e0b; }
        .notif-count {
            margin-left: auto; width: 18px; height: 18px; border-radius: 50%;
            background: #ef4444; color: #fff; font-size: 0.65rem;
            display: flex; align-items: center; justify-content: center; font-weight: bold;
        }
        .users-title {
            font-size: 0.9rem; font-weight: 700; margin: 20px 0 12px;
        }
        .user-item {
            display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
        }
        .user-item img {
            width: 36px; height: 36px; border-radius: 50%; object-fit: cover;
        }
        .user-info { flex: 1; }
        .user-name { font-size: 0.85rem; font-weight: 700; }
        .user-status { font-size: 0.75rem; color: #64748b; }
        .status-dot {
            width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
        }

        /* ──────────────────── FOOTER ──────────────────── */''',
    content, flags=re.DOTALL
)

# Replace Footer CSS
content = re.sub(
    r'\.page-footer \{.*?\/\* ──────────────────── MODALS ──────────────────── \*/',
    r'''.page-footer {
            background: transparent;
            border-top: 1px solid rgba(255,255,255,0.1);
            padding: 22px 48px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 14px;
            font-size: 0.8rem;
            color: #94a3b8;
            max-width: 1100px;
            margin: 0 auto;
            width: 100%;
        }
        .footer-links-row { display: flex; gap: 18px; flex-wrap: wrap; }
        .footer-links-row a { color: #94a3b8; text-decoration: none; transition: color 0.2s; }
        .footer-links-row a:hover { color: #fff; }
        .footer-social { display: flex; gap: 14px; font-size: 1.1rem; }
        .footer-social a { color: #94a3b8; transition: color 0.2s; }
        .footer-social a:hover { color: #fff; }

        /* ──────────────────── MODALS ──────────────────── */''',
    content, flags=re.DOTALL
)

# Replace HTML Body
content = re.sub(
    r'<!-- ══════════ NAVBAR ══════════ -->.*?<!-- ══════════ PROFILE MODAL ══════════ -->',
    r'''<!-- ══════════ NAVBAR ══════════ -->
    <nav class="lumina-nav">
        <a href="index.html" class="nav-logo-text">
            <i class="fa-solid fa-sparkles"></i> LUMINA
        </a>

        <div class="nav-links">
            <a href="index.html" class="nav-link">Strona Główna</a>
            <button class="nav-link" onclick="scrollToSection('odkrywaj')">Odkrywaj</button>
            <button class="nav-link" onclick="showToast('Masz 3 nowe wiadomości! 💬')">
                Wiadomości <span class="nav-badge">(3)</span>
            </button>
            <button class="nav-link" onclick="openProfile('Twój Profil','28','Warszawa','Witaj w LUMINA!','https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500','100%')">Profil</button>
            <button class="nav-link" onclick="showToast('Sekcja Wydarzeń Lokalnych już wkrótce! 📍')">Wydarzenia</button>
        </div>

        <button class="btn-nav-cta" onclick="openAuth()">Zaloguj / Rejestracja</button>
    </nav>

    <!-- ══════════ HERO ══════════ -->
    <section class="hero-section">
        <div class="hero-bg"></div>
        <div class="hero-content">
            <h1 class="hero-title">Witaj w LUMINA&nbsp;–<br>Miejscu Głębszych Relacji.</h1>
            <p class="hero-sub">Rozpocznij swoją podróż do miłości z inteligentnym dopasowaniem.</p>
            <button class="btn-hero-main" onclick="openAuth()">ZAREJESTRUJ SIĘ ZA DARMO</button>
        </div>
    </section>

    <!-- ══════════ WAVE ══════════ -->
    <div class="wave-wrap">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" height="80" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,80 L0,40 Q180,0 360,32 Q540,64 720,32 Q900,0 1080,32 Q1260,64 1440,32 L1440,80 Z" fill="#ffffff"/>
        </svg>
    </div>

    <!-- ══════════ PROFILE CARDS ══════════ -->
    <section class="cards-section" id="odkrywaj">
        <div class="profiles-grid">

            <!-- Anna -->
            <div class="profile-card" onclick="openProfile('Anna','28','Warszawa','Uwielbia podróże i sztukę','https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500','94%')">
                <div class="card-photo">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500" alt="Anna" loading="lazy">
                    <button class="card-heart" onclick="toggleLike(event,this)"><i class="fa-solid fa-heart"></i></button>
                    <div class="card-match">94%</div>
                </div>
                <div class="card-body">
                    <div class="card-name">Anna, 28</div>
                    <div class="card-city">Warszawa</div>
                    <div class="card-desc">Uwielbia podróże i sztukę</div>
                </div>
            </div>

            <!-- Piotr (featured / center) -->
            <div class="profile-card featured" onclick="openProfile('Piotr','31','Kraków','Szuka spontanicznych przygód','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500','88%')">
                <div class="card-photo">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500" alt="Piotr" loading="lazy">
                    <button class="card-heart" onclick="toggleLike(event,this)"><i class="fa-solid fa-heart"></i></button>
                    <div class="card-match">88%</div>
                </div>
                <div class="card-body">
                    <div class="card-name">Piotr, 31</div>
                    <div class="card-city">Kraków</div>
                    <div class="card-desc">Szuka spontanicznych przygód</div>
                </div>
            </div>

            <!-- Julia -->
            <div class="profile-card" onclick="openProfile('Julia','26','Gdańsk','Marzycielka z pasją do muzyki','https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=500','91%')">
                <div class="card-photo">
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=500" alt="Julia" loading="lazy">
                    <button class="card-heart" onclick="toggleLike(event,this)"><i class="fa-solid fa-heart"></i></button>
                    <div class="card-match">91%</div>
                </div>
                <div class="card-body">
                    <div class="card-name">Julia, 26</div>
                    <div class="card-city">Gdańsk</div>
                    <div class="card-desc">Marzycielka z pasją do muzyki</div>
                </div>
            </div>

        </div>
    </section>

    <!-- ══════════ BOTTOM LAYOUT (WHY LUMINA + WIDGET) ══════════ -->
    <section class="bottom-layout">
        <div class="why-section">
            <div class="why-title-line">DLACZEGO LUMINA?</div>
            <div class="why-grid">
                <div class="why-item" onclick="showToast('Inteligentne Dopasowanie na podstawie wartości i wiary!')">
                    <div class="why-icon-wrap"><i class="fa-solid fa-user-group"></i></div>
                    <div class="why-label">Inteligentne<br>Dopasowanie</div>
                </div>
                <div class="why-item" onclick="window.location.href='lumina-safety.html'">
                    <div class="why-icon-wrap"><i class="fa-solid fa-shield-check"></i></div>
                    <div class="why-label">Weryfikacja<br>Profili</div>
                </div>
                <div class="why-item" onclick="showToast('Rekolekcje i spotkania singli chrześcijańskich!')">
                    <div class="why-icon-wrap"><i class="fa-solid fa-location-dot"></i></div>
                    <div class="why-label">Wydarzenia<br>Lokalne</div>
                </div>
            </div>
        </div>

        <div class="messages-widget">
            <div class="widget-title">Szybkie Wiadomości</div>
            <div class="notif-item">
                <div class="notif-icon blue"><i class="fa-solid fa-bell"></i></div>
                <div>Notyfikacja o nowościach w aplikacji</div>
                <div class="notif-count">1</div>
            </div>
            <div class="notif-item">
                <div class="notif-icon orange"><i class="fa-solid fa-bell"></i></div>
                <div>Notyfikacja na nowym dopasowaniu</div>
                <div class="notif-count">3</div>
            </div>

            <div class="users-title">Użytkownicy</div>
            <div class="user-item">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" alt="Ania">
                <div class="user-info">
                    <div class="user-name">Ania W.</div>
                    <div class="user-status">Online</div>
                </div>
                <div class="status-dot"></div>
            </div>
            <div class="user-item">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="Tomek">
                <div class="user-info">
                    <div class="user-name">Tomek K.</div>
                    <div class="user-status">Online</div>
                </div>
                <div class="status-dot"></div>
            </div>
        </div>
    </section>

    <!-- ══════════ FOOTER ══════════ -->
    <footer class="page-footer">
        <div>LUMINA © 2024</div>
        <div class="footer-links-row">
            <a href="lumina-safety.html">Regulamin</a>
            <a href="privacy.html">Polityka Prywatności</a>
            <a href="#">O Nas</a>
            <a href="index.html#contact-section">Kontakt</a>
        </div>
        <div class="footer-social">
            <a href="https://facebook.com" target="_blank"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="https://instagram.com" target="_blank"><i class="fa-brands fa-instagram"></i></a>
            <a href="https://linkedin.com" target="_blank"><i class="fa-brands fa-linkedin-in"></i></a>
        </div>
    </footer>

    <!-- ══════════ PROFILE MODAL ══════════ -->''',
    content, flags=re.DOTALL
)

with open('lumina.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
