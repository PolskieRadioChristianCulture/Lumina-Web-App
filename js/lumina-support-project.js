(function () {
    'use strict';

    const SUPPORT_BUTTON_CLASS = 'lumina-support-project-btn';
    const MODAL_ID = 'luminaSupportProjectModal';
    const BLIK_NUMBER = '537137043';
    const BLIK_LABEL = '537 137 043';

    function isEligiblePost(card) {
        if (!(card instanceof HTMLElement)) return false;
        const marker = [
            card.className,
            card.dataset.type,
            card.dataset.postType,
            card.dataset.category,
        ].filter(Boolean).join(' ').toLowerCase();
        return !/(^|[\s_-])(live|broadcast|transmisj|stream)([\s_-]|$)/.test(marker)
            && !card.querySelector('iframe[src*="stream"], [data-live="true"], .live-badge, .broadcast-badge');
    }

    function getActionHost(card) {
        return card.querySelector('.post-actions, .post-action-row, .post-footer-actions, .post-footer') || card;
    }

    function decoratePost(card) {
        if (!isEligiblePost(card) || card.querySelector(`.${SUPPORT_BUTTON_CLASS}`)) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = SUPPORT_BUTTON_CLASS;
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-controls', MODAL_ID);
        button.innerHTML = '<i class="fa-solid fa-heart" aria-hidden="true"></i><span>Wspieraj projekt</span>';
        button.addEventListener('click', openModal);
        getActionHost(card).appendChild(button);
    }

    function decoratePosts(root) {
        if (!(root instanceof Element || root instanceof Document)) return;
        if (root.matches?.('.post-card')) decoratePost(root);
        root.querySelectorAll?.('.post-card').forEach(decoratePost);
    }

    function copyBlik() {
        const done = () => {
            if (typeof window.showToast === 'function') {
                window.showToast(`Skopiowano numer BLIK: ${BLIK_LABEL}`);
            }
        };
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(BLIK_NUMBER).then(done).catch(() => fallbackCopy(done));
        } else {
            fallbackCopy(done);
        }
    }

    function fallbackCopy(done) {
        const input = document.createElement('textarea');
        input.value = BLIK_NUMBER;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        try { document.execCommand('copy'); } catch (error) {}
        input.remove();
        done();
    }

    function closeModal() {
        const modal = document.getElementById(MODAL_ID);
        if (!modal) return;
        modal.hidden = true;
        document.body.classList.remove('lumina-support-modal-open');
    }

    function openModal() {
        const modal = ensureModal();
        modal.hidden = false;
        document.body.classList.add('lumina-support-modal-open');
        modal.querySelector('.lumina-support-modal-close')?.focus();
    }

    function ensureModal() {
        const existing = document.getElementById(MODAL_ID);
        if (existing) return existing;

        const modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = 'lumina-support-modal';
        modal.hidden = true;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'luminaSupportProjectTitle');
        modal.innerHTML = `
            <div class="lumina-support-modal-backdrop" data-support-close></div>
            <section class="lumina-support-modal-card">
                <button type="button" class="lumina-support-modal-close" data-support-close aria-label="Zamknij okno wsparcia">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
                <div class="lumina-support-modal-icon"><i class="fa-solid fa-heart" aria-hidden="true"></i></div>
                <h2 id="luminaSupportProjectTitle">Wspieraj projekt</h2>
                <p>Wspieraj misję Christian Culture — wybierz najprostszy dla Ciebie sposób.</p>
                <div class="lumina-support-methods">
                    <button type="button" class="lumina-support-method lumina-support-blik">
                        <i class="fa-solid fa-mobile-screen-button" aria-hidden="true"></i>
                        <span><strong>BLIK</strong><small>${BLIK_LABEL} · dotknij, aby skopiować</small></span>
                    </button>
                    <a class="lumina-support-method lumina-support-revolut" href="https://revolut.me/christianculture" target="_blank" rel="noopener noreferrer">
                        <i class="fa-solid fa-bolt" aria-hidden="true"></i>
                        <span><strong>Revolut</strong><small>Szybkie wsparcie online</small></span>
                    </a>
                    <a class="lumina-support-method lumina-support-patronite" href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener noreferrer">
                        <i class="fa-solid fa-hand-holding-heart" aria-hidden="true"></i>
                        <span><strong>Patronite</strong><small>Regularne wsparcie misji</small></span>
                    </a>
                </div>
            </section>`;
        document.body.appendChild(modal);
        modal.querySelectorAll('[data-support-close]').forEach(element => element.addEventListener('click', closeModal));
        modal.querySelector('.lumina-support-blik')?.addEventListener('click', copyBlik);
        return modal;
    }

    function installStyles() {
        if (document.getElementById('luminaSupportProjectStyles')) return;
        const style = document.createElement('style');
        style.id = 'luminaSupportProjectStyles';
        style.textContent = `
            .${SUPPORT_BUTTON_CLASS}{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:36px;padding:7px 13px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(15,23,42,.58);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#f8fafc;font:700 .78rem/1.1 inherit;cursor:pointer;transition:background .2s ease,transform .2s ease,border-color .2s ease}
            .${SUPPORT_BUTTON_CLASS}:hover{background:rgba(190,24,93,.72);border-color:rgba(251,113,133,.65);transform:translateY(-1px)}
            .${SUPPORT_BUTTON_CLASS} i{color:#fb7185}.lumina-support-modal[hidden]{display:none!important}.lumina-support-modal{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;padding:18px}.lumina-support-modal-backdrop{position:absolute;inset:0;background:rgba(2,6,23,.76);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
            .lumina-support-modal-card{box-sizing:border-box;position:relative;width:min(100%,460px);padding:28px 22px 22px;border:1px solid rgba(255,255,255,.16);border-radius:24px;background:linear-gradient(145deg,#111c37,#080e1f);box-shadow:0 28px 70px rgba(0,0,0,.62);color:#fff;text-align:center}.lumina-support-modal-close{position:absolute;top:12px;right:12px;width:40px;height:40px;border:1px solid rgba(255,255,255,.14);border-radius:50%;background:rgba(255,255,255,.07);color:#fff;cursor:pointer}.lumina-support-modal-icon{display:grid;place-items:center;width:58px;height:58px;margin:0 auto 12px;border-radius:18px;background:linear-gradient(135deg,#ec4899,#be123c);font-size:1.4rem}.lumina-support-modal-card h2{margin:0 0 8px;font:800 1.5rem/1.2 'Outfit',sans-serif}.lumina-support-modal-card>p{margin:0 auto 18px;color:#cbd5e1;font-size:.88rem;line-height:1.5}.lumina-support-methods{display:grid;gap:10px}.lumina-support-method{box-sizing:border-box;display:flex;align-items:center;gap:13px;width:100%;min-height:62px;padding:11px 14px;border:1px solid rgba(255,255,255,.13);border-radius:16px;color:#fff;text-align:left;text-decoration:none;cursor:pointer}.lumina-support-method>i{display:grid;place-items:center;width:38px;height:38px;flex:0 0 38px;border-radius:12px;background:rgba(255,255,255,.13)}.lumina-support-method span{display:grid;gap:3px}.lumina-support-method strong{font-size:.92rem}.lumina-support-method small{color:#e2e8f0;font-size:.73rem}.lumina-support-blik{background:linear-gradient(135deg,#7c3aed,#5b21b6)}.lumina-support-revolut{background:linear-gradient(135deg,#087bea,#0754c7)}.lumina-support-patronite{background:linear-gradient(135deg,#e11d48,#be123c)}body.lumina-support-modal-open{overflow:hidden!important}
            @media(max-width:768px){.${SUPPORT_BUTTON_CLASS}{min-height:34px;padding:6px 11px;font-size:.72rem}.lumina-support-modal{padding:10px}.lumina-support-modal-card{padding:26px 14px 16px;border-radius:20px}.lumina-support-method{min-height:58px}}
            @media(prefers-reduced-motion:reduce){.${SUPPORT_BUTTON_CLASS}{transition:none}}
        `;
        document.head.appendChild(style);
    }

    function init() {
        installStyles();
        decoratePosts(document);
        new MutationObserver(records => {
            records.forEach(record => record.addedNodes.forEach(node => {
                if (node instanceof Element) decoratePosts(node);
            }));
        }).observe(document.body, { childList: true, subtree: true });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') closeModal();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
