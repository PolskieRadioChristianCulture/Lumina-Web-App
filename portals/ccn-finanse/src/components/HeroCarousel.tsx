import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Article } from '../types';
import { HeroArticle } from './HeroArticle';

interface Props {
  articles: Article[];
  bookmarkedIds: string[];
  onReadArticle: (article: Article) => void;
  onToggleBookmark: (article: Article) => void;
}

export function HeroCarousel({ articles, bookmarkedIds, onReadArticle, onToggleBookmark }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [motionOptIn, setMotionOptIn] = useState(false);
  const count = articles.length;
  const stopped = paused || (reducedMotion && !motionOptIn);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => { setReducedMotion(preference.matches); setMotionOptIn(false); };
    const updateVisibility = () => setHidden(document.hidden);
    preference.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      preference.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (count < 2 || stopped || hovered || focused || hidden) return;
    const timer = window.setInterval(() => setIndex(previous => (previous + 1) % count), 8000);
    return () => window.clearInterval(timer);
  }, [count, index, stopped, hovered, focused, hidden]);

  if (!count) return null;
  const activeIndex = index % count;
  const article = articles[activeIndex];
  const step = (direction: number) => setIndex(previous => (previous + direction + count) % count);

  return (
    <section aria-label="Główne wiadomości" aria-roledescription="karuzela"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div aria-live="off">
        <HeroArticle article={article} onReadArticle={onReadArticle}
          isBookmarked={bookmarkedIds.includes(article.id)} onToggleBookmark={onToggleBookmark} />
      </div>
      {count > 1 && (
        <div className="flex items-center justify-center gap-3 py-2 bg-white rounded-b-xl border border-gray-200">
          <button type="button" onClick={() => step(-1)} aria-label="Poprzednia główna wiadomość" className="p-3 cursor-pointer hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-xs font-semibold tabular-nums" aria-label={`Wiadomość ${activeIndex + 1} z ${count}`}>{activeIndex + 1} / {count}</span>
          <button type="button" onClick={() => {
            if (stopped) { setPaused(false); setMotionOptIn(true); } else setPaused(true);
          }} aria-label={stopped ? 'Wznów rotację głównych wiadomości' : 'Wstrzymaj rotację głównych wiadomości'} className="p-3 cursor-pointer hover:bg-gray-100 rounded-lg">
            {stopped ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Następna główna wiadomość" className="p-3 cursor-pointer hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
        </div>
      )}
    </section>
  );
}
