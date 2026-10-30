/**
 * Gerald Welch Showcase Application Script
 * Christian Culture Network (CCN)
 */

(() => {
  'use strict';

  // 1. Odliczanie do oficjalnej premiery radiowej WORLD WAR YOU: 20 listopada 2026
  const PREMIERE_DATE = new Date('2026-11-20T00:00:00Z').getTime();

  function updateCountdown() {
    const now = Date.now();
    const diff = PREMIERE_DATE - now;

    const daysEl = document.getElementById('gwDays');
    const hoursEl = document.getElementById('gwHours');
    const minsEl = document.getElementById('gwMins');
    const secsEl = document.getElementById('gwSecs');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      const statusTitle = document.getElementById('gwPremiereStatus');
      if (statusTitle) {
        const lang = document.documentElement.lang || 'pl';
        statusTitle.textContent = lang === 'en' ? 'Radio Broadcast Premiere Available' : 'Premiera na antenie radiowej';
      }
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  }

  // 2. Inicjalizacja odliczania
  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);
  window.addEventListener('unload', () => clearInterval(timer));

  // 3. Obsługa płynnego przewijania
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          targetEl.focus({ preventScroll: true });
        }
      }
    });
  });

  // 4. Panel krawędziowy EkoCC fallback trigger bridge
  const edgeBtn = document.getElementById('gwEdgeTriggerBtn');
  if (edgeBtn) {
    edgeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const existingTrigger = document.querySelector('.cc-mobile-edge-trigger:not(#gwEdgeTriggerBtn)');
      if (existingTrigger) {
        existingTrigger.click();
      } else if (window.CCMobileEdge && typeof window.CCMobileEdge.mount === 'function') {
        const dialog = document.getElementById('cc-mobile-edge-dialog');
        if (dialog && typeof dialog.showModal === 'function') {
          dialog.showModal();
        }
      }
    });
  }

  // 5. Radio CC Global — Oficjalny strumień na żywo (https://stream.zeno.fm/umej2cuqncluv)
  const CC_GLOBAL_STREAM_URL = 'https://stream.zeno.fm/umej2cuqncluv';
  const audioEl = document.getElementById('gwGlobalAudio');
  const playBtn = document.getElementById('gwRadioPlayBtn');
  const tuneBtn = document.getElementById('gwTuneInBtn');
  const radioBar = document.getElementById('gwRadioBar');
  const statusEl = document.getElementById('gwRadioStatus');
  const btnTextEl = playBtn ? playBtn.querySelector('.gw-radio-btn-text') : null;

  const isEn = (document.documentElement.lang || 'pl').toLowerCase().startsWith('en');
  const labels = {
    play: isEn ? 'Listen Live' : 'Słuchaj na żywo',
    pause: isEn ? 'Pause Stream' : 'Zatrzymaj',
    connecting: isEn ? 'Connecting...' : 'Łączenie...',
    live: isEn ? 'Live Broadcast' : 'Emisja na żywo',
    paused: isEn ? 'Paused' : 'Zatrzymano',
    error: isEn ? 'Stream unavailable' : 'Strumień chwilowo niedostępny'
  };

  function setPlayingState(isPlaying) {
    if (playBtn) {
      playBtn.classList.toggle('is-playing', isPlaying);
      playBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
      if (btnTextEl) {
        btnTextEl.textContent = isPlaying ? labels.pause : labels.play;
      }
    }
    if (radioBar) {
      radioBar.classList.toggle('is-playing', isPlaying);
    }
    if (statusEl) {
      statusEl.textContent = isPlaying ? labels.live : labels.paused;
    }
  }

  function toggleRadio() {
    if (!audioEl) return;

    if (!audioEl.src || audioEl.src === '' || audioEl.src === window.location.href) {
      audioEl.src = CC_GLOBAL_STREAM_URL;
    }

    if (audioEl.paused) {
      // Shared anti-double-audio: notify ecosystem and pause any other radio elements
      window.dispatchEvent(new CustomEvent('cc:radio-start', { detail: { source: 'welch-radio' } }));
      document.querySelectorAll('audio').forEach(a => {
        if (a !== audioEl && !a.paused) a.pause();
      });

      if (statusEl) statusEl.textContent = labels.connecting;
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayingState(true);
          })
          .catch((err) => {
            console.warn('[Radio CC Global] Play interrupted or blocked:', err);
            setPlayingState(false);
            if (statusEl) statusEl.textContent = labels.error;
          });
      }
    } else {
      audioEl.pause();
      setPlayingState(false);
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', toggleRadio);
  }

  if (tuneBtn) {
    tuneBtn.addEventListener('click', () => {
      if (audioEl && audioEl.paused) {
        toggleRadio();
      }
      if (radioBar) {
        radioBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  if (audioEl) {
    audioEl.addEventListener('playing', () => setPlayingState(true));
    audioEl.addEventListener('pause', () => setPlayingState(false));
    audioEl.addEventListener('waiting', () => {
      if (statusEl) statusEl.textContent = labels.connecting;
    });
    audioEl.addEventListener('error', () => {
      setPlayingState(false);
      if (statusEl) statusEl.textContent = labels.error;
    });

    // Listen for other audio activations across Christian Culture Network
    window.addEventListener('cc:radio-start', (e) => {
      if (e.detail?.source !== 'welch-radio' && !audioEl.paused) {
        audioEl.pause();
        setPlayingState(false);
      }
    });
  }

  // 6. THE CALL — ALBUM EXPERIENCE (Gerald Welch Debut Album)
  const albumSection = document.getElementById('the-call');
  if (albumSection) {
    const PUBLIC_PLAYBACK_APPROVED = false; // Strictly Phase A: public playback pending artist authorization

    const tracksData = [
      {
        id: '01',
        title: 'ACTS 29',
        driveId: '13YNPTUpm-1tMlk2eWWjejny42wPWT8v0',
        badgeEN: 'Faith Rock',
        badgePL: 'Rock Chrześcijański',
        descEN: 'A poignant reflection contrasting the comfortable, affluent religion of the West with the courage of believers facing underground persecution and martyrdom across China, Africa, and Iran. "It’s about the saints, not dollar signs."',
        descPL: 'Poruszająca kompozycja zestawiająca bezpieczną religijność Zachodu z niezłomnością wierzących cierpiących prześladowania i męczeństwo w Chinach, Afryce i Iranie. „Tu chodzi o świętych, nie o znaki dolarów”.'
      },
      {
        id: '02',
        title: 'NO IDEA',
        driveId: '1nL6vy2MjzkAXCfxFjXOGcPw8_s7I30Dr',
        badgeEN: 'Faith Rock',
        badgePL: 'Rock Chrześcijański',
        descEN: 'A humbling theological reality check confronting human pride, philosophy, and science with the unfathomable sovereignty of God: "His ways are higher than your mind and deeper than quantum foam."',
        descPL: 'Pokorna refleksja teologiczna konfrontująca ludzką pychę, naukę i filozofię z niepojętą wielkością i suwerennością Boga: „Jego drogi przewyższają twój umysł i sięgają głębiej niż kwantowa piana”.'
      },
      {
        id: '03',
        title: 'THE STANDARDS OF MAN',
        driveId: '1-PBxHH0Qd-o1x2GD04veSQwvLIurghI2',
        badgeEN: 'Faith Rock',
        badgePL: 'Rock Chrześcijański',
        descEN: 'Gerald’s defense of the Gospel of Grace, criticizing man-made legalistic rules presented as divine commands, while upholding true biblical holiness and love: "The Word is the Rock, and the Rock will stand."',
        descPL: 'Obrona Ewangelii Łaski przez pryzmat biblijnej prawdy — odrzucenie faryzejskiego legalizmu i ludzkich zakazów na rzecz prawdziwej świętości w Chrystusie: „Słowo jest Skałą, a Skała ocaleje”.'
      },
      {
        id: '04',
        title: 'WORSHIP',
        driveId: '1OIhTZDJ9WW63RNGcKm5UOQ1SuOqgr3z0',
        badgeEN: 'Instrumental',
        badgePL: 'Instrumentalny',
        descEN: 'A reverent, contemplative instrumental composition inviting the listener into quiet prayer, personal adoration, and the peaceful presence of God without spoken words.',
        descPL: 'Nastrojowa, modlitewna kompozycja instrumentalna zapraszająca do wyciszenia, adoracji i osobistego spotkania z Bożą obecnością bez słów.'
      },
      {
        id: '05',
        title: 'RAISE THE DEAD',
        driveId: '1E-axNtyZKNaaD3mrQ_753I1Y4vAcxRG0',
        badgeEN: 'Faith Rock',
        badgePL: 'Rock Chrześcijański',
        descEN: 'A proclamation of Christ\'s triumph over spiritual death and the grave: "The stone is rolled away! The grave has lost its claim!" Moving from spiritual barrenness to redemption in Christ.',
        descPL: 'Świadectwo duchowego zmartwychwstania i zwycięstwa Chrystusa nad śmiercią i grobem: „Kamień odwalony! Grób stracił swoje prawa!”. Osobiste wyzwolenie z duchowego głodu.'
      },
      {
        id: '06',
        title: 'WITNESS',
        driveId: '1FxYcRra5DbEJxxoDoBirTegjzO6eJm6W',
        badgeEN: 'Prophetic Rock',
        badgePL: 'Głos Proroczy',
        descEN: 'An urgent prophetic alarm drawing upon the biblical narrative of the Two Witnesses in Revelation, calling the Church to awaken from complacency: "CHURCH! What are you waiting for?"',
        descPL: 'Płomienne wezwanie prorocze inspirowane biblijną Księgą Objawienia i Dwoma Świadkami, wzywające Kościół do przebudzenia z uśpienia: „KOŚCIELE! Na co jeszcze czekasz?”.'
      },
      {
        id: '07',
        title: 'KINGDOM COME',
        driveId: '1hWjzeUz36wNNSKAdU06bcWqkhzZ2eRRp',
        badgeEN: 'Faith Rock',
        badgePL: 'Rock Chrześcijański',
        descEN: 'A heartfelt autobiographical reflection on the transience of worldly wealth and earthly castles traded for eternity: "What is a kingdom when the crowns are made of clay? ... His Kingdom will have no end."',
        descPL: 'Osobista, głęboka pieśń o przemijalności ziemskich bogactw, kariery i doczesnych sukcesów: „Czym jest królestwo, gdy korony ulepiono z gliny? ... Jego Królestwo nie będzie mieć końca”.'
      },
      {
        id: '08',
        title: 'VAMPIRE',
        driveId: '1jwK2gtpX6a4NV1VG1S05JZ9GgmOhfHjl',
        badgeEN: 'Metaphorical Critique',
        badgePL: 'Krytyka Nadużyć',
        descEN: 'Author’s explicit clarification: A metaphorical critique exposing spiritual manipulation and the theatrical commercialization of faith in megachurches — not directed at Christianity, Catholic worship, or Holy Communion.',
        descPL: 'Wyjaśnienie autora: Metaforyczna krytyka nadużyć religijnych, manipulacji i komercjalizacji wiary w korporacyjnych megakościołach — bez ataku na całe chrześcijaństwo, Kościół powszechny ani Eucharystię.'
      },
      {
        id: '09',
        title: 'ASHES ON ALTARS',
        driveId: '1rVcvHPi_7CT6yAri8zh7bzzS5bFMMV0s',
        badgeEN: 'Deliverance Anthem',
        badgePL: 'Hymn Wyzwolenia',
        descEN: 'The climactic anthem of deliverance, spiritual victory, and freedom through the Blood of Christ: "Shatter their hold! Break their chains! You never have to fear again!"',
        descPL: 'Finałowy hymn duchowego wyzwolenia, zwycięstwa i odkupienia w Przenajświętszej Krwi Chrystusa: „Złam ich moc! Rozerwij te kajdany! Już nigdy nie musisz się lękać!”.'
      }
    ];

    let selectedIndex = 0;
    const tracklistEl = document.getElementById('cc-tracklist');
    const rdsDisplay = document.getElementById('cc-rds-display');
    const selectedTrackLabel = document.getElementById('cc-selected-track');
    const selectedDesc = document.getElementById('cc-selected-desc');
    const previewContainer = document.getElementById('cc-preview');
    const playbackStatus = document.getElementById('cc-playback-status');
    const playBtn = document.getElementById('cc-play');
    const prevBtn = document.getElementById('cc-prev');
    const nextBtn = document.getElementById('cc-next');

    function renderTracklist() {
      if (!tracklistEl) return;
      tracklistEl.innerHTML = '';

      tracksData.forEach((track, i) => {
        const li = document.createElement('li');
        li.className = 'cc-track-item';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cc-track-btn';
        btn.setAttribute('aria-current', i === selectedIndex ? 'true' : 'false');
        btn.setAttribute('aria-label', `${track.id}. ${track.title} — ${isEn ? track.badgeEN : track.badgePL}`);

        const leftSpan = document.createElement('span');
        leftSpan.className = 'cc-track-name-wrap';

        const idxSpan = document.createElement('span');
        idxSpan.className = 'cc-track-index';
        idxSpan.textContent = track.id;

        const titleSpan = document.createElement('span');
        titleSpan.className = 'cc-track-title';
        titleSpan.textContent = track.title;

        leftSpan.appendChild(idxSpan);
        leftSpan.appendChild(titleSpan);

        const badgeSpan = document.createElement('span');
        badgeSpan.className = 'cc-track-badge';
        badgeSpan.textContent = isEn ? track.badgeEN : track.badgePL;

        btn.appendChild(leftSpan);
        btn.appendChild(badgeSpan);

        btn.addEventListener('click', () => selectTrack(i));
        li.appendChild(btn);
        tracklistEl.appendChild(li);
      });
    }

    function selectTrack(index) {
      selectedIndex = (index + tracksData.length) % tracksData.length;
      const track = tracksData[selectedIndex];

      if (rdsDisplay) {
        rdsDisplay.textContent = `GERALD WELCH · THE CALL · ${track.title}`;
      }
      if (selectedTrackLabel) {
        selectedTrackLabel.textContent = `${track.id} · ${track.title}`;
      }
      if (selectedDesc) {
        selectedDesc.textContent = isEn ? track.descEN : track.descPL;
      }

      if (tracklistEl) {
        const buttons = tracklistEl.querySelectorAll('.cc-track-btn');
        buttons.forEach((btn, idx) => {
          btn.setAttribute('aria-current', idx === selectedIndex ? 'true' : 'false');
        });
      }

      // Safe Phase A preview management
      if (previewContainer) {
        previewContainer.replaceChildren();
        if (PUBLIC_PLAYBACK_APPROVED) {
          // Phase B adapter (when authorized by Gerald)
          const iframe = document.createElement('iframe');
          iframe.src = `https://drive.google.com/file/d/${track.driveId}/preview`;
          iframe.title = `Preview: ${track.title}`;
          iframe.allow = 'autoplay';
          previewContainer.appendChild(iframe);
          previewContainer.hidden = false;
        } else {
          previewContainer.hidden = true;
        }
      }

      if (playbackStatus) {
        playbackStatus.textContent = PUBLIC_PLAYBACK_APPROVED
          ? (isEn ? 'Select the authorized Google Drive preview above to listen.' : 'Wybierz zatwierdzony podgląd Google Drive powyżej, aby odsłuchać.')
          : (isEn ? 'Album presentation and author annotations available. Public listening is currently pending artist and broadcast authorization. Pre-release recordings are protected from unauthorized on-demand distribution.' : 'Prezentacja albumu i autorskie opisy utworów są aktywne. Publiczny odsłuch nagrań na żądanie oczekuje na formalną autoryzację artysty i dystrybucji. Zgodnie ze standardami redakcyjnymi materiały przedpremierowe są chronione przed nieuprawnionym streamingiem.');
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => selectTrack(selectedIndex - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => selectTrack(selectedIndex + 1));
    }
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (!PUBLIC_PLAYBACK_APPROVED) {
          const msg = isEn
            ? 'Public on-demand playback of THE CALL is currently locked pending formal artist authorization and broadcast licensing. You can explore the full tracklist, RDS titles, and author annotations below.'
            : 'Publiczny odsłuch albumu THE CALL na żądanie jest obecnie zablokowany do czasu uzyskania formalnej autoryzacji artysty i licencji emisyjnej. Poniżej możesz zapoznać się z pełną listą utworów, wskaźnikiem RDS i autorskimi opisami.';
          alert(msg);
        } else {
          // If enabled in Phase B, pause radio CC Global if active
          window.dispatchEvent(new CustomEvent('cc:radio-start', { detail: { source: 'album-player' } }));
        }
      });
    }

    renderTracklist();
    selectTrack(0);
  }
})();
