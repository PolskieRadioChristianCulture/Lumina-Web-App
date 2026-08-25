/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA MOBILE BACK GESTURE & NAVIGATION GUARD (lumina-mobile-back-guard.js)
 * ══════════════════════════════════════════════════════════════════════════
 * Zabezpiecza gest cofania (swipe back) oraz systemowy przycisk Wstecz na telefonach:
 * 1. Zamyka aktywne modale, czaty, szuflady menu i powiększenia zdjęć (zamiast wychodzić z appki).
 * 2. Cofa do poprzedniej podstrony portalu LUMINA (zamiast zamykać PWA / przeglądarkę).
 * 3. Zapobiega przypadkowemu wyjściu z aplikacji na stronie głównej (Double-Back to Exit).
 * ══════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    if (window._luminaMobileBackGuardInitialized) return;
    window._luminaMobileBackGuardInitialized = true;

    // ── 1. Śledzenie historii w obrębie portalu (Session Storage Stack) ──
    const currentUrl = window.location.pathname.split('/').pop() || 'lumina.html';
    const isHomePage = (currentUrl === '' || currentUrl === 'lumina.html' || currentUrl === 'index.html');

    try {
        let historyStack = JSON.parse(sessionStorage.getItem('lumina_internal_history_stack') || '[]');
        // Unikaj duplikowania tej samej strony na szczycie stosu
        if (historyStack[historyStack.length - 1] !== currentUrl) {
            historyStack.push(currentUrl);
            // Ogranicz do ostatnich 20 stron
            if (historyStack.length > 20) historyStack.shift();
            sessionStorage.setItem('lumina_internal_history_stack', JSON.stringify(historyStack));
        }
    } catch(e) {}

    // ── 2. Buforowanie historii przeglądarki (Anti-Exit Cushion) ──
    function ensureHistoryCushion() {
        if (!window.history.state || !window.history.state.luminaRoot) {
            window.history.replaceState({ luminaRoot: true, page: currentUrl, depth: 0 }, document.title);
            window.history.pushState({ luminaActive: true, page: currentUrl, depth: 1 }, document.title);
        }
    }
    ensureHistoryCushion();

    // ── 3. Helpery do wykrywania i zamykania otwartych elementów UI ──
    function getOpenModals() {
        const modals = [];

        // 1. Modale standardowe i overlaye
        document.querySelectorAll('.modal-overlay, .lumina-modal-overlay, .overlay, .community-modal-overlay').forEach(el => {
            const isVisible = el.classList.contains('open') || 
                              el.classList.contains('active') || 
                              el.classList.contains('show') || 
                              el.style.display === 'flex' || 
                              el.style.display === 'block';
            if (isVisible) modals.push(el);
        });

        // 2. Szuflada nawigacyjna (Top Drawer)
        const drawer = document.getElementById('topNavDrawer');
        if (drawer && (drawer.classList.contains('open') || drawer.classList.contains('active') || drawer.style.display === 'flex' || drawer.style.display === 'block')) {
            modals.push(drawer);
        }

        // 3. Dolne menu PWA (Bottom Nav Drawer)
        const btmMenu = document.getElementById('luminaBottomNavMenu');
        if (btmMenu && (btmMenu.classList.contains('open') || btmMenu.style.display === 'flex' || btmMenu.style.display === 'block')) {
            modals.push(btmMenu);
        }

        // 4. Lightbox zdjęć
        const lightbox = document.getElementById('photoLightboxModal') || document.getElementById('imageLightboxModal');
        if (lightbox && (lightbox.classList.contains('open') || lightbox.style.display === 'flex' || lightbox.style.display === 'block')) {
            modals.push(lightbox);
        }

        // 5. Czat modalny / okno wiadomości
        const chatModal = document.getElementById('luminaChatModal') || document.getElementById('directChatModal');
        if (chatModal && (chatModal.classList.contains('open') || chatModal.style.display === 'flex' || chatModal.style.display === 'block')) {
            modals.push(chatModal);
        }

        return modals;
    }

    function closeTopmostModal(openModals) {
        if (!openModals || !openModals.length) return false;
        const target = openModals[openModals.length - 1];

        // Sprawdź czy element ma dedykowaną funkcję zamykającą
        const id = target.id || '';
        
        if (id === 'topNavDrawer' && typeof window.closeTopNavDrawer === 'function') {
            window.closeTopNavDrawer();
            return true;
        }
        if (id === 'luminaBottomNavMenu' && typeof window.toggleCcBottomNavMenu === 'function') {
            window.toggleCcBottomNavMenu();
            return true;
        }
        if ((id === 'photoLightboxModal' || id === 'imageLightboxModal') && typeof window.closePhotoLightbox === 'function') {
            window.closePhotoLightbox();
            return true;
        }
        if (id === 'communityProfileModal' && typeof window.closeCommunityProfileModal === 'function') {
            window.closeCommunityProfileModal();
            return true;
        }
        if (id === 'directChatModal' && typeof window.closeDirectChatModal === 'function') {
            window.closeDirectChatModal();
            return true;
        }
        if (id === 'luminaChatModal' && typeof window.closeLuminaChatModal === 'function') {
            window.closeLuminaChatModal();
            return true;
        }
        if (id === 'shareProfileModal' && typeof window.closeShareModal === 'function') {
            window.closeShareModal();
            return true;
        }
        if (id && typeof window.closeModal === 'function') {
            window.closeModal(id);
            return true;
        }

        // Domyślne zamknięcie CSS
        target.classList.remove('open', 'active', 'show');
        target.style.display = 'none';
        return true;
    }

    // ── 4. Rejestracja otwierania modali w historii przeglądarki ──
    window.pushModalHistoryState = function(modalIdentifier) {
        try {
            window.history.pushState({ luminaModal: modalIdentifier || 'modal', timestamp: Date.now() }, document.title);
        } catch(e) {}
    };

    // Auto-przechwytywanie openModal i otwierania profilu
    const origOpenModal = window.openModal;
    window.openModal = function(id) {
        window.pushModalHistoryState(id);
        if (typeof origOpenModal === 'function') return origOpenModal.apply(this, arguments);
    };

    const origOpenProfile = window.openCommunityProfile;
    window.openCommunityProfile = function(slug) {
        window.pushModalHistoryState('profile_' + slug);
        if (typeof origOpenProfile === 'function') return origOpenProfile.apply(this, arguments);
    };

    // ── 5. Główny odbiornik gestu cofania (POPSTATE) ──
    let lastBackPressTime = 0;

    window.addEventListener('popstate', function(e) {
        // A) Sprawdź czy jest otwarty jakikolwiek modal, drawer lub lightbox
        const openModals = getOpenModals();
        if (openModals.length > 0) {
            closeTopmostModal(openModals);
            // Utrzymaj poduszkę historii, aby następny gest znów działał
            window.history.pushState({ luminaActive: true, page: currentUrl }, document.title);
            return;
        }

        // B) Jeśli jesteśmy na podstronie (np. Tablica, profil, kanał misyjny), cofnij do poprzedniej strony portalu
        if (!isHomePage) {
            try {
                let stack = JSON.parse(sessionStorage.getItem('lumina_internal_history_stack') || '[]');
                // Usuń bieżącą stronę ze stosu
                if (stack.length > 0 && stack[stack.length - 1] === currentUrl) {
                    stack.pop();
                }
                const prevPage = stack.length > 0 ? stack.pop() : 'lumina.html';
                sessionStorage.setItem('lumina_internal_history_stack', JSON.stringify(stack));

                if (prevPage && prevPage !== currentUrl) {
                    window.location.href = prevPage;
                    return;
                } else {
                    window.location.href = 'lumina.html';
                    return;
                }
            } catch(err) {
                window.location.href = 'lumina.html';
                return;
            }
        }

        // C) Jeśli jesteśmy na stronie głównej (lumina.html):
        // 1. Jeśli użytkownik jest przewinięty w dół, przewiń do góry portalu
        if (window.scrollY > 300) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.history.pushState({ luminaActive: true, page: currentUrl }, document.title);
            return;
        }

        // 2. Jeśli jesteśmy na samej górze strony głównej — Double-tap to exit guard
        const now = Date.now();
        if (now - lastBackPressTime < 2500) {
            // Drugi gest w ciągu 2.5s — pozwól wyjść z aplikacji
            return;
        } else {
            lastBackPressTime = now;
            // Zapobiegnij wyjściu przy pojedynczym geście
            window.history.pushState({ luminaActive: true, page: currentUrl }, document.title);
            
            if (typeof window.showToast === 'function') {
                window.showToast('✨ Dotknij wstecz ponownie, aby zamknąć LUMINA');
            } else {
                console.log('[LUMINA] Dotknij wstecz ponownie, aby wyjść');
            }
        }
    });

    console.log('[LUMINA] Mobile Back Navigation Guard aktywny na stronie:', currentUrl);
})();
