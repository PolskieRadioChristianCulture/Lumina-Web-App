// A shared radio controller. Same-origin chat frames use their host's player.
(function () {
  'use strict';
  if (window.CCChatRadio) return;
  try {
    if (window.parent !== window && window.parent.location.origin === location.origin && window.parent.CCChatRadio) {
      window.CCChatRadio = window.parent.CCChatRadio;
      return;
    }
  } catch (_) {}
  const stations = window.CCRadioStations || [];
  const playlists = new Map();
  const listeners = new Set();
  let audio, selected = stations[0], generation = 0;
  let state = { stationId: selected?.id, playing: false, status: 'Wybierz stację i naciśnij Słuchaj' };
  const notify = () => listeners.forEach(fn => fn({ ...state }));
  const home = () => window.CCHomeRadio;
  function update(next) { state = { ...state, ...next }; notify(); }
  function pauseLegacy() {
    window.LuminaMiniPlayer?.pause?.();
    window.LuminaRadio?.pause?.(true);
  }
  function getAudio() {
    if (audio) return audio;
    audio = document.createElement('audio');
    audio.id = 'ccChatRadioAudio';
    audio.preload = 'none';
    audio.setAttribute('data-cc-radio', 'true');
    document.body.appendChild(audio);
    audio.addEventListener('playing', () => update({ playing: true, status: 'Odtwarza' }));
    audio.addEventListener('pause', () => update({ playing: false, status: 'Wstrzymano' }));
    audio.addEventListener('error', () => update({ playing: false, status: 'Nie udało się odtworzyć. Spróbuj ponownie.' }));
    audio.addEventListener('ended', () => { if (state.playing) play(false); });
    return audio;
  }
  async function prepare(id) {
    const station = stations.find(s => s.id === id);
    if (!station) throw new Error('Unknown station');
    if (station.playlistUrl && !playlists.has(id)) {
      const response = await fetch(station.playlistUrl);
      if (!response.ok) throw new Error('Playlist unavailable');
      const tracks = await response.json();
      if (!Array.isArray(tracks) || !tracks.length || !tracks.every(t => typeof t.url === 'string' && /^(https:\/\/|\.\/audio\/|\/audio\/)/.test(t.url))) throw new Error('Invalid playlist');
      playlists.set(id, tracks);
    }
    return station;
  }
  function playlistTrack(station) {
    const tracks = playlists.get(station.id);
    if (!tracks?.length) return { url: station.streamUrl, offset: 0 };
    const duration = tracks.reduce((total, track) => total + (Number(track.duration) || 240), 0);
    let remaining = Math.floor(Date.now() / 1000) % duration;
    for (const track of tracks) {
      const seconds = Number(track.duration) || 240;
      if (remaining < seconds) return { url: track.url.startsWith('./') ? track.url.slice(1) : track.url, offset: remaining };
      remaining -= seconds;
    }
    return { url: tracks[0].url, offset: 0 };
  }
  function play(userClick = true) {
    if (!selected) return Promise.resolve();
    pauseLegacy();
    if (home()) {
      home().select(selected.id);
      return Promise.resolve();
    }
    const ticket = ++generation;
    const player = getAudio();
    const track = playlistTrack(selected);
    update({ stationId: selected.id, playing: false, status: 'Łączenie…' });
    player.src = track.url;
    player.onloadedmetadata = () => {
      if (ticket === generation && track.offset > 0 && Number.isFinite(player.duration)) {
        try { player.currentTime = Math.min(track.offset, Math.max(0, player.duration - 0.1)); } catch (_) {}
      }
    };
    return Promise.resolve(player.play()).catch(() => {
      if (ticket === generation) update({ playing: false, status: userClick ? 'Nie udało się odtworzyć. Naciśnij Słuchaj ponownie.' : 'Naciśnij Słuchaj, aby wznowić.' });
    });
  }
  function pause() {
    generation++;
    if (home()) home().pause();
    if (audio) audio.pause();
    update({ playing: false, status: 'Wstrzymano' });
  }
  window.CCChatRadio = {
    stations, prepare, play, pause,
    select(id) { selected = stations.find(s => s.id === id) || selected; update({ stationId: selected.id }); },
    state() { return home() ? home().state() : { ...state }; },
    subscribe(fn) { listeners.add(fn); fn(this.state()); return () => listeners.delete(fn); }
  };
  window.addEventListener('cc-home-radio-state', event => {
    selected = stations.find(s => s.id === event.detail.stationId) || selected;
    update(event.detail);
  });
})();
