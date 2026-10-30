import tls from 'node:tls';

export function sendGmail({ fromEmail, appPassword, toEmail, subject, text, html }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(465, 'smtp.gmail.com', () => {});
    socket.setEncoding('utf8');
    let step = 0;

    socket.on('data', (data) => {
      if (step === 0 && data.startsWith('220')) {
        step = 1;
        socket.write('EHLO polskieradio.cc\r\n');
      } else if (step === 1 && data.includes('250')) {
        step = 2;
        socket.write('AUTH LOGIN\r\n');
      } else if (step === 2 && data.startsWith('334')) {
        step = 3;
        socket.write(Buffer.from(fromEmail).toString('base64') + '\r\n');
      } else if (step === 3 && data.startsWith('334')) {
        step = 4;
        socket.write(Buffer.from(appPassword.replace(/\s+/g, '')).toString('base64') + '\r\n');
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
        const msgId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@polskieradio.cc>`;
        const dateStr = new Date().toUTCString();
        const boundary = '----=_Part_' + Date.now();
        const headers = [
          `From: "Polskie Radio Christian Culture" <${fromEmail}>`,
          `To: <${toEmail}>`,
          `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
          `Date: ${dateStr}`,
          `Message-ID: ${msgId}`,
          'MIME-Version: 1.0',
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          ''
        ].join('\r\n');

        const body = [
          headers,
          `--${boundary}`,
          'Content-Type: text/plain; charset=UTF-8',
          'Content-Transfer-Encoding: base64',
          '',
          Buffer.from(text).toString('base64'),
          '',
          `--${boundary}`,
          'Content-Type: text/html; charset=UTF-8',
          'Content-Transfer-Encoding: base64',
          '',
          Buffer.from(html).toString('base64'),
          '',
          `--${boundary}--`,
          '',
          '.',
          ''
        ].join('\r\n');

        socket.write(body);
      } else if (step === 8 && data.startsWith('250')) {
        step = 9;
        socket.write('QUIT\r\n');
        resolve({ ok: true, detail: data.trim() });
      } else if (data.startsWith('5') || data.startsWith('4')) {
        socket.write('QUIT\r\n');
        reject(new Error(`SMTP Error at step ${step}: ${data.trim()}`));
      }
    });

    socket.on('error', reject);
    setTimeout(() => reject(new Error(`SMTP Timeout at step ${step}`)), 12000);
  });
}

async function run() {
  console.log('Rozpoczynam test wysyłki e-mail przez smtp.gmail.com:465...');
  try {
    const res = await sendGmail({
      fromEmail: 'radiochristianculture@gmail.com',
      appPassword: process.env.GMAIL_RADIO_PASS || (() => { throw new Error('Ustaw zmienną środowiskową GMAIL_RADIO_PASS'); })(),
      toEmail: 'polskiercctv@gmail.com',
      subject: 'Test Połączenia Newslettera EkoCC [OK]',
      text: 'Szczęść Boże! To jest testowy e-mail potwierdzający autoryzację i pełną gotowość wysyłki z konta Radia.',
      html: '<h2>Szczęść Boże!</h2><p>To jest testowy e-mail potwierdzający 100% autoryzację i pełną gotowość wysyłki z konta Radia.</p>'
    });
    console.log('🎉 E-MAIL WYSŁANY POMYŚLNIE!', res);
  } catch (err) {
    console.error('❌ BŁĄD WYSYŁKI:', err.message);
  }
}

if (process.argv[1]?.includes('test-gmail-smtp.mjs')) {
  run();
}
