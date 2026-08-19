const fs = require('fs');

let content = fs.readFileSync('cctv24-worship.html', 'utf8');

const spectrumInjection = `
    <style>
        .wide-spectrum {
            position: absolute;
            bottom: 60px; /* Nad tickerem */
            left: 0;
            width: 100%;
            height: 150px;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            z-index: 5;
            pointer-events: none;
            opacity: 0.15; /* Bardzo subtelne! */
            mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
            -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
        }
        .wide-spectrum .bar {
            flex: 1;
            margin: 0 2px;
            background: #ffffff;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
            animation: wide-bounce 1s infinite alternate ease-in-out;
        }
        @keyframes wide-bounce {
            0% { height: 5%; }
            100% { height: 100%; }
        }
    </style>
    <script>
        (function() {
            const container = document.getElementById('app-container');
            if (container) {
                const spectrum = document.createElement('div');
                spectrum.className = 'wide-spectrum';
                const numBars = 100; // 100 słupków
                for (let i = 0; i < numBars; i++) {
                    const bar = document.createElement('div');
                    bar.className = 'bar';
                    // Losowe opóźnienie i czas trwania dla naturalnego efektu fali
                    bar.style.animationDelay = (Math.random() * 2).toFixed(2) + 's';
                    bar.style.animationDuration = (0.5 + Math.random() * 1.5).toFixed(2) + 's';
                    // Zróżnicowana wysokość maks
                    bar.style.transformOrigin = 'bottom';
                    bar.style.transform = 'scaleY(' + (Math.random() * 0.7 + 0.3).toFixed(2) + ')';
                    spectrum.appendChild(bar);
                }
                container.appendChild(spectrum);
            }
        })();
    </script>
`;

if (!content.includes('wide-spectrum')) {
    content = content.replace('</body>', spectrumInjection + '\n</body>');
    fs.writeFileSync('cctv24-worship.html', content);
    console.log("Wide spectrum added successfully.");
} else {
    console.log("Wide spectrum already exists.");
}
