/**
 * publish_facebook_ccn_news.js — Emisja nowości ekosystemu Christian Culture na Facebooku
 * 
 * Standard JOMA-D005 / Dowódca Nazir (31.10.2026):
 * „Jeśli koniecznie mamy publikować częściej na Facebooku, a dobrze by było publikować
 *  raz na godzinę mniej więcej, no to trzeba zastosować tą samą opcję jak w publikacji
 *  na platformie X.”
 * 
 * Zakres: Rotacyjne publikowanie unikalnych nowości z całego ekosystemu
 *         (CCN News, Historia, Nauka, Biologia, Prawo, Biblia Audio, Akademia, MojaBiblia, VOD)
 * Ochrona: Pełny rejestr data/fb_ccn_published_history.json — ZERO DUPLIKATÓW!
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const FB_PAGES = [
  { name: 'Profil osobisty',         url: 'https://www.facebook.com/cezary.rogowski1' },
  { name: 'Radio Christian Culture', url: 'https://www.facebook.com/RadioChristianCulture', isPage: true },
  { name: 'Christian Culture App',   url: 'https://www.facebook.com/ChristianCultureApp',   isPage: true }
];

const ROOT_CC = path.resolve(__dirname, '..', 'polskieradio.cc');
const CATALOG_PATH = path.join(ROOT_CC, 'szukaj', 'catalog.json');
const ARTICLES_TS_PATH = path.join(ROOT_CC, 'portals', 'ccn-news', 'src', 'data', 'articles.ts');
const DEFAULT_BADGE_PATH = path.join(ROOT_CC, 'images', 'news', 'ccn-news-official-badge.jpg');
const HISTORY_FILE = path.join(__dirname, 'data', 'fb_ccn_published_history.json');
const SESSION_PATH = path.join(__dirname, 'fb_session.json');

function loadHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
      return Array.isArray(data) ? data : (data.published || []);
    } catch(e) {}
  }
  return [];
}

function saveHistory(history) {
  try {
    const dir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({ version: '1.0', published: history }, null, 2), 'utf8');
  } catch(e) {
    console.error('Błąd zapisu historii FB CCN:', e.message);
  }
}

function getAllCandidates() {
  const candidates = [];
  const seenUrls = new Set();

  function addCandidate(item) {
    if (!item.url || seenUrls.has(item.url)) return;
    seenUrls.add(item.url);
    candidates.push(item);
  }

  // 1. Moduły główne
  const coreModules = [
    {
      title: 'Portal Informacyjny CCN News — Wiadomości, Analizy i Rzetelna Publicystyka',
      url: 'https://polskieradio.cc/news',
      lead: 'Niezależne chrześcijańskie dziennikarstwo, fakty bez cenzury i komentarze w świetle Pisma Świętego.',
      category: 'Wiadomości',
      tag: '#CCNNews'
    },
    {
      title: 'Biblia Audio CC — Księga Rodzaju w Kinowej Jakości Dźwięku 3D',
      url: 'https://polskieradio.cc/biblia-audio',
      lead: 'Trwa produkcja pierwszego kinowego słuchowiska Pisma Świętego od Księgi Rodzaju. Posłuchaj pierwszych rozdziałów lub zostań patronem nagrania!',
      category: 'Biblia Audio',
      tag: '#BibliaAudio'
    },
    {
      title: 'Akademia Biblijna & Kurs Codzienny — Systematyczne Studium Słowa Bożego',
      url: 'https://polskieradio.cc/akademia',
      lead: 'Codzienna dawka wiedzy biblijnej, komentarze werset po wersecie oraz bezpłatne kursy formacyjne dla każdego.',
      category: 'Akademia',
      tag: '#AkademiaBiblijna'
    },
    {
      title: 'Interlinearna MojaBiblia — Kody Stronga, Greka, Hebrajski i Przekład UBG',
      url: 'https://polskieradio.cc/mojabiblia',
      lead: 'Nowoczesne cyfrowe narzędzie do wnikliwego badania tekstu Pisma Świętego w językach oryginalnych.',
      category: 'Pismo Święte',
      tag: '#MojaBiblia'
    },
    {
      title: 'Polskie Radio CC — Odtwarzacz Muzyki Chrześcijańskiej i Transmisje 24/7',
      url: 'https://polskieradio.cc/player',
      lead: 'Muzyka uwielbienia, Biblia Śpiewana, nocny kanał Ambient Sleep oraz codzienne rozważania w jakości HD.',
      category: 'Radio',
      tag: '#PolskieRadioCC'
    },
    {
      title: 'Kino Chrześcijańskie VOD — Filmy Fabularne, Dokumenty i Wykłady Biblijne',
      url: 'https://polskieradio.cc/vod',
      lead: 'Wartościowe kino chrześcijańskie, ekranizacje biblijne i serie wykładów Apokalipsa SDS bez opłat.',
      category: 'Kino VOD',
      tag: '#KinoVOD'
    }
  ];

  for (const mod of coreModules) addCandidate(mod);

  // 2. Artykuły CCN News z pliku articles.ts
  if (fs.existsSync(ARTICLES_TS_PATH)) {
    try {
      const tsContent = fs.readFileSync(ARTICLES_TS_PATH, 'utf8');
      const articleBlocks = tsContent.split(/\{\s*id:\s*['"`]/);
      for (const block of articleBlocks.slice(1)) {
        const idMatch = block.match(/^([^'"`]+)/);
        const titleMatch = block.match(/title:\s*['"`](.*?)['"`]/);
        const leadMatch = block.match(/lead:\s*['"`](.*?)['"`]/) || block.match(/excerpt:\s*['"`](.*?)['"`]/);
        const portalMatch = block.match(/portal:\s*['"`](.*?)['"`]/);

        if (idMatch && titleMatch) {
          const id = idMatch[1];
          const title = titleMatch[1];
          const lead = leadMatch ? leadMatch[1] : '';
          const portal = portalMatch ? portalMatch[1] : 'news';
          const url = `https://polskieradio.cc/${portal}/${id}`;
          addCandidate({ title, url, lead, category: `CCN ${portal.toUpperCase()}`, tag: `#${portal}` });
        }
      }
    } catch(e) {}
  }

  // 3. Pozycje z katalogu wyszukiwarki
  if (fs.existsSync(CATALOG_PATH)) {
    try {
      const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
      const items = catalog.items || catalog;
      if (Array.isArray(items)) {
        for (const item of items) {
          if (!item.title || !item.url) continue;
          let fullUrl = item.url;
          if (!fullUrl.startsWith('http')) {
            fullUrl = `https://polskieradio.cc${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
          }
          addCandidate({
            title: item.title,
            url: fullUrl,
            lead: item.description || item.subtitle || '',
            category: item.category || 'Ekosystem',
            tag: '#EkoCC'
          });
        }
      }
    } catch(e) {}
  }

  return candidates;
}

function getNextUnbroadcastedItem() {
  const candidates = getAllCandidates();
  const history = loadHistory();
  const publishedUrls = new Set(history.map(h => (typeof h === 'string' ? h : h.url)));

  const unbroadcasted = candidates.filter(c => !publishedUrls.has(c.url));
  console.log(`📊 Baza nowości Ekosystemu FB: ${candidates.length} pozycji, opublikowano wcześniej: ${publishedUrls.size}, pozostało: ${unbroadcasted.length}`);

  if (unbroadcasted.length > 0) {
    return { item: unbroadcasted[0], totalLeft: unbroadcasted.length };
  }

  // Jeśli wyczerpano całą pulę — restart rotacji od najstarszego
  return { item: candidates[0], totalLeft: 0, resetLoop: true };
}

function formatFacebookPost(item) {
  const lines = [
    `🔴 CCN NEWS | polskieradio.cc/news\n`,
    `📖 *${item.title}*\n`
  ];

  if (item.lead && item.lead.length > 10) {
    lines.push(`${item.lead}\n`);
  }

  lines.push(`🔗 Czytaj / Słuchaj całości w ekosystemie Christian Culture:`);
  lines.push(`${item.url}\n`);
  lines.push(`#ChristianCulture #CCNNews #PolskieRadioCC #Biblia #Wiadomosci ${item.tag || ''}`);

  return lines.join('\n');
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
    console.log(`   🖼️ Załączam oficjalną grafikę: ${path.basename(imagePath)}...`);
    const fileInput = await page.$('div[role="dialog"] input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile(imagePath);
      await new Promise(r => setTimeout(r, 5000));
      console.log("   ✅ Grafika załączona pomyślnie.");
    }
  }

  // 2. Wprowadzanie tekstu z podziałem akapitowym
  console.log("   ✍️ Wprowadzam sformatowany tekst nowości CCN...");
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
    console.log("   🔘 Kliknięto 'Dalej'...");
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
  console.log("   🔘 Klikam 'Opublikuj'...");
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
  console.log(`   ✅ Post nowości CCN opublikowany na: ${targetName}!`);
  return true;
}

async function run() {
  const { item, totalLeft } = getNextUnbroadcastedItem();
  console.log(`\n📢 Wybrana nowość CCN na Facebooka:`);
  console.log(`   Tytuł: "${item.title}"`);
  console.log(`   Link: ${item.url}`);

  const postText = formatFacebookPost(item);
  const imagePath = fs.existsSync(DEFAULT_BADGE_PATH) ? DEFAULT_BADGE_PATH : null;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=pl-PL']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });

  if (fs.existsSync(SESSION_PATH)) {
    try {
      let raw = fs.readFileSync(SESSION_PATH, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
      const cookies = JSON.parse(raw);
      await page.setCookie(...cookies);
      console.log(`🔑 Wczytano ${cookies.length} ciasteczek z fb_session.json.`);
    } catch(e) {
      console.error('Błąd ciasteczek:', e.message);
    }
  }

  const results = [];
  for (const target of FB_PAGES) {
    console.log(`\n📢 Otwieram cel: ${target.name} (${target.url})`);
    try {
      await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 4000));

      if (target.isPage) {
        const switchClicked = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
          const btn = buttons.find(b => (b.innerText || '').trim() === 'Przełącz' || (b.innerText || '').trim() === 'Przełącz teraz');
          if (btn) { btn.click(); return true; }
          return false;
        });

        if (switchClicked) {
          console.log(`   🔄 Przełączam profil na: ${target.name}...`);
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

      const ok = await publishPost(page, postText, imagePath, target.name);
      results.push({ target: target.name, ok });
    } catch(e) {
      console.error(`   ❌ Błąd publikacji na ${target.name}: ${e.message}`);
      results.push({ target: target.name, ok: false });
    }
  }

  await browser.close();

  const successCount = results.filter(r => r.ok).length;
  if (successCount > 0) {
    const history = loadHistory();
    history.push({
      url: item.url,
      title: item.title,
      publishedAt: new Date().toISOString()
    });
    saveHistory(history);
    console.log(`\n🎉 Pomyślnie wyemitowano nowość CCN na Facebooku (${successCount}/${results.length})! Zapisano do historii.`);
  }

  process.exit(successCount > 0 ? 0 : 1);
}

if (process.argv[1]?.includes('publish_facebook_ccn_news.js')) {
  run().catch(e => {
    console.error('❌ Błąd krytyczny skryptu FB CCN:', e.message);
    process.exit(1);
  });
}

module.exports = { formatFacebookPost, getAllCandidates, getNextUnbroadcastedItem };
