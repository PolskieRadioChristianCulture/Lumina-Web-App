const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// Wrap marquee in a div to prevent flexbox from collapsing it
const search = `<marquee class="ticker-marquee-wrap" scrollamount="4" scrolldelay="0">`;
const fix = `<div style="flex: 1 !important; width: 100% !important; overflow: hidden !important; height: 60px !important;"><marquee class="ticker-marquee-wrap" scrollamount="4" scrolldelay="0" style="width: 100% !important; height: 100% !important;">`;

const closeSearch = `</marquee>
            </footer>`;
const closeFix = `</marquee></div>
            </footer>`;

html = html.replace(search, fix);
html = html.replace(closeSearch, closeFix);

fs.writeFileSync('cctv24-worship.html', html);
console.log("Wrapped marquee in a div.");
