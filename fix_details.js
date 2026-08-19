const fs = require('fs');

let content = fs.readFileSync('cctv24-worship.html', 'utf8');

// 1. Change the logo text and add the audio spectrum
const oldBrand = '<i class="fa-solid fa-mug-hot"></i> DOBRZE, ŻE JESTEŚ TV';
const newBrand = `
<div class="audio-spectrum">
    <span></span><span></span><span></span><span></span>
</div>
WORSHIP INSTRUMENTAL CCTV24`;

// Replace the specific text (handling encoding issues by using a more generic regex for the text)
content = content.replace(/<i class="fa-solid fa-mug-hot"><\/i>\s*DOBRZE,.*?TV/i, newBrand);

// Add the CSS for the audio spectrum
const spectrumCSS = `
        /* Audio Spectrum Animation */
        .audio-spectrum {
            display: flex;
            align-items: flex-end;
            gap: 4px;
            height: 24px;
            margin-right: 5px;
        }
        .audio-spectrum span {
            width: 4px;
            background-color: var(--breakfast-accent);
            border-radius: 2px;
            animation: spectrum-bounce 0.8s infinite alternate ease-in-out;
        }
        .audio-spectrum span:nth-child(1) { animation-delay: 0.1s; height: 12px; }
        .audio-spectrum span:nth-child(2) { animation-delay: 0.4s; height: 24px; }
        .audio-spectrum span:nth-child(3) { animation-delay: 0.2s; height: 16px; }
        .audio-spectrum span:nth-child(4) { animation-delay: 0.5s; height: 20px; }
        @keyframes spectrum-bounce {
            0% { height: 6px; }
            100% { height: 24px; }
        }
        
        /* Fix Clock Layout */
        .card-clock-widget {
            display: flex !important;
            align-items: center !important;
            gap: 15px !important;
        }
        .card-clock-time {
            font-size: 5rem !important; 
            letter-spacing: 2px !important;
            text-shadow: 0 4px 15px rgba(0,0,0,0.6) !important;
        }
        .card-clock-date {
            display: flex !important;
            flex-direction: column !important;
            font-size: 1.4rem !important;
            line-height: 1.2 !important;
            text-shadow: 0 2px 10px rgba(0,0,0,0.6) !important;
        }
        
        /* Fix Ticker Visibility */
        .ticker-marquee-wrap {
            display: flex !important;
            align-items: center !important;
            flex: 1 !important;
            width: 100% !important;
            overflow: hidden !important;
        }
        .ticker-marquee-text {
            display: flex !important;
            align-items: center !important;
            padding-left: 100% !important;
        }
`;

content = content.replace('</style>', spectrumCSS + '\n    </style>');

// Write the changes
fs.writeFileSync('cctv24-worship.html', content);
console.log("Fixed details.");
