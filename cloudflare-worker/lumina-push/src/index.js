import { firestoreCourseStore, kvCourseStore, latestCourseLesson, publishedCourseLessons, courseSubscriptionAction, courseSubscriptionFailure, dispatchCourseLesson, courseAccountState } from './course-subscriptions.js';
import { ownerPushTest } from './owner-push-test.js';
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

async function getGoogleAccessToken(env, courseAccountLookup = false) {
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
    scope: GOOGLE_SCOPES + (courseAccountLookup ? ' https://www.googleapis.com/auth/identitytoolkit' : ''),
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

async function verifyFirebaseUser(request, env, registeredOnly = false) {
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
  if (registeredOnly && !result.users?.[0]?.email && !result.users?.[0]?.providerUserInfo?.length) return null;
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
  if (!response.ok) {
    const error = new Error('Nie udało się pobrać tokenów urządzeń.');
    error.providerStatus = response.status;
    throw error;
  }
  const rows = await response.json();
  return rows
    .filter((row) => row.document?.fields)
    .map((row) => decodeFirestoreFields(row.document.fields).token)
    .filter(Boolean);
}

export async function getRecipientTokens(receiverAuthUid, receiverId, accessToken, env) {
  // The authenticated recipient UID is authoritative. Never route by an
  // unchecked slug or prefer a stale public token over current private devices.
  const active = await queryTokens('uid', receiverAuthUid, accessToken, env);
  if (active.length) return [...new Set(active)].slice(0, MAX_TOKENS_PER_RECIPIENT);
  // Read-only legacy fallback, only after proving profile ownership. No data
  // migration or deletion is performed here.
  if (typeof receiverId !== 'string' || !receiverId || receiverId.includes('/')) return [];
  const profile = await getFirestoreDocument(`lumina_profiles/${encodeURIComponent(receiverId)}`, accessToken, env);
  if (profile?.uid !== receiverAuthUid) return [];
  return typeof profile.fcmToken === 'string' && profile.fcmToken ? [profile.fcmToken] : [];
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

async function sendFcm(token, notification, accessToken, env, signal) {
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
    ...(signal ? {signal} : {}),
    headers: { authorization: `Bearer ${accessToken}`, ...JSON_HEADERS },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: notification.title, body: notification.body },
        data,
        webpush: {
          headers: { Urgency: notification.type === 'daily_course_lesson' ? 'normal' : 'high', ...(notification.type === 'owner_push_test' ? {TTL:'300'} : {}) },
          notification: {
            title: notification.title,
            body: notification.body,
            icon: notification.icon,
            badge: `${PUBLIC_ORIGIN}/lumina-push-badge-v4.1.5.svg`,
            tag: notification.tag,
            renotify: true,
            requireInteraction: true,
            actions: notification.type === 'owner_push_test' ? [{action:'open',title:'Otwórz lekcję testową'}] : notification.type === 'daily_course_lesson' ? [{action:'open',title:'Czytaj lekcję'}] : [
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
  if (typeof record.receiverAuthUid !== 'string' || !record.receiverAuthUid) {
    return { status: 403, body: { error: 'Brak tożsamości odbiorcy.' } };
  }
  const tokens = await getRecipientTokens(record.receiverAuthUid, record.receiverId, accessToken, env);
  if (tokens.length === 0) return { status: 200, body: { delivered: 0, reason: 'no_active_device' } };
  const notification = notificationFor(kind, documentId, record);
  const results = await Promise.all(tokens.map((token) => sendFcm(token, notification, accessToken, env)));
  return { status: 200, body: { delivered: results.filter(Boolean).length, attempted: tokens.length } };
}

function courseDeps(env, accessToken, currentHour = null) {
  let deliveryBudget=30; // Leaves room for Auth, OAuth and manifest on Workers Free.
  const store = env.COURSE_SUBSCRIPTIONS
    ? kvCourseStore(env.COURSE_SUBSCRIPTIONS,env.OWNER_PUSH_TEST_GUARD)
    : firestoreCourseStore(env, accessToken);

  return {
    currentHour,
    store,
    latest: () => latestCourseLesson(),
    lessons: () => publishedCourseLessons(),
    accountState: async uid => {
      if (deliveryBudget<11) throw Error('course_dispatch_budget');
      deliveryBudget--;
      return courseAccountState(uid,env,accessToken);
    },
    canContinue: () => deliveryBudget>=11,
    tokens: async uid => {
      if (env.COURSE_SUBSCRIPTIONS) {
        try {
          const sub = await store.get(uid);
          if (sub?.data?.tokens && Array.isArray(sub.data.tokens) && sub.data.tokens.length > 0) {
            return sub.data.tokens;
          }
          return [];
        } catch (_) { throw Error('course_device_lookup_failed'); }
      }
      return await getRecipientTokens(uid, '', accessToken, env);
    },
    send: (token, lesson) => {
      if (deliveryBudget<=0) return false;
      deliveryBudget--;
      return sendFcm(token, {
      title: 'Nowa lekcja — Z Biblią za Pan Brat', body: lesson.title, type: 'daily_course_lesson',
      tag: `cc-daily-lesson-${lesson.number}`, url: lesson.url, icon: `${PUBLIC_ORIGIN}/lumina-notif-icon-v2.png`, senderId: '', documentId: String(lesson.number)
    }, accessToken, env);
    }
  };
}
export default {
  async scheduled(event, env) {
    if (env.COURSE_PUSH_ENABLED !== 'true') return;
    const currentHour = event?.cron
      ? Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw', hour: 'numeric', hourCycle: 'h23' }).format(new Date(event.scheduledTime || Date.now())))
      : null;
    if (currentHour!==null && ![6,7,8,20].includes(currentHour)) return;
    try {
    const token = await getGoogleAccessToken(env,true);
    const deps=courseDeps(env,token,currentHour);
    // Bound each invocation below Workers Free subrequest limits. Continue
    // opaque pages in the same preferred-hour window, not one page per day.
    for (let page=0;page<10;page++) {
      const result=await dispatchCourseLesson(deps);
      console.log(JSON.stringify({event:'daily_course_push',currentHour,page,...result}));
      if (!result.hasMore || !deps.canContinue()) break;
    }
    } catch (_) {
      console.error(JSON.stringify({event:'daily_course_dispatch_error',currentHour,error:'dispatch_failed'}));
      throw Error('course_dispatch_failed');
    }
  },
  async fetch(request, env) {
    const origin = request.headers.get('origin') || '';
    const cors = corsHeaders(origin, env);
    const urlObj = new URL(request.url);

    // ── Public Dynamic Post Open Graph Preview Gateway ──
    if (request.method === 'GET' && (urlObj.pathname === '/v1/post/share' || urlObj.pathname === '/share')) {
      const id = urlObj.searchParams.get('id') || '';
      const title = urlObj.searchParams.get('title') || 'Wpis w portalu LUMINA';
      const text = urlObj.searchParams.get('text') || urlObj.searchParams.get('desc') || '';
      let img = urlObj.searchParams.get('img') || '';
      const author = urlObj.searchParams.get('author') || 'LUMINA';

      if (img && !img.startsWith('http')) {
        img = `https://polskieradio.cc/${img.replace(/^\//, '')}`;
      }
      if (!img) {
        img = 'https://polskieradio.cc/lumina_icon.jpg';
      }

      const postUrl = `https://polskieradio.cc/lumina-tablica.html${id ? '#' + encodeURIComponent(id) : ''}`;
      const escape = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const cleanTitle = escape(title);
      const cleanDesc = escape(text);
      const cleanAuthor = escape(author);
      const cleanImg = escape(img);

      const html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>${cleanTitle} • ${cleanAuthor} | LUMINA</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="LUMINA • Społeczność Christian Culture">
  <meta property="og:title" content="${cleanTitle}">
  <meta property="og:description" content="${cleanDesc || 'Zobacz pełny wpis wraz ze zdjęciami i multimediami na Tablicy Społeczności LUMINA.'}">
  <meta property="og:image" content="${cleanImg}">
  <meta property="og:image:secure_url" content="${cleanImg}">
  <meta property="og:url" content="${postUrl}">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${cleanTitle}">
  <meta name="twitter:description" content="${cleanDesc || 'Zobacz pełny wpis wraz ze zdjęciami i multimediami na Tablicy Społeczności LUMINA.'}">
  <meta name="twitter:image" content="${cleanImg}">

  <link rel="canonical" href="${postUrl}">
  <meta http-equiv="refresh" content="0;url=${postUrl}">
  <script>
    window.location.replace(${JSON.stringify(postUrl)});
  </script>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; background:#0b0d13; color:#f8fafc; margin:0; padding:40px 20px; text-align:center;">
  <div style="max-width:540px; margin:0 auto; background:#161b26; border:1px solid rgba(212,169,74,0.3); border-radius:20px; padding:24px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
    <div style="font-size:0.85rem; color:#D4A94A; font-weight:800; margin-bottom:8px;">LUMINA • CHRZEŚCIJAŃSKA SPOŁECZNOŚĆ</div>
    <h1 style="font-size:1.25rem; font-weight:800; color:#fff; margin:0 0 10px;">${cleanTitle}</h1>
    <div style="font-size:0.9rem; color:#94a3b8; margin-bottom:16px;">Autor: <strong style="color:#fff;">${cleanAuthor}</strong></div>
    ${cleanImg ? `<div style="margin-bottom:16px; border-radius:12px; overflow:hidden;"><img src="${cleanImg}" alt="${cleanTitle}" style="width:100%; height:auto; max-height:360px; object-fit:cover; display:block;"></div>` : ''}
    <p style="font-size:0.95rem; line-height:1.6; color:#cbd5e1; text-align:left; white-space:pre-line; margin-bottom:20px;">${cleanDesc}</p>
    <a href="${postUrl}" style="display:inline-block; background:linear-gradient(135deg,#f59e0b,#d97706); color:#000; font-weight:800; text-decoration:none; padding:12px 24px; border-radius:30px;">Otwórz wpis w aplikacji LUMINA 🕊️</a>
  </div>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=3600, s-maxage=86400'
        }
      });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: origin === env.ALLOWED_ORIGIN ? 204 : 403,
        headers: { ...cors, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'authorization, content-type', 'access-control-max-age': '86400' }
      });
    }
    if (origin !== env.ALLOWED_ORIGIN) return json({ error: 'Niedozwolone źródło.' }, 403);
    if (request.method !== 'POST') return json({ error: 'Tylko POST.' }, 405, cors);
    if (new URL(request.url).pathname === '/v1/course/owner-test') {
      const headers = {...cors,'cache-control':'no-store'};
      try {
        const result = await ownerPushTest(request, env, {
          verify: req => verifyFirebaseUser(req, env, true),
          service: async () => {
            const token = await getGoogleAccessToken(env, true);
            return {...courseDeps(env, token), sendTest: (device, lesson) => sendFcm(device, {
              title:'TEST powiadomienia — Christian Culture',
              body:'To zatwierdzony test na Twoim koncie, nie nowa wiadomość ani subskrypcja.',
              type:'owner_push_test',tag:'cc-owner-push-test',url:lesson.url,
              icon:`${PUBLIC_ORIGIN}/lumina-notif-icon-v2.png`,senderId:'',documentId:''
            }, token, env, AbortSignal.timeout(10_000))};
          }
        });
        return json(result.body, result.status, headers);
      } catch (_) { return json({error:'Nie potwierdzono wyniku testu. Nie ponawiaj automatycznie.'},502,headers); }
    }
    if (new URL(request.url).pathname === '/v1/course/preflight') {
      // Read-only pilot: one explicitly configured account, no enrollment/send.
      const headers={...cors,'cache-control':'no-store'};
      if (!env.COURSE_PUSH_PILOT_UID) return json({error:'Test konta jest wyłączony.'},503,headers);
      if (request.body) {
        const reader=request.body.getReader();
        while (true) {
          const chunk=await reader.read();if(chunk.done) break;
          if(chunk.value.byteLength) {await reader.cancel();return json({error:'Test nie przyjmuje danych odbiorcy.'},400,headers);}
        }
      }
      let pilotAuthenticated=false;
      let stage='authentication';
      try {
        const uid=await verifyFirebaseUser(request,env,true);
        if (!uid) return json({error:'Wymagane logowanie do konta.'},401,headers);
        if (uid!==env.COURSE_PUSH_PILOT_UID) return json({error:'To konto nie uczestniczy w teście.'},403,headers);
        pilotAuthenticated=true;
        stage='service_account_authorization';
        const token=await getGoogleAccessToken(env,true);
        const deps=courseDeps(env,token);
        stage='account_lookup';
        if (await deps.accountState(uid)!=='active') return json({error:'Konto testowe nie jest aktywne.'},409,headers);
        stage='device_registry';
        const devices=await deps.tokens(uid);
        stage='lesson_manifest';
        const lesson=await deps.latest();
        return json({accountRead:true,registeredDeviceCount:devices.length,lessonNumber:lesson?.number || null,automaticDispatchEnabled:env.COURSE_PUSH_ENABLED==='true'},200,headers);
      } catch (_) {
        // Only fixed stage labels, and only after authenticating the pilot.
        // Never expose provider responses, exception text, identifiers or tokens.
        return json({error:'Nie potwierdzono dostępu serwera do konta testowego. Nie zmieniono danych ani uprawnień.',...(pilotAuthenticated?{stage}:{})},502,headers);
      }
    }
    if (new URL(request.url).pathname === '/v1/course/subscription') {
      if (env.COURSE_PUSH_ENABLED !== 'true') return json({error:'Subskrypcje kursu są wyłączone.'},503,cors);
      try {
        const uid = await verifyFirebaseUser(request,env,true);
        if (!uid) return json({error:'Wymagane logowanie do konta.'},401,cors);
        const reader = request.body?.getReader();
        let text = '', size = 0;
        if (!reader) return json({error:'Brak żądania.'},400,cors);
        const decoder = new TextDecoder();
        while (true) {
          const chunk = await reader.read(); if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size>1024) {await reader.cancel();return json({error:'Za duże żądanie.'},413,cors);}
          text += decoder.decode(chunk.value,{stream:true});
        }
        text += decoder.decode();
        let body;
        try { body = JSON.parse(text); }
        catch (_) { return json({error:'Nieprawidłowy JSON.'},400,cors); }
        if (!body || typeof body !== 'object' || Array.isArray(body) ||
            !['status','subscribe','unsubscribe'].includes(body.action) ||
            Object.keys(body).some(k=>!['action','consent','preferredHour','fcmToken'].includes(k)))
          return json({error:'Nieprawidłowe żądanie.'},400,cors);
        const token = await getGoogleAccessToken(env);
        const result = await courseSubscriptionAction(uid,body,courseDeps(env,token));
        // Report only the persisted outcome; never account IDs, device tokens or request bodies.
        console.log(JSON.stringify({event:'course_subscription_result',action:body.action,status:result.status,
          subscribed:result.body.subscribed ?? null,preferredHour:result.body.preferredHour ?? null}));
        return json(result.body,result.status,{...cors,'cache-control':'no-store'});
      } catch (err) {
        console.error(JSON.stringify({ event: 'course_subscription_error', error: err instanceof Error ? err.message : 'unknown', providerStatus: err?.providerStatus }));
        const failure = courseSubscriptionFailure(err);
        return json(failure.body,failure.status,{...cors,'cache-control':'no-store'});
      }
    }
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
