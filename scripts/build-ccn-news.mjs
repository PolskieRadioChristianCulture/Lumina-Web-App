import { spawnSync } from 'node:child_process';
import { readdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'portals/ccn-news');
const result = spawnSync(process.execPath, [path.join(source, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: source, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
for (const file of await readdir(path.join(source, 'dist/assets'))) {
  await copyFile(path.join(source, 'dist/assets', file), path.join(root, 'assets', file));
}
const html = (await readFile(path.join(source, 'dist/index.html'), 'utf8')).replace(/\r\n/g, '\n').replace(/[\t ]+$/gm, '');
await writeFile(path.join(root, 'news.html'), html);
await writeFile(path.join(root, 'news/index.html'), html);
console.log('CCN News: canonical source built; both public entrypoints updated.');
