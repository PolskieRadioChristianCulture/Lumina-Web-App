import { memo, useEffect, useRef, useState } from 'react';

/** The shared connector owns the children of this empty host; React owns only the host. */
export const SharedAuthWidget = memo(function SharedAuthWidget() {
  const host = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const checkMount = () => setMounted(container.childElementCount > 0);
    const observer = new MutationObserver(checkMount);
    observer.observe(container, { childList: true });
    const refresh = () => {
      window.dispatchEvent(new Event('lumina-auth-state'));
      checkMount();
    };
    let script = document.querySelector<HTMLScriptElement>('script[src*="cc-global-auth.js"]');
    if (typeof (window as Window & { ccLoginWithGoogle?: unknown }).ccLoginWithGoogle === 'function') {
      refresh();
    } else {
      if (!script) {
        script = document.createElement('script');
        script.src = '/js/cc-global-auth.js';
        script.defer = true;
        script.addEventListener('load', refresh);
        document.head.appendChild(script);
      } else script.addEventListener('load', refresh);
    }
    checkMount();
    return () => {
      observer.disconnect();
      script?.removeEventListener('load', refresh);
    };
  }, []);

  return (
    <div className="relative flex items-center">
      {!mounted && (
        <a 
          href="/lumina-login?redirect=%2Fkultura" 
          className="rounded-full bg-zinc-900 hover:bg-black px-3 py-1.5 text-xs font-bold text-white border border-zinc-700 hover:border-zinc-500 transition shadow-xs"
        >
          Zaloguj
        </a>
      )}
      <div ref={host} id="ccAuthWidgetSlot" className="cc-auth-widget-container relative" />
    </div>
  );
});
