/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC UNIVERSAL MULTILINGUAL TTS READER — AUDIO-FIRST ECOSYSTEM STANDARD
 * Standard Ekosystemu Christian Culture / EkoCC v2 PREMIUM
 * Dyrektywa L0: 29.10.2026 — Wielojęzyczny TTS i ikona Play przy każdej treści
 * Kolorystyka: JOMA-D052 (Klasyczny Pomarańczowy #FF7A00, min. 44x44px)
 * ══════════════════════════════════════════════════════════════════════════
 * - W pełni wielojęzyczny (PL, EN, ES, DE, UK, PT-BR) z automatycznym doborem głosu
 * - Web Speech API z podziałem na zdania i ochroną przed limitem 15s (Chromium)
 * - Efekt Karaoke (podświetlenie aktualnie czytanego akapitu)
 * - Sterowanie: Słuchaj / Pauza / Stop + Wybór prędkości (1.0x, 1.25x, 1.5x)
 * - Zgodność z WCAG 2.2 AA (min. 44px) oraz analityką GA4 (audio_play)
 * ══════════════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  if (typeof window === 'undefined') return;
  if (window.CCUniversalTTS) return;

  var synth = window.speechSynthesis;
  var hasSpeechAPI = !!(synth && window.SpeechSynthesisUtterance);

  var LS_SPEED = 'cc_tts_speed';
  var SPEEDS = [0.9, 1.0, 1.25, 1.5];
  var currentSpeed = parseFloat(localStorage.getItem(LS_SPEED) || '1.0');
  if (!SPEEDS.includes(currentSpeed)) currentSpeed = 1.0;

  var state = {
    isPlaying: false,
    isPaused: false,
    currentArticle: null,
    paragraphs: [],
    paraIndex: 0,
    sentences: [],
    sentenceIndex: 0,
    heartbeat: null,
    sessionToken: 0,
    activeButton: null,
    activeLang: 'pl'
  };

  // ── Słownik UI Playera ──
  var I18N = {
    pl: {
      listen: 'Słuchaj',
      listening: 'Czytam...',
      pause: 'Pauza',
      resume: 'Wznów',
      stop: 'Zatrzymaj',
      speed: 'Prędkość',
      notSupported: 'Synteza mowy niedostępna w tej przeglądarce'
    },
    en: {
      listen: 'Listen',
      listening: 'Reading...',
      pause: 'Pause',
      resume: 'Resume',
      stop: 'Stop',
      speed: 'Speed',
      notSupported: 'Speech synthesis not supported in this browser'
    },
    es: {
      listen: 'Escuchar',
      listening: 'Leyendo...',
      pause: 'Pausa',
      resume: 'Continuar',
      stop: 'Detener',
      speed: 'Velocidad',
      notSupported: 'Síntesis de voz no disponible'
    },
    de: {
      listen: 'Anhören',
      listening: 'Liest vor...',
      pause: 'Pause',
      resume: 'Fortsetzen',
      stop: 'Stopp',
      speed: 'Geschwindigkeit',
      notSupported: 'Sprachsynthese nicht verfügbar'
    },
    uk: {
      listen: 'Слухати',
      listening: 'Читання...',
      pause: 'Пауза',
      resume: 'Продовжити',
      stop: 'Зупинити',
      speed: 'Швидкість',
      notSupported: 'Синтез мовлення недоступний'
    }
  };

  function getActiveLang() {
    try {
      var choice = localStorage.getItem('cc_user_lang_choice');
      if (choice) return choice.slice(0, 2).toLowerCase();
      var lumina = localStorage.getItem('lumina_lang');
      if (lumina) return lumina.slice(0, 2).toLowerCase();
    } catch (_) {}
    var docLang = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
    return docLang || 'pl';
  }

  function getI18nText(key) {
    var lang = getActiveLang();
    var dict = I18N[lang] || I18N.pl;
    return dict[key] || I18N.pl[key] || '';
  }

  // ── Dobór głosu syntezatora wg języka ──
  function pickVoiceForLang(targetLang) {
    if (!synth) return null;
    var voices = synth.getVoices() || [];
    if (!voices.length) return null;

    var prefix = (targetLang || 'pl').toLowerCase();
    var matching = voices.filter(function (v) {
      return (v.lang || '').toLowerCase().startsWith(prefix);
    });

    if (!matching.length) {
      // Fallback: dopasuj dowolny zbliżony lub domyślny
      return voices.find(function (v) { return v.default; }) || voices[0];
    }

    // Preferuj naturalne głosy kobiece lub studyjne
    var premium = matching.find(function (v) {
      return /natural|neural|premium|paulina|zofia|samantha|female|kobieta/i.test(v.name);
    });
    return premium || matching[0];
  }

  // ── Czyszczenie i podział tekstu ──
  function cleanText(raw) {
    if (!raw) return '';
    return raw
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/—|–/g, ', ')
      .replace(/[„”"«»]/g, '')
      .replace(/https?:\/\/\S+/g, '') // nie czytaj linków URL
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, '') // emoji
      .replace(/\s+/g, ' ')
      .trim();
  }

  function splitIntoSentences(text) {
    var raw = text.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [text];
    var list = [];
    raw.forEach(function (s) {
      var t = s.trim();
      if (t) list.push(t);
    });
    return list.length ? list : [text];
  }

  // ── Heartbeat dla Chrome 15s bug ──
  function startHeartbeat() {
    stopHeartbeat();
    state.heartbeat = setInterval(function () {
      if (synth && synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      }
    }, 10000);
  }

  function stopHeartbeat() {
    if (state.heartbeat) {
      clearInterval(state.heartbeat);
      state.heartbeat = null;
    }
  }

  // ── Podświetlanie czytanego akapitu (Karaoke) ──
  function highlightPara(el) {
    clearHighlight();
    if (el && el.classList) {
      el.classList.add('cc-tts-active-para');
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (_) {}
    }
  }

  function clearHighlight() {
    document.querySelectorAll('.cc-tts-active-para').forEach(function (p) {
      p.classList.remove('cc-tts-active-para');
    });
  }

  // ── Odtwarzanie sekwencyjne ──
  function speakNextSentence() {
    var token = state.sessionToken;
    if (!state.isPlaying || state.isPaused) return;

    if (state.paraIndex >= state.paragraphs.length) {
      stopPlayback();
      return;
    }

    var paraObj = state.paragraphs[state.paraIndex];
    highlightPara(paraObj.element);

    if (state.sentenceIndex >= state.sentences.length) {
      state.paraIndex++;
      if (state.paraIndex < state.paragraphs.length) {
        state.sentences = splitIntoSentences(state.paragraphs[state.paraIndex].text);
        state.sentenceIndex = 0;
      } else {
        stopPlayback();
        return;
      }
    }

    var sentenceText = state.sentences[state.sentenceIndex];
    if (!sentenceText) {
      state.sentenceIndex++;
      speakNextSentence();
      return;
    }

    var utt = new SpeechSynthesisUtterance(sentenceText);
    utt.lang = state.activeLang === 'pl' ? 'pl-PL' : state.activeLang === 'en' ? 'en-US' : state.activeLang;
    utt.rate = currentSpeed;
    utt.pitch = 1.0;

    var voice = pickVoiceForLang(state.activeLang);
    if (voice) utt.voice = voice;

    utt.onend = function () {
      if (token !== state.sessionToken) return;
      state.sentenceIndex++;
      speakNextSentence();
    };

    utt.onerror = function (e) {
      if (token !== state.sessionToken) return;
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        state.sentenceIndex++;
        speakNextSentence();
      }
    };

    synth.speak(utt);
  }

  function startPlayback(targetElement, triggerButton) {
    if (!hasSpeechAPI) {
      alert(getI18nText('notSupported'));
      return;
    }

    stopPlayback();

    // Pobierz akapity tekstu
    var paraEls = targetElement.querySelectorAll('p, blockquote, .post-text-body, .daily-reflection-fulltext, .lesson-paragraph');
    var rawList = [];

    if (paraEls.length > 0) {
      paraEls.forEach(function (p) {
        var txt = cleanText(p.textContent || '');
        if (txt.length > 5) {
          rawList.push({ element: p, text: txt });
        }
      });
    } else {
      var fullTxt = cleanText(targetElement.textContent || '');
      if (fullTxt) {
        rawList.push({ element: targetElement, text: fullTxt });
      }
    }

    if (!rawList.length) return;

    state.isPlaying = true;
    state.isPaused = false;
    state.currentArticle = targetElement;
    state.paragraphs = rawList;
    state.paraIndex = 0;
    state.sentences = splitIntoSentences(rawList[0].text);
    state.sentenceIndex = 0;
    state.sessionToken = Date.now();
    state.activeButton = triggerButton;
    state.activeLang = getActiveLang();

    startHeartbeat();
    updateButtonUI(triggerButton, 'playing');

    // Telemetria GA4
    if (window.ccTrack) {
      window.ccTrack('audio_play', { stream: 'universal_tts', lang: state.activeLang });
    }
    if (window.ccTrackPolonia) {
      window.ccTrackPolonia('tts_play', { lang: state.activeLang });
    }

    speakNextSentence();
  }

  function pausePlayback() {
    if (!state.isPlaying || state.isPaused) return;
    state.isPaused = true;
    if (synth) synth.pause();
    stopHeartbeat();
    if (state.activeButton) updateButtonUI(state.activeButton, 'paused');
  }

  function resumePlayback() {
    if (!state.isPlaying || !state.isPaused) return;
    state.isPaused = false;
    if (synth) synth.resume();
    startHeartbeat();
    if (state.activeButton) updateButtonUI(state.activeButton, 'playing');
  }

  function stopPlayback() {
    state.isPlaying = false;
    state.isPaused = false;
    state.sessionToken = 0;
    stopHeartbeat();
    clearHighlight();
    if (synth) {
      try { synth.cancel(); } catch (_) {}
    }
    if (state.activeButton) {
      updateButtonUI(state.activeButton, 'idle');
      state.activeButton = null;
    }
  }

  function updateButtonUI(btn, status) {
    if (!btn) return;
    var iconEl = btn.querySelector('.cc-tts-icon');
    var labelEl = btn.querySelector('.cc-tts-label');

    if (status === 'playing') {
      if (iconEl) iconEl.className = 'cc-tts-icon fa-solid fa-pause';
      if (labelEl) labelEl.textContent = getI18nText('pause');
      btn.classList.add('cc-tts-btn--active');
    } else if (status === 'paused') {
      if (iconEl) iconEl.className = 'cc-tts-icon fa-solid fa-play';
      if (labelEl) labelEl.textContent = getI18nText('resume');
      btn.classList.add('cc-tts-btn--active');
    } else {
      if (iconEl) iconEl.className = 'cc-tts-icon fa-solid fa-play';
      if (labelEl) labelEl.textContent = getI18nText('listen');
      btn.classList.remove('cc-tts-btn--active');
    }
  }

  // ── Wstrzykiwanie Stylów CSS (Klasyczny Pomarańczowy #FF7A00 - JOMA-D052) ──
  function injectStyles() {
    if (document.getElementById('cc-universal-tts-styles')) return;
    var style = document.createElement('style');
    style.id = 'cc-universal-tts-styles';
    style.textContent = [
      '/* CC UNIVERSAL TTS BAR (Dyrektywa JOMA-D052 Pomarańczowy #FF7A00) */',
      ':root {',
      '  --cc-btn-orange: #FF7A00;',
      '  --cc-btn-orange-hover: #FF8C33;',
      '  --cc-btn-orange-active: #E66A00;',
      '}',
      '.cc-tts-bar {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  margin: 12px 0 16px 0;',
      '  padding: 4px 6px;',
      '  background: rgba(18, 18, 26, 0.85);',
      '  border: 1px solid rgba(255, 122, 0, 0.35);',
      '  border-radius: 9999px;',
      '  backdrop-filter: blur(8px);',
      '  -webkit-backdrop-filter: blur(8px);',
      '  max-width: 100%;',
      '  flex-wrap: wrap;',
      '}',
      '.cc-tts-play-btn {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  background: var(--cc-btn-orange);',
      '  color: #FFFFFF !important;',
      '  border: none;',
      '  border-radius: 9999px;',
      '  min-height: 44px;',
      '  min-width: 44px;',
      '  padding: 6px 18px;',
      '  font-family: \'Outfit\', \'Manrope\', sans-serif;',
      '  font-size: 13px;',
      '  font-weight: 800;',
      '  letter-spacing: 0.5px;',
      '  cursor: pointer;',
      '  box-shadow: 0 4px 14px rgba(255, 122, 0, 0.4);',
      '  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);',
      '}',
      '.cc-tts-play-btn:hover {',
      '  background: var(--cc-btn-orange-hover);',
      '  box-shadow: 0 6px 18px rgba(255, 122, 0, 0.55);',
      '  transform: translateY(-1px);',
      '}',
      '.cc-tts-play-btn:active {',
      '  background: var(--cc-btn-orange-active);',
      '  transform: scale(0.97);',
      '}',
      '.cc-tts-play-btn .cc-tts-icon-circle {',
      '  width: 24px;',
      '  height: 24px;',
      '  border-radius: 50%;',
      '  background: rgba(255, 255, 255, 0.25);',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: 10px;',
      '}',
      '.cc-tts-stop-btn {',
      '  min-height: 44px;',
      '  min-width: 44px;',
      '  padding: 6px 12px;',
      '  border-radius: 9999px;',
      '  border: 1px solid rgba(255, 255, 255, 0.15);',
      '  background: transparent;',
      '  color: #94a3b8;',
      '  cursor: pointer;',
      '  font-size: 12px;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  transition: all 0.2s;',
      '}',
      '.cc-tts-stop-btn:hover {',
      '  color: #ffffff;',
      '  border-color: rgba(255, 122, 0, 0.4);',
      '}',
      '.cc-tts-speed-btn {',
      '  min-height: 44px;',
      '  padding: 6px 10px;',
      '  border-radius: 9999px;',
      '  border: 1px solid rgba(255, 255, 255, 0.15);',
      '  background: transparent;',
      '  color: #e2cc9a;',
      '  font-family: monospace;',
      '  font-size: 11px;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  transition: all 0.2s;',
      '}',
      '.cc-tts-speed-btn:hover {',
      '  border-color: var(--cc-btn-orange);',
      '}',
      '/* Karaoke akapitu */',
      '.cc-tts-active-para {',
      '  background: rgba(255, 122, 0, 0.08) !important;',
      '  border-left: 3px solid #FF7A00 !important;',
      '  padding-left: 12px !important;',
      '  border-radius: 4px;',
      '  transition: all 0.3s ease;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Tworzenie komponentu UI ──
  function createTTSBar(targetElement) {
    var bar = document.createElement('div');
    bar.className = 'cc-tts-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Odtwarzacz lektora / Audio player');

    var playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'cc-tts-play-btn';
    playBtn.setAttribute('aria-label', getI18nText('listen'));

    playBtn.innerHTML = [
      '<span class="cc-tts-icon-circle"><i class="cc-tts-icon fa-solid fa-play"></i></span>',
      '<span class="cc-tts-label">' + getI18nText('listen') + '</span>'
    ].join('');

    playBtn.addEventListener('click', function () {
      if (state.isPlaying && state.currentArticle === targetElement) {
        if (state.isPaused) {
          resumePlayback();
        } else {
          pausePlayback();
        }
      } else {
        startPlayback(targetElement, playBtn);
      }
    });

    var stopBtn = document.createElement('button');
    stopBtn.type = 'button';
    stopBtn.className = 'cc-tts-stop-btn';
    stopBtn.setAttribute('aria-label', getI18nText('stop'));
    stopBtn.title = getI18nText('stop');
    stopBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
    stopBtn.addEventListener('click', function () {
      stopPlayback();
    });

    var speedBtn = document.createElement('button');
    speedBtn.type = 'button';
    speedBtn.className = 'cc-tts-speed-btn';
    speedBtn.setAttribute('aria-label', getI18nText('speed'));
    speedBtn.textContent = currentSpeed.toFixed(1) + 'x';
    speedBtn.addEventListener('click', function () {
      var idx = SPEEDS.indexOf(currentSpeed);
      currentSpeed = SPEEDS[(idx + 1) % SPEEDS.length];
      localStorage.setItem(LS_SPEED, currentSpeed);
      speedBtn.textContent = currentSpeed.toFixed(1) + 'x';
      if (state.isPlaying && !state.isPaused) {
        // Zastosuj nową prędkość od następnego zdania
      }
    });

    bar.appendChild(playBtn);
    bar.appendChild(stopBtn);
    bar.appendChild(speedBtn);

    return bar;
  }

  // ── Auto-wykrywanie i podpinanie na stronach ──
  function autoMount() {
    injectStyles();

    // 1. Jawne znaczniki data-cc-tts
    document.querySelectorAll('[data-cc-tts]').forEach(function (el) {
      if (el.dataset.ccTtsMounted) return;
      el.dataset.ccTtsMounted = 'true';
      var bar = createTTSBar(el);
      el.insertBefore(bar, el.firstChild);
    });

    // 2. Szablony artykułów CCN News (.ccn-article, .article-content, article)
    var newsArticles = document.querySelectorAll('.ccn-article-body, .article-content, .ccn-content, #articleBody');
    newsArticles.forEach(function (art) {
      if (art.dataset.ccTtsMounted) return;
      art.dataset.ccTtsMounted = 'true';
      var bar = createTTSBar(art);
      art.parentNode.insertBefore(bar, art);
    });

    // 3. Lekcje Akademii / Kursu Codziennego
    var lessons = document.querySelectorAll('.lesson-body, #lessonBody, .kc-lesson-content, .academy-lesson-content');
    lessons.forEach(function (les) {
      if (les.dataset.ccTtsMounted) return;
      les.dataset.ccTtsMounted = 'true';
      var bar = createTTSBar(les);
      les.parentNode.insertBefore(bar, les);
    });
  }

  // ── Nasłuchiwanie zmian języka w ekosystemie ──
  window.addEventListener('cc-language-changed', function (e) {
    if (state.isPlaying) {
      // Jeśli język zmienił się podczas czytania, zatrzymaj
      stopPlayback();
    }
    // Zaktualizuj etykiety przycisków
    document.querySelectorAll('.cc-tts-play-btn').forEach(function (btn) {
      if (!btn.classList.contains('cc-tts-btn--active')) {
        var lbl = btn.querySelector('.cc-tts-label');
        if (lbl) lbl.textContent = getI18nText('listen');
      }
    });
  });

  window.addEventListener('beforeunload', function () {
    if (synth) {
      try { synth.cancel(); } catch (_) {}
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount);
  } else {
    autoMount();
  }

  // ── Publiczne API ──
  window.CCUniversalTTS = {
    start: startPlayback,
    pause: pausePlayback,
    resume: resumePlayback,
    stop: stopPlayback,
    autoMount: autoMount,
    setSpeed: function (s) {
      if (SPEEDS.includes(s)) {
        currentSpeed = s;
        localStorage.setItem(LS_SPEED, s);
      }
    }
  };
})();
