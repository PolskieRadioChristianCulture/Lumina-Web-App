/* Shared profile actions: preserve original controls/handlers; never change authorization. */
(function () {
    'use strict';
    const mobile = window.matchMedia('(max-width: 768px)');
    const records = new WeakMap();
    const utilitySelector = '.btn-video-avatar-badge, .btn-lumina-replace-floating';
    let pending = false;

    function labelFor(control) {
        return control.getAttribute('aria-label') || control.getAttribute('title') ||
            control.textContent.replace(/\s+/g, ' ').trim() || 'Opcje profilu';
    }

    function update(bar) {
        let state = records.get(bar);
        if (!state) {
            const more = document.createElement('details');
            more.className = 'profile-actions-more';
            const summary = document.createElement('summary');
            summary.setAttribute('aria-label', 'Więcej działań profilu');
            summary.title = 'Więcej działań profilu';
            summary.innerHTML = '<span aria-hidden="true">⋮</span><span class="profile-action-label">Więcej</span>';
            const panel = document.createElement('div');
            panel.className = 'profile-actions-panel';
            more.append(summary, panel);
            more.addEventListener('keydown', e => {
                if (e.key === 'Escape') { more.open = false; summary.focus(); }
            });
            more.addEventListener('click', e => {
                if (e.target.closest('button, a')) more.open = false;
            });
            state = { more, panel, controls: new Map() };
            records.set(bar, state);
            bar.append(more);
        }
        const candidates = [...bar.children].filter(e => e.matches('button, a'));
        const head = bar.closest('.profile-head-card, .profile-hero, .profile-head, .lumina-profile-head-card') || bar.parentElement;
        for (const wrap of head.querySelectorAll('.avatar-wrap, .head-avatar-wrapper, .profile-avatar-wrap, .hero-avatar-wrap')) {
            for (const control of wrap.querySelectorAll(utilitySelector)) {
                control.classList.add('profile-avatar-utility');
                // The media scanner must retain its original host identity after moving its button.
                if (control.matches('.btn-lumina-replace-floating')) {
                    wrap.querySelectorAll('img').forEach(img => { img.dataset.hasReplacerBtn = 'true'; });
                }
                candidates.push(control);
            }
        }
        for (const control of candidates) {
            if (state.controls.has(control)) continue;
            const label = labelFor(control);
            if (!control.hasAttribute('aria-label')) control.setAttribute('aria-label', label);
            if (!control.hasAttribute('title')) control.title = label;
            const marker = document.createComment('profile-action-position');
            if (control.classList.contains('profile-avatar-utility')) bar.insertBefore(marker, state.more);
            else control.before(marker);
            if (!control.querySelector('.btn-text, .profile-action-label')) {
                const words = [...control.childNodes].filter(node => node.nodeType === 3 && node.textContent.trim());
                for (const node of words) {
                    const text = document.createElement('span');
                    text.className = 'btn-text';
                    node.before(text);
                    text.append(node);
                }
                if (!words.length && !control.querySelector('span')) {
                    const text = document.createElement('span');
                    text.className = 'profile-action-label';
                    text.textContent = label;
                    control.append(text);
                }
            }
            state.controls.set(control, marker);
            control.addEventListener('click', () => { state.more.open = false; });
        }
        for (const [control, marker] of state.controls) {
            if (!control.isConnected) { marker.remove(); state.controls.delete(control); continue; }
            // Account deletion remains directly discoverable, never tucked into More.
            const essential = control.matches('#followBtn, #sendMessageBtn, #btnHeaderDeleteProfile, .btn-action-primary, .btn-action-share, .btn-action-delete, .btn-action-admin-delete') ||
                /obserwuj|wiadomość|napisz|polecaj profil|udostępnij profil|usuń profil|usuń konto/i.test(labelFor(control));
            const extra = control.classList.contains('profile-avatar-utility') || (mobile.matches && !essential);
            if (extra && control.parentElement !== state.panel) state.panel.append(control);
            if (!extra && control.previousSibling !== marker) marker.after(control);
        }
        state.more.hidden = state.panel.children.length === 0;
        bar.classList.add('profile-actions-compact');
    }

    function refresh() {
        pending = false;
        document.querySelectorAll('body.lumina-profile-standard .head-actions, body.lumina-profile-standard .hero-actions').forEach(update);
    }
    function schedule() {
        if (!pending) { pending = true; requestAnimationFrame(refresh); }
    }
    function init() {
        if (!document.body.classList.contains('lumina-profile-standard')) return;
        refresh();
        new MutationObserver(changes => {
            if (changes.some(change => [...change.addedNodes].some(node => node.nodeType === 1 &&
                (node.matches('button, a, .head-actions, .hero-actions') || node.querySelector(utilitySelector + ', .head-actions, .hero-actions'))))) schedule();
        }).observe(document.body, { childList: true, subtree: true });
        mobile.addEventListener('change', schedule);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
