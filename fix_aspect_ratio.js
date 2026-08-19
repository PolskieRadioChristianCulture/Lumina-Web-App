const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// 1. Remove the broken margin-top and calc-height overrides for app-container
html = html.replace(`
        /* Offset app-container for RDS bar */
        #app-container {
            margin-top: 36px !important;
        }
`, '');

html = html.replace(`
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
`, '');

// 2. Make RDS bar position: fixed so it floats over the scaled 1920×1080 canvas
//    and does NOT affect the layout
html = html.replace(
    '.rds-bar {',
    `.rds-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            pointer-events: none; /* Doesn't block clicks on the canvas below */`
);

// Remove the duplicate position:absolute that was there before
html = html.replace(
    `            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 36px;
            background: rgba(0, 0, 0, 0.65);`,
    `            height: 36px;
            background: rgba(0, 0, 0, 0.65);`
);

fs.writeFileSync('cctv24-worship.html', html);
console.log("Fixed: RDS bar now position:fixed, 16:9 canvas unaffected.");
