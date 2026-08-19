const fs = require('fs');
let content = fs.readFileSync('cctv24-worship.html', 'utf8');

// 1. Inject CSS for RDS bar
const rdsCss = `
        /* === RDS Now Playing Bar === */
        .rds-bar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 36px;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
            display: flex;
            align-items: center;
            padding: 0 28px;
            gap: 12px;
            z-index: 100;
            font-family: 'Outfit', sans-serif;
            font-size: 0.78rem;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.55);
        }
        .rds-bar .rds-live {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #ff4d4d;
            font-weight: 700;
            letter-spacing: 3px;
            font-size: 0.7rem;
        }
        .rds-bar .rds-live i {
            font-size: 0.5rem;
            animation: rds-pulse 1.5s infinite alternate;
        }
        @keyframes rds-pulse {
            0% { opacity: 1; }
            100% { opacity: 0.2; }
        }
        .rds-bar .rds-divider {
            color: rgba(255,255,255,0.2);
            font-size: 1rem;
            font-weight: 100;
        }
        .rds-bar .rds-label {
            color: rgba(255,255,255,0.35);
            letter-spacing: 2px;
        }
        .rds-bar .rds-station {
            color: rgba(255, 255, 255, 0.75);
            font-weight: 600;
            letter-spacing: 3px;
        }
        .rds-bar .rds-track {
            color: rgba(255, 255, 255, 0.45);
            font-weight: 300;
            letter-spacing: 1.5px;
            font-style: italic;
        }
        .rds-bar .rds-note {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 5px;
            color: rgba(255,255,255,0.2);
            font-size: 0.65rem;
        }
`;

content = content.replace('</style>', rdsCss + '\n        </style>');

// 2. Inject the HTML for the RDS bar right after <body> (before id="app-container")
const rdsHtml = `
        <!-- RDS Now Playing Bar -->
        <div class="rds-bar">
            <span class="rds-live"><i class="fa-solid fa-circle"></i> LIVE</span>
            <span class="rds-divider">|</span>
            <span class="rds-label">Now playing on</span>
            <span class="rds-station">Christian Culture Music</span>
            <span class="rds-divider">·</span>
            <span class="rds-track" id="rds-track-name">Instrumental Worship 24/7</span>
            <span class="rds-note"><i class="fa-solid fa-music"></i> polskieradio.cc</span>
        </div>
`;

content = content.replace('<div id="app-container">', rdsHtml + '\n    <div id="app-container">');

// 3. Push app-container down so RDS bar doesn't overlap it
const pushCss = `
        /* Offset app-container for RDS bar */
        #app-container {
            margin-top: 36px !important;
        }
`;
content = content.replace('</style>', pushCss + '\n        </style>');

fs.writeFileSync('cctv24-worship.html', content);
console.log("RDS bar added successfully.");
