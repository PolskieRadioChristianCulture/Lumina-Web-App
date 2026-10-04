import { useHeadlineRotation } from '../lib/useHeadlineRotation';
interface Props { badgeText?: string; items?: string[]; onSelectHeadline?: (text: string) => void }
export function BreakingTicker({ badgeText = 'AKTUALNOŚCI', items = [], onSelectHeadline }: Props) {
  const rotation = useHeadlineRotation(items.length);
  if (!items.length) return null;
  return <section aria-label="Aktualne nagłówki" {...rotation.handlers} className="bg-zinc-950 text-white px-4 py-3">
    <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
      <span className="text-xs font-bold tracking-widest">{badgeText}</span>
      <button className="text-left text-sm flex-1 min-w-[160px]" onClick={() => onSelectHeadline?.(items[rotation.index])}>{items[rotation.index]}</button>
      {items.length > 1 && <div className="flex items-center gap-3 text-xs">
        <button aria-label="Poprzedni nagłówek" onClick={rotation.previous}>←</button>
        <span>{rotation.index + 1}/{items.length}</span>
        <button aria-label="Następny nagłówek" onClick={rotation.next}>→</button>
        <button onClick={rotation.toggle} aria-label={rotation.paused ? 'Wznów nagłówki' : 'Wstrzymaj nagłówki'}>{rotation.paused ? 'Wznów' : 'Pauza'}</button>
      </div>}
    </div>
  </section>;
}
