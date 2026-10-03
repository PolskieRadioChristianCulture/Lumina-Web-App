const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const scratchRoot = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/scratch';
const newsSrc = path.join(scratchRoot, 'news_src');
const musicSrc = path.join(scratchRoot, 'music_src');

if (!fs.existsSync(musicSrc)) {
  fs.mkdirSync(musicSrc, { recursive: true });
}

// Copy package.json, tsconfig.json
fs.copyFileSync(path.join(newsSrc, 'package.json'), path.join(musicSrc, 'package.json'));
if (fs.existsSync(path.join(newsSrc, 'tsconfig.json'))) {
  fs.copyFileSync(path.join(newsSrc, 'tsconfig.json'), path.join(musicSrc, 'tsconfig.json'));
}

// Create junction for node_modules
const musicNodeModules = path.join(musicSrc, 'node_modules');
if (!fs.existsSync(musicNodeModules)) {
  const newsNodeModules = path.join(newsSrc, 'node_modules');
  execSync(`cmd.exe /c mklink /J "${musicNodeModules}" "${newsNodeModules}"`);
  console.log('Junction created for node_modules');
}

// Create directories
const srcDir = path.join(musicSrc, 'src');
if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });
const compDir = path.join(srcDir, 'components');
if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });
const dataDir = path.join(srcDir, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

console.log('music_src directory setup successfully');
