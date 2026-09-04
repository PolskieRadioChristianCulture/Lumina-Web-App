/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA — Zdalne Powiadomienia Push (Firebase Cloud Messaging - FCM)
 * ══════════════════════════════════════════════════════════════════════════
 * Działa po stronie serwera Google Cloud Functions w regionie europe-west1.
 * Budzi aplikację i wyświetla systemowe powiadomienia na telefonach (Android /
 * iOS PWA) oraz komputerach (Windows / macOS / Linux), nawet gdy aplikacja
 * i przeglądarka są całkowicie ZAMKNIĘTE.
 *
 * Obsługiwane scenariusze:
 * 1. Nowy użytkownik dołącza do społeczności LUMINA (lumina_profiles/{id})
 * 2. Nowy wpis użytkownika na tablicy dla jego obserwujących (lumina_posts/{id})
 * 3. Wiadomość prywatna 1:1 na czacie (lumina_direct_messages/{id})
 * 4. Wiadomość na czacie publicznym / wzmianka @użytkownik (lumina_public_chat_messages/{id})
 * 5. Codzienne poranne rozważanie Słowa Bożego (06:15 Europe/Warsaw)
 * 6. Nowa publikacja Cuda Każdego Dnia (CKD) na tablicy
 * ══════════════════════════════════════════════════════════════════════════
 */

const { initializeApp, getApps, getApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');

const app = getApps().length === 0 ? initializeApp() : getApp();
const db = getFirestore(app);
const messaging = getMessaging(app);
const REGION = 'europe-west1';

/**
 * Pobiera WSZYSTKIE aktywne tokeny FCM danego użytkownika (obsługa wielu
 * urządzeń na raz — telefon + tablet + laptop), z wyszukiwaniem po uid oraz slug.
 */
async function getTokensForUser(uidOrSlug) {
    if (!uidOrSlug) return [];
    const tokens = new Set();
    const cleanSlug = String(uidOrSlug).replace(/^u_/, '');

    const queries = [
        db.collection('LuminaDeviceTokens').where('uid', '==', uidOrSlug).where('enabled', '==', true).get(),
        db.collection('LuminaDeviceTokens').where('slug', '==', uidOrSlug).where('enabled', '==', true).get(),
        db.collection('LuminaDeviceTokens').where('userSlug', '==', uidOrSlug).where('enabled', '==', true).get()
    ];

    if (cleanSlug !== uidOrSlug) {
        queries.push(db.collection('LuminaDeviceTokens').where('uid', '==', cleanSlug).where('enabled', '==', true).get());
        queries.push(db.collection('LuminaDeviceTokens').where('slug', '==', cleanSlug).where('enabled', '==', true).get());
    }

    try {
        const snaps = await Promise.all(queries.map(p => p.catch(() => ({ docs: [] }))));
        snaps.forEach(snap => {
            if (snap && snap.docs) {
                snap.docs.forEach(doc => {
                    const t = doc.data()?.token;
                    if (t) tokens.add(t);
                });
            }
        });
    } catch(err) {
        logger.warn(`[Push] Błąd pobierania tokenów dla ${uidOrSlug}:`, err);
    }

    // Awaryjny fallback do dokumentu profilu lumina_profiles/{id}
    if (tokens.size === 0) {
        try {
            const profileSnap = await db.doc(`lumina_profiles/${uidOrSlug}`).get().catch(() => null);
            if (profileSnap && profileSnap.exists) {
                const fallbackToken = profileSnap.data()?.fcmToken;
                if (fallbackToken) tokens.add(fallbackToken);
            }
            if (tokens.size === 0 && cleanSlug !== uidOrSlug) {
                const cleanSnap = await db.doc(`lumina_profiles/${cleanSlug}`).get().catch(() => null);
                if (cleanSnap && cleanSnap.exists) {
                    const fallbackToken = cleanSnap.data()?.fcmToken;
                    if (fallbackToken) tokens.add(fallbackToken);
                }
            }
        } catch(e) {}
    }

    return [...tokens];
}

/**
 * Pobiera tokeny wszystkich aktywnych urządzeń w systemie, z opcją wykluczenia
 * wybranych identyfikatorów użytkowników (np. autora akcji).
 */
async function getAllActiveDeviceTokens(excludeUserIds = []) {
    const excludeSet = new Set(excludeUserIds.filter(Boolean).map(id => String(id).toLowerCase().replace(/^u_/, '')));
    const tokens = new Set();

    try {
        const snap = await db.collection('LuminaDeviceTokens')
            .where('enabled', '==', true)
            .get();

        snap.forEach(doc => {
            const data = doc.data();
            const token = data.token;
            const uid = String(data.uid || '').toLowerCase().replace(/^u_/, '');
            const slug = String(data.slug || data.userSlug || '').toLowerCase().replace(/^u_/, '');

            if (excludeSet.has(uid) || excludeSet.has(slug)) {
                return; // Pomiń autora akcji
            }

            if (token) tokens.add(token);
        });
    } catch(err) {
        logger.error('[Push] Błąd pobierania wszystkich tokenów urządzeń:', err);
    }

    return [...tokens];
}

/**
 * Wysyła powiadomienie Push (Multicast) do listy tokenów i automatycznie czyści
 * unieważnione / wygasłe tokeny z bazy Firestore.
 */
async function sendToTokens(tokens, { title, body, icon, image, url, tag, data = {}, actions = [], requireInteraction = false }) {
    if (!tokens || !tokens.length) return { sent: 0, failed: 0 };

    const payloadData = {
        title: title || 'LUMINA ✨',
        body: body || '',
        url: url || 'https://polskieradio.cc/lumina',
        icon: icon || 'https://polskieradio.cc/lumina-icon-512.png',
        badge: 'https://polskieradio.cc/lumina-icon-192.png',
        tag: tag || 'lumina-general',
        ...(image ? { image } : {}),
        ...data
    };

    const webpushActions = actions && actions.length ? actions : [
        { action: 'open', title: 'Otwórz LUMINA 🕊️' }
    ];

    const message = {
        notification: {
            title: title,
            body: body,
        },
        data: Object.fromEntries(
            Object.entries(payloadData).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])
        ),
        android: {
            priority: 'high',
            notification: {
                priority: 'high',
                defaultSound: true,
                defaultVibrateTimings: true,
                channelId: 'lumina_messages'
            }
        },
        webpush: {
            headers: {
                Urgency: 'high'
            },
            notification: {
                title: title,
                body: body,
                icon: icon || 'https://polskieradio.cc/lumina-icon-512.png',
                badge: 'https://polskieradio.cc/lumina-icon-192.png',
                image: image || undefined,
                tag: tag || 'lumina-general',
                renotify: true,
                requireInteraction: requireInteraction,
                actions: webpushActions,
            },
            fcmOptions: {
                link: url || 'https://polskieradio.cc/lumina'
            },
        },
        tokens: tokens,
    };

    try {
        const result = await messaging.sendEachForMulticast(message);

        // Automatyczne czyszczenie nieaktywnych tokenów
        const cleanupPromises = [];
        result.responses.forEach((resp, i) => {
            if (!resp.success) {
                const errCode = resp.error?.code || '';
                if (errCode.includes('registration-token-not-registered') || errCode.includes('invalid-argument')) {
                    const deadToken = tokens[i];
                    cleanupPromises.push(
                        db.collection('LuminaDeviceTokens')
                            .where('token', '==', deadToken)
                            .get()
                            .then(snap => Promise.all(snap.docs.map(d => d.ref.delete())))
                            .catch(() => {})
                    );
                }
            }
        });

        if (cleanupPromises.length) {
            await Promise.all(cleanupPromises);
        }

        return { sent: result.successCount, failed: result.failureCount };
    } catch(err) {
        logger.error('[Push] Błąd wysyłki multicast:', err);
        return { sent: 0, failed: tokens.length };
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 1) NOWY UŻYTKOWNIK DOŁĄCZA DO SPOŁECZNOŚCI LUMINA
// ══════════════════════════════════════════════════════════════════════════
exports.onLuminaProfileCreated = onDocumentCreated(
    { document: 'lumina_profiles/{profileId}', region: REGION },
    async (event) => {
        const profile = event.data?.data();
        if (!profile) return;

        const profileId = event.params.profileId;
        const name = profile.name || 'Nowy brat / siostra';
        const city = profile.city ? profile.city.split(',')[0].trim() : 'Polska';
        const slug = profile.slug || profileId;
        const rawAvatar = profile.avatar;
        const avatar = (rawAvatar && !rawAvatar.startsWith('data:')) ? rawAvatar : 'https://polskieradio.cc/lumina_icon.jpg';

        logger.info(`[Push New User] Nowy profil zarejestrowany: ${name} (${city}), slug: ${slug}`);

        // Wyślij powiadomienie do wszystkich pozostałych użytkowników
        const tokens = await getAllActiveDeviceTokens([profileId, slug, profile.uid]);
        if (!tokens.length) {
            logger.info('[Push New User] Brak zarejestrowanych odbiorców — pomijam.');
            return;
        }

        const result = await sendToTokens(tokens, {
            title: `✨ Nowy profil w społeczności LUMINA!`,
            body: `${name} (${city}) dołączył(a) do LUMINA. Zobacz profil i powitaj w wierze! 🕊️`,
            icon: avatar,
            url: `https://polskieradio.cc/lumina-profile.html?u=${encodeURIComponent(slug)}`,
            tag: `lumina-new-profile-${profileId}`,
            data: {
                type: 'new_profile',
                slug: slug,
                profileId: profileId,
                name: name
            },
            actions: [
                { action: 'view', title: '👀 Zobacz Profil' },
                { action: 'welcome', title: '🕊️ Powitaj' }
            ]
        });

        logger.info(`[Push New User] Wysłano ${result.sent} powiadomień o nowym profilu ${name}, błędy: ${result.failed}`);
    }
);

// ══════════════════════════════════════════════════════════════════════════
// 2) NOWY POST NA TABLICY — DLA OBSERWUJĄCYCH ORAZ ROZWAŻAŃ CKD
// ══════════════════════════════════════════════════════════════════════════
exports.onLuminaPostCreated = onDocumentCreated(
    { document: 'lumina_posts/{postId}', region: REGION },
    async (event) => {
        const post = event.data?.data();
        if (!post) return;

        const postId = event.params.postId;
        const authorId = post.authorId || post.userId || post.authorSlug || '';
        const authorSlug = post.authorSlug || authorId || '';
        const authorName = post.authorName || post.name || 'Użytkownik LUMINA';
        const rawAvatar = post.authorAvatar || post.avatar;
        const authorAvatar = (rawAvatar && !rawAvatar.startsWith('data:')) ? rawAvatar : 'https://polskieradio.cc/lumina_icon.jpg';
        const contentText = post.content || post.text || post.teaser || post.title || 'Nowy wpis na Tablicy Społeczności.';
        const category = (post.category || post.type || '').toLowerCase();
        const isCkd = category.includes('ckd') || category.includes('cuda') || category.includes('rozwazanie') || category.includes('dzj')
            || post.isDevotion === true
            || authorSlug === 'andrzejthiel';

        // 2A. Jeśli wpis to oficjalne rozważanie Cuda Każdego Dnia (CKD) -> wysyłka do wszystkich subskrybentów
        if (isCkd) {
            logger.info(`[Push Post/CKD] Wykryto publikację Cuda Każdego Dnia: ${post.title || authorName}`);
            const allTokens = await getAllActiveDeviceTokens([authorId, authorSlug]);
            if (!allTokens.length) return;

            const title = post.title || `✨ Cuda Każdego Dnia • ${authorName}`;
            const body = contentText.length > 140 ? contentText.slice(0, 137) + '...' : contentText;

            const result = await sendToTokens(allTokens, {
                title: `✨ Cuda Każdego Dnia • ${title}`,
                body: body,
                icon: authorAvatar,
                image: post.imageUrl || undefined,
                url: `https://polskieradio.cc/lumina-tablica.html?openDevotion=${postId}`,
                tag: `lumina-ckd-${postId}`,
                requireInteraction: true,
                data: {
                    type: 'ckd',
                    postId: postId,
                    devotionId: postId
                },
                actions: [
                    { action: 'read', title: '📖 Czytaj' },
                    { action: 'share', title: '🕊️ Udostępnij' }
                ]
            });
            logger.info(`[Push CKD] Wysłano ${result.sent} powiadomień CKD, błędy: ${result.failed}`);
            return;
        }

        // 2B. Standardowy wpis użytkownika -> wysyłka DO OBSERWUJĄCYCH AUTORA
        logger.info(`[Push Post] Nowy post od ${authorName} (${authorSlug}). Wyszukiwanie obserwujących...`);

        const followerIds = new Set();

        try {
            // Wyszukaj w kolekcji lumina_likes relacje typu 'follow' skierowane do autora
            const queries = [];
            if (authorSlug) {
                queries.push(db.collection('lumina_likes').where('to', '==', authorSlug).where('type', '==', 'follow').get());
            }
            if (authorId && authorId !== authorSlug) {
                queries.push(db.collection('lumina_likes').where('to', '==', authorId).where('type', '==', 'follow').get());
            }

            const likeSnaps = await Promise.all(queries.map(q => q.catch(() => ({ docs: [] }))));
            likeSnaps.forEach(snap => {
                if (snap && snap.docs) {
                    snap.docs.forEach(doc => {
                        const follower = doc.data()?.from;
                        if (follower && follower !== authorId && follower !== authorSlug) {
                            followerIds.add(follower);
                        }
                    });
                }
            });
        } catch(err) {
            logger.warn('[Push Post] Błąd odczytu obserwujących z lumina_likes:', err);
        }

        if (followerIds.size === 0) {
            logger.info(`[Push Post] Autor ${authorName} nie ma jeszcze obserwujących w lumina_likes.`);
            return;
        }

        logger.info(`[Push Post] Znaleziono ${followerIds.size} obserwujących dla ${authorName}. Pobieranie tokenów...`);

        const followerTokens = new Set();
        for (const followerId of followerIds) {
            const userTokens = await getTokensForUser(followerId);
            userTokens.forEach(t => followerTokens.add(t));
        }

        if (followerTokens.size === 0) {
            logger.info('[Push Post] Obserwujący nie mają aktywnych tokenów FCM.');
            return;
        }

        const bodySnippet = contentText.length > 130 ? contentText.slice(0, 127) + '...' : contentText;
        const result = await sendToTokens([...followerTokens], {
            title: `🕊️ ${authorName} dodał(a) nowy wpis`,
            body: bodySnippet,
            icon: authorAvatar,
            image: post.imageUrl || undefined,
            url: `https://polskieradio.cc/lumina-tablica.html?postId=${postId}`,
            tag: `lumina-post-${postId}`,
            data: {
                type: 'new_post',
                postId: postId,
                authorSlug: authorSlug,
                authorName: authorName
            },
            actions: [
                { action: 'read', title: '📖 Zobacz wpis' },
                { action: 'like', title: '❤️ Polub' }
            ]
        });

        logger.info(`[Push Post] Wysłano ${result.sent} powiadomień do obserwujących ${authorName}, błędy: ${result.failed}`);
    }
);

// ══════════════════════════════════════════════════════════════════════════
// 3) WIADOMOŚCI PRYWATNE (1:1) — PUSH DO ODBIORCY NA ZAMKNIĘTEJ APLIKACJI
// ══════════════════════════════════════════════════════════════════════════
exports.onDirectMessageCreated = onDocumentCreated(
    { document: 'lumina_direct_messages/{messageId}', region: REGION },
    async (event) => {
        const msg = event.data?.data();
        if (!msg) return;

        const { senderId, receiverId, senderName, text, imageUrl, senderAvatar } = msg;
        if (!receiverId || !senderId || receiverId === senderId) return;

        const tokens = await getTokensForUser(receiverId);
        if (!tokens.length) {
            logger.info(`[Push DM] Brak aktywnego tokenu FCM dla odbiorcy ${receiverId}.`);
            return;
        }

        const authorAvatar = (senderAvatar && !senderAvatar.startsWith('data:')) ? senderAvatar : 'https://polskieradio.cc/lumina_icon.jpg';
        const msgBody = imageUrl ? '📷 Przesłał(a) zdjęcie w wiadomości prywatnej' : ((text || '').slice(0, 140) || 'Nowa wiadomość');

        const result = await sendToTokens(tokens, {
            title: `💬 ${senderName || 'Wiadomość prywatna'}`,
            body: msgBody,
            icon: authorAvatar,
            url: `https://polskieradio.cc/lumina.html?openChat=${encodeURIComponent(senderId)}&messageId=${event.params.messageId || ''}`,
            tag: `lumina-dm-${senderId}`,
            requireInteraction: true,
            data: {
                type: 'direct_message',
                senderId: senderId,
                senderName: senderName || '',
                messageId: event.params.messageId || ''
            },
            actions: [
                { action: 'reply', title: '💬 Odpowiedz' },
                { action: 'open', title: 'Otwórz Czat' }
            ]
        });

        logger.info(`[Push DM] ${senderId} → ${receiverId}: wysłano ${result.sent}, błędy ${result.failed}`);
    }
);

// ══════════════════════════════════════════════════════════════════════════
// 4) CZAT SPOŁECZNOŚCI (PUBLICZNY / GRUPOWY) & WZMIANKI
// ══════════════════════════════════════════════════════════════════════════
exports.onPublicChatMessageCreated = onDocumentCreated(
    { document: 'lumina_public_chat_messages/{messageId}', region: REGION },
    async (event) => {
        const msg = event.data?.data();
        if (!msg) return;

        const { senderId, senderName, text, senderAvatar, imageUrl } = msg;
        const msgText = text || (imageUrl ? '📷 Przesłał(a) zdjęcie' : '');
        if (!msgText) return;

        const authorAvatar = (senderAvatar && !senderAvatar.startsWith('data:')) ? senderAvatar : 'https://polskieradio.cc/lumina_icon.jpg';

        // 4A. Wykryj bezpośrednie wzmianki: "@slug" lub "@imie"
        const mentionMatches = [...msgText.matchAll(/@([a-zA-Z0-9_ąćęłńóśźż]+)/gi)].map(m => m[1].toLowerCase().replace(/\s+/g, ''));
        const uniqueMentions = [...new Set(mentionMatches)].filter(m => m !== senderId && m !== 'wszyscy' && m !== 'all');

        const notifiedTokens = new Set();

        // Priorytetowy push do wspomnianych użytkowników
        for (const mentionedSlug of uniqueMentions) {
            const tokens = await getTokensForUser(mentionedSlug);
            if (!tokens.length) continue;

            tokens.forEach(t => notifiedTokens.add(t));

            await sendToTokens(tokens, {
                title: `📣 ${senderName || 'Ktoś'} wspomniał(a) o Tobie na czacie`,
                body: msgText.slice(0, 140),
                icon: authorAvatar,
                url: `https://polskieradio.cc/lumina.html?openPublicChat=1&messageId=${event.params.messageId || ''}`,
                tag: `lumina-mention-${mentionedSlug}`,
                requireInteraction: true,
                data: {
                    type: 'mention',
                    senderId: senderId,
                    senderName: senderName || ''
                },
                actions: [
                    { action: 'reply', title: '💬 Odpowiedz' },
                    { action: 'open', title: 'Otwórz Czat' }
                ]
            });
        }

        // 4B. Grupowe powiadomienie dla pozostałych uczestników społeczności
        const allTokens = await getAllActiveDeviceTokens([senderId]);
        const remainingTokens = allTokens.filter(t => !notifiedTokens.has(t));

        if (remainingTokens.length > 0) {
            const result = await sendToTokens(remainingTokens, {
                title: `👥 Czat Społeczności • ${senderName || 'Nowa wiadomość'}`,
                body: msgText.slice(0, 140),
                icon: authorAvatar,
                url: `https://polskieradio.cc/lumina.html?openPublicChat=1`,
                tag: 'lumina-public-chat',
                data: {
                    type: 'public_chat',
                    senderId: senderId,
                    senderName: senderName || ''
                },
                actions: [
                    { action: 'open', title: '💬 Dołącz do rozmowy' }
                ]
            });
            logger.info(`[Push Public Chat] Wysłano ${result.sent} powiadomień grupowych od ${senderName}, błędy: ${result.failed}`);
        }
    }
);

// ══════════════════════════════════════════════════════════════════════════
// 5) PORANNE ROZWAŻANIE „DOBRZE, ŻE JESTEŚ” — CODZIENNIE O 06:15 RANO
// ══════════════════════════════════════════════════════════════════════════
exports.scheduledMorningDevotionPush = onSchedule(
    { schedule: '15 6 * * *', timeZone: 'Europe/Warsaw', region: REGION },
    async (event) => {
        logger.info('[Push 06:15] Uruchomienie porannego rozważania Dobrze, że jesteś...');

        const todayStr = new Date().toISOString().split('T')[0];
        let title = 'Dobrze, że jesteś na nowy dzień ✨';
        let teaser = 'Rozpocznij poranek ze Słowem Bożym i napełnij serce pokojem Chrystusa.';
        let imageUrl = 'https://polskieradio.cc/lumina_icon.jpg';

        try {
            let dobrzeZeJestesDb;
            try {
                const { getApp } = require('firebase-admin/app');
                let dzjApp;
                try {
                    dzjApp = getApp('dobrzeZeJestes');
                } catch (e) {
                    dzjApp = initializeApp({ projectId: 'cuda-398c0' }, 'dobrzeZeJestes');
                }
                dobrzeZeJestesDb = getFirestore(dzjApp);
            } catch (initErr) {
                logger.warn('[Push 06:15] Brak bezpośredniego połączenia z cuda-398c0:', initErr.message);
            }

            if (dobrzeZeJestesDb) {
                const refSnap = await dobrzeZeJestesDb.collection('reflections')
                    .where('date', '==', todayStr)
                    .limit(1)
                    .get();

                if (!refSnap.empty) {
                    const d = refSnap.docs[0].data();
                    title = d.title || title;
                    teaser = d.teaser || d.snippet || teaser;
                    imageUrl = d.imageUrl || imageUrl;
                }
            }
        } catch(err) {
            logger.warn('[Push 06:15] Błąd pobierania rozważania z chmury:', err);
        }

        const allTokens = await getAllActiveDeviceTokens([]);
        if (!allTokens.length) {
            logger.info('[Push 06:15] Brak zarejestrowanych urządzeń.');
            return;
        }

        const result = await sendToTokens(allTokens, {
            title: `🕊️ Dobrze, że jesteś • ${title}`,
            body: teaser.length > 140 ? teaser.slice(0, 137) + '...' : teaser,
            icon: 'https://polskieradio.cc/lumina_icon.jpg',
            image: imageUrl !== 'https://polskieradio.cc/lumina_icon.jpg' ? imageUrl : undefined,
            url: 'https://polskieradio.cc/lumina-tablica.html?openDevotion=today',
            tag: `lumina-devotion-${todayStr}`,
            requireInteraction: true,
            data: {
                type: 'devotion',
                devotionId: todayStr,
                title: title,
                body: teaser
            },
            actions: [
                { action: 'read', title: '📖 Czytaj' },
                { action: 'share', title: '🕊️ Udostępnij' }
            ]
        });

        logger.info(`[Push 06:15] Wysłano ${result.sent} powiadomień porannych, błędy: ${result.failed}`);
    }
);
