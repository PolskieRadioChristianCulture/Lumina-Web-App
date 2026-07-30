const fs = require('fs');
const file = 'cctv24-worship.html';
let content = fs.readFileSync(file, 'utf8');

// Exact broken fragment (clock comment followed immediately by zoom-details-box)
const broken = `<!-- Floating Clock Widget -->\r\n                        <div class="zoom-details-box">\r\n                            <div class="zoom-qr-box">\r\n                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https%3A%2F%2Fus06web.zoom.us%2Fj%2F85696754457%3Fpwd%3DF2idw79Zxcusqbe6QqOAkSaeCmysfo.1" alt="Zoom QR Code">\r\n                            </div>\r\n                            <div class="zoom-text-info">\r\n                                <div class="zoom-label">OG\u0141OSZENIE SPECJALNE</div>\r\n                                <div class="zoom-id">MEETING ID: <span>856 9675 4457</span></div>\r\n                                <div class="zoom-pass">PASSCODE: <span>495780</span></div>\r\n                                <div class="zoom-date">Do zobaczenia w czwartek o 21:00!</div>\r\n                            </div>\r\n                        </div>\r\n                    </div>`;

const fixed = `<!-- Floating Clock Widget -->
                    <div class="card-clock-widget" id="cardClockWidget">
                        <div class="card-clock-time">
                            <span id="timeHour">11</span>:<span id="timeMin">30</span><span class="sec" id="timeSec">00</span>
                        </div>
                        <div class="card-clock-date" id="clockDateLabel">Niedziela, 19 Lipca</div>
                    </div>

                    <!-- INFOLINIA NADZIEJA CC — pod zegarem, nad Program Dnia -->
                    <a href="tel:+48730958583" class="live-helpline-panel" title="Zadzwo\u0144: Infolinia Nadzieja Christian Culture" style="display:flex; align-items:center; gap:14px; background:rgba(245,197,24,0.08); border:1.5px solid rgba(245,197,24,0.3); border-radius:14px; padding:10px 16px; margin:8px 0 10px 0; text-decoration:none; transition:background 0.2s, border-color 0.2s; animation: live-helpline-pulse 2.4s infinite alternate;" onmouseover="this.style.background='rgba(245,197,24,0.18)'; this.style.borderColor='rgba(245,197,24,0.7)';" onmouseout="this.style.background='rgba(245,197,24,0.08)'; this.style.borderColor='rgba(245,197,24,0.3)';">
                        <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,#f5c518,#e6a817); display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 14px rgba(245,197,24,0.5);">
                            <i class="fa-solid fa-phone-volume" style="color:#000; font-size:1.15rem; animation:live-phone-ring 1.6s infinite alternate;"></i>
                        </div>
                        <div style="display:flex; flex-direction:column; line-height:1.3;">
                            <span style="font-size:0.58rem; font-weight:800; color:rgba(245,197,24,0.85); text-transform:uppercase; letter-spacing:1px; font-family:'Montserrat',sans-serif;">Infolinia &ldquo;Nadzieja Christian Culture&rdquo;</span>
                            <span style="font-size:1.15rem; font-weight:900; color:#fff; letter-spacing:0.5px; font-family:'Montserrat',sans-serif;">+48 730 958 583</span>
                        </div>
                    </a>

                    <!-- Zoom Ad Overlay (Hidden by default, triggered cyclically) -->
                    <div class="zoom-ad-overlay" id="zoomAdOverlay">
                        <div class="zoom-poster-container">
                            <img src="Modlitwa_za_Polske.jpeg" alt="Modlitwa za Polsk\u0119" class="zoom-poster">
                        </div>
                        <div class="zoom-details-box">
                            <div class="zoom-qr-box">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https%3A%2F%2Fus06web.zoom.us%2Fj%2F85696754457%3Fpwd%3DF2idw79Zxcusqbe6QqOAkSaeCmysfo.1" alt="Zoom QR Code">
                            </div>
                            <div class="zoom-text-info">
                                <div class="zoom-label">OG\u0141OSZENIE SPECJALNE</div>
                                <div class="zoom-id">MEETING ID: <span>856 9675 4457</span></div>
                                <div class="zoom-pass">PASSCODE: <span>495780</span></div>
                                <div class="zoom-date">Do zobaczenia w czwartek o 21:00!</div>
                            </div>
                        </div>
                    </div>`;

if (content.includes(broken)) {
  content = content.replace(broken, fixed);
  fs.writeFileSync(file, content, 'utf8');
  console.log('SUCCESS: Clock restored + helpline inserted between clock and schedule');
} else {
  // Try LF-only version
  const brokenLF = broken.replace(/\r\n/g, '\n');
  if (content.includes(brokenLF)) {
    content = content.replace(brokenLF, fixed);
    fs.writeFileSync(file, content, 'utf8');
    console.log('SUCCESS (LF): Clock restored + helpline inserted');
  } else {
    console.log('FAIL: pattern still not matched. Dumping 400 chars around clock comment:');
    const i = content.indexOf('Floating Clock Widget -->');
    console.log(JSON.stringify(content.substring(i, i + 400)));
  }
}
