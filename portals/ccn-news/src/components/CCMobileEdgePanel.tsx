import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Home,
  Radio,
  Newspaper,
  BookOpen,
  GraduationCap,
  Clapperboard,
  Users,
  Briefcase,
  Palette,
  Library,
  RadioTower,
  Search,
  Bookmark,
  Info,
  User,
  LogIn,
  X
} from 'lucide-react';

export interface CCMobileEdgePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
  onOpenBookmarks?: () => void;
  onOpenAbout?: () => void;
  onToggleRadio?: () => void;
  isRadioPlaying?: boolean;
  bookmarksCount?: number;
  currentUser?: {
    displayName?: string;
    avatar?: string;
    slug?: string;
  } | null;
  onLoginClick?: () => void;
  /** Shared geometry; each section supplies its own colours and actions. */
  appearance?: { background: string; foreground: string; accent: string };
  activePath?: string;
  aboutLabel?: string;
}

interface EdgeAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  href?: string;
  onClick?: () => void;
  badge?: number | string;
  pulse?: boolean;
  dataAttr?: string;
}

export const CCMobileEdgePanel: React.FC<CCMobileEdgePanelProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
  onOpenBookmarks,
  onOpenAbout,
  onToggleRadio,
  isRadioPlaying = false,
  bookmarksCount = 0,
  currentUser = null,
  onLoginClick,
  appearance,
  activePath = typeof window === 'undefined' ? '/news' : window.location.pathname,
  aboutLabel = 'O portalu informacyjnym CCN News',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Close on Escape & trap keyboard focus
  useEffect(() => {
    if (!isOpen) return;
    const mobile = window.matchMedia('(max-width: 767px)');
    if (!mobile.matches) {
      closeRef.current();
      return;
    }
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const portalRoot = panel?.parentElement;
    const isolated = new Map<HTMLElement, boolean>();
    const isolateBackground = () => {
      for (const child of Array.from(document.body.children)) {
        if (child instanceof HTMLElement && child !== portalRoot && !isolated.has(child)) {
          isolated.set(child, child.inert);
          child.inert = true;
        }
      }
    };
    isolateBackground();
    const observer = new MutationObserver(isolateBackground);
    observer.observe(document.body, { childList: true });
    const handleBreakpoint = () => { if (!mobile.matches) closeRef.current(); };
    mobile.addEventListener('change', handleBreakpoint);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
      } else if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey && (document.activeElement === firstElement || !panelRef.current.contains(document.activeElement))) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && (document.activeElement === lastElement || !panelRef.current.contains(document.activeElement))) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Body scroll lock
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on first interactive element or active route
    const timer = setTimeout(() => {
      if (panelRef.current) {
        const activeBtn = panelRef.current.querySelector<HTMLElement>('[aria-current="page"]');
        if (activeBtn) {
          activeBtn.focus();
        } else {
          const firstInteractive = panelRef.current.querySelector<HTMLElement>('a, button');
          firstInteractive?.focus();
        }
      }
    }, 40);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      observer.disconnect();
      mobile.removeEventListener('change', handleBreakpoint);
      isolated.forEach((wasInert, element) => { element.inert = wasInert; });
      if (previousFocus?.isConnected && previousFocus.getClientRects().length) previousFocus.focus();
    };
  }, [isOpen]);

  // Touch handlers for swipe-left to close
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) { touchStartRef.current = null; return; }
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || !e.changedTouches.length) return;
    const deltaX = e.changedTouches[0].clientX - start.x;
    const deltaY = e.changedTouches[0].clientY - start.y;
    if (deltaX < -50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      // Swiped left > 40px -> close
      onClose();
    }
  };

  const profileHref = currentUser?.slug
    ? `/lumina-profile.html?u=${encodeURIComponent(currentUser.slug)}`
    : '/lumina-profile.html';

  // 14 Core Ecosystem Navigation Items (per Section 5 of Spec)
  const items: EdgeAction[] = [
    {
      id: 'home',
      label: 'Strona główna Christian Culture',
      icon: Home,
      href: '/',
    },
    {
      id: 'radio',
      label: isRadioPlaying ? 'Radio Live (Odtwarzanie... kliknij, by wstrzymać)' : 'Radio Live (Włącz transmisję)',
      icon: Radio,
      onClick: onToggleRadio,
      pulse: isRadioPlaying,
    },
    {
      id: 'news',
      label: 'CCN News — Wiadomości',
      icon: Newspaper,
      href: '/news',
    },
    {
      id: 'biblia',
      label: 'Biblia Interlinearna MojaBiblia',
      icon: BookOpen,
      href: '/mojabiblia',
    },
    {
      id: 'akademia',
      label: 'Akademia Biblijna & Kurs Codzienny',
      icon: GraduationCap,
      href: '/akademia',
    },
    {
      id: 'vod',
      label: 'Kino VOD Christian Culture',
      icon: Clapperboard,
      href: '/vod',
    },
    {
      id: 'lumina',
      label: 'Portal Społecznościowy LUMINA',
      icon: Users,
      href: '/lumina',
    },
    {
      id: 'biznes',
      label: 'CCN Biznes & Etyka Przedsiębiorczości',
      icon: Briefcase,
      href: '/biznes',
    },
    {
      id: 'kultura',
      label: 'CCN Kultura & Sztuka Chrześcijańska',
      icon: Palette,
      href: '/kultura',
    },
    {
      id: 'biblioteka',
      label: 'Biblioteka Cyfrowa & Archiwum CC',
      icon: Library,
      href: '/biblioteka',
    },
    {
      id: 'live',
      label: 'Transmisja Live 24/7 OBS Studio',
      icon: RadioTower,
      href: '/live',
    },
    {
      id: 'search',
      label: 'Szukaj w portalu i ekosystemie',
      icon: Search,
      onClick: () => {
        onClose();
        onOpenSearch?.();
      },
    },
    {
      id: 'bookmarks',
      label: 'Zapisane artykuły (Zakładki)',
      icon: Bookmark,
      onClick: () => {
        onClose();
        onOpenBookmarks?.();
      },
      badge: bookmarksCount > 0 ? bookmarksCount : undefined,
    },
    {
      id: 'info',
      label: aboutLabel,
      icon: Info,
      dataAttr: 'data-ekocc-info-trigger',
      onClick: () => {
        onClose();
        onOpenAbout?.();
      },
    },
    {
      id: 'user',
      label: currentUser ? `Mój Profil: ${currentUser.displayName}` : 'Zaloguj się do Ekosystemu CC',
      icon: currentUser ? User : LogIn,
      href: currentUser ? profileHref : undefined,
      onClick: !currentUser ? () => {
        onClose();
        onLoginClick?.();
      } : undefined,
    },
  ];

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div data-cc-edge-root className="fixed inset-0 z-[2147483647] isolate">
      {/* Background Scrim Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] transition-opacity motion-reduce:transition-none duration-200 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto bg-black/60 backdrop-blur-[2px]' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Mobile Edge Panel — Pure Black Background (#000000) */}
      <nav
        ref={panelRef}
        id="cc-mobile-edge-panel"
        aria-label="Mobilny panel nawigacji EkoCC"
        aria-modal="true"
        role="dialog"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => { touchStartRef.current = null; }}
        className={`fixed top-0 left-0 bottom-0 z-[9999] w-[70px] md:hidden flex flex-col items-center bg-[#000000]/98 backdrop-blur-xl border-r border-[#C4A35A]/35 rounded-r-[22px] shadow-[6px_0_30px_rgba(0,0,0,0.85)] overflow-y-auto overflow-x-hidden scrollbar-none transition-transform motion-reduce:transition-none duration-220 ease-out overscroll-contain ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: appearance?.background ?? 'var(--cc-edge-background, #000000)',
          color: appearance?.foreground ?? 'var(--cc-edge-foreground, #F3E5C8)',
          '--cc-edge-accent': appearance?.accent ?? '#C4A35A',
          borderColor: 'var(--cc-edge-accent)',
          paddingTop: 'max(env(safe-area-inset-top), 8px)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
        } as React.CSSProperties}
      >
        <button type="button" onClick={onClose} aria-label="Zamknij panel nawigacji"
          className="shrink-0 min-w-[44px] min-h-[44px] rounded-xl focus-visible:outline-2 focus-visible:outline-current">
          <X className="w-5 h-5 mx-auto" aria-hidden="true" />
        </button>
        {/* Compact Vertical Icon List — perfectly sized to fit on all mobile screens */}
        <div className="flex flex-col items-center gap-[3px] w-full px-2 py-1 my-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const normalizedPath = activePath.replace(/\.html$/, '').replace(/\/$/, '') || '/';
            const isCurrent = Boolean(item.href?.startsWith('/') && (normalizedPath === item.href || (item.href !== '/' && normalizedPath.startsWith(`${item.href}/`))));

            const content = (
              <>
                <Icon
                  className={`w-[20px] h-[20px] shrink-0 transition-transform group-hover:scale-110 ${
                    item.pulse ? 'text-rose-400 animate-pulse motion-reduce:animate-none' : ''
                  }`}
                  strokeWidth={isCurrent ? 2.3 : 1.85}
                />
                {item.badge !== undefined && (
                  <span className="absolute top-0.5 right-0.5 bg-[#f9282b] text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
                {/* Floating tooltip on hover/focus (hidden on touch, visible on cursor/focus) */}
                <span
                  role="tooltip"
                  className="hidden sm:group-hover:block sm:group-focus:block absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-[#000000] border border-[#C4A35A]/40 text-[#F3E5C8] text-[11px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap shadow-xl pointer-events-none z-50"
                >
                  {item.label}
                </span>
              </>
            );

            const commonClasses = `group relative shrink-0 w-[44px] h-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all motion-reduce:transition-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-1 focus:ring-offset-black ${
              isCurrent
                ? 'bg-white/10 border-l-[3px] border-[var(--cc-edge-accent)] text-[var(--cc-edge-accent)]'
                : 'text-inherit hover:bg-white/10'
            }`;

            if (item.href) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={commonClasses}
                  aria-label={item.label}
                  title={item.label}
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={onClose}
                  {...(item.dataAttr ? { [item.dataAttr]: 'true' } : {})}
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                disabled={!item.onClick}
                onClick={item.onClick}
                className={commonClasses}
                aria-label={item.label}
                title={item.label}
                aria-current={isCurrent ? 'page' : undefined}
                {...(item.dataAttr ? { [item.dataAttr]: 'true' } : {})}
              >
                {content}
              </button>
            );
          })}
        </div>
      </nav>
    </div>, document.body
  );
};
