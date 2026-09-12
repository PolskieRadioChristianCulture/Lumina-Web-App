const { chromium } = require('C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\node_modules\\playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const webRoot = path.resolve(__dirname, '..');
const port = 8125;

const server = http.createServer((req, res) => {
    let filePath = path.join(webRoot, req.url.split('?')[0]);
    if (req.url === '/' || req.url === '') filePath = path.join(webRoot, 'index.html');
    if (!path.extname(filePath)) filePath += '.html';

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const map = {
            '.html': 'text/html; charset=utf-8',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
        };
        res.writeHead(200, { 'Content-Type': map[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const journeyFindings = {
    timestamp: new Date().toISOString(),
    testedJourneys: [],
    impressions: []
};

server.listen(port, async () => {
    console.log(`[Awatar Dowódcy - Wirtualny Tester] Serwer uruchomiony na porcie ${port}`);
    const browser = await chromium.launch({ headless: true });
    
    // Mobile Viewport (iPhone 14 standard: 390x844)
    const mobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    });
    const page = await mobileContext.newPage();
    const consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));

    try {
        // ── 1. STRONA GŁÓWNA (PolskieRadio.cc) ──
        console.log('📱 [Awatar] Testuję stronę główną PolskieRadio.cc na telefonie...');
        await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        // Test poziomego przewijania
        const scrollOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
        });

        // Test Menu Skrótów
        const actionsBtn = page.locator('#actionsToggleBtn');
        let menuOpensSmoothly = false;
        let menuAutoClosesOnScroll = false;

        if (await actionsBtn.count() > 0) {
            await actionsBtn.click();
            await page.waitForTimeout(400);
            menuOpensSmoothly = await page.evaluate(() => {
                const list = document.getElementById('actionsList');
                return list && (list.classList.contains('open') || window.getComputedStyle(list).opacity === '1');
            });

            // Scroll down to test auto-close
            await page.evaluate(() => window.scrollBy(0, 200));
            await page.waitForTimeout(400);
            menuAutoClosesOnScroll = await page.evaluate(() => {
                const list = document.getElementById('actionsList');
                return list && !list.classList.contains('open');
            });
        }

        // Test Akordeonu
        const firstTrigger = page.locator('.collapsible-trigger-bar').first();
        let accordionExpands = false;
        if (await firstTrigger.count() > 0) {
            await firstTrigger.click();
            await page.waitForTimeout(500);
            accordionExpands = await page.evaluate(() => {
                const openSec = document.querySelector('.collapsible-section.is-open');
                return !!openSec;
            });
        }

        journeyFindings.testedJourneys.push({
            target: 'PolskieRadio.cc (index.html)',
            hasHorizontalScroll: scrollOverflow,
            menuOpensSmoothly,
            menuAutoClosesOnScroll,
            accordionExpands,
            consoleErrorsCount: consoleErrors.length
        });

        // ── 2. PORTAL LUMINA & CENTRUM ROZMÓW ──
        console.log('📱 [Awatar] Wchodzę do Portalu LUMINA & testuję Centrum Rozmów...');
        await page.goto(`http://localhost:${port}/lumina.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);

        // Otwórz modal czatu
        await page.evaluate(() => {
            if (typeof window.openDirectMessagesModal === 'function') window.openDirectMessagesModal();
            else if (typeof window.openLuminaChatModal === 'function') window.openLuminaChatModal();
        });
        await page.waitForTimeout(800);

        // Kliknij Grupy
        const tabGroups = page.locator('#tabBtnGroupsChat');
        let groupsViewClean = false;
        if (await tabGroups.count() > 0) {
            await tabGroups.click();
            await page.waitForTimeout(800);
            groupsViewClean = await page.evaluate(() => {
                const privateView = document.getElementById('messengerPrivateView');
                const groupsView = document.getElementById('messengerGroupsView');
                const privateHidden = privateView && window.getComputedStyle(privateView).display === 'none';
                const groupsVisible = groupsView && window.getComputedStyle(groupsView).display === 'flex';
                return privateHidden && groupsVisible;
            });
        }

        // Kliknij Rozmowy Prywatne
        const tabPrivate = page.locator('#tabBtnPrivateChat');
        let singleLupaCheck = false;
        if (await tabPrivate.count() > 0) {
            await tabPrivate.click();
            await page.waitForTimeout(800);
            singleLupaCheck = await page.evaluate(() => {
                const input = document.getElementById('dmUserSearchInput');
                if (!input) return false;
                const ph = input.getAttribute('placeholder') || '';
                // Sprawdź czy placeholder nie ma emoji lupy
                return !ph.includes('🔍') && !ph.includes('🔎');
            });
        }

        journeyFindings.testedJourneys.push({
            target: 'LUMINA (Centrum Rozmów & Grupy)',
            groupsViewClean,
            singleLupaCheck
        });

        // ── 3. MOJABIBLIA (Pismo Święte & Interlinia) ──
        console.log('📱 [Awatar] Badam MojaBiblia na smartfonie...');
        await page.goto(`http://localhost:${port}/mojabiblia.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);

        const mbStatus = await page.evaluate(() => {
            const verses = document.querySelectorAll('.mb-verse-card').length;
            const hasStrongCodes = document.querySelectorAll('.mb-word').length > 0;
            return { verses, hasStrongCodes };
        });

        journeyFindings.testedJourneys.push({
            target: 'MojaBiblia CC',
            versesCount: mbStatus.verses,
            hasStrongCodes: mbStatus.hasStrongCodes
        });

        console.log('✅ [Awatar] Wszystkie ścieżki użytkownika przetestowane pomyślnie!');
    } catch (e) {
        console.error('Błąd podczas testu:', e);
    } finally {
        await browser.close();
        server.close();
    }

    const reportPath = path.join(webRoot, 'scratch', 'avatar_journey_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(journeyFindings, null, 2));
    console.log('[Awatar] Raport z podróży użytkownika zapisany w scratch/avatar_journey_report.json');
});
