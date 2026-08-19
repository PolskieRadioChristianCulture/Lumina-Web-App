const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// 1. Wrap the contents of rds-bar in a scrolling div and give it an ID
html = html.replace(/<div class="rds-bar">([\s\S]*?)<\/div>/, 
`<div class="rds-bar" id="rdsWrap" style="overflow: hidden; display: block; position: absolute; padding: 0;">
            <div id="rdsMarqueeText" style="display: flex; align-items: center; gap: 12px; height: 100%; white-space: nowrap; padding: 0 28px; position: absolute; top: 0;">$1</div>
        </div>`);

// 2. Add the JS scroller for RDS
const rdsScrollerJS = `
                // Start robust CPU-based JS Scroller for RDS Bar
                if (!window.rdsScrollerStarted) {
                    window.rdsScrollerStarted = true;
                    const rdsWrapEl = document.getElementById("rdsWrap");
                    const rdsTextEl = document.getElementById("rdsMarqueeText");
                    
                    if (rdsWrapEl && rdsTextEl) {
                        let currentRdsLeft = rdsWrapEl.clientWidth || 1920;
                        
                        rdsTextEl.style.left = currentRdsLeft + "px";
                        
                        let lastRdsTime = performance.now();
                        
                        function animateRdsScroller(time) {
                            const delta = time - lastRdsTime;
                            lastRdsTime = time;
                            
                            // Move ~100 pixels per second
                            currentRdsLeft -= (100 * (delta / 1000)); 
                            
                            rdsTextEl.style.left = currentRdsLeft + "px";
                            
                            const textWidth = rdsTextEl.scrollWidth;
                            if (currentRdsLeft < -textWidth) {
                                currentRdsLeft = rdsWrapEl.clientWidth || 1920;
                            }
                            
                            requestAnimationFrame(animateRdsScroller);
                        }
                        requestAnimationFrame(animateRdsScroller);
                    }
                }
`;

// Inject the JS scroller into the script block right after the bottom marquee scroller
html = html.replace(/(requestAnimationFrame\(animateScroller\);\s*\n\s*\}\s*\n\s*\})/, `$1\n${rdsScrollerJS}`);

fs.writeFileSync('cctv24-worship.html', html);
console.log("Added RDS scroller logic.");
