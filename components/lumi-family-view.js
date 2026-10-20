// One text-only family screen shared by LUMI Messenger and LUMI Kids.
// Never render message/profile strings as HTML. No private drafts in localStorage.
import {readWithDeadline,chatReadError} from './lumi-chat-readiness.js?v=20261019_read1';
export function mountFamilyView({ element, client, userUid, nameForUid = async () => 'Członek rodziny',
    inviteContacts = async () => [], onClose = () => {}, read=readWithDeadline }) {
    const doc = element.ownerDocument;
    let stopped = false, epoch = 0, stopMessages = () => {}, outbox = null;
    function el(tag, text, props = {}) {
        const e = doc.createElement(tag); if (text != null) e.textContent = text;
        Object.assign(e, props); return e;
    }
    const root = el('section', null, { className: 'lumi-family' });
    const header = el('header'), title = el('h2', 'Rodzina');
    const back = el('button', '←', { type: 'button' }); back.setAttribute('aria-label', 'Wróć do rodzin');
    const close = el('button', '×', { type: 'button' }); close.setAttribute('aria-label', 'Zamknij pokój rodzinny');
    const status = el('p', '', { className: 'lf-status' }); status.setAttribute('role', 'status');
    const content = el('div', null, { className: 'lf-content' });
    header.append(back, title, close); root.append(header, status, content); element.replaceChildren(root);
    function reset(name) { epoch++; stopMessages(); stopMessages = () => {}; outbox = null;
        title.textContent = name; content.replaceChildren(); status.textContent = ''; return epoch; }
    const current = n => !stopped && epoch === n;
    const errorText = chatReadError;
    async function action(button, work) {
        if (button.disabled) return; button.disabled = true; const n = epoch;
        try { await work(); } catch (e) { if (current(n)) status.textContent = errorText(e); }
        finally { if (current(n)) button.disabled = button.dataset.done === 'true'; }
    }
    async function list() {
        const n = reset('Moje rodziny'); back.hidden = true; status.textContent = 'Wczytuję zaproszenia…';
        try {
            const memberships = await read(()=>client.listMemberships()); if (!current(n)) return;
            status.textContent = '';
            const relevant = memberships.filter(m => ['pending', 'accepted'].includes(m.state));
            if (!relevant.length) content.append(el('p', 'Nie masz jeszcze zaproszenia do rodziny. Poproś opiekuna.'));
            for (const m of relevant) {
                const card = el('article', null, { className: 'lf-card' });
                if (m.state === 'pending') {
                    card.append(el('h3', 'Zaproszenie do rodziny'), el('p', 'Przyjmij, aby zobaczyć pokój i jego historię.'));
                    for (const [text, accept] of [['Przyjmij', true], ['Odrzuć', false]]) {
                        const b = el('button', text, { type: 'button' });
                        b.onclick = () => action(b, async () => { await client.answerInvitation(m.roomId, accept); await list(); });
                        card.append(b);
                    }
                } else {
                    const b = el('button', 'Otwórz rodzinę', { type: 'button' }); b.onclick = () => room(m.roomId);
                    card.append(b);
                    try { const r = await read(()=>client.getRoom(m.roomId)); if (!current(n)) return; b.textContent = r.name; }
                    catch(e) { if(!current(n))return; b.disabled = true; b.textContent = 'Pokój niedostępny';status.textContent=errorText(e); }
                }
                if (!current(n)) return; content.append(card);
            }
        } catch (e) { if (current(n)) status.textContent = errorText(e); }
        if (current(n)) {
            const refresh = el('button', 'Odśwież', { type: 'button' }); refresh.onclick = list; content.append(refresh);
        }
    }
    async function room(roomId) {
        const n = reset('Rodzina'); back.hidden = false; status.textContent = 'Otwieram pokój…';
        try {
            const r = await read(()=>client.getRoom(roomId)); if (!current(n)) return;
            title.textContent = r.name;
            const members = await read(()=>client.listMembers(roomId)); if (!current(n)) return;
            const names = new Map();
            await read(()=>Promise.all(members.map(async m => {
                let name='Członek rodziny';
                try{name=await readWithDeadline(()=>nameForUid(m.uid),2000);}catch{/* Optional names must not block the composer. */}
                names.set(m.uid,name);
            })));
            if (!current(n)) return;
            const people = el('p', [...names.values()].join(' · '), { className: 'lf-members' });
            content.append(people);
            if (!r.isGuardian) {
                const leave = el('button', 'Opuść rodzinę', { type: 'button' });
                leave.onclick = () => action(leave, async () => { await client.leave(roomId); await list(); });
                content.append(leave);
            }
            if (r.isGuardian) {
                const invite = el('button', '＋ Zaproś do rodziny', { type: 'button' });
                invite.onclick = () => action(invite, async () => {
                    const contacts = await inviteContacts(); if (!current(n)) return;
                    const picker = el('div', null, { className: 'lf-card' });
                    picker.append(el('p', 'Wybierz zatwierdzony kontakt. Zaproszenie nie daje dostępu przed przyjęciem.'));
                    const available = contacts.filter(c => !members.some(m => m.uid === c.uid));
                    if (!available.length) picker.append(el('p', 'Brak nowych zatwierdzonych kontaktów.'));
                    for (const contact of available) {
                        const b = el('button', contact.name, { type: 'button' });
                        b.onclick = () => action(b, async () => { await client.invite(roomId, contact.uid);
                            if (current(n)) { b.textContent = 'Zaproszenie oczekuje'; b.dataset.done = 'true'; b.disabled = true; } });
                        picker.append(b);
                    }
                    content.prepend(picker); invite.disabled = true;
                });
                content.append(invite);
            }
            const messages = el('div', null, { className: 'lf-messages' });
            messages.setAttribute('role', 'log'); messages.setAttribute('aria-label', 'Wiadomości rodzinne');
            const form = el('form'), input = el('textarea', null, { maxLength: 1000, rows: 1,
                placeholder: 'Wiadomość do rodziny…' }); input.setAttribute('aria-label', 'Wiadomość do rodziny');
            const send = el('button', '➤', { type: 'submit' }); send.setAttribute('aria-label', 'Wyślij wiadomość');
            form.append(input, send); content.append(messages, form);
            form.onsubmit = e => { e.preventDefault(); const text = input.value.trim(); if (!text || send.disabled) return;
                if (!outbox || outbox.text !== text) outbox = { text, id: doc.defaultView.crypto.randomUUID() };
                const request = outbox;
                action(send, async () => { status.textContent = 'Zapisuję…';
                    await client.send(roomId, request.id, request.text); if (!current(n)) return;
                    if (input.value.trim() === request.text) input.value = '';
                    outbox = null; status.textContent = 'Zapisano'; input.focus(); });
            };
            stopMessages = client.watchMessages(roomId, snapshot => {
                if (!current(n)) return;
                const nearBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < 80;
                messages.replaceChildren();
                for (const m of snapshot.messages) {
                    const item = el('article', null, { className: m.senderUid === userUid ? 'lf-message own' : 'lf-message' });
                    item.append(el('small', names.get(m.senderUid) || 'Członek rodziny'), el('p', m.text)); messages.append(item);
                }
                status.textContent = snapshot.state === 'closed' ? 'Połączenie zamknięte' :
                    snapshot.state === 'cached' ? 'Historia z pamięci — sprawdzam połączenie…' :
                    snapshot.state === 'pending' ? 'Zapisuję…' : '';
                if (nearBottom) messages.scrollTop = messages.scrollHeight;
                if (snapshot.state === 'closed') { input.disabled = true; send.disabled = true; }
            }, e => { if (current(n)) status.textContent = errorText(e); });
        } catch (e) { if (current(n)) { content.replaceChildren(); status.textContent = errorText(e); } }
    }
    back.onclick = list;
    function dispose() { if (stopped) return; stopped = true; reset('Rodzina'); element.replaceChildren(); }
    close.onclick = () => { dispose(); onClose(); };
    list();
    return { list, room, dispose };
}
