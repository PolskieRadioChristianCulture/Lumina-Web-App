const fs = require('fs');

try {
    let content = fs.readFileSync('modlitwa.html', 'utf8');

    const interactionHtml = `
                <!-- Opcje Interakcji -->
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <button onclick="shareUrgentPrayer()" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 10px 20px; border-radius: 50px; cursor: pointer; font-family: 'Outfit', sans-serif; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                        <i class="fa-solid fa-share-nodes"></i> Udostępnij
                    </button>
                    
                    <button onclick="document.querySelector('#prayerForm').scrollIntoView({behavior: 'smooth'})" style="background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.5); color: #d4af37; padding: 10px 20px; border-radius: 50px; cursor: pointer; font-family: 'Outfit', sans-serif; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='rgba(212, 175, 55, 0.25)'" onmouseout="this.style.background='rgba(212, 175, 55, 0.15)'">
                        <i class="fa-solid fa-pen-nib"></i> Napisz swoją modlitwę
                    </button>
                    
                    <button id="prayBtn" onclick="incrementPrayCounter()" style="background: linear-gradient(135deg, #ff4d6d 0%, #dc143c 100%); border: none; color: #fff; padding: 10px 20px; border-radius: 50px; cursor: pointer; font-family: 'Outfit', sans-serif; font-weight: 800; transition: all 0.2s; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(220, 20, 60, 0.3);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        <i class="fa-solid fa-fire"></i> Modlę się
                        <span id="prayCounterBadge" style="background: #fff; color: #dc143c; padding: 2px 8px; border-radius: 12px; font-size: 0.85rem; margin-left: 5px;">142</span>
                    </button>
                </div>
                
                <script>
                    // Initialize counter with a baseline + local storage
                    let baseCounter = parseInt(localStorage.getItem('urgentPrayerCount') || '342');
                    const hasPrayed = localStorage.getItem('hasPrayedUrgent') === 'true';
                    
                    const badge = document.getElementById('prayCounterBadge');
                    const btn = document.getElementById('prayBtn');
                    
                    if (badge) badge.innerText = baseCounter;
                    if (hasPrayed && btn) {
                        btn.style.opacity = '0.7';
                        btn.style.pointerEvents = 'none';
                        btn.innerHTML = '<i class="fa-solid fa-check"></i> Dołączyłeś <span id="prayCounterBadge" style="background: #fff; color: #dc143c; padding: 2px 8px; border-radius: 12px; font-size: 0.85rem; margin-left: 5px;">' + baseCounter + '</span>';
                    }

                    window.incrementPrayCounter = function() {
                        if (localStorage.getItem('hasPrayedUrgent') === 'true') return;
                        
                        baseCounter++;
                        localStorage.setItem('urgentPrayerCount', baseCounter.toString());
                        localStorage.setItem('hasPrayedUrgent', 'true');
                        
                        const b = document.getElementById('prayCounterBadge');
                        const btn = document.getElementById('prayBtn');
                        
                        if (b) {
                            b.innerText = baseCounter;
                        }
                        if (btn) {
                            btn.style.opacity = '0.7';
                            btn.style.pointerEvents = 'none';
                            btn.innerHTML = '<i class="fa-solid fa-check"></i> Dołączyłeś <span id="prayCounterBadge" style="background: #fff; color: #dc143c; padding: 2px 8px; border-radius: 12px; font-size: 0.85rem; margin-left: 5px;">' + baseCounter + '</span>';
                        }
                    }
                    
                    window.shareUrgentPrayer = function() {
                        const text = "🇵🇱 PILNE WEZWANIE DO MODLITWY 🙏🔥\\n\\nDzisiaj o godz. 21:30 spotykamy się na dodatkowej modlitwie online za Polskę. Stajemy w wyłomie!\\n\\nDołącz: https://polskieradio.cc/modlitwa.html";
                        if (navigator.share) {
                            navigator.share({
                                title: 'Zjednoczeni za Polskę',
                                text: text,
                                url: 'https://polskieradio.cc/modlitwa.html'
                            }).catch(console.error);
                        } else {
                            navigator.clipboard.writeText(text);
                            alert("Treść wezwania skopiowana do schowka! Możesz ją wkleić w dowolnym komunikatorze.");
                        }
                    }
                </script>
    `;

    // Replace just after the #ZjednoczeniZaPolske paragraph
    const targetTag = '</p>\n            </div>\n        </div>\n\n<div class="grid-section">';
    const replacement = `</p>\n${interactionHtml}\n            </div>\n        </div>\n\n<div class="grid-section">`;
    
    if (content.includes(targetTag)) {
        content = content.replace(targetTag, replacement);
        fs.writeFileSync('modlitwa.html', content, 'utf8');
        console.log("Success");
    } else {
        // Try fallback regex
        const pattern = /(#ZjednoczeniZaPolskę\s*<\/p>\s*)(<\/div>\s*<\/div>)/;
        if (pattern.test(content)) {
            content = content.replace(pattern, `$1${interactionHtml}\n$2`);
            fs.writeFileSync('modlitwa.html', content, 'utf8');
            console.log("Success (Fallback)");
        } else {
            console.log("Target not found!");
        }
    }

} catch (e) {
    console.error(e);
}
