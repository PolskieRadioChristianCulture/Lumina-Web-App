import {spawnSync} from 'node:child_process';
import {readdir,readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)), source=path.join(root,'portals/ccn-music');
const build=spawnSync(process.execPath,[path.join(source,'node_modules/vite/bin/vite.js'),'build'],{cwd:source,stdio:'inherit'});
if(build.status!==0)process.exit(build.status||1);
for(const file of await readdir(path.join(source,'dist/assets')))await copyFile(path.join(source,'dist/assets',file),path.join(root,'assets',file));
const html=(await readFile(path.join(source,'dist/index.html'),'utf8')).replace(/\r\n/g,'\n');
const names={przeboje:'Biblioteka muzyki i nagrań',premiery:'Odkrywaj nagrania',artysci:'Artyści i kanały',playlisty:'Playlisty i kolekcje',radio:'Radio Christian Culture',video:'Muzyka i wideo',top:'Wybór muzyki',ulubione:'Twoje ulubione'};
const entries=[['music.html',''],['music/index.html',''],...Object.keys(names).map(category=>['music/'+category+'/index.html',category])];
for(const [file,category] of entries){const route='/music'+(category?'/'+category:'');const content=html.replaceAll('https://polskieradio.cc/music','https://polskieradio.cc'+route).replace(/<title>[^<]+<\/title>/,'<title>'+(category?names[category]+' | CC Music':'CC Music — muzyka chrześcijańska, uwielbienie i Radio CC')+'</title>');await mkdir(path.dirname(path.join(root,file)),{recursive:true});await writeFile(path.join(root,file),content);}
console.log('CC Music: canonical source built; ten entrypoints updated, existing assets preserved.');
