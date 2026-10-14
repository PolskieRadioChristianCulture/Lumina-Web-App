// Unsent text stays on this page only: no storage, network or content logging.
(function () {
    'use strict';
    if (window.LumiChatDrafts) return;
    const drafts = new Map();
    let owner = '', room = '', generation = 0;
    const input = () => document.getElementById('activeChatInput');
    const currentOwner = () => {
        // Temporary SDK unavailability is not a confirmed logout.
        if (typeof window.LuminaDB?.getCurrentUser !== 'function') return owner;
        const user = window.LuminaDB?.getCurrentUser?.();
        return user && !user.isAnonymous ? String(user.uid || '') : '';
    };
    function syncOwner(event) {
        const announced = event?.detail;
        const next = announced && Object.prototype.hasOwnProperty.call(announced, 'user')
            ? (announced.user && !announced.user.isAnonymous ? String(announced.user.uid || '') : '')
            : currentOwner();
        if (next === owner) return;
        owner = next; room = ''; generation++; drafts.clear();
        if (input()) input().value = '';
    }
    function save() {
        syncOwner();
        const field = input();
        if (!owner || !room || !field) return;
        if (field.value) {
            drafts.delete(room);
            drafts.set(room, field.value);
            while (drafts.size > 50) drafts.delete(drafts.keys().next().value);
        } else drafts.delete(room);
    }
    window.LumiChatDrafts = {
        open(id) {
            save(); room = owner ? String(id || '') : '';
            const field = input();
            if (field) {
                field.value = drafts.get(room) || '';
                field.dispatchEvent(new Event('input', { bubbles: true }));
            }
        },
        leave() { save(); room = ''; if (input()) input().value = ''; },
        capture(id, text) {
            save();
            return { owner, generation, room: String(id || ''), text };
        },
        confirmed(ticket) {
            syncOwner();
            if (!ticket || ticket.owner !== owner || ticket.generation !== generation) return;
            if (drafts.get(ticket.room) === ticket.text) drafts.delete(ticket.room);
        }
    };
    document.addEventListener('input', event => {
        if (event.target?.id === 'activeChatInput') save();
    });
    window.addEventListener('lumina-auth-state', syncOwner);
    syncOwner();
})();
