/**
 * LUMINA — zachęta do wgrania zdjęcia profilowego (Strażnik, 2026-10-11)
 *
 * Każdy zalogowany członek bez prawdziwego zdjęcia profilowego widzi spokojną kartę
 * (w treści strony, nie pływającą) z zaproszeniem do dodania zdjęcia.
 * „Dodaj zdjęcie” otwiera kreator profilu; „×” ukrywa kartę na 3 dni.
 * Karta znika sama, gdy zdjęcie zostanie dodane.
 */
(function () {
    'use strict';
    if (window.__luminaPhotoNudge) return;
    window.__luminaPhotoNudge = true;

    var HIDE_KEY = 'lumina_photo_nudge_hidden_until';
    var HIDE_MS = 3 * 24 * 60 * 60 * 1000;
    var card = null;

    function hiddenNow() {
        try { return Number(localStorage.getItem(HIDE_KEY) || 0) > Date.now(); } catch (e) { return false; }
    }

    function needsPhoto() {
        var L = window.LuminaDB;
        if (!L || typeof L.getCurrentUser !== 'function' || typeof L.getCurrentProfile !== 'function') return null;
        var user = L.getCurrentUser();
        if (!user || user.isAnonymous) return false;
        var profile = L.getCurrentProfile();
        if (!profile) return null;
        if (typeof L.getLuminaProfileCompletion === 'function') {
            return L.getLuminaProfileCompletion(profile).missing.indexOf('photo') !== -1;
        }
        if (window.LuminaGuard && typeof window.LuminaGuard.isRealPhoto === 'function') {
            return !window.LuminaGuard.isRealPhoto(profile.avatar, profile.slug || profile.uid || '');
        }
        return null;
    }

    function styles() {
        if (document.getElementById('luminaPhotoNudgeCss')) return;
        var css = document.createElement('style');
        css.id = 'luminaPhotoNudgeCss';
        css.textContent =
            '.lumina-photo-nudge{box-sizing:border-box;display:flex;align-items:center;gap:14px;width:100%;max-width:100%;margin:14px 0;padding:14px 16px;border-radius:18px;background:#fffaf0;border:1px solid #d9b45f;box-shadow:0 6px 20px rgba(118,84,20,.12);color:#292524;font-family:inherit}' +
            '.lumina-photo-nudge__icon{flex:0 0 52px;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff}' +
            '.lumina-photo-nudge__text{flex:1 1 auto;min-width:0}' +
            '.lumina-photo-nudge__title{margin:0 0 3px;font-size:1rem;font-weight:800;color:#292524}' +
            '.lumina-photo-nudge__lead{margin:0;font-size:.86rem;line-height:1.45;color:#57534e}' +
            '.lumina-photo-nudge__actions{display:flex;align-items:center;gap:6px;flex:0 0 auto}' +
            '.lumina-photo-nudge__add{min-height:44px;padding:0 18px;border:none;border-radius:999px;background:#765414;color:#fff;font-weight:800;font-size:.88rem;cursor:pointer;white-space:nowrap}' +
            '.lumina-photo-nudge__close{width:44px;height:44px;border:none;border-radius:50%;background:transparent;color:#57534e;font-size:1.4rem;line-height:1;cursor:pointer}' +
            '.lumina-photo-nudge :is(button):focus-visible{outline:3px solid #2563eb;outline-offset:2px}' +
            '[data-lumina-theme="dark"] .lumina-photo-nudge{background:#111a33;border-color:#a8873d;color:#f5f5f4}' +
            '[data-lumina-theme="dark"] .lumina-photo-nudge__title{color:#fff}[data-lumina-theme="dark"] .lumina-photo-nudge__lead{color:#d6d3d1}' +
            '[data-lumina-theme="dark"] .lumina-photo-nudge__close{color:#d6d3d1}' +
            '@media (max-width:560px){.lumina-photo-nudge{flex-wrap:wrap;padding:14px}.lumina-photo-nudge__text{flex:1 1 calc(100% - 66px)}.lumina-photo-nudge__actions{width:100%;justify-content:space-between}.lumina-photo-nudge__add{flex:1 1 auto}}';
        document.head.appendChild(css);
    }

    function place(el) {
        var anchor = document.querySelector('.profile-head-card, .hero-info-bar, .lumina-profile-head-card');
        if (anchor) {
            // Na profilach — tylko na własnym profilu (tryb właściciela), nie u innych osób.
            if (!document.body.classList.contains('owner-mode-active') || !anchor.parentNode) return false;
            anchor.insertAdjacentElement('afterend', el);
            return true;
        }
        var feed = document.querySelector('#feedContainer, #luminaFeed, .feed-container, main');
        if (feed) { feed.insertBefore(el, feed.firstChild); return true; }
        return false;
    }

    function openWizard() {
        if (typeof window.openLuminaProfileWizard === 'function') { window.openLuminaProfileWizard(); return; }
        location.href = '/lumina-profile.html?uzupelnij=1';
    }

    function show() {
        if (card || hiddenNow()) return;
        styles();
        card = document.createElement('section');
        card.className = 'lumina-photo-nudge';
        card.setAttribute('aria-label', 'Dodaj zdjęcie profilowe');
        card.innerHTML =
            '<div class="lumina-photo-nudge__icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></div>' +
            '<div class="lumina-photo-nudge__text"><p class="lumina-photo-nudge__title">Dodaj swoje zdjęcie profilowe</p>' +
            '<p class="lumina-photo-nudge__lead">Profil ze zdjęciem budzi zaufanie i daje większą szansę na ciekawe, nowe znajomości.</p></div>' +
            '<div class="lumina-photo-nudge__actions"><button type="button" class="lumina-photo-nudge__add">Dodaj zdjęcie</button>' +
            '<button type="button" class="lumina-photo-nudge__close" aria-label="Przypomnij później" title="Przypomnij później">×</button></div>';
        card.querySelector('.lumina-photo-nudge__add').addEventListener('click', openWizard);
        card.querySelector('.lumina-photo-nudge__close').addEventListener('click', function () {
            try { localStorage.setItem(HIDE_KEY, String(Date.now() + HIDE_MS)); } catch (e) {}
            hide();
        });
        if (!place(card)) card = null;
    }

    function hide() {
        if (card && card.parentNode) card.parentNode.removeChild(card);
        card = null;
    }

    function check() {
        var need = needsPhoto();
        if (need === true) show();
        else if (need === false) hide();
    }

    var tries = 0;
    function poll() {
        check();
        if (!card && ++tries < 40) setTimeout(poll, 750);
    }
    window.addEventListener('lumina-auth-state', function () { setTimeout(check, 300); });
    window.addEventListener('lumina:profile-completed', function () { setTimeout(check, 300); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll, { once: true });
    else poll();
})();
