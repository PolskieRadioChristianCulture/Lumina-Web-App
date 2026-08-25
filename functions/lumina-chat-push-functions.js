/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA — Prawdziwe powiadomienia push dla czatu (Cloud Functions)
 * ══════════════════════════════════════════════════════════════════════════
 * BRAKUJĄCE OGNIWO. Do tej pory NIC w repozytorium nie wysyłało powiadomień
 * push przez Firebase Cloud Messaging w reakcji na nową wiadomość czatu —
 * istniejący kod (`lumina-notifications.js`) tylko WYŚWIETLA powiadomienie
 * lokalnie, w obrębie otwartej karty przeglądarki. To nie działa, gdy
 * aplikacja jest zamknięta, bo wtedy ten kod JavaScript w ogóle się nie
 * wykonuje. Ten plik naprawia to raz na zawsze — działa na serwerze Google,
 * niezależnie od tego, czy czyjakolwiek przeglądarka jest otwarta.
 *
 * npm install firebase-functions firebase-admin
 * firebase deploy --only functions:onDirectMessageCreated,functions:onPublicChatMessageCreated
 *
 * Wymaga: pole `fcmToken` w lumina_profiles/{uid} ORAZ/LUB dokumenty w
 * kolekcji LuminaDeviceTokens/{tokenId} z polem uid — oba już są zapisywane
 * przez istniejący kod (requestNotificationPermission w lumina-db.js).
 * ══════════════════════════════════════════════════════════════════════════
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { logger } = require('firebase-functions');

initializeApp();
const db = getFirestore();
const messaging = getMessaging();
const REGION = 'europe-west1';

/**
 * Pobiera WSZYSTKIE aktywne tokeny FCM danego użytkownika (obsługa wielu
 * urządzeń — telefon + komputer naraz), z awaryjnym fallbackiem do
 * pojedynczego tokenu w profilu, jeśli LuminaDeviceTokens jest puste
 * (starsze konta, zanim wprowadzono wieloużądzeniowość).
 */
async function getTokensForUser(uid) {
    if (!uid) return [];
    const tokens = new Set();

    const deviceTokensSnap = await db.collection('LuminaDeviceTokens')
        .where('uid', '==', uid)
        .where('enabled', '==', true)
        .get();
    deviceTokensSnap.forEach(doc => {
        const t = doc.data().token;
        if (t) tokens.add(t);
    });

    if (tokens.size === 0) {
        const profileSnap = await db.doc(`lumina_profiles/${uid}`).get();
        const fallbackToken = profileSnap.exists ? profileSnap.data().fcmToken : null;
        if (fallbackToken) tokens.add(fallbackToken);
    }

    return [...tokens];
}

/**
 * Wysyła push do listy tokenów, cicho usuwając z Firestore te, które
 * Firebase zgłasza jako martwe (użytkownik odinstalował/wylogował) —
 * inaczej zbieramy śmieci w LuminaDeviceTokens w nieskończoność.
 */
async function sendToTokens(tokens, { title, body, icon, url, tag }) {
    if (!tokens.length) return { sent: 0, failed: 0 };

    const message = {
        notification: { title, body },
        webpush: {
            notification: {
                icon: icon || 'https://polskieradio.cc/lumina_icon.jpg',
                badge: 'https://polskieradio.cc/lumina_icon.jpg',
                tag: tag || 'lumina-chat',
                renotify: true,
            },
            fcmOptions: { link: url || 'https://polskieradio.cc/lumina.html' },
        },
        tokens,
    };

    const result = await messaging.sendEachForMulticast(message);

    // Posprzątaj martwe tokeny (invalid-registration, not-registered).
    const cleanupPromises = [];
    result.responses.forEach((resp, i) => {
        if (!resp.success) {
            const code = resp.error?.code || '';
            if (code.includes('registration-token-not-registered') || code.includes('invalid-argument')) {
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
    await Promise.all(cleanupPromises);

    return { sent: result.successCount, failed: result.failureCount };
}

/**
 * -----------------------------------------------------------------------
 * 1) WIADOMOŚCI PRYWATNE (1:1) — push zawsze trafia do odbiorcy,
 *    niezależnie od tego, czy ma otwartą kartę.
 * -----------------------------------------------------------------------
 */
exports.onDirectMessageCreated = onDocumentCreated(
    { document: 'lumina_direct_messages/{messageId}', region: REGION },
    async (event) => {
        const msg = event.data?.data();
        if (!msg) return;

        const { senderId, receiverId, senderName, text, imageUrl } = msg;
        if (!receiverId || !senderId || receiverId === senderId) return;

        const tokens = await getTokensForUser(receiverId);
        if (!tokens.length) {
            logger.info(`[Push] Brak tokenu dla ${receiverId} — pomijam (offline/brak zgody).`);
            return;
        }

        const result = await sendToTokens(tokens, {
            title: `💬 ${senderName || 'Nowa wiadomość'} napisał(a) do Ciebie`,
            body: imageUrl ? '📷 Wysłał(a) zdjęcie' : (text || '').slice(0, 140),
            url: `https://polskieradio.cc/lumina.html?openChat=${senderId}&messageId=${event.params.messageId || ""}`,
            tag: `lumina-dm-${senderId}`,
        });
        logger.info(`[Push] DM ${senderId}→${receiverId}: wysłano ${result.sent}, błędy ${result.failed}`);
    }
);

/**
 * -----------------------------------------------------------------------
 * 2) CZAT PUBLICZNY / GRUPOWY — UWAGA NA DECYZJĘ PROJEKTOWĄ:
 *
 *    Wysyłanie push do KAŻDEGO uczestnika społeczności przy KAŻDEJ
 *    wiadomości na czacie ogólnym zalałoby ludzi powiadomieniami przy
 *    aktywnej rozmowie (setki osób × każda wiadomość = spam, ludzie
 *    wyłączą powiadomienia na stałe). Dlatego ta funkcja domyślnie
 *    wysyła push TYLKO gdy ktoś zostanie bezpośrednio wspomniany
 *    (@wzmianka) — dokładnie tak, jak robi to każdy poważny komunikator
 *    grupowy (Slack, Discord, WhatsApp grupy).
 *
 *    Jeśli mimo to chcesz push przy KAŻDEJ wiadomości na czacie ogólnym —
 *    to świadoma decyzja biznesowa, nie techniczna — daj znać, a zmienię
 *    to na wysyłkę do wszystkich aktywnych uczestników rozmowy.
 * -----------------------------------------------------------------------
 */
exports.onPublicChatMessageCreated = onDocumentCreated(
    { document: 'lumina_public_chat_messages/{messageId}', region: REGION },
    async (event) => {
        const msg = event.data?.data();
        if (!msg) return;

        const { senderId, senderName, text } = msg;
        if (!text) return;

        // Wykryj wzmianki w treści: "@slug" lub "@Imię Nazwisko" — dopasuj do
        // znanych slugów profili obecnych w treści wiadomości.
        const mentionMatches = [...text.matchAll(/@([a-zA-Z0-9_ąćęłńóśźż]+)/gi)].map(m => m[1].toLowerCase().replace(/\s+/g, ''));
        if (!mentionMatches.length) return; // brak wzmianek — nic do wysłania

        const uniqueMentions = [...new Set(mentionMatches)].filter(m => m !== senderId);

        for (const mentionedSlug of uniqueMentions) {
            const tokens = await getTokensForUser(mentionedSlug);
            if (!tokens.length) continue;

            const result = await sendToTokens(tokens, {
                title: `📣 ${senderName || 'Ktoś'} wspomniał(a) o Tobie na czacie ogólnym`,
                body: text.slice(0, 140),
                url: `https://polskieradio.cc/lumina.html?openPublicChat=1&messageId=${event.params.messageId || ""}`,
                tag: 'lumina-mention',
            });
            logger.info(`[Push] Wzmianka @${mentionedSlug} od ${senderId}: wysłano ${result.sent}, błędy ${result.failed}`);
        }
    }
);


const { onSchedule } = require('firebase-functions/v2/scheduler');

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 3) ROZWAŻANIE „DOBRZE, ŻE JESTEŚ” — CODZIENNIE O 06:15 RANO (Europe/Warsaw)
 * ═══════════════════════════════════════════════════════════════════════
 * Wysyła powiadomienie push do wszystkich użytkowników z opcjami:
 * [📖 Czytaj] oraz [🕊️ Udostępnij].
 */
exports.scheduledMorningDevotionPush = onSchedule(
    { schedule: '15 6 * * *', timeZone: 'Europe/Warsaw', region: REGION },
    async (event) => {
        logger.info('[Push] Uruchomienie porannego pusha 06:15: Dobrze, że jesteś...');

        const todayStr = new Date().toISOString().split('T')[0];
        let title = 'Dobrze, że jesteś na nowy dzień ✨';
        let teaser = 'Rozpocznij poranek ze Słowem Bożym i napełnij serce pokojem Chrystusa.';
        let imageUrl = 'https://polskieradio.cc/lumina_icon.jpg';

        try {
            // Pobierz dzisiejsze rozważanie z Firestore
            const refSnap = await db.collection('reflections')
                .where('date', '==', todayStr)
                .limit(1)
                .get();

            if (!refSnap.empty) {
                const d = refSnap.docs[0].data();
                title = d.title || title;
                teaser = d.teaser || d.snippet || teaser;
                imageUrl = d.imageUrl || imageUrl;
            } else {
                // Fallback z web_inspirations
                const webSnap = await db.collection('web_inspirations')
                    .orderBy('date', 'desc')
                    .limit(1)
                    .get();
                if (!webSnap.empty) {
                    const wd = webSnap.docs[0].data();
                    title = wd.title || title;
                    teaser = wd.teaser || teaser;
                    imageUrl = wd.imageUrl || imageUrl;
                }
            }
        } catch(err) {
            logger.warn('[Push] Błąd pobierania rozważania:', err);
        }

        // Pobierz wszystkie aktywne tokeny urządzeń
        const tokensSnap = await db.collection('LuminaDeviceTokens')
            .where('enabled', '==', true)
            .get();

        const allTokens = new Set();
        tokensSnap.forEach(d => {
            const t = d.data().token;
            if (t) allTokens.add(t);
        });

        if (allTokens.size === 0) {
            logger.info('[Push] Brak zarejestrowanych urządzeń w LuminaDeviceTokens.');
            return;
        }

        const messagePayload = {
            notification: {
                title: `🕊️ Dobrze, że jesteś • ${title}`,
                body: teaser.length > 140 ? teaser.slice(0, 137) + '...' : teaser,
            },
            data: {
                type: 'devotion',
                devotionId: todayStr,
                title: title,
                body: teaser,
                url: 'https://polskieradio.cc/lumina-tablica.html?openDevotion=today',
                actions: JSON.stringify([
                    { action: 'read', title: '📖 Czytaj' },
                    { action: 'share', title: '🕊️ Udostępnij' }
                ])
            },
            webpush: {
                notification: {
                    icon: 'https://polskieradio.cc/lumina_icon.jpg',
                    badge: 'https://polskieradio.cc/lumina_icon.jpg',
                    image: imageUrl,
                    tag: `lumina-devotion-${todayStr}`,
                    renotify: true,
                    requireInteraction: true,
                    actions: [
                        { action: 'read', title: '📖 Czytaj' },
                        { action: 'share', title: '🕊️ Udostępnij' }
                    ]
                },
                fcmOptions: { link: 'https://polskieradio.cc/lumina-tablica.html?openDevotion=today' },
            },
            tokens: [...allTokens],
        };

        const result = await messaging.sendEachForMulticast(messagePayload);
        logger.info(`[Push 06:15] Wysłano do ${result.successCount} urządzeń, błędy: ${result.failureCount}`);
    }
);

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 4) CUDA KAŻDEGO DNIA — NATYCHMIAST PO PUBLIKACJI NA TABLICY
 * ═══════════════════════════════════════════════════════════════════════
 * Wyzwalana przy każdym nowym poście na tablicy oznaczonym jako CKD / rozważanie.
 */
exports.onCudaTablicaPostPublished = onDocumentCreated(
    { document: 'lumina_posts/{postId}', region: REGION },
    async (event) => {
        const post = event.data?.data();
        if (!post) return;

        const category = (post.category || post.type || '').toLowerCase();
        const title = post.title || post.authorName || 'Nowe Rozważanie';
        const isCkd = category.includes('ckd') || category.includes('cuda') || category.includes('rozwazanie') || category.includes('dzj') || post.isDevotion === true;

        if (!isCkd) return;

        logger.info(`[Push CKD] Wykryto nową publikację Cuda Każdego Dnia: ${title}`);

        const tokensSnap = await db.collection('LuminaDeviceTokens')
            .where('enabled', '==', true)
            .get();

        const allTokens = new Set();
        tokensSnap.forEach(d => {
            const t = d.data().token;
            if (t) allTokens.add(t);
        });

        if (allTokens.size === 0) return;

        const postId = event.params.postId;
        const text = post.content || post.text || post.teaser || 'Nowe świadectwo i rozważanie Słowa Bożego na Tablicy.';

        const messagePayload = {
            notification: {
                title: `✨ Cuda Każdego Dnia • ${title}`,
                body: text.length > 140 ? text.slice(0, 137) + '...' : text,
            },
            data: {
                type: 'ckd',
                postId: postId,
                devotionId: postId,
                title: title,
                body: text,
                url: `https://polskieradio.cc/lumina-tablica.html?openDevotion=${postId}`,
                actions: JSON.stringify([
                    { action: 'read', title: '📖 Czytaj' },
                    { action: 'share', title: '🕊️ Udostępnij' }
                ])
            },
            webpush: {
                notification: {
                    icon: 'https://polskieradio.cc/lumina_icon.jpg',
                    badge: 'https://polskieradio.cc/lumina_icon.jpg',
                    image: post.imageUrl || undefined,
                    tag: `lumina-ckd-${postId}`,
                    renotify: true,
                    requireInteraction: true,
                    actions: [
                        { action: 'read', title: '📖 Czytaj' },
                        { action: 'share', title: '🕊️ Udostępnij' }
                    ]
                },
                fcmOptions: { link: `https://polskieradio.cc/lumina-tablica.html?openDevotion=${postId}` },
            },
            tokens: [...allTokens],
        };

        const result = await messaging.sendEachForMulticast(messagePayload);
        logger.info(`[Push CKD] Wysłano ${result.successCount} powiadomień po publikacji, błędy: ${result.failureCount}`);
    }
);

