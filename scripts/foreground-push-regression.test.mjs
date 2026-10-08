import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../lumina-db.js', import.meta.url), 'utf8');
const start = source.indexOf('export async function showForegroundPushNotification(');
const end = source.indexOf('export async function requestNotificationPermission(', start);
assert.ok(start > 0 && end > start);
const show = vm.runInNewContext(`${source.slice(start, end).replace('export ', '')};showForegroundPushNotification`, { URL });
test('cached security importer receives the same release version as the DB module', () => {
    const root = new URL('../', import.meta.url);
    let checked = 0;
    for (const file of readdirSync(root).filter(file => /^lumina.*\.html$/.test(file) && !file.includes('backup'))) {
        const html = readFileSync(new URL(file, root), 'utf8');
        const security = html.match(/src=["'](?:\.\/)?lumina-security\.js(\?v=[^"']+)["']/);
        if (!security) continue;
        const db = html.match(/src=["'](?:\.\/)?lumina-db\.js(\?v=[^"']+)["']/);
        assert.ok(db, `${file}: missing versioned DB entry`);
        assert.equal(security[1], db[1], `${file}: old cached security importer can load another DB instance`);
        checked++;
    }
    assert.ok(checked >= 19, 'Canonical and legacy profile entry points must be covered');
});
test('both board entries refresh the cached importer with the DB/core release', () => {
    const root = new URL('../', import.meta.url);
    const board = readFileSync(new URL('lumina-tablica.js', root), 'utf8');
    const imports = ['db', 'core'].map(name => {
        const match = board.match(new RegExp(`from ['"]\\./lumina-${name}\\.js(\\?v=[^'"]+)['"]`));
        assert.ok(match, `Board must import a versioned ${name} module`);
        return match[1];
    });
    assert.equal(imports[0], imports[1]);
    for (const file of ['lumina-tablica.html', 'lumina-tablica-light.html']) {
        const html = readFileSync(new URL(file, root), 'utf8');
        for (const name of ['db', 'core', 'tablica']) {
            const match = html.match(new RegExp(`src=['"](?:\\./)?lumina-${name}\\.js(\\?v=[^'"]+)['"]`));
            assert.ok(match, `${file}: missing ${name} entry`);
            assert.equal(match[1], imports[0], `${file}: stale ${name} entry can restore an older messaging callback`);
        }
    }
});

function fixture({ permission = 'granted', active = true, fail = false } = {}) {
    const calls = [];
    const environment = {
        Notification: { permission, requestPermission() { throw Error('Must not request consent automatically'); } },
        location: { origin: 'https://polskieradio.cc' },
        navigator: { serviceWorker: { async getRegistration(scope) {
            assert.equal(scope, '/');
            return { active: active ? {} : null, async showNotification(title, options) {
                if (fail) throw Error('Synthetic notification failure');
                calls.push({ title, options });
            } };
        } } }
    };
    return { environment, calls };
}
const payload = { notification: { title: 'TEST powiadomienia', body: 'Test, nie nowa wiadomość.' }, data: {
    type: 'owner_push_test', url: '/akademia/kurscodzienny/dzien-08', tag: 'cc-owner-push-test', secretFixture: 'never-copy-payload'
} };
test('foreground FCM callback invokes the system notification path', () => {
    assert.match(source, /onMessage\(messaging, \(payload\) => \{[\s\S]*?void showForegroundPushNotification\(payload\)/);
});
test('owner test displays through the active SW and preserves its lesson link', async () => {
    const f = fixture();
    assert.equal(await show(payload, f.environment), true);
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].title, payload.notification.title);
    assert.equal(f.calls[0].options.data.url, 'https://polskieradio.cc/akademia/kurscodzienny/dzien-08');
    assert.equal(f.calls[0].options.tag, 'cc-owner-push-test');
    assert.equal(f.calls[0].options.data.secretFixture, undefined);
});
test('course data-only messages also display with the correct action', async () => {
    const f = fixture();
    assert.equal(await show({ data: { type: 'daily_course_lesson', title: 'Nowa lekcja', body: 'Rdz 8', url: payload.data.url } }, f.environment), true);
    assert.equal(f.calls[0].title, 'Nowa lekcja');
    assert.equal(f.calls[0].options.actions[0].title, 'Czytaj lekcję');
});
test('default or denied permission never triggers an automatic permission prompt', async () => {
    for (const permission of ['default', 'denied']) {
        const f = fixture({ permission });
        assert.equal(await show(payload, f.environment), false);
        assert.equal(f.calls.length, 0);
    }
});
test('existing chat paths are not duplicated by the new foreground handler', async () => {
    for (const type of ['direct_message', 'direct_message_request', 'public_chat', 'mention', undefined]) {
        const f = fixture();
        assert.equal(await show({ data: { type } }, f.environment), false);
        assert.equal(f.calls.length, 0);
    }
});
test('missing or inactive SW and display rejection cannot claim success', async () => {
    assert.equal(await show(payload, { Notification: { permission: 'granted' } }), false);
    for (const options of [{ active: false }, { fail: true }]) {
        const f = fixture(options);
        assert.equal(await show(payload, f.environment), false);
    }
});
test('external, credentialed and malformed destinations fall back to LUMINA', async () => {
    for (const url of ['https://example.invalid/', 'javascript:alert(1)', 'https://user:pass@polskieradio.cc/', 'http://[']) {
        const f = fixture();
        assert.equal(await show({ ...payload, data: { ...payload.data, url } }, f.environment), true);
        assert.equal(f.calls[0].options.data.url, 'https://polskieradio.cc/lumina');
    }
});
