/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA UNIVERSAL SEARCH & SHORTCUTS ENGINE
 * ══════════════════════════════════════════════════════════════════════════
 */

export const OMNI_DIRECTORY = [
    { query: '@ccwomen @women @cc_women cc women ccwomen', name: 'CC Women • YouTube', handle: '@ccwomen', role: 'Oficjalny Kanał YouTube CC Women 🌸', avatar: 'logo_cc_women.jpg', url: 'lumina.ccwomen.html', type: 'channel' },
    { query: '@cezary @cezaryrgowski @cezaryrogowski cezary rogowski', name: 'Cezary Rogowski', handle: '@cezary', role: 'Założyciel Christian Culture 👑', avatar: 'avatar_cezary_official.jpg', url: 'lumina.cezaryrgowski.html', type: 'founder' },
    { query: '@wioletta @wiolettarogowska wioletta rogowska', name: 'Wioletta Rogowska', handle: '@wioletta', role: 'Współzałożycielka Christian Culture 🌸', avatar: 'avatar_wioletta_official.jpg', url: 'lumina.wiolettarogowska.html', type: 'founder' },
    { query: '@magda @magdalena magdalena poznan', name: 'Magdalena (43)', handle: '@magdalena', role: 'Społeczność LUMINA • Poznań 🕊️', avatar: 'avatar_magdalena.png', url: 'lumina.magdalena.html', type: 'user' },
    { query: '@sds @studiods @studiodobregoslowa studio dobrego słowa', name: 'Studio Dobrego Słowa', handle: '@sds', role: 'Oficjalny Kanał YouTube & Podcast 🎙️', avatar: 'studiodobregoslowa_avatar.jpg', url: 'lumina.studiodobregoslowa.html', type: 'channel' },
    { query: '@radiocc @radio radio christian culture radio na zywo', name: 'Radio Christian Culture', handle: '@radiocc', role: 'Stacja Radiowa & Transmisja Na Żywo 📻', avatar: 'lumina_icon.jpg', url: 'index.html', type: 'media' },
    { query: '@lumina @tablica tablica spolecznosci posty', name: 'Tablica Społeczności', handle: '@lumina', role: 'Główny Strumień Wpisów i Świadectw 🕊️', avatar: 'lumina_icon.jpg', url: 'lumina-tablica.html', type: 'feed' },
    { query: '@noemi noemi wroclaw', name: 'Noemi (28)', handle: '@noemi', role: 'Głęboka wiara i pasja do natury 🌿', avatar: 'avatar_noemi.jpg', url: 'lumina-profile.html?u=noemi', type: 'user' },
    { query: '@tomasz @tomek tomasz gory', name: 'Tomasz (31)', handle: '@tomek', role: 'Wędrówki górskie i uwielbienie 🌲', avatar: 'avatar_widget_tomek.jpg', url: 'lumina-profile.html?u=tomek', type: 'user' }
];

export function handleOmniSearchInput(val) {
    const dropdown = document.getElementById('omniDropdown');
    if (!dropdown) return;
    const term = (val || '').trim().toLowerCase();
    if (!term) {
        dropdown.classList.remove('open');
        dropdown.innerHTML = '';
        return;
    }

    const matches = OMNI_DIRECTORY.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.handle.toLowerCase().includes(term) || 
        item.query.toLowerCase().includes(term)
    );

    if (matches.length === 0) {
        dropdown.classList.add('open');
        dropdown.innerHTML = `
            <div style="padding:12px 16px; font-size:0.84rem; color:#94a3b8; display:flex; justify-content:space-between; align-items:center;">
                <span>Szukaj "<b>${val}</b>" na Tablicy:</span>
                <a href="lumina-tablica.html?q=${encodeURIComponent(val)}" class="shortcut-chip" style="margin:0; text-decoration:none; color:#facc15; font-weight:700;"><i class="fa-solid fa-magnifying-glass"></i> Otwórz Tablicę</a>
            </div>
        `;
    } else {
        dropdown.classList.add('open');
        dropdown.innerHTML = matches.map(item => `
            <div class="omni-item" onclick="window.location.href='${item.url}'" style="display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:12px; cursor:pointer; transition:all 0.2s; background:rgba(255,255,255,0.03); margin-bottom:4px;">
                <img src="${item.avatar}" alt="${item.name}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; border:1px solid rgba(168,85,247,0.5);">
                <div style="flex:1; min-width:0;">
                    <div style="font-weight:700; font-size:0.86rem; color:#fff; display:flex; align-items:center; gap:6px;">
                        <span>${item.name}</span>
                        <span style="font-size:0.72rem; color:#c084fc; font-weight:600;">${item.handle}</span>
                    </div>
                    <div style="font-size:0.75rem; color:#94a3b8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.role}</div>
                </div>
                <i class="fa-solid fa-arrow-right" style="color:#64748b; font-size:0.80rem;"></i>
            </div>
        `).join('');
    }
}

export function executeOmniSearch() {
    const input = document.getElementById('omniSearchInput');
    const val = input ? input.value.trim() : '';
    if (!val) {
        if (typeof window.scrollToSection === 'function') {
            window.scrollToSection('odkrywaj');
        }
        return;
    }
    const clean = val.toLowerCase();
    const match = OMNI_DIRECTORY.find(item => item.handle.toLowerCase() === clean || item.query.includes(clean));
    if (match) {
        window.location.href = match.url;
    } else {
        window.location.href = 'lumina-tablica.html?q=' + encodeURIComponent(val);
    }
}

if (typeof window !== 'undefined') {
    window.handleOmniSearchInput = handleOmniSearchInput;
    window.executeOmniSearch = executeOmniSearch;
}
