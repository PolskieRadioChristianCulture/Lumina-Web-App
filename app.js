/**
 * CHRISTIAN CULTURE - WEB APP ENGINE
 * Estetyka: Black & Gold Premium
 * Funkcje: Sterowanie 3 stacjami radiowymi, RWD, Canvas Visualizer, Modale
 */

// 1. STATIONS DATA CONFIGURATION
const STATIONS = {
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
    }
};

// 2. STATE VARIABLES
let activeStation = STATIONS.poland;
let isPlaying = false;
let isMuted = false;
let previousVolume = 0.8;
let metadataEventSource = null;

// DOM Elements
const audio = new Audio();
audio.volume = 0.8;

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
document.addEventListener("DOMContentLoaded", () => {
    // Setup initial station details
    selectStation("poland");
    
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
        closeDrawer();
        
        // Remove active class from all links and add to clicked one
        document.querySelectorAll(".drawer-link").forEach(l => l.classList.remove("active"));
        link.classList.add("active");
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

// Switch stations when clicking dropdown items
document.querySelectorAll(".dropdown-item").forEach(item => {
    item.addEventListener("click", (e) => {
        const stationId = item.getAttribute("data-station-id");
        
        // Update active class in dropdown menu
        document.querySelectorAll(".dropdown-item").forEach(i => i.classList.remove("active"));
        item.classList.add("active");
        
        selectStation(stationId);
    });
});

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

function selectStation(stationId) {
    const station = STATIONS[stationId];
    if (!station) return;
    
    const wasPlaying = isPlaying;
    
    // Set active station state
    activeStation = station;
    activeStationNameText.textContent = station.name;
    playerStationLogo.src = station.logo;
    
    // Change player CSS accent color dynamically
    document.documentElement.style.setProperty('--player-accent', station.accentColors[0]);
    
    // Connect to Zeno.fm live metadata EventSource
    connectStationMetadata(stationId);
    
    if (wasPlaying) {
        // Smoothly fade out, switch source, and fade back in
        fadeAudioOut(() => {
            setAudioSource(station.streamUrl);
            playRadio();
        });
    } else {
        setAudioSource(station.streamUrl);
        updatePlayerUI(false);
        playerStatusText.textContent = "Gotowy";
    }
}

function setAudioSource(url) {
    // Reset source to clear buffer for live streams
    audio.src = url;
    audio.load();
}

function playRadio() {
    isPlaying = true;
    updatePlayerUI(true);
    playerStatusText.textContent = "Łączenie...";
    
    // If audio element was reset, reload the active stream url
    if (!audio.src || audio.src === window.location.href) {
        audio.src = activeStation.streamUrl;
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

function pauseRadio() {
    isPlaying = false;
    updatePlayerUI(false);
    playerStatusText.textContent = "Zatrzymany";
    
    // Smoothly fade out volume and pause/release stream
    fadeAudioOut(() => {
        audio.pause();
        // Clear audio source on pause so it doesn't download bandwidth/buffer outdated content
        audio.src = "";
    });
}

function fadeAudioOut(callback) {
    const fadeSteps = 10;
    const fadeIntervalTime = 30; // 300ms total fade out
    const initialVolume = audio.volume;
    let currentStep = 0;
    
    const interval = setInterval(() => {
        currentStep++;
        const targetVol = initialVolume * (1 - currentStep / fadeSteps);
        audio.volume = Math.max(0, targetVol);
        
        if (currentStep >= fadeSteps) {
            clearInterval(interval);
            if (callback) callback();
        }
    }, fadeIntervalTime);
}

function fadeAudioIn(targetVolume) {
    audio.volume = 0;
    const fadeSteps = 10;
    const fadeIntervalTime = 35; // 350ms total fade in
    let currentStep = 0;
    
    const interval = setInterval(() => {
        currentStep++;
        const targetVol = targetVolume * (currentStep / fadeSteps);
        audio.volume = Math.min(targetVolume, targetVol);
        
        if (currentStep >= fadeSteps) {
            clearInterval(interval);
        }
    }, fadeIntervalTime);
}

// Audio Buffering Event Listeners
audio.addEventListener("waiting", () => {
    if (isPlaying) {
        playerStatusText.textContent = "Buforowanie...";
    }
});

audio.addEventListener("playing", () => {
    if (isPlaying) {
        playerStatusText.textContent = "Odtwarza";
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

// 7. REAL-TIME TRACK METADATA AUTOMATION (VIA ZENO.FM SSE)
function connectStationMetadata(stationId) {
    // Close previous EventSource connection if it exists
    if (metadataEventSource) {
        metadataEventSource.close();
        metadataEventSource = null;
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
