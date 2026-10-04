import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { buildPublishingProjection } from './ccn-ecosystem-import.mjs';

export function digest(item) {
  return createHash('sha256').update(JSON.stringify(item)).digest('hex');
}

// A release allowlist is a review artifact, not authentication. Publication still
// requires the owner's separate approval through the existing repository/deploy path.
export function prepareStaticRelease(queue, review, now) {
  if (review?.schemaVersion !== 1 || !Array.isArray(review.items)) throw new Error('Invalid release review');
  const candidates = buildPublishingProjection(queue, now).items;
  const byId = new Map(candidates.map(item => [item.id, item]));
  const selected = new Set();
  const items = review.items.map(selection => {
    const item = byId.get(selection.id);
    if (!item || selected.has(item.id) || selection.sha256 !== digest(item)) throw new Error('Changed, duplicate, future or unapproved item');
    selected.add(item.id);
    if (['id', 'title', 'summary', 'canonicalUrl', 'channel', 'publicationDay'].some(key => typeof item[key] !== 'string') || !item.title.trim() || item.title.length > 500 || item.summary.length > 360) throw new Error('Invalid public fields');
    const url = new URL(item.canonicalUrl);
    if (url.protocol !== 'https:' || url.username || url.password || !['polskieradio.cc', 'youtube.com', 'www.youtube.com'].includes(url.hostname)) throw new Error('Invalid public URL');
    // Explicit public fields only; no audit, queue, editor identity or profile data.
    return { id: item.id, title: item.title, summary: item.summary, canonicalUrl: item.canonicalUrl, channel: item.channel, publicationDay: item.publicationDay, author: item.author || '', type: item.type };
  });
  return { schemaVersion: 1, visibility: 'public-editorially-reviewed', generatedAt: now, items };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [queuePath, reviewPath, outputPath] = process.argv.slice(2);
  if (!queuePath || !reviewPath || !outputPath) throw new Error('Provide private queue, reviewed release allowlist and staging output paths');
  const queue = JSON.parse(await fs.readFile(queuePath, 'utf8'));
  const review = JSON.parse(await fs.readFile(reviewPath, 'utf8'));
  const output = prepareStaticRelease(queue, review, new Date().toISOString());
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2) + '\n', { flag: 'wx' });
  console.log(`Staged ${output.items.length} reviewed items; publication requires owner release approval.`);
}
