/**
 * LUMINA IDENTITY GUARD — PANCERNA TARCZA TOŻSAMOŚCI DOWÓDCY
 * 
 * Bezwzględna zasada ekosystemu Christian Culture:
 * Zdjęcia, wideo i zasoby Dowódcy (Cezary Rogowski) mogą należeć WYŁĄCZNIE
 * i bezwzględnie do profilu 'cezaryrgowski' lub założycielskiego 'cezary_wioletta'.
 * ŻADEN inny użytkownik (np. Dawid, Urszula, Tomasz, Paweł, Weronika itp.)
 * nie może w żadnych okolicznościach otrzymać zdjęcia Dowódcy.
 */

(function initLuminaIdentityGuard() {
    'use strict';

    const COMMANDER_PATTERNS = [
        'avatar_cezary',
        'cezary_rgowski',
        'cezary_rogowski',
        'christian_culture_carousel',
        'avatar_christian_culture_hq',
        'tlo_profilowe_cezary',
        'cezary_mobile_stable'
    ];

    function isCommanderAsset(urlOrStr) {
        if (!urlOrStr || typeof urlOrStr !== 'string') return false;
        const lower = urlOrStr.toLowerCase();
        return COMMANDER_PATTERNS.some(p => lower.includes(p));
    }

    function isCommanderSlug(slug) {
        if (!slug) return false;
        const s = slug.toLowerCase().trim();
        return s === 'cezaryrgowski' || s === 'cezary_wioletta' || s === 'cezary' || s === 'cezaryrogowski';
    }

    function getProperProfileAvatar(slug) {
        const s = (slug || '').toLowerCase().trim();
        if (s === 'dawid') return 'avatar_dawid.jpg';
        if (s === 'noemi') return 'avatar_noemi.jpg';
        if (s === 'weronika') return 'avatar_weronika.jpg';
        if (s === 'tomek') return 'avatar_tomek.jpg';
        if (s === 'urszula' || s === 'u_urszula_7685') return 'avatar_urszula.jpg';
        if (s === 'pawelmurawski' || s.includes('pawel')) return 'avatar_pawel_murawski.jpg';
        if (s.includes('robert') || s.includes('robertukaszpio')) return 'avatar_robert.jpg';
        if (s === 'magdalena') return 'avatar_magdalena.jpg';
        if (s === 'andrzejthiel' || s === 'andrzej') return 'avatar_andrzej_thiel.jpg';
        if (s === 'wiolettarogowska' || s === 'wioletta') return 'avatar_wioletta_official.jpg';
        if (s === 'radiocc' || s === 'radio_cc') return 'avatar_radio_cc.jpg';
        if (window.LUMINA_COMMUNITY_PROFILES && window.LUMINA_COMMUNITY_PROFILES[s]?.avatar) {
            const av = window.LUMINA_COMMUNITY_PROFILES[s].avatar;
            if (!isCommanderAsset(av)) return av;
        }
        return 'lumina_icon.jpg';
    }

    // 1. Natychmiastowe czyszczenie Storage (LocalStorage & SessionStorage)
    function sanitizeStorage() {
        try {
            const keysToPurge = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (!k) continue;

                // Sprawdź custom avatary
                if (k.startsWith('lumina_custom_avatar_') || k.startsWith('lumina_avatar_')) {
                    const slug = k.replace('lumina_custom_avatar_', '').replace('lumina_avatar_', '');
                    if (!isCommanderSlug(slug)) {
                        const val = localStorage.getItem(k);
                        if (isCommanderAsset(val)) {
                            keysToPurge.push(k);
                        }
                    }
                }

                // Sprawdź profile w cache
                if (k.startsWith('lumina_profile_')) {
                    const slug = k.replace('lumina_profile_', '');
                    if (!isCommanderSlug(slug)) {
                        try {
                            const prof = JSON.parse(localStorage.getItem(k) || 'null');
                            if (prof && isCommanderAsset(prof.avatar)) {
                                keysToPurge.push(k);
                            }
                        } catch(e) {}
                    }
                }
            }

            keysToPurge.forEach(k => {
                console.warn('[LUMINA IDENTITY GUARD] Purging contaminated key:', k);
                localStorage.removeItem(k);
            });

            // Oczyszczenie lumina_element_overrides
            const rawOvs = localStorage.getItem('lumina_element_overrides');
            if (rawOvs) {
                const ovs = JSON.parse(rawOvs);
                let changed = false;
                Object.keys(ovs).forEach(sel => {
                    const isCezSel = sel.includes('cezaryrgowski') || sel.includes('home-cezary-card') || sel.includes('card_profile_cezaryrgowski');
                    if (!isCezSel) {
                        const item = ovs[sel];
                        if (isCommanderAsset(JSON.stringify(item))) {
                            console.warn('[LUMINA IDENTITY GUARD] Purging illegal Commander override on selector:', sel);
                            delete ovs[sel];
                            changed = true;
                        }
                    }
                });
                if (changed) {
                    localStorage.setItem('lumina_element_overrides', JSON.stringify(ovs));
                }
            }
        } catch(e) {
            console.warn('[LUMINA IDENTITY GUARD] Storage sanitization exception:', e);
        }
    }

    // 2. Weryfikacja i dezynfekcja węzłów DOM
    function sanitizeDom() {
        try {
            // Sprawdź karty profilowe
            document.querySelectorAll('.profile-card, [data-profile-slug]').forEach(card => {
                const slug = (card.getAttribute('data-profile-slug') || card.id?.replace('card_profile_', '') || '').toLowerCase().trim();
                if (slug && !isCommanderSlug(slug)) {
                    const img = card.querySelector('img');
                    if (img && isCommanderAsset(img.src)) {
                        const cleanSrc = getProperProfileAvatar(slug);
                        console.warn('[LUMINA IDENTITY GUARD] Reverting illegal Commander photo on card ' + slug + ' to ' + cleanSrc);
                        img.src = cleanSrc;
                        img.setAttribute('src', cleanSrc);
                        img.removeAttribute('srcset');
                    }
                }
            });

            // Sprawdź awatary w podglądzie profilu (lumina-profile.html)
            const urlParams = new URLSearchParams(window.location.search);
            const curSlug = (urlParams.get('u') || window.location.pathname.split('/').pop()?.replace('lumina.', '')?.replace('.html', '') || '').toLowerCase().trim();
            if (curSlug && !isCommanderSlug(curSlug)) {
                const mainAvatars = document.querySelectorAll('#profileMainAvatar, #profileHeroAvatar, .profile-main-avatar, .profile-hero-avatar');
                mainAvatars.forEach(av => {
                    if (av && isCommanderAsset(av.src)) {
                        const cleanSrc = getProperProfileAvatar(curSlug);
                        console.warn('[LUMINA IDENTITY GUARD] Reverting illegal Commander photo on profile page ' + curSlug + ' to ' + cleanSrc);
                        av.src = cleanSrc;
                        av.setAttribute('src', cleanSrc);
                    }
                });
            }
        } catch(e) {
            console.warn('[LUMINA IDENTITY GUARD] DOM sanitization exception:', e);
        }
    }

    // Wykonaj natychmiast
    sanitizeStorage();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            sanitizeStorage();
            sanitizeDom();
        });
    } else {
        sanitizeDom();
    }
    window.addEventListener('load', () => {
        sanitizeStorage();
        sanitizeDom();
    });

    // 3. Monitorowanie DOM (MutationObserver) – pancerne zabezpieczenie przed dynamicznym wstrzyknięciem
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver((mutations) => {
            for (let i = 0; i < mutations.length; i++) {
                const mut = mutations[i];
                if (mut.type === 'attributes' && mut.attributeName === 'src') {
                    const target = mut.target;
                    if (target && target.tagName === 'IMG' && isCommanderAsset(target.src)) {
                        const card = target.closest('.profile-card, [data-profile-slug]');
                        if (card) {
                            const slug = (card.getAttribute('data-profile-slug') || card.id?.replace('card_profile_', '') || '').toLowerCase().trim();
                            if (slug && !isCommanderSlug(slug)) {
                                const cleanSrc = getProperProfileAvatar(slug);
                                target.src = cleanSrc;
                                target.setAttribute('src', cleanSrc);
                            }
                        }
                    }
                }
            }
        });

        function startObserver() {
            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
            } else {
                setTimeout(startObserver, 50);
            }
        }
        startObserver();
    }

    // Eksport pomocniczy dla window
    window.LuminaIdentityGuard = {
        isCommanderAsset,
        isCommanderSlug,
        sanitizeStorage,
        sanitizeDom,
        getProperProfileAvatar
    };
})();
