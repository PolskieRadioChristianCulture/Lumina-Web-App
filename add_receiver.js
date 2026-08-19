const fs = require('fs');
let content = fs.readFileSync('biblia-spiewana-live.html', 'utf8');
content = content.replace('import { collection, query, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";', 'import { collection, doc, query, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";');

const appendCode = `            }\n        });\n\n        // ---------------------------------------------------------\n        // MISSION CONTROL RECEIVER (Global Config)\n        // ---------------------------------------------------------\n        const mcDocRef = doc(db, "mission_control_live", "global_config");\n        onSnapshot(mcDocRef, (docSnap) => {\n            if (docSnap.exists()) {\n                const data = docSnap.data();\n                if (data.tickerMessage && data.tickerMessage.trim() !== "") {\n                    const marqueeText = document.getElementById("marqueeText");\n                    if (marqueeText) marqueeText.innerHTML = data.tickerMessage;\n                }\n                const liveBadges = document.querySelectorAll('.live-badge');\n                liveBadges.forEach(badge => {\n                    if (data.isLive) badge.style.display = 'flex';\n                    else badge.style.display = 'none';\n                });\n                const bgImgActive = document.getElementById("bg-img-active");\n                if (bgImgActive && data.currentBackground) {\n                    if (data.currentBackground === "Noc") bgImgActive.src = "CCTV_NOCA.jpg";\n                    else if (data.currentBackground === "Dzień") bgImgActive.src = "tlo_dla_kanalu_Biblia_Spiewana.jpg";\n                }\n            }\n        });`;

content = content.replace('            }
        });
    </script>', appendCode + '
    </script>');
fs.writeFileSync('biblia-spiewana-live.html', content, 'utf8');