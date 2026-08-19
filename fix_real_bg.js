const fs = require('fs');

let html = fs.readFileSync('zapolske-live.html', 'utf8');
html = html.replace(/<option value="user_bg_1\.png">.*?<\/option>\s*/g, '');
html = html.replace(/<option value="user_bg_2\.png">.*?<\/option>\s*/g, '');
html = html.replace(/<option value="user_bg_3\.jpg">.*?<\/option>\s*/g, '');
html = html.replace(/<option value="user_bg_4\.jpg">.*?<\/option>\s*/g, '');
html = html.replace(/<option value="user_bg_5\.jpg">.*?<\/option>\s*/g, '');
html = html.replace(/<option value="breakfast_studio_alt\.jpg">Alternatywne Tło Drewniane<\/option>/g, '<option value="breakfast_studio_alt.jpg">Alternatywne Tło Drewniane</option>\n                  <option value="tlo_live_1.png">Nowe Tło Poranne 1</option>\n                  <option value="tlo_live_2.png">Nowe Tło Poranne 2</option>');

// Update script forced bg
html = html.replace(/localStorage\.setItem\('dzj_stream_image', 'user_bg_3\.jpg'\);/g, "localStorage.setItem('dzj_stream_image', 'tlo_live_1.png');");
html = html.replace(/dzj_stream_image_forced_v1/g, 'dzj_stream_image_forced_v2');

// Update cache buster
html = html.replace(/live-window-manager\.js\?v=\d+/g, `live-window-manager.js?v=${Date.now()}`);

fs.writeFileSync('zapolske-live.html', html, 'utf8');

let js = fs.readFileSync('live-window-manager.js', 'utf8');
js = js.replace(/\{\s*label:\s*'Nowe Tło Użytkownika 1',\s*src:\s*'user_bg_1\.png'\s*\},\s*/g, '');
js = js.replace(/\{\s*label:\s*'Nowe Tło Użytkownika 2',\s*src:\s*'user_bg_2\.png'\s*\},\s*/g, '');
js = js.replace(/\{\s*label:\s*'Nowe Tło Użytkownika 3',\s*src:\s*'user_bg_3\.jpg'\s*\},\s*/g, '');
js = js.replace(/\{\s*label:\s*'Nowe Tło Użytkownika 4',\s*src:\s*'user_bg_4\.jpg'\s*\},\s*/g, '');
js = js.replace(/\{\s*label:\s*'Nowe Tło Użytkownika 5',\s*src:\s*'user_bg_5\.jpg'\s*\},\s*/g, '');
js = js.replace(/\{\s*label:\s*'Slideshw 2',\s*src:\s*'bg_slideshow_2\.jpg'\s*\},\s*/g, "{ label: 'Slideshw 2',                  src: 'bg_slideshow_2.jpg' },\n          { label: 'Nowe Tło Poranne 1', src: 'tlo_live_1.png' },\n          { label: 'Nowe Tło Poranne 2', src: 'tlo_live_2.png' },\n");

fs.writeFileSync('live-window-manager.js', js, 'utf8');
