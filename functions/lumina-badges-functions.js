/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA — Silnik Przyznawania Odznak (Cloud Functions)
 * ══════════════════════════════════════════════════════════════════════════
 * ZASADA: żadna odznaka nie jest NIGDY przyznawana przez front-end. Front-end
 * tylko WYŚWIETLA to, co znajdzie w lumina_user_badges — dokument tam może
 * powstać wyłącznie stąd. To bezpośrednia odpowiedź na powtarzający się
 * problem "fałszywych danych wyglądających na prawdziwe" znaleziony wcześniej
 * w portalu (matchScore, liczniki polubień) — odznaki mają być odwrotnością
 * tego wzorca: zawsze zweryfikowane, nigdy zmyślone.
 *
 * npm install firebase-admin firebase-functions (już są w projekcie)
 */

const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');

if (!getApps().length) initializeApp();
const db = getFirestore();
const REGION = 'europe-west1';

const FOUNDER_CUTOFF_COUNT = 100; // pierwsze 100 zarejestrowanych kont
const STREAK_THRESHOLDS = {
    faithful_voice: { field: 'loginStreak', days: 30 },
    morning_warrior: { field: 'devotionStreak', days: 7 },
    word_disciple: { field: 'devotionStreak', days: 30 },
    ckd_reader: { field: 'ckdStreak', days: 14 },
};

/**
 * Przyznaje odznakę, jeśli użytkownik jeszcze jej nie ma. Bezpieczne przy
 * wielokrotnym wywołaniu — nigdy nie duplikuje.
 */
async function awardBadgeIfNew(uid, badgeId) {
    const docId = `${uid}_${badgeId}`;
    const ref = db.doc(`lumina_user_badges/${docId}`);
    const existing = await ref.get();
    if (existing.exists) return false;

    await ref.set({ uid, badgeId, awardedAt: FieldValue.serverTimestamp() });
    logger.info(`[Odznaki] 🏅 ${badgeId} → ${uid}`);
    return true;
}

/**
 * -----------------------------------------------------------------------
 * 1) FUNDATOR — pierwsze 100 kont. Sprawdzane przy każdej nowej rejestracji
 *    przez policzenie ile kont istniało PRZED tym (kolejność po createdAt).
 * -----------------------------------------------------------------------
 */
exports.onProfileCreatedCheckFounderBadge = onDocumentCreated(
    { document: 'lumina_profiles/{uid}', region: REGION },
    async (event) => {
        const uid = event.params.uid;
        try {
            const countSnap = await db.collection('lumina_profiles').count().get();
            const total = countSnap.data().count;
            if (total <= FOUNDER_CUTOFF_COUNT) {
                await awardBadgeIfNew(uid, 'founder');
            }
        } catch (err) {
            logger.error('[Odznaki] Błąd sprawdzania Fundatora:', err.message);
        }
    }
);

/**
 * -----------------------------------------------------------------------
 * 2) PIERWSZY KROK — pierwszy post na tablicy danego autora.
 * -----------------------------------------------------------------------
 */
exports.onPostCreatedCheckFirstStepBadge = onDocumentCreated(
    { document: 'lumina_posts/{postId}', region: REGION },
    async (event) => {
        const post = event.data?.data();
        const authorSlug = post?.authorSlug;
        if (!authorSlug) return;

        try {
            const postsSnap = await db.collection('lumina_posts')
                .where('authorSlug', '==', authorSlug)
                .count().get();
            if (postsSnap.data().count === 1) {
                await awardBadgeIfNew(authorSlug, 'first_step');
            }
        } catch (err) {
            logger.error('[Odznaki] Błąd sprawdzania Pierwszego Kroku:', err.message);
        }
    }
);

/**
 * -----------------------------------------------------------------------
 * 3) BUDOWNICZY MOSTÓW — próg 10 obserwujących. Wyzwalane przy każdej
 *    nowej relacji obserwowania (lumina_likes, type:'follow').
 * -----------------------------------------------------------------------
 */
exports.onFollowCreatedCheckBridgeBuilderBadge = onDocumentCreated(
    { document: 'lumina_likes/{likeId}', region: REGION },
    async (event) => {
        const data = event.data?.data();
        if (!data || data.type !== 'follow') return;

        const targetUid = data.to;
        if (!targetUid) return;

        try {
            const followersSnap = await db.collection('lumina_likes')
                .where('to', '==', targetUid)
                .where('type', '==', 'follow')
                .count().get();
            if (followersSnap.data().count >= 10) {
                await awardBadgeIfNew(targetUid, 'bridge_builder');
            }
        } catch (err) {
            logger.error('[Odznaki] Błąd sprawdzania Budowniczego Mostów:', err.message);
        }
    }
);

/**
 * -----------------------------------------------------------------------
 * 4) AMBASADOR — próg 5 realnie zarejestrowanych udostępnień
 *    (lumina_share_events, zapisywane dopiero po tym, jak naprawiono
 *    wcześniej w 100% bezstanowy system udostępniania).
 * -----------------------------------------------------------------------
 */
exports.onShareCreatedCheckAmbassadorBadge = onDocumentCreated(
    { document: 'lumina_share_events/{eventId}', region: REGION },
    async (event) => {
        const data = event.data?.data();
        const uid = data?.uid;
        if (!uid) return;

        try {
            const sharesSnap = await db.collection('lumina_share_events')
                .where('uid', '==', uid)
                .count().get();
            if (sharesSnap.data().count >= 5) {
                await awardBadgeIfNew(uid, 'ambassador');
            }
        } catch (err) {
            logger.error('[Odznaki] Błąd sprawdzania Ambasadora:', err.message);
        }
    }
);

/**
 * -----------------------------------------------------------------------
 * 5) ODZNAKI OPARTE O PASSY (streaki) I "ROK W RODZINIE" — sprawdzane
 *    raz dziennie dla wszystkich, bo są kumulatywne, nie zdarzeniowe.
 * -----------------------------------------------------------------------
 */
exports.scheduledDailyBadgeCheck = onSchedule(
    { schedule: '30 6 * * *', timeZone: 'Europe/Warsaw', region: REGION, timeoutSeconds: 300 },
    async () => {
        logger.info('[Odznaki] Codzienne sprawdzenie passów i rocznic...');
        let awarded = 0;

        // --- Passy (streaki) ---
        const streaksSnap = await db.collection('lumina_activity_streaks').get();
        for (const streakDoc of streaksSnap.docs) {
            const data = streakDoc.data();
            const uid = data.uid || streakDoc.id;
            for (const [badgeId, cfg] of Object.entries(STREAK_THRESHOLDS)) {
                if ((data[cfg.field] || 0) >= cfg.days) {
                    const got = await awardBadgeIfNew(uid, badgeId);
                    if (got) awarded++;
                }
            }
        }

        // --- Rok w Rodzinie (na podstawie daty rejestracji profilu) ---
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const profilesSnap = await db.collection('lumina_profiles')
            .where('createdAt', '<=', oneYearAgo)
            .get();
        for (const profileDoc of profilesSnap.docs) {
            const got = await awardBadgeIfNew(profileDoc.id, 'one_year');
            if (got) awarded++;
        }

        logger.info(`[Odznaki] Zakończono — przyznano ${awarded} nowych odznak.`);
    }
);
