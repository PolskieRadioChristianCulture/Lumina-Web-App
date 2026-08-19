const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// 21:9 on 1920x1080:
// Content height = 1920 / 2.333 = ~823px
// Bars = (1080 - 823) / 2 = ~128px each
// z-index MUST be between bg layers (z-index 1-2) and content (z-index 3+)
// We use z-index: 4 so bars sit ABOVE background but BELOW header/main/footer

const cinemaCSS = `
        /* ====================================================
           CINEMATIC 21:9 ULTRA-WIDE LETTERBOX
           128px bars top+bottom — z-index 4 (above bg, below content)
        ==================================================== */
        .cinema-bar {
            position: absolute;
            left: 0;
            right: 0;
            height: 128px;
            z-index: 4;
            pointer-events: none;
        }
        .cinema-bar-top {
            top: 0;
            background: linear-gradient(
                180deg,
                #000000 0%,
                #000000 70%,
                rgba(20, 12, 0, 0.92) 88%,
                rgba(212, 175, 55, 0.06) 100%
            );
        }
        .cinema-bar-top::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(212, 175, 55, 0.5) 25%,
                rgba(255, 215, 100, 0.9) 50%,
                rgba(212, 175, 55, 0.5) 75%,
                transparent 100%
            );
            animation: gold-shimmer 4s ease-in-out infinite alternate;
        }
        .cinema-bar-bottom {
            bottom: 0;
            background: linear-gradient(
                0deg,
                #000000 0%,
                #000000 70%,
                rgba(20, 12, 0, 0.92) 88%,
                rgba(212, 175, 55, 0.06) 100%
            );
        }
        .cinema-bar-bottom::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(212, 175, 55, 0.5) 25%,
                rgba(255, 215, 100, 0.9) 50%,
                rgba(212, 175, 55, 0.5) 75%,
                transparent 100%
            );
            animation: gold-shimmer 4s ease-in-out infinite alternate;
        }
        @keyframes gold-shimmer {
            0%   { opacity: 0.3; }
            100% { opacity: 1.0; }
        }
`;

html = html.replace('</style>', cinemaCSS + '\n        </style>');

// Inject bars AFTER the bg images but BEFORE the app-frame div
// They will sit between background and content layers
const barsHtml = `
        <!-- Cinematic 21:9 Letterbox Bars (z-index 4, above bg, below content) -->
        <div class="cinema-bar cinema-bar-top"></div>
        <div class="cinema-bar cinema-bar-bottom"></div>
`;

// Insert after bg-img-swap line
html = html.replace(
    '<video id="bg-video-1"',
    barsHtml + '\n        <video id="bg-video-1"'
);

fs.writeFileSync('cctv24-worship.html', html);
console.log("Cinema bars added correctly (below content layer).");
