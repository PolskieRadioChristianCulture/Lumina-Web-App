import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { once } from 'node:events';
import { createConnection } from 'node:net';

// Explicit opt-in: starts only a loopback, in-memory demo project. No production SDK credentials.
test('chat membership OR query respects the actual Firestore rules', {
  skip: !process.env.CC_FIRESTORE_EMULATOR_JAR,
  timeout: 60000,
}, async () => {
  const project = 'demo-cc-chat-query';
  const base = 'http://127.0.0.1:18987';
  const root = `${base}/v1/projects/${project}/databases/(default)/documents`;
  const occupied = await new Promise(resolvePort => {
    const socket = createConnection({ host: '127.0.0.1', port: 18987 });
    socket.once('connect', () => { socket.destroy(); resolvePort(true); });
    socket.once('error', () => { socket.destroy(); resolvePort(false); });
  });
  assert.equal(occupied, false, 'Refuse to reuse another process on the test port');
  const emulator = spawn('java', ['-Duser.language=en', '-Duser.country=US', '-jar', process.env.CC_FIRESTORE_EMULATOR_JAR,
    '--host', '127.0.0.1', '--port', '18987', '--project_id', project,
    '--single_project_mode', '--single_project_mode_error', '--rules', resolve('firestore.rules')],
  { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  emulator.stdout.on('data', x => { log = (log + x).slice(-12000); });
  emulator.stderr.on('data', x => { log = (log + x).slice(-12000); });
  const exited = once(emulator, 'exit');
  function token(uid, provider = 'password') {
    const b64 = x => Buffer.from(JSON.stringify(x)).toString('base64url');
    return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({
      aud: project, iss: `https://securetoken.google.com/${project}`, sub: uid,
      user_id: uid, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600,
      email_verified: false, email: 'synthetic@example.invalid',
      firebase: { sign_in_provider: provider, identities: {} },
    })}.`;
  }
  async function request(url, body, bearer, method = 'POST') {
    const res = await fetch(url, { method, headers: {
      'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    }, ...(method === 'GET' ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(8000) });
    return { status: res.status, data: await res.json() };
  }
  const array = values => ({ arrayValue: { values: values.map(stringValue => ({ stringValue })) } });
  const filter = (fieldPath, uid) => ({ fieldFilter: { field: { fieldPath }, op: 'ARRAY_CONTAINS', value: { stringValue: uid } } });
  const query = uid => ({ structuredQuery: { from: [{ collectionId: 'lumina_chats' }],
    where: { compositeFilter: { op: 'OR', filters: [filter('participants', uid), filter('users', uid)] } }, limit: 40 } });
  try {
    for (let n = 0; n < 100; n++) {
      if (emulator.exitCode !== null) throw Error(`Emulator exited: ${log}`);
      try { if ((await fetch(base, { signal: AbortSignal.timeout(300) })).status) break; } catch {}
      if (n === 99) throw Error(`Emulator not ready: ${log}`);
      await new Promise(r => setTimeout(r, 200));
    }
    // The emulator-only owner token seeds synthetic fixtures; it is never sent to a remote host.
    for (const [id, fields] of [
      ['modern', { participants: array(['UID_A', 'UID_B']) }],
      ['legacy', { users: array(['UID_A', 'UID_B']) }],
      ['both', { participants: array(['UID_A', 'UID_B']), users: array(['UID_A', 'UID_B']) }],
      ['foreign', { participants: array(['UID_C', 'UID_D']) }],
      ['slug-only', { users: array(['alice', 'bob']) }],
      ['empty', {}],
      ['wrong-map', { participants: { mapValue: { fields: { UID_A: { booleanValue: true } } } } }],
      ['wrong-string', { users: { stringValue: 'UID_A' } }],
      ['wrong-null', { participants: { nullValue: null } }],
      ['sender-only', { senderAuthUid: { stringValue: 'UID_A' } }],
      ['receiver-only', { receiverAuthUid: { stringValue: 'UID_A' } }],
    ]) {
      const seed = await request(`${root}/lumina_chats/${id}`, { fields }, 'owner', 'PATCH');
      assert.equal(seed.status, 200, `seed ${id}: ${JSON.stringify(seed.data)}`);
    }
    const point = await request(`${root}/lumina_chats/modern`, undefined, token('UID_A'), 'GET');
    assert.equal(point.status, 200, 'participant can read the room without sender/receiver fields');
    for (const fieldPath of ['participants', 'users']) {
      const control = await request(`${root}:runQuery`, { structuredQuery: {
        from: [{ collectionId: 'lumina_chats' }], where: filter(fieldPath, 'UID_A'), limit: 40,
      } }, token('UID_A'));
      assert.equal(control.status, 200, `individual ${fieldPath} query is authorized`);
    }
    for (const uid of ['UID_A', 'UID_B']) {
      const result = await request(`${root}:runQuery`, query(uid), token(uid));
      assert.equal(result.status, 200, `membership query ${uid}: ${JSON.stringify(result.data)}`);
      const ids = result.data.filter(x => x.document).map(x => x.document.name.split('/').at(-1)).sort();
      assert.deepEqual(ids, ['both', 'legacy', 'modern']);
    }
    for (const [uid, bearer] of [
      ['UID_A', token('UID_C')], ['alice', token('UID_A')],
      ['UID_A', undefined], ['UID_A', token('UID_A', 'anonymous')],
    ]) {
      const denied = await request(`${root}:runQuery`, query(uid), bearer);
      assert.equal(denied.status, 403, JSON.stringify(denied.data));
    }
    const foreign = await request(`${root}:runQuery`, query('UID_C'), token('UID_C'));
    assert.equal(foreign.status, 200);
    assert.deepEqual(foreign.data.filter(x => x.document).map(x => x.document.name.split('/').at(-1)), ['foreign']);
    for (const id of ['empty', 'wrong-map', 'wrong-string', 'wrong-null', 'foreign', 'slug-only']) {
      const result = await request(`${root}/lumina_chats/${id}`, undefined, token('UID_A'), 'GET');
      assert.equal(result.status, 403, `no authorization from missing, malformed or foreign identity: ${id}`);
    }
    for (const id of ['sender-only', 'receiver-only', 'legacy']) {
      const result = await request(`${root}/lumina_chats/${id}`, undefined, token('UID_A'), 'GET');
      assert.equal(result.status, 200, `existing identity access preserved: ${id}`);
    }
    const unfiltered = await request(`${root}:runQuery`, { structuredQuery: { from: [{ collectionId: 'lumina_chats' }] } }, token('UID_A'));
    assert.equal(unfiltered.status, 403, 'authenticated user cannot enumerate all rooms');
    const wrongCase = await request(`${root}:runQuery`, query('uid_a'), token('UID_A'));
    assert.equal(wrongCase.status, 403, 'UIDs are case-sensitive');
    for (const [id, uid, provider] of [
      ['modern', 'UID_C', 'password'], ['modern', 'UID_A', 'anonymous'],
    ]) {
      const result = await request(`${root}/lumina_chats/${id}`, undefined, token(uid, provider), 'GET');
      assert.equal(result.status, 403, 'foreign and anonymous room GET denied');
    }
    for (const field of ['participants', 'users']) {
      const result = await request(`${root}/lumina_chats/both?updateMask.fieldPaths=${field}`,
        { fields: { [field]: array(['UID_A', 'UID_B', 'UID_C']) } }, token('UID_A'), 'PATCH');
      assert.equal(result.status, 403, `participant cannot add a new room member via ${field}`);
    }
    for (const field of ['senderAuthUid', 'receiverAuthUid']) {
      const result = await request(`${root}/lumina_chats/both?updateMask.fieldPaths=${field}`,
        { fields: { [field]: { stringValue: 'UID_C' } } }, token('UID_A'), 'PATCH');
      assert.equal(result.status, 403, `room authorization cannot be changed via ${field}`);
    }
    const roomUpdate = await request(`${root}/lumina_chats/modern?updateMask.fieldPaths=lastMessageText`,
      { fields: { lastMessageText: { stringValue: 'synthetic' } } }, token('UID_A'), 'PATCH');
    assert.equal(roomUpdate.status, 200, 'legitimate room metadata updates still work');
    const foreignWrite = await request(`${root}/lumina_chats/modern?updateMask.fieldPaths=lastMessage`,
      { fields: { lastMessage: { stringValue: 'synthetic' } } }, token('UID_C'), 'PATCH');
    assert.equal(foreignWrite.status, 403, 'nonparticipant cannot update a room');
    // Exercise the shared helper's receipt/reaction update boundary as well as room reads.
    const message = `${root}/lumina_direct_messages/synthetic`;
    assert.equal((await request(message, { fields: {
      participants: array(['UID_A', 'UID_B']), senderAuthUid: { stringValue: 'UID_A' },
      receiverAuthUid: { stringValue: 'UID_B' }, text: { stringValue: 'synthetic' },
    } }, 'owner', 'PATCH')).status, 200);
    for (const [uid, expected] of [['UID_B', 200], ['UID_C', 403]]) {
      assert.equal((await request(`${message}?updateMask.fieldPaths=isRead`,
        { fields: { isRead: { booleanValue: true } } }, token(uid), 'PATCH')).status, expected);
    }
    for (const [field, value] of [
      ['participants', array(['UID_A', 'UID_B', 'UID_C'])],
      ['senderAuthUid', { stringValue: 'UID_C' }], ['text', { stringValue: 'altered' }],
    ]) {
      assert.equal((await request(`${message}?updateMask.fieldPaths=${field}`,
        { fields: { [field]: value } }, token('UID_B'), 'PATCH')).status, 403,
      `receipt update cannot change ${field}`);
    }
    for (const path of ['lumina_direct_messages/legacy', 'lumina_message_requests/legacy', 'lumina_chats/modern/messages/legacy']) {
      assert.equal((await request(`${root}/${path}`, { fields: { users: array(['UID_A', 'UID_B']) } }, 'owner', 'PATCH')).status, 200);
      for (const [uid, provider, expected] of [
        ['UID_A', 'password', 200], ['UID_B', 'password', 200],
        ['UID_C', 'password', 403], ['UID_A', 'anonymous', 403],
      ]) {
        assert.equal((await request(`${root}/${path}`, undefined, token(uid, provider), 'GET')).status, expected,
          `shared helper access boundary ${path}/${uid}/${provider}`);
      }
    }
  } finally {
    emulator.kill();
    await exited;
  }
});
