const CHANNELS_DB = {
  osobowoscplus: {
    title: 'OSOBOWOSC +', handle: '@osobowoscPLUS',
    ytUrl: 'https://www.youtube.com/@osobowo%C5%9B%C4%87PLUS',
    lumina: '/lumina.osobowoscplus.html',
    icon: 'fa-star', iconBg: 'linear-gradient(135deg,#ef4444,#f59e0b)',
    desc: 'Oficjalny kanal YouTube OSOBOWOSC +. Rozwoj dojrzalosci emocjonalnej i duchowej, tozsamosc w Chrystusie.',
    q: 'OSOBOWOSC Christian Culture',
    videos: [
      { title: 'Tozsamosc i dojrzalosc w Bogu - Wyklad', dur: '28:40', q: 'Osobowosc PLUS tozsamosc Bogu' },
      { title: 'Madrosc w relacjach i uzdrowienie', dur: '34:15', q: 'Osobowosc PLUS madrosc relacje' },
      { title: 'Zwyciestwo nad lekiem i charakter', dur: '25:10', q: 'Osobowosc PLUS zwyciestwo lek' }
    ],
    shorts: [
      { title: 'Twoja wartosc w oczach Boga', q: 'Osobowosc PLUS wartosc short' },
      { title: 'Jak pokonac zniechecenie w 60s', q: 'Osobowosc PLUS zniechecenie short' }
    ],
    playlists: [
      { title: 'Uzdrowienie Wewnetrzne i Relacje', cnt: '12 odcinkow', q: 'Osobowosc PLUS uzdrowienie' },
      { title: 'Meskosc i Kobiecosc w Bozym Planie', cnt: '8 odcinkow', q: 'Osobowosc PLUS meskosc' }
    ]
  },
  cezary: {
    title: 'Cezary Rogowski', handle: '@CezaryRogowski',
    ytUrl: 'https://www.youtube.com/@CezaryRogowski',
    lumina: '/lumina.cezaryrgowski.html',
    icon: 'fa-crown', iconBg: 'linear-gradient(135deg,#d4af37,#b8860b)',
    desc: 'Kanal Zalozyciela i Dowodcy Ekosystemu Christian Culture oraz portalu LUMINA.',
    q: 'Cezary Rogowski Christian Culture',
    videos: [
      { title: 'Wizja Misji Christian Culture i LUMINA', dur: '22:15', q: 'Cezary Rogowski wizja LUMINA' },
      { title: 'Strategia Ewangelizacji XXI Wieku', dur: '31:40', q: 'Cezary Rogowski ewangelizacja' }
    ],
    shorts: [{ title: 'Odwaga dla Krolestwa', q: 'Cezary Rogowski wiara short' }],
    playlists: [{ title: 'Glos Dowodcy - Nauczanie i Strategia', cnt: '15 filmow', q: 'Cezary Rogowski nauczanie' }]
  },
  andrzej: {
    title: 'Andrzej Thiel', handle: '@AndrzejThiel',
    ytUrl: 'https://www.youtube.com/@AndrzejThiel',
    lumina: '/lumina.andrzejthiel.html',
    icon: 'fa-book-bible', iconBg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    desc: 'Lektor Pisma Swietego i artysta uwielbienia w Polskim Radiu Christian Culture.',
    q: 'Andrzej Thiel Biblia Christian Culture',
    videos: [
      { title: 'Ksiega Psalmow - Medytacja i Uwielbienie', dur: '45:00', q: 'Andrzej Thiel Psalmy' },
      { title: 'Ewangelia Jana - Lektorat Pelny', dur: '58:30', q: 'Andrzej Thiel Ewangelia Jana' }
    ],
    shorts: [{ title: 'Slowo na dzis: Psalm 23', q: 'Andrzej Thiel Psalm 23 short' }],
    playlists: [{ title: 'Pelny Audio Nowy Testament CC', cnt: '27 ksiag', q: 'Andrzej Thiel Nowy Testament' }]
  },
  studiodobregoslowa: {
    title: 'Studio Dobrego Slowa', handle: '@studiodobregoslowa',
    ytUrl: 'https://www.youtube.com/@studiodobregoslowa',
    lumina: '/lumina.studiodobregoslowa.html',
    icon: 'fa-microphone-lines', iconBg: 'linear-gradient(135deg,#10b981,#047857)',
    desc: 'Codzienne inspiracje i rozwazania Slowa Bozego budujace wiare kazdego dnia.',
    q: 'Studio Dobrego Slowa rozwazania',
    videos: [
      { title: 'Poranna Inspiracja Slowa Bozego', dur: '12:30', q: 'Studio Dobrego Slowa poranek' },
      { title: 'Moc Modlitwy w Codziennym Zyciu', dur: '18:45', q: 'Studio Dobrego Slowa modlitwa' }
    ],
    shorts: [{ title: 'Bog jest wierny Twoim obietnicom', q: 'Studio Dobrego Slowa short' }],
    playlists: [{ title: 'Rozwazania na Caly Rok', cnt: '365 nagran', q: 'Studio Dobrego Slowa rozwazania' }]
  },
  christianculture: {
    title: 'CCTV24 Worship TV', handle: '@christianculture',
    ytUrl: 'https://www.youtube.com/@christianculture',
    lumina: '/lumina.cctv.html',
    icon: 'fa-tv', iconBg: 'linear-gradient(135deg,#7c3aed,#4338ca)',
    desc: 'Glowny kanal telewizyjno-radiowy CCTV24 Worship TV. Transmisje 24/7, uwielbienie i nabozenstawa na zywo.',
    q: 'Christian Culture Worship CCTV24',
    videos: [
      { title: 'CCTV24 Worship Live - 24/7 Strumien Uwielbienia', dur: 'LIVE', q: 'Christian Culture CCTV24 worship live' },
      { title: 'Najpiekniejsze Piesni Uwielbienia CC', dur: '1:15:00', q: 'Christian Culture piesni uwielbienia' }
    ],
    shorts: [{ title: 'Chwala Najwyzszemu!', q: 'Christian Culture worship short' }],
    playlists: [{ title: 'Worship Marathon i Koncerty', cnt: '40 nagran', q: 'Christian Culture worship marathon' }]
  }
};

const CC_CHANNEL_DEFS = [
  { key:'osobowoscplus', name:'OSOBOWOSC +', handle:'@osobowoscPLUS', icon:'fa-star', bg:'linear-gradient(135deg,#ef4444,#f59e0b)' },
  { key:'cezary', name:'Cezary Rogowski', handle:'@CezaryRogowski', icon:'fa-crown', bg:'linear-gradient(135deg,#d4af37,#b8860b)' },
  { key:'andrzej', name:'Andrzej Thiel', handle:'@AndrzejThiel', icon:'fa-book-bible', bg:'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
  { key:'studiodobregoslowa', name:'Studio Dobrego Slowa', handle:'@studiodobregoslowa', icon:'fa-microphone-lines', bg:'linear-gradient(135deg,#10b981,#047857)' },
  { key:'christianculture', name:'CCTV24 Worship TV', handle:'@christianculture', icon:'fa-tv', bg:'linear-gradient(135deg,#7c3aed,#4338ca)' }
];

let chanParam, vParam, listParam, qParam, typeParam, currentKey, isLiked = false;

function resolveKey(h) {
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

  currentKey = resolveKey(chanParam) || 'custom';
  buildChannelsList();
  applyChannel(currentKey, chanParam);

  if (vParam) playVideoId(vParam, typeParam === 'shorts');
  else if (listParam) playPlaylist(listParam);
  else if (qParam) searchAndPlay(qParam, 'Wyniki: ' + qParam);
  else { const ch = CHANNELS_DB[currentKey]; searchAndPlay(ch ? ch.q : chanParam, null); }
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
    const c = document.getElementById('videoListContainer');
    c.innerHTML = '<div class="video-card playing" onclick="searchAndPlay(\''+clean+'\')">'+
      '<div class="video-thumb"><div class="thumb-play-icon"><i class="fa-solid fa-play"></i></div></div>'+
      '<div class="video-card-meta"><div class="video-card-title">Transmisja i najnowsze wideo kanalu '+clean+'</div>'+
      '<div class="video-card-sub"><i class="fa-solid fa-tower-broadcast"></i> Strumien Live</div></div></div>';
    document.getElementById('shortsListContainer').innerHTML = '';
    document.getElementById('playlistListContainer').innerHTML = '';
  }
}

function renderVideos(list) {
  const c = document.getElementById('videoListContainer'); c.innerHTML = '';
  list.forEach((v,i) => {
    const d = document.createElement('div'); d.className='video-card'+(i===0?' playing':'');
    d.onclick = ()=>{ document.querySelectorAll('.video-card').forEach(x=>x.classList.remove('playing')); d.classList.add('playing'); searchAndPlay(v.q, v.title); };
    d.innerHTML = '<div class="video-thumb"><i class="fa-solid fa-clapperboard" style="color:#475569;font-size:18px;"></i><div class="thumb-play-icon"><i class="fa-solid fa-play"></i></div></div>'+
      '<div class="video-card-meta"><div class="video-card-title">'+v.title+'</div><div class="video-card-sub"><i class="fa-solid fa-clock"></i> '+v.dur+'</div></div>';
    c.appendChild(d);
  });
}

function renderShorts(list) {
  const c = document.getElementById('shortsListContainer'); c.innerHTML = '';
  list.forEach(s => {
    const d = document.createElement('div'); d.className='short-card';
    d.onclick = ()=>searchAndPlay(s.q, s.title, true);
    d.innerHTML='<div class="short-thumb"><div class="short-badge"><i class="fa-solid fa-bolt"></i> Short</div><div class="thumb-play-icon"><i class="fa-solid fa-play"></i></div></div><div class="short-title">'+s.title+'</div>';
    c.appendChild(d);
  });
}

function renderPlaylists(list) {
  const c = document.getElementById('playlistListContainer'); c.innerHTML = '';
  list.forEach(p => {
    const d = document.createElement('div'); d.className='video-card';
    d.onclick = ()=>searchAndPlay(p.q, p.title);
    d.innerHTML='<div class="video-thumb" style="background:#1e1b4b;"><div class="thumb-play-icon"><i class="fa-solid fa-layer-group"></i></div></div>'+
      '<div class="video-card-meta"><div class="video-card-title">'+p.title+'</div><div class="video-card-sub"><i class="fa-solid fa-list"></i> '+p.cnt+'</div></div>';
    c.appendChild(d);
  });
}

function playVideoId(vId, isShorts) {
  document.getElementById('playerContainer').classList.toggle('shorts-mode', !!isShorts);
  document.getElementById('ytIframe').src = 'https://www.youtube-nocookie.com/embed/'+vId+'?autoplay=1&playsinline=1&rel=0';
  document.getElementById('nowPlayingTitle').innerText = 'Odtwarzanie wideo: ' + vId;
}

function playPlaylist(pId) {
  document.getElementById('playerContainer').classList.remove('shorts-mode');
  document.getElementById('ytIframe').src = 'https://www.youtube-nocookie.com/embed?listType=playlist&list='+pId+'&autoplay=1&playsinline=1';
  document.getElementById('nowPlayingTitle').innerText = 'Playlista: ' + pId;
}

function searchAndPlay(query, displayTitle, isShorts) {
  document.getElementById('playerContainer').classList.toggle('shorts-mode', !!isShorts);
  document.getElementById('ytIframe').src = 'https://www.youtube-nocookie.com/embed?listType=search&list='+encodeURIComponent(query)+'&autoplay=1&playsinline=1';
  document.getElementById('nowPlayingTitle').innerText = displayTitle || ('Szukaj: ' + query);
  window.scrollTo({top:0, behavior:'smooth'});
}

function executeSearch() {
  const val = document.getElementById('searchInput').value.trim();
  if (!val) return;
  if (val.startsWith('@')) { loadChannel(val); return; }
  const vm = val.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (vm) { playVideoId(vm[1], val.includes('/shorts/')); return; }
  searchAndPlay(val, 'Wyniki: "' + val + '"');
}

function loadChannel(handle) {
  chanParam = handle;
  currentKey = resolveKey(handle) || 'custom';
  applyChannel(currentKey, handle);
  const ch = CHANNELS_DB[currentKey];
  searchAndPlay(ch ? ch.q : handle);
  switchTab('tabVideos');
}

function switchTab(id) {
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  const pane = document.getElementById(id); if(pane) pane.classList.add('active');
  const map = {tabVideos:'btnTabVideos',tabShorts:'btnTabShorts',tabPlaylists:'btnTabPlaylists',tabChannels:'btnTabChannels',tabAbout:'btnTabAbout'};
  const btn = document.getElementById(map[id]); if(btn) btn.classList.add('active');
}

function toggleLike() {
  isLiked = !isLiked;
  document.getElementById('btnLike').classList.toggle('active', isLiked);
  document.getElementById('likeIcon').style.color = isLiked ? '#ef4444' : '';
  document.getElementById('likeLabel').innerText = isLiked ? 'Blogoslawisz!' : 'Blogoslaw';
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(()=>alert('Skopiowano link!')).catch(()=>alert('Link: '+window.location.href));
}

function fullscreenPlayer() {
  const el = document.getElementById('playerContainer');
  if (!document.fullscreenElement) el.requestFullscreen().catch(()=>{});
  else document.exitFullscreen();
}

window.addEventListener('DOMContentLoaded', init);
