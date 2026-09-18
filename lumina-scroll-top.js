/**
 * LUMINA - Dynamic Scroll To Top Button Module
 * Samodzielny moduł dla portalu LUMINA (lumina-tablica.html i profile).
 * Wstrzykuje automatycznie strukturę DOM, style CSS i obsługę scrolla z pierścieniem postępu.
 */
(() => {
  const initScrollTop = () => {
    if (document.getElementById('luminaScrollTop')) return;

    // 1. Wstrzyknięcie stylów CSS dopasowanych do motywu LUMINA
    const styles = `
      .lumina-scroll-top {
        position: fixed !important;
        bottom: 24px !important;
        right: 10px !important;
        width: 50px !important;
        height: 50px !important;
        border-radius: 50% !important;
        background: #070e24 !important;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #facc15 !important;
        border: 2px solid #facc15 !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.85), 0 0 16px rgba(250, 204, 21, 0.4) !important;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.85);
        transition: opacity 0.25s ease,
                    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                    visibility 0.25s,
                    box-shadow 0.25s ease !important;
        z-index: 99997 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
      }

      .lumina-scroll-top.visible {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(0) scale(1) !important;
      }

      .lumina-scroll-top:hover {
        background: #0b142e !important;
        transform: translateY(-2px) scale(1.06) !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.9), 0 0 22px rgba(250, 204, 21, 0.6) !important;
      }

      .lumina-scroll-top:active {
        transform: scale(0.95) !important;
      }

      .lumina-progress-ring {
        display: none !important; /* Usunięcie podwójnego pierścienia — jednolity złoty ring 2px */
      }

      .lumina-arrow-icon {
        font-size: 1.15rem !important;
        color: #facc15 !important;
        transition: transform 0.2s ease !important;
        z-index: 2;
      }

      .lumina-scroll-top:hover .lumina-arrow-icon {
        transform: translateY(-2px) !important;
      }

      /* Uniesienie i ujednolicenie przycisku na smartfonach (48px, równe odstępy 12px) */
      @media (max-width: 768px) {
        #luminaScrollTop.lumina-scroll-top,
        .lumina-scroll-top {
          bottom: calc(82px + env(safe-area-inset-bottom, 8px)) !important;
          right: 10px !important;
          width: 48px !important;
          min-width: 48px !important;
          max-width: 48px !important;
          height: 48px !important;
          min-height: 48px !important;
          max-height: 48px !important;
        }
        .lumina-arrow-icon {
          font-size: 1.05rem !important;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'lumina-scroll-top-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // 2. Wstrzyknięcie struktury HTML do <body>
    const buttonHtml = `
      <button id="luminaScrollTop" class="lumina-scroll-top" aria-label="Przewiń do góry tablicy">
        <svg class="lumina-progress-ring" width="46" height="46" viewBox="0 0 46 46">
          <circle class="lumina-progress-circle" stroke="currentColor" stroke-width="2.5" fill="transparent" r="20" cx="23" cy="23" />
        </svg>
        <i class="fa-solid fa-chevron-up lumina-arrow-icon"></i>
      </button>
    `;
    document.body.insertAdjacentHTML('beforeend', buttonHtml);

    // 3. Logika działania i kalkulacja postępu
    const scrollTopBtn = document.getElementById('luminaScrollTop');
    if (!scrollTopBtn) return;
    const circle = scrollTopBtn.querySelector('.lumina-progress-circle');
    const radius = circle ? circle.r.baseVal.value : 20;
    const circumference = 2 * Math.PI * radius;

    if (circle) {
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      circle.style.strokeDashoffset = `${circumference}`;
    }

    const updateProgress = (percent) => {
      if (!circle) return;
      const offset = circumference - (percent / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    };

    let ticking = false;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const scrollHeight = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;

      // Próg pojawienia się (po przewinięciu nagłówka i sekcji publikacji)
      if (scrollTop > 220) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }

      // Aktualizacja wskaźnika SVG
      if (scrollHeight > 0) {
        const scrollPercent = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
        updateProgress(scrollPercent);
      }

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });

    document.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });

    // Płynny powrót na szczyt tablicy
    scrollTopBtn.addEventListener('click', () => {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
      } catch(e) {
        window.scrollTo(0, 0);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollTop);
  } else {
    initScrollTop();
  }
})();
