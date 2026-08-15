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
        position: fixed;
        bottom: 30px;
        right: 24px;
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: rgba(18, 18, 22, 0.88);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #d4af37;
        border: 1px solid rgba(212, 175, 55, 0.35);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 15px rgba(212, 175, 55, 0.2);
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.85);
        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                    visibility 0.3s,
                    border-color 0.2s,
                    box-shadow 0.2s;
        z-index: 99999;
      }

      .lumina-scroll-top.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      .lumina-scroll-top:hover {
        background: rgba(28, 28, 34, 0.95);
        border-color: #ffd700;
        color: #ffffff;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.8), 0 0 22px rgba(212, 175, 55, 0.45);
        transform: translateY(-3px) scale(1.05);
      }

      .lumina-scroll-top:active {
        transform: translateY(0) scale(0.95);
      }

      .lumina-progress-ring {
        position: absolute;
        top: 0;
        left: 0;
        transform: rotate(-90deg);
        pointer-events: none;
      }

      .lumina-progress-circle {
        stroke: #d4af37;
        transition: stroke-dashoffset 0.08s linear;
        stroke-linecap: round;
      }

      .lumina-arrow-icon {
        font-size: 16px;
        transition: transform 0.2s ease;
        z-index: 2;
      }

      .lumina-scroll-top:hover .lumina-arrow-icon {
        transform: translateY(-2px);
      }

      /* Uniesienie przycisku ponad dolny pasek nawigacji mobilnej */
      @media (max-width: 768px) {
        .lumina-scroll-top {
          bottom: 88px;
          right: 18px;
          width: 44px;
          height: 44px;
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
