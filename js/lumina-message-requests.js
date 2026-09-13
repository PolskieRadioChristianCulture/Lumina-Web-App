/* LUMINA — prośby o rozmowę dla pierwszego kontaktu 1:1. */
(function () {
    let requests = [];
    let unsubscribe = null;
    let observer = null;

    function requestList() {
        return document.getElementById('dmConversationsList');
    }

    function showToast(message) {
        if (typeof window.showToast === 'function') window.showToast(message);
    }

    function renderRequests() {
        const list = requestList();
        if (!list) return;
        document.getElementById('luminaMessageRequests')?.remove();
        if (!requests.length) return;

        const section = document.createElement('section');
        section.id = 'luminaMessageRequests';
        section.className = 'lumina-message-requests';
        const title = document.createElement('div');
        title.className = 'lumina-message-requests-title';
        title.textContent = `Prośby o rozmowę (${requests.length})`;
        section.appendChild(title);

        requests.forEach(request => {
            const card = document.createElement('article');
            card.className = 'lumina-message-request-card';
            const avatar = document.createElement('img');
            avatar.src = request.senderAvatar || 'lumina_icon.jpg';
            avatar.alt = '';
            avatar.loading = 'lazy';
            avatar.className = 'lumina-message-request-avatar';

            const content = document.createElement('div');
            content.className = 'lumina-message-request-content';
            const name = document.createElement('strong');
            name.textContent = request.senderName || 'Członek społeczności LUMINA';
            const preview = document.createElement('p');
            preview.textContent = request.previewText || 'Chce rozpocząć rozmowę.';
            content.append(name, preview);

            const actions = document.createElement('div');
            actions.className = 'lumina-message-request-actions';
            const accept = document.createElement('button');
            accept.type = 'button'; accept.className = 'accept'; accept.textContent = 'Akceptuj';
            accept.onclick = async () => {
                accept.disabled = true;
                const accepted = await window.LuminaDB?.acceptMessageRequest?.(request.id);
                if (!accepted) { showToast('Nie udało się zaakceptować prośby. Spróbuj ponownie.'); accept.disabled = false; return; }
                showToast('Rozmowa została zaakceptowana.');
                window.openChatWith?.(request.senderName, request.senderAvatar, request.senderId);
            };
            const decline = document.createElement('button');
            decline.type = 'button'; decline.className = 'decline'; decline.textContent = 'Odrzuć';
            decline.onclick = async () => {
                decline.disabled = true;
                if (!await window.LuminaDB?.declineMessageRequest?.(request.id, false)) { showToast('Nie udało się odrzucić prośby.'); decline.disabled = false; }
            };
            const block = document.createElement('button');
            block.type = 'button'; block.className = 'block'; block.title = 'Zablokuj użytkownika'; block.textContent = 'Blokuj';
            block.onclick = async () => {
                block.disabled = true;
                if (!await window.LuminaDB?.declineMessageRequest?.(request.id, true)) { showToast('Nie udało się zablokować użytkownika.'); block.disabled = false; }
            };
            actions.append(accept, decline, block);
            card.append(avatar, content, actions);
            section.appendChild(card);
        });
        list.prepend(section);
    }

    function attach() {
        if (unsubscribe || !window.LuminaDB?.subscribeToIncomingMessageRequests) return;
        unsubscribe = window.LuminaDB.subscribeToIncomingMessageRequests(nextRequests => {
            requests = nextRequests;
            renderRequests();
        });
        const list = requestList();
        if (list && !observer) {
            observer = new MutationObserver(() => {
                if (requests.length && !document.getElementById('luminaMessageRequests')) renderRequests();
            });
            observer.observe(list, { childList: true });
        }
    }

    function start() {
        attach();
        window.addEventListener('lumina-auth-state', () => {
            unsubscribe?.(); unsubscribe = null; requests = []; renderRequests(); attach();
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
