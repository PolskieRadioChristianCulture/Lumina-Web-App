/**
 * ============================================================================
 * EkoCC / CC Newsletter — Klient Google Gmail SMTP
 * Obsługa 100% darmowej wysyłki ZERO COST z oficjalnych adresów radiowych:
 * 1. radiochristianculture@gmail.com (główny nadawca DOI, powitań i rozważań)
 * 2. polskiercctv@gmail.com (nadawca CCTV24, techniczny i rotacyjny)
 * ============================================================================
 */

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const GMAIL_ACCOUNTS = {
  radio: {
    email: 'radiochristianculture@gmail.com',
    defaultAppPass: 'kywlxtqifxfaooxc',
    displayName: 'Polskie Radio Christian Culture',
  },
  cctv: {
    email: 'polskiercctv@gmail.com',
    defaultAppPass: 'cffhplyglpmdbmbc',
    displayName: 'CCTV24 Worship • Christian Culture',
  },
};

/**
 * Wybór konta wysyłkowego w zależności od typu wiadomości i preferencji
 */
export function resolveSenderAccount(env = {}, deliveryType = 'doi_confirm') {
  const radioPass = env.GMAIL_RADIO_PASS || GMAIL_ACCOUNTS.radio.defaultAppPass;
  const cctvPass = env.GMAIL_CCTV_PASS || GMAIL_ACCOUNTS.cctv.defaultAppPass;

  // Domyślnie transakcyjne (DOI, linki, powitania) idą z Radia
  if (['doi_confirm', 'welcome', 'manage_link'].includes(deliveryType)) {
    return {
      primary: { email: GMAIL_ACCOUNTS.radio.email, pass: radioPass, name: GMAIL_ACCOUNTS.radio.displayName },
      fallback: { email: GMAIL_ACCOUNTS.cctv.email, pass: cctvPass, name: GMAIL_ACCOUNTS.cctv.displayName },
    };
  }

  // Kampanie lub rotacja
  return {
    primary: { email: GMAIL_ACCOUNTS.radio.email, pass: radioPass, name: GMAIL_ACCOUNTS.radio.displayName },
    fallback: { email: GMAIL_ACCOUNTS.cctv.email, pass: cctvPass, name: GMAIL_ACCOUNTS.cctv.displayName },
  };
}

/**
 * Budowanie wiadomości MIME RFC 2822 / 5322
 */
export function buildMimeMessage({ fromEmail, fromName, toEmail, subject, text, html, headers = {} }) {
  const msgId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@polskieradio.cc>`;
  const dateStr = new Date().toUTCString();
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;

  const headerList = [
    `From: "${fromName || 'Polskie Radio Christian Culture'}" <${fromEmail}>`,
    `To: <${toEmail}>`,
    `Subject: =?UTF-8?B?${toBase64(subject)}?=`,
    `Date: ${dateStr}`,
    `Message-ID: ${msgId}`,
    'MIME-Version: 1.0',
  ];

  for (const [k, v] of Object.entries(headers)) {
    if (v) headerList.push(`${k}: ${v}`);
  }

  headerList.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
  headerList.push('');

  const bodyParts = [
    headerList.join('\r\n'),
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    toBase64(text || ''),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    toBase64(html || ''),
    '',
    `--${boundary}--`,
    '',
    '.',
    '',
  ];

  return {
    raw: bodyParts.join('\r\n'),
    msgId,
  };
}

/**
 * Wysyłka w środowisku Cloudflare Worker (cloudflare:sockets)
 */
export async function sendViaWorkerSockets({ fromEmail, fromName, appPass, toEmail, subject, text, html, headers = {} }) {
  const { connect } = await import('cloudflare:sockets');
  const socket = connect({ hostname: 'smtp.gmail.com', port: 465 }, { secureTransport: 'on' });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let buffer = '';
  async function readLine() {
    while (!buffer.includes('\n')) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
    }
    const idx = buffer.indexOf('\n');
    if (idx === -1) {
      const l = buffer;
      buffer = '';
      return l;
    }
    const l = buffer.substring(0, idx + 1);
    buffer = buffer.substring(idx + 1);
    return l;
  }

  async function readResponse() {
    let resp = '';
    while (true) {
      const line = await readLine();
      resp += line;
      if (line.length >= 4 && line[3] === ' ') break;
      if (line.length < 4) break;
    }
    return resp;
  }

  async function writeCmd(cmd) {
    await writer.write(encoder.encode(cmd + '\r\n'));
  }

  try {
    const banner = await readResponse();
    if (!banner.startsWith('220')) throw new Error('SMTP banner error: ' + banner);

    await writeCmd('EHLO polskieradio.cc');
    const ehlo = await readResponse();
    if (!ehlo.startsWith('250')) throw new Error('EHLO error: ' + ehlo);

    await writeCmd('AUTH LOGIN');
    const authStart = await readResponse();
    if (!authStart.startsWith('334')) throw new Error('AUTH LOGIN error: ' + authStart);

    await writeCmd(toBase64(fromEmail));
    const userResp = await readResponse();
    if (!userResp.startsWith('334')) throw new Error('Username error: ' + userResp);

    await writeCmd(toBase64(appPass.replace(/\s+/g, '')));
    const passResp = await readResponse();
    if (!passResp.startsWith('235')) throw new Error('Password error: ' + passResp);

    await writeCmd(`MAIL FROM:<${fromEmail}>`);
    const mailResp = await readResponse();
    if (!mailResp.startsWith('250')) throw new Error('MAIL FROM error: ' + mailResp);

    await writeCmd(`RCPT TO:<${toEmail}>`);
    const rcptResp = await readResponse();
    if (!rcptResp.startsWith('250')) throw new Error('RCPT TO error: ' + rcptResp);

    await writeCmd('DATA');
    const dataResp = await readResponse();
    if (!dataResp.startsWith('354')) throw new Error('DATA error: ' + dataResp);

    const { raw, msgId } = buildMimeMessage({ fromEmail, fromName, toEmail, subject, text, html, headers });
    await writer.write(encoder.encode(raw));

    const finalResp = await readResponse();
    if (!finalResp.startsWith('250')) throw new Error('Body send error: ' + finalResp);

    await writeCmd('QUIT');
    return { ok: true, messageId: msgId, response: finalResp.trim() };
  } finally {
    try { writer.releaseLock(); } catch (_) {}
    try { reader.releaseLock(); } catch (_) {}
    try { await socket.close(); } catch (_) {}
  }
}

/**
 * Wysyłka w środowisku Node.js (node:tls) — testy lokalne i CLI
 */
export async function sendViaNodeTls({ fromEmail, fromName, appPass, toEmail, subject, text, html, headers = {} }) {
  const tls = await import('node:tls');

  return new Promise((resolve, reject) => {
    const socket = tls.connect(465, 'smtp.gmail.com', () => {});
    socket.setEncoding('utf8');
    let step = 0;
    const { raw, msgId } = buildMimeMessage({ fromEmail, fromName, toEmail, subject, text, html, headers });

    socket.on('data', (data) => {
      if (step === 0 && data.startsWith('220')) {
        step = 1;
        socket.write('EHLO polskieradio.cc\r\n');
      } else if (step === 1 && data.includes('250')) {
        step = 2;
        socket.write('AUTH LOGIN\r\n');
      } else if (step === 2 && data.startsWith('334')) {
        step = 3;
        socket.write(toBase64(fromEmail) + '\r\n');
      } else if (step === 3 && data.startsWith('334')) {
        step = 4;
        socket.write(toBase64(appPass.replace(/\s+/g, '')) + '\r\n');
      } else if (step === 4 && data.startsWith('235')) {
        step = 5;
        socket.write(`MAIL FROM:<${fromEmail}>\r\n`);
      } else if (step === 5 && data.startsWith('250')) {
        step = 6;
        socket.write(`RCPT TO:<${toEmail}>\r\n`);
      } else if (step === 6 && data.startsWith('250')) {
        step = 7;
        socket.write('DATA\r\n');
      } else if (step === 7 && data.startsWith('354')) {
        step = 8;
        socket.write(raw);
      } else if (step === 8 && data.startsWith('250')) {
        step = 9;
        socket.write('QUIT\r\n');
        resolve({ ok: true, messageId: msgId, response: data.trim() });
      } else if (data.startsWith('5') || data.startsWith('4')) {
        socket.write('QUIT\r\n');
        reject(new Error(`SMTP Error at step ${step}: ${data.trim()}`));
      }
    });

    socket.on('error', reject);
    setTimeout(() => reject(new Error(`SMTP Timeout at step ${step}`)), 12000);
  });
}

/**
 * Uniwersalny dyspozytor pocztowy EkoCC z automatycznym wykrywaniem środowiska i failoverem
 */
export async function dispatchGmailEmail(options, env = {}) {
  const deliveryType = options.deliveryType || 'doi_confirm';
  const { primary, fallback } = resolveSenderAccount(env, deliveryType);

  const isWorker = typeof WebSocketPair !== 'undefined' || typeof navigator === 'undefined' || !!(typeof process === 'undefined' || !process.versions?.node);

  const sendFn = isWorker ? sendViaWorkerSockets : sendViaNodeTls;

  // Próba nadawcy głównego
  try {
    return await sendFn({
      ...options,
      fromEmail: primary.email,
      fromName: primary.name,
      appPass: primary.pass,
    });
  } catch (errPrimary) {
    console.warn(`[Gmail SMTP] Primary sender ${primary.email} failed:`, errPrimary.message);
    // Próba zapasowa (fallback)
    try {
      return await sendFn({
        ...options,
        fromEmail: fallback.email,
        fromName: fallback.name,
        appPass: fallback.pass,
      });
    } catch (errFallback) {
      console.error(`[Gmail SMTP] Fallback sender ${fallback.email} also failed:`, errFallback.message);
      throw new Error(`Gmail SMTP delivery failed: ${errPrimary.message} | Fallback: ${errFallback.message}`);
    }
  }
}
