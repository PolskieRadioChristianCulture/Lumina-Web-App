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
    z = z.replace(/<\/select>[\s\n\r]*<\/div>[\s\n\r]*<div class="control-group">[\s\n\r]*<label for="bgVideoSelect">/, optionsHtml + '              </select>\n          </div>\n\n          <div class="control-group">\n              <label for="bgVideoSelect">');
    fs.writeFileSync('zapolske-live.html', z, 'utf8');
}
