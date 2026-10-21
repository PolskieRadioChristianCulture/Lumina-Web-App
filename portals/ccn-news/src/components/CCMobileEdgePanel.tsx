import React, { useEffect, useRef, useCallback } from 'react';
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
  Settings,
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
}

interface EdgeAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: number | string;
  pulse?: boolean;
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
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Close on Escape & trap keyboard focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
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
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  // Touch handlers for swipe-left to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;
    if (deltaX < -45) {
      // Swiped left > 45px -> close
      onClose();
    }
    touchStartXRef.current = null;
  };

  const profileHref = currentUser?.slug === 'cezaryrgowski'
    ? '/lumina.cezaryrgowski.html'
    : currentUser?.slug === 'wiolettarogowska'
    ? '/lumina.wiolettarogowska.html'
    : currentUser?.slug
    ? `/lumina-profile.html?u=${currentUser.slug}`
    : '/lumina-profile.html';

  // 14 Core Ecosystem Navigation Items (per Section 5 of Spec)
  const items: EdgeAction[] = [
    {
      id: 'home',
      label: 'Strona główna Christian Culture',
      icon: Home,
      href: 'https://polskieradio.cc/',
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
      isActive: true, // Active route on /news
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
      label: 'O portalu informacyjnym CCN News',
      icon: Info,
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

  return (
    <>
      {/* Background Scrim Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] transition-opacity duration-200 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto bg-black/55 backdrop-blur-[2px]' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Mobile Edge Panel */}
      <nav
        ref={panelRef}
        id="cc-mobile-edge-panel"
        aria-label="Mobilny panel nawigacji EkoCC"
        aria-modal="true"
        role="dialog"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 left-0 bottom-0 z-[9999] w-[72px] md:hidden flex flex-col items-center bg-[#091526]/95 backdrop-blur-xl border-r border-[#C4A35A]/35 rounded-r-[22px] shadow-[6px_0_30px_rgba(0,0,0,0.75)] overflow-y-auto overflow-x-hidden scrollbar-none transition-transform duration-220 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 14px)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 14px)',
        }}
      >
        {/* Close Button at top */}
        <button
          onClick={onClose}
          className="w-11 h-11 min-h-[44px] min-w-[44px] mb-3 flex items-center justify-center rounded-xl text-[#E2CC9A] hover:text-white hover:bg-[#C4A35A]/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C4A35A]"
          aria-label="Zamknij panel nawigacji"
          title="Zamknij panel nawigacji"
        >
          <X className="w-5 h-5 text-[#E2CC9A]" strokeWidth={2.2} />
        </button>

        {/* Separator */}
        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#C4A35A]/40 to-transparent mb-2" />

        {/* Vertical Icon List */}
        <div className="flex flex-col items-center gap-2 w-full px-2 py-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isCurrent = Boolean(item.isActive);

            const content = (
              <>
                <Icon
                  className={`w-[22px] h-[22px] shrink-0 transition-transform group-hover:scale-110 ${
                    item.pulse ? 'text-rose-400 animate-pulse' : ''
                  }`}
                  strokeWidth={isCurrent ? 2.4 : 1.9}
                />
                {item.badge !== undefined && (
                  <span className="absolute top-1 right-1 bg-[#f9282b] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
                {/* Floating tooltip on hover/focus (hidden on touch, visible on cursor/focus) */}
                <span
                  role="tooltip"
                  className="hidden sm:group-hover:block sm:group-focus:block absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-[#091526] border border-[#C4A35A]/40 text-[#F3E5C8] text-[11px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap shadow-xl pointer-events-none z-50"
                >
                  {item.label}
                </span>
              </>
            );

            const commonClasses = `group relative w-12 h-12 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C4A35A] focus:ring-offset-1 focus:ring-offset-[#091526] ${
              isCurrent
                ? 'bg-gradient-to-br from-[#C4A35A]/35 to-[#C4A35A]/12 text-[#F3E5C8] border-l-[3px] border-[#C4A35A] shadow-[inset_0_0_12px_rgba(196,163,90,0.3),0_0_16px_rgba(196,163,90,0.2)]'
                : 'text-[#E2CC9A]/75 hover:text-white hover:bg-[#C4A35A]/15'
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
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={commonClasses}
                aria-label={item.label}
                title={item.label}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {content}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
