const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// Replace the HTML <marquee> with a normal <div> and a JS CPU scroller
const search1 = `<div style="flex: 1 !important; width: 100% !important; overflow: hidden !important; height: 60px !important;"><marquee class="ticker-marquee-wrap" scrollamount="4" scrolldelay="0" style="width: 100% !important; height: 100% !important;">`;
const fix1 = `<div class="ticker-marquee-wrap" id="marqueeWrap" style="flex: 1 !important; width: 100% !important; overflow: hidden !important; height: 60px !important; position: relative;">`;

const search2 = `</marquee></div>`;
const fix2 = `</div>`;

html = html.replace(search1, fix1);
html = html.replace(search2, fix2);


// Inject JS scroller logic inside loadNewsMarquee AFTER it sets innerHTML
const search3 = `marqueeTextEl.innerHTML = defaultMissionText;
                    }
                } catch (err) {
                    console.warn("Could not load news.json, using default mission marquee:", err);
                    marqueeTextEl.innerHTML = defaultMissionText;
                }`;

const fix3 = `marqueeTextEl.innerHTML = defaultMissionText;
                    }
                } catch (err) {
                    console.warn("Could not load news.json, using default mission marquee:", err);
                    marqueeTextEl.innerHTML = defaultMissionText;
                }
                
                // Start robust CPU-based JS Scroller to bypass all GPU limits and <marquee> bugs
                if (!window.scrollerStarted) {
                    window.scrollerStarted = true;
                    const wrapEl = document.getElementById("marqueeWrap");
                    let currentLeft = wrapEl ? wrapEl.clientWidth : 1920;
                    
                    // Force text to be absolutely positioned
                    marqueeTextEl.style.position = "absolute";
                    marqueeTextEl.style.left = currentLeft + "px";
                    marqueeTextEl.style.top = "0px";
                    marqueeTextEl.style.transform = "none"; // Disable GPU transform completely
                    marqueeTextEl.style.display = "inline-block";
                    marqueeTextEl.style.whiteSpace = "nowrap";
                    
                    let lastTime = performance.now();
                    
                    function animateScroller(time) {
                        const delta = time - lastTime;
                        lastTime = time;
                        
                        // Move 3 pixels per frame roughly (at 60fps)
                        currentLeft -= (150 * (delta / 1000)); 
                        
                        marqueeTextEl.style.left = currentLeft + "px";
                        
                        const textWidth = marqueeTextEl.scrollWidth;
                        if (currentLeft < -textWidth) {
                            currentLeft = wrapEl.clientWidth;
                        }
                        
                        requestAnimationFrame(animateScroller);
                    }
                    requestAnimationFrame(animateScroller);
                }`;

html = html.replace(search3, fix3);

fs.writeFileSync('cctv24-worship.html', html);
console.log("Applied JS CPU scroller to bypass GPU limits entirely.");
