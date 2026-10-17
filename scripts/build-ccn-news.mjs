import { spawnSync } from 'node:child_process';
import { readdir, readFile, writeFile, copyFile, mkdir, symlink } from 'node:fs/promises';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { buildCcnStaticPages, loadArticles, generateStaticFeedSnippet } from './build-ccn-static-pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'portals/ccn-news');
const result = spawnSync(process.execPath, [path.join(source, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: source, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
for (const file of await readdir(path.join(source, 'dist/assets'))) {
  await copyFile(path.join(source, 'dist/assets', file), path.join(root, 'assets', file));
}
const { articles } = loadArticles();
const feedSnippet = generateStaticFeedSnippet(articles, 15);
let html = (await readFile(path.join(source, 'dist/index.html'), 'utf8')).replace(/\r\n/g, '\n').replace(/[\t ]+$/gm, '');
html = html.replace(
  '<span class="news-startup-status" role="status">Wczytywanie wiadomości</span>',
  '<span class="news-startup-status" role="status">Wczytywanie wiadomości</span>\n' + feedSnippet
);
await writeFile(path.join(root, 'news.html'), html);
await writeFile(path.join(root, 'news/index.html'), html);
await copyFile(path.join(source, 'public/data/ccn-public-feed.json'), path.join(root, 'data/ccn-public-feed.json'));
console.log('CCN News: canonical source built; both public entrypoints updated.');

const finanseSource = path.join(root, 'portals/ccn-finanse');
if (fs.existsSync(finanseSource)) {
  const finanseNodeModules = path.join(finanseSource, 'node_modules');
  if (!fs.existsSync(finanseNodeModules)) {
    await symlink(path.join(source, 'node_modules'), finanseNodeModules, 'junction');
  }
  const finResult = spawnSync(process.execPath, [path.join(source, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: finanseSource, stdio: 'inherit' });
  if (finResult.status !== 0) process.exit(finResult.status || 1);
  for (const file of await readdir(path.join(finanseSource, 'dist/assets'))) {
    await copyFile(path.join(finanseSource, 'dist/assets', file), path.join(root, 'assets', file));
  }
  const finHtml = (await readFile(path.join(finanseSource, 'dist/index.html'), 'utf8')).replace(/\r\n/g, '\n').replace(/[\t ]+$/gm, '');
  await mkdir(path.join(root, 'finanse'), { recursive: true });
  await writeFile(path.join(root, 'finanse.html'), finHtml);
  await writeFile(path.join(root, 'finanse/index.html'), finHtml);
  console.log('CCN Finanse: canonical source built; finanse.html and finanse/index.html updated.');
}

await buildCcnStaticPages();
console.log('CCN News & Finanse: static article pages (SSG) generated successfully.');
