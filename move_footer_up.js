const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

const pushUpCSS = `
        /* --- Move ticker elements ABOVE the 21:9 letterbox --- */
        footer {
            transform: translateY(-128px);
        }
        .ticker-popup-tab {
            transform: translateY(-128px); /* Default transform state will be updated */
        }
        
        /* The popup tab uses transform for its animation, so we must override its closed/open states instead */
`;

// Wait, ticker-popup-tab uses transform: translateY(100%) for animation!
// So I should NOT use transform on it. I must use `bottom`.

const properPushUpCSS = `
        /* --- Move ticker elements ABOVE the 21:9 letterbox --- */
        footer {
            margin-bottom: 128px !important;
        }
        .ticker-popup-tab {
            bottom: 213px !important; /* 85px footer + 128px bar */
        }
`;

html = html.replace('</style>', properPushUpCSS + '\n        </style>');
fs.writeFileSync('cctv24-worship.html', html);
console.log("Footer moved up above cinema bar.");
