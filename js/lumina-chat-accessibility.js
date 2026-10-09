// Scope keyboard and focus handling to the existing messenger only.
export function enhanceChatDialog(doc = document) {
    const modal = doc.getElementById('directMessagesModal');
    if (!modal || modal.dataset.keyboardReady) return () => {};
    modal.dataset.keyboardReady = 'true';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Centrum Rozmów LUMINA');
    modal.tabIndex = -1;
    const close = modal.querySelector('.modal-close-btn');
    close?.setAttribute('aria-label', 'Zamknij rozmowy');
    let opener = null;
    let wasOpen = false;
    const controls = () => [...modal.querySelectorAll('button, input, textarea, select, a[href], [tabindex]')]
        .filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length && !el.closest('[hidden]'));
    const sync = () => {
        const open = modal.classList.contains('open');
        if (open && !wasOpen) {
            opener = doc.activeElement;
            (controls()[0] || modal).focus();
        } else if (!open && wasOpen && opener?.isConnected) opener.focus();
        wasOpen = open;
    };
    const keyboard = event => {
        if (!modal.classList.contains('open')) return;
        const activeDialog = doc.activeElement?.closest('[role="dialog"], .modal-overlay.open');
        if (activeDialog && activeDialog !== modal && !modal.contains(activeDialog)) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            close?.click();
        } else if (event.key === 'Tab') {
            const items = controls();
            const first = items[0], last = items.at(-1);
            if (!first) { event.preventDefault(); modal.focus(); }
            else if (event.shiftKey && (doc.activeElement === first || !modal.contains(doc.activeElement))) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && (doc.activeElement === last || !modal.contains(doc.activeElement))) {
                event.preventDefault(); first.focus();
            }
        }
    };
    const Observer = doc.defaultView.MutationObserver;
    const observer = new Observer(sync);
    observer.observe(modal, {attributes:true, attributeFilter:['class']});
    doc.addEventListener('keydown', keyboard);
    sync();
    return () => { observer.disconnect(); doc.removeEventListener('keydown', keyboard); delete modal.dataset.keyboardReady; };
}
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => enhanceChatDialog(), {once:true});
    else enhanceChatDialog();
}
