const fs = require('fs');
let html = fs.readFileSync('zapolske-live.html', 'utf8');

// The exact string to remove (with typical indentation)
const blockToRemove =                 if (now.getMonth() === 7 && now.getDate() === 1) {\n                    return "tlo_1_sie_2026.jpg";\n                };

// 1. In updateClock
html = html.replace(
            function updateClock() {
                const now = new Date();
 + blockToRemove,
            function updateClock() {
                const now = new Date();
);

// 2. In updateScheduleNow
html = html.replace(
            (function updateScheduleNow() {
                const now = new Date();
 + blockToRemove,
            (function updateScheduleNow() {
                const now = new Date();
);

// 3. In initDaySyncFeatures
html = html.replace(
            function initDaySyncFeatures() {
                const now = new Date();
 + blockToRemove,
            function initDaySyncFeatures() {
                const now = new Date();
);

fs.writeFileSync('zapolske-live.html', html, 'utf8');
