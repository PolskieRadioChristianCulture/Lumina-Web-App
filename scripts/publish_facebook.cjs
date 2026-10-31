/**
 * publish_facebook.js — Precyzyjna publikacja rozważań na Facebooku
 * Standard JOMA-STD-FB-PREMIUM-POSTING-20261030
 * 
 * 1. Estetyczny układ akapitowy ze światłem (brak zbitego tekstu).
 * 2. Automatyczne dołączanie kinowej grafiki 16:9 z repozytorium CC.
 * 3. Obsługa profilu osobistego i stron fanowskich (Radio Christian Culture, Christian Culture App).
 * 4. Ochrona przed duplikatami (anty-spam).
 */

const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const FB_PAGES = [
  { name: 'Profil osobisty',         url: 'https://www.facebook.com/cezary.rogowski1' },
  { name: 'Radio Christian Culture', url: 'https://www.facebook.com/RadioChristianCulture', isPage: true },
  { name: 'Christian Culture App',   url: 'https://www.facebook.com/ChristianCultureApp',   isPage: true },
  { name: 'Christian Culture',       url: 'https://www.facebook.com/christianculture.pl',   isPage: true }
];

const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

const HISTORY_FILE = path.join(__dirname, 'data', 'fb_reflection_history.json');

function loadHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch(e) {}
  }
  return {};
}

function saveHistory(history) {
  try {
    const dir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch(e) {
    console.error('Błąd zapisu historii FB:', e.message);
  }
}

async function getTodayData() {
  const jsonPath = path.resolve(__dirname, '..', 'polskieradio.cc', 'rozwazania_baza.json');
  let data = null;

  if (fs.existsSync(jsonPath)) {
    try {
      const list = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(new Date());
      data = list.find(x => x.date === today || x.id.includes(today));
    } catch(e) {}
  }

  if (!data) {
    const snap = await db.collection('web_inspirations').orderBy('date', 'desc').limit(1).get();
    data = snap.docs[0].data();
  }

  // Wyszukanie lokalnego pliku grafiki
  let localImagePath = null;
  if (data.imageUrl) {
    const relativePart = data.imageUrl.replace(/^https?:\/\/[^\/]+\//, '');
    const candidatePath = path.resolve(__dirname, '..', 'polskieradio.cc', relativePart);
    if (fs.existsSync(candidatePath)) {
      localImagePath = candidatePath;
    }
  }

  return {
    rawText: data.contentWeb || data.fullText || data.text,
    title: data.title,
    dayNumber: data.day || 30,
    localImagePath: localImagePath
  };
}

function formatPostText(rawText, title) {
  if (!rawText) return title || 'Słowo na dziś';

  const lines = rawText.split('\n').map(l => l.trim());
  const paragraphs = [];
  let currentPara = [];

  for (const line of lines) {
    if (line === '') {
      if (currentPara.length > 0) {
        paragraphs.push(currentPara.join(' '));
        currentPara = [];
      }
    } else {
      currentPara.push(line);
    }
  }
  if (currentPara.length > 0) {
    paragraphs.push(currentPara.join(' '));
  }

  let formatted = paragraphs.join('\n\n');

  if (!formatted.includes('#ChristianCulture')) {
    formatted += '\n\n👉 Słuchaj i studiuj codziennie: www.polskieradio.cc\n#ChristianCulture #ZBibliaZaPanBrat #Biblia #Wiara';
  }

  return formatted;
}

async function publishPost(page, postText, imagePath, targetName) {
  console.log(`   ⏳ Otwieram kompozytor posta na: ${targetName}...`);

  const triggerClicked = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('span, div[role="button"]'));
    const trigger = nodes.find(el => {
      const t = (el.innerText || '').trim().toLowerCase();
      return t.includes('słychać') || t.includes('napisz coś') || t.includes('utwórz post') || t.includes('stwórz post');
    });
    if (trigger) { trigger.click(); return true; }
    return false;
  });

  if (!triggerClicked) throw new Error("Nie znaleziono pola tworzenia posta");

  const editorSelector = 'div[role="dialog"] div[role="textbox"]';
  await page.waitForSelector(editorSelector, { timeout: 15000 });

  // 1. Wgrywanie kinowej grafiki jeśli dostępna
  if (imagePath && fs.existsSync(imagePath)) {
    console.log(`   🖼️ Załączam kinową grafikę: ${path.basename(imagePath)}...`);
    const fileInput = await page.$('div[role="dialog"] input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile(imagePath);
      await new Promise(r => setTimeout(r, 5000));
      console.log("   ✅ Grafika załączona pomyślnie.");
    }
  }

  // 2. Wprowadzanie tekstu z podziałem akapitowym przez zdarzenie paste
  console.log("   ✍️ Wprowadzam sformatowany tekst z zachowaniem akapitów...");
  await page.evaluate((txt) => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => d.querySelector('div[role="textbox"]'));
    const ed = postDialog ? postDialog.querySelector('div[role="textbox"]') : document.querySelector('div[role="textbox"]');
    if (ed) {
      ed.focus();
      const dt = new DataTransfer();
      dt.setData('text/plain', txt);
      const pasteEvent = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
      ed.dispatchEvent(pasteEvent);
    }
  }, postText);

  await page.keyboard.press('Space');
  await page.keyboard.press('Backspace');
  await new Promise(r => setTimeout(r, 3000));

  // 3. Sprawdź przycisk Dalej (lub bezpośrednio Opublikuj)
  console.log("   👉 Sprawdzam przyciski (Dalej / Opublikuj)...");
  const hasDalej = await page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => d.querySelector('div[role="textbox"]'));
    if (!postDialog) return false;
    const btns = Array.from(postDialog.querySelectorAll('div[role="button"], button'));
    const dalej = btns.find(b => (b.innerText || '').trim() === 'Dalej' && b.getAttribute('aria-disabled') !== 'true');
    if (dalej) { dalej.click(); return true; }
    return false;
  });

  if (hasDalej) {
    console.log("   👉 Kliknięto 'Dalej'...");
    await new Promise(r => setTimeout(r, 4000));
  } else {
    try {
      await page.waitForFunction(() => {
        const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
        const postDialog = dialogs.find(d => d.querySelector('div[role="textbox"]'));
        if (!postDialog) return false;
        const btns = Array.from(postDialog.querySelectorAll('div[role="button"], button'));
        const dalej = btns.find(b => (b.innerText || '').trim() === 'Dalej' && b.getAttribute('aria-disabled') !== 'true');
        if (dalej) { dalej.click(); return true; }
        const pub = btns.find(b => ((b.innerText || '').trim() === 'Opublikuj' || b.getAttribute('aria-label') === 'Opublikuj') && b.getAttribute('aria-disabled') !== 'true');
        return !!pub;
      }, { timeout: 6000 });
      await new Promise(r => setTimeout(r, 2000));
    } catch(e) {}
  }

  // 4. Kliknięcie Opublikuj
  console.log("   🚀 Klikam 'Opublikuj'...");
  await page.waitForFunction(() => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => (d.innerText || '').includes('Ustawienia') || (d.innerText || '').includes('Opublikuj') || d.querySelector('div[role="button"][aria-label="Opublikuj"]'));
    if (!postDialog) return false;
    const btns = Array.from(postDialog.querySelectorAll('div[role="button"], button'));
    const pub = btns.find(b => ((b.innerText || '').trim() === 'Opublikuj' || (b.innerText || '').trim() === 'Opublikuj teraz' || b.getAttribute('aria-label') === 'Opublikuj') && b.getAttribute('aria-disabled') !== 'true');
    return !!pub;
  }, { timeout: 15000 });

  await page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => (d.innerText || '').includes('Ustawienia') || (d.innerText || '').includes('Opublikuj') || d.querySelector('div[role="button"][aria-label="Opublikuj"]'));
    if (!postDialog) return;
    const btns = Array.from(postDialog.querySelectorAll('div[role="button"], button'));
    const pub = btns.find(b => ((b.innerText || '').trim() === 'Opublikuj' || (b.innerText || '').trim() === 'Opublikuj teraz' || b.getAttribute('aria-label') === 'Opublikuj') && b.getAttribute('aria-disabled') !== 'true');
    if (pub) pub.click();
  });

  await new Promise(r => setTimeout(r, 12000));
  console.log(`   ✅ Post z grafiką i akapitami opublikowany na: ${targetName}!`);
  return true;
}

async function run() {
  const d = await getTodayData();
  const todayWarsaw = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(new Date());
  const history = loadHistory();
  if (!history[todayWarsaw]) {
    history[todayWarsaw] = {};
  }

  // Sprawdź cele oczekujące na dzisiejszą publikację (żelazna ochrona przed dublowaniem: 1 post dziennie)
  const pendingTargets = FB_PAGES.filter(target => history[todayWarsaw][target.name]?.status !== 'published');
  if (pendingTargets.length === 0) {
    console.log(`\n🔒 [BLOKADA ANTY-DUPLIKAT] Rozważanie na dzień ${todayWarsaw} (Dzień ${d.dayNumber}) zostało już dziś opublikowane na wszystkich celach FB!`);
    console.log(`   Dyrektywa Dowódcy: dokładnie 1 post dziennie z danym rozważaniem. Pomijam uruchamianie przeglądarki.`);
    process.exit(0);
  }

  const formattedText = formatPostText(d.rawText, d.title);
  console.log(`🚀 Przygotowano rozważanie Dnia ${d.dayNumber} (Akapity: ${formattedText.split('\n\n').length}, Grafika: ${d.localImagePath ? 'TAK' : 'BRAK'})...`);
  console.log(`📋 Cele do publikacji (${pendingTargets.length}/${FB_PAGES.length}):`, pendingTargets.map(t => t.name).join(', '));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=pl-PL']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });

  const sessionPath = path.join(__dirname, 'fb_session.json');
  if (fs.existsSync(sessionPath)) {
    try {
      let raw = fs.readFileSync(sessionPath, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
      const cookies = JSON.parse(raw);
      await page.setCookie(...cookies);
      console.log(`🔑 Wczytano ${cookies.length} świeżych ciasteczek z fb_session.json.`);
    } catch(e) {
      console.error('Błąd ciasteczek:', e.message);
    }
  }

  const results = [];
  for (const target of pendingTargets) {
    console.log(`\n📢 Otwieram: ${target.name} (${target.url})`);
    try {
      await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 4000));

      if (target.isPage) {
        // Sprawdź czy jest przycisk przełączenia profilu ("Przełącz", "Przełącz teraz")
        const switchClicked = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
          const btn = buttons.find(b => (b.innerText || '').trim() === 'Przełącz' || (b.innerText || '').trim() === 'Przełącz teraz');
          if (btn) { btn.click(); return true; }
          return false;
        });

        if (switchClicked) {
          console.log(`   🔄 Kliknięto banner 'Przełącz' na stronę ${target.name}...`);
          await new Promise(r => setTimeout(r, 2000));
          await page.evaluate(() => {
            const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
            const switchDialog = dialogs.find(d => (d.innerText || '').includes('Przełącz profil') || (d.innerText || '').includes('Przełącz się na'));
            if (switchDialog) {
              const btns = Array.from(switchDialog.querySelectorAll('div[role="button"], button'));
              const confirmBtn = btns.find(b => (b.innerText || '').trim() === 'Przełącz');
              if (confirmBtn) confirmBtn.click();
            }
          });
          await new Promise(r => setTimeout(r, 8000));
        }
      }

      // Sprawdź czy dzisiejsze rozważanie już istnieje na tej stronie / profilu (ochrona przed duplikatami)
      const alreadyPosted = await page.evaluate((dayNum) => {
        const text = document.body.innerText || '';
        return text.includes(`Dzień ${dayNum}:`) || text.includes(`Dzień ${dayNum} `);
      }, d.dayNumber);

      if (alreadyPosted) {
        console.log(`   ℹ️ Rozważanie Dnia ${d.dayNumber} już istnieje na: ${target.name} (ochrona przed duplikatem).`);
        results.push({ target: target.name, ok: true, skipped: true });
        continue;
      }

      const ok = await publishPost(page, formattedText, d.localImagePath, target.name);
      if (ok) {
        history[todayWarsaw][target.name] = {
          status: 'published',
          dayNumber: d.dayNumber,
          title: d.title,
          publishedAt: new Date().toISOString()
        };
        saveHistory(history);
      }
      results.push({ target: target.name, ok });
    } catch(e) {
      console.error(`   ❌ Błąd na ${target.name}: ${e.message}`);
      results.push({ target: target.name, ok: false });
    }
  }

  await browser.close();

  const successCount = results.filter(r => r.ok).length;
  console.log(`\n📊 WYNIK PUBLIKACJI FB: ${successCount}/${results.length}`);
  process.exit(successCount > 0 ? 0 : 1);
}

if (process.argv[1]?.includes('publish_facebook.js')) {
  run().catch(e => {
    console.error('❌ Błąd krytyczny skryptu FB:', e.message);
    process.exit(1);
  });
}

module.exports = { formatPostText, getTodayData, publishPost };
