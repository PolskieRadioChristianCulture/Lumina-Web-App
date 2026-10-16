import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const htmlPath = path.join(ROOT, 'biblijne-uwielbienie.html');
const jsPath = path.join(ROOT, 'assets', 'bu', 'karaoke-top100.js');

let html = fs.readFileSync(htmlPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

const startMarker = '<script id="bu-karaoke-inline-v4">';
const endMarker = '</script>\n  <script src="/assets/bu/karaoke-top100.js?v=20261016_sync2" defer></script>';

const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const newHtml = html.slice(0, startIdx + startMarker.length) + '\n' + js + '\n' + html.slice(endIdx);
  fs.writeFileSync(htmlPath, newHtml, 'utf8');
  console.log('Successfully synchronized inline script in biblijne-uwielbienie.html');
} else {
  // Try CRLF fallback
  const endMarkerCRLF = '</script>\r\n  <script src="/assets/bu/karaoke-top100.js?v=20261016_sync2" defer></script>';
  const endIdxCRLF = html.indexOf(endMarkerCRLF);
  if (startIdx !== -1 && endIdxCRLF !== -1) {
    const newHtml = html.slice(0, startIdx + startMarker.length) + '\r\n' + js + '\r\n' + html.slice(endIdxCRLF);
    fs.writeFileSync(htmlPath, newHtml, 'utf8');
    console.log('Successfully synchronized inline script with CRLF in biblijne-uwielbienie.html');
  } else {
    console.error('Markers not found! start:', startIdx, 'end:', endIdx, 'endCRLF:', endIdxCRLF);
  }
}
