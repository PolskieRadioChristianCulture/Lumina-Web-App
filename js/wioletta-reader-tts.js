/**
 * Wioletta Reader TTS — moduł lektora mowy dla powieści „Pardon, Czy To Miłość?”
 * Standard Christian Culture / EkoCC v2 PREMIUM
 * Wykorzystuje Web Speech API (window.speechSynthesis) z podziałem na akapity,
 * zapobieganiem błędom Chrome (heartbeat & sentence chunking),
 * podświetlaniem czytanego tekstu i pełną responsywnością (touch target >= 44px).
 */
(function() {
  'use strict';

  if (window.WiolettaReaderTTS) return;

  const synth = window.speechSynthesis;
  const LS_RATE = 'wioletta_tts_rate';
  const SPEEDS = [0.85, 1.0, 1.25, 1.5];
  
  let currentSpeed = parseFloat(localStorage.getItem(LS_RATE) || '1.0');
  if (!SPEEDS.includes(currentSpeed)) currentSpeed = 1.0;

  let paragraphs = [];
  let currentParaIndex = 0;
  let currentSentenceIndex = 0;
  let currentSentences = [];
  let isPlaying = false;
  let isPaused = false;
  let polishVoice = null;
  let heartbeatTimer = null;
  let activeUtterance = null;
  let sessionToken = 0;

  // ── CSS Styles ──
  function injectStyles() {
    if (document.getElementById('wioletta-tts-styles')) return;
    const style = document.createElement('style');
    style.id = 'wioletta-tts-styles';
    style.textContent = `
      /* ── HERO LISTEN BOX ── */
      .chapter-tts-box {
        margin-top: 1.25rem;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 0.85rem 1.15rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .chapter-tts-box:hover {
        border-color: rgba(196,163,90,0.3);
      }
      .chapter-tts-info {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        min-width: 0;
      }
      .chapter-tts-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(196,163,90,0.12);
        color: var(--gold);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .chapter-tts-icon svg {
        width: 20px;
        height: 20px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
      }
      .chapter-tts-texts {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .chapter-tts-title {
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text);
        letter-spacing: -0.01em;
      }
      .chapter-tts-sub {
        font-size: 0.74rem;
        color: var(--muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chapter-tts-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-height: 44px;
        padding: 0 1.25rem;
        background: var(--orange, #FF7A00);
        color: #ffffff !important;
        border: none;
        border-radius: 24px;
        font-family: inherit;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
        box-shadow: 0 2px 8px rgba(255,122,0,0.25);
        flex-shrink: 0;
      }
      .chapter-tts-btn:hover {
        background: var(--orange-hover, #FF8C33);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255,122,0,0.35);
      }
      .chapter-tts-btn:active {
        background: #E66A00;
        transform: translateY(0);
      }
      .chapter-tts-btn svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }

      /* ── PROSE HIGHLIGHT ── */
      .prose p {
        cursor: default;
        transition: background 0.25s ease, border-left 0.25s ease, padding 0.25s ease;
      }
      .prose p.tts-clickable:hover {
        background: rgba(196,163,90,0.05);
        border-radius: 4px;
      }
      .prose p.tts-active-para {
        background: rgba(196,163,90,0.12) !important;
        border-left: 3px solid var(--orange, #FF7A00) !important;
        padding-left: 0.85rem !important;
        border-radius: 4px;
      }
      [data-theme="noc"] .prose p.tts-active-para {
        background: rgba(255,122,0,0.12) !important;
      }

      /* ── TOOLBAR TTS BUTTON ── */
      .tb-btn-tts.is-speaking {
        color: var(--orange, #FF7A00);
        animation: ttsPulse 2s infinite ease-in-out;
      }
      @keyframes ttsPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.08); opacity: 0.85; }
      }

      /* ── STICKY DOCK PLAYER ── */
      .wioletta-tts-dock {
        position: fixed;
        bottom: calc(1.5rem + 54px);
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        width: min(640px, calc(100vw - 1.5rem));
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: 0 12px 36px rgba(0,0,0,0.22);
        z-index: 92;
        backdrop-filter: blur(14px);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
        overflow: hidden;
      }
      .wioletta-tts-dock.open {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
        pointer-events: auto;
      }
      .tts-dock-progress {
        height: 3px;
        background: rgba(196,163,90,0.18);
        width: 100%;
        overflow: hidden;
      }
      .tts-dock-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--gold), var(--orange, #FF7A00));
        width: 0%;
        transition: width 0.25s ease;
      }
      .tts-dock-inner {
        padding: 0.45rem 0.65rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.4rem;
      }
      .tts-dock-controls-left {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
      }
      .tts-dock-info {
        flex: 1;
        min-width: 0;
        text-align: center;
        padding: 0 0.4rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .tts-dock-status {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tts-dock-ch {
        font-size: 0.68rem;
        color: var(--muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tts-dock-controls-right {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
      }

      /* ── DOCK BUTTONS (Touch target >= 44x44px) ── */
      .tts-btn {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: var(--muted);
        cursor: pointer;
        border-radius: 8px;
        transition: background 0.15s, color 0.15s;
        font-family: inherit;
        padding: 0;
      }
      .tts-btn:hover {
        background: rgba(196,163,90,0.12);
        color: var(--gold);
      }
      .tts-btn:focus-visible {
        outline: 2px solid var(--gold);
        outline-offset: 2px;
      }
      .tts-btn svg {
        width: 20px;
        height: 20px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
      }
      .tts-btn-primary {
        background: var(--orange, #FF7A00);
        color: #ffffff !important;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(255,122,0,0.25);
      }
      .tts-btn-primary:hover {
        background: var(--orange-hover, #FF8C33);
        color: #ffffff !important;
      }
      .tts-btn-primary svg {
        fill: currentColor;
        stroke: none;
      }
      .tts-btn-speed {
        font-size: 0.78rem;
        font-weight: 700;
        width: auto;
        min-width: 44px;
        padding: 0 0.4rem;
        color: var(--text);
        letter-spacing: -0.01em;
      }
      .tts-btn-speed:hover {
        color: var(--gold);
      }

      @media (max-width: 600px) {
        .chapter-tts-box {
          padding: 0.75rem 0.9rem;
          flex-direction: row;
        }
        .chapter-tts-btn span {
          display: inline;
        }
        .wioletta-tts-dock {
          bottom: calc(1.5rem + 54px);
          width: calc(100vw - 1rem);
          border-radius: 12px;
        }
        .tts-dock-ch {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Voice Detection ──
  function loadPolishVoice() {
    if (!synth) return;
    const voices = synth.getVoices() || [];
    if (!voices.length) return;

    const plVoices = voices.filter(v => v.lang && (v.lang === 'pl-PL' || v.lang.startsWith('pl')));
    if (!plVoices.length) {
      polishVoice = null;
      return;
    }
    // Prefer Polish female voice
    const female = plVoices.find(v => /paulina|zofia|maja|ewa|agnieszka|female|kobieta/i.test(v.name));
    polishVoice = female || plVoices[0];
  }

  if (synth) {
    loadPolishVoice();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadPolishVoice;
    }
  }

  // ── Clean Text for TTS ──
  function cleanSpeechText(raw) {
    if (!raw) return '';
    return raw
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/—|–/g, ', ') // pauza w dialogu
      .replace(/[„”"«»]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function splitIntoSentences(text) {
    const rawSentences = text.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [text];
    const results = [];
    rawSentences.forEach(s => {
      const trimmed = s.trim();
      if (trimmed) results.push(trimmed);
    });
    return results.length ? results : [text];
  }

  // ── Heartbeat for Chromium 15s bug ──
  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (synth && synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      }
    }, 10000);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  // ── UI Injection ──
  function injectUI() {
    const header = document.querySelector('.chapter-header');
    if (!header || document.getElementById('chapterTtsBox')) return;

    // 1. Hero Listen Box
    const box = document.createElement('div');
    box.className = 'chapter-tts-box';
    box.id = 'chapterTtsBox';
    box.innerHTML = `
      <div class="chapter-tts-info">
        <div class="chapter-tts-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
        </div>
        <div class="chapter-tts-texts">
          <span class="chapter-tts-title">Posłuchaj tego rozdziału</span>
          <span class="chapter-tts-sub" id="chapterTtsSub">Lektor mowy · audio na żywo</span>
        </div>
      </div>
      <button class="chapter-tts-btn" id="chapterTtsStartBtn" aria-label="Rozpocznij słuchanie rozdziału (Lektor)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span id="chapterTtsStartBtnLabel">Słuchaj</span>
      </button>
    `;
    header.appendChild(box);

    // 2. Toolbar Icon
    const toolbar = document.querySelector('.toolbar');
    if (toolbar && !document.getElementById('toolbarTtsBtn')) {
      const btn = document.createElement('button');
      btn.className = 'tb-btn tb-btn-tts';
      btn.id = 'toolbarTtsBtn';
      btn.setAttribute('aria-label', 'Słuchaj rozdziału (Lektor)');
      btn.setAttribute('title', 'Słuchaj rozdziału (Lektor)');
      btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`;
      
      const bookmarkBtn = document.getElementById('bookmarkBtn2');
      if (bookmarkBtn) {
        toolbar.insertBefore(btn, bookmarkBtn);
      } else {
        toolbar.appendChild(btn);
      }
    }

    // 3. Floating Player Dock
    if (!document.getElementById('wiolettaTtsDock')) {
      const dock = document.createElement('div');
      dock.className = 'wioletta-tts-dock';
      dock.id = 'wiolettaTtsDock';
      dock.setAttribute('role', 'region');
      dock.setAttribute('aria-label', 'Odtwarzacz lektora');
      dock.innerHTML = `
        <div class="tts-dock-progress" aria-hidden="true">
          <div class="tts-dock-progress-bar" id="ttsProgressBar"></div>
        </div>
        <div class="tts-dock-inner">
          <div class="tts-dock-controls-left">
            <button class="tts-btn tts-btn-primary" id="ttsPlayPauseBtn" aria-label="Wstrzymaj / Odtwarzaj">
              <svg class="icon-play" viewBox="0 0 24 24" aria-hidden="true" style="display:none;"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <svg class="icon-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
            <button class="tts-btn" id="ttsPrevParaBtn" aria-label="Poprzedni akapit" title="Poprzedni akapit">
              <svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
            </button>
            <button class="tts-btn" id="ttsNextParaBtn" aria-label="Następny akapit" title="Następny akapit">
              <svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
            </button>
          </div>
          
          <div class="tts-dock-info">
            <span class="tts-dock-status" id="ttsDockStatus">Akapit 1 z 1</span>
            <span class="tts-dock-ch" id="ttsDockCh">Pardon, Czy To Miłość?</span>
          </div>

          <div class="tts-dock-controls-right">
            <button class="tts-btn tts-btn-speed" id="ttsSpeedBtn" aria-label="Prędkość lektora: ${currentSpeed}x" title="Zmień prędkość lektora">
              <span id="ttsSpeedLabel">${currentSpeed}×</span>
            </button>
            <button class="tts-btn" id="ttsStopBtn" aria-label="Zatrzymaj czytanie" title="Zatrzymaj czytanie">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12"/></svg>
            </button>
            <button class="tts-btn" id="ttsCloseBtn" aria-label="Ukryj panel odtwarzacza" title="Zamknij panel">
              <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(dock);
    }

    bindEvents();
  }

  // ── Bind Events ──
  function bindEvents() {
    const startBtn = document.getElementById('chapterTtsStartBtn');
    const tbBtn = document.getElementById('toolbarTtsBtn');
    const playPauseBtn = document.getElementById('ttsPlayPauseBtn');
    const prevBtn = document.getElementById('ttsPrevParaBtn');
    const nextBtn = document.getElementById('ttsNextParaBtn');
    const speedBtn = document.getElementById('ttsSpeedBtn');
    const stopBtn = document.getElementById('ttsStopBtn');
    const closeBtn = document.getElementById('ttsCloseBtn');

    if (startBtn && !startBtn._bound) {
      startBtn._bound = true;
      startBtn.addEventListener('click', togglePlayback);
    }
    if (tbBtn && !tbBtn._bound) {
      tbBtn._bound = true;
      tbBtn.addEventListener('click', togglePlayback);
    }
    if (playPauseBtn && !playPauseBtn._bound) {
      playPauseBtn._bound = true;
      playPauseBtn.addEventListener('click', togglePlayback);
    }
    if (prevBtn && !prevBtn._bound) {
      prevBtn._bound = true;
      prevBtn.addEventListener('click', () => {
        if (currentParaIndex > 0) {
          playParagraph(currentParaIndex - 1);
        }
      });
    }
    if (nextBtn && !nextBtn._bound) {
      nextBtn._bound = true;
      nextBtn.addEventListener('click', () => {
        if (currentParaIndex + 1 < paragraphs.length) {
          playParagraph(currentParaIndex + 1);
        } else {
          stop();
          showToast('Koniec rozdziału');
        }
      });
    }
    if (speedBtn && !speedBtn._bound) {
      speedBtn._bound = true;
      speedBtn.addEventListener('click', cycleSpeed);
    }
    if (stopBtn && !stopBtn._bound) {
      stopBtn._bound = true;
      stopBtn.addEventListener('click', stop);
    }
    if (closeBtn && !closeBtn._bound) {
      closeBtn._bound = true;
      closeBtn.addEventListener('click', () => {
        const dock = document.getElementById('wiolettaTtsDock');
        if (dock) dock.classList.remove('open');
      });
    }

    // Make paragraphs clickable to jump lektor
    paragraphs.forEach((p, idx) => {
      if (!p._ttsBound) {
        p._ttsBound = true;
        p.classList.add('tts-clickable');
        p.title = 'Kliknij, aby lektor czytał od tego miejsca';
        p.addEventListener('click', () => {
          playParagraph(idx);
        });
      }
    });

    // Keyboard shortcut: Space toggles when dock is open
    document.addEventListener('keydown', e => {
      const dock = document.getElementById('wiolettaTtsDock');
      if (dock && dock.classList.contains('open') && e.code === 'Space' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlayback();
      }
    });
  }

  // ── Playback Controls ──
  function togglePlayback() {
    if (!synth) {
      showToast('Twoja przeglądarka nie obsługuje mowy (Web Speech API)');
      return;
    }
    if (!isPlaying) {
      playParagraph(currentParaIndex || 0);
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  }

  function playParagraph(paraIdx) {
    if (!synth) return;
    if (paraIdx < 0 || paraIdx >= paragraphs.length) return;

    sessionToken += 1;
    const currentSession = sessionToken;

    synth.cancel();
    stopHeartbeat();

    currentParaIndex = paraIdx;
    currentSentenceIndex = 0;

    const p = paragraphs[currentParaIndex];
    const text = cleanSpeechText(p.textContent || '');
    currentSentences = splitIntoSentences(text);

    isPlaying = true;
    isPaused = false;

    updateUI();
    highlightParagraph(currentParaIndex);
    startHeartbeat();

    speakNextSentence(currentSession);
  }

  function speakNextSentence(session) {
    if (!isPlaying || isPaused || session !== sessionToken) return;
    if (currentSentenceIndex >= currentSentences.length) {
      // Advance to next paragraph
      if (currentParaIndex + 1 < paragraphs.length) {
        currentParaIndex += 1;
        currentSentenceIndex = 0;
        const p = paragraphs[currentParaIndex];
        const text = cleanSpeechText(p.textContent || '');
        currentSentences = splitIntoSentences(text);
        updateUI();
        highlightParagraph(currentParaIndex);
        setTimeout(() => speakNextSentence(session), 200);
      } else {
        stop();
        showToast('Koniec rozdziału — miłego dnia!');
      }
      return;
    }

    const sentence = currentSentences[currentSentenceIndex];
    if (!sentence || !sentence.trim()) {
      currentSentenceIndex += 1;
      speakNextSentence(session);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentence);
    activeUtterance = utterance;
    utterance.lang = 'pl-PL';
    utterance.rate = currentSpeed;
    utterance.pitch = 1.0;
    if (polishVoice) utterance.voice = polishVoice;

    utterance.onend = () => {
      if (session !== sessionToken) return;
      activeUtterance = null;
      currentSentenceIndex += 1;
      setTimeout(() => speakNextSentence(session), 60);
    };

    utterance.onerror = (ev) => {
      if (session !== sessionToken) return;
      // 'canceled' or 'interrupted' is normal when user switches/stops
      if (ev.error && ev.error !== 'canceled' && ev.error !== 'interrupted') {
        console.warn('SpeechSynthesis error:', ev.error);
      }
      activeUtterance = null;
    };

    synth.speak(utterance);
  }

  function pause() {
    if (!synth || !isPlaying || isPaused) return;
    isPaused = true;
    synth.pause();
    stopHeartbeat();
    updateUI();
  }

  function resume() {
    if (!synth || !isPlaying || !isPaused) return;
    isPaused = false;
    synth.resume();
    startHeartbeat();
    updateUI();
  }

  function stop() {
    sessionToken += 1;
    isPlaying = false;
    isPaused = false;
    currentSentenceIndex = 0;
    activeUtterance = null;
    stopHeartbeat();
    if (synth) synth.cancel();
    clearHighlight();
    updateUI();
  }

  function cycleSpeed() {
    const curIdx = SPEEDS.indexOf(currentSpeed);
    const nextIdx = (curIdx + 1) % SPEEDS.length;
    currentSpeed = SPEEDS[nextIdx];
    localStorage.setItem(LS_RATE, String(currentSpeed));

    const label = document.getElementById('ttsSpeedLabel');
    if (label) label.textContent = `${currentSpeed}×`;
    const btn = document.getElementById('ttsSpeedBtn');
    if (btn) btn.setAttribute('aria-label', `Prędkość lektora: ${currentSpeed}x`);

    if (isPlaying && !isPaused) {
      // Re-trigger current sentence with new rate
      const curSession = ++sessionToken;
      if (synth) synth.cancel();
      speakNextSentence(curSession);
    }
  }

  function highlightParagraph(idx) {
    clearHighlight();
    const p = paragraphs[idx];
    if (p) {
      p.classList.add('tts-active-para');
      p.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function clearHighlight() {
    paragraphs.forEach(p => p.classList.remove('tts-active-para'));
  }

  function updateUI() {
    const dock = document.getElementById('wiolettaTtsDock');
    const playPauseBtn = document.getElementById('ttsPlayPauseBtn');
    const startBtn = document.getElementById('chapterTtsStartBtn');
    const startBtnLabel = document.getElementById('chapterTtsStartBtnLabel');
    const tbBtn = document.getElementById('toolbarTtsBtn');
    const statusText = document.getElementById('ttsDockStatus');
    const chText = document.getElementById('ttsDockCh');
    const progressBar = document.getElementById('ttsProgressBar');
    const speedLabel = document.getElementById('ttsSpeedLabel');

    if (dock) {
      if (isPlaying) dock.classList.add('open');
      else dock.classList.remove('open');
    }

    // Play/Pause icon in dock
    if (playPauseBtn) {
      const iconPlay = playPauseBtn.querySelector('.icon-play');
      const iconPause = playPauseBtn.querySelector('.icon-pause');
      if (iconPlay && iconPause) {
        if (isPlaying && !isPaused) {
          iconPlay.style.display = 'none';
          iconPause.style.display = 'block';
          playPauseBtn.setAttribute('aria-label', 'Wstrzymaj lektora');
        } else {
          iconPlay.style.display = 'block';
          iconPause.style.display = 'none';
          playPauseBtn.setAttribute('aria-label', 'Wznów lektora');
        }
      }
    }

    // Header Start Button
    if (startBtn && startBtnLabel) {
      if (isPlaying && !isPaused) {
        startBtnLabel.textContent = 'Wstrzymaj';
        startBtn.style.background = 'var(--gold)';
      } else if (isPlaying && isPaused) {
        startBtnLabel.textContent = 'Wznów';
        startBtn.style.background = 'var(--orange, #FF7A00)';
      } else {
        startBtnLabel.textContent = 'Słuchaj';
        startBtn.style.background = 'var(--orange, #FF7A00)';
      }
    }

    // Toolbar button pulse
    if (tbBtn) {
      tbBtn.classList.toggle('is-speaking', isPlaying && !isPaused);
      tbBtn.classList.toggle('active', isPlaying);
    }

    // Status text & progress bar
    const total = paragraphs.length || 1;
    const current = Math.min(total, currentParaIndex + 1);
    const pct = total > 0 ? (current / total * 100) : 0;

    if (statusText) {
      statusText.textContent = isPlaying 
        ? `Akapit ${current} z ${total}${isPaused ? ' (Wstrzymano)' : ''}`
        : `Gotowy · ${total} akapitów`;
    }

    if (chText) {
      const titleElem = document.getElementById('chapterTitle');
      chText.textContent = titleElem ? titleElem.textContent : 'Pardon, Czy To Miłość?';
    }

    if (progressBar) {
      progressBar.style.width = `${pct.toFixed(1)}%`;
    }

    if (speedLabel) {
      speedLabel.textContent = `${currentSpeed}×`;
    }
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ── Init & Watch Prose ──
  function init() {
    injectStyles();

    const prose = document.getElementById('proseContent');
    if (!prose) return;

    function refreshParas() {
      paragraphs = Array.from(prose.querySelectorAll('p'));
      if (paragraphs.length) {
        injectUI();
        const sub = document.getElementById('chapterTtsSub');
        if (sub) {
          const words = paragraphs.reduce((sum, p) => sum + (p.textContent || '').trim().split(/\s+/).length, 0);
          const estMin = Math.max(1, Math.round(words / 130)); // ~130 słów na minutę mowy
          sub.textContent = `Lektor audio · ~${estMin} min słuchania (${paragraphs.length} akapitów)`;
        }
      }
    }

    refreshParas();

    // If prose is filled asynchronously, watch via MutationObserver
    const observer = new MutationObserver(() => {
      refreshParas();
    });
    observer.observe(prose, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.WiolettaReaderTTS = {
    play: () => playParagraph(currentParaIndex || 0),
    pause,
    resume,
    stop,
    playParagraph,
    toggle: togglePlayback
  };
})();
