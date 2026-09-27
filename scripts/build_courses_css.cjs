const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'kursy.html');
const cssPath = path.join(__dirname, '..', 'css', 'lumina-courses.css');

let html = fs.readFileSync(htmlPath, 'utf8');
const match = html.match(/<style>([\s\S]*?)<\/style>/);
if (match) {
  let css = match[1];

  const extraStyles = `
/* ══════════════════════════════════════════════════════════════════
 * DEDICATED LESSON SUBPAGE EXTENSIONS (Phase 5 / Dedicated URLs)
 * ══════════════════════════════════════════════════════════════════ */
.cin-back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  transition: var(--transition);
  min-height: 44px;
}
.cin-back-link:hover {
  color: #f6e09e;
  background: rgba(212, 175, 55, 0.12);
  border-color: rgba(212, 175, 55, 0.35);
  transform: translateX(-2px);
}
.cin-lesson-step-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 99px;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.28);
  color: #f6e09e;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.cin-subpage-container {
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  padding: 24px 16px 80px;
}
@media (min-width: 640px) {
  .cin-subpage-container {
    padding: 36px 24px 100px;
  }
}
.cin-lesson-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 24px 0 0;
  margin-top: 48px;
  border-top: 1px solid var(--border-subtle);
  flex-wrap: wrap;
}
.cin-nav-prev, .cin-nav-next {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  transition: var(--transition);
  min-height: 44px;
}
.cin-nav-prev:hover, .cin-nav-next:hover {
  background: var(--bg-surface-elevated);
  border-color: rgba(212, 175, 55, 0.4);
  color: #f6e09e;
  transform: translateY(-1px);
}
.reading-progress-fixed {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #d4af37 0%, #f6e09e 100%);
  z-index: 100;
  transition: width 0.1s linear;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.6);
}
`;

  css += '\n' + extraStyles;
  fs.writeFileSync(cssPath, css.trim() + '\n', 'utf8');
  console.log('Successfully wrote css/lumina-courses.css (' + css.length + ' bytes)');

  html = html.replace(/<style>[\s\S]*?<\/style>/, '<!-- LUMINA Courses Styling System -->\n  <link rel="stylesheet" href="/css/lumina-courses.css" />');
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('Successfully updated kursy.html with link tag.');
} else {
  console.log('Style block already replaced or not found in kursy.html');
}
