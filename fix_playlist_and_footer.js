const fs = require('fs');

// ============================================================
// 1. RENAME PLAYLIST TRACKS with beautiful musical titles
// ============================================================
const playlist = JSON.parse(fs.readFileSync('worship_playlist.json', 'utf8'));

const beautifulTitles = {
  "CCM (1)":  "Przy Jego Tronie",
  "CCM (2)":  "Duch Świętości",
  "CCM (3)":  "Cisza Serca",
  "CCM (4)":  "W Jego Obecności",
  "CCM (5)":  "Modlitwa Poranna",
  "CCM (6)":  "Blask Wieczności",
  "CCM (7)":  "Uwielbienie",
  "CCM":      "Ku Bożej Chwale",
  "DEEP FOREST 2":  "Głęboki Las II",
  "DEEP FOREST 3":  "Głęboki Las III",
  "DEEP FOREST 4":  "Głęboki Las IV",
  "DEEP FOREST":    "Głęboki Las",
  "Dom z Pasją - podkład (1)":  "Dom z Pasją – Preludium",
  "Dom z pasją - podkład (10)": "Dom z Pasją – Natchnienie",
  "Dom z pasją - podkład (11)": "Dom z Pasją – Chwała",
  "Dom z pasją - podkład (12)": "Dom z Pasją – Spokój",
  "Dom z pasją - podkład (13)": "Dom z Pasją – Modlitwa",
  "Dom z pasją - podkład (14)": "Dom z Pasją – Wieczność",
  "Dom z pasją - podkład (15)": "Dom z Pasją – Finał",
  "Dom z Pasją - podkład (2)":  "Dom z Pasją – Tęsknota",
  "Dom z Pasją - podkład (3)":  "Dom z Pasją – Nadzieja",
  "Dom z Pasją - podkład (4)":  "Dom z Pasją – Wołanie",
  "Dom z Pasją - podkład (5)":  "Dom z Pasją – Łaska",
  "Dom z Pasją - podkład (6)":  "Dom z Pasją – Miłosierdzie",
  "Dom z Pasją - podkład (7)":  "Dom z Pasją – Światłość",
  "Dom z Pasją - podkład (8)":  "Dom z Pasją – Odnowienie",
  "Dom z pasją - podkład (9)":  "Dom z Pasją – Przebudzenie",
  "Dom z Pasją - podkład":      "Dom z Pasją – Uwielbienie",
  "Maj 17":     "17 Maja – Spotkanie z Bogiem",
  "Sardes (1)": "Sardes – Przebudzenie",
  "Sardes":     "Sardes – Powrót do Pierwszej Miłości",
};

playlist.forEach(track => {
  if (beautifulTitles[track.title]) {
    track.title = beautifulTitles[track.title];
  }
  track.artist = "Christian Culture Music";
  track.album  = "Instrumental Worship 24/7";
});

fs.writeFileSync('worship_playlist.json', JSON.stringify(playlist, null, 2));
console.log("Playlist titles updated.");

// ============================================================
// 2. FIX FOOTER CUTOFF — fix app-container height and footer
// ============================================================
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

const footerFix = `
        /* === Fix bottom ticker cutoff === */
        #app-container {
            height: calc(100vh - 36px) !important; /* account for RDS bar */
            min-height: unset !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
        }
        .main-viewport {
            flex: 1 !important;
            min-height: 0 !important;
        }
        footer {
            flex-shrink: 0 !important;
            position: relative !important;
            bottom: unset !important;
            height: 60px !important;
            min-height: 60px !important;
        }
`;

html = html.replace('</style>', footerFix + '\n        </style>');
fs.writeFileSync('cctv24-worship.html', html);
console.log("Footer height fix applied.");
