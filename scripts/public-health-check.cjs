/**
 * Bounded public HTTP health check for scheduled monitoring.
 * Set HEALTHCHECK_URLS to a comma-separated allow-list to override defaults.
 */
const https = require('https');

const urls = (process.env.HEALTHCHECK_URLS || [
  'https://polskieradio.cc/',
  'https://polskieradio.cc/cctv24.html',
  'https://polskieradio.cc/lumina.html',
].join(',')).split(',').map((url) => url.trim()).filter(Boolean);

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      reject(new Error(`Invalid URL: ${url}`));
      return;
    }
    if (parsed.protocol !== 'https:') {
      reject(new Error(`Only HTTPS URLs are allowed: ${url}`));
      return;
    }
    const request = https.get(parsed, { headers: { 'User-Agent': 'icc-health-check' }, timeout: 10000 }, (response) => {
      response.resume();
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 400) {
          reject(new Error(`${url} returned HTTP ${response.statusCode}`));
          return;
        }
        resolve(`${url} OK HTTP ${response.statusCode}`);
      });
    });
    request.on('timeout', () => request.destroy(new Error('request timed out')));
    request.on('error', (error) => reject(new Error(`${url}: ${error.message}`)));
  });
}

(async () => {
  const results = await Promise.allSettled(urls.map(checkUrl));
  let failures = 0;
  for (const result of results) {
    if (result.status === 'fulfilled') {
      console.log(`✅ ${result.value}`);
    } else {
      failures += 1;
      console.error(`❌ ${result.reason.message}`);
    }
  }
  if (failures > 0) process.exit(1);
})();
