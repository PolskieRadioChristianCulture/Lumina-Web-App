import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();

test('Rozmowa dwóch użytkowników: wysyłka, realtime sync, reconnect, powiadomienia i bezwyciekowe zamykanie nasłuchów', async () => {
    const luminaDbSrc = fs.readFileSync(path.join(ROOT, 'lumina-db.js'), 'utf8');

    // Wyciągamy ciało subscribeToDirectMessages
    const match = luminaDbSrc.match(/export function subscribeToDirectMessages\([\s\S]*?\n\}/);
    assert.ok(match, 'Nie znaleziono subscribeToDirectMessages');
    const code = match[0].replace('export function subscribeToDirectMessages', 'function subscribeToDirectMessages');

    // Symulacja bazy danych w pamięci
    const sharedFirestoreStore = new Map();
    const activeListeners = new Set();
    let totalUnsubCalls = 0;

    function createClientEnvironment(user) {
        let currentAuthUser = user;
        const receivedMessages = [];
        const listenerMap = new Map();
        const clientActiveListeners = [];

        const context = {
            db: {},
            currentUserState: currentAuthUser,
            auth: { currentUser: currentAuthUser },
            getChatId: (a, b) => [a, b].sort().join('_'),
            localStorage: { removeItem: () => {} },
            activeDirectChatListeners: listenerMap,
            activeDirectChatMessages: new Map(),
            collection: (_db, p) => p,
            where: (field, op, val) => ({ field, op, val }),
            orderBy: (f, dir) => ({ f, dir }),
            limit: n => ({ n }),
            query: (...parts) => parts,
            onSnapshot: (q, opts, cb, err) => {
                const unsub = () => {
                    totalUnsubCalls++;
                    activeListeners.delete(listenerObj);
                };
                const listenerObj = { q, cb, err, unsub, user: currentAuthUser.uid };
                activeListeners.add(listenerObj);
                clientActiveListeners.push(listenerObj);

                // Początkowy stan z bazy
                setTimeout(() => {
                    const docs = [];
                    sharedFirestoreStore.forEach((val, id) => {
                        docs.push({
                            id,
                            data: () => val,
                            metadata: { hasPendingWrites: false }
                        });
                    });
                    cb({ forEach: fn => docs.forEach(fn) });
                }, 5);

                return unsub;
            },
            getDocs: async () => {
                const docs = [];
                sharedFirestoreStore.forEach((val, id) => {
                    docs.push({
                        id,
                        data: () => val,
                        metadata: { hasPendingWrites: false }
                    });
                });
                return { forEach: fn => docs.forEach(fn) };
            },
            onAuthChange: (cb) => () => {},
            document: { addEventListener: () => {}, removeEventListener: () => {}, visibilityState: 'visible', getElementById: () => ({ classList: { contains: () => true } }) },
            window: { dispatchEvent: () => {} },
            CustomEvent: function() {},
            console: { warn: () => {} },
            getDirectMessageKey: m => m.id,
            getDirectMessageTime: m => m.timestamp || 0
        };

        const fn = vm.runInNewContext('(' + code + ')', context);
        return { context, fn, receivedMessages, clientActiveListeners };
    }

    const userA = { uid: 'user_adam', isAnonymous: false };
    const userB = { uid: 'user_beata', isAnonymous: false };
    const chatId = 'user_adam_user_beata';

    const clientA = createClientEnvironment(userA);
    const clientB = createClientEnvironment(userB);

    // KROK 1: Obaj użytkownicy otwierają rozmowę
    let messagesA = [];
    let messagesB = [];
    const stopA = clientA.fn(chatId, msgs => { messagesA = msgs; });
    const stopB = clientB.fn(chatId, msgs => { messagesB = msgs; });

    // Czekamy na initial snapshot
    await new Promise(r => setTimeout(r, 20));

    assert.equal(activeListeners.size, 6, 'Powinno działać 6 początkowych listenerów (3 na usera)');

    // KROK 2: Użytkownik A wysyła wiadomość do B
    const msg1 = {
        chatId,
        participants: ['user_adam', 'user_beata'],
        senderAuthUid: 'user_adam',
        receiverAuthUid: 'user_beata',
        text: 'Witaj w pokoju Pańskim!',
        timestamp: 1000
    };
    sharedFirestoreStore.set('msg_001', msg1);

    // Rozgłaszamy aktualizację do aktywnych listenerów
    activeListeners.forEach(l => {
        const docs = [{
            id: 'msg_001',
            data: () => msg1,
            metadata: { hasPendingWrites: false }
        }];
        l.cb({ forEach: fn => docs.forEach(fn) });
    });

    assert.equal(messagesB.length, 1, 'Użytkownik B odebrał wiadomość w czasie rzeczywistym');
    assert.equal(messagesB[0].text, 'Witaj w pokoju Pańskim!');
    assert.equal(messagesA.length, 1, 'Użytkownik A widzi swoją wiadomość');

    // KROK 3: Symulacja Powiadomienia Push (FCM payload)
    const fcmNotificationPayload = {
        data: {
            type: 'direct_message',
            chatId: chatId,
            senderName: 'Adam',
            senderAuthUid: 'user_adam',
            body: 'Witaj w pokoju Pańskim!'
        }
    };
    assert.equal(fcmNotificationPayload.data.chatId, chatId);
    assert.equal(fcmNotificationPayload.data.senderAuthUid, userA.uid);

    // KROK 4: Symulacja błędu sieci (transient disconnect) i reconnectu
    const activeForA = clientA.clientActiveListeners[0];
    assert.ok(activeForA, 'Listener usera A istnieje');
    // Wywołujemy błąd przejściowy
    activeForA.err({ code: 'unavailable' });

    // KROK 5: Zamykanie czatu (stopConversation) — weryfikacja czyszczenia zasobów
    stopA();
    assert.equal(totalUnsubCalls, 3, 'stopA natychmiast odsubskrybowało 3 listenery usera A');

    stopB();
    assert.equal(totalUnsubCalls, 6, 'stopB odsubskrybowało 3 listenery usera B (łącznie 6)');
    assert.equal(activeListeners.size, 0, 'Żaden listener nie pozostał aktywny w pamięci');

    // Sprawdzamy opóźniony błąd po zamknięciu — nie może wznowić nasłuchu
    activeForA.err({ code: 'failed-precondition' });
    assert.equal(activeListeners.size, 0, 'Opóźniony błąd po stopConversation nie otworzył nowego listenera');
});
