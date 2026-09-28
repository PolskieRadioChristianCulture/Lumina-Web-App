const fs = require('fs');
const path = require('path');

const kursyPath = path.join(__dirname, '..', 'kursy.html');
let html = fs.readFileSync(kursyPath, 'utf8');

const regex = /<a href="https:\/\/patronite\.pl\/osobowoscplus"[^>]*class="cin-btn-support"[^>]*>[\s\S]*?<\/a>/;
const newBtn = `<a href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener noreferrer" class="cin-btn-support" title="Wspieraj Misję Christian Culture" aria-label="Wspieraj Misję">
        <span class="support-icon text-sm">❤️</span>
        <span class="support-text hidden sm:inline">Wspieraj Misję</span>
      </a>`;

if (regex.test(html)) {
  html = html.replace(regex, newBtn);
  fs.writeFileSync(kursyPath, html, 'utf8');
  console.log('Successfully updated kursy.html support button!');
} else {
  console.error('Regex did not match support button in kursy.html');
}

// Also update css/lumina-courses.css to ensure perfect centering and sizing on mobile
const cssPath = path.join(__dirname, '..', 'css', 'lumina-courses.css');
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('.cin-btn-support .support-icon')) {
  const extraCss = `
@media (max-width: 640px) {
  .cin-btn-support {
    padding: 8px 10px !important;
    min-width: 44px !important;
    min-height: 44px !important;
    justify-content: center !important;
    gap: 0 !important;
  }
  .cin-btn-support .support-icon {
    font-size: 16px !important;
    line-height: 1 !important;
  }
}
`;
  css += '\n' + extraCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Successfully added mobile support icon styling to css/lumina-courses.css!');
}
