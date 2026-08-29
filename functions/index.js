/**
 * LUMINA Christian Culture — Firebase Cloud Functions
 */

const chatPush = require('./lumina-chat-push-functions.js');

exports.onDirectMessageCreated = chatPush.onDirectMessageCreated;
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

