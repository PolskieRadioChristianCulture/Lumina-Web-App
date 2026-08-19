const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// The bug: we accidentally deleted </style><script> when trying to remove a margin-top block.
// This means the entire HTML document is being treated as part of the <style> tag.
// Let's find exactly where it broke.

// It looks like:
/*
        .rds-bar .rds-note {
            margin-left: auto;
            display: flex;
            align-items: center;
        // initStream in HEAD - global before any onclick fires
        function initStream() {
*/

const searchStr = `        .rds-bar .rds-note {
            margin-left: auto;
            display: flex;
            align-items: center;
        // initStream in HEAD - global before any onclick fires`;

const fixStr = `        .rds-bar .rds-note {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 5px;
            color: rgba(255,255,255,0.2);
            font-size: 0.65rem;
        }

        </style>
    <script>
        // initStream in HEAD - global before any onclick fires`;

if (html.includes(searchStr)) {
    html = html.replace(searchStr, fixStr);
    fs.writeFileSync('cctv24-worship.html', html);
    console.log("Syntax error fixed: </style><script> restored.");
} else {
    console.log("Could not find the exact broken string. Let me search differently.");
    
    // Fallback search:
    const fallbackSearch = `            align-items: center;\r\n        // initStream in HEAD`;
    const fallbackFix = `            align-items: center;\r\n            gap: 5px;\r\n            color: rgba(255,255,255,0.2);\r\n            font-size: 0.65rem;\r\n        }\r\n\r\n        </style>\r\n    <script>\r\n        // initStream in HEAD`;
    if (html.includes(fallbackSearch)) {
        html = html.replace(fallbackSearch, fallbackFix);
        fs.writeFileSync('cctv24-worship.html', html);
        console.log("Fallback syntax error fixed.");
    } else {
        
        // Second fallback
        const fb2S = `            align-items: center;\n        // initStream in HEAD`;
        const fb2F = `            align-items: center;\n            gap: 5px;\n            color: rgba(255,255,255,0.2);\n            font-size: 0.65rem;\n        }\n\n        </style>\n    <script>\n        // initStream in HEAD`;
        if (html.includes(fb2S)) {
            html = html.replace(fb2S, fb2F);
            fs.writeFileSync('cctv24-worship.html', html);
            console.log("Fallback 2 syntax error fixed.");
        } else {
            console.log("STILL COULD NOT FIND IT");
        }
    }
}
