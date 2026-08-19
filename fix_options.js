const fs = require('fs');

let z = fs.readFileSync('zapolske-live.html', 'utf8');
const optionsHtml = `
                  <option value="user_bg_1.png">Nowe Tło Użytkownika 1 (PNG)</option>
                  <option value="user_bg_2.png">Nowe Tło Użytkownika 2 (PNG)</option>
                  <option value="user_bg_3.jpg">Nowe Tło Użytkownika 3 (JPG)</option>
                  <option value="user_bg_4.jpg">Nowe Tło Użytkownika 4 (JPG)</option>
                  <option value="user_bg_5.jpg">Nowe Tło Użytkownika 5 (JPG)</option>
`;
if (!z.includes('user_bg_1.png')) {
    z = z.replace('</select>\r\n          </div>\r\n\r\n          <div class="control-group">\r\n              <label for="bgVideoSelect">', optionsHtml + '              </select>\r\n          </div>\r\n\r\n          <div class="control-group">\r\n              <label for="bgVideoSelect">');
    // Also try without carriage return
    z = z.replace('</select>\n          </div>\n\n          <div class="control-group">\n              <label for="bgVideoSelect">', optionsHtml + '              </select>\n          </div>\n\n          <div class="control-group">\n              <label for="bgVideoSelect">');
    fs.writeFileSync('zapolske-live.html', z, 'utf8');
}

let w = fs.readFileSync('live-window-manager.js', 'utf8');
const optionsJs = `
          { label: 'Nowe Tło Użytkownika 1', src: 'user_bg_1.png' },
          { label: 'Nowe Tło Użytkownika 2', src: 'user_bg_2.png' },
          { label: 'Nowe Tło Użytkownika 3', src: 'user_bg_3.jpg' },
          { label: 'Nowe Tło Użytkownika 4', src: 'user_bg_4.jpg' },
          { label: 'Nowe Tło Użytkownika 5', src: 'user_bg_5.jpg' },
`;
if (!w.includes('user_bg_1.png')) {
    w = w.replace('];\r\n\r\n    const BG_PRESETS_VIDEOS = [', optionsJs + '      ];\r\n\r\n    const BG_PRESETS_VIDEOS = [');
    w = w.replace('];\n\n    const BG_PRESETS_VIDEOS = [', optionsJs + '      ];\n\n    const BG_PRESETS_VIDEOS = [');
    fs.writeFileSync('live-window-manager.js', w, 'utf8');
}
