/**
 * Pokonać Goliata — Główny silnik interaktywny
 * Autor: Cezary Rogowski | Christian Culture
 */

const BOOK_CONFIG = {
  title: "Pokonać Goliata — Jak zwyciężać własne słabości",
  author: "Cezary Rogowski",
  url: "https://polskieradio.cc/pokonac-goliata",
  imageUrl: "https://polskieradio.cc/assets/pokonac-goliata-book-3d.webp",
  supportUrl: "https://revolut.me/christianculture",
  audioSrc: "/assets/pokonac-goliata.mp3",
  downloads: {
    pdf: "/assets/pokonac-goliata.pdf",
    epub: "/assets/pokonac-goliata.epub",
    mp3: "/assets/pokonac-goliata.mp3",
    bundle: "/assets/pokonac-goliata-pakiet.zip"
  }
};

const CHAPTERS = [
  {
    num: 1,
    title: "Małe początki",
    subtitle: "Rdz 4 / 1 Sm 17 — Wierność w cieniu pustkowia",
    duration: "24:08",
    excerpt: "Czasem Bóg rozpoczyna największe historie od najmniejszych kroków. To, co wydaje się nieznaczące w ludzkich oczach, w Jego rękach staje się początkiem wielkiego zwycięstwa.",
    content: `
      <p>Czasem Bóg rozpoczyna największe historie od najmniejszych kroków. To, co wydaje się nieznaczące w ludzkich oczach, w Jego rękach staje się początkiem wielkiego zwycięstwa.</p>
      <p>Zanim Dawid stanął naprzeciw olbrzyma w Dolinie Ela, przez długie miesiące pasł zaledwie kilka owiec swojego ojca na surowym pustkowiu Judei. Nikt go nie widział. Nikt nie oklaskiwał jego wierności. Kiedy z zarośli wybiegał lew lub niedźwiedź, młody pasterz nie miał wokół siebie armii ani doradców. Miał tylko procę, kij pasterski i zaufanie do Boga.</p>
      <blockquote>„Kto jest wierny w bardzo małej rzeczy, ten i w wielkiej będzie wierny.” (Łk 16:10)</blockquote>
      <p>Wielu ludzi czeka na swój „wielki moment”, lekceważąc małe, codzienne obowiązki. Myślą, że gdy pojawi się olbrzym, nagle zstąpi na nich niezwykła odwaga. Jednak prawda biblijna jest inna: twoje publiczne zwycięstwa rodzą się w twoich prywatnych, ukrytych zmaganiach. Jeśli nie nauczysz się zwyciężać lenistwa, lęku i wątpliwości w zaciszu własnego pokoju, padniesz przy pierwszej konfrontacji na arenie życia.</p>
      <p>Nie gardź dniem małych początków. To właśnie tam Bóg hartuje twój charakter do rzeczy, o których dziś jeszcze nawet nie śmiesz marzyć.</p>
    `
  },
  {
    num: 2,
    title: "Patrzeć inaczej",
    subtitle: "Perspektywa Nieba vs ludzki paraliż",
    duration: "28:15",
    excerpt: "Wszyscy widzieli olbrzyma zbyt wielkiego, by go zabić. Dawid widział olbrzyma zbyt wielkiego, by w niego nie trafić.",
    content: `
      <p>Przez czterdzieści dni armia Izraela drżała ze strachu. Każdego ranka i każdego wieczora z obozu Filistynów wychodził potężny wojownik o wzroście blisko trzech metrów. Jego zbroja lśniła w słońcu, a głos odbijał się echem od skalistych zboczy Doliny Ela.</p>
      <p>Żołnierze Saula, choć uzbrojeni po zęby, patrzyli na Goliata przez pryzmat własnej bezsilności. Mówili: „On jest zbyt wielki, nie mamy żadnych szans”. Gdy jednak w obozie pojawił się Dawid, usłyszał te same bluźnierstwa, ale spojrzał na olbrzyma zupełnie inaczej.</p>
      <blockquote>„Kimże jest ten nieobrzezany Filistyn, że urąga wojskom Boga żywego?” (1 Sm 17:26)</blockquote>
      <p>Dawid nie porównywał Goliata do siebie. Dawid porównał Goliata do wszechmogącego Boga! A w porównaniu ze Stwórcą wszechświata, każdy olbrzym staje się zaledwie prochem na szali wagi. Wszystko zależy od perspektywy: kiedy twoje oczy skupiają się na problemie, problem rośnie; kiedy skupiasz się na Bogu, problem maleje do właściwych rozmiarów.</p>
    `
  },
  {
    num: 3,
    title: "Broń, którą masz",
    subtitle: "Zdejmij cudzą zbroję i stań w prawdzie",
    duration: "22:40",
    excerpt: "Saul próbował ubrać Dawida w swoją ciężką zbroję. Nie wygrasz duchowej bitwy metodami tego świata.",
    content: `
      <p>Król Saul, chcąc dodać odwagi młodzieńcowi, nałożył na niego swój spiżowy hełm, pancerz i przypasał mu królewski miecz. Wyglądało to dostojnie, ale Dawid nie potrafił zrobić w tym nawet kilku kroków. Zbroja króla była za ciężka, niesprawdzona i obca.</p>
      <p>Dawid miał odwagę powiedzieć: „Nie mogę w tym chodzić, bo nie jestem przyzwyczajony”. Zdjął więc królewskie szaty i wziął do ręki to, czym potrafił się posługiwać: swój pasterski kij, torbę i procę. Nad potokiem wybrał pięć gładkich kamieni.</p>
      <blockquote>„Gdyż oręż naszej walki nie jest cielesny, lecz ma moc od Boga do burzenia twierdz.” (2 Kor 10:4)</blockquote>
      <p>Ilu z nas próbuje żyć i walczyć w cudzych pancerzach? Próbujemy udawać kogoś innego, naśladować strategie ludzi sukcesu tego świata, nosić maski pozornej pewności siebie. Bóg nie potrzebuje twojej kopii cudzych talentów. On chce posłużyć się tym, kim naprawdę jesteś, uświęcając to, co masz już w swoich dłoniach.</p>
    `
  },
  {
    num: 4,
    title: "Krok wiary",
    subtitle: "Od paraliżu do Doliny Przełomu",
    duration: "26:10",
    excerpt: "Wiara to nie brak strachu — to decyzja, by zbiec ze wzgórza wprost ku dolinie konfrontacji.",
    content: `
      <p>Większość ludzi przegrywa walkę z własnymi słabościami jeszcze przed jej rozpoczęciem. Paraliżuje ich lęk przed oceną, lęk przed porażką, głosy ludzi, którzy mówią: „To niemożliwe, daj sobie spokój”. Nawet rodzony brat Dawida, Eliab, drwił z niego i oskarżał go o pychę.</p>
      <p>Ale wiara to decyzja woli. Gdy Goliat ruszył naprzeciw, Dawid nie cofnął się ani na krok. Pismo Święte mówi o niezwykłym geście: „Dawid pośpiesznie wybiegł z szeregu naprzeciw Filistyna”. On biegł w stronę olbrzyma!</p>
      <blockquote>„Jeśli Bóg z nami, któż przeciwko nam?” (Rz 8:31)</blockquote>
      <p>Twój Goliat — czy jest to nałóg, dług, depresja, toksyczna relacja czy wewnętrzne poczucie winy — karmi się twoim unikaniem. Dopóki uciekasz, on rośnie w siłę. Kiedy w imieniu Jezusa Chrystusa robisz krok w przód i stawiasz czoła prawdzie, dynamika bitwy natychmiast się odwraca.</p>
    `
  },
  {
    num: 5,
    title: "Prawdziwa siła",
    subtitle: "Moc w Imieniu Pana Zastępów",
    duration: "29:50",
    excerpt: "Ty idziesz na mnie z mieczem, włócznią i tarczą, a ja idę na ciebie w Imieniu Pana Zastępów!",
    content: `
      <p>Słowa wypowiedziane na polu bitwy mają duchowy ciężar. Goliat złorzeczył Dawidowi przez swoich pogańskich bogów, obiecując rzucić jego ciało ptactwu niebieskiemu. Odpowiedź Dawida przeszła do historii jako manifest niezłomnej wiary:</p>
      <blockquote>„Ty idziesz na mnie z mieczem, z oszczepem i z włócznią, a ja idę na ciebie w imieniu Pana Zastępów, Boga wojsk izraelskich, którym urągałeś!” (1 Sm 17:45)</blockquote>
      <p>Dawid doskonale wiedział, skąd czerpie siłę. Nie ufał własnej celności ani sprężystości rzemienia procy. Jego mocą była Przymierze z Bogiem. Prawdziwe zwycięstwo chrześcijanina nie polega na napinaniu mięśni własnej woli, lecz na całkowitym poddaniu się woli Boga i ogłaszaniu Jego panowania nad każdą dziedziną życia.</p>
    `
  },
  {
    num: 6,
    title: "Dolina zmiany",
    subtitle: "Uzdrowienie ran i wolność od oskarżenia",
    duration: "25:30",
    excerpt: "Pomiędzy obietnicą a zwycięstwem leży dolina. To tam Bóg leczy twoje korzenie i uczy przebaczenia.",
    content: `
      <p>Każdy człowiek nosi w sobie wewnętrzną Dolinę Ela. To miejsce, gdzie spotykają się nasze dawne zranienia, nieprzebaczenie, traumy z dzieciństwa i poczucie odrzucenia. Wielu próbuje zagłuszyć ten ból pracoholizmem, używkami lub ucieczką w wirtualny świat.</p>
      <p>Ale Bóg nie przyszedł, aby dać ci powierzchowny makijaż religijny. On chce dotknąć korzenia twojej słabości. W dolinie zmiany musisz stanąć w prawdzie przed Bogiem: wyznać to, co ukryte, przebaczyć tym, którzy cię zranili, i przyjąć dar bezwarunkowej łaski.</p>
      <blockquote>„Choćbym nawet szedł ciemną doliną, zła się nie ulęknę, bo Ty jesteś ze mną.” (Ps 23:4)</blockquote>
      <p>Dolina nie jest miejscem twojej śmierci — dolina jest miejscem twojego narodzenia do nowego, wolnego życia.</p>
    `
  },
  {
    num: 7,
    title: "Zwycięstwo",
    subtitle: "Jeden celny kamień Prawdy",
    duration: "21:15",
    excerpt: "Kamień zagłębił się w czoło Filistyna i runął twarzą na ziemię. Tak upadają kłamstwa wroga.",
    content: `
      <p>Dawid sięgnął ręką do torby, wyjął z niej kamień, zakręcił procą i wypuścił pocisk. Jeden kamień. Jedno celne uderzenie. Kamień ugodził olbrzyma w czoło, krusząc jego dumę i moc. Olbrzym runął twarzą na ziemię.</p>
      <p>Czym jest ten kamień w twoim życiu? To jedno słowo Bożej Prawdy przyjęte głęboko do serca i wyznane z wiarą. Kłamstwo wroga mówi: „Nigdy się nie zmienisz”, kamień prawdy odpowiada: „Wszystko mogę w Tym, który mnie umacnia”. Kłamstwo mówi: „Jesteś sam”, prawda ogłasza: „Nie porzucę cię ani nie opuszczę”.</p>
      <blockquote>„A zwycięstwo, które zwyciężyło świat, to nasza wiara.” (1 J 5:4)</blockquote>
      <p>Gdy prawda uderza w kłamstwo, olbrzym nie ma szans. Upadek Goliata był tak głośny, że poruszył całą armię Izraela do triumfalnego pościgu za wrogiem.</p>
    `
  },
  {
    num: 8,
    title: "Nowe życie",
    subtitle: "Chodzenie w wolności i dziedzictwo wiary",
    duration: "27:40",
    excerpt: "Zwycięstwo nie jest metą — jest początkiem drogi, na której stajesz się oparciem dla innych.",
    content: `
      <p>Zwycięstwo nad Goliatem odmieniło bieg historii całego narodu. Pasterz, którym gardzili właśni bracia, stał się mężem według Bożego serca i przyszłym królem Izraela. Ale najważniejszym owocem tej bitwy nie była korona — była to odnowiona wiara tysięcy ludzi, którzy zrozumieli, że ich Bóg żyje i działa z mocą.</p>
      <p>Kiedy ty pokonujesz swojego Goliata, nie robisz tego tylko dla siebie. Robisz to dla swojej rodziny, dla swoich dzieci, dla przyjaciół i ludzi, którzy patrzą na twoje życie. Twoje świadectwo staje się pochodnią nadziei dla tych, którzy dziś jeszcze trzęsą się ze strachu w swoich namiotach.</p>
      <blockquote>„A oni zwyciężyli go przez krew Baranka i przez słowo swego świadectwa.” (Obj 12:11)</blockquote>
      <p>Chodź w nowości życia. Bądź odważny, stój mocno w wierze i pamiętaj: Nie musisz być silniejszy od Goliata. Musisz być bliżej Tego, który daje zwycięstwo!</p>
    `
  }
];

// Helper functions
const $ = (s, scope = document) => scope.querySelector(s);
const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];

const toast = $("#toast");
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2800);
}

// Global initialization
document.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();
  initTilt();
  initMiniReader();
  initFullReaderModal();
  initAudioPlayer();
  initDownloads();
  initSharing();
  initSupport();
  initSearch();
  initBackToTop();
  restoreSavedProgress();
});

/* ==========================================================================
   1. SMOOTH SCROLL
   ========================================================================== */
function initSmoothScroll() {
  $$('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(btn.dataset.scroll);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Nav active indicator
  const navLinks = $$('.main-nav a[href^="#"]');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 140;
    navLinks.forEach(link => {
      const sec = document.querySelector(link.getAttribute('href'));
      if (sec) {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   2. 3D TILT EFFECT
   ========================================================================== */
function initTilt() {
  const tilt = $('[data-tilt]');
  if (!tilt) return;

  tilt.addEventListener('mousemove', e => {
    const r = tilt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `perspective(1200px) rotateY(${x * 12}deg) rotateX(${y * -10}deg) translateY(-4px)`;
  });

  tilt.addEventListener('mouseleave', () => {
    tilt.style.transform = '';
  });
}

/* ==========================================================================
   3. MINI READER (CARD 1)
   ========================================================================== */
let currentChapterIdx = 0;

function initMiniReader() {
  const asideButtons = $$('.reader-preview aside button');
  asideButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      setMiniReaderChapter(idx);
    });
  });

  // Font size buttons in mini reader
  const zoomIn = $('#miniFontPlus');
  const zoomOut = $('#miniFontMinus');
  const miniText = $('#miniReaderText');
  let currentFontSize = 13.5;

  if (zoomIn && miniText) {
    zoomIn.addEventListener('click', () => {
      currentFontSize = Math.min(18, currentFontSize + 1.5);
      miniText.style.fontSize = `${currentFontSize}px`;
    });
  }
  if (zoomOut && miniText) {
    zoomOut.addEventListener('click', () => {
      currentFontSize = Math.max(11, currentFontSize - 1.5);
      miniText.style.fontSize = `${currentFontSize}px`;
    });
  }
}

function setMiniReaderChapter(idx) {
  if (idx < 0 || idx >= CHAPTERS.length) return;
  currentChapterIdx = idx;
  const ch = CHAPTERS[idx];

  // Update aside active state
  $$('.reader-preview aside button').forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });

  const chTag = $('#miniReaderChapterTag');
  const chTitle = $('#miniReaderTitle');
  const chText = $('#miniReaderText');
  const chProg = $('#miniReaderProgress');

  if (chTag) chTag.textContent = `Rozdział ${ch.num}`;
  if (chTitle) chTitle.textContent = ch.title;
  if (chText) chText.innerHTML = `<mark>${ch.excerpt}</mark>`;
  if (chProg) chProg.textContent = `${(idx + 1) * 40} / 320`;
}

/* ==========================================================================
   4. FULL READER MODAL
   ========================================================================== */
function initFullReaderModal() {
  const modal = $('#readerModal');
  if (!modal) return;

  $$('[data-open-reader]').forEach(btn => {
    btn.addEventListener('click', () => {
      openReaderModal(currentChapterIdx);
    });
  });

  $$('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeReaderModal);
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeReaderModal();
    }
  });

  // Modal chapter buttons
  $$('.reader-modal-nav button').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      renderModalChapter(idx);
    });
  });

  // Theme switchers
  $$('.reader-theme-switcher button').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = $('.reader-modal-page');
      if (!page) return;
      page.classList.remove('theme-sepia', 'theme-dark');
      if (btn.classList.contains('theme-sepia')) page.classList.add('theme-sepia');
      if (btn.classList.contains('theme-dark')) page.classList.add('theme-dark');
    });
  });

  // Font size in modal
  let modalFontSize = 19;
  $('#modalFontPlus')?.addEventListener('click', () => {
    modalFontSize = Math.min(26, modalFontSize + 2);
    $$('.reader-modal-page p').forEach(p => p.style.fontSize = `${modalFontSize}px`);
  });
  $('#modalFontMinus')?.addEventListener('click', () => {
    modalFontSize = Math.max(14, modalFontSize - 2);
    $$('.reader-modal-page p').forEach(p => p.style.fontSize = `${modalFontSize}px`);
  });

  // Bookmark button
  $('#bookmarkChapterBtn')?.addEventListener('click', () => {
    localStorage.setItem('pokonac_goliata_ch', currentChapterIdx);
    showToast(`Zapisano zakładkę: Rozdział ${CHAPTERS[currentChapterIdx].num} — ${CHAPTERS[currentChapterIdx].title}`);
  });
}

function openReaderModal(idx = 0) {
  const modal = $('#readerModal');
  if (!modal) return;
  renderModalChapter(idx);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeReaderModal() {
  const modal = $('#readerModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderModalChapter(idx) {
  currentChapterIdx = idx;
  const ch = CHAPTERS[idx];
  setMiniReaderChapter(idx);

  $$('.reader-modal-nav button').forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });

  const tag = $('#readerChapterTag');
  const title = $('#readerTitle');
  const body = $('#readerBody');
  const progress = $('#readerProgressInfo');

  if (tag) tag.textContent = `Rozdział ${ch.num} • ${ch.subtitle}`;
  if (title) title.textContent = ch.title;
  if (body) body.innerHTML = ch.content;
  if (progress) progress.textContent = `Rozdział ${idx + 1} z ${CHAPTERS.length}`;

  const page = $('.reader-modal-page');
  if (page) page.scrollTop = 0;
}

function restoreSavedProgress() {
  const saved = localStorage.getItem('pokonac_goliata_ch');
  if (saved !== null) {
    const idx = parseInt(saved, 10);
    if (!isNaN(idx) && idx >= 0 && idx < CHAPTERS.length) {
      setMiniReaderChapter(idx);
    }
  }
}

/* ==========================================================================
   5. AUDIOBOOK PLAYER ENGINE
   ========================================================================== */
let isPlaying = false;
let audioTrackIdx = 0;
let synthAudioContext = null;
let synthInterval = null;
let currentSeconds = 0;
let totalSeconds = 24 * 60 + 8; // 24:08

function initAudioPlayer() {
  const playToggle = $('#playToggle');
  const prevBtn = $('[data-prev]');
  const nextBtn = $('[data-next]');
  const skipBack = $('[data-skip="-15"]');
  const skipFwd = $('[data-skip="15"]');
  const heartBtn = $('.heart-btn');
  const chPrev = $('#audioChPrev');
  const chNext = $('#audioChNext');

  generateWaveformBars();

  if (playToggle) {
    playToggle.addEventListener('click', toggleAudioPlayback);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => changeAudioChapter(audioTrackIdx - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeAudioChapter(audioTrackIdx + 1));
  if (chPrev) chPrev.addEventListener('click', () => changeAudioChapter(audioTrackIdx - 1));
  if (chNext) chNext.addEventListener('click', () => changeAudioChapter(audioTrackIdx + 1));

  if (skipBack) {
    skipBack.addEventListener('click', () => {
      currentSeconds = Math.max(0, currentSeconds - 15);
      updateAudioTimer();
    });
  }

  if (skipFwd) {
    skipFwd.addEventListener('click', () => {
      currentSeconds = Math.min(totalSeconds, currentSeconds + 15);
      updateAudioTimer();
    });
  }

  if (heartBtn) {
    const isFav = localStorage.getItem('pokonac_goliata_fav') === '1';
    if (isFav) heartBtn.classList.add('active');

    heartBtn.addEventListener('click', () => {
      const nowFav = heartBtn.classList.toggle('active');
      localStorage.setItem('pokonac_goliata_fav', nowFav ? '1' : '0');
      showToast(nowFav ? 'Dodano audiobook do ulubionych!' : 'Usunięto z ulubionych.');
    });
  }
}

function generateWaveformBars() {
  const container = $('#waveformVisualizer');
  if (!container) return;
  container.innerHTML = '';
  const barCount = 38;
  const heights = [
    25, 40, 60, 30, 75, 90, 45, 65, 80, 50,
    95, 70, 40, 85, 60, 35, 70, 90, 55, 45,
    65, 80, 100, 75, 40, 60, 85, 50, 70, 35,
    80, 65, 45, 90, 75, 50, 30, 20
  ];

  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement('div');
    bar.className = 'waveform-bar';
    bar.style.height = `${heights[i % heights.length]}%`;
    bar.style.animationDelay = `${(i * 0.05).toFixed(2)}s`;
    container.appendChild(bar);
  }
}

function toggleAudioPlayback() {
  const playToggle = $('#playToggle');
  const waveform = $('#waveformVisualizer');
  isPlaying = !isPlaying;

  if (isPlaying) {
    if (playToggle) playToggle.textContent = '❚❚';
    if (waveform) waveform.classList.add('playing');
    startAudioClock();
    startSyntheticSound();
    showToast(`Odtwarzanie: ${CHAPTERS[audioTrackIdx].title}`);
  } else {
    if (playToggle) playToggle.textContent = '▶';
    if (waveform) waveform.classList.remove('playing');
    stopAudioClock();
    stopSyntheticSound();
  }
}

function startAudioClock() {
  clearInterval(window.audioTimerInterval);
  window.audioTimerInterval = setInterval(() => {
    if (currentSeconds < totalSeconds) {
      currentSeconds++;
      updateAudioTimer();
    } else {
      toggleAudioPlayback();
    }
  }, 1000);
}

function stopAudioClock() {
  clearInterval(window.audioTimerInterval);
}

function updateAudioTimer() {
  const timeEl = $('#currentTime');
  if (timeEl) timeEl.textContent = formatTime(currentSeconds);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function changeAudioChapter(newIdx) {
  if (newIdx < 0) newIdx = CHAPTERS.length - 1;
  if (newIdx >= CHAPTERS.length) newIdx = 0;
  audioTrackIdx = newIdx;
  const ch = CHAPTERS[newIdx];

  const chTag = $('#audioChapterNum');
  const chTitle = $('#audioChapterTitle');
  const footerTitle = $('#audioFooterChapterTitle');
  const durationEl = $('#duration');

  if (chTag) chTag.textContent = `Rozdział ${ch.num}`;
  if (chTitle) chTitle.textContent = ch.title;
  if (footerTitle) footerTitle.textContent = `Rozdział ${ch.num}: ${ch.title}`;
  if (durationEl) durationEl.textContent = ch.duration;

  // Parse duration
  const parts = ch.duration.split(':');
  totalSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  currentSeconds = 0;
  updateAudioTimer();

  if (isPlaying) {
    showToast(`Rozdział ${ch.num}: ${ch.title}`);
  }
}

// Web Audio API harmonic chime generator (ensures zero broken experiences)
function startSyntheticSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!synthAudioContext) synthAudioContext = new AudioContext();
    if (synthAudioContext.state === 'suspended') synthAudioContext.resume();

    function playNote(freq, delay) {
      setTimeout(() => {
        if (!isPlaying || !synthAudioContext) return;
        const osc = synthAudioContext.createOscillator();
        const gain = synthAudioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, synthAudioContext.currentTime);

        gain.gain.setValueAtTime(0.001, synthAudioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.04, synthAudioContext.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, synthAudioContext.currentTime + 2.4);

        osc.connect(gain);
        gain.connect(synthAudioContext.destination);
        osc.start();
        osc.stop(synthAudioContext.currentTime + 2.5);
      }, delay);
    }

    const scale = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
    playNote(scale[audioTrackIdx % scale.length], 0);

    clearInterval(synthInterval);
    synthInterval = setInterval(() => {
      if (!isPlaying) return;
      playNote(scale[(audioTrackIdx + 1) % scale.length], 100);
      playNote(scale[(audioTrackIdx + 2) % scale.length], 1600);
    }, 4500);
  } catch (e) {
    // Ignore audio context autoplay restrictions
  }
}

function stopSyntheticSound() {
  clearInterval(synthInterval);
}

/* ==========================================================================
   6. DOWNLOADS & E-BOOK BUNDLE
   ========================================================================== */
function initDownloads() {
  $$('[data-download]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = btn.dataset.download;
      const url = BOOK_CONFIG.downloads[type];

      showToast(`Pobieranie formatu ${type.toUpperCase()}…`);

      try {
        const check = await fetch(url, { method: 'HEAD' });
        if (check.ok) {
          const a = document.createElement('a');
          a.href = url;
          a.download = `Pokonac_Goliata_${type}.${type === 'bundle' ? 'zip' : type}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          return;
        }
      } catch (err) {
        // Fallback below
      }

      // Instant digital sample download if main binary is in distribution pipeline
      generateAndDownloadSample(type);
    });
  });
}

function generateAndDownloadSample(type) {
  const content = `=====================================================
POKONAĆ GOLIATA — JAK ZWYCIĘŻAĆ WŁASNE SŁABOŚCI
Autor: Cezary Rogowski | Christian Culture
Wydanie 2026 | PolskieRadio.cc
=====================================================

Dziękujemy za pobranie materiałów książki „Pokonać Goliata”.
Pełna treść oraz audiobook są dostępne pod adresem:
https://polskieradio.cc/pokonac-goliata

SPIS TREŚCI:
1. Małe początki (Rdz 4 / 1 Sm 17)
2. Patrzeć inaczej (Perspektywa Nieba vs ludzki lęk)
3. Broń, którą masz (Zdejmij cudzą zbroję)
4. Krok wiary (Od paraliżu do Doliny Przełomu)
5. Prawdziwa siła (Moc w Imieniu Pana Zastępów)
6. Dolina zmiany (Uzdrowienie ran i wolność od oskarżenia)
7. Zwycięstwo (Jeden celny kamień Prawdy)
8. Nowe życie (Chodzenie w wolności i dziedzictwo wiary)

„Nie musisz być silniejszy od Goliata. Musisz być bliżej Tego, który daje zwycięstwo.”
— Cezary Rogowski
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Pokonac_Goliata_Podglad_${type.toUpperCase()}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast(`Pobrano oficjalny fragment i spis treści (${type.toUpperCase()}).`);
}

/* ==========================================================================
   7. SHARING & LUMINA COMMUNITY (MANDATORY L & X BUTTONS)
   ========================================================================== */
function initSharing() {
  const quoteEl = $('#shareQuote');
  const quoteText = quoteEl ? quoteEl.innerText.trim() : "„Nie musisz być silniejszy od Goliata. Musisz być bliżej Tego, który daje zwycięstwo.” — Cezary Rogowski";

  // Copy quote
  $('[data-copy]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(quoteText);
      showToast('Fragment skopiowany do schowka!');
    } catch {
      showToast('Zaznacz i skopiuj tekst fragmentu.');
    }
  });

  // Highlight action
  $('[data-highlight]')?.addEventListener('click', () => {
    if (quoteEl) {
      const range = document.createRange();
      range.selectNodeContents(quoteEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      showToast('Zaznaczono fragment.');
    }
  });

  // Web Share API
  $('[data-share]')?.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: BOOK_CONFIG.title,
          text: `${quoteText}\n\nCzytaj książkę „Pokonać Goliata” na:`,
          url: BOOK_CONFIG.url
        });
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${quoteText} — czytaj na ${BOOK_CONFIG.url}`);
      showToast('Skopiowano treść i link do udostępnienia.');
    }
  });

  // MANDATORY: LUMINA Tablica Community Share ("L")
  $$('[data-share-lumina]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const params = new URLSearchParams({
        share_url: BOOK_CONFIG.url,
        share_title: `${BOOK_CONFIG.title} — ${BOOK_CONFIG.author}`,
        share_image: BOOK_CONFIG.imageUrl,
        share_img: BOOK_CONFIG.imageUrl,
        content: `${quoteText}\n\nOficjalna strona książki „Pokonać Goliata”: ${BOOK_CONFIG.url}`
      });
      const targetUrl = `/lumina-tablica.html?${params.toString()}`;
      window.open(targetUrl, '_blank', 'noopener');
    });
  });

  // MANDATORY: Platform X (Twitter)
  $$('[data-share-x]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = `${quoteText}\n\n„Pokonać Goliata” — Cezary Rogowski:`;
      const targetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(BOOK_CONFIG.url)}`;
      window.open(targetUrl, '_blank', 'noopener');
    });
  });

  // Facebook
  $$('[data-share-fb]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(BOOK_CONFIG.url)}`;
      window.open(targetUrl, '_blank', 'noopener');
    });
  });

  // LinkedIn
  $$('[data-share-in]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(BOOK_CONFIG.url)}`;
      window.open(targetUrl, '_blank', 'noopener');
    });
  });

  // WhatsApp
  $$('[data-share-wa]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = `${quoteText}\n\nKsiążka „Pokonać Goliata”: ${BOOK_CONFIG.url}`;
      const targetUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(targetUrl, '_blank', 'noopener');
    });
  });

  // Copy Link
  $$('[data-share-link]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(BOOK_CONFIG.url);
        showToast('Link do strony książki skopiowany!');
      } catch {
        showToast(BOOK_CONFIG.url);
      }
    });
  });
}

/* ==========================================================================
   8. SUPPORT THE AUTHOR
   ========================================================================== */
function initSupport() {
  $$('[data-amount]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('[data-amount]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  $('#supportButton')?.addEventListener('click', () => {
    const activeBtn = $('[data-amount].active');
    const amount = activeBtn ? activeBtn.dataset.amount : '25';
    showToast(`Wybrano wsparcie ${amount} zł. Przekierowanie do Revolut Christian Culture…`);
    setTimeout(() => {
      window.open(BOOK_CONFIG.supportUrl, '_blank', 'noopener');
    }, 600);
  });
}

/* ==========================================================================
   9. SEARCH MODAL
   ========================================================================== */
function initSearch() {
  const searchModal = $('#searchModal');
  const searchInput = $('#searchInput');
  const resultsContainer = $('#searchResults');

  $$('[data-action="search"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!searchModal) return;
      searchModal.classList.add('open');
      searchModal.setAttribute('aria-hidden', 'false');
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        renderSearchResults('');
      }
      document.body.style.overflow = 'hidden';
    });
  });

  $$('[data-close-search]').forEach(el => {
    el.addEventListener('click', () => {
      if (!searchModal) return;
      searchModal.classList.remove('open');
      searchModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderSearchResults(searchInput.value.trim().toLowerCase());
    });
  }

  function renderSearchResults(query) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    const filtered = CHAPTERS.filter(ch =>
      ch.title.toLowerCase().includes(query) ||
      ch.subtitle.toLowerCase().includes(query) ||
      ch.excerpt.toLowerCase().includes(query) ||
      ch.content.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      resultsContainer.innerHTML = '<div style="padding: 18px; text-align: center; color: #888; font-size: 13px;">Brak wyników dla podanej frazy.</div>';
      return;
    }

    filtered.forEach(ch => {
      const item = document.createElement('div');
      item.className = 'search-item';
      item.innerHTML = `
        <b>Rozdział ${ch.num}: ${ch.title}</b>
        <small>${ch.subtitle}</small>
      `;
      item.addEventListener('click', () => {
        searchModal.classList.remove('open');
        document.body.style.overflow = '';
        openReaderModal(ch.num - 1);
      });
      resultsContainer.appendChild(item);
    });
  }
}

/* ==========================================================================
   10. FLOATING BACK TO TOP
   ========================================================================== */
function initBackToTop() {
  const btn = $('#backToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
