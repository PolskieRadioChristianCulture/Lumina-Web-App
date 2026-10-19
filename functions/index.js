/**
 * LUMINA Christian Culture — Firebase Cloud Functions
 */

const chatPush = require('./lumina-chat-push-functions.js');

exports.onDirectMessageCreated = chatPush.onDirectMessageCreated;
exports.onMessageRequestCreated = chatPush.onMessageRequestCreated;
exports.onPublicChatMessageCreated = chatPush.onPublicChatMessageCreated;
exports.onLuminaProfileCreated = chatPush.onLuminaProfileCreated;
exports.onLuminaPostCreated = chatPush.onLuminaPostCreated;
exports.onCudaTablicaPostPublished = chatPush.onLuminaPostCreated; // Alias kompatybilności wstecznej
exports.scheduledMorningDevotionPush = chatPush.scheduledMorningDevotionPush;

try {
    const photoVerif = require('./lumina-photo-verification-functions.js');
    if (photoVerif) {
        Object.assign(exports, photoVerif);
    }
} catch(e) {
    console.warn('Photo verification module load notice:', e.message);
}

const ckdSync = require('./lumina-ckd-sync-function.js');
exports.scheduledCudaKazdegoDniaSync = ckdSync.scheduledCudaKazdegoDniaSync;
exports.triggerCudaKazdegoDniaSyncNow = ckdSync.triggerCudaKazdegoDniaSyncNow;

const badges = require('./lumina-badges-functions.js');
exports.onProfileCreatedCheckFounderBadge = badges.onProfileCreatedCheckFounderBadge;
exports.onPostCreatedCheckFirstStepBadge = badges.onPostCreatedCheckFirstStepBadge;
exports.onFollowCreatedCheckBridgeBuilderBadge = badges.onFollowCreatedCheckBridgeBuilderBadge;
exports.onShareCreatedCheckAmbassadorBadge = badges.onShareCreatedCheckAmbassadorBadge;
exports.scheduledDailyBadgeCheck = badges.scheduledDailyBadgeCheck;

// Telemetria: celowo NIE eksportowana (decyzja ZERO COST 2026-10-18 — brak 4. zadania Cloud Scheduler).
// Agregacja działa po stronie klienta Master Admina (lumina-db.js). Moduł zachowany jako opcja na przyszłość.
// const telemetry = require('./lumina-telemetry-functions.js');
// exports.onProfileCreatedUpdateTelemetry = telemetry.onProfileCreatedUpdateTelemetry;
// exports.scheduledDailyTelemetryRollover = telemetry.scheduledDailyTelemetryRollover;

