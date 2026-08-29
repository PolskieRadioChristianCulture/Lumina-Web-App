/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA VIRAL SCRIPTURE STORY ENGINE (lumina-story-card-generator.js)
 * Generator Luksusowych Kart Wersetów & Świadectw w Formacie 9:16 (Story / WhatsApp Status)
 * Dedykowany moduł organicznego wzrostu i udostępniania społecznościowego
 * ══════════════════════════════════════════════════════════════════════════
 */
(function() {
    'use strict';

    const PRESET_VERSES = [
        { text: "Wszystko mogę w Tym, który mnie umacnia.", ref: "List do Filipian 4, 13" },
        { text: "Albowiem ja wiem, jakie myśli mam o was – mówi Pan – myśli o pokoju, a nie o niedoli, aby dać wam przyszłość i nadzieję.", ref: "Księga Jeremiasza 29, 11" },
        { text: "Pan jest moim pasterzem, niczego mi nie braknie. Pozwala mi leżeć na zielonych pastwiskach.", ref: "Psalm 23, 1-2" },
        { text: "Ci, co zaufali Panu, odzyskują siły, otrzymują skrzydła jak orły, biegną bez zmęczenia.", ref: "Księga Izajasza 40, 31" },
        { text: "Miłość jest cierpliwa, miłość jest łaskawa. Nie zazdrości, nie szuka poklasku, nie unosi się pychą.", ref: "1 List do Koryntian 13, 4" },
        { text: "Zaufaj Panu z całego swego serca i nie polegaj na własnym rozumie. Na wszystkich swoich drogach zważaj na Niego.", ref: "Księga Przysłów 3, 5-6" },
        { text: "Bóg współdziała we wszystkim ku dobremu z tymi, którzy Go miłują.", ref: "List do Rzymian 8, 28" },
        { text: "Szukajcie wpierw Królestwa Bożego i Jego sprawiedliwości, a wszystko inne będzie wam dodane.", ref: "Ewangelia wg św. Mateusza 6, 33" },
        { text: "Pokój zostawiam wam, pokój mój daję wam. Nie tak jak daje świat, Ja wam daję. Niech się nie trwoży serce wasze.", ref: "Ewangelia wg św. Jana 14, 27" }
    ];

    const THEMES = {
        royal: {
            name: "🌌 Królewski Fiolet",
            bgTop: "#0a071b",
            bgMid: "#250638",
            bgBottom: "#0a071b",
            goldAccent: "#facc15",
            textColor: "#ffffff",
            quoteColor: "#e879f9",
            glowColor: "rgba(234, 179, 8, 0.45)"
        },
        sunrise: {
            name: "🌅 Złoty Świt",
            bgTop: "#110b24",
            bgMid: "#451a03",
            bgBottom: "#1a0b2e",
            goldAccent: "#fbbf24",
            textColor: "#ffffff",
            quoteColor: "#f59e0b",
            glowColor: "rgba(251, 191, 36, 0.5)"
        },
        midnight: {
            name: "🕊️ Noc & Światło",
            bgTop: "#020617",
            bgMid: "#082f49",
            bgBottom: "#020617",
            goldAccent: "#38bdf8",
            textColor: "#ffffff",
            quoteColor: "#7dd3fc",
            glowColor: "rgba(56, 189, 248, 0.45)"
        },
        rose: {
            name: "🌸 Róż & Zorza",
            bgTop: "#1c051a",
            bgMid: "#4c0519",
            bgBottom: "#1c051a",
            goldAccent: "#f472b6",
            textColor: "#ffffff",
            quoteColor: "#fb7185",
            glowColor: "rgba(244, 114, 182, 0.45)"
        }
    };

    let currentConfig = {
        text: PRESET_VERSES[0].text,
        ref: PRESET_VERSES[0].ref,
        author: "Społeczność LUMINA",
        slug: "",
        theme: "royal"
    };

    // Wstrzyknięcie Stylów Modalu Generatora
    function injectStyles() {
        if (document.getElementById('luminaStoryGenStyles')) return;
        const styleEl = document.createElement('style');
        styleEl.id = 'luminaStoryGenStyles';
        styleEl.textContent = `
            .story-gen-overlay {
                position: fixed;
                inset: 0;
                background: rgba(4, 7, 18, 0.88);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                z-index: 100005;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                box-sizing: border-box;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.28s ease;
            }
            .story-gen-overlay.open {
                opacity: 1;
                pointer-events: auto;
            }
            .story-gen-modal {
                background: rgba(13, 19, 39, 0.98);
                border: 1.5px solid rgba(250, 204, 21, 0.45);
                box-shadow: 0 25px 65px rgba(0, 0, 0, 0.9), 0 0 35px rgba(250, 204, 21, 0.2);
                border-radius: 28px;
                max-width: 900px;
                width: 100%;
                max-height: 92vh;
                display: flex;
                flex-direction: row;
                gap: 24px;
                padding: 24px;
                box-sizing: border-box;
                position: relative;
                color: #fff;
                font-family: 'Plus Jakarta Sans', sans-serif;
                overflow: hidden;
            }
            @media (max-width: 768px) {
                .story-gen-overlay {
                    padding: 0;
                    align-items: flex-end;
                }
                .story-gen-modal {
                    flex-direction: column;
                    border-radius: 28px 28px 0 0;
                    border-bottom: none;
                    border-left: none;
                    border-right: none;
                    max-height: 90dvh;
                    padding: 20px 16px calc(24px + env(safe-area-inset-bottom, 14px));
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                    gap: 16px;
                }
            }
            .story-preview-col {
                flex: 0 0 290px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            @media (max-width: 768px) {
                .story-preview-col {
                    flex: none;
                    width: 100%;
                }
            }
            .story-preview-canvas {
                width: 250px;
                height: 444px;
                border-radius: 20px;
                box-shadow: 0 12px 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(250, 204, 21, 0.25);
                border: 2px solid rgba(250, 204, 21, 0.5);
                background: #000;
                display: block;
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            @media (max-width: 768px) {
                .story-preview-canvas {
                    width: 210px;
                    height: 373px;
                }
            }
            .story-controls-col {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 14px;
                overflow-y: auto;
                padding-right: 4px;
            }
            .story-ctrl-title {
                font-family: 'Outfit', sans-serif;
                font-size: 1.35rem;
                font-weight: 800;
                color: #facc15;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .story-theme-row {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            .story-theme-btn {
                padding: 6px 14px;
                border-radius: 20px;
                background: rgba(255, 255, 255, 0.08);
                border: 1.5px solid rgba(255, 255, 255, 0.15);
                color: #e2e8f0;
                font-size: 0.8rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
                -webkit-tap-highlight-color: transparent;
            }
            .story-theme-btn.active {
                background: linear-gradient(135deg, rgba(236, 72, 153, 0.35), rgba(139, 92, 246, 0.35));
                border-color: #facc15;
                color: #fef08a;
                box-shadow: 0 0 14px rgba(250, 204, 21, 0.3);
            }
            .story-textarea {
                width: 100%;
                background: rgba(5, 10, 25, 0.85);
                border: 1.5px solid rgba(255, 255, 255, 0.15);
                border-radius: 14px;
                padding: 12px 14px;
                color: #fff;
                font-family: inherit;
                font-size: 0.88rem;
                resize: none;
                box-sizing: border-box;
                outline: none;
                transition: border-color 0.2s;
            }
            .story-textarea:focus {
                border-color: #facc15;
            }
            .story-input {
                width: 100%;
                background: rgba(5, 10, 25, 0.85);
                border: 1.5px solid rgba(255, 255, 255, 0.15);
                border-radius: 12px;
                padding: 10px 14px;
                color: #fff;
                font-family: inherit;
                font-size: 0.85rem;
                box-sizing: border-box;
                outline: none;
            }
            .story-input:focus {
                border-color: #facc15;
            }
            .story-action-btns {
                display: flex;
                gap: 10px;
                margin-top: 6px;
                flex-wrap: wrap;
            }
            .story-btn-primary {
                flex: 1;
                min-width: 160px;
                background: linear-gradient(135deg, #ec4899, #8b5cf6);
                border: 1px solid rgba(250, 204, 21, 0.6);
                color: #fff;
                font-weight: 800;
                font-size: 0.92rem;
                padding: 12px 20px;
                border-radius: 30px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                box-shadow: 0 4px 18px rgba(236, 72, 153, 0.45);
                transition: all 0.2s ease;
                -webkit-tap-highlight-color: transparent;
            }
            .story-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 24px rgba(236, 72, 153, 0.65);
            }
            .story-btn-primary:active {
                transform: scale(0.96);
            }
            .story-btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                border: 1.5px solid rgba(255, 255, 255, 0.25);
                color: #fff;
                font-weight: 700;
                font-size: 0.88rem;
                padding: 12px 18px;
                border-radius: 30px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s ease;
                -webkit-tap-highlight-color: transparent;
            }
            .story-btn-secondary:hover {
                background: rgba(255, 255, 255, 0.18);
                border-color: #facc15;
            }
            .story-close-btn {
                position: absolute;
                top: 14px;
                right: 14px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.12);
                border: 1px solid rgba(255, 255, 255, 0.25);
                color: #fff;
                font-size: 1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                z-index: 10;
            }
            .story-close-btn:hover {
                background: rgba(239, 68, 68, 0.6);
            }
        `;
        document.head.appendChild(styleEl);
    }

    // Wrap Text na Canvas z wyliczaniem linii
    function wrapCanvasText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    // Renderowanie 1080x1920 HD Canvas
    function renderStoryCanvas(canvas, config) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = 1080;
        const H = 1920;
        canvas.width = W;
        canvas.height = H;

        const theme = THEMES[config.theme] || THEMES.royal;

        // 1. Tło Gradientowe
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, theme.bgTop);
        grad.addColorStop(0.5, theme.bgMid);
        grad.addColorStop(1, theme.bgBottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // 2. Kosmiczne Cząsteczki / Złoty Pył
        ctx.save();
        ctx.fillStyle = "rgba(250, 204, 21, 0.15)";
        for (let i = 0; i < 45; i++) {
            const px = (Math.sin(i * 99) * 0.5 + 0.5) * W;
            const py = (Math.cos(i * 33) * 0.5 + 0.5) * H;
            const pr = (i % 4) + 1.5;
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // 3. Centralna Poświata
        const glowGrad = ctx.createRadialGradient(W / 2, H / 2 - 60, 50, W / 2, H / 2 - 60, 480);
        glowGrad.addColorStop(0, theme.glowColor);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, W, H);

        // 4. Górne Logo & Nagłówek LUMINA
        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = theme.goldAccent;
        ctx.font = "800 36px 'Outfit', sans-serif";
        ctx.letterSpacing = "6px";
        ctx.fillText("✨ LUMINA • CHRISTIAN CULTURE ✨", W / 2, 220);

        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.font = "600 24px 'Plus Jakarta Sans', sans-serif";
        ctx.letterSpacing = "3px";
        ctx.fillText("SŁOWO BOŻE I ŚWIADECTWO NA DZIŚ", W / 2, 270);

        // Złota Linia Ozdobna
        ctx.strokeStyle = theme.goldAccent;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(W / 2 - 140, 310);
        ctx.lineTo(W / 2 + 140, 310);
        ctx.stroke();

        // Krzyż / Symbol Wiary
        ctx.font = "38px 'FontAwesome', sans-serif";
        ctx.fillText("✝", W / 2, 360);
        ctx.restore();

        // 5. Cudzysłów Górny
        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = theme.quoteColor;
        ctx.font = "800 110px 'Cinzel', 'Outfit', serif";
        ctx.shadowColor = theme.quoteColor;
        ctx.shadowBlur = 25;
        ctx.fillText("“", W / 2, 530);
        ctx.restore();

        // 6. Treść Wersetu (Wrapped)
        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = theme.textColor;
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 20;

        let fontSize = 54;
        if (config.text.length > 180) fontSize = 44;
        if (config.text.length > 280) fontSize = 36;
        ctx.font = `700 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;

        const maxTextWidth = 860;
        const lines = wrapCanvasText(ctx, config.text, maxTextWidth);
        const lineHeight = fontSize * 1.45;
        const totalTextHeight = lines.length * lineHeight;
        let startY = (H / 2 - 60) - (totalTextHeight / 2) + 60;

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], W / 2, startY + (i * lineHeight));
        }
        ctx.restore();

        // 7. Referencja Biblijna
        const refY = startY + (lines.length * lineHeight) + 65;
        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = theme.goldAccent;
        ctx.font = "800 42px 'Outfit', sans-serif";
        ctx.shadowColor = theme.goldAccent;
        ctx.shadowBlur = 15;
        ctx.fillText("— " + (config.ref || "Pismo Święte") + " —", W / 2, refY);
        ctx.restore();

        // 8. Podpis Autora / Udostępniającego
        if (config.author) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.font = "600 28px 'Plus Jakarta Sans', sans-serif";
            ctx.fillText("Udostępnione przez: " + config.author, W / 2, refY + 70);
            ctx.restore();
        }

        // 9. Dolna Karta Społeczności (Call to Action)
        const footerY = H - 240;
        ctx.save();
        // Ramka tła
        ctx.fillStyle = "rgba(10, 15, 35, 0.85)";
        ctx.strokeStyle = "rgba(250, 204, 21, 0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(W / 2 - 400, footerY - 50, 800, 150, 25);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 28px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("Dołącz do społeczności chrześcijańskiej LUMINA", W / 2, footerY);

        ctx.fillStyle = theme.goldAccent;
        ctx.font = "800 32px 'Outfit', sans-serif";
        ctx.letterSpacing = "2px";
        const linkUrl = config.slug ? `polskieradio.cc/lumina/${config.slug}` : `polskieradio.cc/lumina`;
        ctx.fillText(linkUrl, W / 2, footerY + 50);
        ctx.restore();
    }

    // Modal UI Creator
    function createStoryModal() {
        injectStyles();
        let overlay = document.getElementById('luminaStoryGenModal');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'luminaStoryGenModal';
        overlay.className = 'story-gen-overlay';
        overlay.innerHTML = `
            <div class="story-gen-modal">
                <button class="story-close-btn" onclick="window.closeLuminaStoryGenerator()"><i class="fa-solid fa-xmark"></i></button>
                
                <div class="story-preview-col">
                    <canvas id="storyCanvasPreview" class="story-preview-canvas" title="Kliknij, aby pobrać HD"></canvas>
                    <div style="font-size:0.75rem; color:#94a3b8; margin-top:8px; text-align:center;">
                        Format 9:16 HD (1080x1920 px)
                    </div>
                </div>

                <div class="story-controls-col">
                    <div class="story-ctrl-title">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Generator Kart Story 9:16
                    </div>
                    
                    <div>
                        <label style="font-size:0.75rem; font-weight:800; color:#facc15; text-transform:uppercase; display:block; margin-bottom:6px;">Wybierz Styl i Kolorystykę:</label>
                        <div class="story-theme-row">
                            <button class="story-theme-btn active" data-theme="royal" onclick="window._setStoryTheme('royal')">🌌 Fiolet</button>
                            <button class="story-theme-btn" data-theme="sunrise" onclick="window._setStoryTheme('sunrise')">🌅 Złoty Świt</button>
                            <button class="story-theme-btn" data-theme="midnight" onclick="window._setStoryTheme('midnight')">🕊️ Noc & Światło</button>
                            <button class="story-theme-btn" data-theme="rose" onclick="window._setStoryTheme('rose')">🌸 Róż & Zorza</button>
                        </div>
                    </div>

                    <div>
                        <label style="font-size:0.75rem; font-weight:800; color:#facc15; text-transform:uppercase; display:block; margin-bottom:6px;">Szybki Wybór Wersetu:</label>
                        <select id="storyPresetSelect" class="story-input" onchange="window._onPresetSelect(this.value)">
                            ${PRESET_VERSES.map((v, i) => `<option value="${i}">${v.ref} — "${v.text.substring(0, 45)}..."</option>`).join('')}
                            <option value="custom">✏️ Własny werset / świadectwo...</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size:0.75rem; font-weight:800; color:#cbd5e1; display:block; margin-bottom:4px;">Treść Wersetu / Świadectwa:</label>
                        <textarea id="storyTextEdit" class="story-textarea" rows="3" oninput="window._onTextEdit()"></textarea>
                    </div>

                    <div>
                        <label style="font-size:0.75rem; font-weight:800; color:#cbd5e1; display:block; margin-bottom:4px;">Referencja (Księga, Rozdział, Werset):</label>
                        <input id="storyRefEdit" type="text" class="story-input" oninput="window._onTextEdit()" placeholder="np. List do Filipian 4, 13">
                    </div>

                    <div class="story-action-btns">
                        <button class="story-btn-primary" onclick="window.shareCurrentStoryCard()">
                            <i class="fa-solid fa-share-nodes"></i> Udostępnij (WhatsApp / Story)
                        </button>
                        <button class="story-btn-secondary" onclick="window.downloadCurrentStoryCard()">
                            <i class="fa-solid fa-download"></i> Pobierz HD (.png)
                        </button>
                        <button class="story-btn-secondary" onclick="window.copyStoryLink()" title="Kopiuj link do wersetu">
                            <i class="fa-solid fa-link"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) window.closeLuminaStoryGenerator();
        });

        return overlay;
    }

    // Globalne API
    window.openLuminaStoryGenerator = function(options = {}) {
        const overlay = createStoryModal();
        const storedProfile = (typeof window.LuminaDB?.getCurrentProfile === 'function' ? window.LuminaDB.getCurrentProfile() : null) || {};

        currentConfig = {
            text: options.verse || options.text || PRESET_VERSES[0].text,
            ref: options.verseRef || options.ref || PRESET_VERSES[0].ref,
            author: options.authorName || options.name || storedProfile.name || "Społeczność LUMINA",
            slug: options.slug || storedProfile.slug || "",
            theme: options.theme || "royal"
        };

        const textarea = document.getElementById('storyTextEdit');
        const refInput = document.getElementById('storyRefEdit');
        if (textarea) textarea.value = currentConfig.text;
        if (refInput) refInput.value = currentConfig.ref;

        window._setStoryTheme(currentConfig.theme);
        overlay.classList.add('open');
    };

    window.closeLuminaStoryGenerator = function() {
        const overlay = document.getElementById('luminaStoryGenModal');
        if (overlay) overlay.classList.remove('open');
    };

    window._setStoryTheme = function(themeName) {
        currentConfig.theme = themeName;
        document.querySelectorAll('.story-theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
        });
        const canvas = document.getElementById('storyCanvasPreview');
        renderStoryCanvas(canvas, currentConfig);
    };

    window._onPresetSelect = function(val) {
        if (val === 'custom') return;
        const idx = parseInt(val, 10);
        if (PRESET_VERSES[idx]) {
            currentConfig.text = PRESET_VERSES[idx].text;
            currentConfig.ref = PRESET_VERSES[idx].ref;
            const textarea = document.getElementById('storyTextEdit');
            const refInput = document.getElementById('storyRefEdit');
            if (textarea) textarea.value = currentConfig.text;
            if (refInput) refInput.value = currentConfig.ref;
            const canvas = document.getElementById('storyCanvasPreview');
            renderStoryCanvas(canvas, currentConfig);
        }
    };

    window._onTextEdit = function() {
        const textarea = document.getElementById('storyTextEdit');
        const refInput = document.getElementById('storyRefEdit');
        if (textarea) currentConfig.text = textarea.value;
        if (refInput) currentConfig.ref = refInput.value;
        const canvas = document.getElementById('storyCanvasPreview');
        renderStoryCanvas(canvas, currentConfig);
    };

    // Pobranie pliku PNG HD
    window.downloadCurrentStoryCard = function() {
        const canvas = document.getElementById('storyCanvasPreview');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `lumina_werset_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        if (typeof window.showLuminaToast === 'function') {
            window.showLuminaToast('✨ Karta wersetu HD została pobrana!');
        }
    };

    // Natywne Udostępnienie (WhatsApp / Instagram / Messenger)
    window.shareCurrentStoryCard = async function() {
        const canvas = document.getElementById('storyCanvasPreview');
        if (!canvas) return;

        const shareUrl = currentConfig.slug ? `https://polskieradio.cc/lumina/${currentConfig.slug}` : `https://polskieradio.cc/lumina`;
        const shareText = `✨ Słowo Boże z portalu LUMINA: „${currentConfig.text}” (${currentConfig.ref}) • ${shareUrl}`;

        canvas.toBlob(async (blob) => {
            if (!blob) {
                window.downloadCurrentStoryCard();
                return;
            }

            const file = new File([blob], `lumina_werset.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'Słowo Boże — Portal LUMINA',
                        text: shareText,
                        files: [file]
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        window.downloadCurrentStoryCard();
                    }
                }
            } else if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Słowo Boże — Portal LUMINA',
                        text: shareText,
                        url: shareUrl
                    });
                } catch (err) {}
            } else {
                // Fallback: pobierz grafikę i skopiuj tekst do schowka
                window.downloadCurrentStoryCard();
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareText);
                    if (typeof window.showLuminaToast === 'function') {
                        window.showLuminaToast('📋 Skopiowano tekst do schowka i pobrano grafikę!');
                    }
                }
            }
        }, 'image/png');
    };

    window.copyStoryLink = function() {
        const shareUrl = currentConfig.slug ? `https://polskieradio.cc/lumina/${currentConfig.slug}` : `https://polskieradio.cc/lumina`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl);
            if (typeof window.showLuminaToast === 'function') {
                window.showLuminaToast('🔗 Skopiowano link polecający do schowka!');
            } else {
                alert('Skopiowano link: ' + shareUrl);
            }
        }
    };

})();
