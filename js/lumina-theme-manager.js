/**
 * LUMINA THEME MANAGER (Master Light & Dark Edition Controller)
 * Christian Culture Ecosystem 2026
 * Handles instant FOIT-free theme initialization, floating theme switcher mount,
 * local storage synchronization across tabs, and responsive ergonomic placement.
 */
(function() {
    'use strict';

    function getPreferredTheme() {
        try {
            var urlParam = new URLSearchParams(window.location.search).get('theme');
            if (urlParam === 'light' || urlParam === 'dark') return urlParam;
            var stored = localStorage.getItem('lumina_theme');
            if (stored === 'light' || stored === 'dark') return stored;
        } catch(e) {}
        return null;
    }

    function applyLuminaTheme(theme, savePreference) {
        var isLight = theme === 'light';
        if (isLight) {
            document.documentElement.setAttribute('data-lumina-theme', 'light');
            if (document.body) document.body.classList.add('theme-lumina-light');
        } else {
            document.documentElement.setAttribute('data-lumina-theme', 'dark');
            if (document.body) document.body.classList.remove('theme-lumina-light');
        }

        if (savePreference) {
            try {
                localStorage.setItem('lumina_theme', isLight ? 'light' : 'dark');
            } catch(e) {}
        }

        updateSwitcherUI(isLight);

        try {
            window.dispatchEvent(new CustomEvent('luminathemechange', { detail: { theme: isLight ? 'light' : 'dark' } }));
        } catch(e) {}
    }

    function toggleLuminaTheme() {
        var isLight = document.documentElement.getAttribute('data-lumina-theme') === 'light' || 
                      (document.body && document.body.classList.contains('theme-lumina-light'));
        applyLuminaTheme(isLight ? 'dark' : 'light', true);
    }

    function updateSwitcherUI(isLight) {
        var btn = document.getElementById('luminaThemeSwitchBtn');
        if (!btn) return;
        var icon = document.getElementById('luminaThemeIcon') || btn.querySelector('.theme-icon');
        var label = document.getElementById('luminaThemeLabel') || btn.querySelector('span');

        if (isLight) {
            btn.classList.add('is-light');
            if (icon) icon.className = 'fa-solid fa-sun theme-icon';
            if (label) label.textContent = 'Motyw: Jasny (Pure White)';
            btn.setAttribute('title', 'Przełącz na motyw Ciemny');
        } else {
            btn.classList.remove('is-light');
            if (icon) icon.className = 'fa-solid fa-moon theme-icon';
            if (label) label.textContent = 'Motyw: Ciemny (Obsidian)';
            btn.setAttribute('title', 'Przełącz na motyw Jasny');
        }
    }

    function ensureSwitcherMounted() {
        if (document.getElementById('luminaThemeSwitchBtn')) {
            var currentIsLight = document.documentElement.getAttribute('data-lumina-theme') === 'light' || 
                                 (document.body && document.body.classList.contains('theme-lumina-light'));
            updateSwitcherUI(currentIsLight);
            return;
        }

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lumina-theme-switch-pill';
        btn.id = 'luminaThemeSwitchBtn';
        btn.setAttribute('title', 'Przełącz motyw (Jasny / Ciemny)');
        btn.innerHTML = '<i class="fa-solid fa-moon theme-icon" id="luminaThemeIcon"></i><span id="luminaThemeLabel">Motyw: Ciemny (Obsidian)</span>';
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleLuminaTheme();
        });

        document.body.appendChild(btn);

        var currentIsLight = document.documentElement.getAttribute('data-lumina-theme') === 'light' || 
                             (document.body && document.body.classList.contains('theme-lumina-light'));
        updateSwitcherUI(currentIsLight);
    }

    // Expose globals
    window.applyLuminaTheme = applyLuminaTheme;
    window.toggleLuminaTheme = toggleLuminaTheme;

    // Immediate execution on load to prevent FOIT
    var initialTheme = getPreferredTheme();
    if (initialTheme === 'light') {
        document.documentElement.setAttribute('data-lumina-theme', 'light');
    } else if (initialTheme === 'dark') {
        document.documentElement.setAttribute('data-lumina-theme', 'dark');
    }

    // DOM Ready handler
    function onDOMLoaded() {
        var pref = getPreferredTheme();
        if (pref === 'light') {
            applyLuminaTheme('light', false);
        } else if (pref === 'dark') {
            applyLuminaTheme('dark', false);
        }
        ensureSwitcherMounted();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMLoaded);
    } else {
        onDOMLoaded();
    }

    // Synchronize across tabs
    window.addEventListener('storage', function(e) {
        if (e.key === 'lumina_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
            applyLuminaTheme(e.newValue, false);
        }
    });
})();
