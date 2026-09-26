/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL LANGUAGE SWITCHER — KOMPONENT JĘZYKOWY (FAZA 5)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 5)
 * Dyrektywy 23, 24, 25, 42, 63, 64, 75, 76, 77, 78:
 * - Wspólny komponent dla PolskieRadio.cc, LUMINA, CC Lite, HOLOS
 * - Natywne nazwy języków: Polski, English, Español, Português (Brasil)
 * - Flaga wyłącznie pomocnicza (Flag != Language)
 * - Pełna dostępność (WCAG, ARIA, Keyboard, Mobile 360-430px)
 * - Zero modal spam: trwała pamięć wyboru (cookie + localStorage + CC ID)
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'cc_user_lang_choice';
    const COOKIE_NAME = 'cc_lang_pref';

    const WAVE_1_LOCALES = [
        { code: 'pl', name: 'Polski', flag: '🇵🇱', nativeName: 'Polski' },
        { code: 'en', name: 'English', flag: '🌐', nativeName: 'English' },
        { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
        { code: 'pt-br', name: 'Português (Brasil)', flag: '🇧🇷', nativeName: 'Português (Brasil)' }
    ];

    /**
     * Pobiera zapisaną preferencję użytkownika
     */
    function getStoredChoice() {
        try {
            const local = localStorage.getItem(STORAGE_KEY);
            if (local && WAVE_1_LOCALES.some(l => l.code === local)) return local;
        } catch (_) {}

        // Fallback do cookie
        const match = document.cookie.match(new RegExp('(^|;\\s*)(' + COOKIE_NAME + ')=([^;]*)'));
        if (match && WAVE_1_LOCALES.some(l => l.code === match[3])) {
            return match[3];
        }

        return null;
    }

    /**
     * Zapisuje jawny wybór użytkownika (User Choice)
     * Dyrektywa 5, 7, 63: Zapis w cookie + storage + profil CC ID
     */
    function storeUserChoice(locale) {
        if (!WAVE_1_LOCALES.some(l => l.code === locale)) return;

        try {
            localStorage.setItem(STORAGE_KEY, locale);
        } catch (_) {}

        // Cookie ważne 1 rok z atrybutem SameSite=Lax
        document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`;

        // Aktualizacja profilu CC ID jeśli użytkownik jest zalogowany
        if (window.CC_GLOBAL_AUTH && typeof window.CC_GLOBAL_AUTH.updateLanguagePreference === 'function') {
            window.CC_GLOBAL_AUTH.updateLanguagePreference(locale).catch(err => {
                console.warn('[CC-SWITCHER] Błąd zapisu preferencji CC ID:', err);
            });
        }

        // Emisja zdarzenia do ekosystemu
        window.dispatchEvent(new CustomEvent('cc-language-changed', {
            detail: {
                locale,
                source: 'EXPLICIT_USER_CHOICE',
                timestamp: new Date().toISOString()
            }
        }));
    }

    /**
     * Inicjalizuje komponent UI w zadanym kontenerze lub tworzy pływający przełącznik
     */
    function initLanguageSwitcher() {
        const containers = document.querySelectorAll('[data-cc-language-switcher]');
        const currentLocale = getStoredChoice() || document.documentElement.lang || 'pl';

        containers.forEach(container => {
            renderSwitcher(container, currentLocale);
        });

        // Jeśli na stronie nie ma kontenera, a użytkownik wejdzie z innym językiem przeglądarki,
        // możemy zaproponować subtelną sugestię (Dyrektywa 78 - Zero modal spam)
        checkFirstVisitSuggestion(currentLocale);
    }

    /**
     * Renderuje dostępny komponent przełącznika
     */
    function renderSwitcher(container, currentLocale) {
        container.innerHTML = '';
        container.classList.add('relative', 'inline-block', 'text-left');

        const activeItem = WAVE_1_LOCALES.find(l => l.code === currentLocale) || WAVE_1_LOCALES[0];

        // Przycisk otwierający menu
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-obsidian-card border border-obsidian-border text-xs font-medium text-slate-300 hover:text-white hover:border-cc-gold/40 focus:outline-none focus:ring-2 focus:ring-cc-gold/50 transition';
        btn.setAttribute('aria-haspopup', 'listbox');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', `Zmień język (obecny: ${activeItem.nativeName})`);

        btn.innerHTML = `
            <span class="text-sm opacity-90">${activeItem.flag}</span>
            <span class="font-sans">${activeItem.nativeName}</span>
            <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 ml-0.5 transition-transform duration-200"></i>
        `;

        // Menu rozwijane
        const dropdown = document.createElement('ul');
        dropdown.className = 'hidden absolute right-0 mt-1 w-48 rounded-xl bg-obsidian-card border border-obsidian-border shadow-2xl py-1 z-50 focus:outline-none';
        dropdown.setAttribute('role', 'listbox');
        dropdown.setAttribute('tabindex', '-1');

        WAVE_1_LOCALES.forEach(loc => {
            const isSelected = loc.code === activeItem.code;
            const li = document.createElement('li');
            li.className = `flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-white/5 transition ${isSelected ? 'text-cc-gold font-bold bg-cc-gold/10' : 'text-slate-300'}`;
            li.setAttribute('role', 'option');
            li.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            li.setAttribute('data-locale', loc.code);

            li.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-sm">${loc.flag}</span>
                    <span>${loc.nativeName}</span>
                </div>
                ${isSelected ? '<i class="fa-solid fa-check text-[11px] text-cc-gold"></i>' : ''}
            `;

            li.addEventListener('click', () => {
                storeUserChoice(loc.code);
                closeDropdown();
                // Przeładuj z nowym językiem lub zaktualizuj dynamicznie
                const targetUrl = getTargetUrlForLocale(loc.code);
                if (targetUrl && targetUrl !== window.location.href) {
                    window.location.href = targetUrl;
                } else {
                    renderSwitcher(container, loc.code);
                }
            });

            dropdown.appendChild(li);
        });

        function toggleDropdown() {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                closeDropdown();
            } else {
                openDropdown();
            }
        }

        function openDropdown() {
            btn.setAttribute('aria-expanded', 'true');
            dropdown.classList.remove('hidden');
            const icon = btn.querySelector('.fa-chevron-down');
            if (icon) icon.classList.add('rotate-180');
        }

        function closeDropdown() {
            btn.setAttribute('aria-expanded', 'false');
            dropdown.classList.add('hidden');
            const icon = btn.querySelector('.fa-chevron-down');
            if (icon) icon.classList.remove('rotate-180');
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });

        // Obsługa klawiatury
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openDropdown();
                const first = dropdown.querySelector('li');
                if (first) first.focus();
            }
        });

        dropdown.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeDropdown();
                btn.focus();
            }
        });

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                closeDropdown();
            }
        });

        container.appendChild(btn);
        container.appendChild(dropdown);
    }

    /**
     * Wyznacza bezpieczny URL dla nowego locale
     */
    function getTargetUrlForLocale(locale) {
        const url = new URL(window.location.href);
        const path = url.pathname;
        const segments = path.split('/').filter(Boolean);

        // Jeśli pierwszy segment to istniejące locale Wave 1
        if (segments.length > 0 && WAVE_1_LOCALES.some(l => l.code === segments[0].toLowerCase())) {
            segments[0] = (locale === 'pl') ? '' : locale;
        } else if (locale !== 'pl') {
            segments.unshift(locale);
        }

        const newPath = '/' + segments.filter(Boolean).join('/');
        url.pathname = newPath || '/';
        return url.toString();
    }

    /**
     * Subtelny pasek sugestii pierwszej wizyty (First-Visit Suggestion, Dyrektywa 78)
     */
    function checkFirstVisitSuggestion(currentLocale) {
        if (getStoredChoice()) return; // Użytkownik dokonał już wyboru

        const browserLang = (navigator.language || '').toLowerCase().slice(0, 2);
        const candidate = WAVE_1_LOCALES.find(l => l.code.startsWith(browserLang));

        if (candidate && candidate.code !== currentLocale) {
            try {
                if (sessionStorage.getItem('cc_dismissed_sug_' + candidate.code)) return;
            } catch (_) {}

            const banner = document.createElement('div');
            banner.id = 'cc-lang-suggestion-banner';
            banner.className = 'fixed bottom-4 right-4 max-w-sm bg-obsidian-card border border-cc-gold/40 shadow-2xl rounded-2xl p-3.5 z-50 flex items-center justify-between gap-3 text-xs text-white animate-fade-in';

            banner.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-base">${candidate.flag}</span>
                    <span>View in <strong>${candidate.nativeName}</strong>?</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <button type="button" id="btnAcceptLangSug" class="px-2.5 py-1 rounded-lg bg-cc-gold text-obsidian font-bold hover:brightness-110 transition">Tak</button>
                    <button type="button" id="btnDismissLangSug" class="p-1 text-slate-400 hover:text-white transition" aria-label="Zamknij sugestię"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `;

            document.body.appendChild(banner);

            // Telemetria: LANGUAGE_SUGGESTION_SHOWN
            window.dispatchEvent(new CustomEvent('cc-analytics-event', {
                detail: { metricType: 'LANGUAGE_SUGGESTION_SHOWN', locale: candidate.code, source: 'BROWSER_LANGUAGE' }
            }));

            banner.querySelector('#btnAcceptLangSug').addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('cc-analytics-event', {
                    detail: { metricType: 'LANGUAGE_SUGGESTION_ACCEPTED', locale: candidate.code }
                }));
                storeUserChoice(candidate.code);
                banner.remove();
                window.location.href = getTargetUrlForLocale(candidate.code);
            });

            banner.querySelector('#btnDismissLangSug').addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('cc-analytics-event', {
                    detail: { metricType: 'LANGUAGE_SUGGESTION_DISMISSED', locale: candidate.code }
                }));
                try {
                    sessionStorage.setItem('cc_dismissed_sug_' + candidate.code, '1');
                } catch (_) {}
                banner.remove();
            });
        }
    }

    // Eksport publiczny do okna globalnego
    window.CC_LANGUAGE_SWITCHER = {
        getStoredChoice,
        storeUserChoice,
        init: initLanguageSwitcher,
        locales: WAVE_1_LOCALES
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
    } else {
        initLanguageSwitcher();
    }
})();
