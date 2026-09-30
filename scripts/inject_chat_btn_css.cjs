const fs = require('fs');
const path = require('path');

const files = [
  'lumina.html',
  'lumina-profile.html',
  'lumina-tablica.html',
  'lumina.cezaryrgowski.html',
  'lumina.wiolettarogowska.html'
];

const cssRule = `
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

files.forEach(filename => {
  const filePath = path.resolve(filename);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('#directMessagesModal .modal-close-btn') && !content.includes('#directMessagesModal .chat-header-profile-btn')) {
    content = content.replace(
      '#directMessagesModal .modal-close-btn {',
      cssRule + '            #directMessagesModal .modal-close-btn {'
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Injected into ' + filename);
  } else {
    console.log('ℹ️ ' + filename + ' already has rule or anchor not found.');
  }
});
