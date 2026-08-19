const fs = require('fs');

let content = fs.readFileSync('biblia-spiewana-live.html', 'utf8');

// Replace import
content = content.replace(
    'import { collection, query, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";',
    'import { collection, doc, query, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";'
);

const appendCode = `
        // ---------------------------------------------------------
        // MISSION CONTROL RECEIVER (Global Config)
        // ---------------------------------------------------------
        const mcDocRef = doc(db, "mission_control_live", "global_config");
        onSnapshot(mcDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.tickerMessage && data.tickerMessage.trim() !== "") {
                    const marqueeText = document.getElementById("marqueeText");
                    if (marqueeText) marqueeText.innerHTML = data.tickerMessage;
                }
                const liveBadges = document.querySelectorAll('.live-badge');
                liveBadges.forEach(badge => {
                    if (data.isLive) badge.style.display = 'flex';
                    else badge.style.display = 'none';
                });
                const bgImgActive = document.getElementById("bg-img-active");
                if (bgImgActive && data.currentBackground) {
                    if (data.currentBackground === "Noc") bgImgActive.src = "CCTV_NOCA.jpg";
                    else if (data.currentBackground === "Dzień") bgImgActive.src = "tlo_dla_kanalu_Biblia_Spiewana.jpg";
                }
            }
        });
`;

content = content.replace(
    '            }\n        });\n    </script>',
    '            }\n        });\n' + appendCode + '    </script>'
);

fs.writeFileSync('biblia-spiewana-live.html', content, 'utf8');
console.log("Dodano Receiver Mission Control!");
