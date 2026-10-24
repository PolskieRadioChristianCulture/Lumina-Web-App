import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../Halloween/app.js', import.meta.url), 'utf8');
function page({ share, clipboard } = {}) {
  const nodes = Object.fromEntries(['lightActionPost', 'copyLightAction', 'shareLightAction', 'toast', 'year', 'copyPost', 'postcopy', 'sharePage', 'shareArticle'].map(id => [id, { textContent: '', classList: { add() {}, remove() {} } }]));
  nodes.lightActionPost.textContent = 'Płynę pod prąd — promuję światłość! #AntyHALLOWEEN';
  nodes.postcopy.innerText = 'Dotychczasowy wpis';
  const copied = [];
  vm.runInNewContext(source, {
    document: { getElementById: id => nodes[id] },
    navigator: { share, clipboard: clipboard ?? { writeText: async value => copied.push(value) } },
    setTimeout: () => 1, clearTimeout() {}, Date
  });
  return { nodes, copied };
}
test('copies the campaign text and preserves existing copy action', async () => {
  const { nodes, copied } = page();
  await nodes.copyLightAction.onclick();
  await nodes.copyPost.onclick();
  assert.deepEqual(copied, [nodes.lightActionPost.textContent, 'Dotychczasowy wpis']);
});
test('native sharing includes campaign text and direct section link', async () => {
  let payload;
  const { nodes, copied } = page({ share: async data => { payload = data; } });
  await nodes.shareLightAction.onclick();
  assert.equal(payload.url, 'https://polskieradio.cc/Halloween#plyne-pod-prad');
  assert.equal(payload.text, nodes.lightActionPost.textContent);
  assert.equal(copied.length, 0);
});
test('cancellation does not copy or report success', async () => {
  const { nodes, copied } = page({ share: async () => { throw { name: 'AbortError' }; } });
  await nodes.shareLightAction.onclick();
  assert.equal(copied.length, 0);
  assert.equal(nodes.toast.textContent, '');
});
test('unavailable sharing falls back to section URL; clipboard denial gives manual instruction', async () => {
  const normal = page();
  await normal.nodes.shareLightAction.onclick();
  assert.deepEqual(normal.copied, ['https://polskieradio.cc/Halloween#plyne-pod-prad']);
  const denied = page({ clipboard: { writeText: async () => { throw Error('denied'); } } });
  await denied.nodes.copyLightAction.onclick();
  assert.match(denied.nodes.toast.textContent, /ręcznie/);
});
