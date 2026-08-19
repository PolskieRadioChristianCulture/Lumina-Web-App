const fs = require('fs');
let content = fs.readFileSync('cctv24-worship.html', 'utf8');

const cssOverride = `
        /* Better Font for Header Brand */
        .header-brand {
            font-family: 'Outfit', sans-serif !important;
            font-weight: 400 !important;
            letter-spacing: 6px !important;
            font-size: 1.3rem !important;
            text-transform: uppercase !important;
            text-shadow: 0 2px 10px rgba(0,0,0,0.5) !important;
        }
`;

content = content.replace('</style>', cssOverride + '\n    </style>');
fs.writeFileSync('cctv24-worship.html', content);
console.log("Font changed.");
