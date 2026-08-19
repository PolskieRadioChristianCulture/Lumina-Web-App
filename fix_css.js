const fs = require('fs');
let html = fs.readFileSync('zapolske-live.html', 'utf8');

const animations = 
        @keyframes slideUpIn {
            0% { transform: translateY(150px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes premiumShimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        @keyframes premiumGlow {
            0% { box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.2); }
            50% { box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 25px rgba(255,255,255,0.7); }
            100% { box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.2); }
        }
;
html = html.replace('/* --- NEW TV24 CC TICKER SYSTEM --- */', '/* --- NEW TV24 CC TICKER SYSTEM --- */\n' + animations);

html = html.replace(
.tv24-ticker-system {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 100;
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 0 40px 15px 40px;
            font-family: 'Outfit', 'Inter', sans-serif;
            box-sizing: border-box;
        },
.tv24-ticker-system {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 100;
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 0 40px 15px 40px;
            font-family: 'Outfit', 'Inter', sans-serif;
            box-sizing: border-box;
            animation: slideUpIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            will-change: transform;
        }
);

html = html.replace(
.badge-live {
            background: #021237;
            border: 2px solid #fff;
            border-radius: 8px;
            color: #ffffff;
            font-weight: 800;
            font-size: 1.8rem;
            padding: 6px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        },
.badge-live {
            background: rgba(2, 18, 55, 0.85);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 2px solid #fff;
            border-radius: 8px;
            color: #ffffff;
            font-weight: 800;
            font-size: 1.8rem;
            padding: 6px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            animation: premiumGlow 4s infinite;
        }
);

html = html.replace(
.ticker-box {
            border: 2px solid #fff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            box-shadow: inset 0 2px 10px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.4);
            overflow: hidden;
            box-sizing: border-box;
        },
.ticker-box {
            border: 2px solid #fff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            box-shadow: inset 0 2px 10px rgba(255,255,255,0.2), 0 6px 15px rgba(0,0,0,0.6);
            overflow: hidden;
            box-sizing: border-box;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
);

html = html.replace(
.weather-box {
            background: linear-gradient(to right, #438fc7, #134e87);
            width: 250px;
            flex-shrink: 0;
            padding: 0 16px;
            justify-content: space-between;
            color: white;
        },
.weather-box {
            background: linear-gradient(to right, rgba(67, 143, 199, 0.75), rgba(19, 78, 135, 0.75));
            width: 250px;
            flex-shrink: 0;
            padding: 0 16px;
            justify-content: space-between;
            color: white;
        }
);

html = html.replace(
.news-box {
            flex-grow: 1;
            display: flex;
            align-items: stretch;
            background: linear-gradient(to bottom, #111, #000);
        }
        .polska-news {
            background: linear-gradient(to bottom, #b31616, #5d0202);
        }
        .swiat-news {
            background: linear-gradient(to bottom, #0d3663, #021124);
        },
.news-box {
            flex-grow: 1;
            display: flex;
            align-items: stretch;
            background: linear-gradient(to bottom, rgba(17, 17, 17, 0.75), rgba(0, 0, 0, 0.85));
        }
        .polska-news {
            background: linear-gradient(to bottom, rgba(179, 22, 22, 0.8), rgba(93, 2, 2, 0.9));
        }
        .swiat-news {
            background: linear-gradient(to bottom, rgba(13, 54, 99, 0.75), rgba(2, 17, 36, 0.85));
        }
);

html = html.replace(
.news-label {
            color: white;
            font-size: 1.6rem;
            font-weight: 800;
            padding: 0 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            white-space: nowrap;
            letter-spacing: 0.5px;
            z-index: 2;
        },
.news-label {
            color: transparent;
            background: linear-gradient(90deg, #fff 0%, #ccc 40%, #fff 50%, #ccc 60%, #fff 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            animation: premiumShimmer 4s linear infinite;
            font-size: 1.6rem;
            font-weight: 800;
            padding: 0 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            white-space: nowrap;
            letter-spacing: 0.5px;
            z-index: 2;
        }
);

html = html.replace(
.marquee-text {
            display: inline-block;
            white-space: nowrap;
            font-size: 1.6rem;
            font-weight: 600;
            color: #ffffff;
            padding-left: 100%;
            animation: marquee-scroll 40s linear infinite;
        },
.marquee-text {
            display: inline-block;
            white-space: nowrap;
            font-size: 1.6rem;
            font-weight: 600;
            color: #ffffff;
            padding-left: 100%;
            animation: marquee-scroll 40s linear infinite;
            transform: translate3d(0, 0, 0);
            will-change: transform;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
        }
);

html = html.replace(
.currency-box, .market-box {
            width: 250px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            line-height: 1.15;
            padding: 4px 0;
            background: #021237;
        },
.currency-box, .market-box {
            width: 250px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            line-height: 1.15;
            padding: 4px 0;
            background: linear-gradient(to bottom, rgba(2, 18, 55, 0.75), rgba(1, 9, 27, 0.85));
        }
);

html = html.replace(
.box-title {
            font-size: 1.0rem;
            font-weight: 700;
            letter-spacing: 1px;
            color: #c0c0c0;
            text-transform: uppercase;
        },
.box-title {
            font-size: 1.0rem;
            font-weight: 700;
            letter-spacing: 1px;
            color: transparent;
            background: linear-gradient(90deg, #a8c0ff 0%, #3f2b96 40%, #a8c0ff 50%, #3f2b96 60%, #a8c0ff 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            animation: premiumShimmer 5s linear infinite reverse;
            text-transform: uppercase;
        }
);

fs.writeFileSync('zapolske-live.html', html, 'utf8');
