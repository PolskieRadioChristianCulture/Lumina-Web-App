/**
 * LUMINA Profile Standard v1.0 - Shared Profile Component Runtime
 * Enforces responsive geometry, accessible attributes, and error fallbacks
 * across all existing and newly created LUMINA profiles.
 */
(function() {
    'use strict';

    const DEFAULT_AVATAR = 'lumina_icon.jpg';
    const DEFAULT_COVER = 'lumina_default_cover.jpg';

    function enforceProfileStandard() {
        if (!document.body.classList.contains('lumina-profile-standard')) {
            document.body.classList.add('lumina-profile-standard');
        }

        // 1. Enforce Cover Fallback and Alt text
        const covers = document.querySelectorAll('.cover-photo, .hero-cover, .lumina-profile-cover img, #coverPhotoEl');
        covers.forEach(cover => {
            if (!cover.getAttribute('alt') || cover.getAttribute('alt') === 'Cover') {
                cover.setAttribute('alt', 'Zdjęcie w tle profilu LUMINA');
            }
            cover.addEventListener('error', function() {
                if (this.src !== DEFAULT_COVER && !this.src.endsWith(DEFAULT_COVER)) {
                    this.src = DEFAULT_COVER;
                }
            }, { once: true });
        });

        // 2. Enforce Avatar 1:1, Circle, Alt Text & Fallback
        const avatars = document.querySelectorAll('.avatar-img, .hero-avatar-img, .lumina-profile-avatar, #avatarImgEl');
        const userNameEl = document.querySelector('.head-user-name, .hero-name, #userNameEl');
        const userName = userNameEl ? (userNameEl.textContent || '').trim().replace(/\s+/g, ' ') : 'Użytkownik';

        avatars.forEach(avatar => {
            const currentAlt = avatar.getAttribute('alt');
            if (!currentAlt || currentAlt === 'Avatar' || currentAlt.length < 3) {
                avatar.setAttribute('alt', `Zdjęcie profilowe ${userName}`);
            }
            avatar.addEventListener('error', function() {
                if (this.src !== DEFAULT_AVATAR && !this.src.endsWith(DEFAULT_AVATAR)) {
                    this.src = DEFAULT_AVATAR;
                }
            }, { once: true });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enforceProfileStandard);
    } else {
        enforceProfileStandard();
    }
    window.addEventListener('load', enforceProfileStandard);

    window.LuminaProfileStandard = {
        version: '1.0',
        enforce: enforceProfileStandard,
        defaultAvatar: DEFAULT_AVATAR,
        defaultCover: DEFAULT_COVER
    };
})();
