/**
 * CHRISTIAN CULTURE - WEB APP ENGINE
 * Estetyka: Black & Gold Premium
 * Funkcje: Sterowanie 3 stacjami radiowymi, RWD, Canvas Visualizer, Modale
 */

import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// 1. STATIONS DATA CONFIGURATION
// Fallback stations if Firebase fetch fails
let STATIONS = {
    poland: {
        id: "poland",
        name: "RADIO PL",
        streamUrl: "https://stream.zeno.fm/vz96pvl3pnktv",
        accentColors: ["#FF2D55", "#00F0FF"], // Coral-Red to Cyan
        logo: "./Aplikacja Christian Culture.png",
        tracks: [
            "Volan - Cyber Toksyczna Warszawska Noc",
            "Polonez 2077 - Elektryczna Mgła",
            "Krakowski Neonowy Deszcz - Smog Wave",
            "Gdynia Cyberport - Sygnały z Głębin",
            "Śląski Akcelerator Neonów - Brudny Świat"
        ]
    },
    global: {
        id: "global",
        name: "RADIO GLOBAL",
        streamUrl: "https://stream.zeno.fm/umej2cuqncluv",
        accentColors: ["#4D9FFF", "#C026FF"], // Cyan-Blue to Magenta-Purple
        logo: "./Aplikacja CC Lite.jpg",
        tracks: [
            "Tachyon Pulse - Cosmic Overdrive",
            "Stardust Drifting - Andromeda Sector",
            "Quantum Dreamer - Neural Core Loading",
            "Vector Fields - Hyperion Rings",
            "Synthetic Mind - Cybernetic Core"
        ]
    },
    biblia_audio: {
        id: "biblia_audio",
        name: "RADIO BIBLIA",
        streamUrl: "https://stream.zeno.fm/imo45hqnshyuv",
        accentColors: ["#FFB300", "#9F4DFF"], // Gold to Deep Violet
        logo: "./Logo Biblia Audio CC.jpg", // specific logo
        tracks: [
            "Księga Rodzaju - Stworzenie Świata (Audio)",
            "Ewangelia wg św. Jana - Słowo Przedwieczne",
            "Księga Psalmów - Pieśń Zachwytu i Chwały",
            "List do Rzymian - Łaska i Wiara",
            "Apokalipsa św. Jana - Końcowe Zwycięstwo"
        ]
    },
    global_biblia: {
        id: "global_biblia",
        name: "GLOBAL BIBLIA",
        streamUrl: "https://stream.zeno.fm/gn3uhltrrytuv",
        accentColors: ["#D4AF37", "#FFDF7A"], // Gold Premium to Gold Glow
        logo: "./Logo Globalna Biblia Audio.jpg",
        tracks: [
            "Gospel of Matthew - Chapter 1",
            "Gospel of Mark - Chapter 1",
            "Gospel of Luke - Chapter 1",
            "Gospel of John - Chapter 1",
            "Revelation - Chapter 22"
        ]
    },
    instrumental_worship: {
        id: "instrumental_worship",
        name: "INSTRUMENTAL WORSHIP",
        streamUrl: "https://christian-culture-global.web.app/deep_forest_1.mp3",
        playlistUrl: "./worship_playlist.json",
        isDrivePlaylist: true,
        accentColors: ["#8E2DE2", "#4A00E0"],
        logo: "./worship_logo_bg.jpg",
        tracks: [
            "DEEP FOREST 1 - Instrumental Prayer",
            "DEEP FOREST 2 - Sanctuary Ambient",
            "DEEP FOREST 3 - Holy Spirit Presence",
            "DEEP FOREST 4 - Peace & Worship"
        ]
    },
    biblia_spiewana: {
        id: "biblia_spiewana",
        name: "BIBLIA ŚPIEWANA",
        streamUrl: "https://cdn.jsdelivr.net/gh/PolskieRadioChristianCulture/Strona-www-Christian-Culture@main/audio/biblia_spiewana/%C5%9Apiewane%20Przypowie%C5%9Bci%20Salomona%201.mp3",
        playlistUrl: "./biblia_spiewana_playlist.json",
        isDrivePlaylist: true,
        accentColors: ["#D4AF37", "#E6A817"],
        logo: "./Logo_Biblia_Spiewana.jpg",
        tracks: [
            "Śpiewane Przypowieści Salomona - Rozdział 1",
            "Śpiewane Przypowieści Salomona - Rozdział 2",
            "Śpiewane Przypowieści Salomona - Rozdział 3"
        ]
    }
};

// 2. STATE VARIABLES
let activeStation = STATIONS.poland;
let isPlaying = false;
let isMuted = false;
let previousVolume = 0.8;
let metadataEventSource = null;
let globalPlaylist = [];
let totalDuration = 0;
let globalBibleTimer = null;

let worshipPlaylist = [];
let totalWorshipDuration = 0;
let worshipTrackIndex = 0; // Aktualny indeks utworu w pętli

let bibliaSpiewanaPlaylist = [];
let totalBibliaSpiewanaDuration = 0;
let bibliaSpiewanaTrackIndex = 0;

async function loadWorshipPlaylist() {
    if (worshipPlaylist.length > 0) return;
    try {
        const res = await fetch('./worship_playlist.json');
        if (res.ok) {
            worshipPlaylist = await res.json();
            worshipPlaylist.forEach(tr => {
                if (!tr.duration) tr.duration = 240;
            });
            totalWorshipDuration = worshipPlaylist.reduce((acc, t) => acc + t.duration, 0);
            console.log(`🎶 Załadowano playlistę Instrumental Worship: ${worshipPlaylist.length} utworów`);
        }
    } catch(e) {
        console.error("❌ Błąd ładowania worship_playlist.json:", e);
    }
}

async function loadBibliaSpiewanaPlaylist() {
    if (bibliaSpiewanaPlaylist.length > 0) return;
    try {
        const res = await fetch('./biblia_spiewana_playlist.json');
        if (res.ok) {
            bibliaSpiewanaPlaylist = await res.json();
            bibliaSpiewanaPlaylist.forEach(tr => {
                if (!tr.duration) tr.duration = 240;
            });
            totalBibliaSpiewanaDuration = bibliaSpiewanaPlaylist.reduce((acc, t) => acc + t.duration, 0);
            console.log(`🎶 Załadowano playlistę Biblia Śpiewana: ${bibliaSpiewanaPlaylist.length} utworów`);
        }
    } catch(e) {
        console.error("❌ Błąd ładowania biblia_spiewana_playlist.json:", e);
    }
}

// DOM Elements
const audio = new Audio();
audio.volume = 0.8;

// Global Audio Ended Handler: Automatic loop for Worship Music, Biblia Śpiewana and Biblia Audio
audio.addEventListener('ended', () => {
    if (activeStation && activeStation.id === 'instrumental_worship') {
        playNextWorshipTrack();
    } else if (activeStation && activeStation.id === 'biblia_spiewana') {
        playNextBibliaSpiewanaTrack();
    } else if (activeStation && activeStation.id === 'global_biblia' && globalPlaylist.length > 0) {
        playRadio();
    }
});

function playNextBibliaSpiewanaTrack() {
    if (!bibliaSpiewanaPlaylist || bibliaSpiewanaPlaylist.length === 0) return;
    bibliaSpiewanaTrackIndex = (bibliaSpiewanaTrackIndex + 1) % bibliaSpiewanaPlaylist.length;
    const nextTrack = bibliaSpiewanaPlaylist[bibliaSpiewanaTrackIndex];
    audio.src = nextTrack.url;
    playerTrackTitle.textContent = `${nextTrack.title} — ${nextTrack.artist || 'Christian Culture'}`;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            updatePlayerUI(true);
            playerStatusText.textContent = "Odtwarza";
        }).catch(err => {
            console.error('Biblia Śpiewana next track error:', err);
            isPlaying = false;
            updatePlayerUI(false);
        });
    }
}

function playNextWorshipTrack() {
    if (!worshipPlaylist || worshipPlaylist.length === 0) return;
    
    let nextIndex = worshipTrackIndex;
    if (worshipPlaylist.length > 1) {
        while (nextIndex === worshipTrackIndex) {
            nextIndex = Math.floor(Math.random() * worshipPlaylist.length);
        }
    } else {
        nextIndex = 0;
    }
    worshipTrackIndex = nextIndex;
    const nextTrack = worshipPlaylist[worshipTrackIndex];
    audio.src = nextTrack.url;
    playerTrackTitle.textContent = `${nextTrack.title} — ${nextTrack.artist || 'Christian Culture'}`;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            updatePlayerUI(true);
            playerStatusText.textContent = "Odtwarza";
        }).catch(err => {
            console.error('Worship next track error:', err);
            isPlaying = false;
            updatePlayerUI(false);
        });
    }
}

const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const volumeBtn = document.getElementById("volumeBtn");
const volumeIcon = document.getElementById("volumeIcon");
const volumeSlider = document.getElementById("volumeSlider");
const playerStatusText = document.getElementById("playerStatusText");
const playerTrackTitle = document.getElementById("playerTrackTitle");
const playerStationLogo = document.getElementById("playerStationLogo");
const activeStationNameText = document.getElementById("activeStationName");

const stationDropdownBtn = document.getElementById("stationDropdownBtn");
const stationDropdownMenu = document.getElementById("stationDropdownMenu");

const hamburgerBtn = document.getElementById("hamburgerBtn");
const sideDrawer = document.getElementById("sideDrawer");
const drawerCloseBtn = document.getElementById("drawerCloseBtn");
const drawerOverlay = document.getElementById("drawerOverlay");

const smsBtn = document.getElementById("smsBtn");
const navSmsLink = document.getElementById("navSmsLink");
const smsModal = document.getElementById("smsModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");

const visualizerCanvas = document.getElementById("visualizerCanvas");
const canvasCtx = visualizerCanvas.getContext("2d");

// 3. INITIALIZATION
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const adminDoc = await getDoc(doc(db, "admin", "radioCC"));
        if (adminDoc.exists()) {
            const data = adminDoc.data();
            if (data.STATIONS) {
                STATIONS = { ...STATIONS, ...data.STATIONS };
                console.log("Loaded STATIONS configuration from Firebase merged with local stations");
            }
        }
    } catch (e) {
        console.error("Failed to load STATIONS from Firebase, using fallback", e);
    }
    
    // Dynamically render station dropdown menu items
    renderStationDropdown();

    // Preload local playlists to ensure immediate user-gesture playback
    loadWorshipPlaylist();
    loadBibliaSpiewanaPlaylist();
    
    // Setup initial station details WITHOUT auto-starting audio
    selectStation("poland", true);
    
    // Check and keep fallback loop alive
    setInterval(updateLocalTrackTitleFallback, 15000);
    
    // Resize Visualizer Canvas
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Start Visualizer Loop
    startVisualizer();
});

// 4. UI INTERACTIVE CONTROLS (DRAWER & MODALS)

// Hamburger Drawer Toggle
hamburgerBtn.addEventListener("click", () => {
    sideDrawer.classList.add("active");
    drawerOverlay.classList.add("active");
});

const closeDrawer = () => {
    sideDrawer.classList.remove("active");
    drawerOverlay.classList.remove("active");
};

drawerCloseBtn.addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);

// Close drawer when clicking a navigation link
document.querySelectorAll(".drawer-link").forEach(link => {
    link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
            closeDrawer();
            document.querySelectorAll(".drawer-link").forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        }
    });
});

// SMS Subscription Modal Toggle
if (smsBtn && smsModal) {
    smsBtn.addEventListener("click", () => {
        smsModal.classList.add("active");
    });
}

if (navSmsLink && smsModal) {
    navSmsLink.addEventListener("click", (e) => {
        e.preventDefault();
        smsModal.classList.add("active");
    });
}

const closeSmsModal = () => {
    if (smsModal) smsModal.classList.remove("active");
};

if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeSmsModal);
}
if (smsModal) {
    smsModal.addEventListener("click", (e) => {
        if (e.target === smsModal) closeSmsModal();
    });
}

// 5. RADIO PLAYER CONTROLS & EVENT LISTENERS

// Station Dropdown Select Toggle
stationDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    stationDropdownBtn.classList.toggle("active");
    stationDropdownMenu.classList.toggle("active");
});

document.addEventListener("click", () => {
    stationDropdownBtn.classList.remove("active");
    stationDropdownMenu.classList.remove("active");
});

function renderStationDropdown() {
    if (!stationDropdownMenu) return;
    stationDropdownMenu.innerHTML = Object.values(STATIONS).map(st => `
        <button class="dropdown-item ${st.id === (activeStation ? activeStation.id : 'poland') ? 'active' : ''}" data-station-id="${st.id}">
            <span class="dot" style="background: ${st.accentColors ? st.accentColors[0] : '#D4AF37'}; box-shadow: 0 0 8px ${st.accentColors ? st.accentColors[0] : '#D4AF37'};"></span> ${st.name}
        </button>
    `).join('');

    document.querySelectorAll(".dropdown-item").forEach(item => {
        item.addEventListener("click", (e) => {
            const stationId = item.getAttribute("data-station-id");
            document.querySelectorAll(".dropdown-item").forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            selectStation(stationId);
        });
    });
}

renderStationDropdown();

// Main Play / Pause click
playBtn.addEventListener("click", () => {
    if (isPlaying) {
        pauseRadio();
    } else {
        playRadio();
    }
});

// Volume Slider Event Listener
volumeSlider.addEventListener("input", (e) => {
    const val = e.target.value / 100;
    audio.volume = val;
    previousVolume = val;
    
    if (val === 0) {
        isMuted = true;
        updateVolumeIcon(0);
    } else {
        isMuted = false;
        updateVolumeIcon(val);
    }
});

// Mute button click
volumeBtn.addEventListener("click", () => {
    if (isMuted) {
        audio.volume = previousVolume;
        volumeSlider.value = previousVolume * 100;
        isMuted = false;
        updateVolumeIcon(previousVolume);
    } else {
        previousVolume = audio.volume > 0 ? audio.volume : 0.8;
        audio.volume = 0;
        volumeSlider.value = 0;
        isMuted = true;
        updateVolumeIcon(0);
    }
});

// 6. AUDIO LOGIC & STATE HANDLING

function selectStation(stationId, noPlay = false) {
    const station = STATIONS[stationId];
    if (!station) return;
    
    // Set active station state
    activeStation = station;
    activeStationNameText.textContent = station.name;
    playerStationLogo.src = station.logo;
    
    // Change player CSS accent color dynamically
    if (station.accentColors && station.accentColors[0]) {
        document.documentElement.style.setProperty('--player-accent', station.accentColors[0]);
    }
    
    // Connect to Zeno.fm live metadata EventSource
    connectStationMetadata(stationId);
    
    // Only start playback if explicitly requested (not on initial page load)
    if (noPlay) return;
    
    // Smoothly fade out, switch source, and start playback automatically
    fadeAudioOut(() => {
        if (stationId === "global_biblia" || stationId === "instrumental_worship") {
            audio.src = "";
        } else {
            setAudioSource(station.streamUrl);
        }
        playRadio();
    });
}

function setAudioSource(url) {
    // Reset source to clear buffer for live streams
    audio.src = url;
    audio.load();
}

async function playRadio() {
    stopFade();
    isPlaying = true;
    updatePlayerUI(true);
    playerStatusText.textContent = "Łączenie...";
    
    if (activeStation.id === "global_biblia") {
        await loadGlobalPlaylist();
        if (globalPlaylist.length > 0) {
            const epochSeconds = Math.floor(Date.now() / 1000);
            let remaining = epochSeconds % totalDuration;
            let targetIndex = 0;
            let seekSeconds = 0;
            for (let i = 0; i < globalPlaylist.length; i++) {
                if (remaining < globalPlaylist[i].duration) {
                    targetIndex = i;
                    seekSeconds = remaining;
                    break;
                }
                remaining -= globalPlaylist[i].duration;
            }
            const currentTrack = globalPlaylist[targetIndex];
            if (!audio.src.includes(currentTrack.name)) {
                audio.src = currentTrack.url;
                audio.load();
            }
            audio.currentTime = seekSeconds;
            playerTrackTitle.textContent = `${currentTrack.bookName} - Chapter ${currentTrack.chapter}`;
        }
    } else if (activeStation.id === "instrumental_worship") {
        await loadWorshipPlaylist();
        if (worshipPlaylist.length > 0) {
            if (!audio.src || !audio.src.includes(".mp3") || audio.ended) {
                if (worshipTrackIndex < 0 || worshipTrackIndex >= worshipPlaylist.length) {
                    worshipTrackIndex = Math.floor(Math.random() * worshipPlaylist.length);
                }
                const currentTrack = worshipPlaylist[worshipTrackIndex];
                audio.src = currentTrack.url;
                playerTrackTitle.textContent = `${currentTrack.title} — ${currentTrack.artist || 'Christian Culture'}`;
            }
        }
    } else if (activeStation.id === "biblia_spiewana") {
        await loadBibliaSpiewanaPlaylist();
        if (bibliaSpiewanaPlaylist.length > 0) {
            if (!audio.src || !audio.src.includes(".mp3") || audio.ended) {
                if (bibliaSpiewanaTrackIndex < 0 || bibliaSpiewanaTrackIndex >= bibliaSpiewanaPlaylist.length) {
                    bibliaSpiewanaTrackIndex = 0;
                }
                const currentTrack = bibliaSpiewanaPlaylist[bibliaSpiewanaTrackIndex];
                audio.src = currentTrack.url;
                playerTrackTitle.textContent = `${currentTrack.title} — ${currentTrack.artist || 'Christian Culture'}`;
            }
        }
    } else {
        // If audio element was reset, reload the active stream url
        if (!audio.src || audio.src === window.location.href || audio.src.includes(".mp3")) {
            audio.src = activeStation.streamUrl;
        }
    }
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            playerStatusText.textContent = "Odtwarza";
            // Smoothly fade in volume to set value
            fadeAudioIn(previousVolume);
        }).catch(error => {
            console.error("Audio playback error:", error);
            isPlaying = false;
            updatePlayerUI(false);
            playerStatusText.textContent = "Błąd połączenia";
        });
    }
}

let fadeInterval = null;

function stopFade() {
    if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
    }
}

function pauseRadio() {
    isPlaying = false;
    updatePlayerUI(false);
    playerStatusText.textContent = "Zatrzymany";
    stopFade();
    audio.pause();
    audio.volume = previousVolume;
    
    // Clear audio source on pause for live streams so they don't buffer outdated content
    if (activeStation && activeStation.id !== "instrumental_worship") {
        audio.src = "";
    }
}

function fadeAudioOut(callback) {
    stopFade();
    const fadeSteps = 10;
    const fadeIntervalTime = 30; // 300ms total fade out
    const initialVolume = audio.volume;
    let currentStep = 0;
    
    fadeInterval = setInterval(() => {
        currentStep++;
        const targetVol = initialVolume * (1 - currentStep / fadeSteps);
        audio.volume = Math.max(0, targetVol);
        
        if (currentStep >= fadeSteps) {
            stopFade();
            if (callback) callback();
        }
    }, fadeIntervalTime);
}

function fadeAudioIn(targetVolume) {
    stopFade();
    audio.volume = 0;
    const fadeSteps = 10;
    const fadeIntervalTime = 35; // 350ms total fade in
    let currentStep = 0;
    
    fadeInterval = setInterval(() => {
        currentStep++;
        const targetVol = targetVolume * (currentStep / fadeSteps);
        audio.volume = Math.min(targetVolume, targetVol);
        
        if (currentStep >= fadeSteps) {
            stopFade();
        }
    }, fadeIntervalTime);
}

// Audio Buffering Event Listeners
// Preload playlists immediately for instant playback and gesture preservation
loadWorshipPlaylist();
loadGlobalPlaylist();

audio.addEventListener("waiting", () => {
    if (isPlaying) {
        playerStatusText.textContent = "Buforowanie...";
    }
});

audio.addEventListener("playing", () => {
    isPlaying = true;
    updatePlayerUI(true);
    playerStatusText.textContent = "Odtwarza";
});

audio.addEventListener("pause", () => {
    if (audio.paused && !isPlaying) {
        updatePlayerUI(false);
    }
});

audio.addEventListener("stalled", () => {
    if (isPlaying) {
        playerStatusText.textContent = "Problemy z siecią...";
    }
});

audio.addEventListener("error", (e) => {
    console.error("Audio player error event:", e);
    if (isPlaying) {
        isPlaying = false;
        updatePlayerUI(false);
        playerStatusText.textContent = "Błąd strumienia";
    }
});




// Update play/pause buttons visually
function updatePlayerUI(playing) {
    if (playing) {
        playBtn.classList.add("playing");
        playIcon.className = "fa-solid fa-pause";
        playBtn.style.boxShadow = `0 0 25px ${activeStation.accentColors[0]}`;
        playerStationLogo.style.animation = "pulseGlow 2s infinite ease-in-out";
    } else {
        playBtn.classList.remove("playing");
        playIcon.className = "fa-solid fa-play";
        playBtn.style.boxShadow = "none";
        playerStationLogo.style.animation = "none";
    }
}

// Dynamic volume icon changer
function updateVolumeIcon(vol) {
    if (vol === 0) {
        volumeIcon.className = "fa-solid fa-volume-xmark";
    } else if (vol < 0.4) {
        volumeIcon.className = "fa-solid fa-volume-low";
    } else {
        volumeIcon.className = "fa-solid fa-volume-high";
    }
}

async function loadGlobalPlaylist() {
    if (globalPlaylist.length > 0) return;
    try {
        const res = await fetch("./playlist.json");
        globalPlaylist = await res.json();
        totalDuration = globalPlaylist.reduce((acc, item) => acc + item.duration, 0);
    } catch (e) {
        console.error("Failed to load playlist.json", e);
    }
}

async function updateGlobalBibleRadioState() {
    await loadGlobalPlaylist();
    if (globalPlaylist.length === 0) return;
    
    const epochSeconds = Math.floor(Date.now() / 1000);
    let remaining = epochSeconds % totalDuration;
    let targetIndex = 0;
    let seekSeconds = 0;
    for (let i = 0; i < globalPlaylist.length; i++) {
        if (remaining < globalPlaylist[i].duration) {
            targetIndex = i;
            seekSeconds = remaining;
            break;
        }
        remaining -= globalPlaylist[i].duration;
    }
    const currentTrack = globalPlaylist[targetIndex];
    
    const expectedTitle = `${currentTrack.bookName} - Chapter ${currentTrack.chapter}`;
    if (playerTrackTitle.textContent !== expectedTitle) {
        playerTrackTitle.textContent = expectedTitle;
    }
    
    if (isPlaying && activeStation.id === "global_biblia") {
        if (!audio.src.includes(currentTrack.name)) {
            console.log("Switching to next chapter:", currentTrack.name);
            audio.src = currentTrack.url;
            audio.load();
            audio.currentTime = seekSeconds;
            audio.play().catch(e => console.error(e));
        }
    }
}

// 7. REAL-TIME TRACK METADATA AUTOMATION (VIA ZENO.FM SSE)
function connectStationMetadata(stationId) {
    if (globalBibleTimer) {
        clearInterval(globalBibleTimer);
        globalBibleTimer = null;
    }
    // Close previous EventSource connection if it exists
    if (metadataEventSource) {
        metadataEventSource.close();
        metadataEventSource = null;
    }
    
    if (stationId === "global_biblia") {
        playerTrackTitle.textContent = "Wczytywanie informacji o utworze...";
        updateGlobalBibleRadioState();
        globalBibleTimer = setInterval(updateGlobalBibleRadioState, 5000);
        return;
    }
    
    const station = STATIONS[stationId];
    if (!station) return;
    
    // Set placeholder tracker text initially
    playerTrackTitle.textContent = "Wczytywanie informacji o utworze...";
    
    // Get mount ID from streamUrl (last segment of the URL)
    const mountId = station.streamUrl.split('/').pop();
    const sseUrl = `https://api.zeno.fm/mounts/metadata/subscribe/${mountId}`;
    
    try {
        metadataEventSource = new EventSource(sseUrl);
        
        metadataEventSource.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                if (data && data.streamTitle) {
                    const cleanTitle = data.streamTitle.trim();
                    if (cleanTitle && playerTrackTitle.textContent !== cleanTitle) {
                        playerTrackTitle.textContent = cleanTitle;
                    }
                }
            } catch (e) {
                console.error("Error parsing Zeno.fm metadata event:", e);
            }
        };
        
        metadataEventSource.onerror = function(err) {
            console.warn("EventSource metadata connection lost. Switching to local fallback.");
            if (metadataEventSource) {
                metadataEventSource.close();
                metadataEventSource = null;
            }
            updateLocalTrackTitleFallback();
        };
    } catch (error) {
        console.error("Failed to initialize Zeno.fm metadata EventSource:", error);
        updateLocalTrackTitleFallback();
    }
}

function updateLocalTrackTitleFallback() {
    // Do not run fallback if active EventSource is successfully running
    if (metadataEventSource && metadataEventSource.readyState === EventSource.OPEN) {
        return;
    }
    
    const tracksList = activeStation.tracks;
    if (!tracksList || tracksList.length === 0) {
        playerTrackTitle.textContent = activeStation.name + " - Transmisja na żywo";
        return;
    }
    
    // Fallback: cycle local mock tracks every 180 seconds based on current epoch time
    const secondEpoch = Math.floor(Date.now() / 1000);
    const idx = Math.floor((secondEpoch / 180) % tracksList.length);
    const currentSong = tracksList[idx];
    
    if (playerTrackTitle.textContent !== currentSong) {
        playerTrackTitle.textContent = currentSong;
    }
}

// 8. HIGH-PERFORMANCE DYNAMIC CANVAS VISUALIZER
function resizeCanvas() {
    const parent = visualizerCanvas.parentElement;
    visualizerCanvas.width = parent.clientWidth;
    visualizerCanvas.height = 45;
}

let animFrameId = null;
let waveOffset = 0;

function startVisualizer() {
    // Generate some random heights for our visualizer bars
    const barCount = 42;
    const bars = [];
    for (let i = 0; i < barCount; i++) {
        bars.push({
            x: 0,
            targetHeight: 5,
            currentHeight: 5,
            speed: 0.1 + Math.random() * 0.15
        });
    }

    function draw() {
        animFrameId = requestAnimationFrame(draw);
        
        const width = visualizerCanvas.width;
        const height = visualizerCanvas.height;
        
        // Clear canvas with subtle transparency
        canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        canvasCtx.fillRect(0, 0, width, height);
        
        const padding = 4;
        const totalPadding = padding * (barCount - 1);
        const barWidth = (width - totalPadding) / barCount;
        
        waveOffset += isPlaying ? 0.08 : 0.01;
        
        // Draw each vertical bar
        for (let i = 0; i < barCount; i++) {
            const bar = bars[i];
            
            // Calculate height using layered sine waves when playing
            if (isPlaying) {
                // Multi-frequency wave formula
                const sineVal1 = Math.sin(i * 0.3 + waveOffset);
                const sineVal2 = Math.cos(i * 0.7 - waveOffset * 1.5);
                const randomNoise = Math.sin(Date.now() * bar.speed * 0.03) * 0.4;
                
                // Target height fluctuates between 4px and 35px
                bar.targetHeight = 6 + Math.abs(sineVal1 * 0.5 + sineVal2 * 0.35 + randomNoise * 0.15) * (height - 12);
            } else {
                // If paused, drop bars down to a quiet idle state
                bar.targetHeight = 2 + Math.sin(i * 0.1 + waveOffset) * 1.5;
            }
            
            // Smoothly interpolate towards the target height
            bar.currentHeight += (bar.targetHeight - bar.currentHeight) * 0.2;
            
            const barX = i * (barWidth + padding);
            const barY = height - bar.currentHeight - 2;
            
            // Create a gorgeous gradient for each bar using the active station's colors
            const gradient = canvasCtx.createLinearGradient(0, height, 0, 0);
            gradient.addColorStop(0, activeStation.accentColors[0]);
            gradient.addColorStop(1, activeStation.accentColors[1] || activeStation.accentColors[0]);
            
            canvasCtx.fillStyle = gradient;
            
            // Draw a rounded rectangle bar
            drawRoundedRect(canvasCtx, barX, barY, barWidth, bar.currentHeight, 2);
        }
    }
    
    draw();
}

// Helper to draw rounded visualizer bars
function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (height < 2) height = 2; // prevent zero-height errors
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// 9. SMOOTH LINK SCROLLING
document.querySelectorAll('.scroll-to').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70, // subtract header height
                behavior: 'smooth'
            });
        }
    });
});

// 10. HERO PLAY BUTTON AUTO-PLAY LOGIC
const heroPlayBtn = document.getElementById("heroPlayBtn");
if (heroPlayBtn) {
    heroPlayBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Auto-play the radio stream if it is currently paused
        if (!isPlaying) {
            playRadio();
        }
    });
}

// 11. FLOATING BACK TO TOP BUTTON LOGIC
const backToTopBtn = document.getElementById("backToTopBtn");
if (backToTopBtn) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add("visible");
        } else {
            backToTopBtn.classList.remove("visible");
        }
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// 12. DECALOGUE MODAL LOGIC
const BIBLE_DECALOGUE = [
  { num: "1", text: "I mówił Pan wszystkie te słowa:" },
  { num: "2", text: "„Jam jest Pan, Bóg twój, którym cię wywiódł z ziemi egipskiej, z domu niewoli." },
  { num: "3", text: "Nie będziesz miał bogów cudzych przede mną." },
  { num: "4", text: "Nie uczynisz sobie obrazu rytego ani żadnej podobizny tego, co jest na niebie w górze i co na ziemi nisko, ani z tych rzeczy, które są w wodach pod ziemią." },
  { num: "5", text: "Nie będziesz się im kłaniał ani służył. Ja jestem Pan, Bóg twój, mocny, zawistny, karzący nieprawość ojców na synach do trzeciego i czwartego pokolenia tych, którzy mnie nienawidzą," },
  { num: "6", text: "a czyniący miłosierdzie tysiącom tych, którzy mię miłują i strzegą przykazań moich." },
  { num: "7", text: "Nie będziesz brał imienia Pana, Boga twego, nadaremno; bo nie będzie miał Pan za niewinnego tego, który by wziął imię Pana, Boga swego, nadaremno." },
  { num: "8", text: "Pamiętaj, abyś dzień sobotni święcił." },
  { num: "9", text: "Sześć dni robić będziesz i będziesz wykonywał wszystkie roboty twoje;" },
  { num: "10", text: "ale dnia siódmego sabat Pana, Boga twego, jest: nie będziesz wykonywał weń żadnej roboty, ty i syn twój, i córka twoja, sługa twój i służebnica twoja, bydlę twoje i gość, który jest między bramami twymi." },
  { num: "11", text: "Przez sześć dni bowiem czynił Pan niebo i ziemię, i morze, i wszystko, co w nich jest, a odpoczął dnia siódmego; i dlatego pobłogosławił Pan dniowi sobotniemu i poświęcił go." },
  { num: "12", text: "Czcij ojca twego i matkę twoją, abyś długo żył na ziemi, którą Pan, Bóg twój, da tobie." },
  { num: "13", text: "Nie będziesz zabijał." },
  { num: "14", text: "Nie będziesz cudzołożył." },
  { num: "15", text: "Nie będziesz kradzieży czynił." },
  { num: "16", text: "Nie będziesz mówił fałszywego świadectwa przeciw bliźniemu twemu." },
  { num: "17", text: "Nie będziesz pożądał domu bliźniego twego, ani będziesz pragnął żony jego, ani sługi, ani służebnicy, ani wołu, ani osła, ani żadnej rzeczy, która jego jest”." }
];

document.addEventListener("DOMContentLoaded", () => {
    const decalogueModal = document.getElementById("decalogueModal");
    const decalogueModalOverlay = document.getElementById("decalogueModalOverlay");
    const decalogueCloseBtn = document.getElementById("decalogueCloseBtn");
    const navDecalogueLink = document.getElementById("navDecalogueLink");
    const headerDecalogueBtn = document.getElementById("headerDecalogueBtn");
    const decalogueContentBox = document.querySelector("#decalogueContentBox .decalogue-list");
    
    // Render Dekalog list
    if (decalogueContentBox) {
        decalogueContentBox.innerHTML = "";
        BIBLE_DECALOGUE.forEach(item => {
            const div = document.createElement("div");
            div.style.display = "flex";
            div.style.gap = "1rem";
            div.style.padding = "1rem";
            div.style.background = "rgba(255,255,255,0.02)";
            div.style.borderRadius = "0.75rem";
            div.style.border = "1px solid rgba(255,255,255,0.05)";
            
            const numSpan = document.createElement("span");
            numSpan.style.color = "#C5A059";
            numSpan.style.fontWeight = "900";
            numSpan.style.minWidth = "25px";
            numSpan.innerText = item.num + ".";
            
            const textP = document.createElement("p");
            textP.style.margin = "0";
            textP.innerText = item.text;
            
            div.appendChild(numSpan);
            div.appendChild(textP);
            decalogueContentBox.appendChild(div);
        });
    }

    const openDecalogue = (e) => {
        if(e) e.preventDefault();
        if(decalogueModal) {
            decalogueModal.style.display = "flex";
            setTimeout(() => { decalogueModal.classList.add("open"); }, 10);
            document.body.style.overflow = "hidden";
        }
        if(typeof closeDrawer === "function") closeDrawer();
    };

    const closeDecalogue = () => {
        if(decalogueModal) {
            decalogueModal.classList.remove("open");
            document.body.style.overflow = "";
            setTimeout(() => { decalogueModal.style.display = "none"; }, 300);
        }
    };

    if(navDecalogueLink) navDecalogueLink.addEventListener("click", openDecalogue);
    if(headerDecalogueBtn) headerDecalogueBtn.addEventListener("click", openDecalogue);
    if(decalogueCloseBtn) decalogueCloseBtn.addEventListener("click", closeDecalogue);
    if(decalogueModalOverlay) decalogueModalOverlay.addEventListener("click", closeDecalogue);
    
    // Copy and Share functionality
    const getDecalogueText = () => {
        return "DEKALOG (DZIESIĘCIORO PRZYKAZAŃ)\nwedług tekstu: Pismo Święte Starego i Nowego Testamentu, wyd. 1962\n\n" + 
            BIBLE_DECALOGUE.map(v => `${v.num} ${v.text}`).join('\n');
    };

    const btnCopy = document.getElementById("btnCopyDecalogue");
    if (btnCopy) {
        btnCopy.addEventListener("click", () => {
            navigator.clipboard.writeText(getDecalogueText()).then(() => {
                alert("Skopiowano do schowka!");
            }).catch(err => {
                console.error("Błąd kopiowania:", err);
            });
        });
    }

    const btnShare = document.getElementById("btnShareDecalogue");
    if (btnShare) {
        btnShare.addEventListener("click", () => {
            const text = getDecalogueText();
            if (navigator.share) {
                navigator.share({ title: 'Dekalog', text: text }).catch(console.error);
            } else {
                navigator.clipboard.writeText(text).then(() => {
                    alert("Skopiowano do schowka! (Udostępnianie natywne nie jest obsługiwane na tym urządzeniu)");
                });
            }
        });
    }

    // === GOOGLE REVIEWS WIDGET LOGIC ===
    const reviewsTrack = document.getElementById("reviewsTrack");
    const reviewsDots = document.getElementById("reviewsDots");
    const prevBtn = document.getElementById("reviewsPrevBtn");
    const nextBtn = document.getElementById("reviewsNextBtn");
    
    if (reviewsTrack) {
        let currentIndex = 0;
        let reviews = [];
        let itemsPerView = 1;
        
        const updateItemsPerView = () => {
            const width = window.innerWidth;
            if (width >= 1024) {
                itemsPerView = 3;
            } else if (width >= 768) {
                itemsPerView = 2;
            } else {
                itemsPerView = 1;
            }
        };
        
        const renderReviews = () => {
            reviewsTrack.innerHTML = reviews.map(rev => `
                <div class="review-card">
                    <div class="review-card-inner">
                        <div>
                            <div class="review-header">
                                <div class="review-avatar">${rev.avatar || rev.author.substring(0,2)}</div>
                                <div class="review-meta">
                                    <div class="review-author">${rev.author}</div>
                                    <div class="review-date">${rev.date}</div>
                                </div>
                            </div>
                            <div class="review-stars">
                                ${Array(rev.rating).fill('<i class="fa-solid fa-star"></i>').join('')}
                            </div>
                            <p class="review-text">"${rev.text}"</p>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Render navigation dots
            const totalDots = Math.max(1, reviews.length - itemsPerView + 1);
            reviewsDots.innerHTML = Array(totalDots).fill(0).map((_, idx) => `
                <div class="reviews-dot ${idx === currentIndex ? 'active' : ''}" data-index="${idx}"></div>
            `).join('');
            
            // Attach dot click events
            document.querySelectorAll(".reviews-dot").forEach(dot => {
                dot.addEventListener("click", (e) => {
                    currentIndex = parseInt(e.target.getAttribute("data-index"));
                    slideCarousel();
                });
            });
            
            slideCarousel();
        };
        
        const slideCarousel = () => {
            const maxIndex = Math.max(0, reviews.length - itemsPerView);
            if (currentIndex > maxIndex) currentIndex = maxIndex;
            if (currentIndex < 0) currentIndex = 0;
            
            const cardWidth = reviewsTrack.querySelector(".review-card") ? reviewsTrack.querySelector(".review-card").getBoundingClientRect().width : 0;
            reviewsTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            
            // Update active dot
            document.querySelectorAll(".reviews-dot").forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.classList.add("active");
                } else {
                    dot.classList.remove("active");
                }
            });
        };
        
        // Fetch reviews from local JSON
        fetch('./reviews.json')
            .then(res => res.json())
            .then(data => {
                reviews = data;
                updateItemsPerView();
                renderReviews();
            })
            .catch(err => {
                console.error("Error loading reviews:", err);
            });
            
        // Event listeners
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    slideCarousel();
                } else {
                    currentIndex = Math.max(0, reviews.length - itemsPerView);
                    slideCarousel();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                const maxIndex = Math.max(0, reviews.length - itemsPerView);
                if (currentIndex < maxIndex) {
                    currentIndex++;
                    slideCarousel();
                } else {
                    currentIndex = 0;
                    slideCarousel();
                }
            });
        }
        
        window.addEventListener("resize", () => {
            const oldItems = itemsPerView;
            updateItemsPerView();
            if (oldItems !== itemsPerView) {
                renderReviews();
            } else {
                slideCarousel();
            }
        });
    }
});
