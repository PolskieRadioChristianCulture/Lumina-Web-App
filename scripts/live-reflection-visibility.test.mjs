import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { Window } from 'happy-dom';

const source = readFileSync('live-window-manager.js', 'utf8');

for (const stored of [null, {tx:12,ty:18,w:'520px',h:'780px',min:true}, {tx:0,ty:0,min:false}]) {
  test(`essential reflection stays visible; other widgets retain state: ${JSON.stringify(stored)}`, () => {
    const w = new Window();
    try {
      w.document.body.innerHTML = '<div id="app-container"><div class="reflection-canvas-card" data-window-always-visible="true"></div><div id="livePrayerOverlay"></div></div>';
      if (stored) w.localStorage.setItem('live_win_cfg_reflection-canvas-card', JSON.stringify(stored));
      const prayerState = JSON.stringify({tx:20,ty:30,w:'760px',h:'200px',min:true});
      w.localStorage.setItem('live_win_cfg_livePrayerOverlay', prayerState);
      w.localStorage.setItem('dzj_stream_image', 'operator-background.jpg');
      const context = vm.createContext({ window:w, document:w.document, navigator:w.navigator, localStorage:w.localStorage, setInterval(){}, console });
      vm.runInContext(source, context);
      w.initLiveWindowManager();
      const card = w.document.querySelector('.reflection-canvas-card');
      assert.equal(card.classList.contains('live-win-minimized'), false);
      assert.equal(card.querySelector('.min-btn'), null);
      assert.ok(card.querySelector('.drag-handle'));
      assert.ok(card.querySelector('.live-win-resize-handle'));
      if (stored?.w) assert.equal(card.style.width, stored.w);
      if (stored?.tx) assert.match(card.style.transform, /translate\(12px, 18px\)/);
      assert.equal(w.document.getElementById('livePrayerOverlay').classList.contains('live-win-minimized'), true);
      assert.equal(w.localStorage.getItem('live_win_cfg_livePrayerOverlay'), prayerState);
      assert.equal(w.localStorage.getItem('dzj_stream_image'), 'operator-background.jpg');
      if (stored) assert.equal(w.localStorage.getItem('live_win_cfg_reflection-canvas-card'), JSON.stringify(stored));
      w.initLiveWindowManager();
      assert.equal(card.querySelectorAll('.live-win-controls').length, 1);
    } finally { w.happyDOM.abort(); }
  });
}

test('only the requested antenna opts in and requests the corrected script version', () => {
  const page = readFileSync('zapolske-live.html', 'utf8');
  assert.match(page, /class="reflection-canvas-card" data-window-always-visible="true"/);
  assert.match(page, /live-window-manager\.js\?v=20261019_reflection1/);
  for (const other of ['cctv24.html', 'cctv24-pl.html', 'cctv24-worship.html']) {
    assert.doesNotMatch(readFileSync(other, 'utf8'), /data-window-always-visible="true"/);
  }
});
