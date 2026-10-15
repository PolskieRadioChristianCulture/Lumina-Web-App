const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VF_DIR = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const webText = fs.readFileSync(path.join(VF_DIR, 'web_day15.txt'), 'utf8');
const ttsText = fs.readFileSync(path.join(VF_DIR, 'tts_day15.txt'), 'utf8');
const smsText = fs.readFileSync(path.join(VF_DIR, 'sms_day15.txt'), 'utf8');

const sqlEscape = (str) => str.replace(/'/g, "''");

const sql = `
INSERT OR REPLACE INTO daily_inspirations (day_number, date, title, content_web, content_tts, content_sms, image_url)
VALUES (
  15,
  '2026-10-15',
  '☀️ Z Biblią za Pan Brat — Dzień 15: Bóg dotrzymuje obietnicy',
  '${sqlEscape(webText)}',
  '${sqlEscape(ttsText)}',
  '${sqlEscape(smsText)}',
  'https://polskieradio.cc/images/academy/daily/kc_day_15_isaac_obietnica.jpg'
);
`;

const tmpSqlPath = path.resolve(__dirname, 'tmp_seed_day15.sql');
fs.writeFileSync(tmpSqlPath, sql, 'utf8');

console.log('Seeding Day 15 into Cloudflare D1 mission-control-db...');
const out = execSync(`npx.cmd wrangler d1 execute mission-control-db --remote --file="${tmpSqlPath}"`, {
  cwd: path.resolve(__dirname, '..')
}).toString();

console.log(out);
fs.unlinkSync(tmpSqlPath);
console.log('✓ Successfully seeded Day 15 into Cloudflare D1!');
