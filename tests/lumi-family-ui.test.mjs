import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { readFile } from 'node:fs/promises';
import { mountRoomNavigation } from '../components/lumi-room-navigation.js';
import { mountFamilyView } from '../components/lumi-family-view.js';
const tick = () => new Promise(r => setTimeout(r, 0));
test('Kids family entry loads the released module under a fresh cache key', async () => {
    const html = await readFile(new URL('../lumi-kids/app/index.html', import.meta.url), 'utf8');
    const app = await readFile(new URL('../lumi-kids/app/app.js', import.meta.url), 'utf8');
    assert.match(html, /src="\/lumi-kids\/app\/app\.js\?v=20261019_family4"/);
    assert.doesNotMatch(html, /app\.js\?v=20261019_family[12]"/);
    assert.match(app, /import \{ openFamilyPanel \} from '\/components\/lumi-family-host\.js\?v=20261019_family2'/);
    assert.match(app, /Moja rodzina/);
});
function navigation() {
    const w = new Window(); w.document.body.innerHTML = `<section id="modal"><header><div><button id="tabBtnPublicChat">Świat</button><button id="tabBtnCommanderChat" hidden class="is-commander-hidden">Korona</button><button id="tabBtnGroupsChat">Grupy</button><button id="tabBtnPrivateChat"><span class="tab-badge">2</span>Rozmowy</button><button id="tabBtnLiveTv" aria-label="Telewizja">📺</button><button id="tabBtnCreatePost">Napisz</button></div></header></section>`;
    return { w, d: w.document };
}
test('three main original buttons plus More; overflow retains original handlers and authorization', async () => {
    const { w, d } = navigation(); let calls = 0;
    const tv = d.getElementById('tabBtnLiveTv'); tv.onclick = () => calls++;
    const api = mountRoomNavigation(d, { onFamily() {} }); await tick();
    const bar = d.getElementById('tabBtnPublicChat').parentElement;
    assert.deepEqual([...bar.children].map(b => b.id), ['tabBtnPublicChat','tabBtnGroupsChat','tabBtnPrivateChat','tabBtnMoreRooms']);
    assert.equal(d.getElementById('tabBtnLiveTv'), tv); tv.click(); assert.equal(calls, 1);
    assert.equal(d.getElementById('tabBtnCommanderChat').hidden, true);
    assert.equal(d.getElementById('tabBtnPrivateChat').querySelector('.tab-badge').textContent, '2');
    assert.equal(bar.parentElement.lastElementChild, bar, 'composer header selector must keep working');
    assert.equal(mountRoomNavigation(d), api);
    const dynamic = d.createElement('button'); dynamic.id = 'new-room'; dynamic.innerHTML = '<span class="tab-badge">3</span>';
    bar.append(dynamic); await tick(); await tick();
    assert.equal(dynamic.parentElement.className, 'lumi-more-items');
    assert.equal(d.querySelector('.lumi-more-badge').textContent, '3');
    assert.equal(d.querySelector('.lumi-more-badge').hidden, false);
    api.dispose(); await w.happyDOM.close();
});
test('More dialog opens, closes with focus restoration and does not duplicate nodes', async () => {
    const { w, d } = navigation(); const api = mountRoomNavigation(d);
    d.getElementById('tabBtnMoreRooms').click();
    assert.equal(d.getElementById('lumiMoreRooms').open, true);
    assert.equal(d.getElementById('tabBtnMoreRooms').getAttribute('aria-expanded'), 'true');
    d.querySelector('.lumi-more-close').click();
    assert.equal(d.getElementById('lumiMoreRooms').open, false);
    assert.equal(d.activeElement.id, 'tabBtnMoreRooms');
    assert.equal(d.querySelectorAll('#tabBtnLiveTv').length, 1);
    api.dispose(); await w.happyDOM.close();
});
test('family screen escapes messages, persists before success, keeps draft on failure and retries same ID', async () => {
    const w = new Window(), host = w.document.createElement('div'); w.document.body.append(host);
    let emit, resolveSend, rejectSend; const calls = [];
    const client = {
        listMemberships: async () => [], getRoom: async () => ({ name: 'Rodzina TEST', isGuardian: false }),
        listMembers: async () => [{ uid: 'self' }], watchMessages: (_, update) => { emit = update; return () => {}; },
        send: (...args) => { calls.push(args); return new Promise((res, rej) => { resolveSend = res; rejectSend = rej; }); }
    };
    const view = mountFamilyView({ element: host, client, userUid: 'self', nameForUid: async () => 'TEST' });
    await tick(); await view.room('test-room');
    emit({ state: 'synced', messages: [{ senderUid: 'self', text: '<img src=x onerror=alert(1)>' }] });
    assert.equal(host.querySelectorAll('img').length, 0);
    assert.match(host.querySelector('.lf-message p').textContent, /<img/);
    const input = host.querySelector('textarea'), form = host.querySelector('form'); input.value = 'Wiadomość TEST';
    form.dispatchEvent(new w.Event('submit', { cancelable: true })); await tick();
    assert.equal(input.value, 'Wiadomość TEST'); assert.equal(host.querySelector('[type=submit]').disabled, true);
    rejectSend(new Error('offline')); await tick();
    assert.equal(input.value, 'Wiadomość TEST');
    form.dispatchEvent(new w.Event('submit', { cancelable: true })); await tick();
    assert.equal(calls[0][1], calls[1][1]);
    resolveSend({ state: 'stored' }); await tick(); assert.equal(input.value, '');
    view.dispose(); assert.equal(host.textContent, ''); await w.happyDOM.close();
});
test('pending invitation screen does not fetch room details; accepts before opening history', async () => {
    const w = new Window(), host = w.document.createElement('div'); w.document.body.append(host);
    let reads = 0, accepted = false;
    const client = { listMemberships: async () => accepted ? [] : [{ state: 'pending', roomId: 'test-room' }],
        getRoom: async () => { reads++; throw new Error('should not read'); },
        answerInvitation: async (_, value) => { accepted = value; } };
    const view = mountFamilyView({ element: host, client, userUid: 'test' }); await tick();
    assert.equal(reads, 0); assert.match(host.textContent, /Zaproszenie/);
    [...host.querySelectorAll('button')].find(b => b.textContent === 'Przyjmij').click(); await tick();
    assert.equal(accepted, true); assert.equal(reads, 0); view.dispose(); await w.happyDOM.close();
});
