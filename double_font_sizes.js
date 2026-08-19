const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// 1. Double the size of RDS Bar
html = html.replace(/\.rds-bar\s*\{[\s\S]*?\}/, (match) => {
    return match
        .replace(/height: 36px;/, 'height: 56px;')
        .replace(/font-size: 0\.78rem;/, 'font-size: 1.56rem;');
});

html = html.replace(/\.rds-bar \.rds-live\s*\{[\s\S]*?\}/, (match) => {
    return match.replace(/font-size: 0\.7rem;/, 'font-size: 1.4rem;');
});

html = html.replace(/\.rds-bar \.rds-live i\s*\{[\s\S]*?\}/, (match) => {
    return match.replace(/font-size: 0\.5rem;/, 'font-size: 1.0rem;');
});

html = html.replace(/\.rds-bar \.rds-note\s*\{[\s\S]*?\}/, (match) => {
    return match.replace(/font-size: 0\.65rem;/, 'font-size: 1.3rem;');
});

// 2. Double the size of Bottom Ticker
html = html.replace(/\.ticker-marquee-text\s*\{[\s\S]*?\}/g, (match) => {
    return match
        .replace(/font-size: 2\.1rem;/, 'font-size: 4.2rem;')
        .replace(/line-height: 60px !important;/, 'line-height: 90px !important;');
});

html = html.replace(/\.ticker-marquee-wrap\s*\{[\s\S]*?\}/g, (match) => {
    return match.replace(/height: 60px/g, 'height: 90px');
});

html = html.replace(/<div class="ticker-marquee-wrap"[^>]+style="[^"]*height: 60px !important[^"]*"[^>]*>/, (match) => {
    return match.replace(/height: 60px !important/g, 'height: 90px !important');
});


fs.writeFileSync('cctv24-worship.html', html);
console.log("Increased font sizes by 100%.");
