import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test, { before, after } from 'node:test';
import { chromium } from 'playwright';

let browser;
before(async () => { browser = await chromium.launch({ headless: true }); });
after(async () => { await browser?.close(); });

async function readerPage(t, html) {
    const page = await browser.newPage();
    t.after(() => page.close());
    await page.setContent(html);
    await page.evaluate(() => {
        window.readParts = [];
        window.utterances = [];
        window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
        Object.defineProperty(window, 'speechSynthesis', { value: {
            speaking: false, paused: false,
            getVoices: () => [{ lang: 'pl-PL', name: 'Polski' }],
            addEventListener() {},
            cancel() { this.speaking = false; this.paused = false; },
            pause() { this.paused = true; },
            resume() { this.paused = false; },
            speak(utterance) {
                this.speaking = true;
                window.readParts.push(utterance.text);
                window.utterances.push(utterance);
                window.currentUtterance = utterance;
            }
        }, configurable: true });
    });
    await page.addStyleTag({ path: 'css/lumina-reflection-tts.css' });
    await page.addScriptTag({ path: 'js/lumina-reflection-tts.js' });
    await page.addScriptTag({ path: 'js/lumina-speech-reader.js' });
    return page;
}

test('collapsed full reflection is read through the final prayer, without teaser or duplicate reader', async t => {
    const text = `${'To pełne zdanie rozważania o wierze i miłości. '.repeat(80)}Ostatnia modlitwa: Panie, prowadź nas. Amen.`;
    const page = await readerPage(t, `<article class="post-card-1x1"><h3 class="post-headline">Dobrze, że jesteś</h3><div class="post-desc-text">TO JEST SKRÓT</div><div class="daily-reflection-fulltext" style="display:none"><p>${text}</p><button>Nie czytaj przycisku</button></div></article>`);
    assert.equal(await page.locator('.lumina-reflection-tts-btn').count(), 1);
    assert.equal(await page.locator('.lumina-tts-btn').count(), 0);
    await page.locator('.lumina-reflection-tts-btn').click();
    const spoken = await page.evaluate(async () => {
        for (let i = 0; i < 100 && document.querySelector('button').dataset.state === 'speaking'; i++) {
            const utterance = window.currentUtterance;
            window.currentUtterance = null;
            if (utterance) utterance.onend();
            await new Promise(resolve => setTimeout(resolve, 40));
        }
        return window.readParts;
    });
    assert.equal(spoken.join(' '), text);
    assert.ok(spoken.length > 10);
    assert.ok(spoken.every(part => part.length <= 220));
    assert.equal(await page.locator('.lumina-reflection-tts-btn').getAttribute('data-state'), 'idle');
});

test('pause between chunks and stale callbacks cannot interrupt a different reflection', async t => {
    const page = await readerPage(t, [1, 2].map(id => `<article id="r${id}" class="post-card reflection-post-card"><h3 class="post-title">Rozważanie ${id}</h3><div class="post-content">${'Długie rozważanie. '.repeat(30)}</div></article>`).join(''));
    await page.locator('#r1 button').click();
    await page.evaluate(() => {
        window.currentUtterance.onend();
        document.querySelector('#r1 button').click();
    });
    await page.waitForTimeout(80);
    assert.equal(await page.evaluate(() => window.readParts.length), 1);
    assert.equal(await page.locator('#r1 button').getAttribute('data-state'), 'paused');
    await page.locator('#r1 button').click();
    assert.equal(await page.evaluate(() => window.readParts.length), 2);
    await page.locator('#r2 button').click();
    await page.evaluate(() => { window.utterances[0].onerror({ error: 'network' }); window.utterances[0].onend(); });
    assert.equal(await page.locator('#r2 button').getAttribute('data-state'), 'speaking');
    assert.equal(await page.locator('#r1 button').getAttribute('data-state'), 'idle');
});

test('dynamic updates keep every reflection decorated once and restore a replaced title', async t => {
    const page = await readerPage(t, '<main></main>');
    await page.evaluate(async () => {
        for (let id = 0; id < 3; id++) {
            document.querySelector('main').insertAdjacentHTML('beforeend', `<article class="post-card reflection-post-card"><h3 class="post-title">Refleksja</h3><div class="post-content">Pełne rozważanie z ostatnią modlitwą.</div></article>`);
            await new Promise(resolve => setTimeout(resolve, 20));
        }
    });
    await page.waitForFunction(() => document.querySelectorAll('.lumina-reflection-tts-btn').length === 3);
    await page.evaluate(() => document.querySelector('.post-title').innerHTML = 'Nowy tytuł');
    await page.waitForFunction(() => document.querySelectorAll('.lumina-reflection-tts-btn').length === 3);
    assert.equal(await page.locator('.lumina-tts-btn').count(), 0);
});

test('support button moves from actions onto late-loaded artwork, in its lower-left corner', async t => {
    const page = await browser.newPage();
    t.after(() => page.close());
    for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.setContent('<article class="post-card" style="width:100%;max-width:600px"><footer class="post-footer"></footer></article>');
        await page.addScriptTag({ path: 'js/lumina-support-project.js' });
        assert.equal(await page.locator('.post-footer > .lumina-support-project-btn').count(), 1);
        await page.evaluate(() => document.querySelector('article').insertAdjacentHTML('afterbegin', '<div class="media-container-1x1" style="height:320px;background:#234"><img class="post-image" alt="Grafika"></div>'));
        await page.waitForFunction(() => document.querySelector('.media-container-1x1 > .lumina-support-project-btn'));
        assert.equal(await page.locator('.lumina-support-project-btn').count(), 1);
        const bounds = await page.locator('.media-container-1x1').boundingBox();
        const button = await page.locator('.lumina-support-project-btn').boundingBox();
        const inset = width <= 768 ? 10 : 12;
        assert.ok(Math.abs(button.x - bounds.x - inset) < 1);
        assert.ok(Math.abs(bounds.y + bounds.height - button.y - button.height - inset) < 1);
        await page.locator('.lumina-support-project-btn').click();
        assert.equal(await page.locator('#luminaSupportProjectModal').isVisible(), true);
        assert.equal(await page.locator('.lumina-support-method').count(), 3);
    }
});

test('support action follows media and reflection reader uses full text', async () => {
    const support = await readFile('js/lumina-support-project.js', 'utf8');
    const tts = await readFile('js/lumina-reflection-tts.js', 'utf8');
    const css = await readFile('css/lumina-reflection-tts.css', 'utf8');
    const tablica = await readFile('lumina-tablica.html', 'utf8');
    const profile = await readFile('lumina-profile.html', 'utf8');

    assert.match(support, /const host = mediaHosts\[0\]/);
    assert.match(support, /host\.appendChild\(button\)/);
    assert.match(support, /ownerCard/);
    assert.match(tts, /\.daily-reflection-fulltext/);
    assert.ok(tts.indexOf("'.daily-reflection-fulltext'") < tts.indexOf("'.post-desc-text'"));
    assert.doesNotMatch(tts, /cleanText\(title\)/);
    assert.match(tts, /const source = findFullText\(card\)/);
    assert.match(css, /\.lumina-reflection-tts-btn/);
    for (const html of [tablica, profile]) {
        assert.match(html, /js\/lumina-reflection-tts\.js/);
        assert.match(html, /css\/lumina-reflection-tts\.css/);
        assert.match(html, /support_project_v3/);
    }
});
