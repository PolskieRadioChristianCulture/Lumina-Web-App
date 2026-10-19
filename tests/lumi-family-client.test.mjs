import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFamilyClient } from '../components/lumi-family-client.js';

// Local SDK double, NOT a substitute for Firestore Rules emulator coverage.
const ROOM = 'lumina_family_rooms/test-family';
const membership = uid => `${ROOM}/lumina_family_members/${uid}`;
const NOW = 1800000000000;
const stamp = ms => ({ toMillis: () => ms });
const MID = 'test-message-00000000001';
function fixture() {
    const docs = new Map([[ROOM, { schemaVersion: 1, name: 'Rodzina testowa', ownerUid: 'guardian',
        slotUids: ['guardian', 'member', 'pending'], status: 'active' }]]);
    for (const uid of ['guardian', 'member', 'pending']) docs.set(membership(uid), {
        roomId: 'test-family', uid, invitedBy: 'guardian', revision: 1,
        state: uid === 'pending' ? 'pending' : 'accepted', expiresAt: stamp(NOW + 86400000)
    });
    const state = { reads: [], writes: [], watches: [], failCommit: false };
    const auth = { currentUser: { uid: 'guardian', isAnonymous: false } };
    const snapshot = path => ({ exists: () => docs.has(path), data: () => docs.get(path) });
    let authCallback;
    const sdk = {
        doc: (...args) => {
            const parts = typeof args[0]?.path === 'string' ? [args[0].path, ...args.slice(1)] : args.slice(1);
            const path = parts.join('/');
            return { path, id: path.split('/').at(-1) };
        },
        collection: (ref, path) => ({ path: `${ref.path}/${path}` }),
        collectionGroup: (_, name) => ({ group: name }),
        where: (...args) => ({ where: args }), orderBy: (...args) => ({ orderBy: args }),
        limit: n => ({ limit: n }), query: (...args) => args,
        getDocs: async q => { state.query = q; return { docs: [...docs.entries()]
            .filter(([path, m]) => path.includes('/lumina_family_members/') && m.uid === auth.currentUser.uid)
            .map(([, m]) => ({ data: () => m })) }; },
        serverTimestamp: () => stamp(NOW), Timestamp: { fromMillis: stamp },
        onAuthStateChanged: (_, callback) => { authCallback = callback; return () => { state.authStopped = true; }; },
        onSnapshot: (q, next, error) => {
            const watch = { q, next, error, stopped: false };
            state.watches.push(watch);
            return () => { watch.stopped = true; };
        },
        runTransaction: async (_, callback) => {
            const writes = [];
            const result = await callback({
                get: async ref => { state.reads.push(ref.path); return snapshot(ref.path); },
                set: (ref, value) => writes.push([ref.path, value]),
                update: (ref, value) => writes.push([ref.path, { ...docs.get(ref.path), ...value }])
            });
            if (state.failCommit) throw new Error('commit denied');
            for (const [path, value] of writes) { docs.set(path, value); state.writes.push(path); }
            return result;
        }
    };
    const client = createFamilyClient({ db: {}, auth, sdk, enabled: true, now: () => NOW });
    return { docs, state, auth, sdk, client, signIn(uid) { auth.currentUser = uid ? { uid } : null; authCallback(auth.currentUser); } };
}

test('default candidate is disabled and does not query Firestore', async () => {
    const f = fixture();
    const c = createFamilyClient({ db: {}, auth: f.auth, sdk: f.sdk });
    await assert.rejects(c.listMemberships(), { code: 'family/not-enabled' });
    assert.equal(f.state.query, undefined);
    c.dispose();
});
test('only the stored guardian can invite; pending slots count towards four', async () => {
    const f = fixture();
    f.signIn('member');
    await assert.rejects(f.client.invite('test-family', 'fourth'), { code: 'family/guardian-only' });
    f.signIn('guardian');
    assert.deepEqual(await f.client.invite('test-family', 'fourth'), { state: 'pending' });
    assert.equal(f.docs.get(ROOM).slotUids.length, 4);
    assert.equal(f.docs.get(membership('fourth')).state, 'pending');
    await assert.rejects(f.client.invite('test-family', 'fifth'), { code: 'family/room-full' });
    await assert.rejects(f.client.invite('test-family', 'fourth'), { code: 'family/already-invited' });
});
test('invite acceptance reads only own invitation, not room or members list', async () => {
    const f = fixture(); f.signIn('pending');
    assert.deepEqual(await f.client.answerInvitation('test-family', true), { state: 'accepted' });
    assert.deepEqual(f.state.reads, [membership('pending')]);
    assert.equal(f.docs.get(membership('member')).state, 'accepted');
});
test('decline and expired invitations never become accepted', async () => {
    const f = fixture(); f.signIn('pending');
    await f.client.answerInvitation('test-family', false);
    await assert.rejects(f.client.answerInvitation('test-family', true), { code: 'family/invitation-unavailable' });
    f.docs.get(membership('pending')).state = 'pending';
    f.docs.get(membership('pending')).expiresAt = stamp(NOW);
    await assert.rejects(f.client.answerInvitation('test-family', true), { code: 'family/invitation-unavailable' });
    await assert.rejects(f.client.answerInvitation('test-family', 'yes'), { code: 'family/invalid-answer' });
});
test('pending member cannot send; accepted member and guardian share one message path', async () => {
    const f = fixture(); f.signIn('pending');
    await assert.rejects(f.client.send('test-family', MID, 'Cześć'), { code: 'family/not-a-member' });
    await f.client.answerInvitation('test-family', true);
    const sent = await f.client.send('test-family', MID, '  Cześć  ');
    assert.equal(sent.state, 'stored');
    assert.equal(f.docs.get(`${ROOM}/messages/pending_${MID}`).text, 'Cześć');
});
test('same message ID retry is idempotent; different body is a conflict', async () => {
    const f = fixture();
    const first = await f.client.send('test-family', MID, 'Treść');
    const second = await f.client.send('test-family', MID, 'Treść');
    assert.equal(first.id, second.id); assert.equal(second.duplicate, true);
    assert.equal(f.state.writes.length, 1);
    await assert.rejects(f.client.send('test-family', MID, 'Zmiana'), { code: 'family/message-id-conflict' });
});
test('database failure does not return success or leave partial invite', async () => {
    const f = fixture(); f.state.failCommit = true;
    await assert.rejects(f.client.invite('test-family', 'fourth'), /commit denied/);
    assert.equal(f.docs.get(ROOM).slotUids.length, 3);
    assert.equal(f.docs.has(membership('fourth')), false);
    await assert.rejects(f.client.send('test-family', MID, 'Test'), /commit denied/);
});
test('revocation frees slot and prevents further sends, guardian cannot remove self', async () => {
    const f = fixture();
    await f.client.revoke('test-family', 'member');
    await assert.rejects(f.client.revoke('test-family', 'guardian'), { code: 'family/guardian-only' });
    f.signIn('member');
    await assert.rejects(f.client.send('test-family', MID, 'Test'), { code: 'family/not-a-member' });
    f.signIn('guardian'); await f.client.invite('test-family', 'member');
    assert.equal(f.docs.get(membership('member')).revision, 2);
    assert.equal(f.docs.get(membership('member')).state, 'pending');
});
test('anonymous session, path traversal, empty and oversized messages are rejected', async () => {
    const f = fixture();
    for (const text of ['', '  ', 'x'.repeat(1001), null])
        await assert.rejects(f.client.send('test-family', MID, text), { code: 'family/invalid-text' });
    await assert.rejects(f.client.send('../other', MID, 'Test'), { code: 'family/invalid-room' });
    await assert.rejects(f.client.send('test-family', 'bad/id', 'Test'), { code: 'family/invalid-message-id' });
    f.auth.currentUser.isAnonymous = true;
    await assert.rejects(f.client.listMemberships(), { code: 'family/sign-in-required' });
});
test('membership lookup is user-scoped and bounded, never fetches pending room', async () => {
    const f = fixture(); f.signIn('pending');
    const result = await f.client.listMemberships();
    assert.equal(result.length, 1); assert.equal(result[0].state, 'pending');
    assert.deepEqual(f.state.query, [{ group: 'lumina_family_members' }, { where: ['uid', '==', 'pending'] }, { limit: 20 }]);
    assert.deepEqual(f.state.reads, []);
});
test('no history listener at import; bounded listener closes and clears on account switch', () => {
    const f = fixture(), updates = [];
    assert.equal(f.state.watches.length, 0);
    f.client.watchMessages('test-family', x => updates.push(x), assert.fail);
    const w = f.state.watches[0];
    assert.deepEqual(w.q.slice(1), [{ orderBy: ['createdAt', 'desc'] }, { limit: 50 }]);
    f.signIn('member');
    assert.equal(w.stopped, true); assert.deepEqual(updates.at(-1), { messages: [], state: 'closed' });
    w.next({ docs: [{ id: 'old', data: () => ({ text: 'old account' }) }], metadata: {} });
    assert.equal(updates.length, 1);
});
test('cache and unconfirmed writes are not reported as synced; error clears old history', () => {
    const f = fixture(), updates = [], errors = [];
    f.client.watchMessages('test-family', x => updates.push(x), e => errors.push(e));
    const w = f.state.watches[0];
    for (const [metadata, state] of [[{ fromCache: true }, 'cached'],
        [{ hasPendingWrites: true }, 'pending'], [{ fromCache: false }, 'synced']]) {
        w.next({ docs: [], metadata }); assert.equal(updates.at(-1).state, state);
    }
    w.error(new Error('permission-denied'));
    assert.equal(updates.at(-1).state, 'closed'); assert.equal(errors.length, 1);
    f.client.dispose(); assert.equal(f.state.authStopped, true);
});
test('same-account logout/login invalidates old membership read', async () => {
    const f = fixture();
    let resolve;
    f.sdk.getDocs = () => new Promise(r => { resolve = r; });
    const pending = f.client.listMemberships();
    f.signIn(null); f.signIn('guardian');
    resolve({ docs: [] });
    await assert.rejects(pending, { code: 'family/account-changed' });
});
test('commit completing after account switch cannot report success to the new session', async () => {
    const f = fixture();
    const original = f.sdk.runTransaction;
    f.sdk.runTransaction = async (...args) => {
        const result = await original(...args);
        f.signIn('member');
        return result;
    };
    await assert.rejects(f.client.send('test-family', MID, 'TEST'), { code: 'family/account-changed' });
    // The original account's write committed; do not claim it was rolled back.
    assert.equal(f.docs.get(`${ROOM}/messages/guardian_${MID}`).text, 'TEST');
});
test('accepted member can leave, loses send access and cannot silently rejoin', async () => {
    const f = fixture(); f.signIn('member');
    assert.deepEqual(await f.client.leave('test-family'), { state: 'declined' });
    assert.equal(f.docs.get(membership('member')).state, 'declined');
    await assert.rejects(f.client.send('test-family', MID, 'TEST'), { code: 'family/not-a-member' });
    await assert.rejects(f.client.answerInvitation('test-family', true), { code: 'family/invitation-unavailable' });
});
