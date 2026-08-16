// ══════════════════════════════════════════════════════════════════════════
// LUMINA MULTI-LANGUAGE SYSTEM (i18n: Polish & English Engine)
// ══════════════════════════════════════════════════════════════════════════

const LUMINA_TRANSLATIONS = {
    pl: {
        'nav.discover': 'Odkrywaj',
        'nav.board': 'Tablica Społeczności',
        'nav.messages': 'Wiadomości',
        'nav.profile': 'Mój Profil',
        'nav.login': 'Zaloguj się',
        'nav.register': 'Dołącz Teraz',
        'hero.title': 'LUMINA – Chrześcijańska Społeczność i Głębsze Relacje',
        'hero.subtitle': 'Odkryj ludzi o tych samych wartościach, przeglądaj posty i inspiracje na żywo na Tablicy Społeczności oraz buduj relacje zakorzenione w Chrystusie.',
        'filter.all': 'Wszyscy',
        'filter.women': 'Kobiety',
        'filter.men': 'Mężczyźni',
        'filter.young': '18–30 lat',
        'filter.founders': 'Założyciele',
        'match.title': 'TO DOPASOWANIE! 💖',
        'match.subtitle': 'Oboje wyraziliście chęć bliższego poznania w Bożym pokoju!',
        'match.sendMsg': 'Napisz Pierwszą Wiadomość 💌',
        'match.keepBrowsing': 'Odkrywaj Dalej ✨',
        'chat.title': 'Skrzynka Wiadomości',
        'chat.subtitle': 'Twoje rozmowy w społeczności LUMINA',
        'chat.activeInChrist': 'Aktywny w Chrystusie 🕊️',
        'chat.quickBless': '🕊️ Błogosławieństwo',
        'chat.quickPray': '🙏 Modlitwa',
        'chat.quickCoffee': '☕ Kawa',
        'chat.placeholder': 'Napisz wiadomość...',
        'report.title': 'Zgłoś Naruszenie Zasad',
        'report.btn': 'Prześlij Zgłoszenie',
        'profile.message': 'Wiadomość',
        'profile.coffee': 'Kawa ☕',
        'profile.edit': 'Edytuj Mój Profil'
    },
    en: {
        'nav.discover': 'Discover',
        'nav.board': 'Community Feed',
        'nav.messages': 'Messages',
        'nav.profile': 'My Profile',
        'nav.login': 'Log In',
        'nav.register': 'Join Now',
        'hero.title': 'LUMINA – Christian Community & Meaningful Relationships',
        'hero.subtitle': 'Discover people sharing your faith, explore live community inspirations, and build relationships rooted in Christ.',
        'filter.all': 'All',
        'filter.women': 'Women',
        'filter.men': 'Men',
        'filter.young': '18–30 yrs',
        'filter.founders': 'Founders',
        'match.title': 'IT’S A MATCH! 💖',
        'match.subtitle': 'Both of you expressed the wish to connect in God’s peace!',
        'match.sendMsg': 'Send First Message 💌',
        'match.keepBrowsing': 'Keep Browsing ✨',
        'chat.title': 'Direct Messages',
        'chat.subtitle': 'Your conversations in LUMINA community',
        'chat.activeInChrist': 'Active in Christ 🕊️',
        'chat.quickBless': '🕊️ Blessing',
        'chat.quickPray': '🙏 Prayer',
        'chat.quickCoffee': '☕ Coffee',
        'chat.placeholder': 'Write a message...',
        'report.title': 'Report Violation',
        'report.btn': 'Submit Report',
        'profile.message': 'Message',
        'profile.coffee': 'Coffee ☕',
        'profile.edit': 'Edit My Profile'
    }
};

let currentLuminaLang = localStorage.getItem('lumina_lang') || 'pl';

export function getLuminaLanguage() {
    return currentLuminaLang;
}

export function setLuminaLanguage(lang) {
    if (lang !== 'pl' && lang !== 'en') lang = 'pl';
    currentLuminaLang = lang;
    localStorage.setItem('lumina_lang', lang);
    applyLuminaTranslations();
    document.dispatchEvent(new CustomEvent('lumina:langChange', { detail: { lang } }));
}

export function t(key) {
    return LUMINA_TRANSLATIONS[currentLuminaLang]?.[key] || LUMINA_TRANSLATIONS['pl']?.[key] || key;
}

export function applyLuminaTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key && LUMINA_TRANSLATIONS[currentLuminaLang]?.[key]) {
            el.textContent = LUMINA_TRANSLATIONS[currentLuminaLang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key && LUMINA_TRANSLATIONS[currentLuminaLang]?.[key]) {
            el.placeholder = LUMINA_TRANSLATIONS[currentLuminaLang][key];
        }
    });

    // Update Flag Buttons (Flag Only - No Text)
    document.querySelectorAll('.lang-switcher-btn').forEach((btn) => {
        btn.textContent = currentLuminaLang === 'pl' ? '🇵🇱' : '🇬🇧';
    });
}

// Auto-init on page load
if (typeof window !== 'undefined') {
    window.LuminaI18n = {
        getLang: getLuminaLanguage,
        setLang: setLuminaLanguage,
        t,
        apply: applyLuminaTranslations,
        toggle: () => setLuminaLanguage(currentLuminaLang === 'pl' ? 'en' : 'pl')
    };

    window.addEventListener('DOMContentLoaded', () => {
        applyLuminaTranslations();
        
        // Register Service Worker
        if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            navigator.serviceWorker.register('./sw-lumina.js')
                .then(() => console.log('Lumina PWA ServiceWorker active.'))
                .catch((e) => console.warn('Lumina ServiceWorker notice:', e));
        }
    });
}
