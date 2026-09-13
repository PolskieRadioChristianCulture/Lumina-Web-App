/**
 * Bounded public HTTP & Audio Stream health check for scheduled & post-deploy monitoring.
 * Usage:
 *   node scripts/public-health-check.cjs [BASE_URL]
 * 
 * Supports env vars:
 *   BASE_URL - base URL for web endpoint checks (default: https://polskieradio.cc)
 *   HEALTHCHECK_URLS - comma-separated custom URL list
 *   CHECK_AUDIO_STREAMS - set to 'false' to disable audio stream probing
 *   AUDIO_STREAM_URLS - comma-separated stream URLs to verify
 */
const http = require('http');
const https = require('https');

const cliBaseArg = process.argv.slice(2).find((arg) => arg.startsWith('http://') || arg.startsWith('https://'));
const baseUrl = (cliBaseArg || process.env.BASE_URL || 'https://polskieradio.cc').replace(/\/+$/, '');

const defaultPages = [
  `${baseUrl}/`,
  `${baseUrl}/cctv24.html`,
  `${baseUrl}/lumina.html`,
  `${baseUrl}/mojabiblia.html`,
  `${baseUrl}/aktualnosci.html`,
  `${baseUrl}/vod.html`,
];

const urls = (process.env.HEALTHCHECK_URLS || defaultPages.join(','))
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

const defaultAudioStreams = [
  'https://stream.zeno.fm/vz96pvl3pnktv', // Radio Christian Culture
  'https://stream.zeno.fm/imo45hqnshyuv', // Radio Biblia Audio
  'https://stream.zeno.fm/umej2cuqncluv', // Radio CC Global
];

const checkAudioEnabled = process.env.CHECK_AUDIO_STREAMS !== 'false';
const streamUrls = (process.env.AUDIO_STREAM_URLS || defaultAudioStreams.join(','))
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

function checkUrl(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error(`Too many redirects on ${url}`));
      return;
    }
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      reject(new Error(`Invalid URL: ${url}`));
      return;
    }
    const client = parsed.protocol === 'https:' ? https : http;
    const request = client.get(
      parsed,
      { headers: { 'User-Agent': 'icc-health-check/1.0' }, timeout: 10000 },
      (response) => {
        const status = response.statusCode;
        response.resume();
        response.on('end', () => {
          if (status >= 200 && status < 400) {
            resolve(`${url} OK HTTP ${status}`);
          } else {
            reject(new Error(`${url} returned HTTP ${status}`));
          }
        });
      }
    );
    request.on('timeout', () => request.destroy(new Error('request timed out')));
    request.on('error', (error) => reject(new Error(`${url}: ${error.message}`)));
  });
}

function probeAudioStream(streamUrl, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error(`Too many redirects probing stream: ${streamUrl}`));
      return;
    }
    let parsed;
    try {
      parsed = new URL(streamUrl);
    } catch {
      reject(new Error(`Invalid stream URL: ${streamUrl}`));
      return;
    }
    const client = parsed.protocol === 'https:' ? https : http;
    const request = client.get(
      parsed,
      {
        headers: {
          'User-Agent': BROWSER_UA,
          'Accept': '*/*',
          'Icy-MetaData': '1',
        },
        timeout: 8000,
      },
      (response) => {
        const status = response.statusCode;
        const contentType = response.headers['content-type'] || '';
        const location = response.headers['location'];

        // Handle redirect to active edge node
        if ((status === 301 || status === 302 || status === 307 || status === 308) && location) {
          response.destroy();
          const target = new URL(location, streamUrl).toString();
          return probeAudioStream(target, redirectCount + 1).then(resolve, reject);
        }

        response.destroy(); // Abort reading immediately, we only need headers!

        if (status === 200) {
          resolve(`${streamUrl} STREAM ACTIVE (HTTP 200, type: ${contentType || 'audio'})`);
        } else {
          reject(new Error(`${streamUrl} returned HTTP ${status} (expected 200 or 302)`));
        }
      }
    );
    request.on('timeout', () => request.destroy(new Error('audio stream probe timed out')));
    request.on('error', (error) => reject(new Error(`${streamUrl}: ${error.message}`)));
  });
}

(async () => {
  console.log(`\n🔍 ICC PUBLIC HEALTH CHECK (${baseUrl})`);
  console.log(`──────────────────────────────────────────────────`);

  let failures = 0;

  // 1. Web Endpoints Check
  console.log(`\n--- 🌐 Web Endpoints (${urls.length}) ---`);
  const webResults = await Promise.allSettled(urls.map((url) => checkUrl(url)));
  for (const result of webResults) {
    if (result.status === 'fulfilled') {
      console.log(`✅ ${result.value}`);
    } else {
      failures += 1;
      console.error(`❌ ${result.reason.message}`);
    }
  }

  // 2. Audio Streams Check
  if (checkAudioEnabled) {
    console.log(`\n--- 📻 Live Audio Streams (${streamUrls.length}) ---`);
    const streamResults = await Promise.allSettled(streamUrls.map((url) => probeAudioStream(url)));
    for (const result of streamResults) {
      if (result.status === 'fulfilled') {
        console.log(`✅ ${result.value}`);
      } else {
        failures += 1;
        console.error(`❌ ${result.reason.message}`);
      }
    }
  }

  console.log(`──────────────────────────────────────────────────`);
  if (failures > 0) {
    console.error(`💥 Outage detected: ${failures} check(s) failed!\n`);
    process.exit(1);
  } else {
    console.log(`🎉 All systems operational (0 failures).\n`);
  }
})();
