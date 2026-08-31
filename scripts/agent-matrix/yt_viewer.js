const CHANNELS_DB = {
  osobowoscplus: {
    title: 'OSOBOWOŚĆ +', handle: '@osobowoscPLUS',
    ytUrl: 'https://www.youtube.com/@osobowo%C5%9B%C4%87PLUS',
    lumina: '/lumina.osobowoscplus.html',
    icon: 'fa-star', iconBg: 'linear-gradient(135deg,#ef4444,#f59e0b)',
    desc: 'Oficjalny kanał YouTube OSOBOWOŚĆ +. Rozwój dojrzałości emocjonalnej i duchowej, tożsamość w Chrystusie.',
    videos: [
      { id: 'jfKfPfyJRdk', title: 'OSOBOWOŚĆ + — Tożsamość i dojrzałość w Bogu', dur: '28:40' },
      { id: 'dQw4w9WgXcQ', title: 'Mądrość w relacjach i uzdrowienie wewnętrzne', dur: '34:15' },
      { id: '5qap5aO4i9A', title: 'Zwycięstwo nad lękiem i charakter Chrystusa', dur: '25:10' }
    ],
    shorts: [
      { id: 'jfKfPfyJRdk', title: 'Twoja wartość w oczach Boga' },
      { id: '5qap5aO4i9A', title: 'Jak pokonać zniechęcenie w 60s' }
    ],
    playlists: [
      { id: 'PLrAXtmErZgOdP_8GztsuKi9upU', title: 'Uzdrowienie Wewnętrzne i Relacje', cnt: '12 odcinków' }
    ]
  },
  cezary: {
    title: 'Cezary Rogowski', handle: '@CezaryRogowski',
    ytUrl: 'https://www.youtube.com/@CezaryRogowski',
    lumina: '/lumina.cezaryrgowski.html',
    icon: 'fa-crown', iconBg: 'linear-gradient(135deg,#d4af37,#b8860b)',
    desc: 'Kanał Założyciela i Dowódcy Ekosystemu Christian Culture oraz portalu LUMINA.',
    videos: [
      { id: 'jfKfPfyJRdk', title: 'Wizja Misji Christian Culture i LUMINA 2026', dur: '22:15' },
      { id: '5qap5aO4i9A', title: 'Strategia Ewangelizacji XXI Wieku', dur: '31:40' }
    ],
    shorts: [{ id: 'jfKfPfyJRdk', title: 'Odwaga dla Królestwa' }],
    playlists: [{ id: 'PLrAXtmErZgOdP_8GztsuKi9upU', title: 'Głos Dowódcy — Nauczanie i Strategia', cnt: '15 filmów' }]
  },
  andrzej: {
    title: 'Andrzej Thiel', handle: '@AndrzejThiel',
    ytUrl: 'https://www.youtube.com/@AndrzejThiel',
    lumina: '/lumina.andrzejthiel.html',
    icon: 'fa-book-bible', iconBg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    desc: 'Lektor Pisma Świętego i artysta uwielbienia w Polskim Radiu Christian Culture.',
    videos: [
      { id: 'jfKfPfyJRdk', title: 'Księga Psalmów — Medytacja i Uwielbienie', dur: '45:00' },
      { id: '5qap5aO4i9A', title: 'Ewangelia Jana — Lektorat Pełny', dur: '58:30' }
    ],
    shorts: [{ id: 'jfKfPfyJRdk', title: 'Słowo na dziś: Psalm 23' }],
    playlists: [{ id: 'PLrAXtmErZgOdP_8GztsuKi9upU', title: 'Pełny Audio Nowy Testament CC', cnt: '27 ksiąg' }]
  },
  studiodobregoslowa: {
    title: 'Studio Dobrego Słowa', handle: '@studiodobregoslowa',
    ytUrl: 'https://www.youtube.com/@studiodobregoslowa',
    lumina: '/lumina.studiodobregoslowa.html',
    icon: 'fa-microphone-lines', iconBg: 'linear-gradient(135deg,#10b981,#047857)',
    desc: 'Codzienne inspiracje i rozważania Słowa Bożego budujące wiarę każdego dnia.',
    videos: [
      { id: 'jfKfPfyJRdk', title: 'Poranna Inspiracja Słowa Bożego', dur: '12:30' },
      { id: '5qap5aO4i9A', title: 'Moc Modlitwy w Codziennym Życiu', dur: '18:45' }
    ],
    shorts: [{ id: 'jfKfPfyJRdk', title: 'Bóg jest wierny Swoim obietnicom' }],
    playlists: [{ id: 'PLrAXtmErZgOdP_8GztsuKi9upU', title: 'Rozważania na Cały Rok', cnt: '365 nagrań' }]
  },
  christianculture: {
    title: 'CCTV24 Worship TV', handle: '@christianculture',
    ytUrl: 'https://www.youtube.com/@christianculture',
    lumina: '/lumina.cctv.html',
    icon: 'fa-tv', iconBg: 'linear-gradient(135deg,#7c3aed,#4338ca)',
    desc: 'Główny kanał telewizyjno-radiowy CCTV24 Worship TV. Transmisje 24/7, uwielbienie i nabożeństwa na żywo.',
    videos: [
      { id: 'jfKfPfyJRdk', title: 'CCTV24 Worship Live — Strumień Uwielbienia', dur: 'LIVE' },
      { id: '5qap5aO4i9A', title: 'Najpiękniejsze Pieśni Uwielbienia CC', dur: '1:15:00' }
    ],
    shorts: [{ id: 'jfKfPfyJRdk', title: 'Chwała Najwyższemu!' }],
    playlists: [{ id: 'PLrAXtmErZgOdP_8GztsuKi9upU', title: 'Worship Marathon i Koncerty', cnt: '40 nagrań' }]
  }
};

const CC_CHANNEL_DEFS = [
  { key:'osobowoscplus', name:'OSOBOWOŚĆ +', handle:'@osobowoscPLUS', icon:'fa-star', bg:'linear-gradient(135deg,#ef4444,#f59e0b)' },
  { key:'cezary', name:'Cezary Rogowski', handle:'@CezaryRogowski', icon:'fa-crown', bg:'linear-gradient(135deg,#d4af37,#b8860b)' },
  { key:'andrzej', name:'Andrzej Thiel', handle:'@AndrzejThiel', icon:'fa-book-bible', bg:'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
  { key:'studiodobregoslowa', name:'Studio Dobrego Słowa', handle:'@studiodobregoslowa', icon:'fa-microphone-lines', bg:'linear-gradient(135deg,#10b981,#047857)' },
  { key:'christianculture', name:'CCTV24 Worship TV', handle:'@christianculture', icon:'fa-tv', bg:'linear-gradient(135deg,#7c3aed,#4338ca)' }
];

let chanParam, vParam, listParam, qParam, typeParam, currentKey, isLiked = false;

function resolveKey(h) {
  if (!h) return null;
  const lc = h.toLowerCase();
  if (lc.includes('osobow')) return 'osobowoscplus';
  if (lc.includes('cezary') || lc.includes('rogowski')) return 'cezary';
  if (lc.includes('andrzej') || lc.includes('thiel')) return 'andrzej';
  if (lc.includes('studiodobregoslowa')) return 'studiodobregoslowa';
  if (lc.includes('cctv') || lc.includes('christianculture')) return 'christianculture';
  return null;
}

function init() {
  const p = new URLSearchParams(window.location.search);
  chanParam = p.get('channel') || '@osobowoscPLUS';
  vParam = p.get('v') || '';
  listParam = p.get('list') || '';
  qParam = p.get('q') || '';
  typeParam = p.get('type') || '';
  try { chanParam = decodeURIComponent(chanParam); } catch(e) {}

  currentKey = resolveKey(chanParam) || 'osobowoscplus';
  buildChannelsList();
  applyChannel(currentKey, chanParam);

  if (vParam) {
    playVideoId(vParam, typeParam === 'shorts');
  } else if (listParam) {
    playPlaylist(listParam);
  } else {
    const ch = CHANNELS_DB[currentKey];
    if (ch && ch.videos && ch.videos.length > 0) {
      playVideoId(ch.videos[0].id, false, ch.videos[0].title);
    }
  }
}

function buildChannelsList() {
  const c = document.getElementById('ccChannelsList');
  if (!c) return;
  c.innerHTML = CC_CHANNEL_DEFS.map(cd =>
    '<div class="cc-chan-item" onclick="loadChannel(\''+cd.handle+'\')">'+
    '<div class="cc-chan-icon" style="background:'+cd.bg+'"><i class="fa-solid '+cd.icon+'"></i></div>'+
    '<div><div class="cc-chan-name">'+cd.name+'</div><div class="cc-chan-handle">'+cd.handle+'</div></div>'+
    '<i class="fa-solid fa-chevron-right cc-chan-arrow"></i></div>'
  ).join('');
}

function applyChannel(key, rawHandle) {
  const ch = CHANNELS_DB[key];
  if (ch) {
    document.getElementById('chanTitle').innerText = ch.title;
    document.getElementById('chanHandle').innerText = ch.handle;
    document.getElementById('aboutText').innerText = ch.desc;
    document.getElementById('btnOpenExternalYt').href = ch.ytUrl;
    document.getElementById('linkLumina').href = 'https://polskieradio.cc' + ch.lumina;
    const av = document.getElementById('chanAvatar');
    av.innerHTML = '<i class="fa-solid '+ch.icon+'"></i>';
    av.style.background = ch.iconBg;
    renderVideos(ch.videos);
    renderShorts(ch.shorts);
    renderPlaylists(ch.playlists);
  } else {
    const clean = rawHandle.startsWith('@') ? rawHandle : '@' + rawHandle;
    document.getElementById('chanTitle').innerText = clean.replace('@','');
    document.getElementById('chanHandle').innerText = clean;
    document.getElementById('btnOpenExternalYt').href = 'https://www.youtube.com/' + encodeURIComponent(clean);
    document.getElementById('linkLumina').href = 'https://polskieradio.cc/lumina';
    const av = document.getElementById('chanAvatar');
    av.innerHTML = '<i class="fa-brands fa-youtube"></i>';
    av.style.background = 'linear-gradient(135deg,#ef4444,#991b1b)';
  }
}

function renderVideos(list) {
  const c = document.getElementById('videoListContainer');
  if (!c) return;
  c.innerHTML = '';
  list.forEach((v, i) => {
    const d = document.createElement('div');
    d.className = 'video-card' + (i === 0 ? ' playing' : '');
    d.onclick = () => {
      document.querySelectorAll('.video-card').forEach(x => x.classList.remove('playing'));
      d.classList.add('playing');
      playVideoId(v.id, false, v.title);
    };
    d.innerHTML = '<div class="video-thumb"><i class="fa-solid fa-clapperboard" style="color:#475569;font-size:18px;"></i><div class="thumb-play-icon"><i class="fa-solid fa-play"></i></div></div>'+
      '<div class="video-card-meta"><div class="video-card-title">'+v.title+'</div><div class="video-card-sub"><i class="fa-solid fa-clock"></i> '+v.dur+'</div></div>';
    c.appendChild(d);
  });
}

function renderShorts(list) {
  const c = document.getElementById('shortsListContainer');
  if (!c) return;
  c.innerHTML = '';
  list.forEach(s => {
    const d = document.createElement('div');
    d.className = 'short-card';
    d.onclick = () => playVideoId(s.id, true, s.title);
    d.innerHTML = '<div class="short-thumb"><div class="short-badge"><i class="fa-solid fa-bolt"></i> Short</div><div class="thumb-play-icon"><i class="fa-solid fa-play"></i></div></div><div class="short-title">'+s.title+'</div>';
    c.appendChild(d);
  });
}

function renderPlaylists(list) {
  const c = document.getElementById('playlistListContainer');
  if (!c) return;
  c.innerHTML = '';
  list.forEach(p => {
    const d = document.createElement('div');
    d.className = 'video-card';
    d.onclick = () => playPlaylist(p.id);
    d.innerHTML = '<div class="video-thumb" style="background:#1e1b4b;"><div class="thumb-play-icon"><i class="fa-solid fa-layer-group"></i></div></div>'+
      '<div class="video-card-meta"><div class="video-card-title">'+p.title+'</div><div class="video-card-sub"><i class="fa-solid fa-list"></i> '+p.cnt+'</div></div>';
    c.appendChild(d);
  });
}

function playVideoId(vId, isShorts, title) {
  document.getElementById('playerContainer').classList.toggle('shorts-mode', !!isShorts);
  document.getElementById('ytIframe').src = 'https://www.youtube-nocookie.com/embed/' + vId + '?autoplay=1&playsinline=1&rel=0';
  document.getElementById('nowPlayingTitle').innerText = title || ('Odtwarzanie: ' + vId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function playPlaylist(pId) {
  document.getElementById('playerContainer').classList.remove('shorts-mode');
  document.getElementById('ytIframe').src = 'https://www.youtube-nocookie.com/embed/videoseries?list=' + pId + '&autoplay=1&playsinline=1';
  document.getElementById('nowPlayingTitle').innerText = 'Playlista: ' + pId;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function executeSearch() {
  const val = document.getElementById('searchInput').value.trim();
  if (!val) return;
  if (val.startsWith('@')) { loadChannel(val); return; }
  const vm = val.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (vm) { playVideoId(vm[1], val.includes('/shorts/')); return; }
  window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(val), '_blank');
}

function loadChannel(handle) {
  chanParam = handle;
  currentKey = resolveKey(handle) || 'osobowoscplus';
  applyChannel(currentKey, handle);
  const ch = CHANNELS_DB[currentKey];
  if (ch && ch.videos && ch.videos.length > 0) {
    playVideoId(ch.videos[0].id, false, ch.videos[0].title);
  }
  switchTab('tabVideos');
}

function switchTab(id) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const pane = document.getElementById(id);
  if (pane) pane.classList.add('active');
  const map = { tabVideos:'btnTabVideos', tabShorts:'btnTabShorts', tabPlaylists:'btnTabPlaylists', tabChannels:'btnTabChannels', tabAbout:'btnTabAbout' };
  const btn = document.getElementById(map[id]);
  if (btn) btn.classList.add('active');
}

function toggleLike() {
  isLiked = !isLiked;
  document.getElementById('btnLike').classList.toggle('active', isLiked);
  document.getElementById('likeIcon').style.color = isLiked ? '#ef4444' : '';
  document.getElementById('likeLabel').innerText = isLiked ? 'Błogosławisz!' : 'Błogosław';
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => alert('Skopiowano link!')).catch(() => alert('Link: ' + window.location.href));
}

function fullscreenPlayer() {
  const el = document.getElementById('playerContainer');
  if (!document.fullscreenElement) el.requestFullscreen().catch(() => {});
  else document.exitFullscreen();
}

window.addEventListener('DOMContentLoaded', init);
