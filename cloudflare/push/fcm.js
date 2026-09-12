// Server-only transport. No Cloud Functions or Firebase Admin runtime required.
const PROJECT = 'lumina-cc';
const ORIGIN = 'https://polskieradio.cc';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const encoder = new TextEncoder();

function base64url(bytes) {
    return btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function encodeJson(value) {
    return base64url(encoder.encode(JSON.stringify(value)));
}

export function notificationMessage(token, event) {
    if (typeof token !== 'string' || !token || token.length > 4096) throw new Error('Invalid device token');
    if (!event || typeof event.id !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(event.id)) throw new Error('Invalid event ID');
    const allowedTypes = ['direct_message', 'mention', 'public_chat', 'new_post', 'new_profile', 'devotion', 'ckd', 'live', 'system', 'test'];
    if (!allowedTypes.includes(event.type)) throw new Error('Invalid notification type');
    const url = new URL(event.url || '/lumina', ORIGIN);
    if (url.origin !== ORIGIN || url.username || url.password) throw new Error('Invalid notification destination');
    const title = String(event.title || 'LUMINA').slice(0, 100);
    const body = String(event.body || 'Masz nowe powiadomienie.').slice(0, 200);
    const data = { type: event.type, eventId: event.id, title, body, url: url.href };
    // Only validated, server-resolved routing metadata; never accept arbitrary client data.
    for (const field of ['senderId', 'messageId', 'postId', 'slug']) {
        if (event[field] !== undefined) {
            if (typeof event[field] !== 'string' || event[field].length > 160) throw new Error('Invalid routing metadata');
            data[field] = event[field];
        }
    }
    return {
        token,
        notification: { title, body },
        data,
        webpush: {
            headers: { Urgency: 'high', TTL: '86400' },
            notification: {
                title, body,
                icon: `${ORIGIN}/lumina-icon-512.png`,
                badge: `${ORIGIN}/lumina-icon-192.png`,
                // A retry replaces the same Android tray entry, rather than adding another.
                tag: `lumina-${event.type}-${event.id}`,
                renotify: false,
            },
            fcm_options: { link: url.href },
        },
    };
}

export function classifyFailure(status, response, retryAfter, now = Date.now()) {
    const detail = response?.error?.details?.find(item => item['@type'] === 'type.googleapis.com/google.firebase.fcm.v1.FcmError');
    const code = detail?.errorCode || response?.error?.status || `HTTP_${status}`;
    // INVALID_ARGUMENT can be a bad payload: it must NEVER delete a valid subscription.
    const removeToken = code === 'UNREGISTERED';
    const retry = !removeToken && (status === 429 || status >= 500);
    let delaySeconds = status === 429 ? 60 : 10;
    if (retryAfter) {
        const seconds = /^\d+$/.test(retryAfter) ? Number(retryAfter) : (Date.parse(retryAfter) - now) / 1000;
        if (Number.isFinite(seconds)) delaySeconds = Math.max(delaySeconds, Math.ceil(seconds));
    }
    return { accepted: false, retry, removeToken, code, delaySeconds };
}

// Create per queue batch/request, not a global mutable authentication singleton.
export function createFcmSender(serviceAccountJson, fetcher = fetch) {
    let account;
    try { account = JSON.parse(serviceAccountJson); } catch { throw new Error('Missing or invalid FCM service-account secret'); }
    if (account.project_id !== PROJECT || typeof account.client_email !== 'string'
        || !account.client_email.endsWith(`@${PROJECT}.iam.gserviceaccount.com`)
        || typeof account.private_key !== 'string') throw new Error('Invalid FCM service account');
    let accessToken;
    let expiresAt = 0;

    async function getAccessToken() {
        if (accessToken && Date.now() < expiresAt - 60000) return accessToken;
        const pem = account.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
        const bytes = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
        const key = await crypto.subtle.importKey('pkcs8', bytes, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
        const now = Math.floor(Date.now() / 1000);
        const unsigned = `${encodeJson({ alg: 'RS256', typ: 'JWT' })}.${encodeJson({
            iss: account.client_email,
            scope: 'https://www.googleapis.com/auth/firebase.messaging',
            aud: TOKEN_URL, iat: now, exp: now + 3600,
        })}`;
        const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(unsigned));
        const response = await fetcher(TOKEN_URL, {
            method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${base64url(new Uint8Array(signature))}` }),
        });
        const result = await response.json();
        if (!response.ok || typeof result.access_token !== 'string' || !result.access_token) {
            throw new Error(`FCM authorization failed (HTTP ${response.status})`);
        }
        accessToken = result.access_token;
        expiresAt = Date.now() + Math.min(Number(result.expires_in) || 3600, 3600) * 1000;
        return accessToken;
    }

    return {
        async send(token, event, { validateOnly = false } = {}) {
            const message = notificationMessage(token, event);
            const body = JSON.stringify({ message, validate_only: validateOnly });
            if (encoder.encode(JSON.stringify({ ...message, token: undefined })).length > 4000) throw new Error('Notification too large');
            const credential = await getAccessToken();
            let response;
            try {
                response = await fetcher(`https://fcm.googleapis.com/v1/projects/${PROJECT}/messages:send`, {
                    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
                    headers: { Authorization: `Bearer ${credential}`, 'Content-Type': 'application/json' }, body,
                });
            } catch {
                return { accepted: false, retry: true, removeToken: false, code: 'NETWORK_ERROR', delaySeconds: 10 };
            }
            const result = await response.json().catch(() => ({}));
            if (!response.ok) return classifyFailure(response.status, result, response.headers.get('Retry-After'));
            // FCM acceptance is not evidence of delivery to an Android lock screen.
            if (!result.name) return { accepted: false, retry: true, removeToken: false, code: 'INVALID_RESPONSE', delaySeconds: 10 };
            return { accepted: true, messageName: result.name, validateOnly };
        },
    };
}
