/**
 * Cezary Rogowski — Autorska Strona Osobista (CC PASSION V1.0)
 * Interakcje, audioplayer, a11y focus trap & mobile menu
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('navigation');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Zamknij menu' : 'Otwórz menu');
    });

    // Close on navigation link click
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Otwórz menu');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Otwórz menu');
        menuButton.focus();
      }
    });
  }

  // 2. Dynamic Year
  const yearElem = document.getElementById('currentYear');
  if (yearElem) {
    yearElem.textContent = String(new Date().getFullYear());
  }

  // 3. Search button trigger CC Omni-Search
  const searchBtn = document.getElementById('headerSearchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      if (typeof window.ccOmniSearchOpen === 'function') {
        window.ccOmniSearchOpen();
      } else {
        const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
        document.dispatchEvent(event);
      }
    });
  }

  // 4. Audio Archive Loader (Only genuine author tracks)
  const tracksContainer = document.getElementById('tracksList');
  if (tracksContainer) {
    const tracksUrl = tracksContainer.getAttribute('data-tracks-src') || '/CezaryRogowski/tracks.json';
    fetch(tracksUrl)
      .then((res) => (res.ok ? res.json() : []))
      .then((tracks) => {
        if (!Array.isArray(tracks) || tracks.length === 0) {
          return;
        }

        tracksContainer.innerHTML = '';
        tracks.forEach((track, index) => {
          if (!track || typeof track.title !== 'string' || typeof track.file !== 'string') return;
          // Security path verification
          if (!/^(\/|assets\/audio\/|audio\/)[\w.\-]+\.(mp3|m4a|ogg|wav)$/.test(track.file)) return;

          const trackItem = document.createElement('div');
          trackItem.className = 'track-item';

          const label = document.createElement('label');
          label.htmlFor = `audio-track-${index}`;
          label.textContent = track.title;

          const audio = document.createElement('audio');
          audio.id = `audio-track-${index}`;
          audio.controls = true;
          audio.preload = 'none';
          audio.src = track.file;

          trackItem.appendChild(label);
          trackItem.appendChild(audio);
          tracksContainer.appendChild(trackItem);
        });
      })
  // 5. Your Imagination Studio Modal Dialog
  const openModalBtn = document.getElementById('openStudioModalBtn');
  const closeModalBtn = document.getElementById('closeStudioModalBtn');
  const studioModal = document.getElementById('studioModal');
  const modalVideo = document.getElementById('studioModalVideo');

  if (openModalBtn && studioModal) {
    const openModal = () => {
      if (typeof studioModal.showModal === 'function') {
        studioModal.showModal();
      } else {
        studioModal.setAttribute('open', '');
      }
      document.body.style.overflow = 'hidden';
      if (closeModalBtn) closeModalBtn.focus();
    };

    const closeModal = () => {
      if (typeof studioModal.close === 'function') {
        studioModal.close();
      } else {
        studioModal.removeAttribute('open');
      }
      document.body.style.overflow = '';
      if (modalVideo && !modalVideo.paused) {
        modalVideo.pause();
      }
      openModalBtn.focus();
    };

    openModalBtn.addEventListener('click', openModal);

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeModal);
    }

    // Dismiss on click outside modal surface
    studioModal.addEventListener('click', (e) => {
      const rect = studioModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeModal();
      }
    });

    // Close on Escape & pause video
    studioModal.addEventListener('cancel', () => {
      document.body.style.overflow = '';
      if (modalVideo && !modalVideo.paused) {
        modalVideo.pause();
      }
    });
  }
});
