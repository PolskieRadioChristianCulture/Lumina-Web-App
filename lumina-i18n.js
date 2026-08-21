// ══════════════════════════════════════════════════════════════════════════
// LUMINA MULTI-LANGUAGE SYSTEM (i18n: Polish & English Dynamic Translation Engine)
// ══════════════════════════════════════════════════════════════════════════

(function() {
    'use strict';

    // Comprehensive Polish <-> English phrase glossary
    const PHRASE_MAP = [
        // Navigation
        { pl: 'Główna', en: 'Home' },
        { pl: 'Tablica', en: 'Feed' },
        { pl: 'Odkrywaj', en: 'Discover' },
        { pl: 'Wiadomości', en: 'Messages' },
        { pl: 'Polecaj', en: 'Share' },
        { pl: 'Mój Profil', en: 'My Profile' },
        { pl: 'Zaloguj / Rejestracja', en: 'Log In / Register' },
        { pl: 'Zaloguj się', en: 'Log In' },
        { pl: 'Zaloguj', en: 'Log In' },
        { pl: 'Wyloguj', en: 'Log Out' },
        { pl: 'Dołącz Teraz', en: 'Join Now' },
        { pl: 'Zmień język', en: 'Change language' },
        { pl: 'Przełącz na język angielski', en: 'Switch to English' },
        { pl: 'Przełącz na język polski', en: 'Switch to Polish' },

        // Hero & Header
        { pl: 'Społeczność Ludzi Wiary & Wartości', en: 'Community of Faith & Values' },
        { pl: 'Chrześcijańska Społeczność', en: 'Christian Community' },
        { pl: 'Głębsze Relacje', en: 'Deeper Relationships' },
        { pl: 'Odkrywaj wartościowe profile, inspiruj się na żywo na Tablicy Społeczności', en: 'Discover meaningful profiles, get inspired live on the Community Feed' },
        { pl: 'i buduj relacje zakorzenione w Chrystusie.', en: 'and build relationships rooted in Christ.' },
        { pl: 'Szukaj po imieniu, nazwisku, mieście, powołaniu...', en: 'Search by name, surname, city, calling...' },

        // Filters & Tabs
        { pl: 'Wszyscy', en: 'All' },
        { pl: 'Kobiety', en: 'Women' },
        { pl: 'Mężczyźni', en: 'Men' },
        { pl: '18–30 lat', en: '18–30 yrs' },
        { pl: 'Założyciele', en: 'Founders' },
        { pl: 'Wszystkie Wpisy', en: 'All Posts' },
        { pl: 'Świadectwa & Wiara', en: 'Testimonies & Faith' },
        { pl: 'Modlitwy Live', en: 'Live Prayers' },
        { pl: 'Kanały Nadawcze', en: 'Broadcast Channels' },
        { pl: 'Rozważanie Dnia', en: 'Daily Devotion' },
        { pl: 'Cykl: Dobrze, że jesteś', en: 'Series: Good to have you' },
        { pl: 'Oficjalny Kanał Portalu LUMINA', en: 'Official LUMINA Portal Channel' },

        // Actions & Interactions
        { pl: 'Zaproś na kawę', en: 'Invite for coffee' },
        { pl: 'Kawa ☕', en: 'Coffee ☕' },
        { pl: 'Kawa', en: 'Coffee' },
        { pl: 'Wiadomość', en: 'Message' },
        { pl: 'Błogosławieństwo', en: 'Blessing' },
        { pl: 'Modlitwa', en: 'Prayer' },
        { pl: 'Komentarze', en: 'Comments' },
        { pl: 'Komentuj', en: 'Comment' },
        { pl: 'Polub', en: 'Like' },
        { pl: 'Amen', en: 'Amen' },
        { pl: 'Udostępnij', en: 'Share' },
        { pl: 'Zapisz', en: 'Save' },
        { pl: 'Edytuj Profil', en: 'Edit Profile' },
        { pl: 'Edytuj Mój Profil', en: 'Edit My Profile' },
        { pl: 'Edycja Profilu', en: 'Profile Edit' },
        { pl: 'Dodaj Wpis', en: 'Add Post' },
        { pl: 'Opublikuj Wpis', en: 'Publish Post' },
        { pl: 'Napisz coś budującego dla społeczności...', en: 'Write something uplifting for the community...' },
        { pl: 'Napisz komentarz...', en: 'Write a comment...' },
        { pl: 'Napisz wiadomość...', en: 'Write a message...' },
        { pl: 'Wyślij', en: 'Send' },
        { pl: 'Anuluj', en: 'Cancel' },
        { pl: 'Zamknij', en: 'Close' },
        { pl: 'Zatwierdź', en: 'Confirm' },
        { pl: 'Usuń', en: 'Delete' },
        { pl: 'Zablokuj', en: 'Block' },
        { pl: 'Zgłoś', en: 'Report' },
        { pl: 'Zgłoś Naruszenie Zasad', en: 'Report Violation' },
        { pl: 'Prześlij Zgłoszenie', en: 'Submit Report' },

        // Match modal
        { pl: 'TO DOPASOWANIE! 💖', en: 'IT’S A MATCH! 💖' },
        { pl: 'Oboje wyraziliście chęć bliższego poznania w Bożym pokoju!', en: 'Both of you expressed the desire to connect in God’s peace!' },
        { pl: 'Napisz Pierwszą Wiadomość 💌', en: 'Send First Message 💌' },
        { pl: 'Odkrywaj Dalej ✨', en: 'Keep Browsing ✨' },

        // Chat & Messaging
        { pl: 'Skrzynka Wiadomości', en: 'Direct Messages' },
        { pl: 'Twoje rozmowy w społeczności LUMINA', en: 'Your conversations in the LUMINA community' },
        { pl: 'Aktywny w Chrystusie 🕊️', en: 'Active in Christ 🕊️' },
        { pl: 'Brak wiadomości. Rozpocznij rozmowę!', en: 'No messages yet. Start the conversation!' },

        // PWA & Mobile
        { pl: 'Zainstaluj LUMINA na telefonie', en: 'Install LUMINA on your phone' },
        { pl: 'Zainstaluj Aplikację LUMINA', en: 'Install LUMINA App' },
        { pl: 'Zainstaluj na ekranie głównym telefonu dla błyskawicznego dostępu!', en: 'Install on your home screen for instant access!' },
        { pl: 'Instaluj', en: 'Install' },
        { pl: 'Zainstaluj', en: 'Install' },
        { pl: 'Rozumiem, dziękuję! ✨', en: 'Got it, thank you! ✨' },

        // Feed & Details
        { pl: 'Brak wpisów w wybranej kategorii', en: 'No posts in this category' },
        { pl: 'Wybierz inną zakładkę lub dodaj nową publikację.', en: 'Select another tab or create a new post.' },
        { pl: 'Trwa ładowanie rozważania...', en: 'Loading devotional...' },
        { pl: 'Wczytywanie postów...', en: 'Loading posts...' },
        { pl: 'Dzisiaj', en: 'Today' },
        { pl: 'Wczoraj', en: 'Yesterday' },
        { pl: 'Wszystkie prawa zastrzeżone.', en: 'All rights reserved.' }
    ];

    // Read stored language or default to Polish
    let currentLuminaLang = localStorage.getItem('lumina_lang') || sessionStorage.getItem('lumina_lang') || 'pl';
    if (document.cookie.includes('googtrans=/pl/en') || document.cookie.includes('googtrans=%2Fpl%2Fen')) {
        currentLuminaLang = 'en';
    }

    // Direct text replacement for nodes
    function translateText(text, targetLang) {
        if (!text || typeof text !== 'string') return text;
        let result = text;
        
        for (const item of PHRASE_MAP) {
            const from = targetLang === 'en' ? item.pl : item.en;
            const to = targetLang === 'en' ? item.en : item.pl;
            
            if (result === from) {
                return to;
            }
            if (result.includes(from) && from.length > 3) {
                result = result.split(from).join(to);
            }
        }
        return result;
    }

    // Walk DOM tree safely to translate texts without destroying event handlers or icons
    function translateDOM(rootNode, targetLang) {
        if (!rootNode) return;

        // 1. Data-i18n attributes
        rootNode.querySelectorAll?.('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const found = PHRASE_MAP.find(p => p.pl === key || p.en === key);
            if (found) {
                el.textContent = targetLang === 'en' ? found.en : found.pl;
            }
        });

        // 2. Input Placeholders
        rootNode.querySelectorAll?.('input[placeholder], textarea[placeholder]').forEach((el) => {
            const currentPh = el.getAttribute('placeholder');
            if (currentPh) {
                el.placeholder = translateText(currentPh, targetLang);
            }
        });

        // 3. Button titles & standard tooltips
        rootNode.querySelectorAll?.('[title]').forEach((el) => {
            const t = el.getAttribute('title');
            if (t) el.title = translateText(t, targetLang);
        });

        // 4. Translate child text nodes inside buttons, links, headings, badges, labels
        const targetElements = rootNode.querySelectorAll?.('a, button, h1, h2, h3, h4, h5, p, span, .nav-link, .btn-nav-cta-text, .filter-chip, .badge-type-tag, .post-action-btn, .hero-pill-badge, .hero-title, .hero-subtitle');
        
        if (targetElements) {
            targetElements.forEach((el) => {
                // Skip if it contains script or code
                if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.classList.contains('lang-switcher-btn')) return;

                el.childNodes.forEach((node) => {
                    if (node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.trim().length > 0) {
                        const trimmed = node.nodeValue.trim();
                        const translated = translateText(trimmed, targetLang);
                        if (translated !== trimmed) {
                            node.nodeValue = node.nodeValue.replace(trimmed, translated);
                        }
                    }
                });
            });
        }

        // 5. Update Language Switcher Buttons
        document.querySelectorAll('.lang-switcher-btn').forEach((btn) => {
            btn.textContent = targetLang === 'en' ? '🇬🇧' : '🇵🇱';
            btn.title = targetLang === 'en' ? 'Przełącz na język polski 🇵🇱' : 'Switch to English 🇬🇧';
        });

        const langToggleText = document.getElementById('langToggleText');
        if (langToggleText) {
            langToggleText.textContent = targetLang === 'en' ? 'PL' : 'EN';
        }
    }

    // Set Language API
    function setLanguage(lang, triggerToast = true) {
        if (lang !== 'pl' && lang !== 'en') lang = 'pl';
        currentLuminaLang = lang;
        
        localStorage.setItem('lumina_lang', lang);
        sessionStorage.setItem('lumina_lang', lang);

        // Sync Google Translate Cookies for full site coverage
        if (lang === 'en') {
            document.cookie = "googtrans=/pl/en; path=/";
            document.cookie = "googtrans=/pl/en; path=/; domain=" + window.location.hostname;
        } else {
            document.cookie = "googtrans=/pl/pl; path=/";
            document.cookie = "googtrans=/pl/pl; path=/; domain=" + window.location.hostname;
        }

        // Apply DOM Translations immediately
        translateDOM(document.body, lang);

        // Notify app components
        document.dispatchEvent(new CustomEvent('lumina:langChange', { detail: { lang } }));

        // Show friendly toast feedback
        if (triggerToast && typeof window.showToast === 'function') {
            if (lang === 'en') {
                window.showToast('🇬🇧 Language switched to English');
            } else {
                window.showToast('🇵🇱 Język przełączony na polski');
            }
        }
    }

    // Toggle Language
    function toggleLanguage() {
        const nextLang = currentLuminaLang === 'pl' ? 'en' : 'pl';
        setLanguage(nextLang, true);
    }

    // Translation helper t()
    function t(key) {
        const found = PHRASE_MAP.find(p => p.pl === key || p.en === key);
        if (found) {
            return currentLuminaLang === 'en' ? found.en : found.pl;
        }
        return translateText(key, currentLuminaLang);
    }

    // Initialize
    function init() {
        // Sync button states on load
        document.querySelectorAll('.lang-switcher-btn').forEach((btn) => {
            btn.textContent = currentLuminaLang === 'en' ? '🇬🇧' : '🇵🇱';
            btn.title = currentLuminaLang === 'en' ? 'Przełącz na język polski 🇵🇱' : 'Switch to English 🇬🇧';
        });

        if (currentLuminaLang === 'en') {
            translateDOM(document.body, 'en');
        }
    }

    // Global Public API
    window.LuminaI18n = {
        getLang: () => currentLuminaLang,
        setLang: setLanguage,
        toggle: toggleLanguage,
        t: t,
        apply: () => translateDOM(document.body, currentLuminaLang)
    };

    window.toggleLanguage = toggleLanguage;
    window.setLuminaLanguage = setLanguage;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

// Support ES module import syntax if imported via <script type="module">
export const getLuminaLanguage = () => window.LuminaI18n?.getLang() || 'pl';
export const setLuminaLanguage = (l) => window.LuminaI18n?.setLang(l);
export const toggleLanguage = () => window.LuminaI18n?.toggle();
export const t = (k) => window.LuminaI18n?.t(k) || k;
export const applyLuminaTranslations = () => window.LuminaI18n?.apply();
export default window.LuminaI18n;
