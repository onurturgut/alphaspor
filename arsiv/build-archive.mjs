import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=async p=>{const b=await fs.readFile(path.join(root,p));return JSON.parse(b.toString(b[0]===255&&b[1]===254?'utf16le':'utf8').replace(/^\uFEFF/,''));};
const write=(p,v)=>fs.writeFile(path.join(root,p),typeof v==='string'?v:JSON.stringify(v,null,2),'utf8');
for(const dir of ['gorseller','metinler','sayfalar'])await fs.mkdir(path.join(root,dir),{recursive:true});
const data=await read('site-export.json');
const categories=[];
for(const f of await fs.readdir(path.join(root,'kategoriler'))){if(f.endsWith('.json'))categories.push({category:f.slice(0,-5),...await read('kategoriler/'+f)});}
const players=data.pages.filter(p=>p.url!==data.source&&p.url!==data.source+'/').flatMap(p=>p.players);
const urls=[...new Set([...data.pages.flatMap(p=>p.imageUrls),...categories.flatMap(p=>p.imageUrls),...players.map(p=>p.photoUrl)].filter(Boolean))];
const assets=[];let done=0;
let previous=[];try{previous=await read('gorsel-envanteri.json');}catch{}
async function download(url){
 const old=previous.find(x=>x.url===url&&x.file);
 if(old){try{const b=await fs.readFile(path.join(root,old.file));if(crypto.createHash('sha256').update(b).digest('hex')===old.sha256)return old;}catch{}}
 const ext=path.extname(new URL(url).pathname)||'.img';
 const file='gorseller/'+crypto.createHash('sha256').update(url).digest('hex').slice(0,16)+ext;
 for(let attempt=0;attempt<3;attempt++)try{
  const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error('HTTP '+r.status);
  const type=r.headers.get('content-type');if(!type?.startsWith('image/'))throw Error('Unexpected type '+type);
  const b=Buffer.from(await r.arrayBuffer());if(!b.length)throw Error('Empty file');await fs.writeFile(path.join(root,file),b);
  return {url,file,bytes:b.length,contentType:type,sha256:crypto.createHash('sha256').update(b).digest('hex')};
 }catch(e){if(attempt===2)return {url,error:e.message};}
}
const queue=[...urls];await Promise.all(Array.from({length:5},async()=>{while(queue.length){assets.push(await download(queue.shift()));done++;if(done%25===0)console.log('Görsel indirildi/kontrol edildi: '+done+'/'+urls.length);}}));
const map=new Map(assets.map(a=>[a.url,a]));
for(const p of players){p.photoFile=map.get(p.photoUrl)?.file||null;p.imageStatus=p.photoFile?'downloaded':'missing';p.sourceUsesGenericImage=/(?:_|\/)gi-/.test(p.photoUrl||'');}
await write('ogrenciler.json',players);
const fields=['team','name','position','sourceId','photoFile','photoUrl','sourceUrl','sourceUsesGenericImage'];
const csv=s=>'"'+String(s??'').replaceAll('"','""')+'"';
await write('ogrenciler.csv','\uFEFF'+[fields.join(';'),...players.map(p=>fields.map(k=>csv(p[k])).join(';'))].join('\r\n'));
await write('gorsel-envanteri.json',assets);
const contacts=data.pages.find(p=>decodeURIComponent(p.url).endsWith('/İletişim'));
await write('iletisim.json',{sourceUrl:contacts.url,text:contacts.sections.map(s=>s.text).join('\n\n'),links:contacts.contacts,formFields:['İsim','Telefon','E-posta adresi','Mesaj']});
const allText=[];
for(let i=0;i<data.pages.length;i++){
 const p=data.pages[i];const slug=String(i+1).padStart(2,'0')+'-'+(decodeURIComponent(new URL(p.url).pathname).slice(1)||'ana-sayfa').replace(/[^\p{L}\p{N}-]/gu,'-');
 await write('sayfalar/'+slug+'.html',p.html);
 const text='# '+p.title+'\nKaynak: '+p.url+'\n\n'+p.sections.map(s=>s.text).join('\n\n---\n\n')+'\n\n## Menü, altbilgi ve diğer sayfa metinleri\n\n'+p.text;
 await write('metinler/'+slug+'.md',text);allText.push(text);
}
for(const c of categories){const text='# Duyurular — '+c.category+'\nKaynak: '+c.sourceUrl+'\n\n'+c.text;await write('metinler/duyurular-'+c.category+'.md',text);allText.push(text);}
await write('tum-metinler.md',allText.join('\n\n==============================\n\n'));
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const grouped=Object.groupBy(players,p=>p.team);
await write('ogrenci-katalogu.html','<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Alfa Spor öğrenci arşivi</title><style>body{background:#1b1a1a;color:white;font:16px/1.5 system-ui;margin:30px}section{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:20px}article{background:#43403f;padding:15px;border-radius:10px}img{width:100%;height:240px;object-fit:contain;background:#222}p{margin:6px 0}a{color:white}</style><h1>Öğrenci arşivi</h1><p>Kaynakta yer alan '+players.length+' takım–oyuncu kaydı. Aynı öğrenci birden fazla yaş grubunda bulunabilir. Adlar ve mevkiler kaynakta yazıldığı gibi korunmuştur.</p>'+Object.entries(grouped).map(([team,rows])=>'<h2>'+esc(team)+'</h2><section>'+rows.map(p=>'<article><img loading="lazy" src="'+esc(p.photoFile)+'" alt="'+esc(p.name)+'"><h3>'+esc(p.name)+'</h3><p>'+esc(p.position)+'</p>'+(p.sourceUsesGenericImage?'<p>Kaynakta temsili görsel kullanılıyor.</p>':'')+'</article>').join('')+'</section>').join(''));
const summary={capturedAt:data.capturedAt,pages:data.pages.length,newsCategories:categories.map(c=>({category:c.category,textLength:c.text.length})),rosterEntries:players.length,teams:Object.fromEntries(Object.entries(grouped).map(([t,p])=>[t,p.length])),imageUrls:urls.length,downloaded:assets.filter(x=>x.file).length,failed:assets.filter(x=>x.error),missingPlayerPhotos:players.filter(p=>!p.photoFile),totalBytes:assets.reduce((n,a)=>n+(a.bytes||0),0)};
await write('dogrulama.json',summary);
await write('README.md',`# Yeniden kullanım arşivi\n\n${data.capturedAt}\n\n- ogrenci-katalogu.html: Fotoğraf, ad ve mevkiyi takım bazında gösterir.\n- ogrenciler.json / ogrenciler.csv: ${players.length} takım–oyuncu kaydı ve yerel fotoğraf yolları.\n- iletisim.json: Kaynaktaki iletişim metni ve bağlantılar.\n- tum-metinler.md / metinler/: ${data.pages.length} sayfa ve ${categories.length} duyuru kategorisinin metinleri.\n- gorseller/: ${summary.downloaded} indirilen görsel.\n- gorsel-envanteri.json: Kaynak URL, yerel yol, boyut ve SHA-256.\n- sayfalar/: Ham HTML sayfaları; çevrimdışı çalışan site klonu değildir.\n- site-export.json / kategoriler/: Yapısal kaynak ve kategori HTML içerikleri.\n- dogrulama.json: Kayıt/indirme özeti ve varsa eksikler.\n\nİsim/mevki yazımları ve takım ilişkileri korunmuştur. Kaynaktaki temsili fotoğraflar gerçek fotoğraf olarak etiketlenmez. Farklı takımlardaki aynı isimler otomatik birleştirilmez. Görsellerin içine gömülü metinler görsel dosyalarında korunmuştur; OCR ile ayrı metne dönüştürülmemiştir. Dinamik afiş görselleri de indirilen varlık envanterinde tutulur. Haber bülteni kategorileri ayrı çekilmiştir.\n`);
console.log(JSON.stringify(summary,null,2));
if(summary.failed.length||summary.missingPlayerPhotos.length)process.exitCode=1;
