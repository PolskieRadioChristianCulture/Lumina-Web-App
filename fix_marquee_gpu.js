const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// 1. Remove CSS animation from .ticker-marquee-text
const cssSearch = `        .ticker-marquee-text {
            display: inline-block !important; 
            padding-left: 20px !important; 
            white-space: nowrap !important;
            line-height: 60px !important; 
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
        }`;

const cssFix = `        .ticker-marquee-text {
            display: inline-block !important; 
            white-space: nowrap !important;
            line-height: 60px !important; 
        }
        marquee.ticker-marquee-wrap {
            height: 60px !important;
            line-height: 60px !important;
            display: block !important;
            width: 100% !important;
            flex: 1 !important;
        }
        `;

html = html.replace(cssSearch, cssFix);

// Also remove the old animation line if it exists
html = html.replace(/animation:\s*marquee-scroll[^;]+;/g, '');

// 2. Replace <div class="ticker-marquee-wrap"> with <marquee>
// We know exactly what the HTML looks like:
const wrapSearch = `<div class="ticker-marquee-wrap">`;
const wrapFix = `<marquee class="ticker-marquee-wrap" scrollamount="4" scrolldelay="0">`;
html = html.replace(wrapSearch, wrapFix);

// And the closing tag for the wrap.
// We need to find the closing </div> of ticker-marquee-wrap.
// It is right after `</span>` of marqueeText.
const closeSearch = `</span>
                </div>
            </footer>`;
const closeFix = `</span>
                </marquee>
            </footer>`;
html = html.replace(closeSearch, closeFix);

fs.writeFileSync('cctv24-worship.html', html);
console.log("Replaced CSS animation with <marquee> to bypass GPU texture limits.");
