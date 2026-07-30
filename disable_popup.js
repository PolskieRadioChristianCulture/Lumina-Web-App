const fs = require('fs');
const file = 'cctv24-worship.html';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '// Populate text';
const endMarker = '}, 20000); // Show time';

const startIdx = content.indexOf(startMarker);
let endIdx = content.indexOf(endMarker, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    // Include the end marker and following brace/newline
    let nextBraceIdx = content.indexOf('}', endIdx + endMarker.length);
    let fullOldText = content.substring(startIdx, nextBraceIdx + 1);
    
    let replacement = `// (Modlitwa na live instrumentalnym została wyłączona w lewym panelu)
            // Okienko zostało zastąpione zwykłym upływem czasu (aktualizacja tickera działa osobno w tle).
            setTimeout(() => {
                isShowingPrayer = false;
                processQueue();
            }, 1000);
        `;
    
    content = content.replace(fullOldText, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log("SUCCESS: Replaced DOM logic inside processQueue.");
} else {
    console.log("FAIL: Markers not found.", { startIdx, endIdx });
}
