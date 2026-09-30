const fs = require('fs');
const path = require('path');

// 1. lumina.html
const luminaPath = path.resolve('lumina.html');
let lumina = fs.readFileSync(luminaPath, 'utf8');

const oldHeroRegex = /\.hero-section\s*\{[\s\S]*?padding:\s*24px 20px 18px;\s*\}\s*\/\*[\s\S]*?\*\/\s*\.hero-bg\s*\{[\s\S]*?z-index:\s*1;\s*\}/;

const newHeroCSS = `.hero-section {
            position: relative;
            overflow: visible !important;
            z-index: 5;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            min-height: 330px;
            background-color: transparent;
            padding: 20px 20px 0;
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
            height: 520px;
            object-fit: cover;
            object-position: center top;
            -webkit-mask-image: linear-gradient(
                to bottom,
                #000 0%,
                #000 42%,
                rgba(0,0,0,0.85) 58%,
                rgba(0,0,0,0.4) 75%,
                rgba(0,0,0,0.1) 88%,
                transparent 98%
            );
            mask-image: linear-gradient(
                to bottom,
                #000 0%,
                #000 42%,
                rgba(0,0,0,0.85) 58%,
                rgba(0,0,0,0.4) 75%,
                rgba(0,0,0,0.1) 88%,
                transparent 98%
            );
            display: block;
        }
        .hero-bg::after {
            content: '';
            position: absolute;
            inset: 0;
            background: 
                radial-gradient(ellipse 90% 70% at 50% 20%, transparent 45%, rgba(10, 10, 15, 0.5) 80%, #0A0A0F 98%),
                linear-gradient(
                    to bottom,
                    rgba(10, 10, 15, 0.25) 0%,
                    transparent 12%,
                    transparent 40%,
                    rgba(10, 10, 15, 0.35) 55%,
                    rgba(10, 10, 15, 0.7) 70%,
                    rgba(10, 10, 15, 0.95) 85%,
                    #0A0A0F 95%
                );
            pointer-events: none;
            z-index: 1;
        }`;

if (!oldHeroRegex.test(lumina)) {
  console.error('ERROR: oldHeroRegex did not match in lumina.html');
  process.exit(1);
}
lumina = lumina.replace(oldHeroRegex, newHeroCSS);

// Cards section & carousel container padding
const oldCardsRegex = /(\/\* ─+ CARDS SECTION ─+ \*\/\r?\n\s*\.cards-section\s*\{[\s\S]*?padding-top:\s*)[0-9]+px;/;
if (oldCardsRegex.test(lumina)) {
  lumina = lumina.replace(oldCardsRegex, '$10;');
}

const oldCarouselRegex = /(\.carousel-container\s*\{[\s\S]*?margin-top:\s*)[0-9]+px;/;
if (oldCarouselRegex.test(lumina)) {
  lumina = lumina.replace(oldCarouselRegex, '$10;');
}

fs.writeFileSync(luminaPath, lumina, 'utf8');
console.log('✅ Successfully updated lumina.html with seamless fade and framed faces');

// 2. lumina-responsive-reset.css
const resetPath = path.resolve('lumina-responsive-reset.css');
let resetCss = fs.readFileSync(resetPath, 'utf8');

const oldMobileHeroRegex = /\.hero-section\s*\{[\s\S]*?min-height:\s*380px\s*!important;\s*padding:\s*28px 14px 14px\s*!important;/;
if (oldMobileHeroRegex.test(resetCss)) {
  resetCss = resetCss.replace(
    oldMobileHeroRegex,
    `.hero-section {\n        min-height: 350px !important;\n        padding: 20px 14px 0 !important;`
  );
}

fs.writeFileSync(resetPath, resetCss, 'utf8');
console.log('✅ Successfully updated lumina-responsive-reset.css');