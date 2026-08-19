const fs = require('fs');
let html = fs.readFileSync('zapolske-live.html', 'utf8');

const animations = 
        @keyframes slideUpIn {
            0% { transform: translateY(100px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes premiumShimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        @keyframes premiumGlow {
            0% { box-shadow: 0 0 10px rgba(255,255,255,0.2); }
            50% { box-shadow: 0 0 20px rgba(255,255,255,0.6); }
            100% { box-shadow: 0 0 10px rgba(255,255,255,0.2); }
        }
;
html = html.replace('/* --- NEW TV24 CC TICKER SYSTEM --- */', '/* --- NEW TV24 CC TICKER SYSTEM --- */\n' + animations);

html = html.replace('.tv24-ticker-system {', '.tv24-ticker-system {\n              animation: slideUpIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n              will-change: transform;');

html = html.replace('background: linear-gradient(to right, #438fc7, #134e87);', 'background: linear-gradient(to right, rgba(67,143,199,0.75), rgba(19,78,135,0.75));\n              backdrop-filter: blur(12px);\n              -webkit-backdrop-filter: blur(12px);\n              box-shadow: inset 0 1px 1px rgba(255,255,255,0.4), 0 4px 15px rgba(0,0,0,0.5);');

html = html.replace('background: linear-gradient(to bottom, #111, #000);', 'background: linear-gradient(to bottom, rgba(17,17,17,0.75), rgba(0,0,0,0.85));\n              backdrop-filter: blur(12px);\n              -webkit-backdrop-filter: blur(12px);\n              box-shadow: inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 15px rgba(0,0,0,0.5);');

html = html.replace('background: linear-gradient(to bottom, #b31616, #5d0202);', 'background: linear-gradient(to bottom, rgba(179,22,22,0.8), rgba(93,2,2,0.9));\n              backdrop-filter: blur(12px);\n              -webkit-backdrop-filter: blur(12px);\n              box-shadow: inset 0 1px 1px rgba(255,255,255,0.3), 0 4px 15px rgba(0,0,0,0.5);');

html = html.replace('.currency-box, .market-box {', '.currency-box, .market-box {\n              background: linear-gradient(to bottom, rgba(2,18,55,0.75), rgba(1,9,27,0.85));\n              backdrop-filter: blur(12px);\n              -webkit-backdrop-filter: blur(12px);\n              box-shadow: inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 15px rgba(0,0,0,0.5);');

html = html.replace('.news-label {', '.news-label {\n              background: linear-gradient(90deg, #fff 0%, #ccc 40%, #fff 50%, #ccc 60%, #fff 100%);\n              background-size: 200% auto;\n              color: transparent;\n              -webkit-background-clip: text;\n              background-clip: text;\n              animation: premiumShimmer 4s linear infinite;');

html = html.replace('.box-title {', '.box-title {\n              background: linear-gradient(90deg, #a8c0ff 0%, #3f2b96 40%, #a8c0ff 50%, #3f2b96 60%, #a8c0ff 100%);\n              background-size: 200% auto;\n              color: transparent;\n              -webkit-background-clip: text;\n              background-clip: text;\n              animation: premiumShimmer 5s linear infinite reverse;');

html = html.replace('.marquee-text {', '.marquee-text {\n              transform: translate3d(0,0,0);\n              will-change: transform;\n              text-shadow: 1px 1px 3px rgba(0,0,0,0.8);');

html = html.replace('.badge-live {', '.badge-live {\n              animation: premiumGlow 3s infinite;');

fs.writeFileSync('zapolske-live.html', html, 'utf8');
