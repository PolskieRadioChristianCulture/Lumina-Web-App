import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {prepareStaticRelease} from './ccn-static-release.mjs';
export function verifyStagedRelease(queue, review, feed, now) {
  const expected = prepareStaticRelease(queue, review, now);
  if (feed?.schemaVersion !== expected.schemaVersion || feed.visibility !== expected.visibility || JSON.stringify(feed.items) !== JSON.stringify(expected.items)) throw Error('Wydanie zmieniło się albo zawiera materiał wycofany, skorygowany lub niezatwierdzony');
  return expected.items.length;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [directory, stagedDirectory] = process.argv.slice(2);
  if (!directory || !stagedDirectory) throw Error('Podaj prywatny katalog kolejki i pakiet do ponownego odbioru');
  const queue = JSON.parse(await fs.readFile(path.join(directory,'queue.json'),'utf8'));
  const review = JSON.parse(await fs.readFile(path.join(stagedDirectory,'release-review.json'),'utf8'));
  const feed = JSON.parse(await fs.readFile(path.join(stagedDirectory,'ccn-public-feed.json'),'utf8'));
  console.log(`Sprawdzone ${verifyStagedRelease(queue,review,feed,new Date().toISOString())} materiałów. Ta kontrola nie publikuje.`);
}
