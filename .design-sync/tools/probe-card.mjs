// Delayed full-page probe of one preview card (capture fires before fades finish).
// usage: node .design-sync/tools/probe-card.mjs ds-bundle "components/<g>/<N>/<N>.html?story=<Export>" [waitMs] [out.png]
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
const root = process.argv[2], rel = process.argv[3], wait = +(process.argv[4]||1500), out = process.argv[5];
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2'};
const srv = createServer((q,s)=>{const p=join(root,decodeURIComponent(q.url.split('?')[0]));if(!existsSync(p)){s.writeHead(404);return s.end();}s.writeHead(200,{'content-type':types[extname(p)]||'application/octet-stream'});s.end(readFileSync(p));}).listen(0);
const port = srv.address().port;
const b = await chromium.launch(); const pg = await b.newPage({viewport:{width:1280,height:900}});
pg.on('pageerror',e=>console.log('pageerror',e.message)); pg.on('console',m=>m.type()==='error'&&console.log('console',m.text()));
await pg.goto(`http://127.0.0.1:${port}/${rel}`); await pg.waitForTimeout(wait);
console.log(await pg.evaluate(()=>[...document.querySelectorAll('h1,h2')].map(h=>h.textContent+' op='+getComputedStyle(h.parentElement).opacity).join(' | ')));
if(out) await pg.screenshot({path:out,fullPage:true});
await b.close(); srv.close();
