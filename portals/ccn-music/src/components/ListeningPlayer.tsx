import { useEffect, useRef, useState } from 'react';
import { X, SkipBack, SkipForward, ExternalLink, ListMusic } from 'lucide-react';
import type { Track } from '../musicModel';
type Player = { loadVideoById(id: string): void; destroy(): void };
type Youtube = { Player: new (host: HTMLElement, options: object) => Player };
declare global { interface Window { YT?: Youtube; onYouTubeIframeAPIReady?: () => void } }
let apiPromise: Promise<Youtube> | null = null;
function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) apiPromise = new Promise<Youtube>((resolve, reject) => {
    const timer = setTimeout(() => { apiPromise = null; reject(new Error('Timeout')); }, 12000);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); clearTimeout(timer); if (window.YT) resolve(window.YT); };
    let script = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (!script) { script = document.createElement('script'); script.src = 'https://www.youtube.com/iframe_api'; script.async = true; document.head.appendChild(script); }
    script.addEventListener('error', () => { clearTimeout(timer); apiPromise = null; reject(new Error('Network')); }, { once: true });
  });
  return apiPromise;
}
export function ListeningPlayer({ track, queue, onSelect, onClose, previous, next }: { track: Track; queue: Track[]; onSelect: (track: Track) => void; onClose: () => void; previous: Track | null; next: Track | null }) {
  const host = useRef<HTMLDivElement>(null), player = useRef<Player | null>(null), latest = useRef(track), ready = useRef(false), hasError = useRef(false);
  latest.current = track;
  const [status, setStatus] = useState('Wczytywanie odtwarzacza…'), [error, setError] = useState(false), [showQueue, setShowQueue] = useState(false);
  useEffect(() => {
    let cancelled = false;
    loadApi().then(api => {
      if (cancelled || !host.current) return;
      const child = document.createElement('div'); host.current.replaceChildren(child);
      player.current = new api.Player(child, { host: 'https://www.youtube-nocookie.com', width: '100%', height: '100%', videoId: latest.current.id,
        playerVars: { autoplay: 1, playsinline: 1, origin: window.location.origin, rel: 0 },
        events: { onReady: () => { if (!cancelled) { ready.current = true; player.current?.loadVideoById(latest.current.id); if (!hasError.current) setStatus('Użyj przycisku odtwarzania w filmie lub otwórz YouTube'); const frame = host.current?.querySelector('iframe'); frame?.setAttribute('title', 'Odtwarzacz muzyki YouTube'); frame?.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin'); } },
          onStateChange: (event: { data: number }) => { if (!cancelled && !hasError.current) setStatus(({ 1: 'Odtwarzanie', 2: 'Wstrzymano', 0: 'Nagranie zakończone', 3: 'Buforowanie…' } as Record<number, string>)[event.data] || 'Włącz odtwarzanie w filmie lub otwórz YouTube'); },
          onAutoplayBlocked: () => { if (!cancelled) setStatus('Naciśnij odtwarzanie w filmie'); },
          onError: () => { if (!cancelled) { hasError.current = true; setError(true); setStatus('Film nie jest dostępny w osadzeniu. Otwórz go w YouTube.'); } } } });
    }).catch(() => { if (!cancelled) { hasError.current = true; setError(true); setStatus('Nie udało się wczytać YouTube. Sprawdź połączenie lub otwórz film bezpośrednio.'); } });
    return () => { cancelled = true; ready.current = false; player.current?.destroy(); player.current = null; };
  }, []);
  useEffect(() => { hasError.current = false; setError(false); setStatus('Wczytywanie odtwarzacza…'); if (ready.current) player.current?.loadVideoById(track.id); }, [track.id]);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [onClose]);
  return <aside className="listening-player" aria-label="Odtwarzacz i kolejka">
    <div className="player-heading"><span><span className="eyebrow">TERAZ W ODTWARZACZU</span><strong>{track.title}</strong></span><button className="icon-button" aria-label="Zamknij odtwarzacz i zatrzymaj" onClick={onClose}><X /></button></div>
    <div ref={host} className="youtube-host" />
    <p className={error ? 'player-status error' : 'player-status'} role="status">{status}</p>
    <div className="player-actions"><button className="icon-button" disabled={!previous} aria-label="Poprzednie nagranie" onClick={() => previous && onSelect(previous)}><SkipBack /></button><button className="icon-button" disabled={!next} aria-label="Następne nagranie" onClick={() => next && onSelect(next)}><SkipForward /></button><button className="icon-button" aria-expanded={showQueue} aria-label="Pokaż kolejkę" onClick={() => setShowQueue(!showQueue)}><ListMusic /></button><a href={track.youtubeUrl} target="_blank" rel="noopener noreferrer">YouTube <ExternalLink size={14} /></a></div>
    {showQueue && <ol className="queue">{queue.map(t => <li key={t.id}><button aria-current={t.id === track.id ? 'true' : undefined} onClick={() => onSelect(t)}>{t.title}</button></li>)}</ol>}
  </aside>;
}
