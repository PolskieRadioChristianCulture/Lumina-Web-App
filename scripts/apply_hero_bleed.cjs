const fs = require('fs');
const path = require('path');

// 1. lumina.html
const luminaPath = path.resolve('lumina.html');
let lumina = fs.readFileSync(luminaPath, 'utf8');

const oldHeroRegex = /\.hero-section\s*\{[\s\S]*?background-color:\s*#0b1838;[\s\S]*?\.hero-bg::after\s*\{[\s\S]*?z-index:\s*1;\s*\}/;

const newHeroCSS = `.hero-section {
            position: relative;
            overflow: visible !important;
            z-index: 5;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            min-height: 250px;
            background-color: transparent;
            padding: 24px 20px 18px;
        }

        /* Pełnowymiarowa, kinowa grafika tła wchodząca głęboko pod karuzelę z płynnym, tonalnym przejściem w kolor tła strony */
        .hero-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: calc(100% + 470px);
            background: #0A0A0F url('lumina_hero_bg.jpg?v=20260822') center top / cover no-repeat;
            z-index: 0;
            border-radius: 0;
            overflow: hidden;
            pointer-events: none;
        }
        .hero-bg img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center top;
            display: block;
        }
        .hero-bg::after {
            content: '';
            position: absolute;
            inset: 0;
            background: 
                radial-gradient(ellipse 95% 75% at 50% 30%, transparent 45%, rgba(10, 10, 15, 0.6) 82%, #0A0A0F 100%),
                linear-gradient(
                    to bottom,
                    rgba(10, 10, 15, 0.28) 0%,
                    rgba(10, 10, 15, 0.05) 15%,
                    rgba(10, 10, 15, 0.10) 35%,
                    rgba(10, 10, 15, 0.32) 52%,
                    rgba(10, 10, 15, 0.62) 68%,
                    rgba(10, 10, 15, 0.86) 82%,
                    rgba(10, 10, 15, 0.97) 93%,
                    #0A0A0F 100%
                );
            pointer-events: none;
            z-index: 1;
        }`;

if (!oldHeroRegex.test(lumina)) {
  console.error('ERROR: oldHeroRegex did not match in lumina.html');
  process.exit(1);
}
lumina = lumina.replace(oldHeroRegex, newHeroCSS);

// Cards section z-index
const oldCardsRegex = /(\/\* ─+ CARDS SECTION ─+ \*\/\r?\n\s*\.cards-section\s*\{)([\s\S]*?padding-top:\s*8px;)/;
if (!oldCardsRegex.test(lumina)) {
  console.error('ERROR: oldCardsRegex did not match in lumina.html');
  process.exit(1);
}
lumina = lumina.replace(oldCardsRegex, `$1\n            position: relative;\n            z-index: 10;\n            background: transparent;\n            padding-top: 8px;`);

fs.writeFileSync(luminaPath, lumina, 'utf8');
console.log('✅ Successfully updated lumina.html');

// 2. lumina-responsive-reset.css
const resetPath = path.resolve('lumina-responsive-reset.css');
let resetCss = fs.readFileSync(resetPath, 'utf8');

const oldResetRegex = /\.hero-section\s*\{[\s\S]*?background-color:\s*#0b1838\s*!important;\s*\}\s*\.hero-bg\s*\{[\s\S]*?background-position:\s*center center\s*!important;/;

const newResetCSS = `.hero-section {
        min-height: 380px !important;
        padding: 28px 14px 14px !important;
        background-color: transparent !important;
    }
    .hero-bg {
        background-position: center top !important;`;

if (!oldResetRegex.test(resetCss)) {
  console.error('ERROR: oldResetRegex did not match in lumina-responsive-reset.css');
  process.exit(1);
}
resetCss = resetCss.replace(oldResetRegex, newResetCSS);
fs.writeFileSync(resetPath, resetCss, 'utf8');
console.log('✅ Successfully updated lumina-responsive-reset.css');