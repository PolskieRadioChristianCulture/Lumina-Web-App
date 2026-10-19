/** Family transport. Server rules are mandatory;
 * these checks improve UX and are NOT an authorization boundary.
 * Inject the host's existing Firebase SDK/Auth/Firestore; never initialize a second app.
 */
export const FAMILY_LIMITS = Object.freeze({ slots: 4, memberships: 20, messages: 50, text: 1000 });
const ROOT = 'lumina_family_rooms';
const MEMBERS = 'lumina_family_members';
const fail = code => { throw Object.assign(new Error(code), { code }); };
const id = value => typeof value === 'string' && value.length > 0 && value.length <= 128 &&
    value !== '.' && value !== '..' && !/[\u0000-\u001f/]/u.test(value);
const millis = value => typeof value?.toMillis === 'function' ? value.toMillis() : NaN;

export function createFamilyClient({ db, auth, sdk, enabled = false, now = Date.now }) {
    let disposed = false;
    let generation = 0;
    let lastUid = auth.currentUser?.uid;
    const subscriptions = new Set();
    const user = () => {
        if (!enabled || disposed) fail('family/not-enabled');
        const u = auth.currentUser;
        if (!u || u.isAnonymous || !id(u.uid)) fail('family/sign-in-required');
        return u.uid;
    };
    const guard = (uid, epoch = generation) => {
        if (disposed || generation !== epoch || auth.currentUser?.uid !== uid) fail('family/account-changed');
        user();
    };
    const transaction = async (uid, body) => {
        const epoch = generation;
        const result = await sdk.runTransaction(db, async tx => {
            guard(uid, epoch);
            const result = await body(tx);
            guard(uid, epoch);
            return result;
        });
        // A confirmed write may finish after logout. Never report success to another session.
        guard(uid, epoch);
        return result;
    };
    const roomRef = roomId => {
        if (!id(roomId)) fail('family/invalid-room');
        return sdk.doc(db, ROOT, roomId);
    };
    const memberRef = (roomId, uid) => {
        if (!id(uid)) fail('family/invalid-member');
        return sdk.doc(roomRef(roomId), MEMBERS, uid);
    };
    const read = snapshot => {
        if (!snapshot.exists()) fail('family/not-found');
        return snapshot.data();
    };
    const active = room => {
        if (room.schemaVersion !== 1 || room.status !== 'active' ||
            !Array.isArray(room.slotUids) || room.slotUids.length > FAMILY_LIMITS.slots ||
            room.slotUids.length < 1 || !room.slotUids.every(id) ||
            new Set(room.slotUids).size !== room.slotUids.length ||
            !room.slotUids.includes(room.ownerUid)) fail('family/room-unavailable');
    };
    const member = (room, m, uid, roomId) => {
        active(room);
        if (m.uid !== uid || m.roomId !== roomId || m.state !== 'accepted' ||
            !room.slotUids.includes(uid)) fail('family/not-a-member');
    };
    const closeAll = () => {
        for (const stop of [...subscriptions]) stop();
    };
    const stopAuth = sdk.onAuthStateChanged(auth, u => {
        if (u?.uid !== lastUid) { generation++; closeAll(); }
        lastUid = u?.uid;
    });

    return Object.freeze({
        async getRoom(roomId) {
            const uid = user();
            return transaction(uid, async tx => {
                const room = read(await tx.get(roomRef(roomId)));
                const m = read(await tx.get(memberRef(roomId, uid)));
                member(room, m, uid, roomId);
                return { ...room, id: roomId, isGuardian: room.ownerUid === uid };
            });
        },
        async listMembers(roomId) {
            const uid = user(), epoch = generation;
            const q = sdk.query(sdk.collection(roomRef(roomId), MEMBERS),
                sdk.where('state', '==', 'accepted'), sdk.limit(FAMILY_LIMITS.slots));
            const snapshot = await sdk.getDocs(q);
            guard(uid, epoch);
            return snapshot.docs.map(d => d.data());
        },
        async listMemberships() {
            const uid = user();
            const epoch = generation;
            const q = sdk.query(sdk.collectionGroup(db, MEMBERS), sdk.where('uid', '==', uid),
                sdk.limit(FAMILY_LIMITS.memberships));
            const snapshot = await sdk.getDocs(q);
            guard(uid, epoch);
            // Only this user's invitation metadata, never fetch room contents for pending invitations.
            return snapshot.docs.map(s => s.data()).filter(m => m.uid === uid);
        },
        async invite(roomId, targetUid) {
            const uid = user();
            const r = roomRef(roomId), m = memberRef(roomId, targetUid);
            if (uid === targetUid) fail('family/already-a-member');
            return transaction(uid, async tx => {
                const room = read(await tx.get(r));
                const previous = await tx.get(m);
                active(room);
                if (room.ownerUid !== uid) fail('family/guardian-only');
                const old = previous.exists() ? previous.data() : null;
                if (old && ['pending', 'accepted'].includes(old.state)) fail('family/already-invited');
                const slots = [...new Set([...room.slotUids, targetUid])];
                if (slots.length > FAMILY_LIMITS.slots) fail('family/room-full');
                const revision = (old?.revision || 0) + 1;
                if (revision > 3) fail('family/invitation-limit');
                if (old?.state === 'declined' && !(millis(old.updatedAt) <= now() - 86400000))
                    fail('family/invitation-cooldown');
                guard(uid);
                tx.update(r, { slotUids: slots, updatedAt: sdk.serverTimestamp() });
                tx.set(m, { roomId, uid: targetUid, invitedBy: uid, state: 'pending', revision,
                    createdAt: sdk.serverTimestamp(), updatedAt: sdk.serverTimestamp(),
                    expiresAt: sdk.Timestamp.fromMillis(now() + 6 * 86400000) });
                return { state: 'pending' };
            });
        },
        async answerInvitation(roomId, accept) {
            const uid = user();
            if (typeof accept !== 'boolean') fail('family/invalid-answer');
            const ref = memberRef(roomId, uid);
            return transaction(uid, async tx => {
                // Do NOT read the room here: a pending invitee must not be able to read it.
                const m = read(await tx.get(ref));
                if (m.uid !== uid || m.roomId !== roomId || m.state !== 'pending' ||
                    !Number.isFinite(millis(m.expiresAt)) || millis(m.expiresAt) <= now())
                    fail('family/invitation-unavailable');
                guard(uid);
                const state = accept ? 'accepted' : 'declined';
                tx.update(ref, { state, updatedAt: sdk.serverTimestamp() });
                return { state };
            });
        },
        async revoke(roomId, targetUid) {
            const uid = user();
            const r = roomRef(roomId), m = memberRef(roomId, targetUid);
            return transaction(uid, async tx => {
                const room = read(await tx.get(r));
                const membership = read(await tx.get(m));
                active(room);
                if (room.ownerUid !== uid || targetUid === uid) fail('family/guardian-only');
                if (membership.uid !== targetUid || membership.roomId !== roomId) fail('family/not-a-member');
                guard(uid);
                tx.update(r, { slotUids: room.slotUids.filter(x => x !== targetUid), updatedAt: sdk.serverTimestamp() });
                tx.update(m, { state: 'revoked', updatedAt: sdk.serverTimestamp() });
                return { state: 'revoked' };
            });
        },
        async leave(roomId) {
            const uid = user(), ref = memberRef(roomId, uid);
            return transaction(uid, async tx => {
                const m = read(await tx.get(ref));
                if (m.uid !== uid || m.roomId !== roomId || m.state !== 'accepted') fail('family/not-a-member');
                tx.update(ref, { state: 'declined', updatedAt: sdk.serverTimestamp() });
                return { state: 'declined' };
            });
        },
        async send(roomId, clientMessageId, text) {
            const uid = user();
            if (typeof clientMessageId !== 'string' || !/^[A-Za-z0-9_-]{20,80}$/.test(clientMessageId))
                fail('family/invalid-message-id');
            if (typeof text !== 'string' || !text.trim() || text.trim().length > FAMILY_LIMITS.text)
                fail('family/invalid-text');
            const normalized = text.trim();
            const r = roomRef(roomId), m = memberRef(roomId, uid);
            const ref = sdk.doc(r, 'messages', `${uid}_${clientMessageId}`);
            return transaction(uid, async tx => {
                const room = read(await tx.get(r));
                const membership = read(await tx.get(m));
                const previous = await tx.get(ref);
                member(room, membership, uid, roomId);
                guard(uid);
                if (previous.exists()) {
                    const old = previous.data();
                    if (old.senderUid !== uid || old.clientMessageId !== clientMessageId || old.text !== normalized)
                        fail('family/message-id-conflict');
                    return { id: ref.id, state: 'stored', duplicate: true };
                }
                tx.set(ref, { senderUid: uid, clientMessageId, text: normalized, createdAt: sdk.serverTimestamp() });
                return { id: ref.id, state: 'stored', duplicate: false };
            });
        },
        watchMessages(roomId, onUpdate, onError) {
            const uid = user();
            if (typeof onUpdate !== 'function' || typeof onError !== 'function') fail('family/callback-required');
            const q = sdk.query(sdk.collection(roomRef(roomId), 'messages'),
                sdk.orderBy('createdAt', 'desc'), sdk.limit(FAMILY_LIMITS.messages));
            let stopped = false, unsubscribe = () => {};
            const stop = () => {
                if (stopped) return;
                stopped = true;
                unsubscribe();
                subscriptions.delete(stop);
                onUpdate({ messages: [], state: 'closed' });
            };
            subscriptions.add(stop);
            unsubscribe = sdk.onSnapshot(q, snapshot => {
                if (stopped || auth.currentUser?.uid !== uid) return;
                onUpdate({ messages: snapshot.docs.map(d => ({ ...d.data(), id: d.id })).reverse(),
                    state: snapshot.metadata.hasPendingWrites ? 'pending' :
                        snapshot.metadata.fromCache ? 'cached' : 'synced' });
            }, error => {
                if (stopped) return;
                stop();
                onError(error);
            });
            if (stopped) unsubscribe();
            return stop;
        },
        dispose() { disposed = true; generation++; closeAll(); stopAuth(); }
    });
}
