/**
 * LUMINA Christian Culture — Firebase Cloud Functions
 */

const chatPush = require('./lumina-chat-push-functions.js');

exports.onDirectMessageCreated = chatPush.onDirectMessageCreated;
exports.onPublicChatMessageCreated = chatPush.onPublicChatMessageCreated;

try {
    const photoVerif = require('./lumina-photo-verification-functions.js');
    if (photoVerif) {
        Object.assign(exports, photoVerif);
    }
} catch(e) {
    console.warn('Photo verification module load notice:', e.message);
}

exports.scheduledMorningDevotionPush = chatPush.scheduledMorningDevotionPush;
exports.onCudaTablicaPostPublished = chatPush.onCudaTablicaPostPublished;

// ════════════════════════════════════════════════════════════════
// Cuda Każdego Dnia — automatyczna synchronizacja z chmury Google
// ════════════════════════════════════════════════════════════════
try {
    const cudaSync = require('./lumina-cuda-sync-function.js');
    if (cudaSync && cudaSync.scheduledCudaKazdegoDniaSync) {
        exports.scheduledCudaKazdegoDniaSync = cudaSync.scheduledCudaKazdegoDniaSync;
    }
} catch(e) {
    console.warn('Cuda sync module load notice:', e.message);
}
