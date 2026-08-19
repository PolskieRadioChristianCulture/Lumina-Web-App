import re

with open(r'C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\cctv24-worship.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS Variables
content = re.sub(
    r'--gold-primary: #a855f7;.*?--red-live: #a855f7;',
    r'''--gold-primary: #D4AF37; /* Elegant Gold */
            --gold-light: #ffffff;
            --gold-dark: #AA7C11;
            --bg-dark: #050508; /* Deeper black */
            --text-light: #ffffff;
            --glass-bg: rgba(10, 10, 15, 0.35); /* Cinematic glass */
            --glass-border: rgba(255, 255, 255, 0.08); /* Subtler border */
            --glass-shadow: rgba(0, 0, 0, 0.3);
            --breakfast-accent: #D4AF37;
            --red-live: rgba(255, 255, 255, 0.15);''',
    content,
    flags=re.DOTALL
)

# 2. Hide unwanted widgets in CSS
hide_css = """
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
            background: transparent;
            border: none;
            box-shadow: none;
            padding: 0;
            margin-bottom: 20px;
            justify-content: flex-start;
        }
        .card-clock-time { font-weight: 300; font-size: 4rem; }
        .card-clock-date { border-left: none; opacity: 0.5; font-weight: 400; padding-left: 0; margin-left: 20px; }

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
            border: 1px solid rgba(255,255,255,0.2);
            color: #fff !important;
            box-shadow: none !important;
            font-weight: 400 !important;
            font-size: 0.9rem !important;
            animation: none !important;
        }
        .live-badge i { color: #ff4d4d; animation: pulse-live 2s infinite alternate; }
"""

content = content.replace('</style>', hide_css + '\n    </style>')

# Replace marquee text to be more music focused
new_marquee = """<span class="ticker-announcement">TERAZ GRAMY</span> <span class="ticker-highlight-msg">Instrumental Worship Music 24/7 • Dobrze, że jesteś</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="ticker-announcement">WESPRZYJ NAS</span> <span class="ticker-highlight-msg">Zostań patronem: patronite.pl/osobowoscplus</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="ticker-announcement">DOŁĄCZ DO NAS</span> <span class="ticker-highlight-msg">Subskrybuj kanał, aby otrzymywać powiadomienia o nowych utworach.</span>"""

content = re.sub(
    r'<span class="ticker-marquee-text" id="marqueeText">.*?</span>',
    f'<span class="ticker-marquee-text" id="marqueeText">{new_marquee}</span>',
    content,
    flags=re.DOTALL
)

with open(r'C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\cctv24-worship.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Modification complete.")
