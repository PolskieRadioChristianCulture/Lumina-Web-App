/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA ADVANCED VALUES-BASED DISCOVERY ENGINE (js/lumina-discovery-filters.js)
 * Zaawansowane Filtrowanie Profili: Wiek, Lokalizacja, Cel Relacji, Słowo Boże
 * ══════════════════════════════════════════════════════════════════════════
 */

(function initLuminaDiscoveryFiltersEngine() {
    'use strict';

    let filterState = {
        gender: 'all',
        minAge: 18,
        maxAge: 75,
        location: '',
        goal: 'all',
        bibleReading: 'all',
        denomination: 'all',
        withPhotoOnly: true
    };

    function injectStyles() {
        if (document.getElementById('luminaDiscoveryFiltersStyles')) return;
        const style = document.createElement('style');
        style.id = 'luminaDiscoveryFiltersStyles';
        style.textContent = `
            .filter-group-title {
                font-size: 0.82rem;
                font-weight: 800;
                color: #facc15;
                font-family: 'Outfit', sans-serif;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                gap: 6px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .filter-select-luxury {
                width: 100%;
                padding: 10px 14px;
                border-radius: 14px;
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #ffffff;
                font-family: inherit;
                font-size: 0.85rem;
                outline: none;
                transition: all 0.2s;
                box-sizing: border-box;
            }
            .filter-select-luxury:focus {
                border-color: #facc15;
                box-shadow: 0 0 12px rgba(250, 204, 21, 0.3);
                background: rgba(255, 255, 255, 0.1);
            }
            .filter-select-luxury option {
                background: #0b1329;
                color: #fff;
            }
            .filter-radio-pill-group {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
            }
            .filter-radio-pill {
                padding: 6px 14px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #cbd5e1;
                font-size: 0.78rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.18s;
                user-select: none;
            }
            .filter-radio-pill.active {
                background: linear-gradient(135deg, #ec4899, #8b5cf6);
                border-color: transparent;
                color: #fff;
                box-shadow: 0 2px 10px rgba(236, 72, 153, 0.35);
            }
            .age-slider-wrap {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .age-slider-input {
                flex: 1;
                accent-color: #ec4899;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    // ── MODAL FILTRÓW ZAAWANSOWANYCH ──
    window.openAdvancedFiltersModal = function() {
        injectStyles();
        let modal = document.getElementById('luminaAdvancedFiltersModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'luminaAdvancedFiltersModal';
            modal.className = 'modal-overlay';
            modal.style.cssText = 'display: flex; align-items: center; justify-content: center; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 999999; padding: 16px; opacity: 0; pointer-events: none; transition: opacity 0.25s ease;';
            
            modal.innerHTML = `
                <div class="modal-card" style="max-width: 580px; width: 100%; max-height: 90vh; background: #070e24; border: 1.5px solid rgba(236,72,153,0.45); border-radius: 24px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.85);">
                    <!-- Header -->
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02);">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #ec4899, #8b5cf6); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.2rem;">
                                <i class="fa-solid fa-sliders"></i>
                            </span>
                            <div>
                                <h3 style="font-size: 1.1rem; font-weight: 800; color: #fff; font-family: 'Outfit', sans-serif; margin: 0;">
                                    Filtry Odkrywania & Wartości ⚙️
                                </h3>
                                <div style="font-size: 0.72rem; color: #94a3b8;">
                                    Szukaj relacji opartych na wierze, czystości i powołaniu
                                </div>
                            </div>
                        </div>
                        <button onclick="window.closeAdvancedFiltersModal()" style="background: rgba(255,255,255,0.08); border: none; color: #fff; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; touch-action: manipulation;"><i class="fa-solid fa-xmark"></i></button>
                    </div>

                    <!-- Filter Form Body -->
                    <div style="padding: 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
                        
                        <!-- 1. Płeć -->
                        <div>
                            <div class="filter-group-title"><i class="fa-solid fa-venus-mars"></i> Kogo szukasz?</div>
                            <div class="filter-radio-pill-group" id="filterGroupGender">
                                <span class="filter-radio-pill active" onclick="window._setFilterGender('all', this)">Wszyscy</span>
                                <span class="filter-radio-pill" onclick="window._setFilterGender('kobieta', this)">🌸 Kobiety</span>
                                <span class="filter-radio-pill" onclick="window._setFilterGender('mezczyzna', this)">🛡️ Mężczyźni</span>
                            </div>
                        </div>

                        <!-- 2. Wiek (Suwak) -->
                        <div>
                            <div class="filter-group-title">
                                <i class="fa-solid fa-cake-candles"></i> Przedział Wieku: <span id="filterAgeLabel" style="color: #fff; font-weight: 800; margin-left: 6px;">18 – 75 lat</span>
                            </div>
                            <div class="age-slider-wrap">
                                <span style="font-size: 0.75rem; color: #94a3b8;">18</span>
                                <input type="range" class="age-slider-input" id="filterAgeSliderMax" min="18" max="80" value="75" oninput="window._updateAgeSlider(this.value)">
                                <span style="font-size: 0.75rem; color: #94a3b8;">80+</span>
                            </div>
                        </div>

                        <!-- 3. Cel w Społeczności -->
                        <div>
                            <div class="filter-group-title"><i class="fa-solid fa-ring"></i> Cel Obecności & Relacji</div>
                            <select id="filterSelectGoal" class="filter-select-luxury" onchange="filterState.goal = this.value">
                                <option value="all">Wszystkie cele relacji</option>
                                <option value="malzenstwo">💍 Szukam małżeństwa według Bożej woli</option>
                                <option value="relacja">❤️ Trwała relacja oparta na wartościach</option>
                                <option value="przyjazn">🤝 Chrześcijańska przyjaźń & rozmowa</option>
                                <option value="modlitwa">🙏 Wspólna modlitwa & budowanie w wierze</option>
                            </select>
                        </div>

                        <!-- 4. Regularność Czytania Słowa Bożego -->
                        <div>
                            <div class="filter-group-title"><i class="fa-solid fa-book-bible"></i> Czytanie Pisma Świętego</div>
                            <select id="filterSelectBible" class="filter-select-luxury" onchange="filterState.bibleReading = this.value">
                                <option value="all">Dowolna częstotliwość</option>
                                <option value="codziennie">📖 Codziennie rozważam Słowo Boże</option>
                                <option value="regularnie">🌿 Kilka razy w tygodniu</option>
                                <option value="niedziela">⛪ W niedziele i podczas nabożeństw</option>
                            </select>
                        </div>

                        <!-- 5. Województwo / Lokalizacja -->
                        <div>
                            <div class="filter-group-title"><i class="fa-solid fa-location-dot"></i> Województwo / Miasto</div>
                            <select id="filterSelectLocation" class="filter-select-luxury" onchange="filterState.location = this.value">
                                <option value="">Cała Polska & Zagranica</option>
                                <option value="mazowieckie">Mazowieckie (Warszawa, Radom...)</option>
                                <option value="malopolskie">Małopolskie (Kraków, Tarnów...)</option>
                                <option value="slaskie">Śląskie (Katowice, Częstochowa...)</option>
                                <option value="wielkopolskie">Wielkopolskie (Poznań, Kalisz...)</option>
                                <option value="dolnoslaskie">Dolnośląskie (Wrocław, Legnica...)</option>
                                <option value="lodzkie">Łódzkie (Łódź, Sieradz, Piotrków...)</option>
                                <option value="pomorskie">Pomorskie (Gdańsk, Gdynia...)</option>
                                <option value="lubelskie">Lubelskie (Lublin, Zamość...)</option>
                                <option value="podkarpackie">Podkarpackie (Rzeszów, Przemyśl...)</option>
                                <option value="kujawsko-pomorskie">Kujawsko-Pomorskie (Bydgoszcz, Toruń...)</option>
                                <option value="zachodniopomorskie">Zachodniopomorskie (Szczecin, Koszalin...)</option>
                                <option value="warminsko-mazurskie">Warmińsko-Mazurskie (Olsztyn, Elbląg...)</option>
                                <option value="swietokrzyskie">Świętokrzyskie (Kielce...)</option>
                                <option value="podlaskie">Podlaskie (Białystok, Suwałki...)</option>
                                <option value="lubuskie">Lubuskie (Zielona Góra, Gorzów...)</option>
                                <option value="opolskie">Opolskie (Opole, Nysa...)</option>
                            </select>
                        </div>

                        <!-- 6. Tylko ze zdjęciem -->
                        <div style="display: flex; align-items: center; gap: 10px; padding: 6px 0;">
                            <input type="checkbox" id="filterCheckWithPhoto" checked onchange="filterState.withPhotoOnly = this.checked" style="width: 18px; height: 18px; accent-color: #ec4899; cursor: pointer;">
                            <label for="filterCheckWithPhoto" style="font-size: 0.82rem; color: #cbd5e1; cursor: pointer; user-select: none;">
                                ✨ Pokazuj tylko zweryfikowane profile ze zdjęciem
                            </label>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div style="display: flex; gap: 10px; padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02);">
                        <button type="button" onclick="window.resetAdvancedFilters()" style="flex: 1; padding: 12px; border-radius: 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-weight: 700; font-family: inherit; font-size: 0.85rem; cursor: pointer;">
                            Wyczyść
                        </button>
                        <button type="button" onclick="window.applyAdvancedFilterValues()" style="flex: 2; padding: 12px; border-radius: 14px; background: linear-gradient(90deg, #ec4899, #8b5cf6); border: none; color: #fff; font-weight: 800; font-family: inherit; font-size: 0.88rem; cursor: pointer; box-shadow: 0 4px 16px rgba(236,72,153,0.4); display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <span>Zastosuj Filtry</span> <i class="fa-solid fa-sparkles"></i>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
    };

    window.closeAdvancedFiltersModal = function() {
        const modal = document.getElementById('luminaAdvancedFiltersModal');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
        }
    };

    window._setFilterGender = function(gender, el) {
        filterState.gender = gender;
        document.querySelectorAll('#filterGroupGender .filter-radio-pill').forEach(b => b.classList.remove('active'));
        if (el) el.classList.add('active');
    };

    window._updateAgeSlider = function(maxVal) {
        filterState.maxAge = parseInt(maxVal, 10);
        const label = document.getElementById('filterAgeLabel');
        if (label) label.textContent = `18 – ${maxVal} lat`;
    };

    window.resetAdvancedFilters = function() {
        filterState = {
            gender: 'all',
            minAge: 18,
            maxAge: 75,
            location: '',
            goal: 'all',
            bibleReading: 'all',
            denomination: 'all',
            withPhotoOnly: true
        };

        const ageSlider = document.getElementById('filterAgeSliderMax');
        if (ageSlider) ageSlider.value = 75;
        const ageLabel = document.getElementById('filterAgeLabel');
        if (ageLabel) ageLabel.textContent = '18 – 75 lat';

        const selectGoal = document.getElementById('filterSelectGoal');
        if (selectGoal) selectGoal.value = 'all';

        const selectBible = document.getElementById('filterSelectBible');
        if (selectBible) selectBible.value = 'all';

        const selectLoc = document.getElementById('filterSelectLocation');
        if (selectLoc) selectLoc.value = '';

        const checkPhoto = document.getElementById('filterCheckWithPhoto');
        if (checkPhoto) checkPhoto.checked = true;

        document.querySelectorAll('#filterGroupGender .filter-radio-pill').forEach((b, idx) => {
            if (idx === 0) b.classList.add('active');
            else b.classList.remove('active');
        });

        window.applyAdvancedFilterValues();
    };

    window.applyAdvancedFilterValues = function() {
        window.closeAdvancedFiltersModal();

        const carousel = document.getElementById('profilesCarousel');
        if (!carousel) return;

        const cards = carousel.querySelectorAll('.profile-card');
        let matchCount = 0;

        cards.forEach(card => {
            const category = (card.getAttribute('data-category') || '').toLowerCase();
            const nameText = (card.querySelector('.card-name')?.textContent || '').toLowerCase();
            const locText = (card.querySelector('.card-city, .card-location')?.textContent || card.textContent || '').toLowerCase();
            const descText = (card.querySelector('.card-desc, p')?.textContent || card.textContent || '').toLowerCase();

            let isMatch = true;

            // 1. Gender
            if (filterState.gender === 'kobieta') {
                if (!(category.includes('kobieta') || nameText.includes('wioletta') || nameText.includes('noemi') || nameText.includes('weronika') || nameText.includes('anna') || nameText.includes('women'))) {
                    isMatch = false;
                }
            } else if (filterState.gender === 'mezczyzna') {
                if (!(category.includes('mezczyzna') || nameText.includes('cezary') || nameText.includes('tomek') || nameText.includes('dawid') || nameText.includes('men') || nameText.includes('osobowosc'))) {
                    isMatch = false;
                }
            }

            // 2. Age
            const ageMatch = nameText.match(/,s*(d{2})/);
            if (ageMatch) {
                const age = parseInt(ageMatch[1], 10);
                if (age > filterState.maxAge) {
                    isMatch = false;
                }
            }

            // 3. Location
            if (filterState.location) {
                const locKey = filterState.location.toLowerCase();
                if (!locText.includes(locKey) && !descText.includes(locKey)) {
                    isMatch = false;
                }
            }

            if (isMatch) {
                card.style.display = '';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                matchCount++;
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
            }
        });

        if (typeof window.centerMiddleSetPromo === 'function') {
            window.centerMiddleSetPromo(true);
        }

        const effectiveCount = Math.max(1, Math.round(matchCount / 3));
        if (typeof window.showToast === 'function') {
            window.showToast(`✨ Znaleziono ${effectiveCount} dopasowanych profili według Twoich wartości!`);
        }
    };

    // ── INJECT BUTTON INTO DISCOVERY FILTERS BAR ──
    function injectAdvancedFiltersButton() {
        const wrap = document.querySelector('.discovery-filters-wrap');
        if (wrap && !document.getElementById('btnAdvancedFiltersModalTrigger')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'filter-chip';
            btn.id = 'btnAdvancedFiltersModalTrigger';
            btn.onclick = () => window.openAdvancedFiltersModal();
            btn.title = 'Filtry Zaawansowane według Wartości & Wiary';
            btn.innerHTML = '<i class="fa-solid fa-sliders" style="color:#facc15;"></i> <span class="filter-chip-text">Filtry Wartości ⚙️</span>';

            const recBtn = document.getElementById('btnRecommendLumina');
            if (recBtn) {
                wrap.insertBefore(btn, recBtn);
            } else {
                wrap.appendChild(btn);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(injectAdvancedFiltersButton, 500));
    } else {
        setTimeout(injectAdvancedFiltersButton, 500);
    }
})();
