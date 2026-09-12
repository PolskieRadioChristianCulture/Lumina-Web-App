const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function worker() {
    const listeners = {}, shown = [], opened = [];
    let background;
    const self = {
        location: { origin: 'https://polskieradio.cc' },
        addEventListener: (type, callback) => { listeners[type] = callback; },
        registration: { showNotification: async (...args) => shown.push(args) },
    };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'firebase-messaging-sw.js'), 'utf8'), {
        self, URL, console,
        importScripts: () => assert.equal(typeof listeners.notificationclick, 'function'),
        firebase: { initializeApp() {}, messaging: () => ({ onBackgroundMessage: fn => { background = fn; } }) },
        clients: { matchAll: async () => [], openWindow: async url => opened.push(url) },
    });
    return { listeners, shown, opened, background };
}

test('FCM notification payload renders once with full title and body', async () => {
    const w = worker();
    const payload = { from: '413985877183', notification: { title: 'Test', body: 'Tresc' }, data: {} };
    w.listeners.push({ data: { json: () => payload }, waitUntil: p => p });
    await w.background(payload);
    assert.equal(w.shown.length, 1);
    assert.equal(w.shown[0][0], 'Test');
    assert.equal(w.shown[0][1].body, 'Tresc');
});

test('data-only FCM renders once and resolves public-chat URL', async () => {
    const w = worker();
    const payload = { from: '413985877183', data: { type: 'public_chat', title: 'Test', url: '/wrong' } };
    w.listeners.push({ data: { json: () => payload }, waitUntil: p => p });
    await w.background(payload);
    assert.equal(w.shown.length, 1);
    assert.equal(w.shown[0][1].data.url, '/lumina?openPublicChat=1');
});

test('ordinary Web Push continues to render without Firebase envelope', async () => {
    const w = worker();
    let pending;
    w.listeners.push({ data: { json: () => ({ data: { title: 'Test' } }) }, waitUntil: p => { pending = p; } });
    await pending;
    assert.equal(w.shown.length, 1);
});

for (const [name, data, expected] of [
    ['Firebase direct-message click', { FCM_MSG: { data: { type: 'direct_message', senderId: 'anna', messageId: 'm1' } } }, '/lumina?openChat=anna&messageId=m1'],
    ['public chat with sender', { type: 'public_chat', senderId: 'anna' }, '/lumina?openPublicChat=1'],
    ['foreign redirect rejected', { url: 'https://example.org/' }, '/lumina'],
]) {
    test(name, async () => {
        const w = worker();
        let pending;
        w.listeners.notificationclick({ notification: { data, close() {} }, stopImmediatePropagation() {}, waitUntil: p => { pending = p; } });
        await pending;
        assert.equal(w.opened[0], 'https://polskieradio.cc' + expected);
    });
}

async function register({ failSave = false, signedIn = true } = {}) {
    const source = fs.readFileSync(path.join(root, 'lumina-db.js'), 'utf8');
    const start = source.indexOf('export async function requestNotificationPermission(');
    const end = source.indexOf('// ═════', start);
    const writes = [], local = new Map();
    const context = vm.createContext({
        window: { Notification: {} }, Notification: { requestPermission: async () => 'granted' },
        auth: { authStateReady: async () => {}, currentUser: signedIn ? { uid: 'auth-123', isAnonymous: false } : null },
        navigator: { userAgent: 'Android', serviceWorker: { ready: Promise.resolve({}), register: async (url, options) => {
            assert.ok(url.startsWith('/firebase-messaging-sw.js'));
            assert.equal(options.scope, '/');
            return {};
        } } },
        db: {}, messaging: {}, LUMINA_VAPID_KEY: 'test',
        getToken: async () => 'test-token',
        doc: (_db, collection, id) => ({ collection, id }),
        setDoc: async (ref, data) => { if (failSave) throw Error('permission-denied'); writes.push(data); },
        updateDoc: async () => {}, serverTimestamp: () => 'now',
        currentProfileState: { slug: 'anna' }, currentUserState: { uid: 'auth-123' },
        localStorage: { getItem: () => 'anna', setItem: (key, value) => local.set(key, value) },
        console: { log() {}, warn() {} },
    });
    vm.runInContext(source.slice(start, end).replace('export async', 'async'), context);
    const token = await vm.runInContext('requestNotificationPermission("anna")', context);
    return { token, writes, local };
}

test('registration binds token to authenticated UID, not profile slug', async () => {
    const result = await register();
    assert.equal(result.token, 'test-token');
    assert.equal(result.writes[0].uid, 'auth-123');
});

test('failed device persistence cannot report successful registration', async () => {
    const result = await register({ failSave: true });
    assert.equal(result.token, null);
    assert.equal(result.local.has('lumina_fcm_token'), false);
});

test('logged-out visitor cannot register a private-message device', async () => {
    const result = await register({ signedIn: false });
    assert.equal(result.token, null);
    assert.equal(result.writes.length, 0);
});
