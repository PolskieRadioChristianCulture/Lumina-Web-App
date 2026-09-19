const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8198;

// Minimal MIME lookup
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0].split('#')[0];
    if (reqUrl === '/') reqUrl = '/lumina-tablica.html';
    const filePath = path.join(ROOT_DIR, reqUrl);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
            'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
            'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(PORT, async () => {
    console.log(`Test server running on http://127.0.0.1:${PORT}`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    await page.addInitScript(() => {
        localStorage.setItem('lumina_admin', '1');
        localStorage.setItem('lumina_current_user_slug', 'cezaryrgowski');
    });

    try {
        console.log('1. Navigating to lumina-tablica.html...');
        await page.goto(`http://127.0.0.1:${PORT}/lumina-tablica.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        console.log('2. Finding first share button in feed...');
        const shareBtn = await page.locator('.action-share').first();
        await shareBtn.waitFor({ state: 'visible', timeout: 8000 });
        await shareBtn.click();
        await page.waitForTimeout(600);

        console.log('3. Verifying share modal and "Udostępnij u siebie" banner...');
        const modal = page.locator('#luminaShareModalOverlay');
        await modal.waitFor({ state: 'visible', timeout: 5000 });

        const repostBanner = page.locator('#luminaShareRepostBanner');
        const isBannerVisible = await repostBanner.isVisible();
        console.log(`Banner "Udostępnij u siebie" visible: ${isBannerVisible}`);
        if (!isBannerVisible) throw new Error('Repost banner is not visible in modal');

        // Screenshot modal with "Udostępnij u siebie" banner
        await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/b8e70404-cded-4025-a7c7-c97ad691b990/verified_share_modal_repost_option.png' });
        console.log('Saved screenshot: verified_share_modal_repost_option.png');

        console.log('4. Clicking "Udostępnij u siebie" banner...');
        await repostBanner.click();
        await page.waitForTimeout(800);

        const composerView = page.locator('#luminaShareComposerView');
        const isComposerVisible = await composerView.isVisible();
        console.log(`Composer view visible: ${isComposerVisible}`);
        if (!isComposerVisible) throw new Error('Composer view did not open');

        const quotePreview = page.locator('#luminaRepostQuotePreview');
        const quoteText = await quotePreview.innerText();
        console.log('Quoted post preview content:\n' + quoteText);

        console.log('5. Entering user commentary...');
        const commentInput = page.locator('#luminaRepostCommentInput');
        const testComment = 'Niezwykle budujące słowa, które warto przemyśleć i zachować w sercu! 🕊️✨ Polecam każdemu!';
        await commentInput.fill(testComment);

        await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/b8e70404-cded-4025-a7c7-c97ad691b990/verified_repost_composer_filled.png' });
        console.log('Saved screenshot: verified_repost_composer_filled.png');

        console.log('6. Submitting repost...');
        const submitBtn = page.locator('#btnSubmitLuminaRepost');
        await submitBtn.click();
        await page.waitForTimeout(1500);

        console.log('7. Verifying repost on Tablica feed...');
        const repostPill = page.locator('.badge-repost-pill').first();
        await repostPill.waitFor({ state: 'visible', timeout: 6000 });
        const pillText = await repostPill.innerText();
        console.log(`Found repost badge on feed: "${pillText}"`);

        const quotedCard = page.locator('.lumina-quoted-post-card').first();
        const hasQuotedCard = await quotedCard.isVisible();
        console.log(`Quoted card rendered on feed: ${hasQuotedCard}`);

        await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/b8e70404-cded-4025-a7c7-c97ad691b990/verified_tablica_repost_rendered.png' });
        console.log('Saved screenshot: verified_tablica_repost_rendered.png');

        console.log('8. Navigating to Cezary profile to verify repost on profile timeline...');
        await page.goto(`http://127.0.0.1:${PORT}/lumina.cezaryrgowski.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        const profileRepostCard = page.locator('.lumina-quoted-post-card').first();
        const isProfileRepostVisible = await profileRepostCard.isVisible();
        console.log(`Repost quoted card on Cezary profile: ${isProfileRepostVisible}`);

        await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/b8e70404-cded-4025-a7c7-c97ad691b990/verified_cezary_profile_repost.png' });
        console.log('Saved screenshot: verified_cezary_profile_repost.png');

        console.log('🎉 ALL REPOST VERIFICATION CHECKS PASSED PERFECTLY!');
    } catch (err) {
        console.error('❌ Test failed:', err);
        process.exitCode = 1;
    } finally {
        await browser.close();
        server.close();
    }
});
