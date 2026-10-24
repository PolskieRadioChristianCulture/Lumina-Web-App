const { execSync } = require('child_process');
const cwd = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const commitMsg = 'feat(kursy): Pokonac Goliata Premium - update hero layout, clean typography & remove brand crown';
const out = execSync(`git commit -m "${commitMsg}"`, { cwd, encoding: 'utf8' });
console.log(out);
