import { test } from 'node:test';
import assert from 'node:assert/strict';
import { notificationMessage, classifyFailure, createFcmSender } from './fcm.js';

const event = { id: 'dm-123', type: 'direct_message', title: 'Wiadomość', body: 'Test', senderId: 'anna', url: '/lumina?openChat=anna' };

test('FCM message uses Android web-push priority and stable notification tag', () => {
    const message = notificationMessage('device', event);
    assert.equal(message.webpush.headers.Urgency, 'high');
    assert.equal(message.webpush.notification.tag, 'lumina-direct_message-dm-123');
    assert.equal(message.webpush.notification.renotify, false);
    assert.equal(message.webpush.fcm_options.link, 'https://polskieradio.cc/lumina?openChat=anna');
    assert.equal(message.data.senderId, 'anna');
});

test('foreign destinations and unrecognized event types fail closed', () => {
    assert.throws(() => notificationMessage('device', { ...event, url: 'https://example.com' }));
    assert.throws(() => notificationMessage('device', { ...event, type: 'unknown' }));
});

test('payload validation errors do not remove device tokens', () => {
    assert.equal(classifyFailure(400, { error: { status: 'INVALID_ARGUMENT' } }).removeToken, false);
});

test('only confirmed unregistered devices are eligible for removal', () => {
    const result = classifyFailure(404, { error: { details: [{ '@type': 'type.googleapis.com/google.firebase.fcm.v1.FcmError', errorCode: 'UNREGISTERED' }] } });
    assert.equal(result.removeToken, true);
    assert.equal(result.retry, false);
    assert.equal(classifyFailure(404, {}).removeToken, false);
});

test('rate limit respects server retry delay and a minimum of sixty seconds', () => {
    assert.equal(classifyFailure(429, {}, '120').delaySeconds, 120);
    assert.equal(classifyFailure(429, {}, '5').delaySeconds, 60);
    assert.equal(classifyFailure(503, {}).retry, true);
    assert.equal(classifyFailure(403, {}).retry, false);
});

test('service-account scope is restricted to the actual Firebase project', () => {
    assert.throws(() => createFcmSender('{}'));
    assert.throws(() => createFcmSender('{"project_id":"another-project"}'));
});

test('signed OAuth exchange and dry-run send use expected APIs without real network access', async () => {
    const key = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
    const pem = Buffer.from(await crypto.subtle.exportKey('pkcs8', key.privateKey)).toString('base64');
    const calls = [];
    const sender = createFcmSender(JSON.stringify({ project_id: 'lumina-cc', client_email: 'push@lumina-cc.iam.gserviceaccount.com', private_key: `-----BEGIN PRIVATE KEY-----\n${pem}\n-----END PRIVATE KEY-----` }), async (url, options) => {
        calls.push(url);
        if (url === 'https://oauth2.googleapis.com/token') {
            const [header, claims, signature] = options.body.get('assertion').split('.');
            assert.equal(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key.publicKey, Buffer.from(signature, 'base64url'), new TextEncoder().encode(`${header}.${claims}`)), true);
            assert.equal(JSON.parse(Buffer.from(claims, 'base64url')).scope, 'https://www.googleapis.com/auth/firebase.messaging');
            return Response.json({ access_token: 'test-only', expires_in: 3600 });
        }
        assert.equal(url, 'https://fcm.googleapis.com/v1/projects/lumina-cc/messages:send');
        assert.equal(JSON.parse(options.body).validate_only, true);
        return Response.json({ name: 'projects/lumina-cc/messages/test' });
    });
    assert.equal((await sender.send('device', event, { validateOnly: true })).accepted, true);
    await sender.send('device', event, { validateOnly: true });
    assert.equal(calls.filter(url => url.includes('oauth2')).length, 1);
});
