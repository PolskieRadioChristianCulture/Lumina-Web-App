import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(new URL('../portals/ccn-news/package.json', import.meta.url));
const { build } = require('esbuild');

test('edge panel: real DOM lifecycle, focus, mobile breakpoint and contextual route', async () => {
  const bundle = await build({
    stdin: { resolveDir: path.resolve('portals/ccn-news'), loader: 'tsx', contents: `
      import React, {useState} from 'react';
      import {createRoot} from 'react-dom/client';
      import {CCMobileEdgePanel} from './src/components/CCMobileEdgePanel';
      function Fixture() {
        const [open, setOpen] = useState(false);
        const [count, setCount] = useState(0);
        window.rerenderPanel = () => setCount(n => n + 1);
        return <><button id="trigger" onClick={() => setOpen(true)}>Open</button>
          <span>{count}</span><CCMobileEdgePanel isOpen={open} onClose={() => setOpen(false)}
          activePath="/akademia/kurscodzienny" currentUser={{slug:'a&b'}}
          appearance={{background:'#ffffff',foreground:'#111111',accent:'#775500'}} /></>;
      }
      createRoot(document.getElementById('app')).render(<Fixture/>);
    ` }, bundle: true, write: false, format: 'iife', define: { 'process.env.NODE_ENV': '"test"' },
  });
  const browser = await chromium.launch({ headless: true, channel: process.env.CC_TEST_BROWSER_CHANNEL || 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 640 } });
    await page.route('**/*', route => route.abort());
    await page.setContent('<div id="app"></div>');
    if (process.env.CC_EDGE_CSS) await page.addStyleTag({ content: fs.readFileSync(process.env.CC_EDGE_CSS, 'utf8') });
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.locator('#trigger').waitFor();
    assert.equal(await page.locator('[role=dialog]').count(), 0, 'closed panel is absent');
    await page.locator('#trigger').click();
    const panel = page.locator('[role=dialog]');
    await panel.waitFor();
    await page.waitForFunction(() => document.activeElement?.getAttribute('aria-current') === 'page');
    assert.equal(await panel.locator('[aria-current=page]').getAttribute('href'), '/akademia');
    assert.equal(await panel.locator('a[href*="lumina-profile"]').getAttribute('href'), '/lumina-profile.html?u=a%26b');
    assert.equal(await page.locator('#app').evaluate(el => el.inert), true);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    assert.equal(await panel.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
    if (process.env.CC_EDGE_CSS) {
      const sizes = await panel.locator('a,button').evaluateAll(els => els.map(el => ({width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height})));
      assert.ok(sizes.every(size => size.width >= 44 && size.height >= 44), 'every touch target remains at least 44px');
      assert.ok(await panel.evaluate(el => el.scrollHeight > el.clientHeight), 'short phone scrolls rather than shrinking targets');
    }
    await panel.getByRole('button', {name: 'Zamknij panel nawigacji', exact: true}).focus();
    await page.evaluate(() => window.rerenderPanel());
    await page.waitForTimeout(80);
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Zamknij panel nawigacji');
    await page.keyboard.press('Escape');
    await panel.waitFor({ state: 'detached' });
    assert.equal(await page.locator('#app').evaluate(el => el.inert), false);
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'trigger');
    await page.locator('#trigger').click();
    await panel.waitFor();
    await page.setViewportSize({ width: 1024, height: 768 });
    await panel.waitFor({ state: 'detached' });
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  } finally { await browser.close(); }
});
