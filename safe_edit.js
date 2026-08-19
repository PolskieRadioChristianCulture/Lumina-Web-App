const fs = require('fs');

let content = fs.readFileSync('cctv24-worship.html', 'utf8');

// 1. Update CSS Variables
content = content.replace(
    /--gold-primary: #a855f7;[\s\S]*?--red-live: #a855f7;/,
    `--gold-primary: #D4AF37; /* Elegant Gold */
            --gold-light: #ffffff;
            --gold-dark: #AA7C11;
            --bg-dark: #050508; /* Deeper black */
            --text-light: #ffffff;
            --glass-bg: rgba(10, 10, 15, 0.35); /* Cinematic glass */
            --glass-border: rgba(255, 255, 255, 0.08); /* Subtler border */
            --glass-shadow: rgba(0, 0, 0, 0.3);
            --breakfast-accent: #D4AF37;
            --red-live: rgba(255, 255, 255, 0.15);`
);

// 2. Hide unwanted widgets in CSS with !important to defeat any later stylesheets
const hide_css = `
        /* MINIMALIST OVERRIDES */
        .weather-cta-group,
        .schedule-widget,
        .live-helpline-panel,
        .helpline-header-widget,
        .zoom-ad-overlay,
        .ticker-popup-tab {
            display: none !important;
        }

        /* Clean clock */
        .card-clock-widget {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin-bottom: 20px !important;
            justify-content: flex-start !important;
        }
        .card-clock-time { font-weight: 300 !important; font-size: 4rem !important; }
        .card-clock-date { border-left: none !important; opacity: 0.5 !important; font-weight: 400 !important; padding-left: 0 !important; margin-left: 20px !important; }

        /* Ticker redesign */
        footer {
            display: flex !important;
            align-items: center !important;
            background: rgba(0, 0, 0, 0.5) !important;
            backdrop-filter: blur(15px) !important;
            border-top: 1px solid rgba(255,255,255,0.1) !important;
            height: 60px !important;
            padding: 0 40px !important;
            animation: none !important;
        }
        .l3-ticker-header { display: none !important; }
        .ticker-marquee-text { font-size: 1.2rem !important; font-weight: 400 !important; color: rgba(255,255,255,0.7) !important; text-transform: uppercase; letter-spacing: 2px; }
        .ticker-announcement { background: transparent !important; color: #D4AF37 !important; border: none !important; box-shadow: none !important; padding: 0 !important; font-weight: 600 !important; animation: none !important; }
        .ticker-highlight-msg { background: transparent !important; color: #fff !important; border: none !important; box-shadow: none !important; font-weight: 300 !important; }

        /* Live badge redesign */
        .live-badge {
            background: rgba(255,255,255,0.1) !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            color: #fff !important;
            box-shadow: none !important;
            font-weight: 400 !important;
            font-size: 0.9rem !important;
            animation: none !important;
        }
        .live-badge i { color: #ff4d4d !important; animation: pulse-live 2s infinite alternate !important; }
`;

content = content.replace('</style>', hide_css + '\n    </style>');

// 3. Replace marquee text
const new_marquee = '<span class="ticker-announcement">TERAZ GRAMY</span> <span class="ticker-highlight-msg">Instrumental Worship Music 24/7 • Dobrze, że jesteś</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="ticker-announcement">WESPRZYJ NAS</span> <span class="ticker-highlight-msg">Zostań patronem: patronite.pl/osobowoscplus</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="ticker-announcement">DOŁĄCZ DO NAS</span> <span class="ticker-highlight-msg">Subskrybuj kanał, aby otrzymywać powiadomienia o nowych utworach.</span>';

content = content.replace(
    /<span class="ticker-marquee-text" id="marqueeText">[\s\S]*?<\/span>/,
    '<span class="ticker-marquee-text" id="marqueeText">' + new_marquee + '</span>'
);

// 4. Update the img tags for backgrounds to point to the requested images
content = content.replace(
    /<img id="bg-img-active" class="bg-layer bg-image" style="opacity: 1;" src=".*?" alt="Instrumental Worship Studio">/,
    '<img id="bg-img-active" class="bg-layer bg-image" style="opacity: 1;" src="INSTRUMENTAL WORSHIP MUSIC - CHRISTIAN CULTURE.jpg" alt="Instrumental Worship Studio">'
);
content = content.replace(
    /<img id="bg-img-swap"   class="bg-layer bg-image" style="opacity: 0; transition: opacity 2s ease-in-out;" src=".*?" alt="Instrumental Worship Studio 2">/,
    '<img id="bg-img-swap"   class="bg-layer bg-image" style="opacity: 0; transition: opacity 2s ease-in-out;" src="CCTV NOCĄ.jpg" alt="Instrumental Worship Studio 2">'
);

// Remove the tv bumper if we don't want it interrupting music
content = content.replace(
    /id="tvBumperOverlay" class="tv-bumper-overlay"/,
    'id="tvBumperOverlay" class="tv-bumper-overlay" style="display: none !important;"'
);

// 5. Hardcode getDynamicBackground to avoid presenter fallback
content = content.replace(
    /function getDynamicBackground\(imagePath\) \{[\s\S]*?return imagePath;/m,
    `function getDynamicBackground(imagePath) {
                const hour = new Date().getHours();
                if (hour >= 21 || hour < 6) return "CCTV NOCĄ.jpg";
                return "INSTRUMENTAL WORSHIP MUSIC - CHRISTIAN CULTURE.jpg";`
);

// Wipe local storage preference specifically for the background on page load
content = content.replace(
    /function getActiveBackground\(\) \{/,
    `safeStorage.removeItem("dzj_stream_image"); // Force wipe user override
            function getActiveBackground() {`
);

fs.writeFileSync('cctv24-worship.html', content);
console.log("Safely applied all modifications.");
