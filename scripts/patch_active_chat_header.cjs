const fs = require('fs');
const path = require('path');

const files = [
  'lumina.html',
  'lumina-profile.html',
  'lumina-tablica.html',
  'lumina.cezaryrgowski.html',
  'lumina.wiolettarogowska.html'
];

const newSnippet = `<div id="dmActiveConversationBox" style="display: none; flex-direction: column; height: 100%; min-height: 0;">
                        <!-- Chat Room Header (Meta Messenger Style) -->
                        <div class="chat-header-bar" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.08); min-height: 58px; gap: 8px;">
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
                        </div>

                        <!-- Chat Messages Scroll Container -->`;

// Regex targeting EXACTLY the block from <div id="dmActiveConversationBox" to <!-- Chat Messages Scroll Container -->
const targetRegex = /<div id="dmActiveConversationBox"[\s\S]*?<!-- Chat Messages Scroll Container -->/;

files.forEach(filename => {
  const filePath = path.resolve(filename);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  if (!targetRegex.test(content)) {
    console.error('❌ Could not match dmActiveConversationBox in ' + filename);
    return;
  }

  content = content.replace(targetRegex, newSnippet);

  // Also inject the CSS rule into <style> if not present
  const mobileCss = `
            #directMessagesModal .chat-header-profile-btn {
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
            #directMessagesModal .chat-header-profile-btn .chat-header-profile-text {
                display: none !important;
            }
`;
  if (content.includes('#directMessagesModal .modal-close-btn') && !content.includes('#directMessagesModal .chat-header-profile-btn')) {
    content = content.replace(
      '#directMessagesModal .modal-close-btn {',
      mobileCss + '            #directMessagesModal .modal-close-btn {'
    );
  }

  // Also update version badges & script tags
  content = content.replace(
    /<span style="font-size:\s*0\.68rem;\s*padding:\s*2px\s*8px;\s*border-radius:\s*8px;\s*background:\s*rgba\([0-9,.\s]+\);\s*color:\s*#[a-zA-Z0-9]+;\s*font-weight:\s*700;">v4\.1\.[0-3]<\/span>/g,
    '<span id="luminaAppVersionBadge" class="lumina-app-version-badge" style="font-size: 0.68rem; padding: 2px 8px; border-radius: 8px; background: rgba(168,85,247,0.25); color: #e9d5ff; font-weight: 700;">v4.1.4</span>'
  );
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
  console.log('✅ ' + filename + ' successfully patched!');
});
