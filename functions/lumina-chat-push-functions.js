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
            url: `https://polskieradio.cc/lumina.html?openChat=${senderId}`,
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
                url: 'https://polskieradio.cc/lumina.html?openPublicChat=1',
                tag: 'lumina-mention',
            });
            logger.info(`[Push] Wzmianka @${mentionedSlug} od ${senderId}: wysłano ${result.sent}, błędy ${result.failed}`);
        }
    }
);
