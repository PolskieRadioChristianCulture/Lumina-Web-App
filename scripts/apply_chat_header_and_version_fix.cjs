const fs = require('fs');
const path = require('path');

console.log('🚀 Rozpoczynam wdrażanie poprawki nagłówka czatu (okrągły awatar + ikona profilu) oraz synchronizację v4.1.4...');

// 1. Aktualizacja css/lumina-mobile-premium.css
{
  const cssPath = path.resolve('css/lumina-mobile-premium.css');
  let css = fs.readFileSync(cssPath, 'utf8');

  const chatHeaderRule = `
    /* SMCC & ICC: Pancerne kółko awatara czatu i ikona profilu bez tekstu na mobile */
    .chat-header-bar {
        gap: 8px !important;
        min-height: 56px !important;
    }
    .chat-header-profile-btn {
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        min-height: 36px !important;
        padding: 0 !important;
        border-radius: 50% !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0 !important;
    }
    .chat-header-profile-btn .chat-header-profile-text {
        display: none !important;
    }
    #activeChatAvatar {
        width: 42px !important;
        height: 42px !important;
        min-width: 42px !important;
        min-height: 42px !important;
        max-width: 42px !important;
        max-height: 42px !important;
        aspect-ratio: 1 / 1 !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        flex-shrink: 0 !important;
        display: block !important;
    }
`;

  if (!css.includes('.chat-header-profile-btn')) {
    css = css.replace(/@media \(max-width: 768px\) \{/, `@media (max-width: 768px) {${chatHeaderRule}`);
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('✅ css/lumina-mobile-premium.css zaktualizowany o reguły mobilnego czatu.');
  }
}

// 2. Aktualizacja lumina-responsive-reset.css
{
  const resetPath = path.resolve('lumina-responsive-reset.css');
  let resetCss = fs.readFileSync(resetPath, 'utf8');
  if (!resetCss.includes('.chat-header-profile-btn')) {
    const extraRule = `
    .chat-header-profile-btn {
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        min-height: 36px !important;
        padding: 0 !important;
        border-radius: 50% !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0 !important;
    }
    .chat-header-profile-btn .chat-header-profile-text {
        display: none !important;
    }
    #activeChatAvatar {
        width: 42px !important;
        height: 42px !important;
        min-width: 42px !important;
        min-height: 42px !important;
        max-width: 42px !important;
        max-height: 42px !important;
        aspect-ratio: 1 / 1 !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        flex-shrink: 0 !important;
        display: block !important;
    }
`;
    resetCss = resetCss.replace(/@media \(max-width:\s*680px\)\s*\{/, `@media (max-width: 680px) {${extraRule}`);
    fs.writeFileSync(resetPath, resetCss, 'utf8');
    console.log('✅ lumina-responsive-reset.css zaktualizowany.');
  }
}

// 3. Aktualizacja lumina-pwa-installer.js
{
  const pwaPath = path.resolve('lumina-pwa-installer.js');
  let pwa = fs.readFileSync(pwaPath, 'utf8');
  pwa = pwa.replace(
    /<span style="font-size:0\.68rem; background:rgba\(168,85,247,0\.25\); color:#d8b4fe; padding:2px 6px; border-radius:6px; font-weight:700;">v4\.1\.3<\/span>/g,
    '<span style="font-size:0.68rem; background:rgba(168,85,247,0.25); color:#d8b4fe; padding:2px 6px; border-radius:6px; font-weight:700;">v${CURRENT_CLIENT_VERSION}</span>'
  );
  pwa = pwa.replace(
    /Zainstaluj now\u0105 wersj\u0119 v4\.1\.3 na telefonie!/g,
    'Zainstaluj nową wersję v${CURRENT_CLIENT_VERSION} na telefonie!'
  );
  if (!pwa.includes('syncVersionBadges')) {
    pwa = pwa.replace(
      /function init\(\) \{/,
      `function syncVersionBadges() {
        document.querySelectorAll('.lumina-app-version-badge, #luminaAppVersionBadge').forEach(el => {
            el.textContent = 'v' + CURRENT_CLIENT_VERSION;
        });
    }

    function init() {
        syncVersionBadges();`
    );
  }
  fs.writeFileSync(pwaPath, pwa, 'utf8');
  console.log('✅ lumina-pwa-installer.js zaktualizowany.');
}

// 4. Szablon nagłówka czatu z pancerzystym okręgiem awatara i czystą ikonką profilu
function updateChatHeaderInHtml(html, filename) {
  // Regex dopasowujący stary blok nagłówka czatu
  const oldHeaderRegex = /<div class="chat-header-bar"[\s\S]*?id="activeChatAvatar"[\s\S]*?onclick="closeModal\('directMessagesModal'\)"[\s\S]*?<\/div>\s*<\/div>/;

  const newHeaderHtml = `<div class="chat-header-bar" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.08); min-height: 58px; gap: 8px;">
                            <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                                <button type="button" class="messenger-back-btn" onclick="returnToConversationsList()" style="background: none; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer; padding: 4px 6px; flex-shrink: 0;" title="Powrót do listy rozmów"><i class="fa-solid fa-arrow-left"></i></button>
                                <div style="position: relative; width: 44px; height: 44px; min-width: 44px; min-height: 44px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                                    <img loading="lazy" decoding="async" id="activeChatAvatar" src="lumina_icon.jpg" alt="Rozmówca" style="width: 44px; height: 44px; min-width: 44px; min-height: 44px; max-width: 44px; max-height: 44px; aspect-ratio: 1 / 1; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid #c084fc; display: block; cursor: pointer; transition: transform 0.2s;" title="Zobacz profil użytkownika" onclick="if(activeChatSession&&activeChatSession.targetId){closeModal('directMessagesModal'); window.location.href='lumina-profile.html?u='+encodeURIComponent(activeChatSession.targetId);}" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
                                    <span style="position: absolute; bottom: 1px; right: 1px; width: 11px; height: 11px; min-width: 11px; min-height: 11px; border-radius: 50%; background: #10b981; border: 2px solid #070d1e; flex-shrink: 0; pointer-events: none;"></span>
                                </div>
                                <div style="min-width: 0; flex: 1; overflow: hidden;">
                                    <div id="activeChatName" style="font-weight: 800; font-size: 0.95rem; color: #fff; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="Zobacz profil użytkownika" onclick="if(activeChatSession&&activeChatSession.targetId){closeModal('directMessagesModal'); window.location.href='lumina-profile.html?u='+encodeURIComponent(activeChatSession.targetId);}">
                                        Rozmowa Prywatna
                                    </div>
                                    <div style="font-size: 0.70rem; color: #10b981; display: flex; align-items: center; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        <span style="width: 6px; height: 6px; min-width: 6px; min-height: 6px; border-radius: 50%; background: #10b981; display: inline-block; flex-shrink: 0;"></span> Aktywny(a) teraz • Bezpieczna Rozmowa ✨
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                                <button type="button" class="chat-header-profile-btn" onclick="if(activeChatSession&&activeChatSession.targetId){closeModal('directMessagesModal'); window.location.href='lumina-profile.html?u='+encodeURIComponent(activeChatSession.targetId);}" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; border-radius: 12px; padding: 6px 12px; font-size: 0.78rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; flex-shrink: 0; min-height: 36px;" title="Zobacz pełny profil rozmówcy">
                                    <i class="fa-solid fa-user"></i><span class="chat-header-profile-text"> Profil</span>
                                </button>
                                <button class="modal-close-btn" onclick="closeModal('directMessagesModal')" style="position:static; flex-shrink: 0;"><i class="fa-solid fa-xmark"></i></button>
                            </div>
                        </div>`;

  if (oldHeaderRegex.test(html)) {
    html = html.replace(oldHeaderRegex, newHeaderHtml);
    console.log(`✅ [${filename}] Zaktualizowano nagłówek czatu (okrągły awatar + ikona profilu).`);
  } else {
    console.warn(`⚠️ [${filename}] oldHeaderRegex nie dopasował nagłówka!`);
  }
  return html;
}

// 5. Aktualizacje plików HTML
const htmlFiles = [
  'lumina.html',
  'lumina-profile.html',
  'lumina-tablica.html',
  'lumina.cezaryrgowski.html',
  'lumina.wiolettarogowska.html'
];

htmlFiles.forEach(filename => {
  const filePath = path.resolve(filename);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // A. Nagłówek czatu
  content = updateChatHeaderInHtml(content, filename);

  // B. Badge wersji w modalu ustawień
  content = content.replace(
    /<span style="font-size:\s*0\.68rem;\s*padding:\s*2px\s*8px;\s*border-radius:\s*8px;\s*background:\s*rgba\([0-9,.\s]+\);\s*color:\s*#[a-zA-Z0-9]+;\s*font-weight:\s*700;">v4\.1\.[0-3]<\/span>/g,
    '<span id="luminaAppVersionBadge" class="lumina-app-version-badge" style="font-size: 0.68rem; padding: 2px 8px; border-radius: 8px; background: rgba(168,85,247,0.25); color: #e9d5ff; font-weight: 700;">v4.1.4</span>'
  );

  // C. Wersje skryptów na v4.1.4
  content = content.replace(
    /src="lumina-pwa-installer\.js\?v=[^"]*"/g,
    'src="lumina-pwa-installer.js?v=4.1.4_20260914_deliveryfix"'
  );
  content = content.replace(
    /src="lumina-notifications\.js\?v=[^"]*"/g,
    'src="lumina-notifications.js?v=4.1.4_20260914"'
  );
  content = content.replace(
    /src="lumina-db\.js\?v=(?:4\.1\.[1-3][^"]*|1786940468365)"/g,
    'src="lumina-db.js?v=4.1.4_20260914_deliveryfix"'
  );
  content = content.replace(
    /url\.searchParams\.set\('v_sync',\s*(?:Date\.now\(\)|`4\.1\.[1-3]_\$\{Date\.now\(\)\}`)\);/g,
    "url.searchParams.set('v_sync', `4.1.4_${Date.now()}`);"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ [${filename}] Zapisano aktualizacje wersji i czatu.`);
});

console.log('🎉 Wszystkie operacje zakończone pomyślnie!');
