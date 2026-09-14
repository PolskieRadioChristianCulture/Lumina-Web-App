const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FIREBASE_LOOKUP_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup';
// Least-privilege OAuth scopes: delivery through FCM and read-only event/token lookup.
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/firebase.messaging',
  'https://www.googleapis.com/auth/datastore'
].join(' ');
const MAX_TOKENS_PER_RECIPIENT = 10;
const PUBLIC_ORIGIN = 'https://polskieradio.cc';

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extraHeaders } });
}

function corsHeaders(origin, env) {
  return origin === env.ALLOWED_ORIGIN
    ? { 'access-control-allow-origin': origin, 'vary': 'origin' }
    : {};
}

function base64UrlEncode(value) {
  const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function pemToArrayBuffer(pem) {
  const normalized = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return bytes.buffer;
}

async function signJwt(payload, serviceAccount) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${header}.${claims}`;
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function getGoogleAccessToken(env) {
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch {
    throw new Error('Brak poprawnego sekretu konta usługi Google.');
  }
  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('Sekret konta usługi nie zawiera wymaganych pól.');
  }
  const now = Math.floor(Date.now() / 1000);
  const assertion = await signJwt({
    iss: serviceAccount.client_email,
    scope: GOOGLE_SCOPES,
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600
  }, serviceAccount);
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  if (!response.ok) throw new Error('Google odrzucił autoryzację konta usługi.');
  const result = await response.json();
  if (!result.access_token) throw new Error('Google nie zwrócił tokenu dostępu.');
  return result.access_token;
}

async function verifyFirebaseUser(request, env) {
  const authorization = request.headers.get('authorization') || '';
  const idToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!idToken || !env.FIREBASE_WEB_API_KEY) return null;
  const response = await fetch(`${FIREBASE_LOOKUP_URL}?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ idToken })
  });
  if (!response.ok) return null;
  const result = await response.json();
  return result.users?.[0]?.localId || null;
}

function decodeFirestoreValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeFirestoreValue);
  if ('mapValue' in value) return decodeFirestoreFields(value.mapValue.fields || {});
  return null;
}

function decodeFirestoreFields(fields) {
  return Object.fromEntries(Object.entries(fields || {}).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

function firestoreBaseUrl(env) {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/databases/(default)/documents`;
}

function notificationAssetUrl(value, fallback) {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    const url = new URL(value, PUBLIC_ORIGIN);
    if (url.protocol !== 'https:') return fallback;
    return url.href;
  } catch {
    return fallback;
  }
}

async function getFirestoreDocument(path, accessToken, env) {
  const response = await fetch(`${firestoreBaseUrl(env)}/${path}`, { headers: { authorization: `Bearer ${accessToken}` } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Nie udało się odczytać dokumentu Firestore.');
  const document = await response.json();
  return decodeFirestoreFields(document.fields);
}

async function queryTokens(field, receiverId, accessToken, env) {
  const response = await fetch(`${firestoreBaseUrl(env)}:runQuery`, {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}`, ...JSON_HEADERS },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'LuminaDeviceTokens' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              { fieldFilter: { field: { fieldPath: 'enabled' }, op: 'EQUAL', value: { booleanValue: true } } },
              { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: receiverId } } }
            ]
          }
        },
        limit: MAX_TOKENS_PER_RECIPIENT
      }
    })
  });
  if (!response.ok) throw new Error('Nie udało się pobrać tokenów urządzeń.');
  const rows = await response.json();
  return rows
    .filter((row) => row.document?.fields)
    .map((row) => decodeFirestoreFields(row.document.fields).token)
    .filter(Boolean);
}

async function getRecipientTokens(receiverId, accessToken, env) {
  // Każda wysyłka nie powinna rozpoczynać się od trzech zapytań indeksowych.
  // Token jest synchronizowany także z profilem, więc ten pojedynczy odczyt
  // zapewnia zwykłą ścieżkę dostarczenia i chroni limit Firestore.
  const profile = await getFirestoreDocument(`lumina_profiles/${encodeURIComponent(receiverId)}`, accessToken, env);
  if (profile?.fcmToken) return [profile.fcmToken];

  // Starsze konta mogą nie mieć jeszcze tokenu w profilu. Wtedy zachowujemy
  // zgodność z rejestrem wielu urządzeń jako ścieżkę zapasową.
  const fields = ['uid', 'slug', 'userSlug'];
  const tokenLists = await Promise.all(fields.map((field) => queryTokens(field, receiverId, accessToken, env)));
  const tokens = new Set(tokenLists.flat());
  return [...tokens].slice(0, MAX_TOKENS_PER_RECIPIENT);
}

function notificationFor(kind, documentId, record) {
  const isRequest = kind === 'request';
  const senderName = String(record.senderName || 'Członek społeczności LUMINA').slice(0, 80);
  const body = isRequest
    ? String(record.previewText || 'Otwórz prośbę o rozmowę.').slice(0, 140)
    : (record.imageUrl ? 'Przesłał(a) zdjęcie w wiadomości prywatnej' : String(record.text || 'Nowa wiadomość').slice(0, 140));
  const icon = notificationAssetUrl(record.senderAvatar, `${PUBLIC_ORIGIN}/lumina-notif-icon-v2.png`);
  return {
    title: isRequest ? `💌 ${senderName} chce rozpocząć rozmowę` : `💬 ${senderName}`,
    body,
    senderName,
    type: isRequest ? 'direct_message_request' : 'direct_message',
    tag: isRequest ? `lumina-request-${record.senderId}` : `lumina-dm-${record.senderId}`,
    url: isRequest
      ? 'https://polskieradio.cc/lumina.html?openMessages=private'
      : `https://polskieradio.cc/lumina.html?openChat=${encodeURIComponent(record.senderId || '')}&messageId=${encodeURIComponent(documentId)}`,
    icon,
    senderId: String(record.senderId || ''),
    documentId
  };
}

async function sendFcm(token, notification, accessToken, env) {
  const data = {
    title: notification.title,
    body: notification.body,
    type: notification.type,
    tag: notification.tag,
    url: notification.url,
    icon: notification.icon,
    avatar: notification.icon,
    senderName: notification.senderName || '',
    senderId: notification.senderId,
    messageId: notification.type === 'direct_message' ? notification.documentId : '',
    requestId: notification.type === 'direct_message_request' ? notification.documentId : ''
  };
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/messages:send`, {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}`, ...JSON_HEADERS },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: notification.title, body: notification.body },
        data,
        webpush: {
          headers: { Urgency: 'high' },
          notification: {
            title: notification.title,
            body: notification.body,
            icon: notification.icon,
            badge: `${PUBLIC_ORIGIN}/lumina-push-badge-v4.1.5.svg`,
            tag: notification.tag,
            renotify: true,
            requireInteraction: true,
            actions: [
              { action: 'reply', title: '💬 Odpowiedz' },
              { action: 'open', title: 'Otwórz Czat' }
            ]
          },
          fcm_options: { link: notification.url }
        }
      }
    })
  });
  return response.ok;
}

async function handlePush(request, env, kind, documentId) {
  if (!/^[A-Za-z0-9_-]{1,200}$/.test(documentId)) return { status: 400, body: { error: 'Nieprawidłowy identyfikator.' } };
  const authenticatedUid = await verifyFirebaseUser(request, env);
  if (!authenticatedUid) return { status: 401, body: { error: 'Wymagane jest prawidłowe logowanie.' } };
  const accessToken = await getGoogleAccessToken(env);
  const collection = kind === 'request' ? 'lumina_message_requests' : 'lumina_direct_messages';
  const record = await getFirestoreDocument(`${collection}/${encodeURIComponent(documentId)}`, accessToken, env);
  if (!record || record.senderAuthUid !== authenticatedUid || record.senderAuthUid === record.receiverAuthUid) {
    return { status: 403, body: { error: 'Brak uprawnienia do powiadomienia.' } };
  }
  if (!Array.isArray(record.participants) || !record.participants.includes(record.senderAuthUid) || !record.participants.includes(record.receiverAuthUid)) {
    return { status: 403, body: { error: 'Nieprawidłowa rozmowa.' } };
  }
  if (kind === 'request' && record.status !== 'pending') return { status: 409, body: { error: 'Prośba nie jest aktywna.' } };
  const tokens = await getRecipientTokens(record.receiverId, accessToken, env);
  if (tokens.length === 0) return { status: 200, body: { delivered: 0, reason: 'no_active_device' } };
  const notification = notificationFor(kind, documentId, record);
  const results = await Promise.all(tokens.map((token) => sendFcm(token, notification, accessToken, env)));
  return { status: 200, body: { delivered: results.filter(Boolean).length, attempted: tokens.length } };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin') || '';
    const cors = corsHeaders(origin, env);
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: origin === env.ALLOWED_ORIGIN ? 204 : 403,
        headers: { ...cors, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'authorization, content-type', 'access-control-max-age': '86400' }
      });
    }
    if (origin !== env.ALLOWED_ORIGIN) return json({ error: 'Niedozwolone źródło.' }, 403);
    if (request.method !== 'POST') return json({ error: 'Tylko POST.' }, 405, cors);
    const match = new URL(request.url).pathname.match(/^\/v1\/push\/(request|direct)\/([A-Za-z0-9_-]{1,200})$/);
    if (!match) return json({ error: 'Nieznana trasa.' }, 404, cors);
    try {
      const result = await handlePush(request, env, match[1], match[2]);
      console.log(JSON.stringify({ event: 'lumina_push', kind: match[1], id: match[2], status: result.status, delivered: result.body.delivered || 0 }));
      return json(result.body, result.status, cors);
    } catch (error) {
      console.error(JSON.stringify({ event: 'lumina_push_error', error: error instanceof Error ? error.message : String(error) }));
      return json({ error: 'Nie udało się wysłać powiadomienia.' }, 502, cors);
    }
  }
};
