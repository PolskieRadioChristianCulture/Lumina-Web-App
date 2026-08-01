const fs = require('fs');
let html = fs.readFileSync('zapolske-live.html', 'utf8');

// 1. Replace CSS
const cssStart = '/* --- FOOTER DYNAMIC TICKER --- */';
const cssEnd = '@keyframes logo-gradient-shift {';
const newCss = `/* --- NEW TV24 CC TICKER SYSTEM --- */
        .tv24-ticker-system {
            position: relative;
            z-index: 100;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 0 40px 20px 40px;
            font-family: 'Oswald', 'Inter', sans-serif;
            box-sizing: border-box;
        }

        .ticker-badges-row {
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin-bottom: -15px;
            z-index: 101;
            padding: 0 10px;
            pointer-events: none;
        }

        .badge-live {
            background: linear-gradient(to bottom, #0d1b2a, #000000);
            border: 2px solid rgba(255, 255, 255, 0.4);
            border-radius: 8px;
            color: #ffffff;
            font-weight: 800;
            font-size: 1.8rem;
            padding: 4px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            letter-spacing: 1px;
        }
        .recording-dot {
            width: 16px;
            height: 16px;
            background: #ff0000;
            border-radius: 50%;
            box-shadow: inset 0 2px 4px rgba(255,255,255,0.4), 0 0 10px rgba(255,0,0,0.8);
            animation: pulse-dot 1.5s infinite alternate;
        }
        @keyframes pulse-dot {
            0% { opacity: 0.5; box-shadow: 0 0 5px rgba(255,0,0,0.5); }
            100% { opacity: 1; box-shadow: 0 0 15px rgba(255,0,0,1); }
        }

        .badge-tv24 {
            display: flex;
            align-items: stretch;
            background: linear-gradient(to bottom, #0d3b66, #001a33);
            border: 2px solid rgba(255, 255, 255, 0.4);
            border-radius: 8px;
            color: #ffffff;
            font-weight: 800;
            font-size: 2.2rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            overflow: hidden;
            line-height: 1;
            padding-left: 12px;
            letter-spacing: -1px;
        }
        .badge-cc {
            background: linear-gradient(to bottom, #cc0000, #800000);
            padding: 4px 12px;
            margin-left: 10px;
            height: 100%;
            display: flex;
            align-items: center;
            border-left: 1px solid rgba(255,255,255,0.3);
        }

        .ticker-row {
            display: flex;
            width: 100%;
            gap: 4px;
            height: 55px;
        }
        .bottom-row {
            height: 55px;
        }

        .ticker-box {
            border: 2px solid rgba(255, 255, 255, 0.6);
            border-radius: 6px;
            display: flex;
            align-items: center;
            box-shadow: inset 0 0 10px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.5);
            overflow: hidden;
            box-sizing: border-box;
        }

        .weather-box {
            background: linear-gradient(to right, #0a4f8f, #052a4f);
            width: 280px;
            flex-shrink: 0;
            padding: 0 15px;
            justify-content: space-between;
            color: white;
        }
        .weather-icon-small {
            font-size: 2.2rem;
            color: #FFD700;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        }
        .weather-data {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            line-height: 1.1;
        }
        .w-city {
            font-size: 1.0rem;
            font-weight: 700;
            letter-spacing: 1px;
        }
        .w-temp {
            font-size: 2.0rem;
            font-weight: 900;
        }

        .news-box {
            flex-grow: 1;
            display: flex;
            align-items: stretch;
            background: linear-gradient(to bottom, #111, #000);
        }
        .polska-news {
            background: linear-gradient(to bottom, #a00000, #500000);
        }
        .swiat-news {
            background: linear-gradient(to bottom, #001f4d, #000d26);
        }
        .news-label {
            background: rgba(255,255,255,0.1);
            color: white;
            font-size: 1.8rem;
            font-weight: 800;
            padding: 0 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            white-space: nowrap;
            border-right: 2px solid rgba(255,255,255,0.3);
            letter-spacing: 1px;
            z-index: 2;
        }
        .pl-flag {
            width: 24px;
            height: 16px;
            background: linear-gradient(to bottom, #fff 50%, #dc143c 50%);
            border: 1px solid rgba(0,0,0,0.5);
            border-radius: 2px;
        }
        .marquee-container {
            flex-grow: 1;
            overflow: hidden;
            position: relative;
            display: flex;
            align-items: center;
        }
        .marquee-text {
            display: inline-block;
            white-space: nowrap;
            font-size: 1.9rem;
            font-weight: 600;
            color: #ffffff;
            padding-left: 100%;
            animation: marquee-scroll 45s linear infinite;
        }
        .currency-box, .market-box {
            background: linear-gradient(to bottom, #081122, #02050a);
            width: 280px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            line-height: 1.1;
            padding: 5px 0;
        }
        .box-title {
            font-size: 1.0rem;
            font-weight: 700;
            letter-spacing: 1px;
            color: rgba(255,255,255,0.8);
            text-transform: uppercase;
        }
        .box-value {
            font-size: 1.8rem;
            font-weight: 900;
            color: #FFCC00;
            display: flex;
            gap: 10px;
            align-items: baseline;
        }
        .market-box .box-value {
            color: #ffffff;
        }
        .trend-down {
            color: #ff3333;
            font-size: 1.3rem;
            font-weight: 800;
        }
        .trend-up {
            color: #33ff33;
            font-size: 1.3rem;
            font-weight: 800;
        }
        @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
        }

        @keyframes logo-gradient-shift {`;

if (html.includes(cssStart) && html.includes(cssEnd)) {
    html = html.substring(0, html.indexOf(cssStart)) + newCss + html.substring(html.indexOf(cssEnd) + cssEnd.length);
    console.log('CSS replaced');
} else {
    console.log('CSS anchors not found');
}

// 2. Replace HTML
const htmlStart = '<!-- Footer Ticker -->';
const htmlEnd = '<!-- Full-Screen TV Bumper/Transition Overlay -->';
const newHtml = `<!-- New tv24 CC Ticker System -->
            <footer class="tv24-ticker-system">
                <div class="ticker-badges-row">
                    <div class="badge-live">LIVE <span class="recording-dot"></span></div>
                    <div class="badge-tv24">tv24 <span class="badge-cc">CC</span></div>
                </div>
                
                <div class="ticker-row top-row">
                    <div class="ticker-box weather-box">
                        <div class="weather-icon-small"><i class="fa-solid fa-cloud-sun-rain"></i></div>
                        <div class="weather-data">
                            <div class="w-city">WARSZAWA</div>
                            <div class="w-temp">22°C</div>
                        </div>
                    </div>
                    <div class="ticker-box news-box polska-news">
                        <div class="news-label"><div class="pl-flag"></div> POLSKA:</div>
                        <div class="marquee-container">
                            <span class="marquee-text" id="newsPolska">
                                Polska wezwała ambasadora Wielkiej Brytanii po ataku na polską ciężarówkę w Darfurze • Prezydent Nawrocki na ceremonii wręczenia odznak honorowych w Belwederze • Godzina W - syreny w Warszawie o 17:00
                            </span>
                        </div>
                    </div>
                </div>

                <div class="ticker-row bottom-row">
                    <div class="ticker-box currency-box">
                        <div class="box-title">WALUTY</div>
                        <div class="box-value">3,742 <span class="trend-down">▼ -0.2%</span></div>
                    </div>
                    <div class="ticker-box news-box swiat-news">
                        <div class="news-label"><i class="fa-solid fa-globe"></i> ŚWIAT:</div>
                        <div class="marquee-container">
                            <span class="marquee-text" id="newsSwiat">
                                USA i Izrael rozważają ataki na irański program nuklearny • Rosja ostrzelała Charków rakietami w ciągu dnia • Silne trzęsienie w Turcji (Stambuł) - dzwonki alarmowe
                            </span>
                        </div>
                    </div>
                    <div class="ticker-box market-box">
                        <div class="box-title">MARKET INDEX</div>
                        <div class="box-value">3 920 <span class="trend-up">▲ +0.3%</span></div>
                    </div>
                </div>
            </footer>

            `;

if (html.includes(htmlStart) && html.includes(htmlEnd)) {
    html = html.substring(0, html.indexOf(htmlStart)) + newHtml + html.substring(html.indexOf(htmlEnd));
    console.log('HTML replaced');
} else {
    console.log('HTML anchors not found');
}

// Remove old initTickerFlipper logic
const jsStart = 'function initTickerFlipper() {';
const jsEnd = 'initTickerFlipper();';
if (html.includes(jsStart)) {
    // just comment out the body of the function
    html = html.replace('function initTickerFlipper() {', 'function initTickerFlipper() { return; ');
    console.log('JS neutralized');
}

fs.writeFileSync('zapolske-live.html', html);
