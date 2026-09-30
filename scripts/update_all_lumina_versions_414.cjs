const fs = require('fs');
const path = require('path');

// 1. lumina-pwa-installer.js
{
  const pwaPath = path.resolve('lumina-pwa-installer.js');
  let content = fs.readFileSync(pwaPath, 'utf8');
  content = content.replace(
    /<span style="font-size:0\.68rem; background:rgba\(168,85,247,0\.25\); color:#d8b4fe; padding:2px 6px; border-radius:6px; font-weight:700;">v4\.1\.3<\/span>/g,
    '<span style="font-size:0.68rem; background:rgba(168,85,247,0.25); color:#d8b4fe; padding:2px 6px; border-radius:6px; font-weight:700;">v${CURRENT_CLIENT_VERSION}</span>'
  );
  content = content.replace(
    /Zainstaluj now\u0105 wersj\u0119 v4\.1\.3 na telefonie!/g,
    'Zainstaluj nową wersję v${CURRENT_CLIENT_VERSION} na telefonie!'
  );
  if (!content.includes('syncVersionBadges')) {
    content = content.replace(
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
  fs.writeFileSync(pwaPath, content, 'utf8');
  console.log('✅ lumina-pwa-installer.js updated');
}

// 2. lumina.html
{
  const luminaPath = path.resolve('lumina.html');
  let content = fs.readFileSync(luminaPath, 'utf8');
  content = content.replace(
    /<span style="font-size: 0\.68rem; padding: 2px 8px; border-radius: 8px; background: rgba\(168,85,247,0\.25\); color: #e9d5ff; font-weight: 700;">v4\.1\.3<\/span>/g,
    '<span id="luminaAppVersionBadge" class="lumina-app-version-badge" style="font-size: 0.68rem; padding: 2px 8px; border-radius: 8px; background: rgba(168,85,247,0.25); color: #e9d5ff; font-weight: 700;">v4.1.4</span>'
  );
  content = content.replace(
    /src="lumina-notifications\.js\?v=4\.1\.3_20260914"/g,
    'src="lumina-notifications.js?v=4.1.4_20260914"'
  );
  fs.writeFileSync(luminaPath, content, 'utf8');
  console.log('✅ lumina.html updated');
}

// 3. lumina-profile.html
{
  const profilePath = path.resolve('lumina-profile.html');
  let content = fs.readFileSync(profilePath, 'utf8');
  content = content.replace(
    /<span style="font-size: 0\.68rem; padding: 2px 8px; border-radius: 8px; background: rgba\(168,85,247,0\.25\); color: #e9d5ff; font-weight: 700;">v4\.1\.3<\/span>/g,
    '<span id="luminaAppVersionBadge" class="lumina-app-version-badge" style="font-size: 0.68rem; padding: 2px 8px; border-radius: 8px; background: rgba(168,85,247,0.25); color: #e9d5ff; font-weight: 700;">v4.1.4</span>'
  );
  content = content.replace(
    /src="lumina-pwa-installer\.js\?v=4\.1\.3_20260914_chatfix"/g,
    'src="lumina-pwa-installer.js?v=4.1.4_20260914_deliveryfix"'
  );
  content = content.replace(
    /src="lumina-notifications\.js\?v=4\.1\.3_20260914"/g,
    'src="lumina-notifications.js?v=4.1.4_20260914"'
  );
  content = content.replace(
    /url\.searchParams\.set\('v_sync', `4\.1\.3_\$\{Date\.now\(\)\}`\);/g,
    "url.searchParams.set('v_sync', `4.1.4_${Date.now()}`);"
  );
  fs.writeFileSync(profilePath, content, 'utf8');
  console.log('✅ lumina-profile.html updated');
}

// 4. lumina-tablica.html
{
  const tablicaPath = path.resolve('lumina-tablica.html');
  let content = fs.readFileSync(tablicaPath, 'utf8');
  content = content.replace(
    /<span style="font-size: 0\.68rem; padding: 2px 8px; border-radius: 8px; background: rgba\(168,85,247,0\.25\); color: #e9d5ff; font-weight: 700;">v4\.1\.2<\/span>/g,
    '<span id="luminaAppVersionBadge" class="lumina-app-version-badge" style="font-size: 0.68rem; padding: 2px 8px; border-radius: 8px; background: rgba(168,85,247,0.25); color: #e9d5ff; font-weight: 700;">v4.1.4</span>'
  );
  content = content.replace(
    /src="lumina-db\.js\?v=4\.1\.1_20260909"/g,
    'src="lumina-db.js?v=4.1.4_20260914_deliveryfix"'
  );
  content = content.replace(
    /src="lumina-pwa-installer\.js\?v=4\.1\.1_20260909"/g,
    'src="lumina-pwa-installer.js?v=4.1.4_20260914_deliveryfix"'
  );
  content = content.replace(
    /src="lumina-notifications\.js\?v=4\.1\.2_20260913"/g,
    'src="lumina-notifications.js?v=4.1.4_20260914"'
  );
  content = content.replace(
    /for \(let reg of registrations\) \{\s*await reg\.update\(\);\s*\}/g,
    `for (let reg of registrations) {
                        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                        await reg.update();
                    }`
  );
  content = content.replace(
    /url\.searchParams\.set\('v_sync', Date\.now\(\)\);/g,
    "url.searchParams.set('v_sync', `4.1.4_${Date.now()}`);"
  );
  fs.writeFileSync(tablicaPath, content, 'utf8');
  console.log('✅ lumina-tablica.html updated');
}

// 5. lumina.cezaryrgowski.html
{
  const cezPath = path.resolve('lumina.cezaryrgowski.html');
  let content = fs.readFileSync(cezPath, 'utf8');
  content = content.replace(
    /<span style="font-size: 0\.68rem; padding: 2px 8px; border-radius: 8px; background: rgba\(168,85,247,0\.25\); color: #e9d5ff; font-weight: 700;">v4\.1\.1<\/span>/g,
    '<span id="luminaAppVersionBadge" class="lumina-app-version-badge" style="font-size: 0.68rem; padding: 2px 8px; border-radius: 8px; background: rgba(168,85,247,0.25); color: #e9d5ff; font-weight: 700;">v4.1.4</span>'
  );
  content = content.replace(
    /src="lumina-pwa-installer\.js\?v=4\.1\.1_20260909"/g,
    'src="lumina-pwa-installer.js?v=4.1.4_20260914_deliveryfix"'
  );
  fs.writeFileSync(cezPath, content, 'utf8');
  console.log('✅ lumina.cezaryrgowski.html updated');
}

// 6. lumina.wiolettarogowska.html
{
  const wiolPath = path.resolve('lumina.wiolettarogowska.html');
  let content = fs.readFileSync(wiolPath, 'utf8');
  content = content.replace(
    /<span style="font-size: 0\.68rem; padding: 2px 8px; border-radius: 8px; background: rgba\(236,72,153,0\.25\); color: #fce7f3; font-weight: 700;">v4\.1\.1<\/span>/g,
    '<span id="luminaAppVersionBadge" class="lumina-app-version-badge" style="font-size: 0.68rem; padding: 2px 8px; border-radius: 8px; background: rgba(236,72,153,0.25); color: #fce7f3; font-weight: 700;">v4.1.4</span>'
  );
  content = content.replace(
    /src="lumina-pwa-installer\.js\?v=4\.1\.1_20260909"/g,
    'src="lumina-pwa-installer.js?v=4.1.4_20260914_deliveryfix"'
  );
  fs.writeFileSync(wiolPath, content, 'utf8');
  console.log('✅ lumina.wiolettarogowska.html updated');
}
