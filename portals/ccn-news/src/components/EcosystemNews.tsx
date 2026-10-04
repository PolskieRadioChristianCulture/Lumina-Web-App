import React, { useEffect, useState } from 'react';

type Entry = { id: string; title: string; summary: string; canonicalUrl: string; channel: string; publicationDay: string; author?: string; type?: string };
export function readFeed(value: unknown): Entry[] {
  if (!value || typeof value !== 'object' || (value as any).schemaVersion !== 1 || (value as any).visibility !== 'public-editorially-reviewed' || !Array.isArray((value as any).items)) return [];
  const seen = new Set<string>();
  return (value as any).items.slice(0, 100).filter((item: any) => {
    if (!item || ['id', 'title', 'summary', 'canonicalUrl', 'channel', 'publicationDay'].some(key => typeof item[key] !== 'string')) return false;
    if (!item.title.trim() || item.title.length > 500 || item.summary.length > 360 || seen.has(item.id)) return false;
    try {
      const url = new URL(item.canonicalUrl);
      if (url.protocol !== 'https:' || url.username || url.password || !['polskieradio.cc', 'youtube.com', 'www.youtube.com'].includes(url.hostname)) return false;
    } catch { return false; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.publicationDay)) return false;
    const date = new Date(item.publicationDay + 'T00:00:00Z');
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== item.publicationDay || item.publicationDay > new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(new Date())) return false;
    seen.add(item.id);
    return true;
  });
}

export const EcosystemNews: React.FC = () => {
  const [items, setItems] = useState<Entry[]>([]);
  const [channel, setChannel] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    fetch('/data/ccn-public-feed.json', { signal: controller.signal, cache: 'no-cache', credentials: 'omit' })
      .then(response => { if (!response.ok) throw new Error('Feed unavailable'); return response.json(); })
      .then(value => setItems(readFeed(value)))
      .catch(() => {})
      .finally(() => window.clearTimeout(timeout));
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, []);
  if (!items.length) return null;
  return <section aria-labelledby="cc-ecosystem-news" className="my-10 min-w-0">
    <h2 id="cc-ecosystem-news" className="mb-5 text-2xl font-bold font-serif">Z ekosystemu Christian Culture</h2>
    <label className="mb-5 flex flex-wrap items-center gap-3 text-sm font-medium">Wybierz dział
      <select value={channel} onChange={event => { setChannel(event.target.value); setVisibleCount(6); }} className="max-w-full min-h-11 rounded border border-gray-300 bg-white px-3 py-2">
        <option value="">Wszystkie działy</option>
        {[...new Set(items.map(item => item.channel))].map(value => <option key={value} value={value}>{value}</option>)}
      </select>
    </label>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.filter(item => !channel || item.channel === channel).slice(0, visibleCount).map(item => <article key={item.id} className="min-w-0 rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-2 text-xs text-gray-500 break-words">{item.channel} · <time dateTime={item.publicationDay}>{item.publicationDay}</time></p>
        {item.type && <p className="mb-2 text-xs font-medium text-[#bb142e]">{({ 'komunikat-cc': 'Komunikat CC', 'studium-biblijne': 'Studium biblijne', 'material-medialny': 'Materiał medialny', 'material-redakcyjny': 'Opracowanie redakcyjne' } as Record<string,string>)[item.type] || 'Materiał z serwisu CC'}</p>}
        <h3 className="font-bold text-lg break-words"><a className="hover:text-[#bb142e] focus-visible:outline-2" href={item.canonicalUrl}>{item.title}</a></h3>
        <p className="mt-3 text-sm text-gray-600 break-words">{item.summary}</p>
        {typeof item.author === 'string' && item.author && <p className="mt-3 text-xs text-gray-500 break-words">Autor: {item.author}</p>}
        <a className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#bb142e]" href={item.canonicalUrl}>Czytaj w serwisie źródłowym →</a>
      </article>)}
    </div>
    {items.filter(item => !channel || item.channel === channel).length > visibleCount && <button type="button" onClick={() => setVisibleCount(count => count + 6)} className="mt-5 min-h-11 rounded border border-gray-300 px-4 py-2 font-medium">Pokaż więcej z ekosystemu CC</button>}
  </section>;
};
