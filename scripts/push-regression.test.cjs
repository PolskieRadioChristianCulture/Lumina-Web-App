const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function worker() {
    const listeners = {}, shown = [], opened = [], logs = [];
    let background;
    const self = {
        location: { origin: 'https://polskieradio.cc' },
        addEventListener: (type, callback) => { listeners[type] = callback; },
        registration: { showNotification: async (...args) => shown.push(args) },
    };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'firebase-messaging-sw.js'), 'utf8'), {
        self, URL, console: { log: (...args) => logs.push(args), warn: (...args) => logs.push(args) },
        importScripts: () => assert.equal(typeof listeners.notificationclick, 'function'),
        firebase: { initializeApp() {}, messaging: () => ({ onBackgroundMessage: fn => { background = fn; } }) },
        clients: { matchAll: async () => [], openWindow: async url => opened.push(url) },
    });
    return { listeners, shown, opened, background, logs, registration: self.registration };
}

// Model the routing/display contract in Firebase SDK 10.12.2 sw-listeners.ts.
// The ordinary callback mock alone does NOT include SDK automatic display.
// This is offline contract coverage, not a real browser or delivery test.
async function receiveViaSdk(w, payload, windowClients = []) {
    if (windowClients.some(client => client.visibilityState === 'visible' && !client.url.startsWith('chrome-extension://'))) {
        for (const client of windowClients) client.postMessage(payload);
        return;
    }
    if (payload.notification) {
        await w.registration.showNotification(payload.notification.title, {
            ...payload.notification, data: { FCM_MSG: payload }
        });
    }
    await w.background(payload);
}

for (const type of ['owner_push_test', 'daily_course_lesson']) {
    test(`${type}: background messages display with appropriate action and URL`, async () => {
        const w = worker();
        const payload = { from: 'test-sender', notification: {
            title: 'Test', body: 'Synthetic', tag: 'synthetic-test'
        }, data: { type, tag: 'synthetic-test', url: '/akademia/kurscodzienny/dzien-08' } };
        await w.background(payload);
        assert.equal(w.shown.length, 1);
        assert.equal(w.shown[0][1].data.url, payload.data.url);
        assert.equal(w.shown[0][1].actions[0].title, type === 'owner_push_test' ? 'Otwórz lekcję testową' : 'Czytaj lekcję');
    });

    test(`${type}: data-only background messages still display once`, async () => {
        const w = worker();
        await w.background({ from: 'test-sender', data: { type, title: 'Test', body: 'Synthetic', tag: 'synthetic-test', url: '/akademia/kurscodzienny/dzien-08' } });
        assert.equal(w.shown.length, 1);
        assert.equal(w.shown[0][1].data.url, '/akademia/kurscodzienny/dzien-08');
    });
}

test('background callback never logs private payloads', async () => {
    const w = worker();
    await w.background({ from: 'synthetic', data: { type: 'direct_message', body: 'PRIVATE-BODY-FIXTURE', senderId: 'PRIVATE-ID-FIXTURE' } });
    const output = JSON.stringify(w.logs);
    assert.doesNotMatch(output, /PRIVATE-BODY-FIXTURE|PRIVATE-ID-FIXTURE/);
});

test('SDK routes to windows when another page of the same origin is visible', async () => {
    const w = worker(), received = [];
    await receiveViaSdk(w, { from: 'synthetic', notification: { title: 'Test' }, data: { type: 'owner_push_test' } }, [
        { url: 'https://polskieradio.cc/lumina', visibilityState: 'hidden', postMessage: () => received.push('pwa') },
        { url: 'https://polskieradio.cc/akademia', visibilityState: 'visible', postMessage: () => received.push('other') }
    ]);
    assert.equal(w.shown.length, 0);
    assert.deepEqual(received, ['pwa', 'other']);
});

test('all hidden clients keep the course notification on the background path', async () => {
    const w = worker();
    await w.background({ from: 'synthetic', notification: { title: 'Test' }, data: { type: 'daily_course_lesson', url: '/akademia/kurscodzienny/dzien-08' } });
    assert.equal(w.shown.length, 1);
});

test('extension visibility alone does not select foreground delivery', async () => {
    const w = worker();
    await w.background({ from: 'synthetic', notification: { title: 'Test' }, data: { type: 'owner_push_test', url: '/akademia/kurscodzienny/dzien-08' } });
    assert.equal(w.shown.length, 1);
});

test('all three registration owners use the same root worker and bypass update cache', () => {
    const sources = ['lumina-db.js', 'js/lumina-background-mission-service.js', 'lumina-pwa-installer.js'].map(file => fs.readFileSync(path.join(root, file), 'utf8'));
    const urls = sources.map(source => {
        const call = source.match(/navigator\.serviceWorker\.register\('([^']+)',\s*\{\s*scope:\s*'\/',\s*updateViaCache:\s*'none'\s*\}\)/);
        assert.ok(call, 'Root registration must use updateViaCache: none');
        return call[1];
    });
    for (const url of urls) assert.equal(url, urls[0]);
    assert.match(urls[0], /^\/firebase-messaging-sw\.js\?v=/);
});

test('public worker response has explicit no-store cache policy', () => {
    const headers = fs.readFileSync(path.join(root, '_headers'), 'utf8');
    assert.match(headers, /\/firebase-messaging-sw\.js\r?\n\s+Cache-Control: no-cache, no-store, must-revalidate/);
});

test('legacy notification callback preserves full title and body (SDK display not included)', async () => {
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
    ['daily course opens its canonical lesson', { type:'daily_course_lesson', url:'https://polskieradio.cc/akademia/kurscodzienny/dzien-08' }, '/akademia/kurscodzienny/dzien-08'],
    ['owner test opens lesson without fabricating a chat', { FCM_MSG:{data:{type:'owner_push_test',url:'https://polskieradio.cc/akademia/kurscodzienny/dzien-08'}} }, '/akademia/kurscodzienny/dzien-08'],
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

test('course token works without Firestore and rejects account changes',async()=>{
    const source=fs.readFileSync(path.join(root,'lumina-db.js'),'utf8');
    const start=source.indexOf('export async function requestCourseNotificationToken(');
    const end=source.indexOf('export async function requestNotificationPermission(',start);
    let writes=0;
    const user={uid:'student',isAnonymous:false};
    const context=vm.createContext({window:{Notification:{}},Notification:{requestPermission:async()=> 'granted'},
      auth:{currentUser:user,authStateReady:async()=>{}},messaging:{},db:null,
      navigator:{serviceWorker:{register:async()=>({}),ready:Promise.resolve({})}},
      getToken:async()=> 'synthetic-device',LUMINA_VAPID_KEY:'synthetic',
      setDoc:async()=>{writes++;throw Error('Firestore unavailable');}});
    vm.runInContext(source.slice(start,end).replace('export async','async'),context);
    assert.equal(await vm.runInContext('requestCourseNotificationToken("student")',context),'synthetic-device');
    assert.equal(writes,0);
    context.auth.currentUser={uid:'other',isAnonymous:false};
    assert.equal(await vm.runInContext('requestCourseNotificationToken("student")',context),null);
    context.auth.currentUser=user;
    context.getToken=async()=>{context.auth.currentUser={uid:'other',isAnonymous:false};return 'synthetic-device';};
    assert.equal(await vm.runInContext('requestCourseNotificationToken("student")',context),null);
});
