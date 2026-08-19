

        // ── SAFE LOCALSTORAGE WRAPPER FOR IFRAME COMPATIBILITY ──
        const safeStorage = {
            _data: {},
            getItem(key) {
                try {
                    return window.localStorage.getItem(key);
                } catch (e) {
                    return this._data[key] || null;
                }
            },
            setItem(key, value) {
                try {
                    window.localStorage.setItem(key, value);
                } catch (e) {
                    this._data[key] = String(value);
                }
            },
            removeItem(key) {
                try {
                    window.localStorage.removeItem(key);
                } catch (e) {
                    delete this._data[key];
                }
            }
        };



        


        // ── AUDIO INIT (global scope — called from overlay onclick) ──
        function initStream() {
            const overlay = document.getElementById('startOverlay');
            const audio   = document.getElementById('stream-audio');
            if (overlay) overlay.classList.add('hidden');
            if (audio) {
                // Oznacz że użytkownik kliknął – playlista może jeszcze ładować
                window._worshipUserInteracted = true;
                // Trigger synced playlist playback (loads src + plays correct track)
                if (typeof window.worshipSyncAndPlay === 'function') {
                    window.worshipSyncAndPlay();
                } else {
                    // Playlista jeszcze nie załadowana – spróbuj za chwilę
                    audio.play().catch(e => {
                        console.warn("Audio play blocked:", e);
                    });
                }
                // Watchdog: restart if paused (e.g. network drop lub race condition)
                
            // --- 4 ROTATIONAL SCRIPTURE & BIBLE QR SLIDES ---
            const qrSlides = [
                {
                    qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://polskieradio.cc/biblia-do-pobrania.html",
                    title: "DARMOWA BIBLIA PDF",
                    text: "Zeskanuj QR, aby pobrać Pismo Święte (UBG / Wujek) w formacie PDF.",
                    subtext: "polskieradio.cc/biblia-do-pobrania.html"
                },
                {
                    qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://polskieradio.cc/biblia-do-pobrania.html",
                    title: "PISMO ŚWIĘTE (DRUK)",
                    text: "Wyślij SMS: <strong>BIBLIA</strong> pod numer <strong>507 821 789</strong>. *Koszt tylko przesyłki.",
                    subtext: "SMS: BIBLIA pod +48 507 821 789"
                },
                {
                    qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://play.google.com/store/search?q=Christian%20Culture&c=apps&hl=pl",
                    title: "APLIKACJA MOBILNA",
                    text: "Słuchaj rozważań i Pisma Świętego w aplikacji 'Dobrze, że jesteś'.",
                    subtext: "Google Play: Christian Culture"
                },
                {
                    qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://patronite.pl/osobowoscplus",
                    title: "WSPARCIE MISJI BIBLIJNEJ",
                    text: "Pomóż nam wydawać i bezpłatnie rozpowszechniać Pismo Święte.",
                    subtext: "patronite.pl/osobowoscplus"
                }
            ];
            let qrSlideIndex = 0;
            const qrSidecarEl = document.getElementById("qrSidecar");
            if (qrSidecarEl) {
                setInterval(() => {
                    qrSlideIndex = (qrSlideIndex + 1) % qrSlides.length;
                    const s = qrSlides[qrSlideIndex];
                    const img = qrSidecarEl.querySelector(".sidecar-qr-img");
                    const title = qrSidecarEl.querySelector(".sidecar-text");
                    const subtext = qrSidecarEl.querySelector(".sidecar-subtext");
                    if (img) img.src = s.qr;
                    if (title) title.textContent = s.title;
                    if (subtext) subtext.textContent = s.subtext;
                }, 10000);
            }

            setInterval(() => {
                    if (audio.paused) audio.play().catch(() => {});
                }, 5000);
            }
        }

        document.addEventListener("DOMContentLoaded", () => {

            // ── USTAW SCHEDULE OD RAZU (niezależnie od fetch) ──
            (function updateScheduleNow() {
                const now = new Date();
                const h = now.getHours();
                const schedTime = document.getElementById("sched-time");
                const schedName = document.getElementById("sched-name");
                if (!schedTime || !schedName) return;

                let timeStr = "--:--";
                let nameStr = "Wczytywanie...";

                if (h >= 5 && h < 9) {
                    // Morning program profile (05:00 - 09:00)
                    if (h < 7) { timeStr = "06:00"; nameStr = "Słowo o Poranku"; }
                    else if (h === 7) { timeStr = "07:00"; nameStr = "Zadanie Taktyczne"; }
                    else { timeStr = "08:00"; nameStr = "Bojowa Modlitwa"; }
                } else if (h >= 9 && h < 12) {
                    // Forenoon program profile (09:00 - 12:00)
                    if (h === 9) { timeStr = "09:30"; nameStr = "Słowo na Przedpołudnie"; }
                    else if (h === 10 && now.getMinutes() < 30) { timeStr = "09:30"; nameStr = "Słowo na Przedpołudnie"; }
                    else if ((h === 10 && now.getMinutes() >= 30) || (h === 11 && now.getMinutes() < 30)) { timeStr = "10:30"; nameStr = "Zadanie Taktyczne"; }
                    else { timeStr = "11:30"; nameStr = "Bojowa Modlitwa"; }
                } else if (h >= 12 && h < 18) {
                    // Afternoon program profile (12:00 - 18:00)
                    if (h < 15) { timeStr = "13:30"; nameStr = "Słowo na Popołudnie"; }
                    else if (h === 15 || (h === 16 && now.getMinutes() < 30)) { timeStr = "15:00"; nameStr = "Modlitwa o Przebudzenie"; }
                    else { timeStr = "16:30"; nameStr = "Zadanie Taktyczne"; }
                } else if (h >= 18 && h < 22) {
                    // Evening program profile (18:00 - 22:00)
                    if (h < 20 || (h === 20 && now.getMinutes() < 30)) { timeStr = "19:30"; nameStr = "Słowo na Wieczór"; }
                    else if ((h === 20 && now.getMinutes() >= 30) || (h === 21 && now.getMinutes() < 30)) { timeStr = "20:30"; nameStr = "Wieczorna Modlitwa"; }
                    else { timeStr = "21:30"; nameStr = "Walka Duchowa"; }
                } else {
                    // Night program profile (22:00 - 05:00)
                    if (h === 22 || h === 23) { timeStr = "22:30"; nameStr = "Słowo na Noc"; }
                    else if (h === 0 || (h === 1 && now.getMinutes() < 30)) { timeStr = "00:00"; nameStr = "Nocne Czuwanie"; }
                    else { timeStr = "01:30"; nameStr = "Walka Duchowa"; }
                }

                schedTime.textContent = timeStr;
                schedName.textContent = nameStr;
            })();

            // Configuration & State
            const todayDateStr = new Date().toISOString().split('T')[0];
            if (safeStorage.getItem("dzj_stream_saved_date") !== todayDateStr) {
                safeStorage.removeItem("dzj_stream_day");
                safeStorage.setItem("dzj_stream_saved_date", todayDateStr);
            }

            let reflectionsData = [];
            let currentDayIndex = 0;
            let activeSlideIndex = 0;
            let slideInterval = null;
            let slideDurationMs = 25000;
            let activeReflectionObj = null;
            let lastActiveSlotHour = -1;
            
            let customImgSrc = "worship_bg.jpg";

            // Dynamic Time-Based Background Handler (Night 21:00 - 06:00 switch to CCTV_NOCA.jpg)
            safeStorage.removeItem("dzj_stream_image"); // Force wipe user override
            function getActiveBackground() {
                return "tlo_dla_kanalu_Biblia_Spiewana.png";
            }

            let customVideoSrc = ""; 

            // DOM elements
            const opPanel = document.getElementById("operatorPanel");
            const panelTriggerBtn = document.getElementById("panelTriggerBtn");
            const closePanelBtn = document.getElementById("closePanelBtn");
            const daySelect = document.getElementById("daySelect");
            const bgImageSelect = document.getElementById("bgImageSelect");
            const bgVideoSelect = document.getElementById("bgVideoSelect");
            const slideDurationInput = document.getElementById("slideDuration");
            const forceReloadBtn = document.getElementById("forceReloadBtn");

            const slidesContainer = document.getElementById("slidesContainer");
            const slidePagination = document.getElementById("slidePagination");

            const cycleBadge = document.getElementById("cycleBadge");
            const bgActiveImg = document.getElementById("bg-img-active");
            const weatherBox = document.getElementById("weatherBox");

                        // Viewport Auto-Scaling Handler
            function resizeViewport() {
                const container = document.getElementById("app-container");
                if (!container) return;
                const targetW = 1920;
                const targetH = 1080;
                
                const w = window.innerWidth || document.documentElement.clientWidth || 0;
                const h = window.innerHeight || document.documentElement.clientHeight || 0;
                
                // If dimensions are not ready yet, default to a safe scale and top/left 0
                if (w <= 0 || h <= 0) {
                    container.style.transform = "scale(0.29)";
                    container.style.left = "0px";
                    container.style.top = "0px";
                    return;
                }
                
                const scaleX = w / targetW;
                const scaleY = h / targetH;
                const scale = Math.min(scaleX, scaleY);
                
                container.style.transform = "scale(" + scale + ")";
                
                // Center the container within window
                const leftOffset = (w - (targetW * scale)) / 2;
                const topOffset = (h - (targetH * scale)) / 2;
                container.style.left = leftOffset + "px";
                container.style.top = topOffset + "px";
            }
            window.addEventListener("resize", resizeViewport);
            resizeViewport();
            
            // Re-run resizing after full load and multiple intervals to capture iframe layout stabilization
            window.addEventListener("load", resizeViewport);
            setTimeout(resizeViewport, 100);
            setTimeout(resizeViewport, 500);
            setTimeout(resizeViewport, 1500);

            // // Operator panel removed
            // Operator panel removed

            let loadedDate = new Date().getDate();

            // Live Clock updates
            function updateClock() {
                const now = new Date();
                
                // Auto-advance reflection at 00:00 (Midnight Crossing)
                const currentDay = now.getDate();
                if (currentDay !== loadedDate) {
                    loadedDate = currentDay;
                    
                    // If a manual day selection is active in safeStorage, increment it by 1
                    if (safeStorage.getItem("dzj_stream_day")) {
                        let nextDay = (parseInt(safeStorage.getItem("dzj_stream_day"), 10) + 1) % reflectionsData.length;
                        safeStorage.setItem("dzj_stream_day", nextDay);
                        currentDayIndex = nextDay;
                        if (daySelect) daySelect.value = nextDay;
                    }
                    
                    // Reload matched index (either updated manual day or today's matching date)
                    const todayStr = new Date().toISOString().split('T')[0];
                    const foundIdx = reflectionsData.findIndex(r => r.date === todayStr);
                    let matchedIdx = (foundIdx !== -1) ? foundIdx : currentDayIndex;
                    if (daySelect && matchedIdx !== undefined) daySelect.value = matchedIdx;
                    
                    // Re-render reflection text and adapt layout if timezone changed background requirements
                    if (reflectionsData[matchedIdx]) {
                        renderReflection(reflectionsData[matchedIdx] || reflectionsData[reflectionsData.length - 1] || reflectionsData[0]);
                        applyBodyModeClass();
                        if (bgActiveImg) {
                            bgActiveImg.src = getDynamicBackground(customImgSrc);
                        }
                    }
                }

                const hr = String(now.getHours()).padStart(2, '0');
                const min = String(now.getMinutes()).padStart(2, '0');
                const sec = String(now.getSeconds()).padStart(2, '0');
                
                document.getElementById("timeHour").textContent = hr;
                document.getElementById("timeMin").textContent = min;
                document.getElementById("timeSec").textContent = sec;

                const days = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
                const months = ["Stycznia", "Lutego", "Marca", "Kwietnia", "Maja", "Czerwca", "Lipca", "Sierpnia", "Września", "Października", "Listopada", "Grudnia"];
                
                document.getElementById("clockDateLabel").textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;

                // Real-time schedule highlights & program names based on hour of day
                const currentHour = now.getHours();
                const schedTime = document.getElementById("sched-time");
                const schedName = document.getElementById("sched-name");

                if (schedTime && schedName) {
                    let timeStr = "--:--";
                    let nameStr = "Wczytywanie...";

                    if (currentHour >= 5 && currentHour < 9) {
                        // Morning program profile (05:00 - 09:00)
                        if (currentHour < 7) { timeStr = "06:00"; nameStr = "Słowo o Poranku"; }
                        else if (currentHour === 7) { timeStr = "07:00"; nameStr = "Zadanie Taktyczne"; }
                        else { timeStr = "08:00"; nameStr = "Bojowa Modlitwa"; }
                    } else if (currentHour >= 9 && currentHour < 12) {
                        // Forenoon program profile (09:00 - 12:00)
                        if (currentHour === 9) { timeStr = "09:30"; nameStr = "Słowo na Przedpołudnie"; }
                        else if (currentHour === 10 && now.getMinutes() < 30) { timeStr = "09:30"; nameStr = "Słowo na Przedpołudnie"; }
                        else if ((currentHour === 10 && now.getMinutes() >= 30) || (currentHour === 11 && now.getMinutes() < 30)) { timeStr = "10:30"; nameStr = "Zadanie Taktyczne"; }
                        else { timeStr = "11:30"; nameStr = "Bojowa Modlitwa"; }
                    } else if (currentHour >= 12 && currentHour < 18) {
                        // Afternoon program profile (12:00 - 18:00)
                        if (currentHour < 15) { timeStr = "13:30"; nameStr = "Słowo na Popołudnie"; }
                        else if (currentHour === 15 || (currentHour === 16 && now.getMinutes() < 30)) { timeStr = "15:00"; nameStr = "Modlitwa o Przebudzenie"; }
                        else { timeStr = "16:30"; nameStr = "Zadanie Taktyczne"; }
                    } else if (currentHour >= 18 && currentHour < 22) {
                        // Evening program profile (18:00 - 22:00)
                        if (currentHour < 20 || (currentHour === 20 && now.getMinutes() < 30)) { timeStr = "19:30"; nameStr = "Słowo na Wieczór"; }
                        else if ((currentHour === 20 && now.getMinutes() >= 30) || (currentHour === 21 && now.getMinutes() < 30)) { timeStr = "20:30"; nameStr = "Wieczorna Modlitwa"; }
                        else { timeStr = "21:30"; nameStr = "Walka Duchowa"; }
                    } else {
                        // Night program profile (22:00 - 05:00)
                        if (currentHour === 22 || currentHour === 23) { timeStr = "22:30"; nameStr = "Słowo na Noc"; }
                        else if (currentHour === 0 || (currentHour === 1 && now.getMinutes() < 30)) { timeStr = "00:00"; nameStr = "Nocne Czuwanie"; }
                        else { timeStr = "01:30"; nameStr = "Walka Duchowa"; }
                    }

                    schedTime.textContent = timeStr;
                    schedName.textContent = nameStr;
                }

                // Dynamic Edition Label Updates
                const tickerEdition = document.getElementById("tickerEditionLabel");
                if (tickerEdition) {
                    tickerEdition.textContent = "WYDANIE SPECJALNE";
                }

                // Real-time hour slot transition check to adapt reflection text and update backgrounds in real-time
                let currentSlot = 0; 
                if (currentHour >= 5 && currentHour < 9) currentSlot = 0;
                else if (currentHour >= 9 && currentHour < 12) currentSlot = 1;
                else if (currentHour >= 12 && currentHour < 18) currentSlot = 2;
                else if (currentHour >= 18 && currentHour < 22) currentSlot = 3;
                else currentSlot = 4;

                if (lastActiveSlotHour !== currentSlot) {
                    lastActiveSlotHour = currentSlot;
                    if (activeReflectionObj) {
                        renderReflection(activeReflectionObj);
                    }
                    if (safeStorage.getItem("dzj_stream_image") === "breakfast_presenters.jpg" || !safeStorage.getItem("dzj_stream_image")) {
                        initBackground();
                    }
                }

            }
            setInterval(updateClock, 1000);
            updateClock();

                        // Helper to get dynamic background based on time of day and calendar date
            function getDynamicBackground(imagePath) {
                return "tlo_dla_kanalu_Biblia_Spiewana.png";
            }

                                    // Real-time weather data cache and city coordinates
            let realWeatherData = {};
            const cityCoords = {
                "WARSZAWA": { lat: 52.2297, lon: 21.0122 },
                "KRAKÓW": { lat: 50.0647, lon: 19.9450 },
                "OSTROWIEC ŚW.": { lat: 50.9275, lon: 21.3853 },
                "GDAŃSK": { lat: 54.3520, lon: 18.6466 },
                "STALOWA WOLA": { lat: 50.5698, lon: 22.0537 },
                "WROCŁAW": { lat: 51.1079, lon: 17.0385 },
                "POZNAŃ": { lat: 52.4064, lon: 16.9252 }
            };

            function getWeatherIcon(code, isDay) {
                if (code === 0) return isDay ? "☀️" : "🌙";
                if (code >= 1 && code <= 3) return isDay ? "🌤️" : "☁️";
                if (code >= 45 && code <= 48) return "🌫️";
                if (code >= 51 && code <= 67) return "🌧️";
                if (code >= 71 && code <= 77) return "❄️";
                if (code >= 80 && code <= 82) return "🌧️";
                if (code >= 95 && code <= 99) return "⛈️";
                return isDay ? "☀️" : "🌙";
            }

            function getWeatherDesc(code) {
                if (code === 0) return "Słonecznie";
                if (code === 1 || code === 2) return "Lekkie Zachmurzenie";
                if (code === 3) return "Zachmurzenie";
                if (code >= 45 && code <= 48) return "Mglisto";
                if (code >= 51 && code <= 55) return "Mżawka";
                if (code >= 61 && code <= 65) return "Deszcz";
                if (code >= 71 && code <= 75) return "Opady Śniegu";
                if (code >= 80 && code <= 82) return "Ulewa";
                if (code >= 95 && code <= 99) return "Burza";
                return "Słonecznie";
            }

            async function fetchRealWeather() {
                for (const [city, coords] of Object.entries(cityCoords)) {
                    try {
                        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,is_day,weather_code`);
                        const data = await res.json();
                        if (data && data.current) {
                            const temp = Math.round(data.current.temperature_2m);
                            const icon = getWeatherIcon(data.current.weather_code, data.current.is_day);
                            const desc = getWeatherDesc(data.current.weather_code);
                            realWeatherData[city] = `${icon} ${temp}°C / ${desc}`;
                        }
                    } catch (err) {
                        console.error(`Error fetching weather for ${city}:`, err);
                    }
                }
                updateWeatherDisplay();
            }

            function getDynamicWeatherForCity(city) {
                if (realWeatherData && realWeatherData[city]) {
                    return realWeatherData[city];
                }
                if (typeof getWeatherPreset === "function") {
                    return getWeatherPreset(city);
                }
                return "☀️ 24°C / Słonecznie";
            }

function getWeatherPreset(city) {
                const hour = new Date().getHours();
                if (hour >= 5 && hour < 18) {
                    const dayPresets = {
                        "WARSZAWA": "☀️ 24°C / Słonecznie",
                        "KRAKÓW": "☀️ 25°C / Słonecznie",
                        "OSTROWIEC ŚW.": "🌤️ 23°C / Lekkie Chmury",
                        "GDAŃSK": "🌊 21°C / Wietrznie",
                        "STALOWA WOLA": "☀️ 24°C / Ciepło",
                        "WROCŁAW": "☀️ 26°C / Słonecznie",
                        "POZNAŃ": "☀️ 24°C / Bezchmurnie"
                    };
                    return dayPresets[city] || "☀️ 24°C / Słonecznie";
                } else if (hour >= 18 && hour < 22) {
                    const eveningPresets = {
                        "WARSZAWA": "🌇 20°C / Pogodny Wieczór",
                        "KRAKÓW": "🌇 21°C / Ciepły Zmierzch",
                        "OSTROWIEC ŚW.": "☁️ 19°C / Rześki Wieczór",
                        "GDAŃSK": "🌊 18°C / Rześki Wiatr",
                        "STALOWA WOLA": "🌇 20°C / Spokojny Wieczór",
                        "WROCŁAW": "🌇 22°C / Ciepły Zmierzch",
                        "POZNAŃ": "🌇 20°C / Bezchmurnie"
                    };
                    return eveningPresets[city] || "🌇 20°C / Pogodny Wieczór";
                } else {
                    const nightPresets = {
                        "WARSZAWA": "🌙 16°C / Gwieździsta Noc",
                        "KRAKÓW": "🌙 17°C / Czyste Niebo",
                        "OSTROWIEC ŚW.": "🌙 15°C / Chłodna Noc",
                        "GDAŃSK": "🌙 14°C / Nadmorska Noc",
                        "STALOWA WOLA": "🌙 15°C / Spokojna Noc",
                        "WROCŁAW": "🌙 17°C / Ciepła Noc",
                        "POZNAŃ": "🌙 16°C / Bezchmurnie"
                    };
                    return nightPresets[city] || "🌙 15°C / Spokojna Noc";
                }
            }

            // Load and build news marquee text dynamically from news.json
            async function loadNewsMarquee() {
                const marqueeTextEl = document.getElementById("marqueeText");
                if (!marqueeTextEl) return;
                
                const greetingsText = `<span class="ticker-announcement">ZA CHWILĘ: GŁOS WIDZÓW 📺</span> <span class="ticker-highlight-msg">💬 Pozdrawiamy wszystkich uczestników wspólnej modlitwy! Niech ten dzień przyniesie Wam Boży pokój ~Redakcja CC &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; 💬 Dziękujemy za Wasze wiadomości i codzienne wsparcie naszej misji. Jesteście wspaniali! ~Zespół Christian Culture</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;

                const defaultMissionText = `
                    ${greetingsText}
                     <span style="background: #dc143c; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-family: 'Montserrat', sans-serif; margin-right: 15px; display: inline-block;">🇵🇱 PILNE WEZWANIE DO MODLITWY 🙏🔥</span> 
                    <span style="background: #FFCC00; color: #000000; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-family: 'Montserrat', sans-serif; margin-right: 15px; display: inline-block;">WWW.POLSKIERADIO.CC | CCLITE.PL</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    📧 NAPISZ DO NAS: <strong>polskiercctv@gmail.com</strong> | <strong>radiochristianculture@gmail.com</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    📖 BEZPŁATNA BIBLIA DLA KAŻDEGO — wyślij SMS o treści: <strong>BIBLIA</strong> pod numer <strong>507 821 789</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    📱 DOŁĄCZ NA WHATSAPP — szczegóły w bocznej ramce &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    💳 WESPRZYJ MISJĘ — Patronite: patronite.pl/osobowoscplus &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    🙏 Dziękujemy za każde wsparcie i modlitwę! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    ${greetingsText}
                     <span style="background: #dc143c; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-family: 'Montserrat', sans-serif; margin-right: 15px; display: inline-block;">🇵🇱 PILNE WEZWANIE DO MODLITWY 🙏🔥</span> 
                `;
                
                try {
                    const res = await fetch("news.json?t=" + new Date().getTime());
                    const headlines = await res.json();
                    if (headlines && headlines.length > 0) {
                        const newsMarqueeBlock = headlines.map(h => `⚡ ${h}`).join(" &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ");
                        // Display core mission text first, then follow with world news, then output news source attribution
                        marqueeTextEl.innerHTML = `
                            ${defaultMissionText}
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <span style="background: #FF9900; color: #000000; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-family: 'Montserrat', sans-serif; margin-right: 15px; display: inline-block;">WIADOMOŚCI POLSKA I ŚWIAT</span> 
                            ${newsMarqueeBlock}
                            &nbsp;&nbsp;&nbsp;&nbsp; <span style="color: var(--breakfast-accent); font-weight: 800;">(Źródło: WP Wiadomości)</span>
                        `;
                    } else {
                        marqueeTextEl.innerHTML = defaultMissionText;
                    }
                } catch (err) {
                    console.warn("Could not load news.json, using default mission marquee:", err);
                    marqueeTextEl.innerHTML = defaultMissionText;
                }
            }

            // Loop to show/hide the large QR code sidecar panel next to weather/CTA widgets
            function runQrSidecarLoop() {
                const qrSidecar = document.getElementById("qrSidecar");
                if (!qrSidecar) return;

                function showSidecar() {
                    qrSidecar.classList.add("active");
                    // Stay visible for 25 seconds, then hide
                    setTimeout(hideSidecar, 25000);
                }

                function hideSidecar() {
                    qrSidecar.classList.remove("active");
                    // Stay hidden for 65 seconds, then show again
                    setTimeout(showSidecar, 65000);
                }

                // Initial trigger: stays hidden for 45 seconds on start, then appears
                setTimeout(showSidecar, 45000);
            }

            // Weather forecast city rotation simulation
            const weatherCitiesList = ["WARSZAWA", "KRAKÓW", "OSTROWIEC ŚW.", "GDAŃSK", "STALOWA WOLA", "WROCŁAW", "POZNAŃ"];
            let cityIdx = 0;

            function updateWeatherDisplay() {
                const cityName = weatherCitiesList[cityIdx];
                const weatherBox = document.getElementById("weatherBox");
                const weatherIcon = document.querySelector(".weather-icon");
                if (weatherBox) {
                    const desc = getDynamicWeatherForCity(cityName);
                    weatherBox.innerHTML = `
                        <span class="weather-city">${cityName}</span>
                        <span class="weather-temp-desc">${desc}</span>
                    `;
                    
                    if (weatherIcon) {
                        weatherIcon.className = "fa-solid weather-icon"; // Reset
                        if (desc.includes("☀️")) {
                            weatherIcon.classList.add("fa-sun");
                        } else if (desc.includes("🌤️") || desc.includes("☁️")) {
                            weatherIcon.classList.add("fa-cloud-sun");
                        } else if (desc.includes("🌇") || desc.includes("🌊")) {
                            weatherIcon.classList.add("fa-mountain-sun");
                        } else if (desc.includes("🌙")) {
                            weatherIcon.classList.add("fa-moon");
                        } else {
                            weatherIcon.classList.add("fa-cloud");
                        }
                    }
                }
            }
            updateWeatherDisplay(); // Initial load run

            setInterval(() => {
                const weatherBox = document.getElementById("weatherBox");
                if (weatherBox) {
                    weatherBox.style.opacity = "0";
                    weatherBox.style.transform = "translateY(-10px)";
                    weatherBox.style.transition = "all 0.5s ease";

                    setTimeout(() => {
                        cityIdx = (cityIdx + 1) % weatherCitiesList.length;
                        updateWeatherDisplay();
                        weatherBox.style.opacity = "1";
                        weatherBox.style.transform = "translateY(0)";
                    }, 500);
                }
            }, 8000);

            // Load saved settings
            if (safeStorage.getItem("dzj_stream_day")) {
                currentDayIndex = parseInt(safeStorage.getItem("dzj_stream_day"), 10);
            }
            if (safeStorage.getItem("dzj_stream_image")) {
                customImgSrc = safeStorage.getItem("dzj_stream_image");
                bgImageSelect.value = customImgSrc;
                bgActiveImg.src = getDynamicBackground(customImgSrc);
            } else {
                bgActiveImg.src = getDynamicBackground(customImgSrc);
            }
            if (safeStorage.getItem("dzj_stream_video")) {
                customVideoSrc = safeStorage.getItem("dzj_stream_video");
                bgVideoSelect.value = customVideoSrc;
            }
            if (safeStorage.getItem("dzj_stream_duration")) {
                slideDurationMs = parseInt(safeStorage.getItem("dzj_stream_duration"), 10) * 1000;
                slideDurationInput.value = slideDurationMs / 1000;
            }

            // Apply body styling mode class based on selected background
            function applyBodyModeClass() {
                document.body.classList.remove("mode-presenters", "mode-studio", "evening-layout", "special-event-today");
                
                const currentBg = bgActiveImg.src.substring(bgActiveImg.src.lastIndexOf('/') + 1);
                
                // 1. Special Event Layouts
                if (currentBg.includes("zjednoczeni_za_polske_banner") || customImgSrc.includes("zjednoczeni_za_polske_banner")) {
                    document.body.classList.add("special-event-today", "evening-layout", "mode-presenters");
                    return;
                }
                

                // Night background (CCTV_NOCA 21:00-06:00) - use evening-layout, not za-polske-wallpaper
                if (currentBg.includes("CCTV_NOCA") || customImgSrc.includes("CCTV_NOCA")) {
                    document.body.classList.add("mode-presenters", "evening-layout");
                    return;
                }
                
                                if (currentBg.includes("tapeta_modlitwa") || customImgSrc.includes("tapeta_modlitwa") || currentBg.includes("Tapeta_ZaPolske") || customImgSrc.includes("Tapeta_ZaPolske") ) {
                    document.body.classList.add("special-event-today", "mode-presenters", "za-polske-wallpaper");
                    return;
                }
                
                // 2. Standard Presenters auto-rotation layout
                if (currentBg.includes("presenters") || customImgSrc.includes("presenters") || currentBg.includes("a0kKB")) {
                    document.body.classList.add("mode-presenters");
                    
                    // evening presenters mockup places presenter Sara/Noemi on the right, so cards must go left.
                    // daytime presenters are on the left, so cards must go right.
                    if (currentBg.includes("evening") || customImgSrc.includes("evening")) {
                        document.body.classList.add("evening-layout");
                    }
                } else {
                    // Studio backgrounds
                    document.body.classList.add("mode-studio");
                    
                    const hour = new Date().getHours();
                    const isEveningOrNight = (hour >= 18 || hour < 5);
                    if (isEveningOrNight) {
                        document.body.classList.add("evening-layout");
                    }
                }
            }
            applyBodyModeClass();

            // Save Operator config
            /* Operator reload removed */ if (false) {
                safeStorage.setItem("dzj_stream_day", daySelect.value);
                safeStorage.setItem("dzj_stream_image", bgImageSelect.value);
                safeStorage.setItem("dzj_stream_video", bgVideoSelect.value);
                safeStorage.setItem("dzj_stream_duration", slideDurationInput.value);

                window.location.reload();
            });

            // Video Engine
            const v1 = document.getElementById("bg-video-1");
            const v2 = document.getElementById("bg-video-2");
            let activeVideo = v1;
            let inactiveVideo = v2;
            let isVideoTransitioning = false;

            function checkVideoProgress() {
                if (this !== activeVideo) return;
                const remaining = this.duration - this.currentTime;
                if (remaining <= 2.0 && !isVideoTransitioning && this.duration > 0) {
                    isVideoTransitioning = true;
                    inactiveVideo.currentTime = 0;
                    inactiveVideo.play().then(() => {
                        activeVideo.style.opacity = 0;
                        inactiveVideo.style.opacity = 1;
                        setTimeout(() => {
                            activeVideo.pause();
                            const temp = activeVideo;
                            activeVideo = inactiveVideo;
                            inactiveVideo = temp;
                            isVideoTransitioning = false;
                        }, 1500);
                    }).catch(e => {
                        console.warn(e);
                        isVideoTransitioning = false;
                    });
                }
            }

                        // Background Init
            // Background Init
            function initBackground() {
                const activeBg = getActiveBackground();
                if (bgActiveImg) {
                    bgActiveImg.src = activeBg;
                    bgActiveImg.style.opacity = 1;
                }
                applyBodyModeClass();
            }

            // Compiler of raw reflection string to slide objects
            function buildSlides(reflection) {
                if (!reflection) return null;

                let cycleTitle = "MISJA BOŻE WAKACJE";
                
                const dayNumMatch = reflection.id.match(/ref_day(\d+)/);
                const dayNum = dayNumMatch ? dayNumMatch[1] : (reflectionsData.indexOf(reflection) + 1);
                
                // Format the Sunday agenda widget dynamically
                const agendaActive = document.getElementById("sched-name");
                if (agendaActive) {
                    agendaActive.textContent = reflection.title;
                    agendaActive.dataset.customized = "true";
                }
                cycleBadge.textContent = `Dzień ${dayNum} | ${cycleTitle}`;

                const text = reflection.fullText;

                
                function cleanMarkdown(str) {
                    return str
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .trim();
                }

                // Check if text is a dialogue script
                const isDialogue = text.includes("Noemi") || text.includes("Sara");

                if (isDialogue) {
                    const slides = [];
                    const messages = [];
                    
                    // Split dialogue script into individual lines instead of ### slides
                    const rawLines = text.split("\n").map(s => s.trim()).filter(s => s.length > 0);
                    
                    let currentSender = "";
                    let currentMsgText = "";

                    function commitMessage() {
                        if (currentSender && currentMsgText.trim()) {
                            messages.push({
                                sender: currentSender,
                                text: cleanMarkdown(currentMsgText.trim())
                            });
                            currentMsgText = "";
                        }
                    }

                    rawLines.forEach(line => {
                        // Transform section tags into visual cues (Skip displaying to viewers)
                        if (line.startsWith("###")) {
                            commitMessage();
                            return;
                        }

                        // Production notes (Skip displaying to viewers)
                        if (line.startsWith("[") && line.endsWith("]")) {
                            commitMessage();
                            return;
                        }

                        // Scripture citations
                        if (line.startsWith(">")) {
                            commitMessage();
                            const citation = line.replace(/^>\s*/, "").trim();
                            messages.push({
                                sender: "PISMO ŚWIĘTE",
                                text: `<div class="bible-citation">${cleanMarkdown(citation)}</div>`
                            });
                            return;
                        }

                        // Dialogue lines
                        const speakerMatch = line.match(/^(?:\*\*)?(Noemi|Sara|Gł?os Prowadzą?cych|Noemi i Sara)(?:\*\*)?\s*(\([.*?\)])?\s*(?::\*\*|\*\*:|:)?\s*(.*)/i);
                        if (speakerMatch) {
                            commitMessage();
                            currentSender = speakerMatch[1].trim();
                            currentMsgText = speakerMatch[3].trim();
                        } else {
                            if (currentSender) {
                                currentMsgText += "\n" + line;
                            }
                        }
                    });
                    commitMessage();

                    // Generate a single giant slide that loops
                    slides.push({
                        type: "chat",
                        tag: "PROGRAM EMISYJNY TV",
                        title: reflection.title,
                        messages: messages,
                        l3Title: reflection.title,
                        l3Desc: "TELEWIZJA CHRISTIAN CULTURE 24"
                    });

                    return slides;
                } else {
                    // Fallback to standard paragraph slides
                    const slides = [];
                    const rawParagraphs = text.split("\n").map(p => p.trim()).filter(p => p.length > 0);
                    
                    let introText = [];
                    let bibleQuote = "";
                    let zadanieText = "";
                    let modlitwaText = "";
                    let blogoslawienstwoText = "";

                    let captureState = "intro";

                    rawParagraphs.forEach(para => {
                        const cleanPara = para.toLowerCase();
                        if (cleanPara.startsWith("jezus mówi dziś") || cleanPara.startsWith("jezus mowila") || cleanPara.includes("jezus mówi")) {
                            captureState = "bible";
                            return;
                        }
                        if (cleanPara.startsWith("zadanie taktyczne:") || cleanPara.startsWith("zadanie:")) {
                            captureState = "zadanie";
                            return;
                        }
                        if (cleanPara.startsWith("modlitwa bojowa:") || cleanPara.startsWith("modlitwa:")) {
                            captureState = "modlitwa";
                            return;
                        }
                        if (cleanPara.startsWith("błogosławieństwo:") || cleanPara.startsWith("blogoslawienstwo:")) {
                            captureState = "blogoslawienstwo";
                            return;
                        }
                        if (cleanPara.includes("dziękuję, że jesteś") || cleanPara.startsWith("baza i wzrost") || cleanPara.startsWith("sms:") || cleanPara.startsWith("apps:") || cleanPara.includes("podaj dalej")) {
                            return;
                        }

                        if (captureState === "intro") {
                            introText.push(para);
                        } else if (captureState === "bible") {
                            bibleQuote += para + " ";
                        } else if (captureState === "zadanie") {
                            zadanieText += para + " ";
                        } else if (captureState === "modlitwa") {
                            modlitwaText += para + " ";
                        } else if (captureState === "blogoslawienstwo") {
                            blogoslawienstwoText += para + " ";
                        }
                    });

                    function cleanTeaserText(str) {
                        if (!str) return "";
                        return str.replace(/Dzień\s+(\d+)\s*-\s*\*?\*?Dzień\s+\1\s*-\s*\*?\*?/gi, "Dzień $1 - ");
                    }

                    // Slide 1: Welcome & Teaser
                    slides.push({
                        type: "content",
                        tag: "Dzień dzisiejszy",
                        title: reflection.title,
                        text: cleanMarkdown(cleanTeaserText(reflection.teaser)),
                        l3Title: "ROZWAŻANIE DNIA",
                        l3Desc: reflection.title
                    });

                    // Slide 2+: Intro paragraphs
                    for (let i = 0; i < introText.length; i += 2) {
                        const chunk = introText.slice(i, i + 2).join("<br><br>");
                        slides.push({
                            type: "content",
                            tag: "Słowo Wprowadzenia",
                            title: "Duchowy Horyzont",
                            text: cleanMarkdown(chunk),
                            l3Title: "GŁÓWNE ROZWAŻANIE",
                            l3Desc: reflection.title
                        });
                    }

                    // Slide Quote
                    if (bibleQuote) {
                        slides.push({
                            type: "content",
                            tag: "Słowo Pana",
                            title: "Jezus mówi do Ciebie",
                            text: `<div class="bible-citation">${cleanMarkdown(bibleQuote)}</div>`,
                            l3Title: "SŁOWO Z PISMA ŚWIĘTEGO",
                            l3Desc: (new Date().getHours() < 12 ? "Ewangelia Poranka" : (new Date().getHours() < 18 ? "Ewangelia na Popołudnie" : "Ewangelia na Wieczór"))
                        });
                    }

                    // Slide Zadanie Taktyczne
                    if (zadanieText) {
                        slides.push({
                            type: "content",
                            tag: "Zadanie Taktyczne",
                            title: "Praktyka i Czyn",
                            text: `<strong>Wytyczne do działania na dzisiaj:</strong><br>${cleanMarkdown(zadanieText)}`,
                            l3Title: "MISJA PORANKA",
                            l3Desc: "Czas wdrożyć wiarę w konkretne czyny"
                        });
                    }

                    // Slide Modlitwa / Błogosławieństwo
                    const finalTexts = [];
                    if (modlitwaText) finalTexts.push(`<strong>Modlitwa:</strong> ${cleanMarkdown(modlitwaText)}`);
                    if (blogoslawienstwoText) finalTexts.push(`<strong>Błogosławieństwo:</strong> ${cleanMarkdown(blogoslawienstwoText)}`);

                    if (finalTexts.length > 0) {
                        slides.push({
                            type: "content",
                            tag: "Zabezpieczenie Dnia",
                            title: "Oręż Modlitewny",
                            text: finalTexts.join("<br><br>"),
                            l3Title: "MODLITWA & BŁOGOSŁAWIEŃSTWO",
                            l3Desc: "Podsumowanie programu"
                        });
                    }

                    return slides;
                }
            }

            // Prompter Scrolling System
            let autoScrollTimeout = null;
            let autoScrollAnimationFrame = null;

            function scrollPrompter(container) {
                if (autoScrollTimeout) clearTimeout(autoScrollTimeout);
                if (autoScrollAnimationFrame) cancelAnimationFrame(autoScrollAnimationFrame);

                container.scrollTop = 0;

                // Wait 4 seconds at the top before starting
                autoScrollTimeout = setTimeout(() => {
                    const scrollHeight = container.scrollHeight;
                    const clientHeight = container.clientHeight;
                    const maxScroll = scrollHeight - clientHeight;
                    if (maxScroll <= 0) return;

                    // Steady teleprompter speed: ~25 pixels per second
                    const speed = 25; 
                    const duration = (maxScroll / speed) * 1000;
                    const startTime = performance.now();

                    function prompterStep(timestamp) {
                        const elapsed = timestamp - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        container.scrollTop = maxScroll * progress;

                        if (progress < 1) {
                            autoScrollAnimationFrame = requestAnimationFrame(prompterStep);
                        } else {
                            // Reached the bottom! Pause for 6 seconds, then loop back to top
                            autoScrollTimeout = setTimeout(() => {
                                scrollPrompter(container);
                            }, 6000);
                        }
                    }
                    autoScrollAnimationFrame = requestAnimationFrame(prompterStep);
                }, 4000);
            }

            function adaptTextToTimeOfDay(text) {
                const hour = new Date().getHours();
                let slotText = "w porannym paśmie";
                let greetingText = "Dzień dobry";

                if (hour >= 12 && hour < 18) {
                    slotText = "w popołudniowym paśmie";
                    greetingText = "Dzień dobry";
                } else if (hour >= 18 && hour < 22) {
                    slotText = "w wieczornym paśmie";
                    greetingText = "Dobry wieczór";
                } else if (hour >= 22 || hour < 5) {
                    slotText = "w nocnym paśmie";
                    greetingText = "Dobry wieczór";
                }

                return text
                    .replace(/w porannym paśmie|w popołudniowym paśmie|w wieczornym paśmie|w nocnym paśmie/gi, slotText)
                    .replace(/Dzień dobry|Dobry wieczór|Dobrej nocy/gi, greetingText);
            }

            // Render reflections into slides
            function renderReflection(reflection) {
                activeReflectionObj = reflection;
                const structuredSlides = buildSlides(reflection);
                if (!structuredSlides || structuredSlides.length === 0) return;

                slidesContainer.innerHTML = "";
                slidePagination.innerHTML = "";

                structuredSlides.forEach((slideData, idx) => {
                    const slideEl = document.createElement("div");
                    slideEl.className = `canvas-slide ${idx === 0 ? 'active' : ''}`;
                    
                    if (slideData.type === "chat") {
                        let chatHTML = `
                            <div class="slide-tag"><i class="fa-solid fa-comments"></i> <span>${slideData.tag}</span></div>
                            <div class="slide-title" style="font-size: 1.90rem; margin-bottom: 12px; font-family: 'Cinzel', serif;">${slideData.title}</div>
                            <div class="chat-container">
                        `;
                        slideData.messages.forEach(msg => {
                            let isNoemi = msg.sender.toLowerCase().includes("noemi");
                            let isSara = msg.sender.toLowerCase().includes("sara");
                            let isBoth = msg.sender.toLowerCase().includes("głos") || msg.sender.toLowerCase().includes("razem") || msg.sender.toLowerCase().includes("prowadzących") || msg.sender.toLowerCase().includes("noemi i sara");
                            let isProduction = msg.sender.toLowerCase().includes("produkcja") || msg.sender.toLowerCase().includes("oprawa");
                            let isScripture = msg.sender.toLowerCase().includes("pismo") || msg.sender.toLowerCase().includes("święte");
                            
                            let avatar = isNoemi ? 'avatar_noemi.jpg' : (isSara ? 'avatar_sara.jpg' : '');
                            let senderClass = isNoemi ? 'noemi' : (isSara ? 'sara' : (isBoth ? 'both' : (isProduction ? 'production' : (isScripture ? 'both' : ''))));
                            
                            // Adapt greeting and slot to time of day
                            const adaptedText = adaptTextToTimeOfDay(msg.text);

                            chatHTML += `
                                <div class="chat-bubble-row ${senderClass}">
                                    ${avatar ? `<img class="chat-avatar" src="${avatar}" alt="${msg.sender}">` : ''}
                                    <div class="chat-bubble">
                                        ${(!isProduction && !isScripture) ? `<div class="chat-sender-name">${msg.sender}</div>` : ''}
                                        <div class="chat-message-text">${adaptedText}</div>
                                    </div>
                                </div>
                            `;
                        });
                        chatHTML += `</div>`;
                        slideEl.innerHTML = chatHTML;
                    } else {
                        slideEl.innerHTML = `
                            <div class="slide-tag"><i class="fa-solid fa-mug-hot"></i> <span>${slideData.tag}</span></div>
                            <div class="slide-text-scroll-wrap" style="flex: 1; overflow-y: auto; padding-right: 8px; margin-top: 10px; width: 100%;">
                                <div class="slide-title" style="margin-bottom: 15px;">${slideData.title}</div>
                                <div class="slide-text">${adaptTextToTimeOfDay(slideData.text)}</div>
                            </div>
                        `;
                    }
                    slidesContainer.appendChild(slideEl);

                    const dotEl = document.createElement("div");
                    dotEl.className = `pagination-dot ${idx === 0 ? 'active' : ''}`;
                    slidePagination.appendChild(dotEl);
                });

                activeSlideIndex = 0;
                if (slideInterval) clearInterval(slideInterval);

                const domSlides = document.querySelectorAll(".canvas-slide");
                const domDots = document.querySelectorAll(".pagination-dot");

                // Prompter scrolling trigger
                function triggerSlideScroll(index) {
                    const activeSlide = domSlides[index];
                    if (!activeSlide) return;
                    const scrollContainer = activeSlide.querySelector(".chat-container") || activeSlide.querySelector(".slide-text-scroll-wrap");
                    if (scrollContainer) {
                        scrollPrompter(scrollContainer);
                    }
                }

                // Initial scroll execution
                triggerSlideScroll(0);

                // Slide rotation only runs if there are multiple slides (standard text reflections)
                if (domSlides.length > 1) {
                    slideInterval = setInterval(() => {
                        const bumper = document.getElementById("tvBumperOverlay");
                        const activeBg = document.getElementById("bg-img-active");
                        const bgVid1 = document.getElementById("bg-video-1");
                        const bgVid2 = document.getElementById("bg-video-2");

                        // 1. Trigger full-screen bumper and blur background presenters
                        // if (bumper) bumper.classList.add("active"); // Disabled big logo bumper
                        // Disabled background blur transition
                        // Disabled background blur transition
                        // Disabled background blur transition

                        // 2. Swap the slide content at 800ms (completely covered)
                        setTimeout(() => {
                            domSlides[activeSlideIndex].classList.remove("active");
                            domDots[activeSlideIndex].classList.remove("active");

                            activeSlideIndex = (activeSlideIndex + 1) % domSlides.length;

                            domSlides[activeSlideIndex].classList.add("active");
                            domDots[activeSlideIndex].classList.add("active");

                            triggerSlideScroll(activeSlideIndex);
                        }, 800);

                        // 3. Fade out bumper at 1800ms
                        setTimeout(() => {
                            if (bumper) bumper.classList.remove("active");
                        }, 1800);

                        // 4. Fully remove background blur at 2500ms
                        setTimeout(() => {
                            if (activeBg) activeBg.classList.remove("blurred");
                            if (bgVid1) bgVid1.classList.remove("blurred");
                            if (bgVid2) bgVid2.classList.remove("blurred");
                        }, 2500);
                    }, slideDurationMs);
                }
            }

            // Dynamic CTA Rotation System
            function initCtaRotation() {
                const slides = document.querySelectorAll(".cta-slide");
                const iconEl = document.getElementById("ctaIcon");
                if (slides.length === 0) return;
                
                const icons = [
                    "fa-envelope-open-text",
                    "fa-envelope-open-text",
                    "fa-envelope-open-text",
                    "fa-thumbs-up",
                    "fa-comment",
                    "fa-share-nodes",
                    "fa-bell",
                    "fa-bag-shopping",
                    "fa-youtube",
                    "fa-comment-sms",
                    "fa-comment-sms",
                    "fa-comments",
                    "fa-quote-left",
                    "fa-calendar-check"
                ];
                
                let currentIdx = 0;
                
                setInterval(() => {
                    // Remove active class from current slide
                    slides[currentIdx].classList.remove("active");
                    
                    // Move to next slide
                    currentIdx = (currentIdx + 1) % slides.length;
                    
                    // Rotate and change icon with a quick scale animation
                    if (iconEl) {
                        iconEl.style.transform = "scale(0) rotate(-45deg)";
                        setTimeout(() => {
                            iconEl.className = `fa-solid ${icons[currentIdx]} cta-icon-inner`;
                            iconEl.style.transform = "scale(1) rotate(0deg)";
                        }, 300);
                    }
                    // Add active class to new slide
                    slides[currentIdx].classList.add("active");
                }, 12000); // Rotate every 12 seconds
            }
            initCtaRotation();

            // Features 4 & 6: International Calendar Day & Studio Atmospheric Lighting Day-Sync
            // Zoom Ad Override Cycle Logic
            function initZoomAdCycle() {
                // Disabled for worship live scene
                return;
            }
            // initZoomAdCycle();


            function initDaySyncFeatures() {
                const now = new Date();
                const hour = now.getHours();
                const dayOfMonth = now.getDate();

                // 1. Feature 4: International Calendar Days (STRICTLY NO CATHOLIC SAINTS)
                const calendarSlideText = document.getElementById("calendarSlideText");
                if (calendarSlideText) {
                    const intlDays = [
                        "Międzynarodowy Dzień Radości ☀️",
                        "Światowy Dzień Pokoju i Nadziei 🕊️",
                        "Dzień Wdzięczności i Dobroci 💖",
                        "Światowy Dzień Przyjaźni i Braterstwa 🤝",
                        "Dzień Światła i Prawdy ✨",
                        "Światowy Dzień Życzliwości i Uśmiechu 😊",
                        "Międzynarodowy Dzień Wiary i Wolności 🕊️"
                    ];
                    const chosenDay = intlDays[dayOfMonth % intlDays.length];
                    calendarSlideText.innerHTML = `DZIŚ OBCHODZIMY: <strong>${chosenDay}</strong>`;
                }

                // 2. Feature 6: Dynamic Studio Atmosphere Day-Sync Lighting
                const ambientPulse = document.querySelector(".ambient-pulse-layer");
                const sunbeams = document.querySelector(".sunbeams");

                if (ambientPulse) {
                    if (hour >= 5 && hour < 9) {
                        // Poranek: Warm Sunrise Golden Aura
                        ambientPulse.style.background = "radial-gradient(circle at 50% 40%, rgba(255, 190, 0, 0.14), transparent 70%)";
                        if (sunbeams) sunbeams.style.background = "linear-gradient(135deg, rgba(255, 204, 0, 0.12) 0%, transparent 55%)";
                    } else if (hour >= 9 && hour < 18) {
                        // Dzień: Daylight Clear Sky Blue Glow
                        ambientPulse.style.background = "radial-gradient(circle at 50% 40%, rgba(0, 162, 255, 0.11), transparent 70%)";
                        if (sunbeams) sunbeams.style.background = "linear-gradient(135deg, rgba(0, 200, 255, 0.08) 0%, transparent 55%)";
                    } else if (hour >= 18 && hour < 22) {
                        // Wieczór: Deep Sunset Amber & Violet Glow
                        ambientPulse.style.background = "radial-gradient(circle at 50% 40%, rgba(255, 115, 0, 0.15), transparent 70%)";
                        if (sunbeams) sunbeams.style.background = "linear-gradient(135deg, rgba(255, 100, 0, 0.10) 0%, transparent 55%)";
                    } else {
                        // Noc: Starlight Indigo Aura
                        ambientPulse.style.background = "radial-gradient(circle at 50% 40%, rgba(100, 120, 255, 0.12), transparent 70%)";
                        if (sunbeams) sunbeams.style.background = "linear-gradient(135deg, rgba(120, 140, 255, 0.06) 0%, transparent 55%)";
                    }
                }
            }
            initDaySyncFeatures();

            // Cascading 1-Item Program Dnia Schedule Rotation System
            function initScheduleCascadingRotation() {
                const items = document.querySelectorAll(".sched-item-slide");
                if (items.length <= 1) return;

                let currentSchedIdx = 0;

                setInterval(() => {
                    const prevIdx = currentSchedIdx;
                    currentSchedIdx = (currentSchedIdx + 1) % items.length;

                    // Fade out & slide up current schedule item
                    items[prevIdx].style.opacity = "0";
                    items[prevIdx].style.transform = "translateY(-25px)";
                    items[prevIdx].classList.remove("active");

                    setTimeout(() => {
                        // Reset position below
                        items[prevIdx].style.transform = "translateY(25px)";

                        // Fade in & slide up to active position next schedule item
                        items[currentSchedIdx].classList.add("active");
                        items[currentSchedIdx].style.opacity = "1";
                        items[currentSchedIdx].style.transform = "translateY(0)";
                    }, 400);

                }, 6500); // Cascades to next schedule item every 6.5 seconds
            }
            initScheduleCascadingRotation();

            // Dynamic Ticker Flipper Rotation (3D flip between large brand logo and edition text)
            function initTickerFlipper() {
                const flipper = document.getElementById("tickerFlipper");
                const popupTab = document.getElementById("tickerPopupTab");
                if (!flipper) return;
                
                const announcements = [
                    "ZA CHWILĘ: POZDROWIENIA OD WIDZÓW",
                    "NASTĘPNE: SERWIS INFORMACYJNY 📰",
                    "ZA CHWILĘ: OFERTA SPECJALNA 🎁",
                    "ZA CHWILĘ: POZDROWIENIA OD WIDZÓW",
                    "NASTĘPNE: WESPRZYJ MISJĘ ❤️"
                ];
                let currentAnnIdx = 0;
                
                setInterval(() => {
                    const isFlipped = flipper.classList.toggle("flipped");
                    
                    if (isFlipped && popupTab) {
                        popupTab.textContent = announcements[currentAnnIdx];
                        currentAnnIdx = (currentAnnIdx + 1) % announcements.length;
                        popupTab.classList.add("show");
                        
                        setTimeout(() => {
                            popupTab.classList.remove("show");
                        }, 4500); // Tab stays up for 4.5 seconds while logo is hidden
                    }
                }, 8000); // Toggle flip state every 8 seconds
            }

            // Load database with cache buster
            fetch("rozwazania_baza.json?t=" + new Date().getTime())
                .then(res => res.json())
                .then(data => {
                    reflectionsData = data;
                    if (reflectionsData.length === 0) return;

                    // Populate select list
                    daySelect.innerHTML = "";
                    reflectionsData.forEach((ref, idx) => {
                        const dayLabel = ref.id.replace("ref_day", "Dzień ").replace("ref_", "");
                        const dateLabel = ref.date ? ` (${ref.date})` : "";
                        const opt = document.createElement("option");
                        opt.value = idx;
                        opt.textContent = `${dayLabel}: ${ref.title}${dateLabel}`;
                    daySelect.appendChild(opt);
                    });

                    if (currentDayIndex >= reflectionsData.length) {
                        currentDayIndex = 0;
                    }
                    daySelect.value = currentDayIndex;

                    // Match today's date if no manual index override is saved
                    const todayStr = new Date().toISOString().split('T')[0];
                    const foundIdx = reflectionsData.findIndex(r => r.date === todayStr);
                    let matchedIdx = (foundIdx !== -1) ? foundIdx : currentDayIndex;
                    if (daySelect && matchedIdx !== undefined) daySelect.value = matchedIdx;

                    renderReflection(reflectionsData[matchedIdx] || reflectionsData[reflectionsData.length - 1] || reflectionsData[0]);
                    initBackground();
                    initCtaRotation();
                    initTickerFlipper();
                    fetchRealWeather();
                    setInterval(fetchRealWeather, 900000); // Refresh weather from API every 15 minutes
                    loadNewsMarquee();
                    setInterval(loadNewsMarquee, 600000); // Refresh news headlines every 10 minutes
                    runQrSidecarLoop(); // Start weather/Patronite QR sidecar loop
                })
                .catch(err => {
                    console.error("Error loading reflections:", err);
                    document.querySelector(".slide-title").textContent = "Błąd Bazy Danych";
                    document.querySelector(".slide-text").textContent = "Nie udało się wczytać pliku rozważań. Upewnij się, że plik rozwazania_baza.json istnieje.";
                });
        });
    