const fs = require('fs');
let c = fs.readFileSync('zapolske-live.html', 'utf8');

const oldGreetings = '<span class="ticker-highlight-msg">💬 Czekamy na Wasze pozdrowienia i intencje! Piszcie na radiowego WhatsAppa!</span>';
const newGreetings = '<span class="ticker-highlight-msg">💬 Pozdrawiam serdecznie Kasię, Zosię, Pawła, Roberta i Bartka :) niech dobry Bóg Was błogosławi Kochani! ~Czarek &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; 💬 Pozdrawiam serdecznie księdza Jan Dubas z kościoła Opatrzności Bożej przy ul. Świadka 5 w Rzeszowie ~Katarzyna Fedków</span>';
c = c.replaceAll(oldGreetings, newGreetings);

// Replace loadNewsMarquee logic to fetch news.json
const funcBlockRegex = /async function loadNewsMarquee\(\) \{[\s\S]*?marqueeTextEl\.innerHTML = defaultMissionText;\s*\}/;

const newFuncBlock = `async function loadNewsMarquee() {
                const marqueeTextEl = document.getElementById("marqueeText");
                if (!marqueeTextEl) return;
                
                let prayerMarqueeText = "";
                if (window.lastPrayerIntention) {
                    prayerMarqueeText = \`<span style="background: #FFCC00; color: #000000; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-family: 'Outfit', sans-serif; margin-right: 12px; display: inline-block;"><i class="fa-solid fa-hands-praying"></i> INTENCJA LIVE</span> <span style="color: #FFFFFF; font-weight: 700; font-style: italic; margin-right: 25px;">„\${window.lastPrayerIntention.text}” (~\${window.lastPrayerIntention.name}, \${window.lastPrayerIntention.city})</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\`;
                }
                
                const greetingsText = \`<span class="ticker-announcement">ZA CHWILĘ: GŁOS WIDZÓW 📺</span> <span class="ticker-highlight-msg">💬 Pozdrawiam serdecznie Kasię, Zosię, Pawła, Roberta i Bartka :) niech dobry Bóg Was błogosławi Kochani! ~Czarek &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; 💬 Pozdrawiam serdecznie księdza Jan Dubas z kościoła Opatrzności Bożej przy ul. Świadka 5 w Rzeszowie ~Katarzyna Fedków</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\`;

                let newsHtml = "";
                try {
                    const response = await fetch('news.json?v=' + Date.now());
                    if (response.ok) {
                        const newsItems = await response.json();
                        if (newsItems && newsItems.length > 0) {
                            newsHtml = \`<span class="ticker-announcement">SERWIS INFORMACYJNY 📰</span> \` + 
                                       newsItems.map(item => \`<strong>\${item}</strong>\`).join(' &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; ') + 
                                       \` &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\`;
                        }
                    }
                } catch (err) {
                    console.error("Error loading news.json:", err);
                }

                const defaultMissionText = \`
                    \${prayerMarqueeText}
                    \${greetingsText}
                     <span style="background: #dc143c; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-family: 'Montserrat', sans-serif; margin-right: 15px; display: inline-block;">🇵🇱 PILNE WEZWANIE DO MODLITWY 🙏🔥</span> 
                    \${newsHtml}
                    <span style="background: #FFCC00; color: #000000; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-family: 'Montserrat', sans-serif; margin-right: 15px; display: inline-block;">WWW.POLSKIERADIO.CC | CCLITE.PL</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    <span class="ticker-announcement">KOMUNIKAT SPECJALNY</span> <strong>Rozważania Codzienne "Lato ku Bożej chwale — Świat dla Jezusa" nie będą już wysyłane w formie bezpłatnej subskrypcji sms, a dostępne są teraz tylko w aplikacji "Dobrze, że jesteś" i na stronie www.polskieradio.cc.</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    📧 NAPISZ DO NAS: <strong>polskiercctv@gmail.com</strong> | <strong>radiochristianculture@gmail.com</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    <span class="ticker-announcement">OFERTA SPECJALNA 🎁</span> 📖 BEZPŁATNA BIBLIA DLA KAŻDEGO — wyślij SMS o treści: <strong>BIBLIA</strong> pod numer <strong>507 821 789</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    📱 DOŁĄCZ NA WHATSAPP — szczegóły w bocznej ramce &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    <span class="ticker-announcement">WESPRZYJ MISJĘ ❤️</span> 💳 Zostań Patronem: patronite.pl/osobowoscplus &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    🙏 Dziękujemy za każde wsparcie i modlitwę! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    \${greetingsText}
                \`;
                
                marqueeTextEl.innerHTML = defaultMissionText;
            }`;

c = c.replace(funcBlockRegex, newFuncBlock);
fs.writeFileSync('zapolske-live.html', c, 'utf8');
