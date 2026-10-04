import snapshot from './data/verifiedCatalogue.json';
export type Track = typeof snapshot[number];
export const catalogue = snapshot;
export function readFavorites(raw: string | null, allowed = new Set(catalogue.map(t => t.id))): string[] {
  try { const value = JSON.parse(raw || '[]'); return Array.isArray(value) ? [...new Set(value.filter(x => typeof x === 'string' && allowed.has(x)))] : []; } catch { return []; }
}
export function findTracks(items: Track[], query: string, group: string, favorites?: string[]) {
  const normalize = (text: string) => text.toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  return items.filter(t => (group === 'Wszystko' || t.group === group) && (!favorites || favorites.includes(t.id)) && words.every(w => normalize(t.title + ' ' + t.artist).includes(w)));
}
export function addToQueue(queue: string[], id: string) { return queue.includes(id) ? queue : [...queue, id]; }
export function nextInQueue(queue: string[], id: string, direction: number) { const current = queue.indexOf(id); if (current < 0) return null; const index = current + direction; return index >= 0 && index < queue.length ? queue[index] : null; }
export const routeMap = { home: '/music', library: '/music/przeboje', artists: '/music/artysci', collections: '/music/playlisty', radio: '/music/radio', favorites: '/music/ulubione' } as const;
export type View = keyof typeof routeMap;
export function viewFromPath(path: string): View {
  const clean = path.replace(/\/+$/, '');
  if (/\/(premiery|video|top)$/.test(clean)) return 'library';
  return (Object.entries(routeMap).find(([, value]) => value === clean)?.[0] || 'home') as View;
}
