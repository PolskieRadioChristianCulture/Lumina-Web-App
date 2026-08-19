const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// 1. Hide Operator Panel
const hidePanelCSS = `
        /* HIDE OPERATOR PANEL */
        .operator-panel, .toggle-panel-trigger {
            display: none !important;
        }
`;

// We can append this right before </style>
html = html.replace('</style>', hidePanelCSS + '\n        </style>');


// 2. Fix Footer Position to Absolute Bottom
const footerSearch = `        /* --- Ticker elements sit in the black cinema bar --- */
        footer {
            /* Ensure footer is visible ON TOP of the black bar */
            position: relative !important;
            z-index: 100 !important;
        }`;

const footerFix = `        /* --- Ticker elements sit in the black cinema bar --- */
        footer {
            /* PIN FOOTER TO ABSOLUTE BOTTOM TO PREVENT IT FALLING OFF SCREEN */
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            z-index: 100 !important;
        }`;

if (html.includes(footerSearch)) {
    html = html.replace(footerSearch, footerFix);
    console.log("Fixed footer position to absolute bottom.");
} else {
    const normalizedHtml = html.replace(/\r\n/g, '\n');
    const normalizedSearch = footerSearch.replace(/\r\n/g, '\n');
    if (normalizedHtml.includes(normalizedSearch)) {
        html = normalizedHtml.replace(normalizedSearch, footerFix);
        console.log("Fixed footer position to absolute bottom (normalized).");
    } else {
        console.log("COULD NOT FIND FOOTER POSITION BLOCK.");
    }
}

fs.writeFileSync('cctv24-worship.html', html);
console.log("Applied panel hiding and footer absolute positioning.");
