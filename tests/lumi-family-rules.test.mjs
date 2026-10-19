// Synthetic accounts only. Dedicated loopback demo emulator; never production.
import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp, deleteApp } from 'firebase/app';
import * as fs from 'firebase/firestore';
import { createFamilyClient } from '../components/lumi-family-client.js';

const PROJECT = 'demo-lumi-family';
const HOST = process.env.FIRESTORE_EMULATOR_HOST;
assert.equal(HOST, '127.0.0.1:8311', 'Run via dedicated lumi-family.firebase.json emulator config only');
const BASE = `http://${HOST}/v1/projects/${PROJECT}/databases/(default)/documents`;
const ROOM = 'test-family';
const root = `lumina_family_rooms/${ROOM}`;
const mem = uid => `${root}/lumina_family_members/${uid}`;
const MID = 'test-message-00000000001';
const apps = [], dbs = [], clients = [];
const field = v => Array.isArray(v) ? { arrayValue: { values: v.map(field) } } : v instanceof Date ?
    { timestampValue: v.toISOString() } : typeof v === 'number' ? { integerValue: String(v) } :
    typeof v === 'boolean' ? { booleanValue: v } : { stringValue: v };
async function seed(path, data) {
    const res = await fetch(`${BASE}/${path}`, { method: 'PATCH', headers: {
        Authorization: 'Bearer owner', 'Content-Type': 'application/json'
    }, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, field(v)])) }) });
    assert.equal(res.status, 200, await res.text());
}
function context(uid, token = {}) {
    const app = initializeApp({ projectId: PROJECT, apiKey: 'demo-test-only' }, `family-test-${apps.length}`);
    const db = fs.getFirestore(app);
    fs.connectFirestoreEmulator(db, '127.0.0.1', 8311, { mockUserToken: {
        sub: uid, user_id: uid, firebase: { sign_in_provider: 'password' }, ...token
    } });
    apps.push(app); dbs.push(db);
    const auth = { currentUser: { uid, isAnonymous: token.firebase?.sign_in_provider === 'anonymous' } };
    const client = createFamilyClient({ db, auth, enabled: true, sdk: { ...fs, onAuthStateChanged: () => () => {} } });
    clients.push(client);
    return { db, client };
}
const deny = promise => assert.rejects(promise, e => e.code === 'permission-denied');
const get = (c, path) => fs.getDocFromServer(fs.doc(c.db, path));
const queryMessages = c => fs.getDocs(fs.query(fs.collection(c.db, `${root}/messages`), fs.orderBy('createdAt', 'desc'), fs.limit(50)));
async function inviteGuardian(target = 'pending') {
    const g = context('guardian'); await g.client.invite(ROOM, target); return g;
}
beforeEach(async () => {
    const res = await fetch(`http://${HOST}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
    assert.equal(res.status, 200);
    const now = new Date();
    await seed(root, { schemaVersion: 1, name: 'Rodzina TEST', ownerUid: 'guardian',
        slotUids: ['guardian', 'member'], status: 'active', createdAt: now, updatedAt: now });
    for (const uid of ['guardian', 'member']) await seed(mem(uid), { roomId: ROOM, uid,
        invitedBy: 'guardian', state: 'accepted', revision: 1, createdAt: now, updatedAt: now,
        expiresAt: new Date(Date.now() + 86400000) });
});
after(async () => {
    for (const c of clients) c.dispose();
    await Promise.all(dbs.map(d => fs.terminate(d)));
    await Promise.all(apps.map(a => deleteApp(a)));
});

test('guardian invites; pending sees only own invitation, accepts without reading room', async () => {
    const g = await inviteGuardian(), p = context('pending');
    const list = await p.client.listMemberships();
    assert.equal(list.length, 1); assert.equal(list[0].state, 'pending');
    await deny(get(p, root)); await deny(get(p, mem('member'))); await deny(queryMessages(p));
    await deny(fs.getDocs(fs.query(fs.collection(p.db, `${root}/lumina_family_members`), fs.limit(4))));
    await p.client.answerInvitation(ROOM, true);
    assert.equal((await get(p, root)).data().name, 'Rodzina TEST');
    await g.client.send(ROOM, MID, 'Test opiekuna');
    assert.equal((await queryMessages(p)).docs[0].data().text, 'Test opiekuna');
    await p.client.send(ROOM, MID, 'Test członka');
    assert.equal((await queryMessages(g)).size, 2);
});
test('outsider including admin has no room/history/members access or self-invitation', async () => {
    const g = context('guardian'); await g.client.send(ROOM, MID, 'TEST');
    for (const token of [{}, { admin: true }, { firebase: { sign_in_provider: 'anonymous' } }]) {
        const stranger = context('stranger', token);
        await deny(get(stranger, root)); await deny(get(stranger, `${root}/messages/guardian_${MID}`));
        await deny(get(stranger, mem('member')));
        await deny(fs.setDoc(fs.doc(stranger.db, mem('stranger')), { uid: 'stranger', state: 'accepted' }));
        await deny(fs.setDoc(fs.doc(stranger.db, 'lumina_family_rooms/stolen'), {
            schemaVersion: 1, name: 'TEST', ownerUid: 'stranger', slotUids: ['stranger'], status: 'active',
            createdAt: fs.serverTimestamp(), updatedAt: fs.serverTimestamp()
        }));
        await deny(fs.getDocs(fs.query(fs.collection(stranger.db, 'lumina_family_rooms'), fs.limit(20))));
    }
});
test('guardian only, four slots including pending; malformed slot and room updates fail', async () => {
    const g = await inviteGuardian();
    await g.client.invite(ROOM, 'fourth');
    const r = fs.doc(g.db, root), m = context('member');
    await deny(fs.updateDoc(fs.doc(m.db, root), { slotUids: ['member'], ownerUid: 'member', updatedAt: fs.serverTimestamp() }));
    for (const patch of [ { slotUids: ['guardian', 'member', 'pending', 'fourth', 'fifth'] },
        { slotUids: ['guardian', 'guardian'] }, { slotUids: ['guardian', 123] },
        { ownerUid: 'member' }, { name: 'x'.repeat(81) }, { name: 12 }, { arbitrary: true }, { createdAt: new Date(0) } ])
        await deny(fs.updateDoc(r, { ...patch, updatedAt: fs.serverTimestamp() }));
});
test('pending cannot change inviter, expiry, revision or accept on someone else behalf', async () => {
    const g = await inviteGuardian(), p = context('pending');
    for (const patch of [{ invitedBy: 'pending', state: 'accepted' }, { expiresAt: new Date(0), state: 'accepted' },
        { revision: 2, state: 'accepted' }, { uid: 'member', state: 'accepted' }, { state: 'revoked' },
        { state: 'accepted', extra: true }, { state: 'accepted', roomId: 'elsewhere' }])
        await deny(fs.updateDoc(fs.doc(p.db, mem('pending')), { ...patch, updatedAt: fs.serverTimestamp() }));
    await deny(fs.updateDoc(fs.doc(g.db, mem('pending')), { state: 'accepted', updatedAt: fs.serverTimestamp() }));
    await p.client.answerInvitation(ROOM, false);
    await deny(fs.updateDoc(fs.doc(p.db, mem('pending')), { state: 'accepted', updatedAt: fs.serverTimestamp() }));
    await assert.rejects(g.client.invite(ROOM, 'pending'), { code: 'family/invitation-cooldown' });
    const old = (await get(p, mem('pending'))).data();
    await seed(mem('pending'), { ...old, createdAt: old.createdAt.toDate(),
        expiresAt: old.expiresAt.toDate(), updatedAt: new Date(Date.now() - 2 * 86400000) });
    await g.client.invite(ROOM, 'pending');
    assert.equal((await get(p, mem('pending'))).data().revision, 2);
});
test('revocation and closed room remove read/write access; no stale accepted membership bypass', async () => {
    const g = context('guardian'), m = context('member');
    await m.client.send(ROOM, MID, 'TEST');
    await g.client.revoke(ROOM, 'member');
    await deny(get(m, root)); await deny(queryMessages(m));
    await deny(m.client.send(ROOM, `${MID}2`, 'TEST'));
    await fs.updateDoc(fs.doc(g.db, root), { status: 'closed', updatedAt: fs.serverTimestamp() });
    await deny(queryMessages(g));
});
test('known Kids pilot revocation gates family too, public/other rooms remain denied', async () => {
    const g = await inviteGuardian('kid'), kid = context('kid');
    await seed('kids_pilot/config', { childUid: 'kid', contacts: ['guardian', 'member'], enabled: true, revoked: false });
    await kid.client.answerInvitation(ROOM, true);
    await kid.client.send(ROOM, MID, 'TEST KIDS');
    assert.equal((await queryMessages(g)).size, 1);
    await deny(get(kid, 'lumina_family_rooms/other-family'));
    // Public content may be readable anonymously in the existing portal. Kids must never publish there.
    await deny(fs.setDoc(fs.doc(kid.db, 'lumina_live_rooms/tv_zapolske/messages/kid-test'), {
        roomId: 'tv_zapolske', text: 'TEST', senderAuthUid: 'kid', senderName: 'TEST',
        senderAvatar: '/lumina_icon.jpg', kind: 'prayer', createdAt: fs.serverTimestamp()
    }));
    await seed('kids_pilot/config', { childUid: 'kid', contacts: ['guardian', 'member'], enabled: true, revoked: true });
    await deny(queryMessages(kid)); await deny(get(kid, mem('kid')));
});
test('expired invitation and orphaned membership never grant room/history access', async () => {
    await inviteGuardian(); const p = context('pending');
    await seed(mem('pending'), { roomId: ROOM, uid: 'pending', invitedBy: 'guardian', state: 'pending',
        revision: 1, createdAt: new Date(0), updatedAt: new Date(0), expiresAt: new Date(0) });
    await deny(fs.updateDoc(fs.doc(p.db, mem('pending')), { state: 'accepted', updatedAt: fs.serverTimestamp() }));
    await seed('lumina_family_rooms/orphan/lumina_family_members/pending', { roomId: 'orphan', uid: 'pending',
        invitedBy: 'guardian', state: 'accepted', revision: 1, createdAt: new Date(), updatedAt: new Date(), expiresAt: new Date() });
    await deny(get(p, 'lumina_family_rooms/orphan/messages/example'));
});
test('message schema, UID, server time and immutable history are enforced', async () => {
    const m = context('member');
    const ref = fs.doc(m.db, `${root}/messages/member_${MID}`);
    const message = () => ({ senderUid: 'member', clientMessageId: MID, text: 'TEST', createdAt: fs.serverTimestamp() });
    for (const patch of [{ senderUid: 'guardian' }, { text: '' }, { text: 'x'.repeat(1001) },
        { text: 123 }, { createdAt: new Date(0) }, { extra: true }, { clientMessageId: 'bad' }])
        await deny(fs.setDoc(ref, { ...message(), ...patch }));
    await m.client.send(ROOM, MID, 'TEST');
    await deny(fs.updateDoc(ref, { text: 'zmiana', createdAt: fs.serverTimestamp() }));
    await deny(fs.deleteDoc(ref));
});
test('queries must be bounded and scoped; own memberships do not reveal someone else invitations', async () => {
    await inviteGuardian(); const p = context('pending'), m = context('member');
    await deny(fs.getDocs(fs.collection(m.db, `${root}/messages`)));
    await deny(fs.getDocs(fs.query(fs.collection(m.db, `${root}/messages`), fs.limit(51))));
    await deny(fs.getDocs(fs.query(fs.collectionGroup(p.db, 'lumina_family_members'), fs.limit(20))));
    await deny(fs.getDocs(fs.query(fs.collectionGroup(p.db, 'lumina_family_members'), fs.where('uid', '==', 'member'), fs.limit(20))));
    assert.equal((await p.client.listMemberships()).length, 1);
});
test('concurrent retries persist exactly one message, not duplicate sends', async () => {
    const m = context('member');
    const results = await Promise.all([m.client.send(ROOM, MID, 'TEST'), m.client.send(ROOM, MID, 'TEST')]);
    assert.equal(new Set(results.map(x => x.id)).size, 1);
    assert.equal((await queryMessages(m)).size, 1);
    assert.equal(results.filter(x => x.duplicate).length, 1);
});
test('Kids cannot accept or read a room containing anyone outside approved contacts', async () => {
    await seed('kids_pilot/config', { childUid: 'kid', contacts: ['guardian', 'member'], enabled: true, revoked: false });
    const t = new Date();
    await seed(root, { schemaVersion: 1, name: 'TEST', ownerUid: 'guardian', status: 'active',
        slotUids: ['guardian', 'member', 'kid', 'stranger'], createdAt: t, updatedAt: t });
    const data = { roomId: ROOM, uid: 'kid', invitedBy: 'guardian', state: 'pending', revision: 1,
        createdAt: t, updatedAt: t, expiresAt: new Date(Date.now() + 86400000) };
    await seed(mem('kid'), data); const kid = context('kid');
    await deny(fs.updateDoc(fs.doc(kid.db, mem('kid')), { state: 'accepted', updatedAt: fs.serverTimestamp() }));
    await seed(mem('kid'), { ...data, state: 'accepted' });
    await deny(get(kid, root)); await deny(queryMessages(kid));
    const member = context('member'); await deny(queryMessages(member));
});
test('accepted adult can withdraw consent without guardian; cannot alter other membership fields', async () => {
    const m = context('member');
    await fs.updateDoc(fs.doc(m.db, mem('member')), { state: 'declined', updatedAt: fs.serverTimestamp() });
    await deny(get(m, root)); await deny(queryMessages(m));
    await deny(fs.updateDoc(fs.doc(m.db, mem('member')), { state: 'accepted', updatedAt: fs.serverTimestamp() }));
});
