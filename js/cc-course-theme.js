/**
 * CC & LUMINA COURSE THEME CONTROLLER (Light & Dark Edition)
 * Christian Culture Ecosystem 2026
 * Handles instant FOIT-free theme initialization, top bar toggle button injection,
 * localStorage synchronization across tabs and seamless switching between
 * Deep Obsidian Dark and Warm Ivory Luxury Light editions across all courses and lessons.
 */
(function() {
  'use strict';

  function getStoredTheme() {
    try {
      var param = new URLSearchParams(window.location.search).get('theme');
      if (param === 'light' || param === 'dark') return param;
      var stored = localStorage.getItem('lumina_theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch(e) {}
    // Jeśli nie wybrano inaczej, kursy domyślnie zachowują dark (chyba że użytkownik wybrał light w LUMINA)
    return 'dark';
  }

  function applyCourseTheme(theme, savePreference) {
    var isLight = theme === 'light';
    var root = document.documentElement;
    var body = document.body;

    if (isLight) {
      root.setAttribute('data-lumina-theme', 'light');
      root.classList.remove('dark');
      root.classList.add('light');
      if (body) body.classList.add('theme-lumina-light');
    } else {
      root.setAttribute('data-lumina-theme', 'dark');
      root.classList.remove('light');
      root.classList.add('dark');
      if (body) body.classList.remove('theme-lumina-light');
    }

    if (savePreference) {
      try {
        localStorage.setItem('lumina_theme', isLight ? 'light' : 'dark');
      } catch(e) {}
    }

    updateThemeButtonsUI(isLight);

    try {
      window.dispatchEvent(new CustomEvent('luminathemechange', { detail: { theme: isLight ? 'light' : 'dark' } }));
    } catch(e) {}
  }

  function toggleCourseTheme() {
    var currentIsLight = document.documentElement.getAttribute('data-lumina-theme') === 'light' ||
                         document.documentElement.classList.contains('light');
    applyCourseTheme(currentIsLight ? 'dark' : 'light', true);
  }

  function updateThemeButtonsUI(isLight) {
    var btns = document.querySelectorAll('#btn-theme-toggle, .btn-course-theme-toggle');
    btns.forEach(function(btn) {
      var icon = btn.querySelector('.theme-toggle-icon, i');
      var label = btn.querySelector('.theme-toggle-label, span.theme-text');

      if (isLight) {
        btn.setAttribute('title', 'Przełącz na motyw ciemny');
        btn.setAttribute('aria-label', 'Przełącz na motyw ciemny');
        if (icon) {
          icon.className = 'fa-solid fa-moon text-amber-500 text-xs theme-toggle-icon';
        }
        if (label) {
          label.textContent = 'Ciemny';
        }
      } else {
        btn.setAttribute('title', 'Przełącz na motyw jasny');
        btn.setAttribute('aria-label', 'Przełącz na motyw jasny');
        if (icon) {
          icon.className = 'fa-solid fa-sun text-amber-400 text-xs theme-toggle-icon';
        }
        if (label) {
          label.textContent = 'Jasny';
        }
      }
    });
  }

  function ensureStylesAttached() {
    if (!document.querySelector('link[href*="lumina-courses.css"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = 'ccLuminaCoursesCss';
      link.href = '/css/lumina-courses.css?v=20261008_theme1';
      document.head.appendChild(link);
    }
  }

  function ensureThemeButtonMounted() {
    // 1. Sprawdź, czy przycisk już istnieje na stronie
    if (document.getElementById('btn-theme-toggle')) {
      var isLight = document.documentElement.getAttribute('data-lumina-theme') === 'light';
      updateThemeButtonsUI(isLight);
      return;
    }

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btn-theme-toggle';
    btn.className = 'kc-reader-pill cin-btn-theme';
    btn.title = 'Przełącz motyw (Jasny / Ciemny)';
    btn.setAttribute('aria-label', 'Przełącz motyw');
    btn.innerHTML = '<i class="fa-solid fa-sun text-amber-400 text-xs theme-toggle-icon"></i><span class="hidden md:inline font-semibold theme-toggle-label theme-text">Jasny</span>';
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      toggleCourseTheme();
    });

    // 2. Automatyczny montaż w .ak-header obok #btn-reader-font (Lekcje Kursu Codziennego)
    var fontBtn = document.getElementById('btn-reader-font');
    if (fontBtn && fontBtn.parentElement) {
      fontBtn.insertAdjacentElement('afterend', btn);
      updateThemeButtonsUI(document.documentElement.getAttribute('data-lumina-theme') === 'light');
      return;
    }

    // 3. Montaż w .cin-header / .cin-topbar przed .cin-btn-support (Akademia & Apokalipsa / 28 Kroków)
    var supportBtn = document.querySelector('.cin-btn-support');
    if (supportBtn && supportBtn.parentElement) {
      supportBtn.insertAdjacentElement('beforebegin', btn);
      updateThemeButtonsUI(document.documentElement.getAttribute('data-lumina-theme') === 'light');
      return;
    }

    // 4. Montaż w .ak-header przed linkiem Patronite (np. akademia/kurscodzienny/index.html)
    var patroniteBtn = document.querySelector('.ak-header a[href*="patronite"]');
    if (patroniteBtn && patroniteBtn.parentElement) {
      patroniteBtn.insertAdjacentElement('beforebegin', btn);
      updateThemeButtonsUI(document.documentElement.getAttribute('data-lumina-theme') === 'light');
      return;
    }

    // 5. Montaż przed kontenerem logowania cc-auth-nav-container
    var authContainer = document.getElementById('cc-auth-nav-container');
    if (authContainer && authContainer.parentElement) {
      authContainer.insertAdjacentElement('beforebegin', btn);
      updateThemeButtonsUI(document.documentElement.getAttribute('data-lumina-theme') === 'light');
      return;
    }
  }

  // Global API
  window.toggleCourseTheme = toggleCourseTheme;
  window.applyCourseTheme = applyCourseTheme;
  window.CCCourseTheme = true;

  // Natychmiastowe ustawienie motywu przed malowaniem (Anti-FOIT)
  var initial = getStoredTheme();
  if (initial === 'light') {
    document.documentElement.setAttribute('data-lumina-theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    if (document.body) document.body.classList.add('theme-lumina-light');
  } else {
    document.documentElement.setAttribute('data-lumina-theme', 'dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    if (document.body) document.body.classList.remove('theme-lumina-light');
  }

  // DOM Loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      ensureStylesAttached();
      applyCourseTheme(getStoredTheme(), false);
      ensureThemeButtonMounted();
    });
  } else {
    ensureStylesAttached();
    applyCourseTheme(initial, false);
    ensureThemeButtonMounted();
  }

  // Synchronizacja między kartami przeglądarki
  window.addEventListener('storage', function(e) {
    if (e.key === 'lumina_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
      applyCourseTheme(e.newValue, false);
    }
  });
})();
