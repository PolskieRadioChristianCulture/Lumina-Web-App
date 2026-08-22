/**
 * ============================================================================
 * LUMINA — Wymóg prawdziwego zdjęcia profilowego (Cloud Functions, Node.js)
 * ============================================================================
 * npm install firebase-functions firebase-admin @google-cloud/vision
 *
 * Zasada działania:
 *   - Kiedy ktoś ustawia/zmienia zdjęcie profilowe (pole `avatar` w
 *     lumina_profiles/{uid}), ta funkcja sprawdza przez Google Cloud Vision,
 *     czy na zdjęciu jest ludzka twarz.
 *   - Jeśli TAK → zdjęcie zostaje, photoVerified = true.
 *   - Jeśli NIE → oryginalne zdjęcie NIE jest kasowane (trafia do
 *     `avatarPendingReview`, do wglądu/apelacji), a pole `avatar`, które
 *     czyta KAŻDA strona portalu (czat, tablica, karuzela, profil), zostaje
 *     nadpisane logiem LUMINA. Użytkownik od razu widzi logo zamiast swojej
 *     grafiki wszędzie, bez potrzeby zmiany choćby jednej linii w plikach
 *     HTML — bo wszystkie już i tak czytają pole `avatar`.
 *
 * WYMAGANE PRZED WDROŻENIEM:
 *   1. Włącz Cloud Vision API w projekcie GCP (wymaga aktywnego billingu —
 *      Vision ma darmowy limit 1000 sprawdzeń/miesiąc, potem ok. 1,50 USD/1000).
 *      https://console.cloud.google.com/apis/library/vision.googleapis.com
 *   2. firebase deploy --only functions:onProfileAvatarChanged,functions:backfillPhotoVerificationOnce,functions:adminOverridePhotoVerification
 * ============================================================================
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { logger } = require('firebase-functions');
const vision = require('@google-cloud/vision');

initializeApp();
const db = getFirestore();
const visionClient = new vision.ImageAnnotatorClient();

const REGION = 'europe-west1';

// Zmień, jeśli wolisz inny plik — wszystkie trzy już istnieją w repo.
const LUMINA_LOGO_FILENAME = 'lumina_logo.jpg';

// Ten sam sekret, którego już używa @ICC Hub (logHandoff) — chroni panel admina.
const ICC_SHARED_SECRET = defineSecret('ICC_SHARED_SECRET');

const MIN_FACE_CONFIDENCE = 0.5; // Vision zwraca "detectionConfidence" 0–1

/**
 * Sprawdza jeden URL zdjęcia przez Vision API. Zwraca { hasFace, confidence }.
 */
async function checkHasRealFace(imageUrl) {
    try {
        const [result] = await visionClient.faceDetection(imageUrl);
        const faces = result.faceAnnotations || [];
        if (!faces.length) return { hasFace: false, confidence: 0 };
        const best = faces.reduce((a, b) => (a.detectionConfidence > b.detectionConfidence ? a : b));
        return { hasFace: best.detectionConfidence >= MIN_FACE_CONFIDENCE, confidence: best.detectionConfidence };
    } catch (err) {
        logger.error('[FotoWeryfikacja] Błąd Vision API dla', imageUrl, err.message);
        // W razie awarii Vision API NIE karzemy użytkownika za błąd infrastruktury —
        // zostawiamy zdjęcie jak jest i oznaczamy do ręcznego przeglądu.
        return { hasFace: true, confidence: -1, error: true };
    }
}

/**
 * -----------------------------------------------------------------------
 * 1) Trigger: reaguje na KAŻDĄ zmianę profilu, sprawdza avatar tylko gdy
 *    faktycznie się zmienił (żeby nie odpytywać Vision API przy każdej
 *    literce w bio).
 * -----------------------------------------------------------------------
 */
exports.onProfileAvatarChanged = onDocumentWritten(
    { document: 'lumina_profiles/{uid}', region: REGION },
    async (event) => {
        const before = event.data?.before?.data();
        const after = event.data?.after?.data();
        if (!after) return; // dokument usunięty

        const newAvatar = after.avatar;
        const oldAvatar = before?.avatar;
        if (!newAvatar || newAvatar === oldAvatar) return; // brak realnej zmiany

        // Zabezpieczenie przed pętlą: to MY właśnie ustawiliśmy logo w poprzednim
        // przebiegu tej samej funkcji — nie sprawdzaj loga przez Vision ponownie.
        if (newAvatar === LUMINA_LOGO_FILENAME || newAvatar.endsWith('/' + LUMINA_LOGO_FILENAME)) {
            return;
        }

        const { hasFace, confidence, error } = await checkHasRealFace(newAvatar);

        if (hasFace) {
            await event.data.after.ref.set({
                photoVerified: true,
                photoCheckedAt: FieldValue.serverTimestamp(),
                photoCheckConfidence: confidence,
                avatarPendingReview: FieldValue.delete(),
            }, { merge: true });
            logger.info(`[FotoWeryfikacja] OK (${(confidence*100).toFixed(0)}%) — ${event.params.uid}`);
        } else {
            await event.data.after.ref.set({
                avatar: LUMINA_LOGO_FILENAME,
                avatarPendingReview: newAvatar,      // oryginał zachowany, nic nie ginie
                photoVerified: false,
                photoFlaggedAt: FieldValue.serverTimestamp(),
                photoCheckError: error || false,
            }, { merge: true });
            logger.warn(`[FotoWeryfikacja] BRAK TWARZY — podmieniono na logo — ${event.params.uid}`);
        }
    }
);

/**
 * -----------------------------------------------------------------------
 * 2) Jednorazowy skrót przez WSZYSTKIE istniejące profile — realizuje
 *    "wdróż na wszystkich profilach, które mają inną grafikę niż zdjęcie".
 *    Wywołaj RAZ po wdrożeniu, potem funkcja z pkt. 1 pilnuje na bieżąco.
 * -----------------------------------------------------------------------
 *    curl -X POST https://europe-west1-<project>.cloudfunctions.net/backfillPhotoVerificationOnce \
 *      -H "Authorization: Bearer $ICC_SHARED_SECRET"
 * -----------------------------------------------------------------------
 */
exports.backfillPhotoVerificationOnce = onRequest(
    { region: REGION, secrets: [ICC_SHARED_SECRET], timeoutSeconds: 540 },
    async (req, res) => {
        const token = (req.get('Authorization') || '').replace(/^Bearer\s+/i, '');
        if (token !== ICC_SHARED_SECRET.value()) return res.status(401).send('Nieautoryzowany');

        const snap = await db.collection('lumina_profiles').get();
        let checked = 0, flagged = 0, verified = 0, skipped = 0;

        for (const doc of snap.docs) {
            const data = doc.data();
            const avatar = data.avatar;
            if (!avatar || avatar === LUMINA_LOGO_FILENAME || avatar === 'lumina_icon.jpg' || avatar === 'icon.png') {
                skipped++; // brak zdjęcia — to inny, już istniejący mechanizm (domyślna ikonka)
                continue;
            }
            if (data.photoVerified === true) { skipped++; continue; } // już zweryfikowane wcześniej

            checked++;
            const { hasFace, confidence, error } = await checkHasRealFace(avatar);

            if (hasFace) {
                await doc.ref.set({ photoVerified: true, photoCheckedAt: FieldValue.serverTimestamp(), photoCheckConfidence: confidence }, { merge: true });
                verified++;
            } else {
                await doc.ref.set({
                    avatar: LUMINA_LOGO_FILENAME,
                    avatarPendingReview: avatar,
                    photoVerified: false,
                    photoFlaggedAt: FieldValue.serverTimestamp(),
                    photoCheckError: error || false,
                }, { merge: true });
                flagged++;
            }
        }

        const summary = { totalProfiles: snap.size, checked, verified, flagged, skipped };
        logger.info('[FotoWeryfikacja] Backfill zakończony:', summary);
        res.status(200).json(summary);
    }
);

/**
 * -----------------------------------------------------------------------
 * 3) Ręczna korekta administracyjna — Vision API nie jest nieomylne
 *    (np. zdjęcie z boku, w masce, zwierzę zamiast człowieka na czacie
 *    rodzinnym). Ten endpoint pozwala Tobie (adminowi) ręcznie wymusić
 *    werdykt w dowolną stronę z panelu lumina-admin-profile-suite.js.
 * -----------------------------------------------------------------------
 *    POST body: { uid: "...", decision: "approve" | "reject" }
 * -----------------------------------------------------------------------
 */
exports.adminOverridePhotoVerification = onRequest(
    { region: REGION, secrets: [ICC_SHARED_SECRET] },
    async (req, res) => {
        const token = (req.get('Authorization') || '').replace(/^Bearer\s+/i, '');
        if (token !== ICC_SHARED_SECRET.value()) return res.status(401).send('Nieautoryzowany');

        const { uid, decision } = req.body || {};
        if (!uid || !['approve', 'reject'].includes(decision)) {
            return res.status(400).send('Wymagane: uid, decision ("approve" albo "reject")');
        }

        const ref = db.doc(`lumina_profiles/${uid}`);
        const snap = await ref.get();
        if (!snap.exists) return res.status(404).send('Nie znaleziono profilu');
        const data = snap.data();

        if (decision === 'approve') {
            // Przywróć oryginalne zdjęcie użytkownika i oznacz jako zweryfikowane ręcznie.
            await ref.set({
                avatar: data.avatarPendingReview || data.avatar,
                photoVerified: true,
                photoVerifiedManually: true,
                avatarPendingReview: FieldValue.delete(),
            }, { merge: true });
        } else {
            await ref.set({
                avatar: LUMINA_LOGO_FILENAME,
                avatarPendingReview: data.avatarPendingReview || data.avatar,
                photoVerified: false,
                photoVerifiedManually: true,
            }, { merge: true });
        }

        res.status(200).json({ ok: true, uid, decision });
    }
);
