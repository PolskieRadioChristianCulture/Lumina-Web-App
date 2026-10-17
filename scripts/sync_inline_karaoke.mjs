import fs from 'node:fs';
import path from 'node:path';

const htmlPath = path.resolve('biblijne-uwielbienie.html');
const js = fs.readFileSync(path.resolve('assets/bu/karaoke-top100.js'), 'utf8').replace(/\r\n/g, '\n');
const html = fs.readFileSync(htmlPath, 'utf8');
const marker = '<script id="bu-karaoke-inline-v4">';
const start = html.indexOf(marker);
const end = html.indexOf('</script>', start + marker.length);
if (start < 0 || end < 0 || html.indexOf(marker, start + marker.length) !== -1) {
  throw new Error('Expected exactly one complete karaoke inline script; HTML left unchanged.');
}
fs.writeFileSync(htmlPath, html.slice(0, start + marker.length) + '\n' + js + '\n' + html.slice(end));
console.log('Karaoke inline script synchronized.');
