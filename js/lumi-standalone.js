(function () {
    'use strict';
    let installPrompt = null;
    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault(); installPrompt = event;
        const btn = document.getElementById('lumiInstall');
        if (btn) btn.textContent = 'Zainstaluj LUMI Messenger';
    });
    function setup() {
        const open = document.getElementById('lumiOpen');
        const install = document.getElementById('lumiInstall');
        const status = document.getElementById('lumiInstallStatus');
        if (!open || !install || !status) return;
        const installed = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
        function updateAccount() {
            const user = window.LuminaDB?.getCurrentUser?.();
            const member = Boolean(user && !user.isAnonymous);
            const login = document.getElementById('lumiLogin');
            if (login) login.hidden = member;
            open.textContent = member ? 'Otwórz moje rozmowy' : 'Otwórz komunikator';
        }
        function updateInstalled() {
            if (installed()) { install.hidden = true; status.textContent = 'LUMI uruchomione jako aplikacja.'; }
        }
        function openChat() {
            const user = window.LuminaDB?.getCurrentUser?.();
            if (user && !user.isAnonymous && typeof window.openDirectMessagesModal === 'function') {
                window.openDirectMessagesModal('private');
            } else if (window.CCGlobalChat && document.getElementById('ccChatFabBtn')) {
                window.CCGlobalChat.open('live');
            } else {
                status.textContent = 'Komunikator jeszcze się ładuje. Spróbuj ponownie za chwilę.';
            }
        }
        open.addEventListener('click', openChat);
        install.addEventListener('click', async () => {
            if (!installPrompt) {
                const help = document.getElementById('lumiInstallHelp');
                if (help) { help.open = true; help.scrollIntoView?.({block:'nearest'}); }
                return;
            }
            const prompt = installPrompt; installPrompt = null; install.disabled = true;
            try {
                await prompt.prompt();
                const choice = await prompt.userChoice;
                status.textContent = choice.outcome === 'accepted' ? 'Przeglądarka przyjęła instalację LUMI.' : 'Instalacja anulowana. Możesz nadal korzystać z przeglądarki.';
            } catch { status.textContent = 'Skorzystaj z instalacji w menu przeglądarki.'; }
            finally { install.disabled = false; install.textContent = 'Dodaj LUMI do urządzenia'; }
        });
        window.addEventListener('appinstalled', () => {
            installPrompt = null; install.hidden = true; status.textContent = 'LUMI Messenger zostało zainstalowane.';
        });
        // Reuse the existing push worker; no new scope, cache purge or push consent.
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/firebase-messaging-sw.js?v=4.1.6_20260914_fullsync', {scope:'/', updateViaCache:'none'}).catch(() => {
                status.textContent = 'Nie udało się przygotować aplikacji. Komunikator pozostaje dostępny w przeglądarce.';
            });
        }
        updateInstalled();
        updateAccount();
        window.addEventListener('lumina-auth-state', updateAccount);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
    else setup();
})();
