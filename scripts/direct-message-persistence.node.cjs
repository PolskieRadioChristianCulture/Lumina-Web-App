const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('direct messages stay pending until Firestore confirms and PUSH follows persistence', async () => {
    const state = await import('../js/lumina-direct-message-state.js');
    const pending = state.createPendingDirectMessage({ clientMessageId: 'client-1', text: 'hello', delivered: true }, 'local-1', 1000);
    assert.equal(pending.status, 'pending');
    assert.equal(pending.delivered, false);
    assert.deepEqual(pending.timestamp, { seconds: 1 });

    assert.deepEqual(
        state.withFirestoreWriteState({ id: 'server-1', status: 'sent', delivered: true }, true),
        { id: 'server-1', status: 'pending', delivered: false }
    );
    assert.deepEqual(
        state.withFirestoreWriteState({ id: 'server-1', status: 'sent', delivered: true }, false),
        { id: 'server-1', status: 'sent', delivered: true }
    );

    const confirmed = state.reconcilePersistedDirectMessage(
        [pending, { id: 'server-1', clientMessageId: 'client-1', text: 'server echo', status: 'pending', delivered: false }],
        { clientMessageId: 'client-1', localId: 'local-1', messageId: 'server-1', deliveredAt: 2000 }
    );
    assert.equal(confirmed.length, 1);
    assert.equal(confirmed[0].id, 'server-1');
    assert.equal(confirmed[0].text, 'server echo');
    assert.equal(confirmed[0].status, 'sent');
    assert.equal(confirmed[0].delivered, true);

    assert.deepEqual(
        state.removePendingDirectMessage([pending, { id: 'other' }, { id: 'server-1', clientMessageId: 'client-1' }], { clientMessageId: 'client-1', localId: 'local-1' }),
        [{ id: 'other' }]
    );

    const order = [];
    let releaseWrite;
    const writePromise = new Promise(resolve => { releaseWrite = resolve; });
    const dispatchPromise = state.persistThenDispatch(
        async () => { order.push('write-start'); const ref = await writePromise; order.push('write-ack'); return ref; },
        ref => order.push('local-confirm:' + ref.id),
        async id => { order.push('push-start:' + id); throw new Error('worker 429'); }
    );
    await Promise.resolve();
    assert.deepEqual(order, ['write-start']);
    releaseWrite({ id: 'server-2' });
    const result = await dispatchPromise;
    assert.deepEqual(order, ['write-start', 'write-ack', 'local-confirm:server-2', 'push-start:server-2']);
    assert.deepEqual(result, { id: 'server-2' });

    let pushCalled = false;
    await assert.rejects(state.persistThenDispatch(
        async () => { throw new Error('Firestore denied'); },
        () => assert.fail('must not report persistence success'),
        async () => { pushCalled = true; }
    ), /Firestore denied/);
    assert.equal(pushCalled, false);

    const root = path.resolve(__dirname, '..');
    const pages = ['lumina.html', 'lumina-profile.html', 'lumina-tablica.html', 'lumina.cezaryrgowski.html', 'lumina.wiolettarogowska.html'];
    const modulePages = ["lumina-login.html","lumina-profile.html","lumina-shorts.html","lumina-tablica.html","lumina.andrzejthiel.html","lumina.ccmen.html","lumina.cctv.html","lumina.ccwomen.html","lumina.cezaryrgowski.html","lumina.html","lumina.jolawojcik.html","lumina.magdalena.html","lumina.mariusz.html","lumina.osobowoscplus.html","lumina.pawelmurawski.html","lumina.radiocc.html","lumina.studiodobregoslowa.html","lumina.wiolettarogowska.html","lumina.zbyszekgieron.html","lumina.zofiadudek.html"];
    const versions = new Set();
    for (const file of [...new Set([...pages, ...modulePages])]) {
        const html = fs.readFileSync(path.join(root, file), 'utf8');
        const refs = [...html.matchAll(/(?:\.\/)?lumina-db\.js\?v=([^"'\s)]+)/g)].map(match => match[1]);
        assert.ok(refs.length > 0, file + ' must load a versioned lumina-db.js');
        refs.forEach(version => versions.add(version));
        if (pages.includes(file)) {
            const sendAt = html.indexOf('sendDirectMessageToCloud(activeChatSession.chatId');
            assert.notEqual(sendAt, -1, file + ' must contain the active chat send handler');
            const recovery = html.slice(sendAt, sendAt + 1100);
            assert.match(recovery, /if\s*\(!result\)/, file + ' must handle a failed write');
            assert.match(recovery, /input\.value\s*=\s*text/, file + ' must restore the draft after a failed write');
        }
    }
    assert.equal(versions.size, 1, 'all active chat pages must use the same cache-busted module version');

    const db = fs.readFileSync(path.join(root, 'lumina-db.js'), 'utf8');
    assert.match(db, /includeMetadataChanges:\s*true/, 'Firestore listeners must observe the write acknowledgement');
});
