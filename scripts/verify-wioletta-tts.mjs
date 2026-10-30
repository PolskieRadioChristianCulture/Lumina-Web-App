import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const PORT = 8192;

// Simple static server for testing
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  
  let fullPath = path.join(ROOT, reqPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    fullPath = path.join(fullPath, 'index.html');
  }

  if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
    const ext = path.extname(fullPath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(fullPath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, async () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    // Mock Web Speech API in Playwright headless
    await page.addInitScript(() => {
      let _speaking = false;
      let _paused = false;
      window._mockUtterances = [];

      window.SpeechSynthesisUtterance = function(text) {
        this.text = text;
        this.lang = 'pl-PL';
        this.rate = 1.0;
        this.pitch = 1.0;
        this.voice = null;
        this.onend = null;
        this.onerror = null;
      };

      window.speechSynthesis = {
        speaking: false,
        paused: false,
        getVoices: () => [
          { name: 'Google polski', lang: 'pl-PL', default: true },
          { name: 'Microsoft Paulina', lang: 'pl-PL', default: false }
        ],
        speak: (utt) => {
          window._mockUtterances.push(utt.text);
          window.speechSynthesis.speaking = true;
          window.speechSynthesis.paused = false;
          // Trigger onend after brief timeout
          setTimeout(() => {
            if (utt.onend) utt.onend({ type: 'end' });
          }, 100);
        },
        pause: () => {
          window.speechSynthesis.paused = true;
        },
        resume: () => {
          window.speechSynthesis.paused = false;
        },
        cancel: () => {
          window.speechSynthesis.speaking = false;
          window.speechSynthesis.paused = false;
        }
      };
    });

    console.log('Navigating to Chapter 1...');
    await page.goto(`http://localhost:${PORT}/Wioletta/pardon-czy-to-milosc/rozdzial-1/`, { waitUntil: 'networkidle' });

    // Wait for prose content to load
    await page.waitForSelector('#proseContent p', { timeout: 5000 });
    const pCount = await page.locator('#proseContent p').count();
    console.log(`Prose loaded with ${pCount} paragraphs.`);
    if (pCount < 5) throw new Error('Expected at least 5 paragraphs');

    // Check TTS hero box in chapter header
    await page.waitForSelector('#chapterTtsBox', { timeout: 3000 });
    const heroTitle = await page.textContent('.chapter-tts-title');
    console.log(`Hero box title: "${heroTitle.trim()}"`);
    if (!heroTitle.includes('Posłuchaj tego rozdziału')) throw new Error('Hero box title mismatch');

    // Check toolbar audio button
    const toolbarBtn = await page.locator('#toolbarTtsBtn');
    const tbVisible = await toolbarBtn.isVisible();
    console.log(`Toolbar TTS button visible: ${tbVisible}`);

    // Click "Słuchaj" in header box
    console.log('Clicking Słuchaj button...');
    await page.click('#chapterTtsStartBtn');
    await page.waitForTimeout(300);

    // Verify dock opened
    const dock = page.locator('#wiolettaTtsDock');
    const isOpen = await dock.evaluate(el => el.classList.contains('open'));
    console.log(`TTS dock open: ${isOpen}`);
    if (!isOpen) throw new Error('Dock should be open');

    // Verify active paragraph highlighted
    const activeParaCount = await page.locator('#proseContent p.tts-active-para').count();
    console.log(`Active highlighted paragraph count: ${activeParaCount}`);
    if (activeParaCount !== 1) throw new Error('Exactly 1 active paragraph expected');

    // Check status in dock
    const dockStatus = await page.textContent('#ttsDockStatus');
    console.log(`Dock status text: "${dockStatus.trim()}"`);

    // Test Speed Cycle
    console.log('Clicking speed button...');
    await page.click('#ttsSpeedBtn');
    await page.waitForTimeout(100);
    const speedText = await page.textContent('#ttsSpeedLabel');
    console.log(`Speed after click: ${speedText.trim()}`);

    // Test Next paragraph button in dock
    console.log('Clicking next paragraph button...');
    await page.click('#ttsNextParaBtn');
    await page.waitForTimeout(200);
    const dockStatus2 = await page.textContent('#ttsDockStatus');
    console.log(`Dock status after next: "${dockStatus2.trim()}"`);

    // Take screenshot on Desktop
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/tts_reader_desktop.png', fullPage: false });
    console.log('Desktop screenshot saved.');

    // Switch to Mobile Viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/tts_reader_mobile.png', fullPage: false });
    console.log('Mobile screenshot saved.');

    console.log('ALL PLAYWRIGHT TESTS PASSED SUCCESSFULLY! ✓');
  } finally {
    await browser.close();
    server.close();
  }
});
