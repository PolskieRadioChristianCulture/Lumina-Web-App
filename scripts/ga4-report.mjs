import fs from 'node:fs';
import crypto from 'node:crypto';

export const PROPERTIES = {
  POLSKIE_RADIO: '548623550',
  BIBLIA_AUDIO: '526422549',
  LUMINA: '550097091'
};

const KEYS = [
  { name: 'lumina-cc', path: 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/luminaServiceAccountKey.json' },
  { name: 'cc-mission-control', path: 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/serviceAccountKey.json' },
  { name: 'cuda-398c0', path: 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/cudaServiceAccountKey.json' }
];

async function getAccessToken(keyPath) {
  const sa = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signInput = `${b64(header)}.${b64(claimSet)}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  const signature = sign.sign(sa.private_key, 'base64url');
  const jwt = `${signInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`OAuth error: ${JSON.stringify(data)}`);
  }
  return { token: data.access_token, email: sa.client_email, project: sa.project_id };
}

export async function runReport(requestBody, propertyId = PROPERTIES.POLSKIE_RADIO) {
  let lastErr = null;
  for (const k of KEYS) {
    if (!fs.existsSync(k.path)) continue;
    try {
      const { token, email, project } = await getAccessToken(k.path);
      const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      const data = await res.json();
      if (res.ok) {
        return { ok: true, project, email, data };
      } else {
        lastErr = { project, email, status: res.status, error: data.error };
      }
    } catch (e) {
      lastErr = { project: k.name, error: e.message };
    }
  }
  return { ok: false, ...lastErr };
}

async function main() {
  const targetProperty = process.argv[2] || PROPERTIES.POLSKIE_RADIO;
  const res = await runReport({
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'language' }],
    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    limit: 15
  }, targetProperty);
  console.log(JSON.stringify(res, null, 2));
}

if (process.argv[1].endsWith('ga4-report.mjs')) {
  main().catch(console.error);
}
