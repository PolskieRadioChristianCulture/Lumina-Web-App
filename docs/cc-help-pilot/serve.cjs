'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const allowed=new Map([['/','index.html'],['/index.html','index.html'],['/styles.css','styles.css'],['/app.js','app.js'],['/assets/cc-logo.png','assets/cc-logo.png'],['/assets/hero.jpg','assets/hero.jpg']]);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
  const route=new URL(req.url,'http://localhost').pathname;
  const file=allowed.get(route);
  if(!file){res.writeHead(404);return res.end('Not found');}
  const absolute=path.join(__dirname,file);
  if(!fs.existsSync(absolute)){res.writeHead(404);return res.end('Asset missing');}
  res.writeHead(200,{'Content-Type':types[path.extname(file)],'X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"});
  if(req.method==='HEAD')return res.end();
  fs.createReadStream(absolute).pipe(res);
});
const port=Number(process.env.CC_HELP_PREVIEW_PORT||4178);
server.listen(port,'127.0.0.1',()=>console.log(`CC Help preview: http://127.0.0.1:${port}`));
